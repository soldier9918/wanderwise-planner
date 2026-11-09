import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import MyVideos from "./pages/MyVideos";
import Create from "./pages/Create";
import VideoEditor from "./pages/VideoEditor";
import Legal from "./pages/Legal";
import Pricing from "./pages/Pricing";
import Billing from "./pages/Billing";
import Library from "./pages/Library";
import NotFound from "./pages/NotFound";
import { ReferralCatcher } from "@/lib/account";
import { LEGAL_DOCS } from "@/lib/legal";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Sonner />
        <BrowserRouter>
          <ReferralCatcher />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<ProtectedRoute><MyVideos /></ProtectedRoute>} />
            <Route path="/my-videos" element={<ProtectedRoute><MyVideos /></ProtectedRoute>} />
            <Route path="/create" element={<ProtectedRoute><Create /></ProtectedRoute>} />
            <Route path="/from-url" element={<ProtectedRoute><Create key="url" fromUrl /></ProtectedRoute>} />
            <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
            <Route path="/video/:id" element={<ProtectedRoute><VideoEditor /></ProtectedRoute>} />
            {LEGAL_DOCS.map((doc) => (
              <Route key={doc.slug} path={`/${doc.slug}`} element={<Legal slug={doc.slug} />} />
            ))}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
