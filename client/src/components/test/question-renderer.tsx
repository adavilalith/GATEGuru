import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { TestQuestion } from "@shared/schema";

interface QuestionRendererProps {
  question: TestQuestion;
  currentAnswer: any;
  onAnswerChange: (answer: any) => void;
  questionNumber: number;
  totalQuestions: number;
}

export default function QuestionRenderer({
  question,
  currentAnswer,
  onAnswerChange,
  questionNumber,
  totalQuestions,
}: QuestionRendererProps) {
  const getQuestionTypeBadge = () => {
    const badges = {
      MCQ: { label: "MCQ", className: "bg-blue-100 text-blue-800" },
      MSQ: { label: "MSQ", className: "bg-green-100 text-green-800" },
      NAT: { label: "NAT", className: "bg-purple-100 text-purple-800" },
    };
    const badge = badges[question.type as keyof typeof badges];
    return (
      <Badge className={badge.className}>
      {/* <Badge className={"bg-blue-100 text-blue-800"}> */}
        {badge.label}
        {/* {"MCQ"} */}
      </Badge>
    );
  };

  const renderMCQ = () => {
    const options = question.options as string[];
    console.log(question)

    return (
      <RadioGroup
        value={currentAnswer || ""}
        onValueChange={onAnswerChange}
        className="space-y-3"
      >
        {options.map((option, index) => (
          <div key={index} className="flex items-center space-x-3">
            <RadioGroupItem value={option} id={`option-${index}`} />
            <Label htmlFor={`option-${index}`} className="cursor-pointer">
              {option}
            </Label>
          </div>
        ))}
      </RadioGroup>
    );
  };

  const renderMSQ = () => {
    const options = question.options as string[];
    const selectedAnswers = currentAnswer || [];

    const handleMSQChange = (option: string, checked: boolean) => {
      if (checked) {
        onAnswerChange([...selectedAnswers, option]);
      } else {
        onAnswerChange(selectedAnswers.filter((answer: string) => answer !== option));
      }
    };

    return (
      <div className="space-y-3">
        {options.map((option, index) => (
          <div key={index} className="flex items-center space-x-3">
            <Checkbox
              id={`msq-option-${index}`}
              checked={selectedAnswers.includes(option)}
              onCheckedChange={(checked) => handleMSQChange(option, checked as boolean)}
            />
            <Label htmlFor={`msq-option-${index}`} className="cursor-pointer">
              {option}
            </Label>
          </div>
        ))}
      </div>
    );
  };

  const renderNAT = () => {
    return (
      <Input
        type="number"
        placeholder="Enter your answer"
        value={currentAnswer || ""}
        onChange={(e) => onAnswerChange(e.target.value)}
        className="w-full"
      />
    );
  };

  const renderQuestion = () => {
    switch (question.type) {
      case "MCQ":
        return renderMCQ();
      case "MSQ":
        return renderMSQ();
      case "NAT":
        return renderNAT();
      default:
        return <p>Unknown question type</p>;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-slate-500">
              Question {questionNumber} of {totalQuestions}
            </span>
            {getQuestionTypeBadge()}
          </div>
          <h3 className="text-lg font-medium text-slate-800 mb-4">
            {question.question}
          </h3>
        </div>
        
        {renderQuestion()}
        
        {question.type === "msq" && (
          <p className="text-sm text-slate-500 mt-4">
            Select all correct answers
          </p>
        )}
      </CardContent>
    </Card>
  );
}
