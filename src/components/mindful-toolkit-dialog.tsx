
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BreathingExercise from "./breathing-exercise";
import GroundingTechnique from "./grounding-technique";
import MindfulnessMeditation from "./mindfulness-meditation";
import CbtThoughtReframe from "./cbt-thought-reframe";

interface MindfulToolkitDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function MindfulToolkitDialog({
  isOpen,
  onOpenChange,
}: MindfulToolkitDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Mindful Toolkit</DialogTitle>
          <DialogDescription>
            A collection of tools to help you find calm and clarity.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="breathing" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="breathing">Breathing</TabsTrigger>
            <TabsTrigger value="grounding">Grounding</TabsTrigger>
            <TabsTrigger value="meditation">Meditation</TabsTrigger>
            <TabsTrigger value="cbt">CBT Reframe</TabsTrigger>
          </TabsList>
          <TabsContent value="breathing">
            <BreathingExercise />
          </TabsContent>
          <TabsContent value="grounding">
            <GroundingTechnique />
          </TabsContent>
          <TabsContent value="meditation">
            <MindfulnessMeditation />
          </TabsContent>
          <TabsContent value="cbt">
            <CbtThoughtReframe />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
