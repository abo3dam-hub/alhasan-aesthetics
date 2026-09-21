import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { MediaSelector } from "@/components/MediaSelector";
import { Loader2 } from "lucide-react";

export default function DashboardSettingsTab() {
  const settings = useQuery(api.siteSettings.getDoctorSettings);
  const setSetting = useMutation(api.siteSettings.set);
  const [saving, setSaving] = useState(false);

  // Admin accounts management
  const users = useQuery(api.users.listUsers);
  const isLoadingUsers = useQuery(api.users.listUsers) === undefined;
  const promoteUser = useMutation(api.users.promoteUser);
  const [promoteEmail, setPromoteEmail] = useState("");
  const [isPromoting, setIsPromoting] = useState(false);

  const handlePromoteUser = async () => {
    if (!promoteEmail.trim()) return;
    setIsPromoting(true);
    try {
      await promoteUser({ email: promoteEmail.trim() });
      toast.success(`User promoted to admin!`);
      setPromoteEmail("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to promote user");
    } finally {
      setIsPromoting(false);
    }
  };

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
    navbarPhoto: "",
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
      navbarPhoto: settings.navbarPhoto || "",
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
          navbarPhoto: form.navbarPhoto,
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
    } catch {
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
          <div className="space-y-2"><Label>Navbar Photo</Label><MediaSelector value={form.navbarPhoto} onChange={(val) => updateField("navbarPhoto", val)} label="Select navbar photo" hint="يُزرع صغيرًا ودائريًا في الشريط العلوي — يُنصح 1:1 مع الوجه بالمنتصف" /></div>
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

      {/* Admin Accounts Management */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Admin Accounts / إدارة حسابات الإدارة</h2>
          <p className="text-sm text-muted-foreground">
            Maximum 2 admin accounts allowed. Enter email to promote an existing user to admin.
          </p>
        </div>
        
        {/* Promote User Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="promoteEmail">Email to Promote</Label>
            <Input
              id="promoteEmail"
              type="email"
              placeholder="Enter user email..."
              value={promoteEmail}
              onChange={(e) => setPromoteEmail(e.target.value)}
              disabled={isPromoting}
            />
          </div>
          <Button
            onClick={handlePromoteUser}
            disabled={isPromoting || !promoteEmail}
            className="w-full"
          >
            {isPromoting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Promoting...
              </>
            ) : (
              "Promote to Admin"
            )}
          </Button>
        </div>
        
        {/* Current Users List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Current Users</h3>
            <p className="text-xs text-muted-foreground">
              {users?.length} total
            </p>
          </div>
          
          {isLoadingUsers ? (
            <div className="text-center py-4">
              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
            </div>
          ) : users?.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No users found</p>
          ) : (
            <div className="divide-y">
              {(users ?? []).map((user) => (
                <div key={user._id} className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted/50 text-muted-foreground">
                        {user.name || user.email?.slice(0, 1).toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user.name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <span
                      className={`
                        px-2 py-0.5 text-xs font-medium rounded-full
                        ${user.role === "admin"
                          ? "bg-green-100 text-green-800"
                          : user.role === "member"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                        }
                      `}
                    >
                      {user.role === "admin" ? "Admin" : user.role === "member" ? "Member" : "User"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end" role="status" aria-live="polite">
        <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground px-8">
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}