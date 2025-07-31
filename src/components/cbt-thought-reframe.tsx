
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

export default function CbtThoughtReframe() {
  const [step, setStep] = useState(0);
  const [negativeThought, setNegativeThought] = useState("");
  const [reframe, setReframe] = useState("");

  const handleNext = () => {
    if (step === 0 && negativeThought.trim()) {
      setStep(1);
    } else if (step === 1 && reframe.trim()) {
      setStep(2);
    }
  };

  const handleReset = () => {
    setStep(0);
    setNegativeThought("");
    setReframe("");
  };
  
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <>
            <Label htmlFor="negative-thought" className="text-lg font-semibold">
              What's the negative thought?
            </Label>
            <Textarea
              id="negative-thought"
              placeholder="e.g., 'I'll never be good enough.'"
              value={negativeThought}
              onChange={(e) => setNegativeThought(e.target.value)}
              rows={3}
            />
            <Button onClick={handleNext} disabled={!negativeThought.trim()}>
              Continue
            </Button>
          </>
        );
      case 1:
        return (
          <>
            <Label htmlFor="reframe" className="text-lg font-semibold">
              How can you reframe it?
            </Label>
            <p className="text-sm text-muted-foreground text-center -mt-2">
                Challenge the thought. Is it 100% true? What's a more balanced perspective?
            </p>
            <Textarea
              id="reframe"
              placeholder="e.g., 'I am learning and growing. I can improve with practice.'"
              value={reframe}
              onChange={(e) => setReframe(e.target.value)}
              rows={3}
            />
            <Button onClick={handleNext} disabled={!reframe.trim()}>
              Finish
            </Button>
          </>
        );
      case 2:
        return (
          <div className="text-center space-y-4">
            <h3 className="text-xl font-bold text-primary">Well Done!</h3>
             <Card className="bg-muted p-4">
                 <p className="font-semibold text-left">Original Thought:</p>
                 <p className="text-left text-muted-foreground mb-3">"{negativeThought}"</p>
                 <p className="font-semibold text-left">Your Reframe:</p>
                 <p className="text-left text-muted-foreground">"{reframe}"</p>
            </Card>
            <p className="text-muted-foreground">
              Remembering to reframe thoughts takes practice. You're doing great.
            </p>
            <Button onClick={handleReset}>Start a New Reframe</Button>
          </div>
        );
      default:
        return null;
    }
  };


  return (
    <Card className="w-full border-none shadow-none">
      <CardHeader className="text-center">
        <CardTitle>Thought Reframing</CardTitle>
        <CardDescription>
          Challenge and change negative thought patterns.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-4 pt-4 min-h-[250px] w-full max-w-md mx-auto">
        {renderStep()}
      </CardContent>
    </Card>
  );
}
