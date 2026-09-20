import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  FileText,
  Image as ImageIcon,
  Star,
  HelpCircle,
  Newspaper,
} from "lucide-react";

export type Tab =
  | "overview"
  | "analytics"
  | "homepage"
  | "procedures"
  | "beforeAfter"
  | "testimonials"
  | "faq"
  | "blog"
  | "seo"
  | "settings"
  | "media";

const tabs: { key: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
  { key: "homepage", label: "Homepage", icon: Settings },
  { key: "procedures", label: "Procedures", icon: FileText },
  { key: "beforeAfter", label: "Before & After", icon: ImageIcon },
  { key: "testimonials", label: "Testimonials", icon: Star },
  { key: "faq", label: "FAQ", icon: HelpCircle },
  { key: "blog", label: "Articles", icon: Newspaper },
  { key: "seo", label: "SEO", icon: Settings },
  { key: "settings", label: "Settings", icon: Settings },
  { key: "media", label: "Media", icon: ImageIcon },
];

export default function DashboardNav({
  activeTab,
  onTabChange,
}: {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}) {
  return (
    <nav className="lg:w-56 shrink-0">
      <div className="glass-card rounded-2xl p-2 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
              activeTab === tab.key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-white/40"
            )}
          >
            <tab.icon className="h-4 w-4 shrink-0" />
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}