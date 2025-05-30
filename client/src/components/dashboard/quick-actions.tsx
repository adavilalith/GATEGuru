import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Calendar, MessageCircle, BarChart2 } from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      title: "Daily Test",
      description: "Quick 15-minute assessment",
      icon: Clock,
      href: "/daily-test",
      bgColor: "bg-blue-50",
      iconColor: "text-primary",
      hoverBg: "hover:bg-blue-100",
    },
    {
      title: "Weekly Test",
      description: "Comprehensive evaluation",
      icon: Calendar,
      href: "/weekly-test",
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
      hoverBg: "hover:bg-amber-100",
    },
    {
      title: "AI Assistant",
      description: "Get instant help & answers",
      icon: MessageCircle,
      href: "/chatbot",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      hoverBg: "hover:bg-green-100",
    },
    {
      title: "Progress",
      description: "Track your learning journey",
      icon: BarChart2,
      href: "/dashboard",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      hoverBg: "hover:bg-purple-100",
    },
  ];

  return (
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action) => {
        const Icon = action.icon;
        
        return (
          <Link key={action.href} href={action.href}>
            <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer group">
              <CardContent className="p-6">
                <div className={`w-12 h-12 ${action.bgColor} rounded-lg flex items-center justify-center mb-4 group-hover:${action.hoverBg} transition-colors duration-200`}>
                  <Icon className={`w-6 h-6 ${action.iconColor}`} />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">{action.title}</h3>
                <p className="text-sm text-slate-600">{action.description}</p>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
