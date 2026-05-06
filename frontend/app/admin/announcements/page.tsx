import { Container } from "@mui/material";
import AnnouncementsAdminPanel from "@/components/admin/AnnouncementsAdminPanel";

export const dynamic = "force-dynamic";

export default function AdminAnnouncementsPage() {
  return (
    <Container maxWidth="lg" disableGutters>
      <AnnouncementsAdminPanel />
    </Container>
  );
}
