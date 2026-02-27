import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useProductionStore } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import type { Session } from "@supabase/supabase-js";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Workstations from "./pages/Workstations";
import WorkstationDetail from "./pages/WorkstationDetail";
import Orders from "./pages/Orders";
import NewOrder from "./pages/NewOrder";
import OrderDetail from "./pages/OrderDetail.tsx";
import ProductionRouting from "./pages/ProductionRouting.tsx";
import ReleaseOrders from "./pages/ReleaseOrders.tsx";
import Weapons from "./pages/Weapons.tsx";
import NewWeapon from "./pages/NewWeapon.tsx";
import EditWeapon from "./pages/EditWeapon.tsx";
import Clients from "./pages/Clients";
import NewClient from "./pages/NewClient";
import EditClient from "./pages/EditClient";
import Reports from "./pages/Reports";
import WoodStock from "./pages/WoodStock";
import PriceTablesPage from "../PriceTable";
import SalesOrders from "./pages/SalesOrders";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useProductionStore((state) => state.fetchOrders);
  const fetchProducts = useProductionStore((state) => state.fetchProducts);
  const fetchWorkstations = useProductionStore((state) => state.fetchWorkstations);
  const fetchReleaseOrders = useProductionStore((state) => state.fetchReleaseOrders);
  const fetchClients = useProductionStore((state) => state.fetchClients);
  const fetchWeapons = useProductionStore((state) => state.fetchWeapons);
  const fetchPriceTables = useProductionStore((state) => state.fetchPriceTables);

  useEffect(() => {
<<<<<<< HEAD
    // Carrega os dados iniciais da base de dados
    fetchProducts();
    fetchOrders();
    fetchWorkstations();
    fetchReleaseOrders();
    fetchClients();
    fetchWeapons();
    fetchPriceTables();
  }, [fetchProducts, fetchOrders, fetchWorkstations, fetchReleaseOrders, fetchClients, fetchWeapons, fetchPriceTables]);
=======
    // Set up auth listener BEFORE getting session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchProducts();
      fetchOrders();
      fetchWorkstations();
      fetchReleaseOrders();
      fetchClients();
      fetchWeapons();
    }
  }, [session, fetchProducts, fetchOrders, fetchWorkstations, fetchReleaseOrders, fetchClients, fetchWeapons]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">A carregar...</p>
      </div>
    );
  }
>>>>>>> 6e7aab4b2e3fca4a767fa36813ed24dc91a04395

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {!session ? (
            <Routes>
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="*" element={<Login />} />
            </Routes>
          ) : (
            <MainLayout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/release-orders" element={<ReleaseOrders />} />
                <Route path="/workstations" element={<Workstations />} />
                <Route path="/workstations/:id" element={<WorkstationDetail />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/new" element={<NewOrder />} />
                <Route path="/orders/:id" element={<OrderDetail />} />
                <Route path="/orders/:id/routing" element={<ProductionRouting />} />
                <Route path="/weapons" element={<Weapons />} />
                <Route path="/weapons/new" element={<NewWeapon />} />
                <Route path="/weapons/edit/:id" element={<EditWeapon />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/clients/new" element={<NewClient />} />
                <Route path="/clients/edit/:id" element={<EditClient />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/woodstock" element={<WoodStock />} />
                <Route path="/price-tables" element={<PriceTablesPage />} />
                <Route path="/sales-orders" element={<SalesOrders />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </MainLayout>
          )}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
