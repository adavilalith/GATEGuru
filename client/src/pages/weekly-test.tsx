import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Topbar from "@/components/layout/topbar";
import QuestionRenderer from "@/components/test/question-renderer";
import TestTimer from "@/components/test/test-timer";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { TestQuestion } from "@shared/schema";

export default function WeeklyTest() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [isTestCompleted, setIsTestCompleted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: questions, isLoading } = useQuery<TestQuestion[]>({
    queryKey: ["test-questions", "weekly"],
    queryFn: () => api.test.getTestQuestions("*"),
    enabled: isTestStarted,
  });

  const submitTestMutation = useMutation({
    mutationFn: (testData: { userId: number; testType: string; score: number; totalQuestions: number }) =>
      api.test.createTestAttempt(testData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test-attempts", 1] });
      toast({
        title: "Test Completed",
        description: "Your test has been submitted successfully",
      });
    },
  });

  const startTest = () => {
    setIsTestStarted(true);
    setIsTestCompleted(false);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setScore(null);
  };

  const handleAnswerChange = (answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answer,
    }));
  };

  const goToNextQuestion = () => {
    if (questions && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    if (!questions) return 0;
    
    let correctAnswers = 0;
    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const correctAnswer = question.correctAnswer;
      
      if (question.type === "MSQ") {
        // For MSQ, check if arrays match
        const userAnswerArray = Array.isArray(userAnswer) ? userAnswer.sort() : [];
        const correctAnswerArray = Array.isArray(correctAnswer) ? correctAnswer.sort() : [];
        if (JSON.stringify(userAnswerArray) === JSON.stringify(correctAnswerArray)) {
          correctAnswers++;
        }
      } else {
        // For MCQ and NAT
        if (userAnswer === correctAnswer) {
          correctAnswers++;
        }
      }
    });
    
    return correctAnswers;
  };

  const submitTest = () => {
    if (!questions) return;
    
    const calculatedScore = calculateScore();
    setScore(calculatedScore);
    setIsTestCompleted(true);
    
    submitTestMutation.mutate({
      userId: 1,
      testType: "weekly",
      score: calculatedScore,
      totalQuestions: questions.length,
    });
  };

  const onTimeUp = () => {
    submitTest();
  };

  if (!isTestStarted) {
    return (
      <div>
        <Topbar
          title="Weekly Test"
          subtitle="Comprehensive evaluation to assess your weekly learning progress"
        />
        
        <main className="p-6">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-semibold text-slate-800 mb-4">
                  Ready for your Weekly Test?
                </h2>
                <p className="text-slate-600 mb-6">
                  This comprehensive test covers the material from this week. 
                  You have 45 minutes to complete all questions.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="text-center">
                    <Badge className="bg-blue-100 text-blue-800 mb-2">MCQ</Badge>
                    <p className="text-sm text-slate-600">Multiple Choice Questions</p>
                  </div>
                  <div className="text-center">
                    <Badge className="bg-green-100 text-green-800 mb-2">MSQ</Badge>
                    <p className="text-sm text-slate-600">Multiple Select Questions</p>
                  </div>
                  <div className="text-center">
                    <Badge className="bg-purple-100 text-purple-800 mb-2">NAT</Badge>
                    <p className="text-sm text-slate-600">Numerical Answer Type</p>
                  </div>
                </div>
                
                <Button onClick={startTest} size="lg">
                  Start Weekly Test
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        <Topbar title="Weekly Test" />
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-pulse">Loading test questions...</div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (isTestCompleted) {
    const percentage = questions ? Math.round((score! / questions.length) * 100) : 0;
    
    return (
      <div>
        <Topbar title="Weekly Test" subtitle="Test completed!" />
        
        <main className="p-6">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-semibold text-slate-800 mb-4">
                  Weekly Test Completed!
                </h2>
                <div className="text-4xl font-bold text-primary mb-4">
                  {score}/{questions?.length}
                </div>
                <p className="text-xl text-slate-600 mb-6">
                  You scored {percentage}%
                </p>
                
                <div className="space-y-2">
                  <Button onClick={() => window.location.reload()} className="mr-4">
                    Take Another Test
                  </Button>
                  <Button variant="outline" onClick={() => window.history.back()}>
                    Back to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (!questions?.length) {
    return (
      <div>
        <Topbar title="Weekly Test" />
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-slate-500">No questions available for this test.</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex];

  return (
    <div>
      <Topbar
        title="Weekly Test"
        subtitle={`Question ${currentQuestionIndex + 1} of ${questions.length}`}
      />
      
      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <QuestionRenderer
                question={currentQuestion}
                currentAnswer={currentAnswer}
                onAnswerChange={handleAnswerChange}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={questions.length}
              />
              
              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </Button>
                
                <div className="space-x-2">
                  {currentQuestionIndex === questions.length - 1 ? (
                    <Button onClick={submitTest}>
                      Submit Test
                    </Button>
                  ) : (
                    <Button onClick={goToNextQuestion}>
                      Next
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <TestTimer duration={45} onTimeUp={onTimeUp} />
              
              <Card className="mt-4">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-slate-800 mb-3">Questions</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {questions.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentQuestionIndex(index)}
                        className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                          index === currentQuestionIndex
                            ? "bg-primary text-white"
                            : answers[index] !== undefined
                            ? "bg-green-100 text-green-800"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
