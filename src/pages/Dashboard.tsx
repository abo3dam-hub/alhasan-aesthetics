import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  LayoutDashboard,
  LogOut,
  FileText,
  Star,
  HelpCircle,
  CalendarClock,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Users,
  Bell,
  Settings,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router";
import { cn } from "@/lib/utils";

type Tab = "overview" | "procedures" | "testimonials" | "faq" | "bookings" | "consultations" | "notifications";

const tabs: { key: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "procedures", label: "Procedures", icon: FileText },
  { key: "testimonials", label: "Testimonials", icon: Star },
  { key: "faq", label: "FAQ", icon: HelpCircle },
  { key: "bookings", label: "Bookings", icon: CalendarClock },
  { key: "consultations", label: "Consultations", icon: MessageSquare },
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
      {/* Top Bar */}
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
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Tabs */}
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

          {/* Content */}
          <main className="flex-1 min-w-0">
            {activeTab === "overview" && <OverviewTab />}
            {activeTab === "procedures" && <ProceduresTab />}
            {activeTab === "testimonials" && <TestimonialsTab />}
            {activeTab === "faq" && <FaqTab />}
            {activeTab === "bookings" && <BookingsTab />}
            {activeTab === "consultations" && <ConsultationsTab />}
          </main>
        </div>
      </div>
    </div>
  );
}

// ─── Overview Tab ───
function OverviewTab() {
  const bookings = useQuery(api.bookings.list);
  const consultations = useQuery(api.consultations.list);
  const procedures = useQuery(api.procedures.list);

  const pendingBookings = bookings?.filter((b) => b.status === "pending").length ?? 0;
  const totalConsultations = consultations?.length ?? 0;
  const newConsultations = consultations?.filter((c) => c.status === "new").length ?? 0;
  const totalProcedures = procedures?.length ?? 0;

  const stats = [
    { label: "Total Procedures", value: totalProcedures, icon: FileText, color: "text-blue-500 bg-blue-50" },
    { label: "Pending Bookings", value: pendingBookings, icon: Clock, color: "text-amber-500 bg-amber-50" },
    { label: "Total Consultations", value: totalConsultations, icon: MessageSquare, color: "text-green-500 bg-green-50" },
    { label: "New Messages", value: newConsultations, icon: Bell, color: "text-red-500 bg-red-50" },
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

      {/* Recent Bookings */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {!bookings || bookings.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No bookings yet.</p>
          ) : (
            <div className="space-y-3">
              {bookings.slice(0, 5).map((booking) => (
                <div key={booking._id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                  <div>
                    <p className="font-medium text-foreground text-sm">{booking.patientName}</p>
                    <p className="text-xs text-muted-foreground">{booking.procedureType} • {booking.preferredDate}</p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
              ))}
            </div>
          )}
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
        <Button onClick={() => setShowForm(!showForm)} className="gap-2 bg-primary text-primary-foreground">
          <Plus className="h-4 w-4" />
          Add Procedure
        </Button>
      </div>

      {showForm && (
        <ProcedureForm
          onSubmit={async (data) => {
            await createProcedure(data);
            setShowForm(false);
            toast.success("Procedure created");
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="space-y-3">
        {!procedures || procedures.length === 0 ? (
          <Card className="border-border/60">
            <CardContent className="p-8 text-center text-muted-foreground">
              No procedures yet. Add your first procedure to get started.
            </CardContent>
          </Card>
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
                    onClick={() => handleToggleActive(proc._id, proc.isActive)}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      proc.isActive ? "text-green-600 hover:bg-green-50" : "text-muted-foreground hover:bg-muted"
                    )}
                    title={proc.isActive ? "Active" : "Inactive"}
                  >
                    {proc.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(proc._id)}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
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
}: {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}) {
  const [loading, setLoading] = useState(false);
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
      icon: (fd.get("icon") as string) || "✦",
      category: (fd.get("category") as string) || "general",
      duration: (fd.get("duration") as string) || "1-2 hours",
      recovery: (fd.get("recovery") as string) || "1-2 weeks",
      isActive: true,
      order: 0,
    });
    setLoading(false);
  };

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-lg">Add New Procedure</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Title (English)</Label>
              <Input name="titleEn" required placeholder="Rhinoplasty" />
            </div>
            <div className="space-y-2">
              <Label>Title (Arabic)</Label>
              <Input name="titleAr" dir="rtl" required placeholder="تجميل الأنف" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input name="slug" required placeholder="rhinoplasty" />
            </div>
            <div className="space-y-2">
              <Label>Icon (emoji)</Label>
              <Input name="icon" placeholder="✦" />
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Input name="category" placeholder="face" />
            </div>
            <div className="space-y-2">
              <Label>Duration</Label>
              <Input name="duration" placeholder="1-2 hours" />
            </div>
            <div className="space-y-2">
              <Label>Recovery</Label>
              <Input name="recovery" placeholder="1-2 weeks" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Short Description (English)</Label>
            <Textarea name="descriptionEn" rows={2} required placeholder="Brief description..." />
          </div>
          <div className="space-y-2">
            <Label>Short Description (Arabic)</Label>
            <Textarea name="descriptionAr" dir="rtl" rows={2} required placeholder="وصف مختصر..." />
          </div>
          <div className="space-y-2">
            <Label>Full Description (English)</Label>
            <Textarea name="longDescriptionEn" rows={4} required placeholder="Detailed description..." />
          </div>
          <div className="space-y-2">
            <Label>Full Description (Arabic)</Label>
            <Textarea name="longDescriptionAr" dir="rtl" rows={4} required placeholder="وصف تفصيلي..." />
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground">
              {loading ? "Saving..." : "Save Procedure"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
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
          <Plus className="h-4 w-4" />
          Add Testimonial
        </Button>
      </div>

      {showForm && (
        <Card className="border-border/60">
          <CardHeader><CardTitle className="text-lg">Add Testimonial</CardTitle></CardHeader>
          <CardContent>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                await createTestimonial({
                  nameAr: fd.get("nameAr") as string,
                  nameEn: fd.get("nameEn") as string,
                  textAr: fd.get("textAr") as string,
                  textEn: fd.get("textEn") as string,
                  rating: Number(fd.get("rating") as string) || 5,
                  isActive: true,
                  order: 0,
                });
                setShowForm(false);
                toast.success("Testimonial added");
              }}
              className="space-y-4"
            >
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
        ) : (
          testimonials.map((t) => (
            <Card key={t._id} className="border-border/60">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{t.nameEn}</p>
                    <div className="flex">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
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
          ))
        )}
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
          <Plus className="h-4 w-4" />
          Add FAQ
        </Button>
      </div>

      {showForm && (
        <Card className="border-border/60">
          <CardHeader><CardTitle className="text-lg">Add FAQ</CardTitle></CardHeader>
          <CardContent>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                await createFaq({
                  questionAr: fd.get("questionAr") as string,
                  questionEn: fd.get("questionEn") as string,
                  answerAr: fd.get("answerAr") as string,
                  answerEn: fd.get("answerEn") as string,
                  isActive: true,
                  order: 0,
                });
                setShowForm(false);
                toast.success("FAQ added");
              }}
              className="space-y-4"
            >
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
        ) : (
          faqs.map((f) => (
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
          ))
        )}
      </div>
    </div>
  );
}

// ─── Bookings Tab ───
function BookingsTab() {
  const bookings = useQuery(api.bookings.list);
  const updateStatus = useMutation(api.bookings.updateStatus);

  const handleStatusChange = async (id: string, status: string) => {
    await updateStatus({ id: id as any, status: status as any });
    toast.success("Booking updated");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Bookings</h2>
      <div className="space-y-3">
        {!bookings || bookings.length === 0 ? (
          <Card className="border-border/60"><CardContent className="p-8 text-center text-muted-foreground">No bookings yet.</CardContent></Card>
        ) : (
          bookings.map((b) => (
            <Card key={b._id} className="border-border/60">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{b.patientName}</p>
                    <p className="text-sm text-muted-foreground">
                      {b.patientEmail} • {b.patientPhone}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {b.procedureType} • {b.preferredDate} at {b.preferredTime}
                    </p>
                    {b.message && <p className="text-sm text-muted-foreground mt-1 italic">"{b.message}"</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={b.status} />
                    <select
                      value={b.status}
                      onChange={(e) => handleStatusChange(b._id, e.target.value)}
                      className="text-sm border border-border/60 rounded-lg px-2 py-1 bg-background"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
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

// ─── Consultations Tab ───
function ConsultationsTab() {
  const consultations = useQuery(api.consultations.list);
  const updateStatus = useMutation(api.consultations.updateStatus);

  const handleStatusChange = async (id: string, status: string) => {
    await updateStatus({ id: id as any, status: status as any });
    toast.success("Consultation updated");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Consultation Requests</h2>
      <div className="space-y-3">
        {!consultations || consultations.length === 0 ? (
          <Card className="border-border/60"><CardContent className="p-8 text-center text-muted-foreground">No consultation requests yet.</CardContent></Card>
        ) : (
          consultations.map((c) => (
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
                  <select
                    value={c.status}
                    onChange={(e) => handleStatusChange(c._id, e.target.value)}
                    className="text-sm border border-border/60 rounded-lg px-2 py-1 bg-background shrink-0"
                  >
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Status Badge Component ───
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string }> = {
    pending: { label: "Pending", color: "bg-amber-100 text-amber-700" },
    confirmed: { label: "Confirmed", color: "bg-green-100 text-green-700" },
    completed: { label: "Completed", color: "bg-blue-100 text-blue-700" },
    cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700" },
    new: { label: "New", color: "bg-blue-100 text-blue-700" },
    read: { label: "Read", color: "bg-gray-100 text-gray-700" },
    replied: { label: "Replied", color: "bg-green-100 text-green-700" },
    archived: { label: "Archived", color: "bg-gray-100 text-gray-500" },
  };

  const c = config[status] ?? { label: status, color: "bg-gray-100 text-gray-500" };

  return (
    <span className={cn("inline-flex px-2 py-0.5 rounded-full text-xs font-medium", c.color)}>
      {c.label}
    </span>
  );
}
