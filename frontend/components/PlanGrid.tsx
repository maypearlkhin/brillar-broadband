import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography
} from "@mui/material";
import Link from "next/link";

export type PlanCardData = {
  id: string;
  name: string;
  monthlyPrice: number;
  downloadSpeedMbps: number;
  features: string[];
  categoryId?: string;
  categoryTitle?: string;
  categorySortOrder?: number;
  planSortOrder?: number;
};

type PlanGridProps = {
  plans: PlanCardData[];
  actionHref?: (plan: PlanCardData) => string;
  actionLabel?: string;
};

export default function PlanGrid({
  plans,
  actionHref = (plan) => `/checkout/${plan.id}`,
  actionLabel = "Continue"
}: PlanGridProps) {
  return (
    <Grid container spacing={2.5}>
      {plans.map((plan) => {
        const href = actionHref(plan);

        return (
          <Grid item xs={12} md={4} key={plan.id}>
            <Card
              variant="outlined"
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderRadius: 1,
                borderColor: "divider",
                bgcolor: "background.paper",
                borderTop: "3px solid",
                borderTopColor: "primary.main",
                transition: "box-shadow 0.2s ease, transform 0.2s ease",
                "&:hover": {
                  boxShadow: "0 8px 24px rgba(219, 39, 119, 0.16)",
                  transform: "translateY(-2px)"
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="h6" component="h3" fontWeight={600}>
                      {plan.name}
                    </Typography>
                    <Chip label={`${plan.downloadSpeedMbps} Mbps`} size="small" variant="outlined" />
                  </Stack>
                  <Box>
                    <Typography variant="h4" component="p" fontWeight={600} sx={{ display: "inline" }}>
                      ${plan.monthlyPrice}
                    </Typography>
                    <Typography component="span" variant="body2" color="text.secondary">
                      {" "}
                      /mo
                    </Typography>
                  </Box>
                  <Divider />
                  <Stack spacing={1}>
                    {plan.features.map((feature) => (
                      <Stack direction="row" spacing={1} alignItems="flex-start" key={feature}>
                        <CheckCircleOutlineIcon
                          sx={{ fontSize: 18, mt: 0.15, color: "primary.main", opacity: 0.85 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {feature}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  component={Link}
                  href={href}
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  startIcon={<ShoppingCartOutlinedIcon />}
                >
                  {actionLabel}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}
