import { useState, useCallback } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import Navigation from "@/components/Navigation";
import FluidIntelligenceCore from "@/components/FluidIntelligenceCore";
import NeonTicker from "@/components/NeonTicker";
import NewsCard from "@/components/NewsCard";
import CountdownWidget from "@/components/CountdownWidget";
import FeaturedDispatch from "@/sections/FeaturedDispatch";
import Footer from "@/sections/Footer";
import { MessageSquare, Sparkles, Radio } from "lucide-react";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  const { data: categories } = trpc.news.getCategories.useQuery();
  const { data: newsItems, isLoading } = trpc.news.getLatest.useQuery(
    { category: selectedCategory, limit: 18 },
    { refetchInterval: false }
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    const oldIds = new Set(newsItems?.map((item) => item.id) || []);
    setRefreshKey((prev) => prev + 1);
    setTimeout(() => {
      setIsRefreshing(false);
      // Mark new items
      if (newsItems) {
        const newItems = newsItems.filter((item) => !oldIds.has(item.id));
        setNewIds(new Set(newItems.map((item) => item.id)));
        setTimeout(() => setNewIds(new Set()), 3000);
      }
    }, 800);
  }, [newsItems]);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        <FluidIntelligenceCore />

        {/* Hero content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Radio className="w-4 h-4 text-[#00f0ff] animate-pulse" />
            <span className="text-[10px] font-mono-code text-[#00f0ff] uppercase tracking-[4px]">
              Live Intelligence Feed
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[0.95] tracking-tight mb-4">
            THE CURRENT
            <br />
            <span className="text-[#00f0ff] text-glow-cyan">STATE OF AI.</span>
          </h1>

          <p className="font-mono-code text-xs sm:text-sm text-[#a1a1aa] tracking-wider mb-8">
            Minute-by-minute intelligence.
          </p>

          <div className="flex items-center justify-center gap-4">
            <a
              href="#feed"
              className="group relative px-6 py-2.5 bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] text-xs font-mono-code uppercase tracking-wider hover:bg-[#00f0ff]/20 transition-all rounded-full overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                Explore Feed
              </span>
            </a>

            <Link
              to="/chat"
              className="group flex items-center gap-2 px-6 py-2.5 border border-[#27272a] text-[#a1a1aa] text-xs font-mono-code uppercase tracking-wider hover:border-[#00f0ff]/30 hover:text-[#00f0ff] transition-all rounded-full"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              AI Assistant
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-[9px] font-mono-code text-[#a1a1aa] uppercase tracking-wider">
            Scroll
          </span>
          <div className="w-px h-8 bg-gradient-to-b from-[#00f0ff] to-transparent" />
        </div>
      </section>

      {/* Ticker */}
      <NeonTicker />

      {/* Feed Section */}
      <section id="feed" className="w-full py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <span className="text-[10px] font-mono-code text-[#00f0ff] uppercase tracking-[4px]">
                [ Intelligence Nodes ]
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-2">
                Live Feed
              </h2>
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(undefined)}
                className={`px-3 py-1 text-[10px] font-mono-code uppercase tracking-wider border transition-all ${
                  !selectedCategory
                    ? "border-[#00f0ff] text-[#00f0ff] bg-[#00f0ff]/10"
                    : "border-[#27272a] text-[#a1a1aa] hover:border-[#00f0ff]/30 hover:text-[#00f0ff]"
                }`}
              >
                All
              </button>
              {categories?.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3 py-1 text-[10px] font-mono-code uppercase tracking-wider border transition-all ${
                    selectedCategory === cat.name
                      ? "border-[#00f0ff] text-[#00f0ff] bg-[#00f0ff]/10"
                      : "border-[#27272a] text-[#a1a1aa] hover:border-[#00f0ff]/30 hover:text-[#00f0ff]"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* News grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-[#111111] border border-[#27272a] animate-pulse"
                >
                  <div className="aspect-video bg-[#1a1a1a]" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 bg-[#1a1a1a] rounded w-3/4" />
                    <div className="h-2 bg-[#1a1a1a] rounded w-full" />
                    <div className="h-2 bg-[#1a1a1a] rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div key={refreshKey} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {newsItems?.map((item, index) => (
                <NewsCard
                  key={item.id}
                  item={{
                    ...item,
                    timestamp: new Date(item.timestamp),
                  }}
                  index={index}
                  isNew={newIds.has(item.id)}
                />
              ))}
            </div>
          )}

          {/* Load more hint */}
          <div className="mt-8 text-center">
            <span className="text-[10px] font-mono-code text-[#27272a] uppercase tracking-wider">
              Auto-refreshes every 60 seconds
            </span>
          </div>
        </div>
      </section>

      {/* Featured Dispatch */}
      <FeaturedDispatch />

      {/* Footer */}
      <Footer />

      {/* Countdown Widget */}
      <CountdownWidget onRefresh={handleRefresh} isRefreshing={isRefreshing} />
    </div>
  );
}
