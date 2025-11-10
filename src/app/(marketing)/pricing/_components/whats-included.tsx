export function WhatsIncluded({ title, description }: { title: string, description: string }) {
  return (
    <div className="bg-black p-6 border-l-4 border-white">
      <h4 className="font-subheading text-lg uppercase text-white mb-3 font-bold">
        {title}
      </h4>
      <p className="font-sans text-white/70">
        {description}
      </p>
  </div>
  );
}