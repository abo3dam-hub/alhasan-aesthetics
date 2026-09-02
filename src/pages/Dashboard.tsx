import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { Database } from "lucide-react";
import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  LayoutDashboard,
  LogOut,
  FileText,
  HelpCircle,
  MessageSquare,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Bell,
  Settings,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  Star,
  X,
  Sparkles,
  UserRound,
  SmilePlus,
  Droplets,
  Scissors,
  Heart,
  ArrowUpDown,
  Stethoscope,
  Ban,
  Shield,
  Zap,
  Activity,
  Sun,
  Moon,
} from "lucide-react";
import { useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/components/ImageUpload";
import { MediaSelector } from "@/components/MediaSelector";
import { useImageUpload } from "@/hooks/use-upload";

// Generic reorder helper: swap order of two adjacent items using update mutations
async function swapOrder(
  items: { _id: string; order: number }[],
  index: number,
  direction: "up" | "down",
  updateMutation: (args: { id: any; order: number }) => Promise<any>,
) {
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= items.length) return;
  const current = items[index];
  const target = items[targetIndex];
  await Promise.all([
    updateMutation({ id: current._id as any, order: target.order }),
    updateMutation({ id: target._id as any, order: current.order }),
  ]);
}

import HomepageCMSTab from "@/components/dashboard/HomepageCMSTab";
import SEOTab from "@/components/dashboard/SEOTab";

type Tab = "overview" | "homepage" | "procedures" | "beforeAfter" | "testimonials" | "faq" | "seo" | "settings" | "media";

const tabs: { key: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "homepage", label: "Homepage", icon: Settings },
  { key: "procedures", label: "Procedures", icon: FileText },
  { key: "beforeAfter", label: "Before & After", icon: ImageIcon },
  { key: "testimonials", label: "Testimonials", icon: Star },
  { key: "faq", label: "FAQ", icon: HelpCircle },
  { key: "seo", label: "SEO", icon: Settings },
  { key: "settings", label: "Settings", icon: Settings },
  { key: "media", label: "Media", icon: ImageIcon },
];

const iconOptions = [
  "Eye", "UserRound", "SmilePlus", "Droplets", "Scissors", "Sparkles",
  "Heart", "ArrowUpDown", "Stethoscope", "Ban", "Star", "Shield",
  "Zap", "Activity", "Sun", "Moon",
];

const iconMap: Record<string, typeof Sparkles> = {
  Eye, UserRound, SmilePlus, Droplets, Scissors, Sparkles,
  Heart, ArrowUpDown, Stethoscope, Ban, Star, Shield, Zap, Activity, Sun, Moon,
};

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass-elevated border-b border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <LayoutDashboard className="h-4 w-4 text-primary" />
            </div>
            <h1 className="text-lg font-semibold text-foreground">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user?.name || user?.email || "Admin"}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <nav className="lg:w-56 shrink-0">
            <div className="glass-card rounded-2xl p-2 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
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

          <main className="flex-1 min-w-0">
            {activeTab === "overview" && <OverviewTab />}
            {activeTab === "homepage" && <HomepageCMSTab />}
            {activeTab === "procedures" && <ProceduresTab />}
            {activeTab === "beforeAfter" && <BeforeAfterTab />}
            {activeTab === "testimonials" && <TestimonialsTab />}
            {activeTab === "faq" && <FaqTab />}
            {activeTab === "seo" && <SEOTab />}
            {activeTab === "settings" && <SettingsTab />}
            {activeTab === "media" && <MediaTab />}
          </main>
        </div>
      </div>
    </div>
  );
}

// ─── Overview Tab ───
function OverviewTab() {
  const seedData = useMutation(api.seed.seedAll);
  const [seeding, setSeeding] = useState(false);
  const procedures = useQuery(api.procedures.list);
  const testimonials = useQuery(api.testimonials.list);
  const faqs = useQuery(api.faq.list);

  const totalProcedures = procedures?.length ?? 0;
  const totalTestimonials = testimonials?.length ?? 0;
  const totalFaqs = faqs?.length ?? 0;

  const stats = [
    { label: "Procedures", value: totalProcedures, icon: FileText, color: "text-blue-500 bg-blue-50" },
    { label: "Testimonials", value: totalTestimonials, icon: Star, color: "text-amber-500 bg-amber-50" },
    { label: "FAQ Items", value: totalFaqs, icon: HelpCircle, color: "text-green-500 bg-green-50" },
  ];

  const becomeAdmin = useMutation(api.users.becomeAdmin);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [becomingAdmin, setBecomingAdmin] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Dashboard Overview</h2>
        {!isAdmin && (
          <Button
            size="sm"
            className="gap-2 bg-primary text-primary-foreground"
            disabled={becomingAdmin}
            onClick={async () => {
              setBecomingAdmin(true);
              try {
                await becomeAdmin();
                toast.success("You are now an admin!");
                window.location.reload();
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Failed");
              }
              setBecomingAdmin(false);
            }}
          >
            {becomingAdmin ? "..." : "Become Admin"}
          </Button>
        )}
      </div>
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

      <Card className="border-border/60">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center">
                <Database className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="font-medium text-foreground">Seed Database</p>
                <p className="text-sm text-muted-foreground">Populate procedures, testimonials, FAQ, and settings</p>
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
                } catch (e) {
                  toast.error("Data may already exist or an error occurred.");
                }
                setSeeding(false);
              }}
            >
              {seeding ? "Seeding..." : "Seed Data"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Procedures Tab ───
function ProceduresTab() {
  const procedures = useQuery(api.procedures.list);
  const createProcedure = useMutation(api.procedures.create);
  const updateProcedure = useMutation(api.procedures.update);
  const removeProcedure = useMutation(api.procedures.remove);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");

  const filteredProcedures = procedures?.filter((p) => {
    const matchesSearch = !search || p.titleEn.toLowerCase().includes(search.toLowerCase()) || p.titleAr.includes(search) || p.slug.includes(search.toLowerCase());
    const matchesFilter = filterActive === "all" || (filterActive === "active" ? p.isActive : !p.isActive);
    return matchesSearch && matchesFilter;
  });

  const handleToggleActive = async (id: string, isActive: boolean) => {
    await updateProcedure({ id: id as any, isActive: !isActive });
    toast.success("Procedure updated");
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this procedure?")) {
      await removeProcedure({ id: id as any });
      toast.success("Procedure deleted");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Procedures</h2>
        <Button onClick={() => { setShowForm(!showForm); setEditingId(null); }} className="gap-2 bg-primary text-primary-foreground">
          <Plus className="h-4 w-4" /> Add Procedure
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input placeholder="Search procedures..." value={search} onChange={(e) => setSearch(e.target.value)} className="sm:max-w-xs" />
        <select value={filterActive} onChange={(e) => setFilterActive(e.target.value as any)} className="border border-border/60 rounded-lg px-3 py-2 bg-background text-sm">
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {showForm && (
        <ProcedureForm
          editingId={editingId}
          onSubmit={async (data) => {
            if (editingId) {
              await updateProcedure({ id: editingId as any, ...data });
              toast.success("Procedure updated");
            } else {
              await createProcedure(data);
              toast.success("Procedure created");
            }
            setShowForm(false);
            setEditingId(null);
          }}
          onCancel={() => { setShowForm(false); setEditingId(null); }}
        />
      )}

      <div className="space-y-3">
        {!procedures || procedures.length === 0 ? (
          <Card className="border-border/60"><CardContent className="p-8 text-center text-muted-foreground">No procedures yet.</CardContent></Card>
        ) : (
          (filteredProcedures || []).map((proc, index) => (
            <Card key={proc._id} className="border-border/60">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-lg">
                    {proc.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{proc.titleEn}</p>
                    <p className="text-sm text-muted-foreground truncate">{proc.titleAr}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setEditingId(proc._id);
                      setShowForm(true);
                    }}
                    className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                    title="Edit" aria-label="Edit"
                  >
                    <FileText className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(proc._id, proc.isActive)}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      proc.isActive ? "text-green-600 hover:bg-green-50" : "text-muted-foreground hover:bg-muted"
                    )}
                    title={proc.isActive ? "Deactivate" : "Activate"}
                  >
                    {proc.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={async () => { await updateProcedure({ id: proc._id as any, isFeatured: !proc.isFeatured }); toast.success(proc.isFeatured ? "Unfeatured" : "Featured"); }}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      proc.isFeatured ? "text-amber-500 hover:bg-amber-50" : "text-muted-foreground hover:bg-muted"
                    )}
                    title={proc.isFeatured ? "Unfeature" : "Feature"}
                  >
                    <Star className={cn("h-4 w-4", proc.isFeatured && "fill-amber-400")} />
                  </button>
                  <button onClick={() => handleDelete(proc._id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="flex flex-col gap-0.5 border-s border-border/40 ps-2 ms-1">
                    <button disabled={index === 0} onClick={() => swapOrder(procedures!, index, "up", (args) => updateProcedure(args as any))} className="p-1 rounded text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors" aria-label="Move up"><ArrowUp className="h-3 w-3" /></button>
                    <button disabled={index === procedures!.length - 1} onClick={() => swapOrder(procedures!, index, "down", (args) => updateProcedure(args as any))} className="p-1 rounded text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors" aria-label="Move down"><ArrowDown className="h-3 w-3" /></button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
function ProcedureForm({
  onSubmit,
  onCancel,
  editingId,
}: {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  editingId: string | null;
}) {
  const procedures = useQuery(api.procedures.list);
  const existing = editingId ? procedures?.find((p) => p._id === editingId) : null;
  const [loading, setLoading] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(existing?.icon || "Sparkles");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [imageUrl, setImageUrl] = useState(existing?.image || "");
  const [beforeImageUrl, setBeforeImageUrl] = useState(existing?.beforeImage || "");
  const [afterImageUrl, setAfterImageUrl] = useState(existing?.afterImage || "");
  const [ogImageUrl, setOgImageUrl] = useState(existing?.ogImage || "");
  const [galleryUrls, setGalleryUrls] = useState<string[]>(existing?.gallery || []);

  const addGalleryImage = (url: string) => setGalleryUrls((prev) => [...prev, url]);
  const removeGalleryImage = (index: number) => setGalleryUrls((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    await onSubmit({
      slug: fd.get("slug") as string,
      titleAr: fd.get("titleAr") as string,
      titleEn: fd.get("titleEn") as string,
      descriptionAr: fd.get("descriptionAr") as string,
      descriptionEn: fd.get("descriptionEn") as string,
      longDescriptionAr: fd.get("longDescriptionAr") as string,
      longDescriptionEn: fd.get("longDescriptionEn") as string,
      icon: selectedIcon,
      image: imageUrl || undefined,
      beforeImage: beforeImageUrl || undefined,
      afterImage: afterImageUrl || undefined,
      ogImage: ogImageUrl || undefined,
      gallery: galleryUrls.length > 0 ? galleryUrls : undefined,
      price: (fd.get("price") as string) || undefined,
      isFeatured: !!fd.get("isFeatured"),
      category: (fd.get("category") as string) || "general",
      duration: (fd.get("duration") as string) || "1-2 hours",
      recovery: (fd.get("recovery") as string) || "1-2 weeks",
      seoTitleEn: (fd.get("seoTitleEn") as string) || undefined,
      seoTitleAr: (fd.get("seoTitleAr") as string) || undefined,
      seoDescriptionEn: (fd.get("seoDescriptionEn") as string) || undefined,
      seoDescriptionAr: (fd.get("seoDescriptionAr") as string) || undefined,
      isActive: existing?.isActive ?? true,
      order: existing?.order ?? 0,
    });
    setLoading(false);
  };

  return (
    <Card className="border-border/60">
      <CardHeader><CardTitle className="text-lg">{editingId ? "Edit Procedure" : "Add New Procedure"}</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Title (English)</Label>
              <Input name="titleEn" required defaultValue={existing?.titleEn} placeholder="Rhinoplasty" />
            </div>
            <div className="space-y-2">
              <Label>Title (Arabic)</Label>
              <Input name="titleAr" dir="rtl" required defaultValue={existing?.titleAr} placeholder="تجميل الأنف" />
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input name="slug" required defaultValue={existing?.slug} placeholder="rhinoplasty" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input name="category" defaultValue={existing?.category} placeholder="face" />
            </div>
            <div className="space-y-2">
              <Label>Price (optional)</Label>
              <Input name="price" defaultValue={existing?.price} placeholder="From $3000" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Duration</Label><Input name="duration" defaultValue={existing?.duration} placeholder="1-2 hours" /></div>
            <div className="space-y-2"><Label>Recovery</Label><Input name="recovery" defaultValue={existing?.recovery} placeholder="1-2 weeks" /></div>
          </div>
          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="relative">
              <button type="button" onClick={() => setShowIconPicker(!showIconPicker)} className="w-full flex items-center justify-between px-3 py-2 border border-border/60 rounded-lg bg-white/40 text-sm">
                <span>{selectedIcon}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {showIconPicker && (
                <div className="absolute z-50 top-full mt-1 w-full bg-white rounded-xl shadow-lg border border-border/40 p-3 max-h-64 overflow-y-auto">
                  <input type="text" placeholder="Search icons..." className="w-full mb-2 px-3 py-1.5 border border-border/60 rounded-lg text-sm bg-white" onChange={(e) => {
                    const query = e.target.value.toLowerCase();
                    document.querySelectorAll('[data-icon-btn]').forEach((btn) => {
                      const name = (btn as HTMLElement).dataset.iconName || "";
                      (btn as HTMLElement).style.display = name.toLowerCase().includes(query) ? "" : "none";
                    });
                  }} />
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-1">
                    {iconOptions.map((icon) => {
                      const IconComp = iconMap[icon] || Sparkles;
                      return (
                        <button key={icon} type="button" data-icon-btn data-icon-name={icon} onClick={() => { setSelectedIcon(icon); setShowIconPicker(false); }} className={cn("p-2 rounded-lg flex flex-col items-center gap-1 hover:bg-primary/10 transition-colors", selectedIcon === icon && "bg-primary/10 ring-1 ring-primary")}>
                          <IconComp className="h-5 w-5 text-primary" />
                          <span className="text-[9px] text-muted-foreground leading-none truncate w-full text-center">{icon}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2"><Label>Short Description (EN)</Label><Textarea name="descriptionEn" rows={2} required defaultValue={existing?.descriptionEn} placeholder="Brief description..." /></div>
          <div className="space-y-2"><Label>Short Description (AR)</Label><Textarea name="descriptionAr" dir="rtl" rows={2} required defaultValue={existing?.descriptionAr} placeholder="وصف مختصر..." /></div>
          <div className="space-y-2"><Label>Full Description (EN)</Label><Textarea name="longDescriptionEn" rows={4} required defaultValue={existing?.longDescriptionEn} placeholder="Detailed description..." /></div>
          <div className="space-y-2"><Label>Full Description (AR)</Label><Textarea name="longDescriptionAr" dir="rtl" rows={4} required defaultValue={existing?.longDescriptionAr} placeholder="وصف تفصيلي..." /></div>

          {/* Images */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Images</Label>
            <div className="space-y-2">
              <Label>Main Image</Label>
              <MediaSelector value={imageUrl} onChange={setImageUrl} label="Select procedure image" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Before Image</Label>
                <MediaSelector value={beforeImageUrl} onChange={setBeforeImageUrl} label="Select before image" />
              </div>
              <div className="space-y-2">
                <Label>After Image</Label>
                <MediaSelector value={afterImageUrl} onChange={setAfterImageUrl} label="Select after image" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>OG Image (for social sharing)</Label>
              <MediaSelector value={ogImageUrl} onChange={setOgImageUrl} label="Select OG image" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center justify-between">
                <span>Gallery Images</span>
                <Button type="button" variant="outline" size="sm" onClick={() => addGalleryImage("")}>+ Add Image</Button>
              </Label>
              <p className="text-xs text-muted-foreground">Drag order: use arrows to reorder gallery images.</p>
              <div className="space-y-3">
                {galleryUrls.map((url, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <MediaSelector value={url} onChange={(newUrl) => {
                        const updated = [...galleryUrls];
                        updated[i] = newUrl;
                        setGalleryUrls(updated);
                      }} label={`Gallery image ${i + 1}`} />
                    </div>
                    <div className="flex flex-col gap-0.5 mt-7">
                      <button type="button" disabled={i === 0} onClick={() => { const updated = [...galleryUrls]; [updated[i-1], updated[i]] = [updated[i], updated[i-1]]; setGalleryUrls(updated); }} className="p-1 rounded text-muted-foreground hover:bg-muted disabled:opacity-30"><ArrowUp className="h-3 w-3" /></button>
                      <button type="button" disabled={i === galleryUrls.length - 1} onClick={() => { const updated = [...galleryUrls]; [updated[i], updated[i+1]] = [updated[i+1], updated[i]]; setGalleryUrls(updated); }} className="p-1 rounded text-muted-foreground hover:bg-muted disabled:opacity-30"><ArrowDown className="h-3 w-3" /></button>
                      <button type="button" className="p-1 text-red-500 hover:bg-red-50 rounded" onClick={() => removeGalleryImage(i)}>
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SEO */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">SEO</Label>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>SEO Title (EN)</Label><Input name="seoTitleEn" defaultValue={existing?.seoTitleEn} placeholder="Custom SEO title..." /></div>
              <div className="space-y-2"><Label>SEO Title (AR)</Label><Input name="seoTitleAr" dir="rtl" defaultValue={existing?.seoTitleAr} placeholder="عنوان SEO مخصص..." /></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>SEO Description (EN)</Label><Textarea name="seoDescriptionEn" rows={2} defaultValue={existing?.seoDescriptionEn} placeholder="Custom SEO description..." /></div>
              <div className="space-y-2"><Label>SEO Description (AR)</Label><Textarea name="seoDescriptionAr" dir="rtl" rows={2} defaultValue={existing?.seoDescriptionAr} placeholder="وصف SEO مخصص..." /></div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" name="isFeatured" id="isFeatured" defaultChecked={existing?.isFeatured} className="rounded border-border" />
            <Label htmlFor="isFeatured" className="cursor-pointer">Featured on homepage</Label>
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground">{loading ? "Saving..." : "Save Procedure"}</Button>
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Before & After Tab ───
function BeforeAfterTab() {
  const cases = useQuery(api.beforeAfter.list);
  const createCase = useMutation(api.beforeAfter.create);
  const updateCase = useMutation(api.beforeAfter.update);
  const removeCase = useMutation(api.beforeAfter.remove);
  const procedures = useQuery(api.procedures.list);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const existing = editingId ? cases?.find((c) => c._id === editingId) : null;
  const [baBeforeImage, setBaBeforeImage] = useState("");
  const [baAfterImage, setBaAfterImage] = useState("");

  // Initialize B&A image state when editing
  if (existing && baBeforeImage === "" && baAfterImage === "" && !showForm) {
    // Will be set when form opens
  }

  const handleOpenBAForm = (id: string | null) => {
    setEditingId(id);
    setShowForm(true);
    const c = id ? cases?.find((c) => c._id === id) : null;
    setBaBeforeImage(c?.beforeImage || "");
    setBaAfterImage(c?.afterImage || "");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const ageVal = (fd.get("patientAge") as string) || "";
    const data = {
      titleAr: fd.get("titleAr") as string,
      titleEn: fd.get("titleEn") as string,
      procedureType: fd.get("procedureType") as string,
      beforeImage: baBeforeImage || "",
      afterImage: baAfterImage || "",
      descriptionAr: (fd.get("descriptionAr") as string) || undefined,
      descriptionEn: (fd.get("descriptionEn") as string) || undefined,
      patientAge: ageVal ? Number(ageVal) : undefined,
    };
    if (editingId) {
      await updateCase({ id: editingId as any, ...data });
      toast.success("Case updated");
    } else {
      await createCase({ ...data, isActive: true, order: cases?.length ?? 0 });
      toast.success("Case added");
    }
    setShowForm(false);
    setEditingId(null);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Before & After</h2>
        <Button onClick={() => handleOpenBAForm(null)} className="gap-2 bg-primary text-primary-foreground">
          <Plus className="h-4 w-4" /> Add Case
        </Button>
      </div>

      {showForm && (
        <Card className="border-border/60">
          <CardHeader><CardTitle className="text-lg">{editingId ? "Edit Case" : "Add Before & After Case"}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Title (EN)</Label><Input name="titleEn" required defaultValue={existing?.titleEn} /></div>
                <div className="space-y-2"><Label>Title (AR)</Label><Input name="titleAr" dir="rtl" required defaultValue={existing?.titleAr} /></div>
              </div>
              <div className="space-y-2">
                <Label>Procedure Type</Label>
                <select name="procedureType" defaultValue={existing?.procedureType} className="w-full border border-border/60 rounded-lg px-3 py-2 bg-background text-sm">
                  {procedures?.map((p) => <option key={p._id} value={p.slug}>{p.titleEn}</option>)}
                </select>
              </div>
              <input type="hidden" name="beforeImage" value={baBeforeImage} />
              <input type="hidden" name="afterImage" value={baAfterImage} />
              <div className="grid sm:grid-cols-2 gap-4">
                <MediaSelector value={baBeforeImage} onChange={setBaBeforeImage} label="Before Image" />
                <MediaSelector value={baAfterImage} onChange={setBaAfterImage} label="After Image" />
              </div>
              <div className="space-y-2"><Label>Description (EN)</Label><Textarea name="descriptionEn" rows={2} defaultValue={existing?.descriptionEn} /></div>
              <div className="space-y-2"><Label>Description (AR)</Label><Textarea name="descriptionAr" dir="rtl" rows={2} defaultValue={existing?.descriptionAr} /></div>
              <div className="space-y-2"><Label>Patient Age (optional)</Label><Input name="patientAge" type="number" min={1} max={120} defaultValue={existing?.patientAge ?? ""} placeholder="e.g. 35" /></div>
              <div className="flex gap-3">
                <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground">{loading ? "Saving..." : (editingId ? "Update" : "Save")}</Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {!cases || cases.length === 0 ? (
          <Card className="border-border/60"><CardContent className="p-8 text-center text-muted-foreground">No before/after cases yet.</CardContent></Card>
        ) : (
          cases.map((c) => (
            <Card key={c._id} className="border-border/60">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">{c.titleEn}</p>
                  <p className="text-sm text-muted-foreground">{c.procedureType}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleOpenBAForm(c._id)} className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors" title="Edit"><FileText className="h-4 w-4" /></button>
                  <button onClick={async () => { await updateCase({ id: c._id, isActive: !c.isActive }); toast.success("Updated"); }} className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                    {c.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button onClick={async () => { if (confirm("Delete this case?")) { await removeCase({ id: c._id }); toast.success("Deleted"); } }} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="flex flex-col gap-0.5 border-s border-border/40 ps-2 ms-1">
                    <button disabled={cases!.indexOf(c) === 0} onClick={() => swapOrder(cases!, cases!.indexOf(c), "up", (args) => updateCase(args as any))} className="p-1 rounded text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors"><ArrowUp className="h-3 w-3" /></button>
                    <button disabled={cases!.indexOf(c) === cases!.length - 1} onClick={() => swapOrder(cases!, cases!.indexOf(c), "down", (args) => updateCase(args as any))} className="p-1 rounded text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors"><ArrowDown className="h-3 w-3" /></button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}


// ─── Testimonials Tab ───
function TestimonialsTab() {
  const testimonials = useQuery(api.testimonials.list);
  const createTestimonial = useMutation(api.testimonials.create);
  const updateTestimonial = useMutation(api.testimonials.update);
  const removeTestimonial = useMutation(api.testimonials.remove);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const existing = editingId ? testimonials?.find((t) => t._id === editingId) : null;
  const [testAvatar, setTestAvatar] = useState("");

  const handleOpenTestForm = (id: string | null) => {
    setEditingId(id);
    setShowForm(true);
    const t = id ? testimonials?.find((t) => t._id === id) : null;
    setTestAvatar(t?.avatar || "");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const data = {
      nameAr: fd.get("nameAr") as string,
      nameEn: fd.get("nameEn") as string,
      textAr: fd.get("textAr") as string,
      textEn: fd.get("textEn") as string,
      rating: Number(fd.get("rating") as string) || 5,
      avatar: testAvatar || undefined,
      procedureType: (fd.get("procedureType") as string) || undefined,
    };
    if (editingId) {
      await updateTestimonial({ id: editingId as any, ...data });
      toast.success("Testimonial updated");
    } else {
      await createTestimonial({ ...data, isActive: true, order: testimonials?.length ?? 0 });
      toast.success("Testimonial added");
    }
    setShowForm(false);
    setEditingId(null);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Testimonials</h2>
        <Button onClick={() => { setShowForm(!showForm); setEditingId(null); }} className="gap-2 bg-primary text-primary-foreground">
          <Plus className="h-4 w-4" /> Add Testimonial
        </Button>
      </div>

      {showForm && (
        <Card className="border-border/60">
          <CardHeader><CardTitle className="text-lg">{editingId ? "Edit Testimonial" : "Add Testimonial"}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Name (EN)</Label><Input name="nameEn" required defaultValue={existing?.nameEn} /></div>
                <div className="space-y-2"><Label>Name (AR)</Label><Input name="nameAr" dir="rtl" required defaultValue={existing?.nameAr} /></div>
              </div>
              <div className="space-y-2"><Label>Text (EN)</Label><Textarea name="textEn" rows={3} required defaultValue={existing?.textEn} /></div>
              <div className="space-y-2"><Label>Text (AR)</Label><Textarea name="textAr" dir="rtl" rows={3} required defaultValue={existing?.textAr} /></div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Rating (1-5)</Label><Input name="rating" type="number" min={1} max={5} defaultValue={existing?.rating ?? 5} /></div>
                <div className="space-y-2"><Label>Procedure Type (optional)</Label><Input name="procedureType" defaultValue={existing?.procedureType} placeholder="e.g. rhinoplasty" /></div>
              </div>
              <input type="hidden" name="avatar" value={testAvatar} />
              <MediaSelector value={testAvatar} onChange={setTestAvatar} label="Avatar Image (optional)" />
              <div className="flex gap-3">
                <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground">{loading ? "Saving..." : (editingId ? "Update" : "Save")}</Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {!testimonials || testimonials.length === 0 ? (
          <Card className="border-border/60"><CardContent className="p-8 text-center text-muted-foreground">No testimonials yet.</CardContent></Card>
        ) : testimonials.map((t) => (
          <Card key={t._id} className="border-border/60">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground">{t.nameEn}</p>
                  <div className="flex">{Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}</div>
                </div>
                <p className="text-sm text-muted-foreground truncate max-w-md">{t.textEn}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => handleOpenTestForm(t._id)} className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors" title="Edit"><FileText className="h-4 w-4" /></button>
                <button onClick={async () => { await updateTestimonial({ id: t._id, isActive: !t.isActive }); toast.success("Updated"); }} className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                  {t.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button onClick={async () => { if (confirm("Delete this testimonial?")) { await removeTestimonial({ id: t._id }); toast.success("Deleted"); } }} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="flex flex-col gap-0.5 border-s border-border/40 ps-2 ms-1">
                  <button disabled={testimonials!.indexOf(t) === 0} onClick={() => swapOrder(testimonials!, testimonials!.indexOf(t), "up", (args) => updateTestimonial(args as any))} className="p-1 rounded text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors"><ArrowUp className="h-3 w-3" /></button>
                  <button disabled={testimonials!.indexOf(t) === testimonials!.length - 1} onClick={() => swapOrder(testimonials!, testimonials!.indexOf(t), "down", (args) => updateTestimonial(args as any))} className="p-1 rounded text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors"><ArrowDown className="h-3 w-3" /></button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── FAQ Tab ───
function FaqTab() {
  const faqs = useQuery(api.faq.list);
  const createFaq = useMutation(api.faq.create);
  const updateFaq = useMutation(api.faq.update);
  const removeFaq = useMutation(api.faq.remove);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const existing = editingId ? faqs?.find((f) => f._id === editingId) : null;

  const filteredFaqs = faqs?.filter((f) => {
    return !search || f.questionEn.toLowerCase().includes(search.toLowerCase()) || f.questionAr.includes(search) || f.answerEn.toLowerCase().includes(search.toLowerCase());
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const data = {
      questionAr: fd.get("questionAr") as string,
      questionEn: fd.get("questionEn") as string,
      answerAr: fd.get("answerAr") as string,
      answerEn: fd.get("answerEn") as string,
      category: (fd.get("category") as string) || undefined,
    };
    if (editingId) {
      await updateFaq({ id: editingId as any, ...data });
      toast.success("FAQ updated");
    } else {
      await createFaq({ ...data, isActive: true, order: faqs?.length ?? 0 });
      toast.success("FAQ added");
    }
    setShowForm(false);
    setEditingId(null);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">FAQ</h2>
        <Button onClick={() => { setShowForm(!showForm); setEditingId(null); }} className="gap-2 bg-primary text-primary-foreground">
          <Plus className="h-4 w-4" /> Add FAQ
        </Button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input placeholder="Search FAQ..." value={search} onChange={(e) => setSearch(e.target.value)} className="sm:max-w-xs" />
      </div>

      {showForm && (
        <Card className="border-border/60">
          <CardHeader><CardTitle className="text-lg">{editingId ? "Edit FAQ" : "Add FAQ"}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Question (EN)</Label><Input name="questionEn" required defaultValue={existing?.questionEn} /></div>
                <div className="space-y-2"><Label>Question (AR)</Label><Input name="questionAr" dir="rtl" required defaultValue={existing?.questionAr} /></div>
              </div>
              <div className="space-y-2"><Label>Answer (EN)</Label><Textarea name="answerEn" rows={3} required defaultValue={existing?.answerEn} /></div>
              <div className="space-y-2"><Label>Answer (AR)</Label><Textarea name="answerAr" dir="rtl" rows={3} required defaultValue={existing?.answerAr} /></div>
              <div className="space-y-2"><Label>Category (optional)</Label><Input name="category" defaultValue={existing?.category} placeholder="e.g. general, pricing, recovery" /></div>
              <div className="flex gap-3">
                <Button type="submit" className="bg-primary text-primary-foreground">{editingId ? "Update" : "Save"}</Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {!faqs || faqs.length === 0 ? (
          <Card className="border-border/60"><CardContent className="p-8 text-center text-muted-foreground">No FAQ items yet.</CardContent></Card>
        ) : (
          (filteredFaqs || []).map((f) => (
          <Card key={f._id} className="border-border/60">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium text-foreground truncate">{f.questionEn}</p>
                <p className="text-sm text-muted-foreground truncate max-w-md">{f.answerEn}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => { setEditingId(f._id); setShowForm(true); }} className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors" title="Edit"><FileText className="h-4 w-4" /></button>
                <button onClick={async () => { await updateFaq({ id: f._id, isActive: !f.isActive }); toast.success("Updated"); }} className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                  {f.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button onClick={async () => { if (confirm("Delete this FAQ?")) { await removeFaq({ id: f._id }); toast.success("Deleted"); } }} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="flex flex-col gap-0.5 border-s border-border/40 ps-2 ms-1">
                  <button disabled={faqs!.indexOf(f) === 0} onClick={() => swapOrder(faqs!, faqs!.indexOf(f), "up", (args) => updateFaq(args as any))} className="p-1 rounded text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors"><ArrowUp className="h-3 w-3" /></button>
                  <button disabled={faqs!.indexOf(f) === faqs!.length - 1} onClick={() => swapOrder(faqs!, faqs!.indexOf(f), "down", (args) => updateFaq(args as any))} className="p-1 rounded text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors"><ArrowDown className="h-3 w-3" /></button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
      </div>
    </div>
  );
}



// ─── Settings Tab ───
function SettingsTab() {
  const settings = useQuery(api.siteSettings.getDoctorSettings);
  const setSetting = useMutation(api.siteSettings.set);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<Record<string, string>>({
    doctorNameAr: "",
    doctorNameEn: "",
    whatsappNumber: "",
    phone: "",
    email: "",
    addressAr: "",
    addressEn: "",
    biographyAr: "",
    biographyEn: "",
    specializationsAr: "",
    specializationsEn: "",
    educationAr: "",
    educationEn: "",
    heroTitleAr: "",
    heroTitleEn: "",
    heroSubtitleAr: "",
    heroSubtitleEn: "",
    instagram: "",
    facebook: "",
    twitter: "",
    snapchat: "",
    tiktok: "",
    workingHoursWeekdays: "9 AM - 6 PM",
    workingHoursFriday: "",
    workingHoursSaturday: "",
  });

  const [initialized, setInitialized] = useState(false);
  if (settings && !initialized) {
    setForm({
      doctorNameAr: settings.doctorNameAr || "",
      doctorNameEn: settings.doctorNameEn || "",
      whatsappNumber: settings.whatsappNumber || "",
      phone: settings.phone || "",
      email: settings.email || "",
      addressAr: settings.addressAr || "",
      addressEn: settings.addressEn || "",
      biographyAr: settings.biographyAr || "",
      biographyEn: settings.biographyEn || "",
      specializationsAr: settings.specializationsAr || "",
      specializationsEn: settings.specializationsEn || "",
      educationAr: settings.educationAr || "",
      educationEn: settings.educationEn || "",
      heroTitleAr: settings.heroTitleAr || "",
      heroTitleEn: settings.heroTitleEn || "",
      heroSubtitleAr: settings.heroSubtitleAr || "",
      heroSubtitleEn: settings.heroSubtitleEn || "",
      instagram: settings.socialMedia?.instagram || "",
      facebook: settings.socialMedia?.facebook || "",
      twitter: settings.socialMedia?.twitter || "",
      snapchat: settings.socialMedia?.snapchat || "",
      tiktok: settings.socialMedia?.tiktok || "",
      workingHoursWeekdays: settings.workingHoursWeekdays || "9 AM - 6 PM",
      workingHoursFriday: settings.workingHoursFriday || "",
      workingHoursSaturday: settings.workingHoursSaturday || "",
    });
    setInitialized(true);
  }

  const updateField = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      // MERGE with existing settings to preserve any other fields
      await setSetting({
        key: "doctor",
        value: {
          ...settings,
          doctorNameAr: form.doctorNameAr,
          doctorNameEn: form.doctorNameEn,
          whatsappNumber: form.whatsappNumber,
          phone: form.phone,
          email: form.email,
          addressAr: form.addressAr,
          addressEn: form.addressEn,
          biographyAr: form.biographyAr,
          biographyEn: form.biographyEn,
          specializationsAr: form.specializationsAr,
          specializationsEn: form.specializationsEn,
          educationAr: form.educationAr,
          educationEn: form.educationEn,
          heroTitleAr: form.heroTitleAr,
          heroTitleEn: form.heroTitleEn,
          heroSubtitleAr: form.heroSubtitleAr,
          heroSubtitleEn: form.heroSubtitleEn,
          workingHoursWeekdays: form.workingHoursWeekdays,
          workingHoursFriday: form.workingHoursFriday,
          workingHoursSaturday: form.workingHoursSaturday,
          socialMedia: {
            instagram: form.instagram,
            facebook: form.facebook,
            twitter: form.twitter,
            snapchat: form.snapchat,
            tiktok: form.tiktok,
          },
        },
      });
      toast.success("Settings saved successfully!");
    } catch (e) {
      toast.error("Failed to save settings. Make sure you're logged in as admin.");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground px-6 gap-2">
          {saving ? "Saving..." : "Save All Settings"}
        </Button>
      </div>

      {/* Doctor / Clinic Info */}
      <Card className="border-border/60">
        <CardHeader><CardTitle className="text-lg">Doctor / Clinic Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Doctor Name (EN)</Label><Input value={form.doctorNameEn} onChange={(e) => updateField("doctorNameEn", e.target.value)} /></div>
            <div className="space-y-2"><Label>Doctor Name (AR)</Label><Input dir="rtl" value={form.doctorNameAr} onChange={(e) => updateField("doctorNameAr", e.target.value)} /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>WhatsApp Number</Label><Input value={form.whatsappNumber} onChange={(e) => updateField("whatsappNumber", e.target.value)} placeholder="+966XXXXXXXXX" /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} /></div>
          </div>
          <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Address (EN)</Label><Textarea rows={2} value={form.addressEn} onChange={(e) => updateField("addressEn", e.target.value)} /></div>
            <div className="space-y-2"><Label>Address (AR)</Label><Textarea dir="rtl" rows={2} value={form.addressAr} onChange={(e) => updateField("addressAr", e.target.value)} /></div>
          </div>
        </CardContent>
      </Card>

      {/* Doctor Profile */}
      <Card className="border-border/60">
        <CardHeader><CardTitle className="text-lg">Doctor Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Biography (EN)</Label><Textarea rows={3} value={form.biographyEn} onChange={(e) => updateField("biographyEn", e.target.value)} placeholder="Doctor biography in English..." /></div>
            <div className="space-y-2"><Label>Biography (AR)</Label><Textarea dir="rtl" rows={3} value={form.biographyAr} onChange={(e) => updateField("biographyAr", e.target.value)} placeholder="السيرة الذاتية بالعربية..." /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Specializations (EN)</Label><Input value={form.specializationsEn} onChange={(e) => updateField("specializationsEn", e.target.value)} placeholder="e.g. Rhinoplasty, Facelift, Botox" /></div>
            <div className="space-y-2"><Label>Specializations (AR)</Label><Input dir="rtl" value={form.specializationsAr} onChange={(e) => updateField("specializationsAr", e.target.value)} placeholder="مثلاً تجميل الأنف، شد الوجه، البوتوكس" /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Education (EN)</Label><Input value={form.educationEn} onChange={(e) => updateField("educationEn", e.target.value)} placeholder="e.g. MD, Board Certified in Plastic Surgery" /></div>
            <div className="space-y-2"><Label>Education (AR)</Label><Input dir="rtl" value={form.educationAr} onChange={(e) => updateField("educationAr", e.target.value)} placeholder="مثلاً دكتوراه في الطب، شهادة البورد" /></div>
          </div>
        </CardContent>
      </Card>

      {/* Hero Content */}
      <Card className="border-border/60">
        <CardHeader><CardTitle className="text-lg">Hero Section</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Hero Title (EN)</Label><Input value={form.heroTitleEn} onChange={(e) => updateField("heroTitleEn", e.target.value)} placeholder="Your Beauty Deserves" /></div>
            <div className="space-y-2"><Label>Hero Title (AR)</Label><Input dir="rtl" value={form.heroTitleAr} onChange={(e) => updateField("heroTitleAr", e.target.value)} placeholder="جمالك يستحق" /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Hero Highlight (EN)</Label><Input value={form.heroSubtitleEn} onChange={(e) => updateField("heroSubtitleEn", e.target.value)} placeholder="The Finest Care" /></div>
            <div className="space-y-2"><Label>Hero Highlight (AR)</Label><Input dir="rtl" value={form.heroSubtitleAr} onChange={(e) => updateField("heroSubtitleAr", e.target.value)} placeholder="أرقى العناية" /></div>
          </div>
        </CardContent>
      </Card>

      {/* Working Hours */}
      <Card className="border-border/60">
        <CardHeader><CardTitle className="text-lg">Working Hours</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2"><Label>Sun - Thu</Label><Input value={form.workingHoursWeekdays} onChange={(e) => updateField("workingHoursWeekdays", e.target.value)} placeholder="9 AM - 6 PM" /></div>
            <div className="space-y-2"><Label>Friday</Label><Input value={form.workingHoursFriday} onChange={(e) => updateField("workingHoursFriday", e.target.value)} placeholder="Closed" /></div>
            <div className="space-y-2"><Label>Saturday</Label><Input value={form.workingHoursSaturday} onChange={(e) => updateField("workingHoursSaturday", e.target.value)} placeholder="Closed" /></div>
          </div>
        </CardContent>
      </Card>

      {/* Social Media */}
      <Card className="border-border/60">
        <CardHeader><CardTitle className="text-lg">Social Media</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Instagram URL</Label><Input value={form.instagram} onChange={(e) => updateField("instagram", e.target.value)} placeholder="https://instagram.com/..." /></div>
            <div className="space-y-2"><Label>Facebook URL</Label><Input value={form.facebook} onChange={(e) => updateField("facebook", e.target.value)} placeholder="https://facebook.com/..." /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Twitter / X URL</Label><Input value={form.twitter} onChange={(e) => updateField("twitter", e.target.value)} placeholder="https://twitter.com/..." /></div>
            <div className="space-y-2"><Label>Snapchat URL</Label><Input value={form.snapchat} onChange={(e) => updateField("snapchat", e.target.value)} placeholder="https://snapchat.com/..." /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>TikTok URL</Label><Input value={form.tiktok} onChange={(e) => updateField("tiktok", e.target.value)} placeholder="https://tiktok.com/@..." /></div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground px-8">
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}

// ─── Media Upload Widget (standalone, for gallery) ───
function ImageUploadUploadWidget() {
  const { upload, uploading, error } = useImageUpload();
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    await upload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "w-full h-36 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all",
        dragOver
          ? "border-primary bg-primary/5"
          : "border-border/40 hover:border-primary/50 hover:bg-white/20",
        uploading && "opacity-50 pointer-events-none"
      )}
    >
      {uploading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Uploading...
        </div>
      ) : (
        <>
          <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm font-medium text-muted-foreground">
            Click or drag to upload
          </p>
          <p className="text-[11px] text-muted-foreground/60 mt-1">
            JPEG, PNG, WebP, GIF • Max 5MB
          </p>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        onChange={(e) => {
          const files = e.target.files;
          if (files) {
            Array.from(files).forEach((f) => handleFile(f));
          }
          e.target.value = "";
        }}
        className="hidden"
      />
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  );
}

// ─── Media Tab ───
function MediaTab() {
  const mediaItems = useQuery(api.media.list);
  const removeMedia = useMutation(api.media.remove);
  const [search, setSearch] = useState("");
  const [previewItem, setPreviewItem] = useState<
    { url: string; name: string; type: string; size: number; storageId: string; _id: string } | null
  >(null);
  const [deleteTarget, setDeleteTarget] = useState<{ _id: string; url: string; name: string } | null>(null);
  const deleteRefs = useQuery(api.media.checkReferences, deleteTarget ? { url: deleteTarget.url } : "skip");

  const filteredMedia = mediaItems?.filter((item) => {
    if (!search) return true;
    return item.name.toLowerCase().includes(search.toLowerCase());
  });

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard!");
  };

  const handleDelete = async (item: { _id: string; storageId: string; url: string; name: string }) => {
    setDeleteTarget({ _id: item._id, url: item.url, name: item.name });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeMedia({ id: deleteTarget._id as any });
      toast.success("Image deleted");
      if (previewItem?._id === deleteTarget._id) setPreviewItem(null);
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete image");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-foreground">Media Library</h2>
        <span className="text-sm text-muted-foreground">
          {mediaItems?.length ?? 0} images
        </span>
      </div>

      {/* Upload Area */}
      <Card className="border-border/60">
        <CardContent className="p-5">
          <ImageUploadUploadWidget />
        </CardContent>
      </Card>

      {/* Search */}
      {mediaItems && mediaItems.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Search images..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:max-w-xs"
          />
        </div>
      )}

      {/* Gallery Grid */}
      {!mediaItems || mediaItems.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="p-12 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg font-medium">No images yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Upload your first image above to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {(filteredMedia || []).map((item) => (
            <div
              key={item._id}
              className="group relative glass-card rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200"
              onClick={() => setPreviewItem(item)}
            >
              <div className="aspect-square overflow-hidden bg-muted/30">
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div className="p-2">
                <p className="text-xs font-medium text-foreground truncate">
                  {item.name}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-muted-foreground">
                    {formatSize(item.size)}
                  </p>
                  {item.uploadedAt && (
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(item.uploadedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              {/* Hover actions */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button
                  onClick={(e) => { e.stopPropagation(); handleCopyUrl(item.url); }}
                  className="p-2 rounded-full bg-white/90 hover:bg-white text-foreground shadow-md transition-colors"
                  title="Copy URL"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                  className="p-2 rounded-full bg-white/90 hover:bg-red-50 text-red-500 shadow-md transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="relative bg-background rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Image */}
            <div className="bg-black/20 flex items-center justify-center p-4">
              <img
                src={previewItem.url}
                alt={previewItem.name}
                className="max-h-[60vh] max-w-full object-contain rounded-lg"
              />
            </div>

            {/* Info & Actions */}
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {previewItem.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {previewItem.type} • {formatSize(previewItem.size)}
                  </p>
                </div>
              </div>

              {/* URL field */}
              <div className="flex gap-2">
                <Input
                  value={previewItem.url}
                  readOnly
                  className="font-mono text-xs flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyUrl(previewItem.url)}
                  className="shrink-0 gap-1"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  Copy
                </Button>
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(previewItem.url);
                    toast.success("URL copied! Paste it in any image field.");
                  }}
                  className="gap-1"
                >
                  Use in Procedure
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = previewItem.url;
                    link.download = previewItem.name;
                    link.click();
                  }}
                  className="gap-1"
                >
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete({ ...previewItem, url: previewItem.url })}
                  className="gap-1 text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation with Reference Check */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setDeleteTarget(null)}
        >
          <div className="relative bg-background rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Delete Image</h3>
                <p className="text-sm text-muted-foreground truncate">{deleteTarget.name}</p>
              </div>
            </div>

            {deleteRefs && deleteRefs.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-amber-600 font-medium">This image is referenced by:</p>
                <ul className="space-y-1">
                  {deleteRefs.map((ref: string) => (
                    <li key={ref} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                      {ref}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground mt-2">Deleting this will break those references.</p>
              </div>
            ) : deleteRefs !== undefined ? (
              <p className="text-sm text-muted-foreground">This image is not referenced by any content.</p>
            ) : (
              <p className="text-sm text-muted-foreground">Checking references...</p>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button
                size="sm"
                variant={deleteRefs && deleteRefs.length > 0 ? "destructive" : "destructive"}
                disabled={deleteRefs === undefined}
                onClick={confirmDelete}
                className={deleteRefs && deleteRefs.length > 0 ? "" : "bg-red-600 text-white hover:bg-red-700"}
              >
                {deleteRefs && deleteRefs.length > 0 ? "Delete Anyway" : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
