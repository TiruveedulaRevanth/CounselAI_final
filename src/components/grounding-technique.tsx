
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "./ui/button";

const steps = [
  {
    title: "5 Things You Can See",
    description: "Look around you and name five things you can see. Notice the details of each object.",
  },
  {
    title: "4 Things You Can Touch",
    description: "Bring your awareness to four things you can feel. It could be your clothes, a table, or the floor beneath you.",
  },
  {
    title: "3 Things You Can Hear",
    description: "Listen carefully and identify three sounds. It could be distant traffic, the hum of a computer, or your own breathing.",
  },
  {
    title: "2 Things You Can Smell",
    description: "Notice two smells in your environment. Maybe it's coffee, soap, or the scent of the room itself.",
  },
  {
    title: "1 Thing You Can Taste",
    description: "Focus on one thing you can taste. You could take a sip of water or simply notice the taste in your mouth.",
  },
  {
    title: "Complete",
    description: "You've completed the 5-4-3-2-1 grounding exercise. Take a deep breath.",
  },
];

export default function GroundingTechnique() {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
  };

  const isCompleted = currentStep === steps.length - 1;

  return (
    <Card className="w-full border-none shadow-none text-center">
      <CardHeader>
        <CardTitle>5-4-3-2-1 Grounding</CardTitle>
        <CardDescription>
          A simple technique to anchor you in the present moment.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-6 pt-4 min-h-[250px]">
        <div className="flex-1 flex flex-col justify-center">
            <h3 className="text-2xl font-bold text-primary mb-2">
                {steps[currentStep].title}
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
                {steps[currentStep].description}
            </p>
        </div>
        <div className="flex gap-4">
            {isCompleted ? (
                <Button onClick={handleReset}>Start Over</Button>
            ) : (
                <Button onClick={handleNext}>Next</Button>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
