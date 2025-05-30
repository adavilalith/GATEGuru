import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface TestTimerProps {
  duration: number; // in minutes
  onTimeUp: () => void;
}

export default function TestTimer({ duration, onTimeUp }: TestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration * 60); // Convert to seconds

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const isUrgent = timeLeft < 300; // Less than 5 minutes

  return (
    <Card className={`${isUrgent ? "border-red-200 bg-red-50" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-center space-x-2">
          <Clock className={`w-5 h-5 ${isUrgent ? "text-red-500" : "text-slate-600"}`} />
          <span className={`text-lg font-mono font-semibold ${isUrgent ? "text-red-600" : "text-slate-800"}`}>
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
        </div>
        {isUrgent && (
          <p className="text-center text-red-600 text-sm mt-2">
            Time running out!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
