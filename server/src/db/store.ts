import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  DatabaseSchema,
  Organization,
  Candidate,
  Job,
  Application,
  User,
  InterviewRound,
  Offer,
  AuditEvent,
  SystemNotification,
  PlatformSettings,
  BatchIntakeItem
} from '../types/index.js';
import {
  INITIAL_ORGANIZATIONS,
  INITIAL_CANDIDATES,
  INITIAL_JOBS,
  INITIAL_APPLICATIONS,
  INITIAL_USERS,
  INITIAL_INTERVIEWS,
  INITIAL_OFFERS,
  INITIAL_AUDIT_EVENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SETTINGS,
  INITIAL_BATCH_ITEMS
} from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

type ListCollection = Exclude<keyof DatabaseSchema, 'settings'>;
const LIST_COLLECTIONS: ListCollection[] = [
  'organizations', 'candidates', 'jobs', 'applications', 'users',
  'interviews', 'offers', 'auditEvents', 'notifications', 'batchItems'
];
const SETTINGS_ID = 'platform';

function seedData(): DatabaseSchema {
  return {
    organizations: INITIAL_ORGANIZATIONS,
    candidates: INITIAL_CANDIDATES,
    jobs: INITIAL_JOBS,
    applications: INITIAL_APPLICATIONS,
    users: INITIAL_USERS,
    interviews: INITIAL_INTERVIEWS,
    offers: INITIAL_OFFERS,
    auditEvents: INITIAL_AUDIT_EVENTS,
    notifications: INITIAL_NOTIFICATIONS,
    settings: INITIAL_SETTINGS,
    batchItems: INITIAL_BATCH_ITEMS
  };
}

// ponytail: every instance keeps a full in-memory copy and writes through to Mongo.
// Correct for ONE server process. Before running >1 instance, move reads to Mongo queries (async routes).
class Store {
  private data: DatabaseSchema = seedData();
  private dirty = new Map<keyof DatabaseSchema, Set<string>>();
  private saveTimeout: NodeJS.Timeout | null = null;
  private seq = Date.now();

  private get mongo() {
    return mongoose.connection.readyState === 1 ? mongoose.connection.db : undefined;
  }

  /** Load data from Mongo (preferred) or the dev JSON file, seeding when empty. Call once before listening. */
  public async init() {
    const mdb = this.mongo;
    if (mdb) {
      const loaded: Partial<DatabaseSchema> = {};
      let total = 0;
      for (const coll of LIST_COLLECTIONS) {
        const docs = await mdb.collection(coll).find({}).sort({ _created: -1 }).toArray();
        total += docs.length;
        (loaded as any)[coll] = docs.map(({ _id, _created, ...rest }) => rest);
      }
      const settingsDoc = await mdb.collection('settings').findOne({ _id: SETTINGS_ID as any });

      if (total === 0) {
        // Empty Mongo: migrate the local JSON file if present, otherwise seed.
        this.data = this.readJsonFile() || seedData();
        console.log('[Store] Mongo empty — importing initial data.');
        for (const coll of LIST_COLLECTIONS) this.markAll(coll);
        this.markDirty('settings', SETTINGS_ID);
      } else {
        const { _id, ...settings } = (settingsDoc || INITIAL_SETTINGS) as any;
        this.data = { ...(loaded as DatabaseSchema), settings };
      }
    } else {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('MongoDB is required in production. Set MONGODB_URI.');
      }
      this.data = this.readJsonFile() || seedData();
      console.log('[Store] Using local dev JSON store:', DB_FILE);
    }

    await this.migratePasswords();
    await this.flush();
  }

  /** Replace any plaintext seed passwords with bcrypt hashes. */
  private async migratePasswords() {
    const seedPassword = process.env.SEED_USER_PASSWORD;
    for (const user of this.data.users) {
      if (!user.password) continue;
      if (process.env.NODE_ENV === 'production' && !seedPassword) {
        throw new Error('Seed users found. Set SEED_USER_PASSWORD to hash them with a password of your choosing.');
      }
      user.passwordHash = await bcrypt.hash(seedPassword || user.password, 12);
      delete user.password;
      this.markDirty('users', user.id);
    }
  }

  private readJsonFile(): DatabaseSchema | null {
    try {
      if (!fs.existsSync(DB_FILE)) return null;
      const parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      const seed = seedData();
      const out = {} as any;
      for (const key of Object.keys(seed) as (keyof DatabaseSchema)[]) out[key] = parsed[key] || seed[key];
      return out;
    } catch (err) {
      console.error('[Store] Failed to read database.json:', err);
      return null;
    }
  }

  private markAll(coll: ListCollection) {
    for (const item of this.data[coll] as { id: string }[]) this.markDirty(coll, item.id);
  }

  private markDirty(coll: keyof DatabaseSchema, id: string) {
    if (!this.dirty.has(coll)) this.dirty.set(coll, new Set());
    this.dirty.get(coll)!.add(id);
  }

  private save(coll: keyof DatabaseSchema, ...ids: string[]) {
    ids.forEach(id => this.markDirty(coll, id));
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => this.flush().catch(err => console.error('[Store] Persist failed:', err)), 100);
  }

  private async flush() {
    const mdb = this.mongo;
    const pending = this.dirty;
    this.dirty = new Map();

    if (!mdb) {
      if (process.env.NODE_ENV === 'production') return; // init() already refused to start without Mongo
      fs.mkdirSync(DATA_DIR, { recursive: true });
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
      return;
    }

    try {
      for (const [coll, ids] of pending) {
        if (coll === 'settings') {
          await mdb.collection('settings').replaceOne({ _id: SETTINGS_ID as any }, this.data.settings, { upsert: true });
          continue;
        }
        const list = this.data[coll] as { id: string }[];
        const ops = [...ids].map(id => {
          const idx = list.findIndex(i => i.id === id);
          return idx === -1 ? null : {
            updateOne: {
              filter: { _id: id as any },
              // Newest-first arrays: lower index = newer, so _created decreases with index.
              update: { $set: list[idx], $setOnInsert: { _created: this.seq++ + (list.length - idx) } },
              upsert: true
            }
          };
        }).filter(Boolean) as any[];
        if (ops.length) await mdb.collection(coll).bulkWrite(ops, { ordered: false });
      }
    } catch (err) {
      // Re-queue so the next save retries instead of silently dropping writes.
      for (const [coll, ids] of pending) ids.forEach(id => this.markDirty(coll, id));
      throw err;
    }
  }

  // ---------------- Organizations ----------------
  public getOrganizations(): Organization[] {
    return this.data.organizations;
  }

  public getOrganizationById(id: string): Organization | undefined {
    return this.data.organizations.find(o => o.id === id);
  }

  public createOrganization(org: Organization): Organization {
    this.data.organizations.unshift(org);
    this.save('organizations', org.id);
    return org;
  }

  public updateOrganization(id: string, updates: Partial<Organization>): Organization | null {
    const idx = this.data.organizations.findIndex(o => o.id === id);
    if (idx === -1) return null;
    this.data.organizations[idx] = { ...this.data.organizations[idx], ...updates };
    this.save('organizations', id);
    return this.data.organizations[idx];
  }

  // ---------------- Candidates ----------------
  public getCandidates(filterPartnerId?: string): Candidate[] {
    if (filterPartnerId) {
      return this.data.candidates.filter(c => c.partnerId === filterPartnerId);
    }
    return this.data.candidates;
  }

  public getCandidateById(id: string): Candidate | undefined {
    return this.data.candidates.find(c => c.id === id);
  }

  public createCandidate(cand: Candidate): Candidate {
    this.data.candidates.unshift(cand);
    this.save('candidates', cand.id);
    return cand;
  }

  public updateCandidate(id: string, updates: Partial<Candidate>): Candidate | null {
    const idx = this.data.candidates.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.candidates[idx] = { ...this.data.candidates[idx], ...updates };
    this.save('candidates', id);
    return this.data.candidates[idx];
  }

  // ---------------- Jobs ----------------
  public getJobs(): Job[] {
    return this.data.jobs;
  }

  public getJobById(id: string): Job | undefined {
    return this.data.jobs.find(j => j.id === id);
  }

  public createJob(job: Job): Job {
    this.data.jobs.unshift(job);
    this.save('jobs', job.id);
    return job;
  }

  public updateJob(id: string, updates: Partial<Job>): Job | null {
    const idx = this.data.jobs.findIndex(j => j.id === id);
    if (idx === -1) return null;
    this.data.jobs[idx] = { ...this.data.jobs[idx], ...updates };
    this.save('jobs', id);
    return this.data.jobs[idx];
  }

  // ---------------- Applications ----------------
  public getApplications(filterPartnerId?: string): Application[] {
    if (filterPartnerId) {
      return this.data.applications.filter(a => a.partnerId === filterPartnerId);
    }
    return this.data.applications;
  }

  public getApplicationById(id: string): Application | undefined {
    return this.data.applications.find(a => a.id === id);
  }

  public createApplication(app: Application): Application {
    this.data.applications.unshift(app);
    this.save('applications', app.id);
    return app;
  }

  public updateApplication(id: string, updates: Partial<Application>): Application | null {
    const idx = this.data.applications.findIndex(a => a.id === id);
    if (idx === -1) return null;
    this.data.applications[idx] = { ...this.data.applications[idx], ...updates };
    this.save('applications', id);
    return this.data.applications[idx];
  }

  // ---------------- Users ----------------
  public getUsers(filterOrgId?: string): User[] {
    if (filterOrgId) {
      return this.data.users.filter(u => u.organizationId === filterOrgId);
    }
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  }

  public createUser(user: User): User {
    this.data.users.unshift(user);
    this.save('users', user.id);
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.save('users', id);
    return this.data.users[idx];
  }

  // ---------------- Interviews ----------------
  public getInterviews(): InterviewRound[] {
    return this.data.interviews;
  }

  public getInterviewById(id: string): InterviewRound | undefined {
    return this.data.interviews.find(i => i.id === id);
  }

  public createInterview(interview: InterviewRound): InterviewRound {
    this.data.interviews.unshift(interview);
    this.save('interviews', interview.id);
    return interview;
  }

  public updateInterview(id: string, updates: Partial<InterviewRound>): InterviewRound | null {
    const idx = this.data.interviews.findIndex(i => i.id === id);
    if (idx === -1) return null;
    this.data.interviews[idx] = { ...this.data.interviews[idx], ...updates };
    this.save('interviews', id);
    return this.data.interviews[idx];
  }

  // ---------------- Offers ----------------
  public getOffers(filterPartnerId?: string): Offer[] {
    if (filterPartnerId) {
      return this.data.offers.filter(o => o.partnerId === filterPartnerId);
    }
    return this.data.offers;
  }

  public getOfferById(id: string): Offer | undefined {
    return this.data.offers.find(o => o.id === id);
  }

  public createOffer(offer: Offer): Offer {
    this.data.offers.unshift(offer);
    this.save('offers', offer.id);
    return offer;
  }

  public updateOffer(id: string, updates: Partial<Offer>): Offer | null {
    const idx = this.data.offers.findIndex(o => o.id === id);
    if (idx === -1) return null;
    this.data.offers[idx] = { ...this.data.offers[idx], ...updates };
    this.save('offers', id);
    return this.data.offers[idx];
  }

  // ---------------- Audit Events ----------------
  public getAuditEvents(): AuditEvent[] {
    return this.data.auditEvents;
  }

  public logAudit(event: AuditEvent): AuditEvent {
    this.data.auditEvents.unshift(event);
    this.save('auditEvents', event.id);
    return event;
  }

  // ---------------- Notifications ----------------
  public getNotifications(): SystemNotification[] {
    return this.data.notifications;
  }

  public createNotification(notif: SystemNotification): SystemNotification {
    this.data.notifications.unshift(notif);
    this.save('notifications', notif.id);
    return notif;
  }

  public markNotificationRead(id: string): boolean {
    const n = this.data.notifications.find(item => item.id === id);
    if (n) {
      n.read = true;
      this.save('notifications', id);
      return true;
    }
    return false;
  }

  // ---------------- Platform Settings ----------------
  public getSettings(): PlatformSettings {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<PlatformSettings>): PlatformSettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.save('settings', SETTINGS_ID);
    return this.data.settings;
  }

  // ---------------- Batch Intake Items ----------------
  public getBatchItems(): BatchIntakeItem[] {
    return this.data.batchItems;
  }

  public createBatchItems(items: BatchIntakeItem[]): BatchIntakeItem[] {
    this.data.batchItems.unshift(...items);
    this.save('batchItems', ...items.map(i => i.id));
    return items;
  }

  public updateBatchItem(id: string, updates: Partial<BatchIntakeItem>): BatchIntakeItem | null {
    const idx = this.data.batchItems.findIndex(b => b.id === id);
    if (idx === -1) return null;
    this.data.batchItems[idx] = { ...this.data.batchItems[idx], ...updates };
    this.save('batchItems', id);
    return this.data.batchItems[idx];
  }
}

export const db = new Store();
