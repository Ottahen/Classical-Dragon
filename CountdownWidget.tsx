import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Pause, Play } from "lucide-react";
import { trpc } from "@/providers/trpc";

interface CountdownWidgetProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function CountdownWidget({ onRefresh, isRefreshing }: CountdownWidgetProps) {
  const [seconds, setSeconds] = useState(60);
  const [isPaused, setIsPaused] = useState(false);
  const [justRefreshed, setJustRefreshed] = useState(false);
  const utils = trpc.useUtils();

  const handleRefresh = useCallback(() => {
    setSeconds(60);
    setJustRefreshed(true);
    onRefresh();
    utils.news.getLatest.invalidate();
    setTimeout(() => setJustRefreshed(false), 1500);
  }, [onRefresh, utils]);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          handleRefresh();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, handleRefresh]);

  const progress = (seconds / 60) * 100;

  return (
    <div
      className={`fixed bottom-4 right-4 z-40 flex items-center gap-3 px-4 py-2.5 rounded-full glass-panel transition-all duration-300 ${
        justRefreshed ? "border-glow-cyan scale-105" : ""
      }`}
    >
      {/* Progress ring */}
      <div className="relative w-8 h-8">
        <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
          <circle
            cx="16"
            cy="16"
            r="13"
            fill="none"
            stroke="#27272a"
            strokeWidth="2"
          />
          <circle
            cx="16"
            cy="16"
            r="13"
            fill="none"
            stroke="#00f0ff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={`${progress * 0.82} 82`}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono-code text-[#00f0ff]">
          {seconds}
        </span>
      </div>

      {/* Label */}
      <span className="text-[10px] font-mono-code text-[#a1a1aa] uppercase tracking-wider hidden sm:block">
        Next Update
      </span>

      {/* Controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="p-1 rounded-full hover:bg-[#00f0ff]/10 transition-colors"
          title={isPaused ? "Resume auto-refresh" : "Pause auto-refresh"}
        >
          {isPaused ? (
            <Play className="w-3.5 h-3.5 text-[#ffaa00]" />
          ) : (
            <Pause className="w-3.5 h-3.5 text-[#a1a1aa]" />
          )}
        </button>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-1 rounded-full hover:bg-[#00f0ff]/10 transition-colors disabled:opacity-50"
          title="Refresh now"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 text-[#00f0ff] ${
              isRefreshing ? "animate-spin" : ""
            }`}
          />
        </button>
      </div>

      {/* Refresh flash indicator */}
      {justRefreshed && (
        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#00f0ff] rounded-full animate-pulse" />
      )}
    </div>
  );
}
