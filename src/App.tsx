// file: App.tsx

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Gigs from "./pages/Gigs";
import NotFound from "./pages/NotFound";
import SampleEssay from "./pages/Sampleessay";
import AdminUpload from './components/AdminUpload';
import AdminDashboard from './components/AdminDashboard';
import AdminTopics from './components/AdminTopics';
import AdminCategories from './components/AdminCategories'; // <<<<<<< ADD THIS
import EssaysByTopic from './pages/EssaysByTopic';
import AllTopics from './pages/alltopic';
import AllEssaysPage from './pages/AllEssaysPage';
import EssaysByCategoryPage from './pages/EssaysByCategoryPage'; // <<<< THÊM IMPORT MỚI
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/gigs" element={<Gigs />} />
          <Route path="/sampleessay" element={<SampleEssay />} />
          <Route path="/admin-upload" element={<AdminUpload />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin-topics" element={<AdminTopics />} />
          <Route path="/admin-categories" element={<AdminCategories />} /> {/* <<<<<<< ADD THIS */}
          <Route path="/sampleessay/:id" element={<SampleEssay />} />
          <Route path="/topic/:topicId" element={<EssaysByTopic />} />
          <Route path="/alltopic" element={<AllTopics />} />
          <Route path="/essays" element={<AllEssaysPage />} />
          <Route path="/category/:categoryId" element={<EssaysByCategoryPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;