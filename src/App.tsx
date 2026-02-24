import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Workstations from "./pages/Workstations";
import WorkstationDetail from "./pages/WorkstationDetail";
import Orders from "./pages/Orders";
import NewOrder from "./pages/NewOrder";
import OrderDetail from "./pages/OrderDetail.tsx";
import ProductionRouting from "./pages/ProductionRouting.tsx";
import ReleaseOrders from "./pages/ReleaseOrders.tsx";
import EditProduct from "./pages/EditProduct.tsx";
import Weapons from "./pages/Weapons.tsx";
import NewWeapon from "./pages/NewWeapon.tsx";
import EditWeapon from "./pages/EditWeapon.tsx";
import NewProduct from "./pages/NewProduct.tsx";
import Products from "./pages/Products.tsx";
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
  // // Initialize production store and set up periodic sync
  // useEffect(() => {
  //   // Initialize store from API/localStorage on app startup
  //   const initializeStore = async () => {
  //     await integrationService.initializeProductionStore(productionStore);
  //   };

  //   initializeStore();

  //   // Start periodic sync to check for new orders
  //   const stopSync = integrationService.startPeriodicSync(productionStore, 60000); // Sync every minute

  //   return () => {
  //     stopSync(); // Cleanup on unmount
  //   };
  // }, [productionStore]);

  // // Log when userProductions change
  // useEffect(() => {
  //   console.log("[App] userProductions atualizado:", userProductions.length);
  // }, [userProductions]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
              <Route path="/products/edit/:id" element={<EditProduct />} />
              <Route path="/products/new" element={<NewProduct />} />
              <Route path="/products" element={<Products />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/clients/new" element={<NewClient />} />
              <Route path="/clients/edit/:id" element={<EditClient />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/woodstock" element={<WoodStock />} />
              <Route path="/price-tables" element={<PriceTablesPage />} />
              <Route path="/sales-orders" element={<SalesOrders />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MainLayout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
