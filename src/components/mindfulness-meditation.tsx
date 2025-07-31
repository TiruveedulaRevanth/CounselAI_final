
"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "./ui/button";
import { Play, Pause } from "lucide-react";

// IMPORTANT: Replace this with the actual URL of your audio file
// hosted on a service like Firebase Storage.
const audioUrl = "https://storage.googleapis.com/studioprod-exports-prod/e49a8b5b-5b8c-4a4b-97c9-5b6d5104c90d/projects/jYVLNn/assets/calm-music.mp3";


export default function MindfulnessMeditation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <Card className="w-full border-none shadow-none text-center">
      <CardHeader>
        <CardTitle>Mindful Meditation</CardTitle>
        <CardDescription>
          Take a moment to listen, breathe, and relax.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-6 pt-4 min-h-[250px]">
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
        />
        <Button onClick={togglePlayPause} size="lg" className="rounded-full h-20 w-20">
          {isPlaying ? <Pause className="h-10 w-10" /> : <Play className="h-10 w-10" />}
          <span className="sr-only">{isPlaying ? 'Pause' : 'Play'}</span>
        </Button>
        <p className="text-muted-foreground">{isPlaying ? "Playing..." : "Paused"}</p>
      </CardContent>
    </Card>
  );
}
