import { Toaster as Sonner } from "@/components/ui/sonner";
import { ConfirmDialogHost } from "@/components/ConfirmDialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import RouteSeo from "@/components/RouteSeo";
import { AuthProvider } from "@/hooks/useAuth";
import Autopilot from "@/pages/Autopilot";
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
import Series from "./pages/Series";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import FeatureLanding from "./pages/FeatureLanding";
import Guides from "./pages/Guides";
import GuideArticle from "./pages/GuideArticle";
import { GUIDES } from "@/lib/guides";
import { FEATURE_PAGES } from "@/lib/featurePages";
import { ReferralCatcher } from "@/lib/account";
import { LEGAL_DOCS } from "@/lib/legal";

import { queryClient } from "@/lib/queryClient";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Sonner />
        <ConfirmDialogHost />
        <BrowserRouter>
          <ReferralCatcher />
          <ScrollToTop />
          <RouteSeo />
          <Routes>
            <Route path="/" element={<Landing />} />
            {FEATURE_PAGES.map((p) => <Route key={p.slug} path={`/${p.slug}`} element={<FeatureLanding page={p} />} />)}
            <Route path="/guides" element={<Guides />} />
            {GUIDES.map((g) => <Route key={g.slug} path={`/guides/${g.slug}`} element={<GuideArticle guide={g} />} />)}
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<ProtectedRoute><MyVideos /></ProtectedRoute>} />
            <Route path="/my-videos" element={<ProtectedRoute><MyVideos /></ProtectedRoute>} />
            <Route path="/create" element={<ProtectedRoute><Create /></ProtectedRoute>} />
            <Route path="/from-url" element={<ProtectedRoute><Create key="url" fromUrl /></ProtectedRoute>} />
            <Route path="/series" element={<ProtectedRoute><Series /></ProtectedRoute>} />
            <Route path="/autopilot" element={<ProtectedRoute><Autopilot /></ProtectedRoute>} />
            <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
            <Route path="/video/:id" element={<ProtectedRoute><VideoEditor /></ProtectedRoute>} />
            <Route path="/admin-kb20" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
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
