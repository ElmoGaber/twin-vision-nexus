import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { VRProvider } from "@/contexts/VRContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { LicenseProvider } from "@/contexts/LicenseContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import LicenseGate from "@/components/LicenseGate";
import Index from "./pages/Index";
import VRView from "./pages/VRView";
import Alarms from "./pages/Alarms";
import Assets from "./pages/Assets";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <VRProvider>
          <AuthProvider>
            <LicenseProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<ProtectedRoute><LicenseGate><Index /></LicenseGate></ProtectedRoute>} />
                    <Route path="/vr" element={<ProtectedRoute><LicenseGate><VRView /></LicenseGate></ProtectedRoute>} />
                    <Route path="/alarms" element={<ProtectedRoute><LicenseGate><Alarms /></LicenseGate></ProtectedRoute>} />
                    <Route path="/assets" element={<ProtectedRoute><LicenseGate><Assets /></LicenseGate></ProtectedRoute>} />
                    <Route path="/analytics" element={<ProtectedRoute><LicenseGate><Analytics /></LicenseGate></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><LicenseGate><Settings /></LicenseGate></ProtectedRoute>} />
                    <Route path="/admin" element={<ProtectedRoute><LicenseGate><Admin /></LicenseGate></ProtectedRoute>} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </LicenseProvider>
          </AuthProvider>
        </VRProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
