
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LandingPage } from "./components/LandingPage";
import Index from "./pages/Index";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "@/contexts/UserContext";
import NotFound from "./pages/NotFound";
import { Header } from "./components/Header";
import { lazy, Suspense } from "react";
import { LoadingPage } from "./components/Loading";

const queryClient = new QueryClient();

const WorldView = lazy(() => import('./pages/WorldView'))
const RefugeePortal = lazy(() => import('./pages/RefugeePortal'))
const DonorPortal = lazy(() => import('./pages/DonorPortal'))
const AdminPortal = lazy(() => import('./pages/AdminPortal'))


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
            <Route path="/portals" element={<Index />} />

            <Route path="/world" element={
              <Suspense fallback={<LoadingPage />}>
                <WorldView />
              </Suspense>
            } />

            <Route path="/refugee-portal" element={
              <Suspense fallback={<LoadingPage />}>
                <RefugeePortal />
              </Suspense>
            } />

            <Route path="/donor-portal" element={
              <Suspense fallback={<LoadingPage />}>
                <DonorPortal />
              </Suspense>
            } />

            <Route path="/admin-portal" element={
              <Suspense fallback={<LoadingPage />}>
                <AdminPortal />
              </Suspense>
            } />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
