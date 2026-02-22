import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RolePage() {
  return (
    <div className="container-main py-12">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Choose role</CardTitle>
          <CardDescription>Coming soon — role selection will be available here.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--muted-foreground)]">
            You will be able to switch or confirm your account role.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
