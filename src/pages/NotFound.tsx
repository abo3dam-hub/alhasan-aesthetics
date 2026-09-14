import { useI18n } from "@/i18n";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Home, ArrowRight, ArrowLeft, Stethoscope, Calendar } from "lucide-react";

export default function NotFound() {
  const { dir } = useI18n();
  const isRtl = dir === "rtl";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden" dir={dir}>
      {/* Background */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute top-16 left-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" aria-hidden="true" />
      <div className="absolute bottom-16 right-10 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" aria-hidden="true" />
      <div className="absolute top-1/4 right-1/4 h-40 w-40 rounded-full bg-primary/10 blur-2xl" aria-hidden="true" />
      <div className="absolute bottom-1/4 left-1/4 h-40 w-40 rounded-full bg-secondary/10 blur-2xl" aria-hidden="true" />

      <div className="relative text-center px-4">
        {/* Big 404 watermark */}
        <div className="animate-fade-up mb-8">
          <span className="text-[110px] sm:text-[180px] font-bold font-serif-luxury text-primary/10 leading-none select-none drop-shadow-sm">
            404
          </span>
        </div>

        {/* Glass card */}
        <div className="animate-fade-up-slow glass-elevated rounded-3xl p-8 sm:p-12 max-w-md mx-auto glow-champagne -mt-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-xs font-medium text-primary mb-6">
            <Stethoscope className="h-4 w-4" />
            {isRtl ? "جراحة تجميلية وطب تجميل" : "Aesthetic & Plastic Surgery"}
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-foreground mb-3">
            {isRtl ? "الصفحة غير موجودة" : "Page Not Found"}
          </h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            {isRtl
              ? "عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها. لا تقلق، يمكنك استكشاف الإجراءات أو حجز استشارة من هنا."
              : "Sorry, the page you're looking for doesn't exist or has been moved. You can explore our procedures or book a consultation instead."}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-7 gap-2 w-full sm:w-auto">
                <Home className="h-4 w-4" />
                {isRtl ? "الرئيسية" : "Home"}
              </Button>
            </Link>
            <Link to="/procedures">
              <Button variant="outline" className="rounded-full px-7 gap-2 w-full sm:w-auto">
                <Stethoscope className="h-4 w-4" />
                {isRtl ? "الإجراءات" : "Procedures"}
                <Arrow className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/consultation">
              <Button variant="outline" className="rounded-full px-7 gap-2 w-full sm:w-auto">
                <Calendar className="h-4 w-4" />
                {isRtl ? "حجز استشارة" : "Consultation"}
              </Button>
            </Link>
          </div>
        </div>

        {/* Small aide hint */}
        <p className="animate-fade-up-slow mt-8 text-xs text-muted-foreground/70">
          {isRtl
            ? "إن كتبت الرابط يدويًا، تأكد من كتابته بشكل صحيح"
            : "If you typed the address manually, please double-check the spelling"}
        </p>
      </div>
    </div>
  );
}