import { Link } from "react-router";
import { ArrowLeft, Zap } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
      <div className="text-center">
        <Zap className="w-12 h-12 text-[#00f0ff] mx-auto mb-6 opacity-30" />
        <h1 className="font-display text-6xl font-bold text-white mb-2">
          404
        </h1>
        <p className="text-sm text-[#a1a1aa] font-mono-code mb-8 uppercase tracking-wider">
          Signal Lost
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] text-xs font-mono-code uppercase tracking-wider hover:bg-[#00f0ff]/20 transition-all rounded-full"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Return to LUMINA
        </Link>
      </div>
    </div>
  );
}
