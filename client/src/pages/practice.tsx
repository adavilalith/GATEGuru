import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Topbar from "@/components/layout/topbar";
import QuestionRenderer from "@/components/test/question-renderer";
import TestTimer from "@/components/test/test-timer";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { TestQuestion } from "@shared/schema";
import ChatInterface from "../components/chatbot/practice-chat-interface";

// Import specific icons from lucide-react
import {
  Brain, // General Aptitude, Engineering Mathematics
  Cpu, // Operating System, Computer Organization & Architecture, Digital Logic
  Database, // Databases
  Code, // Algorithms, Programming & Data Structures, Compiler Design, Theory of Computation
  Globe, // Computer Networks
} from 'lucide-react';


// Define a type for your topic structure, including the icon
interface Topic {
  topic: string;
  testType: string;
  description: string;
  icon: React.ElementType; // Type for a React component (e.g., from lucide-react)
}

// Define your topics with their corresponding testType values and new icons
const ALL_TOPICS: Topic[] = [
  { topic: 'Operating System', testType: 'operating system', description: 'Test your knowledge on the core concepts of OS.', icon: Cpu },
  { topic: 'Algorithms', testType: 'algorithms', description: 'Challenge yourself with fundamental algorithm problems.', icon: Code },
  { topic: 'Databases', testType: 'databases', description: 'Assess your understanding of database systems and SQL.', icon: Database },
  { topic: 'Digital Logic', testType: 'digital logic', description: 'Evaluate your grasp of digital circuits and logic gates.', icon: Cpu },
  { topic: 'Compiler Design', testType: 'compiler esign', description: 'Review concepts related to compilers and language processing.', icon: Code },
  { topic: 'Computer Networks', testType: 'computer etworks', description: 'Examine your understanding of network protocols and architecture.', icon: Globe },
  { topic: 'Computer Organization & Architecture', testType: 'computer organization & architecture', description: 'Test your knowledge of computer hardware and architecture.', icon: Cpu },
  { topic: 'Programming & Data Structures', testType: 'programming & data structures', description: 'Practice your coding skills and data structure knowledge.', icon: Code },
  { topic: 'Engineering Mathematics', testType: 'engineering mathematics', description: 'Brush up on essential mathematical concepts for engineering.', icon: Brain },
  { topic: 'General Aptitude', testType: 'general aptitude', description: 'Improve your logical reasoning and quantitative aptitude.', icon: Brain },
  { topic: 'Theory of Computation', testType: 'theory of computation', description: 'Explore the theoretical foundations of computer science.', icon: Code },
];

export default function PracticeTest() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [isTestCompleted, setIsTestCompleted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [selectedTopicType, setSelectedTopicType] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: questions, isLoading } = useQuery<TestQuestion[]>({
    queryKey: ["test-questions", selectedTopicType],
    queryFn: () => api.test.getTestQuestions(selectedTopicType!),
    enabled: isTestStarted && !!selectedTopicType,
  });

  const submitTestMutation = useMutation({
    mutationFn: (testData: { userId: number; testType: string; score: number; totalQuestions: number }) =>
      api.test.createTestAttempt(testData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test-attempts", 1] });
      toast({
        title: "Practice Test Completed",
        description: "Your test has been submitted successfully",
      });
    },
  });

  const startTest = (topicType: string) => {
    setSelectedTopicType(topicType);
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
        const userAnswerArray = Array.isArray(userAnswer) ? userAnswer.sort() : [];
        const correctAnswerArray = Array.isArray(correctAnswer) ? correctAnswer.sort() : [];
        if (JSON.stringify(userAnswerArray) === JSON.stringify(correctAnswerArray)) {
          correctAnswers++;
        }
      } else {
        if (userAnswer === correctAnswer) {
          correctAnswers++;
        }
      }
    });

    return correctAnswers;
  };

  const currentCorrectAnwer =():string|string[]=>{
    if (!questions) return "";
    const question = questions[currentQuestionIndex]
    const correctAnswer = question.correctAnswer;

    if (question.type === "MSQ") {
      const correctAnswerArray = Array.isArray(correctAnswer) ? correctAnswer.sort() : [];
      return JSON.stringify(correctAnswerArray)
    } else {
      return String(correctAnswer);
    }
  }

  const submitTest = () => {
    if (!questions || !selectedTopicType) return;

    const calculatedScore = calculateScore();
    setScore(calculatedScore);
    setIsTestCompleted(true);

    submitTestMutation.mutate({
      userId: 1,
      testType: selectedTopicType,
      score: calculatedScore,
      totalQuestions: questions.length,
    });
  };

  const onTimeUp = () => {
    submitTest();
  };

  // --- Initial Test Selection View ---
  if (!isTestStarted) {
    return (
      <div>
        <Topbar
          title="Practice Tests by Topic"
          subtitle="Choose a topic to start your practice test"
        />

        <main className="p-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ALL_TOPICS.map((topic) => (
              <Card key={topic.testType} className="flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between space-x-4 pb-2"> {/* Added flex for icon positioning */}
                  <CardTitle className="capitalize text-lg">{topic.topic}</CardTitle>
                  {/* Render the icon here */}
                  <topic.icon className="w-8 h-8 text-slate-500" />
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-between">
                  <p className="text-slate-600 mb-4">{topic.description}</p>
                  <div className="flex justify-end mt-auto">
                    <Button onClick={() => startTest(topic.testType)}>
                      Start Test
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // --- Loading State for Questions ---
  if (isLoading) {
    return (
      <div>
        <Topbar title={selectedTopicType ? `${ALL_TOPICS.find(t => t.testType === selectedTopicType)?.topic} Test` : "Practice Test"} />
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

  // --- Test Completed View ---
  if (isTestCompleted) {
    const percentage = questions ? Math.round((score! / questions.length) * 100) : 0;

    return (
      <div>
        <Topbar
          title={selectedTopicType ? `${ALL_TOPICS.find(t => t.testType === selectedTopicType)?.topic} Test` : "Practice Test"}
          subtitle="Test completed!"
        />

        <main className="p-6">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-semibold text-slate-800 mb-4">
                  Test Completed!
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
                  <Button variant="outline" onClick={() => setIsTestStarted(false)}>
                    Choose Another Topic
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // --- No Questions Available ---
  if (!questions?.length) {
    return (
      <div>
        <Topbar title={selectedTopicType ? `${ALL_TOPICS.find(t => t.testType === selectedTopicType)?.topic} Test` : "Practice Test"} />
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-slate-500">No questions available for this test type. Please select another topic.</p>
                <Button onClick={() => setIsTestStarted(false)} className="mt-4">
                  Back to Topic Selection
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // --- Active Test View ---
  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex];

  return (
    <div>
      <Topbar
        title={selectedTopicType ? `${ALL_TOPICS.find(t => t.testType === selectedTopicType)?.topic} Test` : "Practice Test"}
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
              <TestTimer duration={15} onTimeUp={onTimeUp} />

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
        <ChatInterface chatId="practice_chat" question={currentQuestion} currentAnswer={currentCorrectAnwer()}/>
      </main>
    </div>
  );
}