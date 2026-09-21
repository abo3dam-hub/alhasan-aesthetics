import { cn } from "@/lib/utils";
import { useAdminText } from "@/hooks/use-admin-text";
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  Home,
  Images,
  Stethoscope,
  HelpCircle,
  Newspaper,
  SearchCheck,
  MessageSquareQuote,
  Image as ImageIcon,
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

type NavIcon = typeof LayoutDashboard;

type GroupKey =
  | "overview"
  | "content"
  | "homepage"
  | "insights"
  | "media"
  | "settings";

const navGroups: { group: GroupKey; items: { key: Tab; icon: NavIcon }[] }[] = [
  { group: "overview", items: [{ key: "overview", icon: LayoutDashboard }] },
  {
    group: "content",
    items: [
      { key: "procedures", icon: Stethoscope },
      { key: "beforeAfter", icon: Images },
      { key: "testimonials", icon: MessageSquareQuote },
      { key: "faq", icon: HelpCircle },
      { key: "blog", icon: Newspaper },
    ],
  },
  { group: "homepage", items: [{ key: "homepage", icon: Home }] },
  { group: "insights", items: [{ key: "analytics", icon: BarChart3 }] },
  { group: "media", items: [{ key: "media", icon: ImageIcon }] },
  {
    group: "settings",
    items: [
      { key: "seo", icon: SearchCheck },
      { key: "settings", icon: Settings },
    ],
  },
];

const allTabs = navGroups.flatMap((g) => g.items);

export default function DashboardNav({
  activeTab,
  onTabChange,
}: {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}) {
  const admin = useAdminText();

  const renderItem = (item: { key: Tab; icon: NavIcon }) => {
    const Icon = item.icon;
    return (
      <button
        key={item.key}
        onClick={() => onTabChange(item.key)}
        aria-current={activeTab === item.key ? "page" : undefined}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
          activeTab === item.key
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-white/40"
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {admin.nav[item.key]}
      </button>
    );
  };

  return (
    <nav className="lg:w-56 shrink-0">
      {/* Mobile / tablet: horizontal strip */}
      <div className="lg:hidden">
        <div className="glass-card rounded-2xl p-2 flex gap-1 overflow-x-auto">
          {allTabs.map(renderItem)}
        </div>
      </div>

      {/* Desktop: grouped navigation */}
      <div className="hidden lg:block">
        <div className="glass-card rounded-2xl p-3 space-y-4">
          {navGroups.map((group) => (
            <div key={group.group}>
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70">
                {admin.groups[group.group]}
              </p>
              <div className="flex flex-col gap-1">
                {group.items.map(renderItem)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}