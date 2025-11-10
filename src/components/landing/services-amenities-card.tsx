import type { ReactNode } from "react";

interface ServicesAmenitiesCardProps {
  title: string;
  content: ReactNode;
}

export function ServicesAmenitiesCard({
  title,
  content,
}: ServicesAmenitiesCardProps) {
  return (
    <div className="bg-charcoal-dark border border-white/20 hover:border-white p-6 transition-colors rounded-sm">
      <h3 className="font-subheading text-xl uppercase text-white mb-4 font-bold">
        {title}
      </h3>
      <div className="space-y-2 font-sans text-white/80 text-sm">{content}</div>
    </div>
  );
}
