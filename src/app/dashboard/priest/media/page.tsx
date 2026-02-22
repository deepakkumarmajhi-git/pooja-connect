import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Image } from "lucide-react";

export default function PriestMediaPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Media</h1>
      <p className="mt-2 text-[var(--muted-foreground)]">
        Manage your photos and media.
      </p>

      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
              <Image className="h-6 w-6 text-[var(--muted-foreground)]" aria-hidden />
            </div>
            <div>
              <CardTitle>Coming soon</CardTitle>
              <CardDescription>
                Photo upload and gallery will be available here.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--muted-foreground)]">
            You’ll be able to add profile and puja-related images.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
