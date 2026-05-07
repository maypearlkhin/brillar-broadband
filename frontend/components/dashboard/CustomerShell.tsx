import { Box } from "@mui/material";
import CustomerSidebar from "@/components/dashboard/CustomerSidebar";
import ServiceAlertsBar from "@/components/ServiceAlertsBar";
import SessionGreeting from "@/components/SessionGreeting";

/**
 * Layout shell for the authenticated customer area: sticky sidebar on the left,
 * scrollable content column on the right. Mirrors the admin shell so the UI
 * feels consistent between roles.
 *
 * `showAlerts` defaults to true. Set it to false on routes that already render
 * the same information natively (e.g. `/service-status`).
 */
export default function CustomerShell({
  children,
  showAlerts = true,
}: {
  children: React.ReactNode;
  showAlerts?: boolean;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: { md: "stretch" },
        bgcolor: "#f1f5f9",
        minHeight: "calc(100vh - 68px)",
        flex: 1,
      }}
    >
      <CustomerSidebar />
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          py: { xs: 3, md: 4 },
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <SessionGreeting />
        {showAlerts && <ServiceAlertsBar />}
        {children}
      </Box>
    </Box>
  );
}
