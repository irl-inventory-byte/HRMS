import Nav from "@/components/Nav";
import { getCurrentUserAndRole } from "@/lib/current-user";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { email, role } = await getCurrentUserAndRole();

  return (
    <div className="shell">
      <Nav email={email} role={role} />
      <main className="main">
        <div className="wrap">{children}</div>
      </main>
    </div>
  );
}