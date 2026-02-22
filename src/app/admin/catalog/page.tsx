import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

export default function AdminCatalogPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Puja Catalog</h1>
      <p className="mt-2 text-[var(--muted-foreground)]">
        Manage the puja catalog (admin).
      </p>

      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
              <BookOpen className="h-6 w-6 text-[var(--muted-foreground)]" aria-hidden />
            </div>
            <div>
              <CardTitle>Coming soon</CardTitle>
              <CardDescription>
                Catalog management will be available here.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--muted-foreground)]">
            Add, edit, or deactivate puja catalog items.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
