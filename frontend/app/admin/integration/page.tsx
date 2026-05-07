import { Container } from "@mui/material";
import IntegrationPanel from "@/components/admin/IntegrationPanel";

export const dynamic = "force-dynamic";

export default function AdminIntegrationPage() {
  return (
    <Container maxWidth="lg" disableGutters>
      <IntegrationPanel />
    </Container>
  );
}
