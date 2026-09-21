import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, useNavigate } from "react-router";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardNav, { type Tab } from "@/components/dashboard/DashboardNav";
import DashboardOverviewTab from "@/components/dashboard/DashboardOverviewTab";
import DashboardAnalyticsTab from "@/components/dashboard/DashboardAnalyticsTab";
import DashboardProceduresTab from "@/components/dashboard/DashboardProceduresTab";
import DashboardBeforeAfterTab from "@/components/dashboard/DashboardBeforeAfterTab";
import DashboardTestimonialsTab from "@/components/dashboard/DashboardTestimonialsTab";
import DashboardFaqTab from "@/components/dashboard/DashboardFaqTab";
import DashboardSettingsTab from "@/components/dashboard/DashboardSettingsTab";
import DashboardMediaTab from "@/components/dashboard/DashboardMediaTab";
import HomepageCMSTab from "@/components/dashboard/HomepageCMSTab";
import SEOTab from "@/components/dashboard/SEOTab";
import ArticlesTab from "@/components/dashboard/ArticlesTab";

const VALID_TABS: Tab[] = [
  "overview",
  "analytics",
  "homepage",
  "procedures",
  "beforeAfter",
  "testimonials",
  "faq",
  "blog",
  "seo",
  "settings",
  "media",
];

function tabFromHash(hash: string): Tab | null {
  const match = hash.match(/^#\/([a-zA-Z]+)/);
  if (!match) return null;
  const candidate = match[1] as Tab;
  return VALID_TABS.includes(candidate) ? candidate : null;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>(
    () => tabFromHash(location.hash) ?? "overview",
  );

  useEffect(() => {
    const handler = () => {
      const tab = tabFromHash(window.location.hash);
      if (tab) setActiveTab(tab);
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const goToTab = (tab: Tab) => {
    setActiveTab(tab);
    if (window.location.hash !== `#/${tab}`) {
      window.history.replaceState(null, "", `#/${tab}`);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <DashboardLayout
      userName={user?.name || user?.email || "Admin"}
      onSignOut={handleSignOut}
    >
      <DashboardNav activeTab={activeTab} onTabChange={goToTab} />
      <main className="flex-1 min-w-0">
        {activeTab === "overview" && <DashboardOverviewTab onNavigate={goToTab} />}
        {activeTab === "analytics" && <DashboardAnalyticsTab />}
        {activeTab === "homepage" && <HomepageCMSTab />}
        {activeTab === "procedures" && <DashboardProceduresTab />}
        {activeTab === "beforeAfter" && <DashboardBeforeAfterTab />}
        {activeTab === "testimonials" && <DashboardTestimonialsTab />}
        {activeTab === "faq" && <DashboardFaqTab />}
        {activeTab === "blog" && <ArticlesTab />}
        {activeTab === "seo" && <SEOTab />}
        {activeTab === "settings" && <DashboardSettingsTab />}
        {activeTab === "media" && <DashboardMediaTab />}
      </main>
    </DashboardLayout>
  );
}