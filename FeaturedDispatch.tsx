import { useEffect, useRef, useState } from "react";

const FEATURED_TEXT =
  "The pace of artificial intelligence development has reached an inflection point. What once seemed like science fiction is now unfolding in real-time, with breakthrough announcements arriving not by the week or day, but by the hour. From multimodal models that can reason across text, image, and video, to humanoid robots taking their first steps in real-world environments, the boundaries between human and machine capability are being redrawn at unprecedented speed.";

export default function FeaturedDispatch() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [wordOpacities, setWordOpacities] = useState<number[]>([]);
  const words = FEATURED_TEXT.split(" ");

  useEffect(() => {
    if (wordOpacities.length === 0) {
      setWordOpacities(new Array(words.length).fill(0.15));
    }

    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const containerCenter = rect.top + rect.height / 2;
      const distance = Math.abs(viewportCenter - containerCenter);
      const maxDistance = window.innerHeight * 0.6;
      const progress = Math.max(0, 1 - distance / maxDistance);

      setWordOpacities((prev) => {
        const next = [...prev];
        const focusIndex = Math.floor(progress * words.length);
        const spread = 8;

        for (let i = 0; i < words.length; i++) {
          const distFromFocus = Math.abs(i - focusIndex);
          if (distFromFocus < spread) {
            const opacity = 1 - (distFromFocus / spread) * 0.85;
            next[i] = Math.max(next[i], opacity);
          }
        }
        return next;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [words.length, wordOpacities.length]);

  return (
    <section id="featured" className="w-full py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="mb-12">
          <span className="text-[10px] font-mono-code text-[#00f0ff] uppercase tracking-[4px]">
            [ Featured Dispatch ]
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-2">
            The Inflection Point
          </h2>
        </div>

        {/* Split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src="/images/featured-cube.jpg"
              alt="AI Technology"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/30 to-transparent" />
          </div>

          {/* Text with smart focus */}
          <div ref={containerRef} className="flex flex-col justify-center">
            <p className="text-lg sm:text-xl leading-relaxed">
              {words.map((word, i) => (
                <span
                  key={i}
                  className="inline-block mr-[0.3em] transition-opacity duration-200"
                  style={{
                    opacity: wordOpacities[i] ?? 0.15,
                    color:
                      (wordOpacities[i] ?? 0) > 0.7 ? "#ffffff" : "#a1a1aa",
                  }}
                >
                  {word}
                </span>
              ))}
            </p>

            <div className="mt-8 flex items-center gap-4">
              <span className="text-[10px] font-mono-code text-[#a1a1aa] uppercase tracking-wider">
                By LUMINA Editorial
              </span>
              <span className="w-1 h-1 bg-[#27272a] rounded-full" />
              <span className="text-[10px] font-mono-code text-[#a1a1aa]">
                8 min read
              </span>
            </div>
          </div>
        </div>

        {/* Robot image strip */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 relative aspect-[3/4] overflow-hidden">
            <img
              src="/images/featured-robot.jpg"
              alt="AI Robot"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#050505] to-transparent">
              <span className="text-[10px] font-mono-code text-[#00f0ff] uppercase tracking-wider">
                [ Robotics ]
              </span>
              <p className="font-display text-sm text-white mt-1">
                The Next Generation of Humanoid Robotics
              </p>
            </div>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative aspect-video overflow-hidden group">
              <img
                src="/images/news-nodes.jpg"
                alt="Neural Network"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <span className="text-[10px] font-mono-code text-[#00f0ff] uppercase tracking-wider">
                  [ Research ]
                </span>
                <p className="font-display text-sm text-white mt-1">
                  Neural Architecture Search Breakthrough
                </p>
              </div>
            </div>

            <div className="relative aspect-video overflow-hidden group">
              <img
                src="/images/news-chip.jpg"
                alt="AI Hardware"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <span className="text-[10px] font-mono-code text-[#00f0ff] uppercase tracking-wider">
                  [ Hardware ]
                </span>
                <p className="font-display text-sm text-white mt-1">
                  Custom Silicon for AI Workloads
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
