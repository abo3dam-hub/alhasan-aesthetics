import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  FileText,
  Newspaper,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaSelector } from "@/components/MediaSelector";
import type { Id } from "@/convex/_generated/dataModel";

export default function ArticlesTab() {
  const articles = useQuery(api.articles.list);
  const procedures = useQuery(api.procedures.list);
  const createArticle = useMutation(api.articles.create);
  const updateArticle = useMutation(api.articles.update);
  const removeArticle = useMutation(api.articles.remove);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<Id<"articles"> | null>(null);
  const [search, setSearch] = useState("");
  const [filterPublished, setFilterPublished] = useState<
    "all" | "published" | "draft"
  >("all");

  const filtered = articles?.filter((a) => {
    const matchesSearch =
      !search ||
      a.titleEn.toLowerCase().includes(search.toLowerCase()) ||
      a.titleAr.includes(search) ||
      a.slug.includes(search.toLowerCase());
    const matchesFilter =
      filterPublished === "all" ||
      (filterPublished === "published" ? a.isPublished : !a.isPublished);
    return matchesSearch && matchesFilter;
  });

  const handleTogglePublished = async (
    id: Id<"articles">,
    isPublished: boolean,
  ) => {
    await updateArticle({ id, isPublished: !isPublished });
    toast.success(isPublished ? "Article moved to drafts" : "Article published");
  };

  const handleDelete = async (id: Id<"articles">) => {
    if (confirm("Are you sure you want to delete this article?")) {
      await removeArticle({ id });
      toast.success("Article deleted");
    }
  };

  const swapOrder = async (index: number, direction: "up" | "down") => {
    if (!articles) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= articles.length) return;
    const current = articles[index];
    const target = articles[targetIndex];
    await Promise.all([
      updateArticle({ id: current._id, order: target.order }),
      updateArticle({ id: target._id, order: current.order }),
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Articles</h2>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
          }}
          className="gap-2 bg-primary text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Add Article
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <select
          value={filterPublished}
          onChange={(e) =>
            setFilterPublished(e.target.value as "all" | "published" | "draft")
          }
          className="border border-border/60 rounded-lg px-3 py-2 bg-background text-sm"
        >
          <option value="all">All</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </select>
      </div>

      {showForm && (
        <ArticleForm
          editingId={editingId}
          procedures={procedures ?? []}
          nextOrder={(articles ?? []).reduce(
            (max, a) => Math.max(max, a.order),
            0,
          ) + 1}
          onSubmit={async (data) => {
            if (editingId) {
              await updateArticle({ id: editingId, ...data });
              toast.success("Article updated");
            } else {
              await createArticle(data);
              toast.success("Article created");
            }
            setShowForm(false);
            setEditingId(null);
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingId(null);
          }}
        />
      )}

      <div className="space-y-3">
        {!articles ? (
          <Card className="border-border/60">
            <CardContent className="p-8 text-center text-muted-foreground">
              Loading articles...
            </CardContent>
          </Card>
        ) : articles.length === 0 ? (
          <Card className="border-border/60">
            <CardContent className="p-8 text-center text-muted-foreground">
              No articles yet.
            </CardContent>
          </Card>
        ) : (filtered ?? []).length === 0 ? (
          <Card className="border-border/60">
            <CardContent className="p-8 text-center text-muted-foreground">
              No articles match your search.
            </CardContent>
          </Card>
        ) : (
          (filtered ?? []).map((article, index) => (
            <Card key={article._id} className="border-border/60">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Newspaper className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {article.titleEn}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {article.titleAr} · {article.slug}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setEditingId(article._id);
                      setShowForm(true);
                    }}
                    className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                    title="Edit"
                    aria-label="Edit"
                  >
                    <FileText className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() =>
                      handleTogglePublished(article._id, article.isPublished)
                    }
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      article.isPublished
                        ? "text-green-600 hover:bg-green-50"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                    title={article.isPublished ? "Unpublish" : "Publish"}
                  >
                    {article.isPublished ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={async () => {
                      await updateArticle({
                        id: article._id,
                        isFeatured: !article.isFeatured,
                      });
                      toast.success(article.isFeatured ? "Unfeatured" : "Featured");
                    }}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      article.isFeatured
                        ? "text-amber-500 hover:bg-amber-50"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                    title="Feature"
                  >
                    <Star
                      className={cn("h-4 w-4", article.isFeatured && "fill-amber-400")}
                    />
                  </button>
                  <button
                    onClick={() => handleDelete(article._id)}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="flex flex-col gap-0.5 border-s border-border/40 ps-2 ms-1">
                    <button
                      disabled={index === 0}
                      onClick={() => swapOrder(index, "up")}
                      className="p-1 rounded text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors"
                      aria-label="Move up"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                      disabled={index === articles.length - 1}
                      onClick={() => swapOrder(index, "down")}
                      className="p-1 rounded text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors"
                      aria-label="Move down"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
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

interface ArticleFormProps {
  onSubmit: (data: ArticleFormData) => Promise<void>;
  onCancel: () => void;
  editingId: Id<"articles"> | null;
  procedures: { _id: Id<"procedures">; slug: string; titleEn: string }[];
  nextOrder: number;
}

interface ArticleFormData {
  slug: string;
  titleAr: string;
  titleEn: string;
  excerptAr: string;
  excerptEn: string;
  bodyAr: string;
  bodyEn: string;
  coverImage?: string;
  categoryAr?: string;
  categoryEn?: string;
  relatedProcedureSlug?: string;
  seoTitleAr?: string;
  seoTitleEn?: string;
  seoDescriptionAr?: string;
  seoDescriptionEn?: string;
  ogImage?: string;
  publishDate?: number;
  updatedDate?: number;
  readingMinutes?: number;
  isPublished: boolean;
  isFeatured?: boolean;
  order: number;
}

function ArticleForm({
  onSubmit,
  onCancel,
  editingId,
  procedures,
  nextOrder,
}: ArticleFormProps) {
  const articles = useQuery(api.articles.list);
  const existing = editingId
    ? articles?.find((a) => a._id === editingId)
    : null;
  const [loading, setLoading] = useState(false);
  const [coverUrl, setCoverUrl] = useState(existing?.coverImage || "");
  const [ogImageUrl, setOgImageUrl] = useState(existing?.ogImage || "");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    await onSubmit({
      slug: (fd.get("slug") as string).trim(),
      titleAr: fd.get("titleAr") as string,
      titleEn: fd.get("titleEn") as string,
      excerptAr: fd.get("excerptAr") as string,
      excerptEn: fd.get("excerptEn") as string,
      bodyAr: fd.get("bodyAr") as string,
      bodyEn: fd.get("bodyEn") as string,
      coverImage: coverUrl || undefined,
      categoryAr: (fd.get("categoryAr") as string) || undefined,
      categoryEn: (fd.get("categoryEn") as string) || undefined,
      relatedProcedureSlug:
        (fd.get("relatedProcedureSlug") as string) || undefined,
      seoTitleAr: (fd.get("seoTitleAr") as string) || undefined,
      seoTitleEn: (fd.get("seoTitleEn") as string) || undefined,
      seoDescriptionAr: (fd.get("seoDescriptionAr") as string) || undefined,
      seoDescriptionEn: (fd.get("seoDescriptionEn") as string) || undefined,
      ogImage: ogImageUrl || undefined,
      publishDate: existing?.publishDate ?? Date.now(),
      updatedDate: existing ? Date.now() : undefined,
      readingMinutes:
        Number((fd.get("readingMinutes") as string) || 0) || undefined,
      isPublished: !!fd.get("isPublished"),
      isFeatured: !!fd.get("isFeatured"),
      order: existing?.order ?? nextOrder,
    });
    setLoading(false);
  };

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-lg">
          {editingId ? "Edit Article" : "Add New Article"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Title (English)</Label>
              <Input
                name="titleEn"
                required
                defaultValue={existing?.titleEn}
                placeholder="How Long Does a Facelift Last?"
              />
            </div>
            <div className="space-y-2">
              <Label>Title (Arabic)</Label>
              <Input
                name="titleAr"
                dir="rtl"
                required
                defaultValue={existing?.titleAr}
                placeholder="كم تدوم عملية شد الوجه؟"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                name="slug"
                required
                defaultValue={existing?.slug}
                placeholder="how-long-does-a-facelift-last"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category (English)</Label>
              <Input
                name="categoryEn"
                defaultValue={existing?.categoryEn}
                placeholder="Face"
              />
            </div>
            <div className="space-y-2">
              <Label>Category (Arabic)</Label>
              <Input
                name="categoryAr"
                dir="rtl"
                defaultValue={existing?.categoryAr}
                placeholder="الوجه"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Reading minutes</Label>
              <Input
                name="readingMinutes"
                type="number"
                min={1}
                defaultValue={existing?.readingMinutes ?? 3}
              />
            </div>
            <div className="space-y-2">
              <Label>Related procedure (optional)</Label>
              <select
                name="relatedProcedureSlug"
                defaultValue={existing?.relatedProcedureSlug || ""}
                className="w-full border border-border/60 rounded-lg px-3 py-2 bg-white/40 text-sm"
              >
                <option value="">None</option>
                {procedures.map((p) => (
                  <option key={p._id} value={p.slug}>
                    {p.titleEn} ({p.slug})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Excerpt (English)</Label>
              <Textarea
                name="excerptEn"
                required
                rows={3}
                defaultValue={existing?.excerptEn}
                placeholder="Short summary shown on the blog listing."
              />
            </div>
            <div className="space-y-2">
              <Label>Excerpt (Arabic)</Label>
              <Textarea
                name="excerptAr"
                dir="rtl"
                required
                rows={3}
                defaultValue={existing?.excerptAr}
                placeholder="ملخص قصير يظهر في قائمة المقالات."
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Body (English)</Label>
              <Textarea
                name="bodyEn"
                required
                rows={10}
                defaultValue={existing?.bodyEn}
                placeholder={"Separate paragraphs with a blank line.\nStart a line with '## ' to render it as a section heading."}
              />
            </div>
            <div className="space-y-2">
              <Label>Body (Arabic)</Label>
              <Textarea
                name="bodyAr"
                dir="rtl"
                required
                rows={10}
                defaultValue={existing?.bodyAr}
                placeholder={"افصل بين الفقرات بأسطر فارغة.\nابدأ السطر بـ \"## \" لجعله عنوان قسم."}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <MediaSelector
                value={coverUrl}
                onChange={setCoverUrl}
                label="Cover image"
                hint="Select a library image or paste a URL — the article header and listing card will use it."
              />
            </div>
            <div className="space-y-2">
              <MediaSelector
                value={ogImageUrl}
                onChange={setOgImageUrl}
                label="Open Graph image (optional)"
                hint="Used when the article is shared on WhatsApp / social media. Falls back to the cover image."
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>SEO Title (English)</Label>
              <Input name="seoTitleEn" defaultValue={existing?.seoTitleEn} placeholder="How Long Does a Facelift Last? | Dr. Al Hasan Al Saiem" />
            </div>
            <div className="space-y-2">
              <Label>SEO Title (Arabic)</Label>
              <Input name="seoTitleAr" dir="rtl" defaultValue={existing?.seoTitleAr} placeholder="كم تدوم عملية شد الوجه؟ | د. الحسن الصايم" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>SEO Description (English)</Label>
              <Textarea
                name="seoDescriptionEn"
                rows={2}
                defaultValue={existing?.seoDescriptionEn}
                placeholder="Meta description for search engines."
              />
            </div>
            <div className="space-y-2">
              <Label>SEO Description (Arabic)</Label>
              <Textarea
                name="seoDescriptionAr"
                dir="rtl"
                rows={2}
                defaultValue={existing?.seoDescriptionAr}
                placeholder="الوصف الظاهر في نتائج البحث."
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6 pt-2">
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input
                type="checkbox"
                name="isPublished"
                defaultChecked={existing?.isPublished ?? true}
                className="h-4 w-4 rounded border-border text-primary"
              />
              Published (visible on the public blog)
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input
                type="checkbox"
                name="isFeatured"
                defaultChecked={existing?.isFeatured ?? false}
                className="h-4 w-4 rounded border-border text-amber-500"
              />
              Featured
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground">
              {editingId ? "Save Changes" : "Create Article"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}