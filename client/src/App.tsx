import { Switch, Route, useLocation } from "wouter"; // Import useLocation
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Chatbot from "@/pages/chatbot";
import DailyTest from "@/pages/daily-test";
import WeeklyTest from "@/pages/weekly-test";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/layout/sidebar";
import PracticeTest from "./pages/practice";
import AuthPage from "./pages/auth-page";

function Router() {
  const [location] = useLocation(); 

  const shouldRenderSidebar = location !== "/";

  return (
    <div className="min-h-screen flex bg-slate-50">
      {shouldRenderSidebar && <Sidebar />}

      <div className={`flex-1 ${shouldRenderSidebar ? "ml-64" : ""}`}>
        <Switch>
          <Route path="/" component={AuthPage} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/chatbot" component={Chatbot} />
          <Route path="/practice-test" component={PracticeTest} />
          <Route path="/daily-test" component={DailyTest} />
          <Route path="/weekly-test" component={WeeklyTest} />
          <Route path="/:rest*" component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;