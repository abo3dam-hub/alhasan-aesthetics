import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Database, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

/**
 * MediaDiagnostics — Shows real-time diagnostic info about all media records.
 * Displays storageId, URL, resolution status, and any errors.
 * For debugging only — not shown to regular users.
 */
export function MediaDiagnostics() {
  const diagnostic = useQuery(api.media.diagnostic);

  if (!diagnostic) {
    return (
      <Card className="border-border/60">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Database className="h-4 w-4 animate-pulse" />
            <span className="text-sm">Loading diagnostics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { totalRecords, items } = diagnostic;
  const resolved = items.filter((i) => i.storageExists);
  const failed = items.filter((i) => !i.storageExists);
  const withUrl = items.filter((i) => i.url && i.url !== "");
  const emptyUrl = items.filter((i) => !i.url || i.url === "");

  return (
    <Card className="border-border/60">
      <CardContent className="p-5 space-y-4">
        <h3 className="font-medium text-foreground flex items-center gap-2">
          <Database className="h-4 w-4" />
          Media Diagnostics
        </h3>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatBox label="Total Records" value={totalRecords} />
          <StatBox label="Storage OK" value={resolved.length} color="text-green-600 bg-green-50" />
          <StatBox label="Storage Missing" value={failed.length} color="text-red-600 bg-red-50" />
          <StatBox label="URL Empty" value={emptyUrl.length} color="text-amber-600 bg-amber-50" />
        </div>

        {/* Detailed Records */}
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No media records found.</p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item._id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border text-xs",
                  item.storageExists ? "border-green-200 bg-green-50/30" : "border-red-200 bg-red-50/30"
                )}
              >
                {item.storageExists ? (
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground truncate">{item.name}</p>
                  <p className="text-muted-foreground mt-0.5">
                    storageId: <span className="font-mono">{item.storageId?.substring(0, 20)}...</span>
                  </p>
                  {item.url ? (
                    <p className="text-muted-foreground">
                      url: <span className="font-mono truncate inline-block max-w-full">{item.url.substring(0, 60)}...</span>
                    </p>
                  ) : (
                    <p className="text-amber-600">url: EMPTY</p>
                  )}
                  {item.storageExists && item.resolvedUrl && (
                    <p className="text-green-600">
                      resolved: <span className="font-mono truncate inline-block max-w-full">{item.resolvedUrl.substring(0, 60)}...</span>
                    </p>
                  )}
                  {item.error && (
                    <p className="text-red-600 flex items-center gap-1 mt-1">
                      <AlertTriangle className="h-3 w-3" />
                      Error: {item.error}
                    </p>
                  )}
                </div>
                <img
                  src={item.resolvedUrl || item.url}
                  alt={item.name}
                  className="w-12 h-12 object-cover rounded-lg shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="p-3 rounded-lg border border-border/40">
      <p className="text-lg font-bold text-foreground">{value}</p>
      <p className={cn("text-xs", color ? color.split(" ")[0] : "text-muted-foreground")}>{label}</p>
    </div>
  );
}
