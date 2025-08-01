
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "./ui/button";

export default function BreathingExercise() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [instruction, setInstruction] = useState("Press Start");
  const cycle = [
    { instruction: "Breathe in...", duration: 4000 },
    { instruction: "Hold", duration: 7000 },
    { instruction: "Breathe out...", duration: 8000 },
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAnimating) {
      let currentStep = 0;
      const runCycle = () => {
        setInstruction(cycle[currentStep].instruction);
        timer = setTimeout(() => {
          currentStep = (currentStep + 1) % cycle.length;
          runCycle();
        }, cycle[currentStep].duration);
      };
      runCycle();
    } else {
      setInstruction("Press Start");
    }
    return () => clearTimeout(timer);
  }, [isAnimating, cycle]);

  return (
    <Card className="w-full border-none shadow-none">
      <CardHeader className="text-center">
        <CardTitle>4-7-8 Breathing</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-8 pt-4">
        <div className="relative flex h-48 w-48 items-center justify-center">
          <div
            className={`absolute h-full w-full rounded-full bg-primary/20 transition-transform ease-in-out duration-[4000ms] ${
              isAnimating && instruction === "Breathe in..."
                ? "scale-100"
                : "scale-50"
            }`}
          />
          <div
            className={`absolute h-3/4 w-3/4 rounded-full bg-primary/40 transition-transform ease-in-out duration-[4000ms] ${
              isAnimating && instruction === "Breathe in..."
                ? "scale-100"
                : "scale-50"
            }`}
          />
          <div
            className={`absolute h-1/2 w-1/2 rounded-full bg-primary transition-transform ease-in-out duration-[4000ms] ${
              isAnimating && instruction === "Breathe in..."
                ? "scale-100"
                : "scale-50"
            }`}
          />
        </div>
        <p className="text-2xl font-semibold text-center h-8">
          {instruction}
        </p>
        <Button onClick={() => setIsAnimating(!isAnimating)}>
          {isAnimating ? "Stop" : "Start"}
        </Button>
      </CardContent>
    </Card>
  );
}
