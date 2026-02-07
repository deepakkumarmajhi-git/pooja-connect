import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function RedirectPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/auth");

  const role = session.user.role;

  if (role === "ADMIN") redirect("/admin");
  if (role === "PRIEST") redirect("/dashboard/priest");
  redirect("/dashboard/customer");
}
