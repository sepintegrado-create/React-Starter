import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './pages/auth/Login';
import { UserDashboard } from './pages/user/Dashboard';
import { ProductsPage } from './pages/company/Products';
import { EmployeesPage } from './pages/company/Employees';
import { QRCodePage } from './pages/company/QRCode';
import { PDVPage } from './pages/company/PDV';
import { FinancialPage } from './pages/company/Financial';
import { InventoryPage } from './pages/company/Inventory';
import { MainLayout } from './layouts/MainLayout';
import { UserRole } from './types/user';
import { PublicOrderPage } from './pages/public/Order';
import { SchedulePage } from './pages/company/Schedule';
import { CustomersPage } from './pages/company/Customers';
import { TrackOrderPage } from './pages/TrackOrder';
import { PackageSettingsPage } from './pages/admin/Packages';
import { Register } from './pages/auth/Register';
import { RegisterCompany } from './pages/auth/RegisterCompany';
import { PaymentPage } from './pages/auth/Payment';
import { AdminContractsPage } from './pages/admin/AdminContracts';
import { PublicProfileSettingsPage } from './pages/admin/PublicProfileSettings';
import { AdminUsersBasePage } from './pages/admin/AdminUsersBase';
import { AdminFinancialPage } from './pages/admin/AdminFinancial';
import { AdminFiscalPage } from './pages/admin/AdminFiscal';
import { AdminSettingsPage } from './pages/admin/AdminSettings';
import { AdminEmployeesPage } from './pages/admin/AdminEmployees';
import { AdminSellersPage } from './pages/admin/AdminSellers';
import { AdminSellerProfilePage } from './pages/admin/AdminSellerProfile';
import { AdminCommissionsPage } from './pages/admin/AdminCommissions';
import { AdminSalesPage } from './pages/admin/AdminSales';
import { AdminCommissionTrackingPage } from './pages/admin/AdminCommissionTracking';
import { AdminDatabase } from './pages/admin/AdminDatabase';
import { PublicProfilePage } from './pages/PublicProfile';
import { CompanyPublicProfileSettingsPage } from './pages/company/PublicProfileSettings';
import { HardwareSettingsPage } from './pages/company/HardwareSettings';
import { SettingsPage } from './pages/company/Settings';
import { UserProfilePage } from './pages/user/Profile';
import { UserQRCodePage } from './pages/user/QRCode';
import { UserOrderHistoryPage } from './pages/user/OrderHistory';
import { UserPaymentMethodsPage } from './pages/user/PaymentMethods';
import { UserExplorePage } from './pages/user/Explore';
import { AddCreditPage } from './pages/user/AddCredit';
import FiscalSettings from './pages/company/FiscalSettings';
import Invoices from './pages/company/Invoices';
import { SuppliersPage } from './pages/company/Suppliers';
import { ReportsPage } from './pages/company/Reports';
import { OperationalSettingsPage } from './pages/company/OperationalSettings';
import { SellerDashboard } from './pages/seller/SellerDashboard';
import { SellerPackages } from './pages/seller/SellerPackages';
import { SellerSales } from './pages/seller/SellerSales';
import { SellerSettings } from './pages/seller/SellerSettings';
import { SellerProfile } from './pages/seller/SellerProfile';

function AppContent() {
  const { isAuthenticated, currentRole } = useAuth();
  const [currentPath, setCurrentPath] = React.useState(window.location.hash.slice(1) || '/');

  React.useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash.slice(1) || '/');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Public Routes (No Auth Required)
  if (currentPath.startsWith('/order/')) {
    return <PublicOrderPage />;
  }

  if (currentPath === '/register') {
    return <Register />;
  }

  if (currentPath === '/register-company') {
    return <RegisterCompany />;
  }

  // If not authenticated, show login
  if (!isAuthenticated) {
    return <Login />;
  }

  // Redirect to role-specific dashboard if on root path
  if (currentPath === '/' || currentPath === '') {
    if (currentRole === UserRole.PLATFORM_ADMIN) {
      window.location.hash = '#/admin';
    } else if (currentRole === UserRole.COMPANY_ADMIN) {
      window.location.hash = '#/company';
    } else if (currentRole === UserRole.EMPLOYEE) {
      window.location.hash = '#/employee';
    } else if (currentRole === UserRole.SELLER) {
      window.location.hash = '#/seller';
    } else {
      window.location.hash = '#/user';
    }
    return null;
  }

  // Determine which component to render based on path and role
  let PageComponent: any = null;

  // Company Admin routes
  if (currentRole === UserRole.COMPANY_ADMIN) {
    switch (currentPath) {
      case '/company/products':
        PageComponent = ProductsPage;
        break;
      case '/company/employees':
        PageComponent = EmployeesPage;
        break;
      case '/company/qrcode':
        PageComponent = QRCodePage;
        break;
      case '/company/pdv':
        PageComponent = PDVPage;
        break;
      case '/company/hardware':
        PageComponent = HardwareSettingsPage;
        break;
      case '/company/public-profile':
        PageComponent = CompanyPublicProfileSettingsPage;
        break;
      case '/company/settings':
        PageComponent = SettingsPage;
        break;
      case '/company/inventory':
        PageComponent = InventoryPage;
        break;
      case '/company/financial':
        PageComponent = FinancialPage;
        break;
      case '/company/schedule':
        PageComponent = SchedulePage;
        break;
      case '/company/customers':
        PageComponent = CustomersPage;
        break;
      case '/company/fiscal':
        PageComponent = FiscalSettings;
        break;
      case '/company/invoices':
        PageComponent = Invoices;
        break;
      case '/company/suppliers':
        PageComponent = SuppliersPage;
        break;
      case '/company/reports':
        PageComponent = ReportsPage;
        break;
      case '/company/operational':
        PageComponent = OperationalSettingsPage;
        break;
      case '/company/track-order':
        PageComponent = TrackOrderPage;
        break;
      case '/company/profile-settings':
      case '/company/profile':
        PageComponent = UserProfilePage;
        break;
      case '/company':
      default:
        PageComponent = React.lazy(() => import('./pages/company/Dashboard').then(m => ({ default: m.CompanyDashboard })));
    }
  }
  // Platform Admin routes
  else if (currentRole === UserRole.PLATFORM_ADMIN) {
    switch (currentPath) {
      case '/admin/plans':
        PageComponent = PackageSettingsPage;
        break;
      case '/admin/contracts':
        PageComponent = AdminContractsPage;
        break;
      case '/admin/profile':
        PageComponent = PublicProfileSettingsPage;
        break;
      case '/admin/profile-settings':
        PageComponent = UserProfilePage;
        break;
      case '/admin/users':
        PageComponent = AdminUsersBasePage;
        break;
      case '/admin/financial':
        PageComponent = AdminFinancialPage;
        break;
      case '/admin/fiscal':
        PageComponent = AdminFiscalPage;
        break;
      case '/admin/employees':
        PageComponent = AdminEmployeesPage;
        break;
      case '/admin/settings':
        PageComponent = AdminSettingsPage;
        break;
      case '/admin/sellers':
        PageComponent = AdminSellersPage;
        break;
      case '/admin/commissions':
        PageComponent = AdminCommissionsPage;
        break;
      case '/admin/sales':
        PageComponent = AdminSalesPage;
        break;
      case '/admin/commission-tracking':
        PageComponent = AdminCommissionTrackingPage;
        break;
      case '/admin/database':
        PageComponent = AdminDatabase;
        break;
      case '/admin':
      default:
        // Handle dynamic seller profile route
        if (currentPath.startsWith('/admin/seller/')) {
          PageComponent = AdminSellerProfilePage;
        } else {
          PageComponent = React.lazy(() => import('./pages/admin/Dashboard').then(m => ({ default: m.AdminDashboard })));
        }
    }
  }
  // Employee routes
  else if (currentRole === UserRole.EMPLOYEE) {
    switch (currentPath) {
      case '/employee/pdv':
        PageComponent = PDVPage;
        break;
      case '/employee/qrcode':
        PageComponent = QRCodePage;
        break;
      case '/employee/orders':
        PageComponent = ProductsPage;
        break;
      case '/employee/track-order':
        PageComponent = TrackOrderPage;
        break;
      case '/employee/profile':
        PageComponent = UserProfilePage;
        break;
      case '/auth/register-company':
        PageComponent = RegisterCompany;
        break;
      case '/auth/payment':
        PageComponent = PaymentPage;
        break;
      case '/employee/shift':
      default:
        PageComponent = React.lazy(() => import('./pages/employee/Dashboard').then(m => ({ default: m.EmployeeDashboard })));
    }
  }
  // Seller routes
  else if (currentRole === UserRole.SELLER) {
    switch (currentPath) {
      case '/seller/packages':
        PageComponent = SellerPackages;
        break;
      case '/seller/sales':
        PageComponent = SellerSales;
        break;
      case '/seller/settings':
        PageComponent = SellerSettings;
        break;
      case '/seller/profile':
        PageComponent = SellerProfile;
        break;
      case '/seller':
      default:
        PageComponent = SellerDashboard;
    }
  }
  // User routes
  else {
    switch (currentPath) {
      case '/user/track-order':
        PageComponent = TrackOrderPage;
        break;
      case '/user/profile':
      case '/user/settings':
        PageComponent = UserProfilePage;
        break;
      case '/user/qrcode':
        PageComponent = UserQRCodePage;
        break;
      case '/user/orders':
        PageComponent = UserOrderHistoryPage;
        break;
      case '/user/payments':
        PageComponent = UserPaymentMethodsPage;
        break;
      case '/user/explore':
        PageComponent = UserExplorePage;
        break;
      case '/user/add-credit':
        PageComponent = AddCreditPage;
        break;
      case '/auth/register-company':
        PageComponent = RegisterCompany;
        break;
      case '/auth/payment':
        PageComponent = PaymentPage;
        break;
      case '/profile':
        PageComponent = PublicProfilePage;
        break;
      default:
        PageComponent = UserDashboard;
    }
  }

  if (!PageComponent) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary mb-4">404</h1>
            <p className="text-muted-foreground">Página não encontrada.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <React.Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      }>
        <PageComponent />
      </React.Suspense>
    </MainLayout>
  );
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
