"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Coach {
  name: string;
  credentials: string;
  image: string;
  bio: string;
}

export function CoachCard({ coach }: { coach: Coach }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if bio needs expand button (more than 12 lines worth of text)
  const bioLines = coach.bio.split('\n');
  const needsExpand = bioLines.length > 12 || coach.bio.length > 600;

  return (
    <div className="bg-card rounded-lg border hover:shadow-lg transition-shadow overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        {/* Photo - top on mobile, left on desktop */}
        <div className="relative w-full lg:w-80 h-64 lg:h-96 flex-shrink-0">
          <Image
            src={coach.image}
            alt={coach.name}
            fill
            className="object-cover object-top lg:object-center"
          />
        </div>

        {/* Content - bottom on mobile, right on desktop */}
        <div className="flex-1 p-6 flex flex-col">
          <div className="mb-4">
            <h3 className="font-heading text-2xl font-bold uppercase mb-2">
              {coach.name}
            </h3>
            <p className="text-sm text-primary font-semibold">
              {coach.credentials}
            </p>
          </div>

          <div className="flex-1">
            <p
              className={`text-sm text-muted-foreground leading-relaxed whitespace-pre-line ${
                !isExpanded && needsExpand ? "line-clamp-[12]" : ""
              }`}
            >
              {coach.bio}
            </p>
          </div>

          {needsExpand && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-4 text-sm text-primary hover:text-primary/80 font-semibold flex items-center gap-1 transition-colors self-start"
            >
              {isExpanded ? (
                <>
                  Show Less <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  Read More <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
