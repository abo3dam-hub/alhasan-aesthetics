import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { Database } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  LayoutDashboard,
  LogOut,
  FileText,
  Star,
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
} from "lucide-react";
import { useNavigate } from "react-router";
import { cn } from "@/lib/utils";

type Tab = "overview" | "procedures" | "beforeAfter" | "testimonials" | "faq" | "consultations" | "settings";

const tabs: { key: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "procedures", label: "Procedures", icon: FileText },
  { key: "beforeAfter", label: "Before & After", icon: ImageIcon },
  { key: "testimonials", label: "Testimonials", icon: Star },
  { key: "faq", label: "FAQ", icon: HelpCircle },
  { key: "consultations", label: "Contact Messages", icon: MessageSquare },
  { key: "settings", label: "Settings", icon: Settings },
];

const iconOptions = [
  "Eye", "UserRound", "SmilePlus", "Droplets", "Scissors", "Sparkles",
  "Heart", "ArrowUpDown", "Stethoscope", "Ban", "Star", "Shield",
  "Zap", "Activity", "Sun", "Moon",
];

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
            {activeTab === "procedures" && <ProceduresTab />}
            {activeTab === "beforeAfter" && <BeforeAfterTab />}
            {activeTab === "testimonials" && <TestimonialsTab />}
            {activeTab === "faq" && <FaqTab />}
            {activeTab === "consultations" && <ConsultationsTab />}
            {activeTab === "settings" && <SettingsTab />}
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
  const consultations = useQuery(api.consultations.list);
  const procedures = useQuery(api.procedures.list);
  const testimonials = useQuery(api.testimonials.list);
  const faqs = useQuery(api.faq.list);

  const totalConsultations = consultations?.length ?? 0;
  const newConsultations = consultations?.filter((c) => c.status === "new").length ?? 0;
  const totalProcedures = procedures?.length ?? 0;
  const totalTestimonials = testimonials?.length ?? 0;
  const totalFaqs = faqs?.length ?? 0;

  const stats = [
    { label: "Procedures", value: totalProcedures, icon: FileText, color: "text-blue-500 bg-blue-50" },
    { label: "Consultations", value: totalConsultations, icon: MessageSquare, color: "text-green-500 bg-green-50" },
    { label: "New Messages", value: newConsultations, icon: Bell, color: "text-red-500 bg-red-50" },
    { label: "Testimonials", value: totalTestimonials, icon: Star, color: "text-amber-500 bg-amber-50" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Dashboard Overview</h2>
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
          procedures.map((proc) => (
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
                    title="Edit"
                  >
                    <FileText className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(proc._id, proc.isActive)}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      proc.isActive ? "text-green-600 hover:bg-green-50" : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {proc.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button onClick={() => handleDelete(proc._id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
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
      category: (fd.get("category") as string) || "general",
      duration: (fd.get("duration") as string) || "1-2 hours",
      recovery: (fd.get("recovery") as string) || "1-2 weeks",
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
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input name="slug" required defaultValue={existing?.slug} placeholder="rhinoplasty" />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="relative">
                <button type="button" onClick={() => setShowIconPicker(!showIconPicker)} className="w-full flex items-center justify-between px-3 py-2 border border-border/60 rounded-lg bg-white/40 text-sm">
                  <span>{selectedIcon}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                {showIconPicker && (
                  <div className="absolute z-50 top-full mt-1 w-full bg-white rounded-xl shadow-lg border border-border/40 p-2 grid grid-cols-4 gap-1">
                    {iconOptions.map((icon) => (
                      <button key={icon} type="button" onClick={() => { setSelectedIcon(icon); setShowIconPicker(false); }} className={cn("p-2 rounded-lg text-sm text-center hover:bg-primary/10 transition-colors", selectedIcon === icon && "bg-primary/10 font-bold")}>
                        {icon}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2"><Label>Category</Label><Input name="category" defaultValue={existing?.category} placeholder="face" /></div>
            <div className="space-y-2"><Label>Duration</Label><Input name="duration" defaultValue={existing?.duration} placeholder="1-2 hours" /></div>
            <div className="space-y-2"><Label>Recovery</Label><Input name="recovery" defaultValue={existing?.recovery} placeholder="1-2 weeks" /></div>
          </div>
          <div className="space-y-2"><Label>Short Description (EN)</Label><Textarea name="descriptionEn" rows={2} required defaultValue={existing?.descriptionEn} placeholder="Brief description..." /></div>
          <div className="space-y-2"><Label>Short Description (AR)</Label><Textarea name="descriptionAr" dir="rtl" rows={2} required defaultValue={existing?.descriptionAr} placeholder="وصف مختصر..." /></div>
          <div className="space-y-2"><Label>Full Description (EN)</Label><Textarea name="longDescriptionEn" rows={4} required defaultValue={existing?.longDescriptionEn} placeholder="Detailed description..." /></div>
          <div className="space-y-2"><Label>Full Description (AR)</Label><Textarea name="longDescriptionAr" dir="rtl" rows={4} required defaultValue={existing?.longDescriptionAr} placeholder="وصف تفصيلي..." /></div>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Before & After</h2>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2 bg-primary text-primary-foreground">
          <Plus className="h-4 w-4" /> Add Case
        </Button>
      </div>

      {showForm && (
        <Card className="border-border/60">
          <CardHeader><CardTitle className="text-lg">Add Before & After Case</CardTitle></CardHeader>
          <CardContent>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                await createCase({
                  titleAr: fd.get("titleAr") as string,
                  titleEn: fd.get("titleEn") as string,
                  procedureType: fd.get("procedureType") as string,
                  beforeImage: fd.get("beforeImage") as string || "/assets/placeholder.jpg",
                  afterImage: fd.get("afterImage") as string || "/assets/placeholder.jpg",
                  descriptionAr: (fd.get("descriptionAr") as string) || undefined,
                  descriptionEn: (fd.get("descriptionEn") as string) || undefined,
                  isActive: true,
                  order: 0,
                });
                setShowForm(false);
                toast.success("Case added");
              }}
              className="space-y-4"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Title (EN)</Label><Input name="titleEn" required /></div>
                <div className="space-y-2"><Label>Title (AR)</Label><Input name="titleAr" dir="rtl" required /></div>
              </div>
              <div className="space-y-2">
                <Label>Procedure Type</Label>
                <select name="procedureType" className="w-full border border-border/60 rounded-lg px-3 py-2 bg-background text-sm">
                  {procedures?.map((p) => <option key={p._id} value={p.slug}>{p.titleEn}</option>)}
                </select>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Before Image URL</Label><Input name="beforeImage" placeholder="/assets/before.jpg" /></div>
                <div className="space-y-2"><Label>After Image URL</Label><Input name="afterImage" placeholder="/assets/after.jpg" /></div>
              </div>
              <div className="space-y-2"><Label>Description (EN)</Label><Textarea name="descriptionEn" rows={2} /></div>
              <div className="space-y-2"><Label>Description (AR)</Label><Textarea name="descriptionAr" dir="rtl" rows={2} /></div>
              <div className="flex gap-3">
                <Button type="submit" className="bg-primary text-primary-foreground">Save</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
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
                  <button onClick={async () => { await updateCase({ id: c._id, isActive: !c.isActive }); toast.success("Updated"); }} className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                    {c.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button onClick={async () => { await removeCase({ id: c._id }); toast.success("Deleted"); }} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Testimonials</h2>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2 bg-primary text-primary-foreground">
          <Plus className="h-4 w-4" /> Add Testimonial
        </Button>
      </div>

      {showForm && (
        <Card className="border-border/60">
          <CardHeader><CardTitle className="text-lg">Add Testimonial</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              await createTestimonial({ nameAr: fd.get("nameAr") as string, nameEn: fd.get("nameEn") as string, textAr: fd.get("textAr") as string, textEn: fd.get("textEn") as string, rating: Number(fd.get("rating") as string) || 5, isActive: true, order: 0 });
              setShowForm(false);
              toast.success("Testimonial added");
            }} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Name (EN)</Label><Input name="nameEn" required /></div>
                <div className="space-y-2"><Label>Name (AR)</Label><Input name="nameAr" dir="rtl" required /></div>
              </div>
              <div className="space-y-2"><Label>Text (EN)</Label><Textarea name="textEn" rows={3} required /></div>
              <div className="space-y-2"><Label>Text (AR)</Label><Textarea name="textAr" dir="rtl" rows={3} required /></div>
              <div className="space-y-2"><Label>Rating (1-5)</Label><Input name="rating" type="number" min={1} max={5} defaultValue={5} /></div>
              <div className="flex gap-3">
                <Button type="submit" className="bg-primary text-primary-foreground">Save</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
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
                <button onClick={async () => { await updateTestimonial({ id: t._id, isActive: !t.isActive }); toast.success("Updated"); }} className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                  {t.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button onClick={async () => { await removeTestimonial({ id: t._id }); toast.success("Deleted"); }} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">FAQ</h2>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2 bg-primary text-primary-foreground">
          <Plus className="h-4 w-4" /> Add FAQ
        </Button>
      </div>

      {showForm && (
        <Card className="border-border/60">
          <CardHeader><CardTitle className="text-lg">Add FAQ</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              await createFaq({ questionAr: fd.get("questionAr") as string, questionEn: fd.get("questionEn") as string, answerAr: fd.get("answerAr") as string, answerEn: fd.get("answerEn") as string, isActive: true, order: 0 });
              setShowForm(false);
              toast.success("FAQ added");
            }} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Question (EN)</Label><Input name="questionEn" required /></div>
                <div className="space-y-2"><Label>Question (AR)</Label><Input name="questionAr" dir="rtl" required /></div>
              </div>
              <div className="space-y-2"><Label>Answer (EN)</Label><Textarea name="answerEn" rows={3} required /></div>
              <div className="space-y-2"><Label>Answer (AR)</Label><Textarea name="answerAr" dir="rtl" rows={3} required /></div>
              <div className="flex gap-3">
                <Button type="submit" className="bg-primary text-primary-foreground">Save</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {!faqs || faqs.length === 0 ? (
          <Card className="border-border/60"><CardContent className="p-8 text-center text-muted-foreground">No FAQ items yet.</CardContent></Card>
        ) : faqs.map((f) => (
          <Card key={f._id} className="border-border/60">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium text-foreground truncate">{f.questionEn}</p>
                <p className="text-sm text-muted-foreground truncate max-w-md">{f.answerEn}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={async () => { await updateFaq({ id: f._id, isActive: !f.isActive }); toast.success("Updated"); }} className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                  {f.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button onClick={async () => { await removeFaq({ id: f._id }); toast.success("Deleted"); }} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Consultations Tab ───
function ConsultationsTab() {
  const consultations = useQuery(api.consultations.list);
  const updateStatus = useMutation(api.consultations.updateStatus);

  const handleStatusChange = async (id: string, status: string) => {
    await updateStatus({ id: id as any, status: status as any });
    toast.success("Updated");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Contact Messages</h2>
      <div className="space-y-3">
        {!consultations || consultations.length === 0 ? (
          <Card className="border-border/60"><CardContent className="p-8 text-center text-muted-foreground">No messages yet.</CardContent></Card>
        ) : consultations.map((c) => (
          <Card key={c._id} className="border-border/60">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{c.name}</p>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">{c.email}</p>
                  <p className="text-sm font-medium text-foreground mt-1">{c.subject}</p>
                  <p className="text-sm text-muted-foreground mt-1">{c.message}</p>
                </div>
                <select value={c.status} onChange={(e) => handleStatusChange(c._id, e.target.value)} className="text-sm border border-border/60 rounded-lg px-2 py-1 bg-background shrink-0">
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Settings Tab ───
function SettingsTab() {
  const settings = useQuery(api.siteSettings.getDoctorSettings);
  const setSetting = useMutation(api.siteSettings.set);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    doctorNameAr: "",
    doctorNameEn: "",
    whatsappNumber: "",
    phone: "",
    email: "",
    addressAr: "",
    addressEn: "",
    instagram: "",
    facebook: "",
    twitter: "",
    snapchat: "",
  });

  // Initialize form from settings once loaded
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
      instagram: settings.socialMedia?.instagram || "",
      facebook: settings.socialMedia?.facebook || "",
      twitter: settings.socialMedia?.twitter || "",
      snapchat: settings.socialMedia?.snapchat || "",
    });
    setInitialized(true);
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      await setSetting({
        key: "doctor",
        value: {
          doctorNameAr: form.doctorNameAr,
          doctorNameEn: form.doctorNameEn,
          whatsappNumber: form.whatsappNumber,
          phone: form.phone,
          email: form.email,
          addressAr: form.addressAr,
          addressEn: form.addressEn,
          socialMedia: {
            instagram: form.instagram,
            facebook: form.facebook,
            twitter: form.twitter,
            snapchat: form.snapchat,
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
      <h2 className="text-2xl font-bold text-foreground">Settings</h2>

      <Card className="border-border/60">
        <CardHeader><CardTitle className="text-lg">Doctor / Clinic Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Doctor Name (EN)</Label><Input value={form.doctorNameEn} onChange={(e) => setForm({ ...form, doctorNameEn: e.target.value })} /></div>
            <div className="space-y-2"><Label>Doctor Name (AR)</Label><Input dir="rtl" value={form.doctorNameAr} onChange={(e) => setForm({ ...form, doctorNameAr: e.target.value })} /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>WhatsApp Number</Label><Input value={form.whatsappNumber} onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })} placeholder="+966XXXXXXXXX" /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          </div>
          <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Address (EN)</Label><Textarea rows={2} value={form.addressEn} onChange={(e) => setForm({ ...form, addressEn: e.target.value })} /></div>
            <div className="space-y-2"><Label>Address (AR)</Label><Textarea dir="rtl" rows={2} value={form.addressAr} onChange={(e) => setForm({ ...form, addressAr: e.target.value })} /></div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader><CardTitle className="text-lg">Social Media</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Instagram URL</Label><Input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="https://instagram.com/..." /></div>
            <div className="space-y-2"><Label>Facebook URL</Label><Input value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} placeholder="https://facebook.com/..." /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Twitter / X URL</Label><Input value={form.twitter} onChange={(e) => setForm({ ...form, twitter: e.target.value })} placeholder="https://twitter.com/..." /></div>
            <div className="space-y-2"><Label>Snapchat URL</Label><Input value={form.snapchat} onChange={(e) => setForm({ ...form, snapchat: e.target.value })} placeholder="https://snapchat.com/..." /></div>
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

// ─── Status Badge ───
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string }> = {
    new: { label: "New", color: "bg-blue-100 text-blue-700" },
    read: { label: "Read", color: "bg-gray-100 text-gray-700" },
    replied: { label: "Replied", color: "bg-green-100 text-green-700" },
    archived: { label: "Archived", color: "bg-gray-100 text-gray-500" },
  };
  const c = config[status] ?? { label: status, color: "bg-gray-100 text-gray-500" };
  return <span className={cn("inline-flex px-2 py-0.5 rounded-full text-xs font-medium", c.color)}>{c.label}</span>;
}
