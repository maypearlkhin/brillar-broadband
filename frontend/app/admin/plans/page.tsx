import { Container } from "@mui/material";
import PlanCmsPanel from "@/components/admin/PlanCmsPanel";

export const dynamic = "force-dynamic";

export default function AdminPlansPage() {
  return (
    <Container maxWidth="lg" disableGutters>
      <PlanCmsPanel />
    </Container>
  );
}
