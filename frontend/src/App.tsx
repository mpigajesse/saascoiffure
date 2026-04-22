import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TenantProvider } from "@/contexts/TenantContext";
import { TenantThemeProvider } from "@/contexts/TenantThemeContext";
import { AppointmentsProvider } from "@/contexts/AppointmentsContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Pages Admin
import Dashboard from "./pages/Dashboard";
import ClientsPage from "./pages/ClientsPage";
import ServicesPage from "./pages/ServicesPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import EditServicePage from "./pages/EditServicePage";
import ClientDetailPage from "./pages/ClientDetailPage";
import EditClientPage from "./pages/EditClientPage";
import EmployeesPage from "./pages/EmployeesPage";
import EmployeeDetailPage from "./pages/EmployeeDetailPage";
import EditEmployeePage from "./pages/EditEmployeePage";
import EmployeePermissionsPage from "./pages/EmployeePermissionsPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import AppointmentDetailPage from "./pages/AppointmentDetailPage";
import PaymentsPage from "./pages/PaymentsPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import TenantsPage from "./pages/TenantsPage";
import NewTenantPage from "./pages/NewTenantPage";
import TenantDetailPage from "./pages/TenantDetailPage";
import EditTenantPage from "./pages/EditTenantPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import SessionsPage from "./pages/SessionsPage";
import NotFound from "./pages/NotFound";

// Pages Publiques
import HomePage from "./pages/public/HomePage";
import PublicServicesPage from "./pages/public/ServicesPage";
import PublicServiceDetailPage from "./pages/public/ServiceDetailPage";
import BookingPage from "./pages/public/BookingPage";
import ContactPage from "./pages/public/ContactPage";
import PublicSalonLayout from "./components/public/PublicSalonLayout";

// Configure React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AdminProvider>
          <AppointmentsProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Routes publiques par slug de salon (/s/:slug/...) */}
                <Route path="/s/:slug" element={<PublicSalonLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="services" element={<PublicServicesPage />} />
                  <Route path="services/:id" element={<PublicServiceDetailPage />} />
                  <Route path="booking" element={<BookingPage />} />
                  <Route path="contact" element={<ContactPage />} />
                </Route>

                {/* Routes publiques legacy (redirigent vers /s/...) */}
                <Route path="/public" element={
                  <TenantProvider isPublic={true}>
                    <TenantThemeProvider>
                      <HomePage />
                    </TenantThemeProvider>
                  </TenantProvider>
                } />
                <Route path="/public/services" element={
                  <TenantProvider isPublic={true}>
                    <TenantThemeProvider>
                      <PublicServicesPage />
                    </TenantThemeProvider>
                  </TenantProvider>
                } />
                <Route path="/public/services/:id" element={
                  <TenantProvider isPublic={true}>
                    <TenantThemeProvider>
                      <PublicServiceDetailPage />
                    </TenantThemeProvider>
                  </TenantProvider>
                } />
                <Route path="/public/booking" element={
                  <TenantProvider isPublic={true}>
                    <TenantThemeProvider>
                      <BookingPage />
                    </TenantThemeProvider>
                  </TenantProvider>
                } />
                <Route path="/public/contact" element={
                  <TenantProvider isPublic={true}>
                    <TenantThemeProvider>
                      <ContactPage />
                    </TenantThemeProvider>
                  </TenantProvider>
                } />

                {/* Routes d'authentification */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                {/* Routes admin (dashboard) - Protégées */}
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <TenantProvider isPublic={false}>
                      <Dashboard />
                    </TenantProvider>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <TenantProvider isPublic={false}>
                      <Dashboard />
                    </TenantProvider>
                  </ProtectedRoute>
                } />

                {/* Routes Tenants (nouvelle structure) */}
                <Route path="/tenants" element={
                  <ProtectedRoute>
                    <TenantProvider isPublic={false}>
                      <TenantsPage />
                    </TenantProvider>
                  </ProtectedRoute>
                } />
                <Route path="/tenants/new" element={
                  <ProtectedRoute>
                    <TenantProvider isPublic={false}>
                      <NewTenantPage />
                    </TenantProvider>
                  </ProtectedRoute>
                } />
                <Route path="/tenants/:id" element={
                  <ProtectedRoute>
                    <TenantProvider isPublic={false}>
                      <TenantDetailPage />
                    </TenantProvider>
                  </ProtectedRoute>
                } />
                <Route path="/tenants/:id/edit" element={
                  <ProtectedRoute>
                    <TenantProvider isPublic={false}>
                      <EditTenantPage />
                    </TenantProvider>
                  </ProtectedRoute>
                } />

                {/* Routes Admin Tenants (ancienne structure, conservée pour compatibilité) */}
                <Route path="/admin/tenants" element={
                  <ProtectedRoute>
                    <TenantProvider isPublic={false}>
                      <TenantsPage />
                    </TenantProvider>
                  </ProtectedRoute>
                } />
                <Route path="/admin/tenants/new" element={
                  <ProtectedRoute>
                    <TenantProvider isPublic={false}>
                      <NewTenantPage />
                    </TenantProvider>
                  </ProtectedRoute>
                } />
                <Route path="/admin/tenants/:id" element={
                  <ProtectedRoute>
                    <TenantProvider isPublic={false}>
                      <TenantDetailPage />
                    </TenantProvider>
                  </ProtectedRoute>
                } />
                <Route path="/admin/tenants/:id/edit" element={
                  <ProtectedRoute>
                    <TenantProvider isPublic={false}>
                      <EditTenantPage />
                    </TenantProvider>
                  </ProtectedRoute>
                } />
                <Route path="/admin/clients" element={
                  <ProtectedRoute>
                    <TenantProvider isPublic={false}>
                      <ClientsPage />
                    </TenantProvider>
                  </ProtectedRoute>
                } />
                <Route path="/admin/services" element={
                  <ProtectedRoute>
                    <TenantProvider isPublic={false}>
                      <ServicesPage />
                    </TenantProvider>
                  </ProtectedRoute>
                } />
                <Route path="/admin/services/:id" element={
                  <ProtectedRoute>
                    <TenantProvider isPublic={false}>
                      <ServiceDetailPage />
                    </TenantProvider>
                  </ProtectedRoute>
                } />
                <Route path="/admin/services/:id/edit" element={
                  <ProtectedRoute>
                    <TenantProvider isPublic={false}>
                      <EditServicePage />
                    </TenantProvider>
                  </ProtectedRoute>
                } />
                <Route path="/admin/clients/:id" element={
                  <ProtectedRoute>
                    <TenantProvider isPublic={false}>
                      <ClientDetailPage />
                    </TenantProvider>
                  </ProtectedRoute>
                } />
                <Route path="/admin/clients/:id/edit" element={
                  <ProtectedRoute>
                    <TenantProvider isPublic={false}>
                      <EditClientPage />
                    </TenantProvider>
                  </ProtectedRoute>
                } />
                <Route path="/admin/employees/:id/permissions" element={
                  <ProtectedRoute>
                    <TenantProvider isPublic={false}>
                      <EmployeePermissionsPage />
                    </TenantProvider>
                  </ProtectedRoute>
                } />
                <Route path="/admin/employees/:id/edit" element={
                  <ProtectedRoute>
                    <TenantProvider isPublic={false}>
                      <EditEmployeePage />
                    </TenantProvider>
                  </ProtectedRoute>
                } />
                <Route path="/admin/employees/:id" element={
                  <ProtectedRoute>
                    <TenantProvider isPublic={false}>
                      <EmployeeDetailPage />
                    </TenantProvider>
                  </ProtectedRoute>
                } />
                <Route path="/admin/employees" element={
                  <ProtectedRoute>
                    <TenantProvider isPublic={false}>
                      <EmployeesPage />
                    </TenantProvider>
                  </ProtectedRoute>
                } />
                <Route path="/admin/appointments" element={
                  <ProtectedRoute>
                    <TenantProvider isPublic={false}>
                      <TenantThemeProvider>
                        <AppointmentsPage />
                      </TenantThemeProvider>
                    </TenantProvider>
                  </ProtectedRoute>
                } />
                <Route path="/admin/appointments/:id" element={
                  <ProtectedRoute>
                    <TenantProvider isPublic={false}>
                      <AppointmentDetailPage />
                    </TenantProvider>
                  </ProtectedRoute>
                } />
                <Route path="/admin/payments" element={
                  <ProtectedRoute>
                    <TenantProvider isPublic={false}>
                      <PaymentsPage />
                    </TenantProvider>
                  </ProtectedRoute>
                } />
                <Route path="/admin/settings" element={
                  <ProtectedRoute>
                    <TenantProvider isPublic={false}>
                      <TenantThemeProvider>
                        <SettingsPage />
                      </TenantThemeProvider>
                    </TenantProvider>
                  </ProtectedRoute>
                } />

                {/* Route par défaut : redirection vers public */}
                <Route path="/" element={
                  <TenantProvider isPublic={true}>
                    <HomePage />
                  </TenantProvider>
                } />

                {/* Routes legacy (redirection vers admin) - Protégées */}
                <Route path="/clients" element={
                  <ProtectedRoute>
                    <TenantProvider isPublic={false}>
                      <ClientsPage />
                    </TenantProvider>
                  </ProtectedRoute>
                } />
                <Route path="/services" element={
                  <ProtectedRoute>
                    <TenantProvider isPublic={false}>
                      <ServicesPage />
                    </TenantProvider>
                  </ProtectedRoute>
                } />
                <Route path="/services/:id" element={
                  <ProtectedRoute>
                    <TenantProvider isPublic={false}>
                      <ServiceDetailPage />
                    </TenantProvider>
                  </ProtectedRoute>
                } />
                <Route path="/services/:id/edit" element={
                  <ProtectedRoute>
                    <TenantProvider isPublic={false}>
                      <EditServicePage />
                    </TenantProvider>
                  </ProtectedRoute>
                } />
                <Route path="/clients/:id" element={
                  <ProtectedRoute>
                    <TenantProvider isPublic={false}>
                      <ClientDetailPage />
                    </TenantProvider>
                  </ProtectedRoute>
                } />
                <Route path="/clients/:id/edit" element={
                  <ProtectedRoute>
                    <TenantProvider isPublic={false}>
                      <EditClientPage />
                    </TenantProvider>
                  </ProtectedRoute>
                } />
                <Route path="/employees" element={
                  <ProtectedRoute>
                    <TenantProvider isPublic={false}>
                      <EmployeesPage />
                    </TenantProvider>
                  </ProtectedRoute>
                } />
                <Route path="/employees/:id" element={
                  <ProtectedRoute>
                    <TenantProvider isPublic={false}>
                      <EmployeeDetailPage />
                    </TenantProvider>
                  </ProtectedRoute>
                } />
                <Route path="/employees/:id/edit" element={
                  <ProtectedRoute>
                    <TenantProvider isPublic={false}>
                      <EditEmployeePage />
                    </TenantProvider>
                  </ProtectedRoute>
                } />
                <Route path="/appointments" element={
                  <ProtectedRoute>
                    <TenantProvider isPublic={false}>
                      <TenantThemeProvider>
                        <AppointmentsPage />
                      </TenantThemeProvider>
                    </TenantProvider>
                  </ProtectedRoute>
                } />
                <Route path="/appointments/:id" element={
                  <ProtectedRoute>
                    <TenantProvider isPublic={false}>
                      <AppointmentDetailPage />
                    </TenantProvider>
                  </ProtectedRoute>
                } />
                <Route path="/payments" element={
                  <ProtectedRoute>
                    <TenantProvider isPublic={false}>
                      <PaymentsPage />
                    </TenantProvider>
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <TenantProvider isPublic={false}>
                      <TenantThemeProvider>
                        <SettingsPage />
                      </TenantThemeProvider>
                    </TenantProvider>
                  </ProtectedRoute>
                } />
                <Route path="/settings/change-password" element={
                  <ProtectedRoute>
                    <TenantProvider isPublic={false}>
                      <ChangePasswordPage />
                    </TenantProvider>
                  </ProtectedRoute>
                } />
                <Route path="/settings/sessions" element={
                  <ProtectedRoute>
                    <TenantProvider isPublic={false}>
                      <SessionsPage />
                    </TenantProvider>
                  </ProtectedRoute>
                } />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AppointmentsProvider>
        </AdminProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
