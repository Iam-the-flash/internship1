import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import GamesLibrary from "./pages/GamesLibrary";
import About from "./pages/About";
import Progress from "./pages/Progress";
import MathRunnerPage from "./pages/MathRunnerPage";
import PhysicsJumpPage from "./pages/PhysicsJumpPage";
import FormulaDropPage from "./pages/FormulaDropPage";
import LogicBuilderPage from "./pages/LogicBuilderPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/games" element={<GamesLibrary />} />
          <Route path="/about" element={<About />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/game/math-runner" element={<MathRunnerPage />} />
          <Route path="/game/physics-jump" element={<PhysicsJumpPage />} />
          <Route path="/game/formula-drop" element={<FormulaDropPage />} />
          <Route path="/game/logic-builder" element={<LogicBuilderPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
