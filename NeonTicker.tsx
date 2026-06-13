import { useEffect, useRef, useState } from "react";

const HEADLINES = [
  "GPT-5 RUMORED RELEASE DATE",
  "SAM ALTMAN TESTIFIES BEFORE CONGRESS",
  "NEW OPEN SOURCE LLM SURPASSES GPT-4",
  "GOOGLE DEEPMIND ACHIEVES PROTEIN BREAKTHROUGH",
  "TESLA OPTIMUS GEN 3 REVEALED",
  "EU AI ACT ENFORCEMENT BEGINS",
  "ANTHROPIC RAISES $4B FROM AMAZON",
  "NVIDIA BLACKWELL CHIPS SHIP",
  "MICROSOFT INTEGRATES COPILOT INTO WINDOWS",
  "META RELEASES LLAMA 4 OPEN SOURCE",
  "CHINESE STARTUP UNVEILS $10K ROBOT",
  "MIT DEVELOPS NEUROMORPHIC CHIP",
];

const SEPARATOR = " /// ";
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";

export default function NeonTicker() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayChars, setDisplayChars] = useState<Array<{ char: string; settled: boolean }>>([]);
  const fullText = HEADLINES.join(SEPARATOR) + SEPARATOR;
  const animationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const chars = fullText.split("").map((c: string) => ({
      char: c,
      settled: false,
    }));
    setDisplayChars(chars);

    // Staggered character reveal
    let index = 0;
    const revealInterval = setInterval(() => {
      if (index < chars.length) {
        setDisplayChars((prev) => {
          const next = [...prev];
          // Settle current character
          if (index < next.length) {
            next[index] = { ...next[index], settled: true };
          }
          // Also settle a few ahead for smooth effect
          for (let i = index + 1; i < Math.min(index + 5, next.length); i++) {
            if (!next[i].settled && Math.random() > 0.5) {
              next[i] = { ...next[i], settled: true };
            }
          }
          return next;
        });
        index++;
      } else {
        clearInterval(revealInterval);
      }
    }, 30);

    // Random character shuffle for unsettled chars
    animationRef.current = setInterval(() => {
      setDisplayChars((prev) => {
        return prev.map((c) => {
          if (c.settled) return c;
          if (c.char === " ") return c;
          return {
            ...c,
            char: CHARS[Math.floor(Math.random() * CHARS.length)],
          };
        });
      });
    }, 50);

    return () => {
      clearInterval(revealInterval);
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, []);

  return (
    <div className="w-full bg-[#050505] border-y border-[#27272a] overflow-hidden py-3">
      <div
        ref={containerRef}
        className="flex whitespace-nowrap animate-ticker hover:cursor-pointer"
        style={{ width: "max-content" }}
      >
        {/* Duplicate for seamless loop */}
        {[0, 1].map((dup) => (
          <span key={dup} className="flex">
            {displayChars.map((c, i) => (
              <span
                key={`${dup}-${i}`}
                className={`font-display text-xs sm:text-sm tracking-[2px] uppercase transition-all duration-150 ${
                  c.settled
                    ? "text-[#00f0ff] opacity-100"
                    : "text-[#00f0ff]/40 opacity-70"
                }`}
                style={{
                  textShadow: c.settled
                    ? "0 0 10px rgba(0, 240, 255, 0.5)"
                    : "none",
                  display: "inline-block",
                  minWidth: c.char === " " ? "0.3em" : "0.6em",
                  textAlign: "center",
                }}
              >
                {c.char}
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
