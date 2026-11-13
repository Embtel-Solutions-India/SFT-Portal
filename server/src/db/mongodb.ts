import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export interface MongoConnectionStatus {
  isConnected: boolean;
  state: string;
  host?: string;
  databaseName?: string;
  uriConfigured: boolean;
  error?: string;
}

let connectionStatus: MongoConnectionStatus = {
  isConnected: false,
  state: 'disconnected',
  uriConfigured: false
};

export async function connectMongoDB(): Promise<MongoConnectionStatus> {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || 'embtel_sfs';

  if (!uri || uri.includes('<username>') || uri.includes('<password>')) {
    connectionStatus = {
      isConnected: false,
      state: 'unconfigured',
      uriConfigured: false,
      error: 'MONGODB_URI in server/.env contains placeholder values or is missing. Using local dev JSON store (not allowed in production).'
    };
    console.log('\n[MongoDB] Notice: Real MongoDB URI is not yet configured in server/.env.');
    console.log('[MongoDB] Using persistent disk database at server/data/database.json.');
    console.log('[MongoDB] To connect to real MongoDB, add your Atlas or Local connection string in server/.env.\n');
    return connectionStatus;
  }

  connectionStatus.uriConfigured = true;

  try {
    console.log(`[MongoDB] Connecting to MongoDB (${dbName})...`);
    await mongoose.connect(uri, {
      dbName,
      serverSelectionTimeoutMS: 5000 // Quick timeout to prevent hanging if host is unreachable
    });

    const conn = mongoose.connection;
    connectionStatus = {
      isConnected: conn.readyState === 1,
      state: 'connected',
      host: conn.host,
      databaseName: conn.name,
      uriConfigured: true
    };

    console.log(`[MongoDB] Successfully connected to real MongoDB database: ${conn.name} on ${conn.host}`);

    // Listen for disconnections
    mongoose.connection.on('disconnected', () => {
      connectionStatus.isConnected = false;
      connectionStatus.state = 'disconnected';
      console.warn('[MongoDB] MongoDB disconnected. Falling back to local persistent store.');
    });

    return connectionStatus;
  } catch (err: any) {
    connectionStatus = {
      isConnected: false,
      state: 'error',
      uriConfigured: true,
      error: err.message
    };
    console.error('[MongoDB] Connection error:', err.message);
    console.log('[MongoDB] Seamless fallback to local persistent disk database at server/data/database.json.');
    return connectionStatus;
  }
}

export function getMongoStatus(): MongoConnectionStatus {
  return connectionStatus;
}

