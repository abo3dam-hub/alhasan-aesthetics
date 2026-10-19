import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { useI18n } from "@/i18n";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { trackEvent } from "@/lib/track";
import { safeJsonLd } from "@/lib/jsonLd";
import { buildVCard, downloadVCard } from "@/lib/cardVcf";
import {
  Phone,
  Mail,
  MapPin,
  Globe,
  Instagram,
  Facebook,
  MessageCircle,
  CalendarCheck,
  QrCode,
  Nfc,
  Share2,
  Download,
  X,
  UserPlus,
  Languages,
  Copy,
  Check,
  Clock,
} from "lucide-react";
import "./CardPage.css";

const CARD_NAME = "Dr. Alhasan Alsaiem";
const CARD_URL = "https://dralhasanalsaiem.com/card";

/** Circular gold emblem recreating the doctor's reference logo (no standalone file exists). */
function CardEmblem() {
  return (
    <svg
      className="dcard-emblem"
      viewBox="0 0 120 120"
      role="img"
      aria-label={CARD_NAME}
    >
      <circle cx="60" cy="60" r="57" fill="none" stroke="#d4af6a" strokeWidth="1.6" />
      <circle cx="60" cy="60" r="51" fill="none" stroke="#d4af6a" strokeWidth="0.7" opacity="0.7" />
      {/* top flourish */}
      <path d="M48 26 h24" stroke="#d4af6a" strokeWidth="1" opacity="0.9" />
      <rect x="57.4" y="23.4" width="5.2" height="5.2" transform="rotate(45 60 26)" fill="#d4af6a" />
      <text
        x="60"
        y="56"
        textAnchor="middle"
        fill="#f0dcae"
        fontSize="12.5"
        fontFamily="'Playfair Display', Georgia, serif"
        letterSpacing="0.4"
      >
        Dr. Alhasan
      </text>
      <text
        x="60"
        y="73"
        textAnchor="middle"
        fill="#f0dcae"
        fontSize="12.5"
        fontFamily="'Playfair Display', Georgia, serif"
        letterSpacing="0.4"
      >
        Alsaiem
      </text>
      {/* bottom flourish */}
      <path d="M48 90 h24" stroke="#d4af6a" strokeWidth="1" opacity="0.9" />
      <rect x="57.4" y="87.4" width="5.2" height="5.2" transform="rotate(45 60 90)" fill="#d4af6a" />
    </svg>
  );
}

function splitList(raw: string): string[] {
  return raw
    .split(/[،,؛;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function CardPage() {
  const { t, locale, toggleLocale, dir } = useI18n();
  const isArabic = locale === "ar";
  const card = t.card;
  const doctor = useQuery(api.siteSettings.getDoctorSettings);

  const [qrOpen, setQrOpen] = useState(false);
  const [nfcOpen, setNfcOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // ── Real contact data (Convex doctor settings; production-verified fallbacks)
  const phone = doctor?.phone || "+963 933 178 794";
  const phoneHref = `tel:${phone.replace(/[^0-9+]/g, "")}`;
  const whatsappDigits = (doctor?.whatsappNumber || "963991301700").replace(/[^0-9]/g, "");
  const email = doctor?.email || "dr.alhassan@gmail.com";
  const instagram = doctor?.socialMedia?.instagram || "";
  const facebook = doctor?.socialMedia?.facebook || "";
  const bio = isArabic ? doctor?.biographyAr : doctor?.biographyEn;
  const profTitle = isArabic ? doctor?.educationAr : doctor?.educationEn;
  const specialties = useMemo(
    () => splitList(isArabic ? doctor?.specializationsAr || "" : doctor?.specializationsEn || ""),
    [doctor, isArabic],
  );
  const hours = isArabic
    ? doctor?.workingHoursWeekdays || "9 AM - 6 PM"
    : doctor?.workingHoursWeekdays || "9 AM - 6 PM";

  const clinics = useMemo(
    () => [
      {
        key: "damascus",
        label: card.clinics.damascus,
        maps: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Damascus, Syria")}`,
      },
      {
        key: "latakia",
        label: card.clinics.latakia,
        maps: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Latakia, Syria")}`,
      },
      {
        key: "dubai",
        label: card.clinics.dubai,
        maps: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Dubai, United Arab Emirates")}`,
      },
    ],
    [card],
  );

  // ── SEO: title / meta / canonical / OG + Physician JSON-LD
  useEffect(() => {
    document.title = card.pageTitle;
    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    setMeta("name", "description", card.metaDescription);
    setMeta("property", "og:title", card.pageTitle);
    setMeta("property", "og:description", card.metaDescription);
    setMeta("property", "og:type", "profile");
    setMeta("property", "og:url", CARD_URL);
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = CARD_URL;

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Physician",
      name: CARD_NAME,
      url: CARD_URL,
      telephone: phone,
      email,
      medicalSpecialty: "PlasticSurgery",
      address: [
        { "@type": "PostalAddress", addressLocality: "Damascus", addressCountry: "SY" },
        { "@type": "PostalAddress", addressLocality: "Latakia", addressCountry: "SY" },
        { "@type": "PostalAddress", addressLocality: "Dubai", addressCountry: "AE" },
      ],
      sameAs: [instagram, facebook].filter(Boolean),
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "dcard-jsonld";
    script.textContent = safeJsonLd(jsonLd);
    document.head.appendChild(script);
    return () => {
      document.getElementById("dcard-jsonld")?.remove();
    };
  }, [card, phone, email, instagram, facebook]);

  // ── Modal helpers: Escape to close + scroll lock
  useEffect(() => {
    if (!qrOpen && !nfcOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setQrOpen(false);
        setNfcOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [qrOpen, nfcOpen]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(id);
  }, [toast]);

  const showToast = (msg: string) => setToast(msg);

  const handleShare = async () => {
    trackEvent("card_share", "card");
    const data = { title: CARD_NAME, text: card.pageTitle, url: CARD_URL };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      throw new Error("no-share");
    } catch {
      try {
        await navigator.clipboard.writeText(CARD_URL);
        showToast(card.shareDone);
      } catch {
        showToast(CARD_URL);
      }
    }
  };

  const handleSaveContact = () => {
    trackEvent("card_save_contact", "card");
    const vcf = buildVCard({
      fullName: CARD_NAME,
      title: profTitle || undefined,
      phone,
      whatsapp: whatsappDigits,
      email,
      cardUrl: CARD_URL,
      note: card.vcardNote,
    });
    const url = downloadVCard(vcf, "dr-alhasan-alsaiem.vcf");
    // Release the temporary object URL once the download has started.
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    showToast(isArabic ? "تم تنزيل ملف جهة الاتصال" : "Contact file downloaded");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(CARD_URL);
      showToast(card.nfcModal.copied);
    } catch {
      showToast(CARD_URL);
    }
  };

  const action = (label: string) => trackEvent("card_action", label);

  const actions: {
    key: string;
    label: string;
    sub: string;
    icon: React.ReactNode;
    href?: string;
    onClick?: () => void;
    external?: boolean;
  }[] = [
    {
      key: "call",
      label: card.actions.call[0],
      sub: card.actions.call[1],
      icon: <Phone size={22} />,
      href: phoneHref,
    },
    {
      key: "whatsapp",
      label: card.actions.whatsapp[0],
      sub: card.actions.whatsapp[1],
      icon: <MessageCircle size={22} />,
      href: `https://wa.me/${whatsappDigits}`,
      external: true,
    },
    {
      key: "book",
      label: card.actions.book[0],
      sub: card.actions.book[1],
      icon: <CalendarCheck size={22} />,
      href: "/consultation",
    },
    {
      key: "save",
      label: card.actions.saveContact[0],
      sub: card.actions.saveContact[1],
      icon: <UserPlus size={22} />,
      onClick: handleSaveContact,
    },
    {
      key: "email",
      label: card.actions.email[0],
      sub: card.actions.email[1],
      icon: <Mail size={22} />,
      href: `mailto:${email}`,
    },
    {
      key: "location",
      label: card.actions.location[0],
      sub: card.actions.location[1],
      icon: <MapPin size={22} />,
      href: "#card-clinics",
    },
    ...(instagram
      ? [
          {
            key: "instagram",
            label: card.actions.instagram[0],
            sub: card.actions.instagram[1],
            icon: <Instagram size={22} />,
            href: instagram,
            external: true,
          },
        ]
      : []),
    ...(facebook
      ? [
          {
            key: "facebook",
            label: card.actions.facebook[0],
            sub: card.actions.facebook[1],
            icon: <Facebook size={22} />,
            href: facebook,
            external: true,
          },
        ]
      : []),
    {
      key: "website",
      label: card.actions.website[0],
      sub: card.actions.website[1],
      icon: <Globe size={22} />,
      href: "https://dralhasanalsaiem.com/",
      external: true,
    },
    {
      key: "share",
      label: card.actions.share[0],
      sub: card.actions.share[1],
      icon: <Share2 size={22} />,
      onClick: handleShare,
    },
    {
      key: "qr",
      label: card.actions.qr[0],
      sub: card.actions.qr[1],
      icon: <QrCode size={22} />,
      onClick: () => {
        action("qr");
        setQrOpen(true);
      },
    },
    {
      key: "nfc",
      label: card.actions.nfc[0],
      sub: card.actions.nfc[1],
      icon: <Nfc size={22} />,
      onClick: () => {
        action("nfc");
        setNfcOpen(true);
      },
    },
  ];

  return (
    <div className="dcard dcard-body" dir={dir}>
      {/* Top bar */}
      <div className="dcard-topbar">
        <button
          type="button"
          className="dcard-lang-toggle"
          onClick={() => {
            toggleLocale();
            action("lang_toggle");
          }}
          aria-label={isArabic ? "Switch to English" : "التبديل إلى العربية"}
        >
          <Languages size={16} />
          {isArabic ? "English" : "العربية"}
        </button>
        <button
          type="button"
          className="dcard-icon-btn"
          onClick={handleShare}
          aria-label={card.actions.share[0]}
        >
          <Share2 size={18} />
        </button>
      </div>

      {/* Hero card */}
      <div className="dcard-hero-wrap">
        <div className="dcard-hero">
          <div className="dcard-photo-glow" aria-hidden="true" />
          <div className="dcard-photo" aria-hidden="false">
            <img
              src="/card/doctor.webp"
              alt={CARD_NAME}
              fetchPriority="high"
              draggable={false}
            />
          </div>
          <div className="dcard-hero-inner">
            <CardEmblem />
            <h1 className="dcard-name dcard-serif">{CARD_NAME}</h1>
            <p className="dcard-tagline-script dcard-serif">{card.taglineScript}</p>
            <p className={`dcard-tagline-ar ${isArabic ? "dcard-ar-display" : ""}`}>
              {card.tagline}
            </p>
            <div className="dcard-divider" aria-hidden="true">
              <span />
            </div>
            {profTitle && (
              <p className="dcard-title-line">
                <strong>{profTitle}</strong>
              </p>
            )}
            {bio && <p className="dcard-title-line">{bio}</p>}
          </div>
        </div>
      </div>

      {/* Actions */}
      <section className="dcard-section" aria-label={card.sections.connect}>
        <div className="dcard-section-head">
          <h2 className={isArabic ? "dcard-ar-display" : "dcard-serif"}>{card.sections.connect}</h2>
        </div>
        <div className="dcard-actions">
          {actions.map((a) =>
            a.href ? (
              a.href.startsWith("#") ? (
                <a
                  key={a.key}
                  href={a.href}
                  className="dcard-action"
                  onClick={() => action(a.key)}
                >
                  <span className="dcard-action-icon">{a.icon}</span>
                  <span className="dcard-action-text">
                    <span className="dcard-action-label">{a.label}</span>
                    <span className="dcard-action-sub">{a.sub}</span>
                  </span>
                </a>
              ) : a.href.startsWith("/") ? (
                <Link
                  key={a.key}
                  to={a.href}
                  className="dcard-action"
                  onClick={() => action(a.key)}
                >
                  <span className="dcard-action-icon">{a.icon}</span>
                  <span className="dcard-action-text">
                    <span className="dcard-action-label">{a.label}</span>
                    <span className="dcard-action-sub">{a.sub}</span>
                  </span>
                </Link>
              ) : (
                <a
                  key={a.key}
                  href={a.href}
                  className="dcard-action"
                  {...(a.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  onClick={() => action(a.key)}
                >
                  <span className="dcard-action-icon">{a.icon}</span>
                  <span className="dcard-action-text">
                    <span className="dcard-action-label">{a.label}</span>
                    <span className="dcard-action-sub">{a.sub}</span>
                  </span>
                </a>
              )
            ) : (
              <button
                key={a.key}
                type="button"
                className="dcard-action"
                onClick={a.onClick}
              >
                <span className="dcard-action-icon">{a.icon}</span>
                <span className="dcard-action-text">
                  <span className="dcard-action-label">{a.label}</span>
                  <span className="dcard-action-sub">{a.sub}</span>
                </span>
              </button>
            ),
          )}
        </div>
      </section>

      {/* Specialties */}
      {specialties.length > 0 && (
        <section className="dcard-section" aria-label={card.sections.specialties}>
          <div className="dcard-section-head">
            <h2 className={isArabic ? "dcard-ar-display" : "dcard-serif"}>
              {card.sections.specialties}
            </h2>
          </div>
          <div className="dcard-chips">
            {specialties.map((s) => (
              <span key={s} className="dcard-chip">
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Clinics */}
      <section className="dcard-section" id="card-clinics" aria-label={card.sections.clinics}>
        <div className="dcard-section-head">
          <h2 className={isArabic ? "dcard-ar-display" : "dcard-serif"}>{card.sections.clinics}</h2>
        </div>
        <div className="dcard-clinics">
          {clinics.map((c) => (
            <div key={c.key} className="dcard-clinic">
              <div className="dcard-clinic-city">
                <MapPin size={18} color="#d4af6a" />
                {c.label}
              </div>
              <div className="dcard-clinic-hours">
                <Clock size={14} style={{ display: "inline", marginInlineEnd: 6 }} />
                {isArabic ? card.clinics.hours : hours}
              </div>
              <a
                className="dcard-clinic-link"
                href={c.maps}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => action(`maps_${c.key}`)}
              >
                {card.clinics.openMaps}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="dcard-footer">
        {card.footerNote} ·{" "}
        <a href="https://dralhasanalsaiem.com/" target="_blank" rel="noopener noreferrer">
          dralhasanalsaiem.com
        </a>
      </footer>

      {/* QR modal */}
      {qrOpen && (
        <div
          className="dcard-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={card.qrModal.title}
          onClick={() => setQrOpen(false)}
        >
          <div className="dcard-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className={isArabic ? "dcard-ar-display" : "dcard-serif"}>{card.qrModal.title}</h3>
            <p>{card.qrModal.hint}</p>
            <img
              className="dcard-qr-img"
              src="/card/qr-card.png"
              alt={`QR — ${CARD_URL}`}
              width={240}
              height={240}
            />
            <div className="dcard-modal-actions">
              <a className="dcard-btn" href="/card/qr-card.png" download="dr-alhasan-alsaiem-qr.png">
                <Download size={16} />
                {card.qrModal.download}
              </a>
              <button
                type="button"
                className="dcard-btn dcard-btn-ghost"
                onClick={() => setQrOpen(false)}
              >
                <X size={16} />
                {card.qrModal.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NFC modal */}
      {nfcOpen && (
        <div
          className="dcard-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={card.nfcModal.title}
          onClick={() => setNfcOpen(false)}
        >
          <div className="dcard-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className={isArabic ? "dcard-ar-display" : "dcard-serif"}>{card.nfcModal.title}</h3>
            <p>{card.nfcModal.intro}</p>
            <ol>
              {card.nfcModal.steps.map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
            <p className="dcard-modal-note">{card.nfcModal.note}</p>
            <div className="dcard-modal-actions">
              <button type="button" className="dcard-btn" onClick={handleCopyLink}>
                <Copy size={16} />
                {card.nfcModal.copyLink}
              </button>
              <button
                type="button"
                className="dcard-btn dcard-btn-ghost"
                onClick={() => setNfcOpen(false)}
              >
                <X size={16} />
                {card.nfcModal.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="dcard-toast" role="status">
          <Check size={16} />
          {toast}
        </div>
      )}
    </div>
  );
}
