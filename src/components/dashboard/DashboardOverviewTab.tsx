import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation, useConvex } from "convex/react";
import { Database } from "lucide-react";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  ArrowUpDown,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  Settings,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardOverviewTab() {
  const seedData = useMutation(api.seed.seedAll);
  const seedProcedures = useMutation(api.seed.seedProcedures);
  const seedHomepage = useMutation(api.seed.seedHomepageSettings);
  const [seeding, setSeeding] = useState(false);
  const [seedingProcedures, setSeedingProcedures] = useState(false);
  const [seedingHomepage, setSeedingHomepage] = useState(false);
  const migrateStructure = useMutation(api.migration.migrateProcedureStructure);
  const [migrating, setMigrating] = useState(false);
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
    { label: "Procedures", value: totalProcedures, icon: FileText, color: "text-blue-500 bg-blue-50" },
    { label: "Testimonials", value: totalTestimonials, icon: Star, color: "text-amber-500 bg-amber-50" },
    { label: "FAQ Items", value: totalFaqs, icon: HelpCircle, color: "text-green-500 bg-green-50" },
    { label: "Media", value: totalMedia, icon: ImageIcon, color: "text-purple-500 bg-purple-50" },
  ];

  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Dashboard Overview</h2>
      </div>
      {!isAdmin && (
        <Card className="border-border/60 bg-amber-50/50">
          <CardContent className="p-5">
            <p className="text-sm text-amber-800">
              You are signed in but do not have an administrator role, so CMS
              changes are disabled. Contact an administrator if this is a
              mistake.
            </p>
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

      {/* CMS Health Check */}
      <Card className="border-border/60">
        <CardContent className="p-5">
          <h3 className="font-medium text-foreground mb-4">CMS Health Check</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: "Site Settings", count: totalSiteSettings, status: totalSiteSettings > 0 ? "OK" : "EMPTY" },
              { label: "Procedures", count: totalProcedures, status: totalProcedures > 0 ? "OK" : "EMPTY" },
              { label: "Before & After", count: totalBeforeAfter, status: totalBeforeAfter > 0 ? "OK" : "EMPTY" },
              { label: "Testimonials", count: totalTestimonials, status: totalTestimonials > 0 ? "OK" : "EMPTY" },
              { label: "FAQ", count: totalFaqs, status: totalFaqs > 0 ? "OK" : "EMPTY" },
              { label: "Media", count: totalMedia, status: totalMedia > 0 ? "OK" : "EMPTY" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-lg border border-border/40">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{item.count}</span>
                  <span className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full",
                    item.status === "OK" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  )}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Seed CMS Settings Button */}
      <Card className="border-border/60">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Settings className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="font-medium text-foreground">Seed CMS Settings</p>
                <p className="text-sm text-muted-foreground">Populate missing Hero, About, CTA, Footer, Section Headers, SEO, and Doctor settings (safe — never overwrites)</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={seedingHomepage}
              onClick={async () => {
                setSeedingHomepage(true);
                try {
                  const result = await seedHomepage();
                  toast.success(result || "CMS settings seeded!");
                } catch {
                  toast.error("Failed to seed CMS settings.");
                }
                setSeedingHomepage(false);
              }}
            >
              {seedingHomepage ? "Seeding..." : "Seed CMS Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Seed Procedures Button */}
      <Card className="border-border/60">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-green-50 flex items-center justify-center">
                <FileText className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="font-medium text-foreground">Seed Default Procedures</p>
                <p className="text-sm text-muted-foreground">Create the restructured default procedures (safe to run multiple times)</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={seedingProcedures}
              onClick={async () => {
                setSeedingProcedures(true);
                try {
                  const result = await seedProcedures();
                  toast.success(result || "Procedures seeded!");
                } catch {
                  toast.error("Failed to seed procedures.");
                }
                setSeedingProcedures(false);
              }}
            >
              {seedingProcedures ? "Seeding..." : "Seed Procedures"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Migrate Procedure Structure Button */}
      <Card className="border-border/60 ring-2 ring-primary/10">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <ArrowUpDown className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-foreground">Migrate Procedure Structure</p>
                <p className="text-sm text-muted-foreground">
                  Creates the 9 new split procedures, deactivates the 3 old combined ones (upper-lower-eyelid-lift, arm-thigh-lift, breast-augmentation-reduction) with redirect info, adds the breast group sub-options, and seeds the homepage Information Card. Idempotent — safe to run repeatedly.
                </p>
                {migrationStatus && (
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">{migrationStatus.newProceduresCount} new procedures</span>
                    <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">{migrationStatus.subProcedures.length} sub-procedures</span>
                    <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">{migrationStatus.legacyRecords.length} legacy records</span>
                    {migrationStatus.oldCombinedStillActive === true && (
                      <span className="px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-100">
                        ⚠ The old combined procedure (upper-lower-eyelid-lift) is still active — run migration
                      </span>
                    )}
                  </div>
                )}
                {migrationStatusError && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Migration status unavailable — the Convex backend hasn&apos;t been updated yet (deploy it, then click &quot;Check Status&quot;).
                  </p>
                )}
              </div>
            </div>
            <Button
              size="sm"
              disabled={migrating}
              onClick={async () => {
                setMigrating(true);
                try {
                  const result = await migrateStructure();
                  toast.success(result || "Structure migration complete!");
                  await checkMigrationStatus();
                } catch (e) {
                  toast.error("Migration failed. See console for details.");
                  console.error(e);
                }
                setMigrating(false);
              }}
              className="bg-primary text-primary-foreground shrink-0"
            >
              {migrating ? "Migrating..." : "Run Structure Migration"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={checkMigrationStatus}
              className="shrink-0"
            >
              Check Status
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center">
                <Database className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="font-medium text-foreground">Seed Full Database</p>
                <p className="text-sm text-muted-foreground">Populate procedures, testimonials, and FAQ (skips if procedures exist)</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={seeding}
              onClick={async () => {
                setSeeding(true);
                try {
                  const result = await seedData();
                  toast.success(result || "Data seeded successfully!");
                } catch {
                  toast.error("Data may already exist or an error occurred.");
                }
                setSeeding(false);
              }}
            >
              {seeding ? "Seeding..." : "Seed Full Data"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}