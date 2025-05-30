import { Link, useLocation } from "wouter";
import { BookOpen, Home, MessageCircle, Clock, Calendar, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      name: "AI Assistant",
      href: "/chatbot",
      icon: MessageCircle,
    },{
      name:"Practice",
      href:"/practice-test",
      icon: Pencil,
    },
    {
      name: "Daily Test",
      href: "/daily-test",
      icon: Clock,
    },
    {
      name: "Weekly Test",
      href: "/weekly-test",
      icon: Calendar,
    },

  ];

  return (
    <div className="w-64 bg-white shadow-lg border-r border-slate-200 fixed h-full z-10">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-800">GATE CSIT</h1>
            <p className="text-sm text-slate-500">Study Assistant</p>
          </div>
        </div>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href || (location === "/" && item.href === "/dashboard");
            const Icon = item.icon;
            
            return (
              <li key={item.href}>
                <Link href={item.href}>
                  <div
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium cursor-pointer",
                      isActive
                        ? "bg-blue-50 text-primary border border-blue-100"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="absolute bottom-6 left-4 right-4">
        <div className="bg-slate-100 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">AJ</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">Alex Johnson</p>
              <p className="text-xs text-slate-500">Student</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
