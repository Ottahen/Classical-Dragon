import { Clock, ExternalLink } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  source: string;
  timestamp: Date;
  readTime: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  LLM: "text-[#00f0ff] border-[#00f0ff]/30 bg-[#00f0ff]/5",
  Robotics: "text-[#ffaa00] border-[#ffaa00]/30 bg-[#ffaa00]/5",
  Research: "text-emerald-400 border-emerald-400/30 bg-emerald-400/5",
  Policy: "text-purple-400 border-purple-400/30 bg-purple-400/5",
  Funding: "text-rose-400 border-rose-400/30 bg-rose-400/5",
  Hardware: "text-amber-400 border-amber-400/30 bg-amber-400/5",
};

const IMAGES = [
  "/images/news-wireframe.jpg",
  "/images/news-chip.jpg",
  "/images/news-nodes.jpg",
  "/images/featured-cube.jpg",
  "/images/featured-robot.jpg",
];

interface NewsCardProps {
  item: NewsItem;
  index: number;
  isNew?: boolean;
}

export default function NewsCard({ item, index, isNew }: NewsCardProps) {
  const imageIndex = (index + item.title.length) % IMAGES.length;
  const categoryStyle = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.LLM;
  const timeAgo = Math.floor(
    (Date.now() - new Date(item.timestamp).getTime()) / 60000
  );

  return (
    <article
      className={`group relative bg-[#111111] border border-[#27272a] overflow-hidden transition-all duration-300 hover:bg-[#1a1a1a] hover:border-[#00f0ff]/20 ${
        isNew ? "animate-fade-in-up" : ""
      }`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={IMAGES[imageIndex]}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent" />

        {/* Category badge */}
        <span
          className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-mono-code uppercase tracking-wider border ${categoryStyle}`}
        >
          [ {item.category} ]
        </span>

        {/* New indicator */}
        {isNew && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#00f0ff] rounded-full animate-pulse" />
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display text-sm font-medium text-white leading-snug mb-2 line-clamp-2 group-hover:text-[#00f0ff] transition-colors">
          {item.title}
        </h3>
        <p className="text-xs text-[#a1a1aa] leading-relaxed mb-3 line-clamp-2">
          {item.summary}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between text-[10px] font-mono-code text-[#a1a1aa]">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeAgo}m ago
          </span>
          <span className="flex items-center gap-1">
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            {item.source}
          </span>
        </div>
      </div>
    </article>
  );
}
