import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

function countryFlag(code: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return "🌍";
  return String.fromCodePoint(
    ...[...code].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65)
  );
}

function countryName(code: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return code;
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

export default function DashboardAnalyticsTab() {
  const stats = useQuery(api.analytics.getStats, { days: 30 });
  const num = new Intl.NumberFormat();

  const cards = [
    { label: "Total visits (30d)", value: stats?.total ?? 0 },
    { label: "Today", value: stats?.today ?? 0 },
    { label: "Last 7 days", value: stats?.last7 ?? 0 },
    { label: "Unique sessions (30d)", value: stats?.uniqueSessions ?? 0 },
  ];

  const eventCount = (type: string) =>
    stats?.events.byType.find((e) => e.type === type)?.count ?? 0;
  const conversions = [
    { label: "WhatsApp clicks (30d)", value: eventCount("whatsapp") },
    { label: "CTA clicks (30d)", value: eventCount("cta") },
    { label: "Tracked actions (30d)", value: stats?.events.total ?? 0 },
  ];

  const series = stats?.series ?? [];
  const maxSeries = Math.max(1, ...series.map((d) => d.count));
  const maxCountry = Math.max(1, ...(stats?.countries ?? []).map((c) => c.count));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Analytics</h2>
        <span className="text-xs text-muted-foreground">Last 30 days</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="border-border/60">
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className="mt-1 text-3xl font-bold text-foreground">
                {stats === undefined ? "…" : num.format(c.value)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {conversions.map((c) => (
          <Card key={c.label} className="border-border/60">
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className="mt-1 text-3xl font-bold text-foreground">
                {stats === undefined ? "…" : num.format(c.value)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Visits — last 14 days</CardTitle>
        </CardHeader>
        <CardContent>
          {series.length ? (
            <div className="flex items-end gap-1.5 h-32">
              {series.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                  <span className="text-[10px] text-muted-foreground h-3">
                    {d.count > 0 ? num.format(d.count) : ""}
                  </span>
                  <div
                    className="w-full rounded-t-md bg-primary/70"
                    style={{ height: `${Math.max(4, (d.count / maxSeries) * 96)}px` }}
                    title={`${d.day}: ${d.count}`}
                  />
                  <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                    {d.day.slice(5)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No visit data yet.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Countries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats?.countries?.length ? (
              stats.countries.map((c) => (
                <div key={c.country} className="flex items-center gap-3">
                  <span className="text-lg shrink-0">{countryFlag(c.country)}</span>
                  <span className="text-sm text-foreground flex-1 truncate">
                    {countryName(c.country)}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {num.format(c.count)}
                  </span>
                  <div className="h-2 w-20 bg-muted rounded-full overflow-hidden shrink-0">
                    <div
                      className="h-full bg-primary/70 rounded-full"
                      style={{ width: `${(c.count / maxCountry) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No visit data yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Top pages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats?.topPages?.length ? (
              stats.topPages.map((p) => (
                <div key={p.path} className="flex items-center justify-between gap-3">
                  <span className="text-xs font-mono bg-muted/60 rounded px-2 py-1 truncate">
                    {p.path}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {num.format(p.count)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No visit data yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Top actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats?.events.top.length ? (
              stats.events.top.map((e) => (
                <div key={`${e.type}-${e.label}`} className="flex items-center gap-2">
                  <span className="text-xs font-mono bg-muted/60 rounded px-2 py-1 truncate flex-1">
                    {e.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground shrink-0">{e.type}</span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {num.format(e.count)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No actions tracked yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}