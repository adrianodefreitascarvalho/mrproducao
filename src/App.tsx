import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useProductionStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
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
import Products from "./pages/Products";
import NewProduct from "./pages/NewProduct";
import EditProduct from "./pages/EditProduct";
import Weapons from "./pages/Weapons.tsx";
import NewWeapon from "./pages/NewWeapon.tsx";
import EditWeapon from "./pages/EditWeapon.tsx";
import Clients from "./pages/Clients";
import NewClient from "./pages/NewClient";
import EditClient from "./pages/EditClient";
import Contacts from "./pages/Contacts";
import NewContact from "./pages/NewContact";
import EditContact from "./pages/EditContact";
import Reports from "./pages/Reports";
import WoodStock from "./pages/WoodStock";
import PriceTablesPage from "./pages/PriceTable.tsx";
import SalesOrders from "./pages/SalesOrders";
import Users from "./pages/Users";
import EditUser from "./pages/EditUser";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
<<<<<<< HEAD
import GunstockDimensions from "./pages/fittings/GunstockDimensions";
import BodyMeasurements from "./pages/fittings/BodyMeasurements";
import ForehandDimensions from "./pages/fittings/ForehandDimensions";
=======
import GunstockDimensions from "./pages/Fittings/GunstockDimensions";
import BodyMeasurementsPage from "./pages/Fittings/BodyMeasurementsPage";
import ForehandDimensionsPage from "./pages/Fittings/ForehandDimensionsPage";
>>>>>>> 55b37e5fd6fbec382c79fe9f7eb6681dad0b9e2a
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
    // Set up auth listener BEFORE getting session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      // Carrega os dados iniciais da base de dados
      fetchProducts();
      fetchOrders();
      fetchWorkstations();
      fetchReleaseOrders();
      fetchClients();
      fetchWeapons();
      fetchPriceTables();
    }
  }, [session, fetchProducts, fetchOrders, fetchWorkstations, fetchReleaseOrders, fetchClients, fetchWeapons, fetchPriceTables]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">A carregar...</p>
      </div>
    );
  }

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
                 <Route path="/fittings/gunstock" element={<GunstockDimensions />} />
                <Route path="/fittings/body" element={<BodyMeasurements />} />
                <Route path="/fittings/forehand" element={<ForehandDimensions />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/release-orders" element={<ReleaseOrders />} />
                <Route path="/workstations" element={<Workstations />} />
                <Route path="/workstations/:id" element={<WorkstationDetail />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/new" element={<NewOrder />} />
                <Route path="/orders/:id" element={<OrderDetail />} />
                 <Route path="/orders/:id/routing" element={<ProductionRouting />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/new" element={<NewProduct />} />
                <Route path="/products/edit/:id" element={<EditProduct />} />
                <Route path="/weapons" element={<Weapons />} />
                <Route path="/weapons/new" element={<NewWeapon />} />
                <Route path="/weapons/edit/:id" element={<EditWeapon />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/clients/new" element={<NewClient />} />
                <Route path="/clients/edit/:id" element={<EditClient />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/contacts/new" element={<NewContact />} />
                <Route path="/contacts/edit/:id" element={<EditContact />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/woodstock" element={<WoodStock />} />
                <Route path="/price-tables" element={<PriceTablesPage />} />
                <Route path="/sales-orders" element={<SalesOrders />} />
                <Route path="/users" element={<Users />} />
                <Route path="/users/edit/:id" element={<EditUser />} />
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
