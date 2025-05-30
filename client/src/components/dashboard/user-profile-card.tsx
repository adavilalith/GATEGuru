import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { getInitials, formatTimeAgo } from "@/lib/utils";
import { api } from "@/lib/api";
import type { User } from "@shared/schema";

export default function UserProfileCard() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["user", 1],
    queryFn: () => api.user.getUser(1), // Hardcoded user ID for now
  });

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="animate-pulse flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-slate-200 rounded-xl"></div>
              <div>
                <div className="h-6 bg-slate-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-48 mb-1"></div>
                <div className="h-4 bg-slate-200 rounded w-36"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <p className="text-slate-500">Failed to load user profile</p>
        </CardContent>
      </Card>
    );
  }

  const initials = getInitials(user.firstName, user.lastName);
  const fullName = `${user.firstName} ${user.lastName}`;
  const memberSince = formatTimeAgo(new Date(user.joinDate));

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-700 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl font-semibold">{initials}</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-800">{fullName}</h2>
              <p className="text-slate-600">{user.email}</p>
              {user.phone && (
                <p className="text-slate-500">{user.phone}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100">
              <CheckCircle className="w-4 h-4 mr-1" />
              Active Student
            </Badge>
            <p className="text-sm text-slate-500 mt-2">Member since {memberSince}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
