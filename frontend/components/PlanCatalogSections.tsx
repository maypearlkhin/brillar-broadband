import { Box, Stack, Typography } from "@mui/material";
import PlanGrid, { type PlanCardData } from "@/components/PlanGrid";
import { groupPlansByCategory } from "@/lib/plans";

type PlanCatalogSectionsProps = {
  plans: PlanCardData[];
  actionHref?: (plan: PlanCardData) => string;
  actionLabel?: string;
};

export default function PlanCatalogSections({ plans, actionHref, actionLabel }: PlanCatalogSectionsProps) {
  const sections = groupPlansByCategory(plans);

  return (
    <Stack spacing={{ xs: 5, md: 7 }} component="div">
      {sections.map((section) => (
        <Box key={section.categoryId} component="section">
          <Typography variant="h5" component="h3" sx={{ fontWeight: 700, letterSpacing: "-0.02em", mb: 3 }}>
            {section.categoryTitle}
          </Typography>
          <PlanGrid plans={section.plans} actionHref={actionHref} actionLabel={actionLabel} />
        </Box>
      ))}
    </Stack>
  );
}
