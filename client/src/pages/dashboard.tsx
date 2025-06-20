import Topbar from "@/components/layout/topbar";
import UserProfileCard from "@/components/dashboard/user-profile-card";
import NewsPanel from "@/components/dashboard/news-panel";
import TodoPanel from "@/components/dashboard/todo-panel";
import QuickStats from "@/components/dashboard/quick-stats";
import QuickActions from "@/components/dashboard/quick-actions";

export default function Dashboard() {
  return (
    <div>
      <Topbar
        title="Dashboard"
        subtitle="Welcome back, Alex! Here's your learning overview."
      />
      
      <main className="p-6">
        <UserProfileCard />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <NewsPanel />
          </div>
          
          <div className="space-y-6">
            <TodoPanel />
            {/* <QuickStats /> */}
          </div>
        </div>
        
        <QuickActions />
      </main>
    </div>
  );
}
