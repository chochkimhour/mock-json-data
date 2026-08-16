import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import DashboardClient from "./ui";
export default async function Dashboard() {
  const user = await currentUser();
  if (!user) redirect("/login");
  return <DashboardClient displayName={user.name || user.username} />;
}
