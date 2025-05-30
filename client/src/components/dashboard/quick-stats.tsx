import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Target } from "lucide-react";
import { api } from "@/lib/api";
import type { TestAttempt } from "@shared/schema";

export default function QuickStats() {
  const { data: attempts } = useQuery<TestAttempt[]>({
    queryKey: ["test-attempts", 1],
    queryFn: () => api.test.getUserTestAttempts(1), // Hardcoded user ID
  });

  // Calculate stats from test attempts
  const stats = {
    testStreak: "7 days", // This would need more complex logic to calculate
    averageScore: attempts?.length
      ? Math.round(
          attempts.reduce((sum, attempt) => 
            sum + (attempt.score / attempt.totalQuestions) * 100, 0
          ) / attempts.length
        ) + "%"
      : "N/A",
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Test Streak</p>
              <p className="text-2xl font-semibold text-slate-800">{stats.testStreak}</p>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Avg. Score</p>
              <p className="text-2xl font-semibold text-slate-800">{stats.averageScore}</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
