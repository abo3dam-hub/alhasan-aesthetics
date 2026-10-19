/**
 * Builds a vCard 3.0 (UTF-8) file for the doctor's digital card.
 * Pure function — covered by `src/lib/cardVcf.test.ts`.
 */

export interface CardContact {
  /** Literal display name, e.g. "Dr. Alhasan Alsaiem" */
  fullName: string;
  /** Professional title, e.g. "MD, Board Certified in Plastic Surgery" */
  title?: string;
  /** International phone for tel: links, e.g. "+963 933 178 794" */
  phone?: string;
  /** Digits-only WhatsApp number, e.g. "963991301700" */
  whatsapp?: string;
  email?: string;
  /** Permanent card URL encoded on the NFC tag / QR */
  cardUrl?: string;
  /** Free-form note (clinics line) */
  note?: string;
}

/** Escape vCard 3.0 text values: backslash, comma, semicolon, newline. */
export function escapeVCardText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\r|\n/g, "\\n");
}

/** Fold a content line to max 75 octets per RFC 2426 §5.8.1 (UTF-8 safe). */
export function foldVCardLine(line: string): string {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) return line;
  const out: string[] = [];
  let current = "";
  for (const ch of Array.from(line)) {
    const next = current + ch;
    if (encoder.encode(next).length > 75 && current.length > 0) {
      out.push(current);
      current = ch;
    } else {
      current = next;
    }
  }
  if (current) out.push(current);
  return out.join("\r\n ");
}

function contentLine(name: string, value: string): string {
  return foldVCardLine(`${name}:${escapeVCardText(value)}`);
}

export function buildVCard(contact: CardContact): string {
  const lines: string[] = ["BEGIN:VCARD", "VERSION:3.0"];
  lines.push(contentLine("FN", contact.fullName));
  // Structured name: family "Alsaiem", given "Alhasan", prefix "Dr."
  const parts = contact.fullName.replace(/^Dr\.\s*/i, "").split(/\s+/);
  const family = parts.length > 1 ? parts[parts.length - 1] : "";
  const given = parts.length > 1 ? parts.slice(0, -1).join(" ") : parts[0] ?? "";
  lines.push(
    foldVCardLine(
      `N:${escapeVCardText(family)};${escapeVCardText(given)};;;${/^Dr\./i.test(contact.fullName) ? "Dr." : ""}`,
    ),
  );
  if (contact.title) lines.push(contentLine("TITLE", contact.title));
  lines.push(contentLine("ORG", contact.fullName));
  const digits = (v: string) => v.replace(/[^0-9+]/g, "");
  if (contact.phone) lines.push(foldVCardLine(`TEL;TYPE=CELL,VOICE:${digits(contact.phone)}`));
  if (contact.whatsapp && digits(contact.whatsapp) !== digits(contact.phone ?? ""))
    lines.push(foldVCardLine(`TEL;TYPE=WORK,VOICE:${digits(contact.whatsapp)}`));
  if (contact.email) lines.push(contentLine("EMAIL", contact.email));
  lines.push(foldVCardLine("URL;TYPE=WORK:https://dralhasanalsaiem.com/card"));
  if (contact.cardUrl && contact.cardUrl !== "https://dralhasanalsaiem.com/card")
    lines.push(contentLine("URL", contact.cardUrl));
  if (contact.note) lines.push(contentLine("NOTE", contact.note));
  lines.push("END:VCARD");
  return lines.join("\r\n") + "\r\n";
}

/** Trigger a browser download of the vCard text; returns the object URL. */
export function downloadVCard(vcard: string, filename: string): string {
  const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  return url;
}
