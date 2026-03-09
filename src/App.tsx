import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MathPopGame from "./pages/MathPopGame";
import GravityLabGame from "./pages/GravityLabGame";
import NumberRushGame from "./pages/NumberRushGame";
import BalanceScaleGame from "./pages/BalanceScaleGame";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/game/math-pop" element={<MathPopGame />} />
          <Route path="/game/gravity-lab" element={<GravityLabGame />} />
          <Route path="/game/number-rush" element={<NumberRushGame />} />
          <Route path="/game/balance-scale" element={<BalanceScaleGame />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
