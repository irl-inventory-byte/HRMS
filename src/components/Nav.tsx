import Link from "next/link";

export default function Nav() {
  return (
    <nav>
      <Link href="/">Dashboard</Link>
      <Link href="/employees">Employees</Link>
      <Link href="/exit">Exit Form</Link>
      <Link href="/transfer">Transfer Form</Link>
      <Link href="/jobs">Job Applications</Link>
      <Link href="/interviews">Interviews</Link>
      <Link href="/walkin">Walk-in Queue</Link>
    </nav>
  );
}
