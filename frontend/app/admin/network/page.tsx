import { Container } from "@mui/material";
import NetworkStatusPanel from "@/components/admin/NetworkStatusPanel";

export const dynamic = "force-dynamic";

export default function AdminNetworkPage() {
  return (
    <Container maxWidth="lg" disableGutters>
      <NetworkStatusPanel />
    </Container>
  );
}
