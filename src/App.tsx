import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import Shop from "./pages/Shop";
import MyBooks from "./pages/MyBooks";
import Exclusive from "./pages/Exclusive";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import Aok from "./pages/Aok";
import UnverifiedShop from "./pages/UnverifiedShop";
import MemberShop from "./pages/MemberShop";
import Cart from "./pages/Cart";
import Membership from "./pages/Membership";
import Updates from "./pages/Updates";
import Profile from "./pages/profile";
import ComingSoon from "./pages/ComingSoon";
import PaymentSuccess from "./pages/PaymentSuccess";
import Membershipsuccess from "./pages/Membershipsuccess";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// This component waits for auth to load before showing anything
function AppContent() {
  const { loading } = useAuth();
  const location = useLocation();
  const isAdmin = location.pathname === "/scrd1478";

  // Show a full‑screen loader while auth is initializing
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Admin page has its own layout (no Navbar/Footer)
  if (isAdmin) {
    return <Admin />;
  }
  // unverified page has no headers to prevent bypassing verification by navigating to other pages
if (location.pathname === "/unverified-shop") {
  return <UnverifiedShop />;
}

  // Normal layout for all other pages
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Shop />} />
          <Route path="/my-books" element={<MyBooks />} />
          <Route path="/exclusive" element={<Exclusive />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/Aok" element={<Aok />} />
          <Route path="/unverified-shop" element={<UnverifiedShop />} />
          <Route path="/member-shop" element={<MemberShop />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/coming-soon" element={<ComingSoon />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/updates" element={<Updates />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/membership-success" element={<Membershipsuccess />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;