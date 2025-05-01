import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import { BlockchainProvider } from "./contexts/BlockchainContext";
import { Layout } from "./components/Layout";
import { PrivateRoute } from "./components/PrivateRoute";

// Pages
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import BeneficiaryManagement from "./pages/BeneficiaryManagement";
import InventoryManagement from "./pages/InventoryManagement";
import TransactionsPage from "./pages/TransactionsPage";
import NotFound from "./pages/NotFound";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import DistributorsPage from "./pages/DistributorsPage";
import ReportsPage from "./pages/ReportsPage";
import DistributionsPage from "./pages/DistributionsPage";

const queryClient = new QueryClient();

// Separate component for providers to avoid hook usage before provider mounting
function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BlockchainProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            {children}
          </TooltipProvider>
        </AuthProvider>
      </BlockchainProvider>
    </QueryClientProvider>
  );
}

const App = () => (
  <Providers>
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/beneficiaries"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <BeneficiaryManagement />
              </PrivateRoute>
            }
          />

          {/* Admin and Distributor Routes */}
          <Route
            path="/inventory"
            element={
              <PrivateRoute allowedRoles={['admin', 'distributor']}>
                <InventoryManagement />
              </PrivateRoute>
            }
          />

          {/* Transaction History - All users */}
          <Route
            path="/transactions"
            element={
              <PrivateRoute>
                <TransactionsPage />
              </PrivateRoute>
            }
          />

          {/* Distributor Routes */}
          <Route
            path="/distributors"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <DistributorsPage />
              </PrivateRoute>
            }
          />

          {/* Reports Route */}
          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <ReportsPage />
              </PrivateRoute>
            }
          />

          {/* Distributions Route */}
          <Route
            path="/distributions"
            element={
              <PrivateRoute>
                <DistributionsPage />
              </PrivateRoute>
            }
          />

          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  </Providers>
);

export default App;
