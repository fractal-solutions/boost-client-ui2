import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { BrowserRouter, Routes, Route, Router } from 'react-router-dom';
import { NavigationMenuDemo } from '@/components/NavigationMenu';
import Dashboard from '@/pages/Dashboard';
import History from '@/pages/History';
import Scheduled from '@/pages/Scheduled';
import ContractsCreate from '@/pages/contracts/Create';
import ContractsManage from '@/pages/contracts/Manage';
import ContractsTemplates from '@/pages/contracts/Templates';
import InvestmentsMarket from '@/pages/investments/Market';
import InvestmentsPortfolio from '@/pages/investments/Portfolio';
import InvestmentsCalculator from '@/pages/investments/Calculator';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="payment-theme">
        <div className="min-h-screen bg-background">
          <NavigationMenuDemo />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/history" element={<History />} />
              <Route path="/scheduled" element={<Scheduled />} />
              <Route path="/contracts/create" element={<ContractsCreate />} />
              <Route path="/contracts/manage" element={<ContractsManage />} />
              <Route path="/contracts/templates" element={<ContractsTemplates />} />
              <Route path="/investments/market" element={<InvestmentsMarket />} />
              <Route path="/investments/portfolio" element={<InvestmentsPortfolio />} />
              <Route path="/investments/calculator" element={<InvestmentsCalculator />} />
            </Routes>
          </main>
          <Toaster />
        </div>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;