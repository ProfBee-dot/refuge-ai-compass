
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "@/contexts/UserContext";
import Index from "./pages/Index";
import WorldView from "./pages/WorldView";
import RefugeePortal from "./pages/RefugeePortal";
import DonorPortal from "./pages/DonorPortal";
import AdminPortal from "./pages/AdminPortal";
import NotFound from "./pages/NotFound";
import { Header } from "./components/Header";
import { LandingPage } from "./components/LandingPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <UserProvider>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/world" element={<WorldView />} />
            <Route path="/portals" element={<Index />} />
            <Route path="/refugee-portal" element={<RefugeePortal />} />
            <Route path="/donor-portal" element={<DonorPortal />} />
            <Route path="/admin-portal" element={<AdminPortal />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
