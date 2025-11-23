"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const workoutLevels = [
  {
    id: "compete",
    level: "Compete",
    title: "Black Cat",
    description: "For Time:",
    exercises: [
      "25/20 Calories",
      "25 Chest To Bar Pull Ups",
      "25/20 Calories",
      "15 Ring Muscle Ups",
      "25/20 Calories",
      "25 Chest To Bar Pull Ups",
      "25/20 Calories",
    ],
    target: "14:00-16:00",
    cap: "18:00",
  },
  {
    id: "level3",
    level: "Level 3",
    title: "Black Cat",
    description: "For Time:",
    exercises: [
      "25/20 Calories",
      "20 Chest to Bar Pull Ups",
      "25/20 Calories",
      "10 Bar Muscle Ups",
      "25/20 Calories",
      "20 Chest To Bar Pull Ups",
      "25/20 Calories",
    ],
    target: "14:00-16:00",
    cap: "18:00",
  },
  {
    id: "level2",
    level: "Level 2",
    title: "Black Cat",
    description: "For Time:",
    exercises: [
      "20/15 Calories",
      "20 Pull Ups",
      "20/15 Calories",
      "15 Chest To Bar Pull Ups",
      "20/15 Calories",
      "20 Pull Ups",
      "20/15 Calories",
    ],
    target: "14:00-16:00",
    cap: "18:00",
  },
  {
    id: "level1",
    level: "Level 1",
    title: "Black Cat",
    description: "For Time:",
    exercises: [
      "20/15 Calories",
      "25 Ring Rows",
      "20/15 Calories",
      "15 Jumping Pull Ups",
      "20/15 Calories",
      "25 Ring Rows",
      "20/15 Calories",
    ],
    target: "14:00-16:00",
    cap: "18:00",
  },
];

export function WorkoutLevels() {
  return (
    <Tabs defaultValue="compete" className="w-full">
      <TabsList className="grid w-full grid-cols-4 bg-muted/50 h-auto p-1 mb-4">
        {workoutLevels.map((level) => (
          <TabsTrigger
            key={level.id}
            value={level.id}
            className="font-subheading text-xs md:text-sm font-bold tracking-wider uppercase data-[state=active]:bg-white data-[state=active]:text-black py-2"
          >
            {level.level}
          </TabsTrigger>
        ))}
      </TabsList>

      {workoutLevels.map((level) => (
        <TabsContent
          key={level.id}
          value={level.id}
          className="mt-0 focus-visible:ring-0"
        >
          <div className="bg-muted border-l-4 border-white/80 rounded-sm p-4">
            <div className="mb-3">
              <h4 className="font-heading text-lg md:text-xl uppercase tracking-wide text-foreground mb-1">
                {level.level} - {level.title}
              </h4>
              <p className="font-sans text-sm text-muted-foreground">
                {level.description}
              </p>
            </div>

            <div className="space-y-1 mb-4">
              {level.exercises.map((exercise, index) => (
                <div
                  key={index}
                  className="font-sans text-sm text-muted-foreground leading-relaxed"
                >
                  {exercise}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-white/20 space-y-1">
              <div className="font-sans text-sm text-muted-foreground">
                <span className="text-white font-semibold">Target time:</span>{" "}
                {level.target}
              </div>
              <div className="font-sans text-sm text-muted-foreground">
                <span className="text-white font-semibold">Time cap:</span>{" "}
                {level.cap}
              </div>
            </div>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
