import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Pages
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import GrievanceList from "./pages/GrievanceList";
import GrievanceForm from "./pages/GrievanceForm";
import GrievanceDetail from "./pages/GrievanceDetail";
import GrievanceTrack from "./pages/GrievanceTrack";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import UserList from "./pages/UserList";
import UserDetail from "./pages/UserDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/grievances" element={<GrievanceList />} />
            <Route path="/grievances/new" element={<GrievanceForm />} />
            <Route path="/grievances/:id" element={<GrievanceDetail />} />
            <Route path="/grievances/track" element={<GrievanceTrack />} />
            <Route path="/user-list" element={<UserList />} />
            <Route path="/user/:id" element={<UserDetail />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
