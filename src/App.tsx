import { Button } from "@/components/ui/button";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/user-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from 'react-helmet-async';
import { ScrollToTop } from "../src/pages/ScrollToTop";
import Payment from "./pages/Payment";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import Classes from "./pages/Classes";
import Calendar from "./pages/Calendar";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import SignInPage from "./pages/SignIn";
import SignUpPage from "./pages/SignUp";
import ForgotPassword from "./pages/forgot-password";
import { AdminProtectedRoute } from "./components/auth/AdminProtectedRoute";
import SEO from "./components/SEO";
import PrivacyPolicy from "./components/privacypolicy";
import TermsService from "./components/terms-service";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <TooltipProvider>
        <SEO />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/classes" element={<Classes />} />
            {/* Backwards-compatible alias: some places still use /login -> redirect to /signin */}
            <Route path="/login" element={<Navigate to="/signin" replace />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
             <Route path="/privacy" element={<PrivacyPolicy />} />
                     <Route path="/terms" element={<TermsService />} />
            <Route 
              path="/admin" 
              element={
                <AdminProtectedRoute>
                  <Admin />
                </AdminProtectedRoute>
              } 
            />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/payment" element={<Payment />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
