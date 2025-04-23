import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { BrowserRouter, Routes, Route, Router } from 'react-router-dom';
import { NavigationMenuDemo } from '@/components/NavigationMenu';
import { AuthProvider } from '@/contexts/AuthContext';
import { WebSocketProvider } from '@/contexts/WebSocketContext';
import Home from '@/pages/Home'; 
import Dashboard from '@/pages/Dashboard';
import History from '@/pages/History';
import Scheduled from '@/pages/Scheduled';
import ContractsCreate from '@/pages/contracts/Create';
import ContractsManage from '@/pages/contracts/Manage';
import ContractsTemplates from '@/pages/contracts/Templates';
import InvestmentsMarket from '@/pages/investments/Market';
import InvestmentsPortfolio from '@/pages/investments/Portfolio';
import InvestmentsCalculator from '@/pages/investments/Calculator';
import VendorDashboard from '@/pages/vendor/Dashboard';
import VendorPOS from '@/pages/vendor/POS';
import VendorBalance from '@/pages/vendor/Balance';
import VendorInventory from '@/pages/vendor/Inventory';
import VendorAnalytics from '@/pages/vendor/Analytics';
import CreditUnderwriting from '@/pages/credit/Underwriting';
import CreditStatus from '@/pages/credit/Status';
import CreditLoans from '@/pages/credit/Loans';

function App() {
  return (
    <BrowserRouter>
    <AuthProvider>
    <WebSocketProvider>
      <ThemeProvider defaultTheme="dark" storageKey="payment-theme">
        <div className="min-h-screen w-full bg-background flex flex-col">
          <NavigationMenuDemo />
          <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/home" element={<Home />} />
              <Route path="/history" element={<History />} />
              <Route path="/scheduled" element={<Scheduled />} />
              <Route path="/contracts/create" element={<ContractsCreate />} />
              <Route path="/contracts/manage" element={<ContractsManage />} />
              <Route path="/contracts/templates" element={<ContractsTemplates />} />
              <Route path="/investments/market" element={<InvestmentsMarket />} />
              <Route path="/investments/portfolio" element={<InvestmentsPortfolio />} />
              <Route path="/investments/calculator" element={<InvestmentsCalculator />} />
              <Route path="/vendor" element={<VendorDashboard />} />
              <Route path="/vendor/pos" element={<VendorPOS />} />
              <Route path="/vendor/balance" element={<VendorBalance />} />
              <Route path="/vendor/inventory" element={<VendorInventory />} />
              <Route path="/vendor/analytics" element={<VendorAnalytics />} />
              <Route path="/credit/underwriting" element={<CreditUnderwriting />} />
              <Route path="/credit/status" element={<CreditStatus />} />
              <Route path="/credit/loans" element={<CreditLoans />} />
            </Routes>
          </main>
          <Toaster />
        </div>
      </ThemeProvider>
    </WebSocketProvider>
    </AuthProvider>
    </BrowserRouter>
  );
}

export default App;