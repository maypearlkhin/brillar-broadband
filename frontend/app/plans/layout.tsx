import CustomerShell from "@/components/dashboard/CustomerShell";

export default function PlansLayout({ children }: { children: React.ReactNode }) {
  return <CustomerShell>{children}</CustomerShell>;
}
