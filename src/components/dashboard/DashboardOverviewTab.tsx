import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useAdminText } from "@/hooks/use-admin-text";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation, useConvex } from "convex/react";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  ArrowUpDown,
  BarChart3,
  HelpCircle,
  Home,
  Image as ImageIcon,
  Images,
  LayoutDashboard,
  MessageSquareQuote,
  Newspaper,
  SearchCheck,
  Settings,
  Stethoscope,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tab } from "./DashboardNav";
import { ConfirmDialog } from "./ConfirmDialog";

type QuickLink = { tab: Tab; icon: typeof LayoutDashboard };

const quickLinks: QuickLink[] = [
  { tab: "procedures", icon: Stethoscope },
  { tab: "beforeAfter", icon: Images },
  { tab: "testimonials", icon: MessageSquareQuote },
  { tab: "faq", icon: HelpCircle },
  { tab: "blog", icon: Newspaper },
  { tab: "homepage", icon: Home },
  { tab: "analytics", icon: BarChart3 },
  { tab: "media", icon: ImageIcon },
  { tab: "seo", icon: SearchCheck },
  { tab: "settings", icon: Settings },
];

interface PendingConfirm {
  title: string;
  message: string;
  confirmLabel: string;
  action: () => Promise<void>;
}

export default function DashboardOverviewTab({
  onNavigate,
}: {
  onNavigate: (tab: Tab) => void;
}) {
  const admin = useAdminText();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const seedData = useMutation(api.seed.seedAll);
  const seedProcedures = useMutation(api.seed.seedProcedures);
  const seedHomepage = useMutation(api.seed.seedHomepageSettings);
  const migrateStructure = useMutation(api.migration.migrateProcedureStructure);

  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null);
  const [confirmRunning, setConfirmRunning] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const migration = admin.overview;
  const convex = useConvex();
  const [migrationStatus, setMigrationStatus] = useState<{
    legacyRecords: { slug: string; isActive: boolean; supersededBy?: string[] }[];
    subProcedures: { titleAr: string; slug: string; isActive: boolean; parentSlug?: string }[];
    newProceduresCount: number;
    oldCombinedStillActive: boolean;
  } | null>(null);
  const [migrationStatusError, setMigrationStatusError] = useState(false);

  const checkMigrationStatus = useCallback(async () => {
    try {
      const status = (await convex.query(api.migration.getMigrationStatus)) as {
        legacyRecords: { slug: string; isActive: boolean; supersededBy?: string[] }[];
        subProcedures: { titleAr: string; slug: string; isActive: boolean; parentSlug?: string }[];
        newProceduresCount: number;
        oldCombinedStillActive: boolean;
      };
      setMigrationStatus(status);
      setMigrationStatusError(false);
    } catch (e) {
      console.warn("[migration] Status query failed (backend not deployed yet?):", e);
      setMigrationStatus(null);
      setMigrationStatusError(true);
    }
  }, [convex]);

  const procedures = useQuery(api.procedures.list);
  const testimonials = useQuery(api.testimonials.list);
  const faqs = useQuery(api.faq.list);
  const siteSettings = useQuery(api.siteSettings.list);
  const beforeAfterCases = useQuery(api.beforeAfter.list);
  const mediaItems = useQuery(api.media.list);

  const totalProcedures = procedures?.length ?? 0;
  const totalTestimonials = testimonials?.length ?? 0;
  const totalFaqs = faqs?.length ?? 0;
  const totalSiteSettings = siteSettings?.length ?? 0;
  const totalBeforeAfter = beforeAfterCases?.length ?? 0;
  const totalMedia = mediaItems?.length ?? 0;

  const stats = [
    { label: admin.overview.statProcedures, value: totalProcedures, icon: Stethoscope, color: "text-blue-500 bg-blue-50" },
    { label: admin.overview.statTestimonials, value: totalTestimonials, icon: MessageSquareQuote, color: "text-amber-500 bg-amber-50" },
    { label: admin.overview.statFaq, value: totalFaqs, icon: HelpCircle, color: "text-green-500 bg-green-50" },
    { label: admin.overview.statMedia, value: totalMedia, icon: ImageIcon, color: "text-purple-500 bg-purple-50" },
  ];

  const healthRows = [
    { label: admin.health.siteSettings, count: totalSiteSettings, tab: "settings" as Tab },
    { label: admin.nav.procedures, count: totalProcedures, tab: "procedures" as Tab },
    { label: admin.nav.beforeAfter, count: totalBeforeAfter, tab: "beforeAfter" as Tab },
    { label: admin.nav.testimonials, count: totalTestimonials, tab: "testimonials" as Tab },
    { label: admin.nav.faq, count: totalFaqs, tab: "faq" as Tab },
    { label: admin.nav.media, count: totalMedia, tab: "media" as Tab },
  ];

  const runSeed = async (fn: () => Promise<unknown>, successMsg: string, errorMsg: string) => {
    setSeeding(true);
    try {
      await fn();
      toast.success(successMsg);
    } catch {
      toast.error(errorMsg);
    } finally {
      setSeeding(false);
    }
  };

  const runMigration = async () => {
    setSeeding(true);
    try {
      await migrateStructure();
      toast.success(migration.migrationDone);
      await checkMigrationStatus();
    } catch (e) {
      toast.error(migration.migrationFailed);
      console.error(e);
    } finally {
      setSeeding(false);
    }
  };

  const askConfirm = (config: PendingConfirm) => setPendingConfirm(config);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{admin.welcomeTitle}</h2>
        <p className="text-sm text-muted-foreground mt-1">{admin.welcomeSubtitle}</p>
      </div>

      {!isAdmin && (
        <Card className="border-border/60 bg-amber-50/50">
          <CardContent className="p-5">
            <p className="text-sm text-amber-800">{admin.overview.nonAdminWarning}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/60">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center", stat.color)}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content health */}
      <Card className="border-border/60">
        <CardContent className="p-5">
          <h3 className="font-medium text-foreground">{admin.health.title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{admin.health.hint}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {healthRows.map((item) => (
              <button
                key={item.tab}
                onClick={() => onNavigate(item.tab)}
                className="flex items-center justify-between p-3 rounded-lg border border-border/40 text-start hover:bg-white/40 transition-colors group"
              >
                <span className="text-sm text-muted-foreground group-hover:text-foreground">
                  {item.label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {admin.health.contentCount.replace("{count}", String(item.count))}
                  </span>
                  <span
                    className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full",
                      item.count > 0
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    )}
                  >
                    {item.count > 0 ? admin.health.ok : admin.health.empty}
                  </span>
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">{admin.health.viewTabs}</p>
        </CardContent>
      </Card>

      {/* Quick links */}
      <Card className="border-border/60">
        <CardContent className="p-5">
          <h3 className="font-medium text-foreground mb-1">{admin.overview.quickLinksTitle}</h3>
          <p className="text-sm text-muted-foreground mb-4">{admin.overview.goTo}</p>
          <div className="flex flex-wrap gap-2">
            {quickLinks.map((link) => {
              const LinkIcon = link.icon;
              return (
                <Button
                  key={link.tab}
                  size="sm"
                  variant="outline"
                  onClick={() => onNavigate(link.tab)}
                  className="gap-2"
                >
                  <LinkIcon className="h-4 w-4" />
                  {admin.nav[link.tab]}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Advanced tools (collapsed) */}
      <Card className="border-border/60">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <h3 className="font-medium text-foreground">{admin.advancedTitle}</h3>
              <p className="text-sm text-muted-foreground">{admin.advancedHint}</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowAdvanced((s) => !s)}
              className="gap-2"
            >
              {showAdvanced ? admin.lessDetails : admin.moreDetails}
              {showAdvanced ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>

          {showAdvanced && (
            <div className="mt-5 space-y-4">
              {/* Migrate Procedure Structure */}
              <Card className="border-border/60 ring-2 ring-primary/10">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <ArrowUpDown className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{migration.migration}</p>
                        <p className="text-sm text-muted-foreground">{migration.migrationDesc}</p>
                        {migrationStatus && (
                          <div className="mt-2 flex flex-wrap gap-2 text-xs">
                            <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">
                              {migrationStatus.newProceduresCount} {migration.migrationNew}
                            </span>
                            <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                              {migrationStatus.subProcedures.length} {migration.migrationSub}
                            </span>
                            <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                              {migrationStatus.legacyRecords.length} {migration.migrationLegacy}
                            </span>
                            {migrationStatus.oldCombinedStillActive === true && (
                              <span className="px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-100">
                                {migration.migrationAlert}
                              </span>
                            )}
                          </div>
                        )}
                        {migrationStatusError && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            {migration.migrationStatusUnavailable}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      disabled={seeding}
                      onClick={() =>
                        askConfirm({
                          title: migration.migration,
                          message: admin.confirm.migrateConfirm,
                          confirmLabel: migration.runMigration,
                          action: runMigration,
                        })
                      }
                      className="bg-primary text-primary-foreground shrink-0"
                    >
                      {seeding ? migration.migrating : migration.runMigration}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={checkMigrationStatus}
                      className="shrink-0"
                    >
                      {migration.checkStatus}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Seed CMS Settings */}
              <Card className="border-border/60">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <Settings className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{migration.seedSettings}</p>
                        <p className="text-sm text-muted-foreground">{migration.seedSettingsDesc}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={seeding}
                      onClick={() =>
                        askConfirm({
                          title: migration.seedSettings,
                          message: admin.confirm.seedSettingsConfirm,
                          confirmLabel: migration.seedSettingsAction,
                          action: () =>
                            runSeed(
                              seedHomepage,
                              migration.seedDone,
                              migration.seedFailed,
                            ),
                        })
                      }
                    >
                      {migration.seedSettingsAction}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Seed Default Procedures */}
              <Card className="border-border/60">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-green-50 flex items-center justify-center">
                        <Stethoscope className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{migration.seedProcedures}</p>
                        <p className="text-sm text-muted-foreground">{migration.seedProceduresDesc}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={seeding}
                      onClick={() =>
                        askConfirm({
                          title: migration.seedProcedures,
                          message: admin.confirm.seedProceduresConfirm,
                          confirmLabel: migration.seedProceduresAction,
                          action: () =>
                            runSeed(
                              seedProcedures,
                              migration.seedDone,
                              migration.seedFailed,
                            ),
                        })
                      }
                    >
                      {migration.seedProceduresAction}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Seed Full Data */}
              <Card className="border-border/60">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center">
                        <LayoutDashboard className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{migration.seedFull}</p>
                        <p className="text-sm text-muted-foreground">{migration.seedFullDesc}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={seeding}
                      onClick={() =>
                        askConfirm({
                          title: migration.seedFull,
                          message: admin.confirm.seedFullConfirm,
                          confirmLabel: migration.seedFullAction,
                          action: () =>
                            runSeed(seedData, migration.seedDone, migration.seedFailed),
                        })
                      }
                    >
                      {migration.seedFullAction}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={pendingConfirm !== null}
        onOpenChange={(open) => {
          if (!open) setPendingConfirm(null);
        }}
        title={pendingConfirm?.title ?? admin.confirm.title}
        message={pendingConfirm?.message ?? admin.confirm.message}
        confirmLabel={pendingConfirm?.confirmLabel ?? admin.common.delete}
        isLoading={confirmRunning}
        onConfirm={() => {
          if (!pendingConfirm) return;
          setConfirmRunning(true);
          void pendingConfirm.action().finally(() => {
            setConfirmRunning(false);
            setPendingConfirm(null);
          });
        }}
      />
    </div>
  );
}