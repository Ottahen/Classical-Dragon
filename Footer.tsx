import { Zap, Github, Twitter, Rss, Mail } from "lucide-react";
import { Link } from "react-router";

const FOOTER_LINKS = {
  categories: [
    { label: "LLM", href: "#feed" },
    { label: "Robotics", href: "#feed" },
    { label: "Research", href: "#feed" },
    { label: "Policy", href: "#feed" },
    { label: "Funding", href: "#feed" },
    { label: "Hardware", href: "#feed" },
  ],
  company: [
    { label: "About", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
  ],
  social: [
    { label: "GitHub", icon: Github, href: "#" },
    { label: "Twitter", icon: Twitter, href: "#" },
    { label: "RSS Feed", icon: Rss, href: "#" },
    { label: "Newsletter", icon: Mail, href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#27272a] bg-[#050505] relative overflow-hidden">
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span className="font-display text-[20vw] font-bold text-[#111111] tracking-tighter whitespace-nowrap">
          LUMINA
        </span>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-[#00f0ff]" />
              <span className="font-display text-lg font-semibold text-white">
                LUMINA
              </span>
            </Link>
            <p className="text-xs text-[#a1a1aa] leading-relaxed max-w-[200px]">
              Minute-by-minute AI intelligence. Tracking the pulse of artificial
              intelligence development worldwide.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-[10px] font-mono-code text-[#00f0ff] uppercase tracking-[2px] mb-4">
              Categories
            </h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.categories.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-xs text-[#a1a1aa] hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[10px] font-mono-code text-[#00f0ff] uppercase tracking-[2px] mb-4">
              Company
            </h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-xs text-[#a1a1aa] hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-[10px] font-mono-code text-[#00f0ff] uppercase tracking-[2px] mb-4">
              Connect
            </h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.social.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="flex items-center gap-2 text-xs text-[#a1a1aa] hover:text-[#00f0ff] transition-colors"
                  >
                    <link.icon className="w-3.5 h-3.5" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[#27272a] flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[10px] font-mono-code text-[#a1a1aa]">
            &copy; {new Date().getFullYear()} LUMINA. All intelligence reserved.
          </span>
          <span className="text-[10px] font-mono-code text-[#27272a]">
            Updated every 60 seconds
          </span>
        </div>
      </div>
    </footer>
  );
}
