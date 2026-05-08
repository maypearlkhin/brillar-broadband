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
  price90Days?: number;
  price180Days?: number;
  price365Days?: number;
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

function withTerm(href: string, term: string) {
  const [path, query = ""] = href.split("?");
  const params = new URLSearchParams(query);
  const next = params.get("next");

  if (path === "/login" && next) {
    const [nextPath, nextQuery = ""] = next.split("?");
    const nextParams = new URLSearchParams(nextQuery);
    nextParams.set("term", term);
    params.set("next", `${nextPath}?${nextParams.toString()}`);
    return `${path}?${params.toString()}`;
  }

  params.set("term", term);
  return `${path}?${params.toString()}`;
}

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
                      S${plan.monthlyPrice}
                    </Typography>
                    <Typography component="span" variant="body2" color="text.secondary">
                      {" "}
                      /mo
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                      gap: 1
                    }}
                  >
                    {[
                      ["90", "90Days", plan.price90Days ?? 0],
                      ["180", "180Days", plan.price180Days ?? 0],
                      ["365", "365Days", plan.price365Days ?? 0]
                    ].map(([term, label, value]) => (
                      <Box component={Link} href={withTerm(href, String(term))} key={String(label)} sx={{ textDecoration: "none" }}>
                        <Box
                          sx={{
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1,
                            px: 1,
                            py: 0.75,
                            textAlign: "center",
                            bgcolor: "rgba(236, 72, 153, 0.04)",
                            color: "text.primary",
                            transition: "border-color 0.2s ease, background-color 0.2s ease",
                            "&:hover": {
                              borderColor: "primary.main",
                              bgcolor: "rgba(236, 72, 153, 0.08)"
                            }
                          }}
                        >
                          <Typography variant="caption" color="text.secondary" display="block">
                            {label}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            S${value}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
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
