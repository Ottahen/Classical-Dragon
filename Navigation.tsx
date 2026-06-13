import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { Zap, Menu, X, MessageSquare, LogIn, LogOut, User } from "lucide-react";

export default function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHome = location.pathname === "/";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#050505]/90 backdrop-blur-md border-b border-[#27272a]"
          : "bg-transparent"
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Zap className="w-5 h-5 text-[#00f0ff] group-hover:animate-pulse" />
            <span className="font-display text-lg font-semibold tracking-tight text-white">
              LUMINA
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {isHome && (
              <>
                <a
                  href="#feed"
                  className="text-xs font-mono-code text-[#a1a1aa] hover:text-[#00f0ff] transition-colors uppercase tracking-wider"
                >
                  Feed
                </a>
                <a
                  href="#featured"
                  className="text-xs font-mono-code text-[#a1a1aa] hover:text-[#00f0ff] transition-colors uppercase tracking-wider"
                >
                  Featured
                </a>
              </>
            )}
            <Link
              to="/chat"
              className="flex items-center gap-1.5 text-xs font-mono-code text-[#a1a1aa] hover:text-[#00f0ff] transition-colors uppercase tracking-wider"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              AI Chat
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono-code text-[#a1a1aa] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  {user?.name}
                </span>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 text-xs font-mono-code text-[#a1a1aa] hover:text-red-400 transition-colors uppercase tracking-wider"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Exit
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-mono-code bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 hover:bg-[#00f0ff]/20 transition-all rounded-full"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white p-1"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#050505]/95 backdrop-blur-md border-t border-[#27272a] px-4 py-4 space-y-3">
          {isHome && (
            <>
              <a
                href="#feed"
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-mono-code text-[#a1a1aa] hover:text-[#00f0ff] transition-colors"
              >
                Feed
              </a>
              <a
                href="#featured"
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-mono-code text-[#a1a1aa] hover:text-[#00f0ff] transition-colors"
              >
                Featured
              </a>
            </>
          )}
          <Link
            to="/chat"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 text-sm font-mono-code text-[#a1a1aa] hover:text-[#00f0ff] transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            AI Chat
          </Link>
          {isAuthenticated ? (
            <div className="space-y-2 pt-2 border-t border-[#27272a]">
              <span className="block text-sm font-mono-code text-[#a1a1aa]">
                {user?.name}
              </span>
              <button
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                }}
                className="flex items-center gap-2 text-sm font-mono-code text-red-400"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-mono-code text-[#00f0ff] pt-2 border-t border-[#27272a]"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
