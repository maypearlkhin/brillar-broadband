import { Container } from "@mui/material";
import CustomerDashboardNav from "@/components/dashboard/CustomerDashboardNav";
import SessionGreeting from "@/components/SessionGreeting";

export default function CustomerDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <SessionGreeting />
      <CustomerDashboardNav />
      {children}
    </Container>
  );
}
