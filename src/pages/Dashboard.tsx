import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
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

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <DashboardLayout
      userName={user?.name || user?.email || "Admin"}
      onSignOut={handleSignOut}
    >
      <DashboardNav activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 min-w-0">
        {activeTab === "overview" && <DashboardOverviewTab />}
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