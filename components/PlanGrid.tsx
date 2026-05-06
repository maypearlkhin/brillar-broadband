import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardActionArea,
  CardContent,
  Chip,
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
};

type PlanGridProps = {
  plans: PlanCardData[];
  actionHref?: (plan: PlanCardData) => string;
  actionLabel?: string;
};

export default function PlanGrid({
  plans,
  actionHref = (plan) => `/checkout/${plan.id}`,
  actionLabel = "Purchase Plan"
}: PlanGridProps) {
  return (
    <Grid container spacing={3}>
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
              transition: "transform 180ms ease, box-shadow 180ms ease",
              "&:hover": {
                transform: "translateY(-8px)",
                boxShadow: "0 18px 46px rgba(31,92,138,0.14)"
              }
            }}
          >
            <CardActionArea component={Link} href={href} sx={{ flexGrow: 1 }}>
              <CardContent>
                <Stack spacing={2}>
                  <Box>
                    <Chip
                      color="primary"
                      variant="outlined"
                      label={`${plan.downloadSpeedMbps} Mbps`}
                      sx={{ mb: 2 }}
                    />
                    <Typography variant="h5" component="h2" fontWeight={800}>
                      {plan.name}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography component="span" variant="h4">
                      ${plan.monthlyPrice}
                    </Typography>
                    <Typography component="span" color="text.secondary">
                      /month
                    </Typography>
                  </Box>
                  <Stack spacing={1}>
                    {plan.features.map((feature) => (
                      <Stack direction="row" spacing={1} alignItems="center" key={feature}>
                        <CheckCircleIcon color="primary" fontSize="small" />
                        <Typography variant="body2">{feature}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </CardContent>
            </CardActionArea>
            <CardActions sx={{ p: 2, pt: 0 }}>
              <Button
                component={Link}
                href={href}
                variant="contained"
                startIcon={<ShoppingCartIcon />}
                fullWidth
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
