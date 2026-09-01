import { useI18n } from "@/i18n";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Globe, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import doctorAvatar from "/assets/3.jpg";

const navLinks = [
  { key: "home" as const, href: "/#home" },
  { key: "about" as const, href: "/#about" },
  { key: "procedures" as const, href: "/#procedures" },
  { key: "beforeAfter" as const, href: "/before-after" },
  { key: "testimonials" as const, href: "/#testimonials" },
  { key: "faq" as const, href: "/#faq" },
  { key: "contact" as const, href: "/#contact" },
];

export default function GlassNavbar() {
  const { t, dir, toggleLocale } = useI18n();
  const { isAuthenticated, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isRtl = dir === "rtl";

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 glass-elevated"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 sm:h-18 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 shrink-0">
              <div className="relative">
                <img
                  src={doctorAvatar}
                  alt="Dr. AlHasan"
                  className="h-10 w-10 sm:h-11 sm:w-11 rounded-full object-cover border-2 border-primary/30 shadow-sm"
                />
                <div className="absolute -bottom-0.5 -end-0.5 h-3 w-3 rounded-full bg-green-400 border-2 border-white" />
              </div>
              <span className="font-serif-luxury text-lg sm:text-xl font-semibold text-foreground tracking-tight">
                {t.nav.logo}
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.key}
                  to={link.href}
                  className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-white/40"
                >
                  {t.nav[link.key]}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Language Toggle */}
              <button
                onClick={toggleLocale}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-white/40"
                aria-label="Switch language"
              >
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">{t.common.switchLang}</span>
              </button>

              {/* Dashboard Link (authenticated) */}
              {isAuthenticated && (
                <Link to="/dashboard">
                  <Button
                    size="sm"
                    variant="outline"
                    className="hidden md:inline-flex rounded-full px-4 gap-2"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
              )}

              {/* Book Consultation CTA */}
              <Link to="/consultation">
                <Button
                  size="sm"
                  className="hidden md:inline-flex bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-5 shadow-sm"
                >
                  {t.nav.bookConsultation}
                </Button>
              </Link>

              {/* Mobile Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/40 transition-colors text-foreground"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />

            {/* Menu Panel */}
            <motion.nav
              initial={{ x: isRtl ? "100%" : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? "100%" : "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`absolute top-0 ${isRtl ? "right-0" : "left-0"} h-full w-72 sm:w-80 glass-elevated shadow-2xl`}
              dir={dir}
            >
              <div className="flex items-center justify-between p-4 border-b border-border/40">
                <Link to="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                  <img
                    src={doctorAvatar}
                    alt="Dr. AlHasan"
                    className="h-9 w-9 rounded-full object-cover border-2 border-primary/30"
                  />
                  <span className="font-serif-luxury text-lg font-semibold">{t.nav.logo}</span>
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/40"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-col p-4 gap-1">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.key}
                    initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={link.href}
                      className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/40 rounded-xl transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      {t.nav[link.key]}
                    </Link>
                  </motion.div>
                ))}

                {/* Before/After Page Link */}
                <motion.div
                  initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navLinks.length * 0.05 }}
                >
                  <Link
                    to="/before-after"
                    className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/40 rounded-xl transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t.nav.beforeAfter}
                  </Link>
                </motion.div>
              </div>

              <div className="p-4 border-t border-border/40 space-y-3">
                {/* Dashboard Link (mobile) */}
                {isAuthenticated && (
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full rounded-full gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                )}
                <Link to="/booking" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full rounded-full bg-primary text-primary-foreground">
                    {t.nav.bookConsultation}
                  </Button>
                </Link>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
