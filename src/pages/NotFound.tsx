import { useI18n } from "@/i18n";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, ArrowRight, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const { dir } = useI18n();
  const isRtl = dir === "rtl";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden" dir={dir}>
      {/* Background gradient */}
      <div className="absolute inset-0 hero-gradient" />

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-20 right-10 h-80 w-80 rounded-full bg-secondary/5 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative text-center px-4"
      >
        {/* Large 404 */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <span className="text-[120px] sm:text-[180px] font-bold font-serif-luxury text-primary/10 leading-none select-none">
            404
          </span>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-elevated rounded-3xl p-8 sm:p-12 max-w-md mx-auto glow-champagne"
        >
          <h1 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-foreground mb-3">
            {isRtl ? "الصفحة غير موجودة" : "Page Not Found"}
          </h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            {isRtl
              ? "عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها. لا تقلق، يمكنك العودة للصفحة الرئيسية."
              : "Sorry, the page you're looking for doesn't exist or has been moved. Don't worry, you can head back to the homepage."}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 gap-2">
                <Home className="h-4 w-4" />
                {isRtl ? "العودة للرئيسية" : "Back to Home"}
                <Arrow className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/consultation">
              <Button variant="outline" className="rounded-full px-8 gap-2">
                {isRtl ? "احجز استشارتك" : "Book Consultation"}
                <Arrow className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
