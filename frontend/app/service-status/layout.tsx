import { Container } from "@mui/material";
import CustomerShell from "@/components/dashboard/CustomerShell";
import { getCurrentUserFromCookies } from "@/lib/auth";

/**
 * `/service-status` is publicly accessible, but when a signed-in customer lands here
 * (typically by clicking the sidebar entry), wrap it in the customer shell so the
 * left navigation stays put — same as the rest of the customer area.
 *
 * Public visitors and admins get a centred container (admins have their own
 * `/admin/network` panel anyway).
 */
export default function ServiceStatusLayout({ children }: { children: React.ReactNode }) {
  const user = getCurrentUserFromCookies();

  if (user?.role === "customer") {
    /* The page itself lists every impact and notice — no need for the small
       summary card on top, that would just be the same data twice. */
    return <CustomerShell showAlerts={false}>{children}</CustomerShell>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {children}
    </Container>
  );
}
