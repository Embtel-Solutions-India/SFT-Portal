import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PlatformDataProvider } from './context/PlatformDataContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Public & Onboarding Pages
import { RegisterOrganizationPage } from './pages/onboarding/RegisterOrganizationPage';
import { RegistrationStatusPage } from './pages/onboarding/RegistrationStatusPage';

// Authentication Pages
import { RoleLoginPage } from './pages/auth/RoleLoginPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Recruiter Dedicated Pages
import { RecruiterDashboardPage } from './pages/dashboard/recruiter/RecruiterDashboardPage';
import { RecruiterCandidatesPage } from './pages/dashboard/recruiter/RecruiterCandidatesPage';
import { RecruiterIntakePage } from './pages/dashboard/recruiter/RecruiterIntakePage';
import { RecruiterParserPage } from './pages/dashboard/recruiter/RecruiterParserPage';
import { RecruiterJobsPage } from './pages/dashboard/recruiter/RecruiterJobsPage';
import { RecruiterMatchingPage } from './pages/dashboard/recruiter/RecruiterMatchingPage';
import { RecruiterPipelinePage } from './pages/dashboard/recruiter/RecruiterPipelinePage';
import { RecruiterOutreachPage } from './pages/dashboard/recruiter/RecruiterOutreachPage';
import { RecruiterInterviewsPage } from './pages/dashboard/recruiter/RecruiterInterviewsPage';
import { RecruiterOffersPage } from './pages/dashboard/recruiter/RecruiterOffersPage';
import { RecruiterReportsPage } from './pages/dashboard/recruiter/RecruiterReportsPage';
import { RecruiterSettingsPage } from './pages/dashboard/recruiter/RecruiterSettingsPage';

// Platform Admin Dedicated Pages
import { AdminDashboardPage } from './pages/dashboard/admin/AdminDashboardPage';
import { AdminOrganizationsPage } from './pages/dashboard/admin/AdminOrganizationsPage';
import { AdminUsersPage } from './pages/dashboard/admin/AdminUsersPage';
import { AdminCandidatesPage } from './pages/dashboard/admin/AdminCandidatesPage';
import { AdminJobsPage } from './pages/dashboard/admin/AdminJobsPage';
import { AdminApplicationsPage } from './pages/dashboard/admin/AdminApplicationsPage';
import { AdminPlacementsPage } from './pages/dashboard/admin/AdminPlacementsPage';
import { AdminReportsPage } from './pages/dashboard/admin/AdminReportsPage';
import { AdminAuditPage } from './pages/dashboard/admin/AdminAuditPage';
import { AdminIntegrationsPage } from './pages/dashboard/admin/AdminIntegrationsPage';
import { AdminSettingsPage } from './pages/dashboard/admin/AdminSettingsPage';

// Partner Admin Dedicated Pages
import { PartnerAdminDashboardPage } from './pages/dashboard/partner-admin/PartnerAdminDashboardPage';
import { PartnerAdminApprovalsPage } from './pages/dashboard/partner-admin/PartnerAdminApprovalsPage';
import { PartnerAdminCandidatesPage } from './pages/dashboard/partner-admin/PartnerAdminCandidatesPage';
import { PartnerAdminIntakePage } from './pages/dashboard/partner-admin/PartnerAdminIntakePage';
import { PartnerAdminParserPage } from './pages/dashboard/partner-admin/PartnerAdminParserPage';
import { PartnerAdminTrackingPage } from './pages/dashboard/partner-admin/PartnerAdminTrackingPage';
import { PartnerAdminOffersPage } from './pages/dashboard/partner-admin/PartnerAdminOffersPage';
import { PartnerAdminStaffPage } from './pages/dashboard/partner-admin/PartnerAdminStaffPage';
import { PartnerAdminProfilePage } from './pages/dashboard/partner-admin/PartnerAdminProfilePage';
import { PartnerAdminReportsPage } from './pages/dashboard/partner-admin/PartnerAdminReportsPage';

// Partner Staff Dedicated Pages
import { PartnerStaffDashboardPage } from './pages/dashboard/partner-staff/PartnerStaffDashboardPage';
import { PartnerStaffIntakePage } from './pages/dashboard/partner-staff/PartnerStaffIntakePage';
import { PartnerStaffParserPage } from './pages/dashboard/partner-staff/PartnerStaffParserPage';
import { PartnerStaffCandidatesPage } from './pages/dashboard/partner-staff/PartnerStaffCandidatesPage';
import { PartnerStaffTrackingPage } from './pages/dashboard/partner-staff/PartnerStaffTrackingPage';

// Shared Pages
import { UnauthorizedPage } from './pages/shared/UnauthorizedPage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PlatformDataProvider>
          <Routes>
            {/* Root Landing Page: SFT Partnership Proposal & Registration */}
            <Route path="/" element={<RegisterOrganizationPage />} />

            {/* Organization Registration & Onboarding */}
            <Route path="/register" element={<RegisterOrganizationPage />} />
            <Route path="/register/status" element={<RegistrationStatusPage />} />

            {/* Role-Specific Login Routes */}
            <Route path="/admin/login" element={<RoleLoginPage role="platform_admin" />} />
            <Route path="/recruiter/login" element={<RoleLoginPage role="recruiter" />} />
            <Route path="/partner-admin/login" element={<RoleLoginPage role="partner_admin" />} />
            <Route path="/partner-staff/login" element={<RoleLoginPage role="partner_staff" />} />
            <Route path="/login" element={<Navigate to="/admin/login" replace />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Recruiter Dedicated Routes */}
            <Route 
              path="/recruiter/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'platform_admin']}>
                  <RecruiterDashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/recruiter/candidates" 
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'platform_admin']}>
                  <RecruiterCandidatesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/recruiter/intake" 
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'platform_admin']}>
                  <RecruiterIntakePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/recruiter/parser" 
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'platform_admin']}>
                  <RecruiterParserPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/recruiter/jobs" 
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'platform_admin']}>
                  <RecruiterJobsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/recruiter/matching" 
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'platform_admin']}>
                  <RecruiterMatchingPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/recruiter/pipeline" 
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'platform_admin']}>
                  <RecruiterPipelinePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/recruiter/outreach" 
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'platform_admin']}>
                  <RecruiterOutreachPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/recruiter/interviews" 
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'platform_admin']}>
                  <RecruiterInterviewsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/recruiter/offers" 
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'platform_admin']}>
                  <RecruiterOffersPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/recruiter/reports" 
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'platform_admin']}>
                  <RecruiterReportsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/recruiter/settings" 
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'platform_admin']}>
                  <RecruiterSettingsPage />
                </ProtectedRoute>
              } 
            />

            {/* Platform Administrator Dedicated Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['platform_admin']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/organizations" 
              element={
                <ProtectedRoute allowedRoles={['platform_admin']}>
                  <AdminOrganizationsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute allowedRoles={['platform_admin']}>
                  <AdminUsersPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/candidates" 
              element={
                <ProtectedRoute allowedRoles={['platform_admin']}>
                  <AdminCandidatesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/jobs" 
              element={
                <ProtectedRoute allowedRoles={['platform_admin']}>
                  <AdminJobsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/applications" 
              element={
                <ProtectedRoute allowedRoles={['platform_admin']}>
                  <AdminApplicationsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/placements" 
              element={
                <ProtectedRoute allowedRoles={['platform_admin']}>
                  <AdminPlacementsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/reports" 
              element={
                <ProtectedRoute allowedRoles={['platform_admin']}>
                  <AdminReportsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/audit" 
              element={
                <ProtectedRoute allowedRoles={['platform_admin']}>
                  <AdminAuditPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/integrations" 
              element={
                <ProtectedRoute allowedRoles={['platform_admin']}>
                  <AdminIntegrationsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/settings" 
              element={
                <ProtectedRoute allowedRoles={['platform_admin']}>
                  <AdminSettingsPage />
                </ProtectedRoute>
              } 
            />

            {/* Partner Admin Dedicated Routes */}
            <Route 
              path="/partner-admin/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['partner_admin', 'platform_admin']}>
                  <PartnerAdminDashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/partner-admin/approvals" 
              element={
                <ProtectedRoute allowedRoles={['partner_admin', 'platform_admin']}>
                  <PartnerAdminApprovalsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/partner-admin/candidates" 
              element={
                <ProtectedRoute allowedRoles={['partner_admin', 'platform_admin']}>
                  <PartnerAdminCandidatesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/partner-admin/intake" 
              element={
                <ProtectedRoute allowedRoles={['partner_admin', 'platform_admin']}>
                  <PartnerAdminIntakePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/partner-admin/parser" 
              element={
                <ProtectedRoute allowedRoles={['partner_admin', 'platform_admin']}>
                  <PartnerAdminParserPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/partner-admin/tracking" 
              element={
                <ProtectedRoute allowedRoles={['partner_admin', 'platform_admin']}>
                  <PartnerAdminTrackingPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/partner-admin/offers" 
              element={
                <ProtectedRoute allowedRoles={['partner_admin', 'platform_admin']}>
                  <PartnerAdminOffersPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/partner-admin/staff" 
              element={
                <ProtectedRoute allowedRoles={['partner_admin', 'platform_admin']}>
                  <PartnerAdminStaffPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/partner-admin/profile" 
              element={
                <ProtectedRoute allowedRoles={['partner_admin', 'platform_admin']}>
                  <PartnerAdminProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/partner-admin/reports" 
              element={
                <ProtectedRoute allowedRoles={['partner_admin', 'platform_admin']}>
                  <PartnerAdminReportsPage />
                </ProtectedRoute>
              } 
            />

            {/* Partner Staff Dedicated Routes */}
            <Route 
              path="/partner-staff/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['partner_staff', 'partner_admin', 'platform_admin']}>
                  <PartnerStaffDashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/partner-staff/intake" 
              element={
                <ProtectedRoute allowedRoles={['partner_staff', 'partner_admin', 'platform_admin']}>
                  <PartnerStaffIntakePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/partner-staff/parser" 
              element={
                <ProtectedRoute allowedRoles={['partner_staff', 'partner_admin', 'platform_admin']}>
                  <PartnerStaffParserPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/partner-staff/candidates" 
              element={
                <ProtectedRoute allowedRoles={['partner_staff', 'partner_admin', 'platform_admin']}>
                  <PartnerStaffCandidatesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/partner-staff/tracking" 
              element={
                <ProtectedRoute allowedRoles={['partner_staff', 'partner_admin', 'platform_admin']}>
                  <PartnerStaffTrackingPage />
                </ProtectedRoute>
              } 
            />

            {/* Shared & Exception Handlers */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PlatformDataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
