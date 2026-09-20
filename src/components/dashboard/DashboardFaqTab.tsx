import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Eye, EyeOff, FileText, Plus, Trash2 } from "lucide-react";
import { swapOrder } from "./dashboard-utils";
import type { Id } from "@/convex/_generated/dataModel";

export default function DashboardFaqTab() {
  const faqs = useQuery(api.faq.list);
  const createFaq = useMutation(api.faq.create);
  const updateFaq = useMutation(api.faq.update);
  const removeFaq = useMutation(api.faq.remove);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<Id<"faq"> | null>(null);
  const [search, setSearch] = useState("");
  const existing = editingId ? faqs?.find((f) => f._id === editingId) : null;

  const filteredFaqs = faqs?.filter((f) => {
    return !search || f.questionEn.toLowerCase().includes(search.toLowerCase()) || f.questionAr.includes(search) || f.answerEn.toLowerCase().includes(search.toLowerCase());
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      questionAr: fd.get("questionAr") as string,
      questionEn: fd.get("questionEn") as string,
      answerAr: fd.get("answerAr") as string,
      answerEn: fd.get("answerEn") as string,
      category: (fd.get("category") as string) || undefined,
    };
    if (editingId) {
      await updateFaq({ id: editingId, ...data });
      toast.success("FAQ updated");
    } else {
      await createFaq({ ...data, isActive: true, order: faqs?.length ?? 0 });
      toast.success("FAQ added");
    }
    setShowForm(false);
    setEditingId(null);
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
                  <button disabled={faqs!.indexOf(f) === 0} onClick={() => swapOrder(faqs!, faqs!.indexOf(f), "up", updateFaq)} className="p-1 rounded text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors"><ArrowUp className="h-3 w-3" /></button>
                  <button disabled={faqs!.indexOf(f) === faqs!.length - 1} onClick={() => swapOrder(faqs!, faqs!.indexOf(f), "down", updateFaq)} className="p-1 rounded text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors"><ArrowDown className="h-3 w-3" /></button>
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