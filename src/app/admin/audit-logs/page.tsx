import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function AdminAuditLogsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Audit Logs</h1>
      <p className="mt-2 text-[var(--muted-foreground)]">
        View system audit logs (admin).
      </p>

      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
              <FileText className="h-6 w-6 text-[var(--muted-foreground)]" aria-hidden />
            </div>
            <div>
              <CardTitle>Coming soon</CardTitle>
              <CardDescription>
                Audit log viewer will be available here.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--muted-foreground)]">
            Track admin actions and system events.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
