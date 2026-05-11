import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import CellTowerOutlinedIcon from "@mui/icons-material/CellTowerOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import LanOutlinedIcon from "@mui/icons-material/LanOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import RouterOutlinedIcon from "@mui/icons-material/RouterOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import SpeedOutlinedIcon from "@mui/icons-material/SpeedOutlined";
import WifiOutlinedIcon from "@mui/icons-material/WifiOutlined";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Link as MuiLink,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import Link from "next/link";
import PlanCatalogSections from "@/components/PlanCatalogSections";
import { type PlanCardData } from "@/components/PlanGrid";
import { axiosServer } from "@/lib/axiosServer";

export const dynamic = "force-dynamic";

async function getPlans(): Promise<PlanCardData[]> {
  try {
    const { data } = await axiosServer().get<{ plans: PlanCardData[] }>("/api/plans");
    return data.plans ?? [];
  } catch {
    return [];
  }
}

const trustItems = [
  { label: "Residential fibre", detail: "Symmetric paths where network allows" },
  { label: "SG & MY rollout", detail: "Zone checks at signup" },
  { label: "Self‑service portal", detail: "Plans, billing, service notices" },
  { label: "Transparent tiers", detail: "Speed & price shown upfront" }
];

const featureCards = [
  {
    title: "Speed that fits",
    body: "Pick a tier by Mbps — great for work-from-home, streaming, and smart home gear without guessing.",
    icon: SpeedOutlinedIcon
  },
  {
    title: "Whole‑home Wi‑Fi",
    body: "Gateway placement and Wi‑Fi guidance so coverage matches your layout, not just the socket.",
    icon: WifiOutlinedIcon
  },
  {
    title: "Your account, one place",
    body: "Sign in to pick a plan, check out, and manage your line — same familiar flow you expect from a real provider.",
    icon: LanOutlinedIcon
  },
  {
    title: "Honest pricing",
    body: "Monthly rate on the label. Compare tiers side‑by‑side before you create an account.",
    icon: ShieldOutlinedIcon
  }
];

const steps = [
  {
    step: "01",
    title: "Browse plans",
    body: "See speeds and monthly price for your area — no login required on this page."
  },
  {
    step: "02",
    title: "Register & zone",
    body: "Create an account with your service country and postal code so we know what’s available."
  },
  {
    step: "03",
    title: "Order & manage",
    body: "Sign in to complete checkout and open your dashboard for subscription updates and service announcements."
  }
];

export default async function HomePage() {
  const plans = await getPlans();

  return (
    <Box sx={{ bgcolor: "background.default" }}>
      {/* Hero */}
      <Box
        sx={{
          borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
          bgcolor: "#f8fafc",
          backgroundImage:
            "linear-gradient(180deg, rgba(254, 197, 86, 0.15) 0%, rgba(248, 250, 252, 0.95) 48%, #f8fafc 100%)"
        }}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Stack spacing={2.5}>
                <Typography
                  variant="overline"
                  sx={{
                    color: "primary.dark",
                    fontWeight: 700,
                    letterSpacing: 0.14,
                    fontSize: "0.72rem"
                  }}
                >
                  Residential broadband
                </Typography>
                <Typography
                  component="h1"
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    letterSpacing: "-0.035em",
                    color: "text.primary",
                    lineHeight: 1.15
                  }}
                >
                  Fibre for homes in Singapore &amp; Malaysia
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.75, maxWidth: 560 }}>
                  Compare fibre speeds and pricing for your address, create an account with your service zone, then sign
                  in to subscribe or manage your plan — one straightforward journey from choosing a tier to going live.
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ pt: 0.5 }}>
                  <Button component={Link} href="/register" variant="contained" color="primary" size="large">
                    Create account
                  </Button>
                  <Button component={Link} href="/login" variant="outlined" color="primary" size="large">
                    Sign in
                  </Button>
                  <Button component={Link} href="/#plans" variant="text" color="primary" size="large">
                    View plans
                  </Button>
                </Stack>
                <Stack direction="row" spacing={3} flexWrap="wrap" sx={{ pt: 1, gap: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <BoltOutlinedIcon sx={{ color: "warning.main", fontSize: 22 }} />
                    <Typography variant="body2" color="text.secondary">
                      Low‑latency paths built for video calls and gaming
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CellTowerOutlinedIcon sx={{ color: "primary.main", fontSize: 22 }} />
                    <Typography variant="body2" color="text.secondary">
                      <MuiLink
                        component={Link}
                        href="/service-status"
                        underline="hover"
                        sx={{ fontWeight: 700, color: "primary.main" }}
                      >
                        Service status
                      </MuiLink>
                      {" — live impacts & notices"}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12} md={5}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  border: "1px solid rgba(15, 23, 42, 0.08)",
                  bgcolor: "#ffffff",
                  boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)"
                }}
              >
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        At a glance
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.25 }}>
                        Your fibre connection
                      </Typography>
                    </Box>
                    <HubOutlinedIcon sx={{ fontSize: 34, color: "primary.main", opacity: 0.85 }} />
                  </Stack>
                  <Grid container spacing={1.5}>
                    <Grid item xs={6}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 1,
                          bgcolor: "rgba(13, 27, 50, 0.07)",
                          border: "1px solid rgba(13, 27, 50, 0.18)"
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Typical latency
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          &lt; 12 ms
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Peak‑hour estimate
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 1,
                          bgcolor: "rgba(254, 197, 86, 0.15)",
                          border: "1px solid rgba(254, 197, 86, 0.4)"
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Install setup
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          ONT + Wi‑Fi
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Guided from your account
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <RouterOutlinedIcon sx={{ fontSize: 20, color: "text.secondary", mt: 0.15 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        Change speed tier anytime after activation — updates apply from your customer dashboard.
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <LocationOnOutlinedIcon sx={{ fontSize: 20, color: "text.secondary", mt: 0.15 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        We validate your service zone at registration so plans and availability match your address.
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Enterprise / Awards banner */}
      <Box sx={{ py: 2.5, bgcolor: "rgba(13, 27, 50, 0.05)", borderBottom: "1px solid", borderColor: "rgba(13, 27, 50, 0.15)" }}>
        <Container maxWidth="lg">
           <Stack direction={{ xs: "column", md: "row" }} alignItems="center" justifyContent="center" spacing={{ xs: 2, md: 5 }}>
             <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: 1.2, color: "primary.main" }}>
               Recognized by Industry Leaders
             </Typography>
             <Stack direction="row" spacing={{ xs: 3, md: 6 }} alignItems="center" flexWrap="wrap" justifyContent="center">
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "text.primary" }}>TechAsia Top ISP 2025</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "text.primary" }}>Fastest Fibre SG</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "text.primary" }}>Enterprise Choice Award</Typography>
             </Stack>
           </Stack>
        </Container>
      </Box>

      {/* Trust strip */}
      <Box sx={{ bgcolor: "background.paper", borderBottom: "1px solid", borderColor: "divider", py: 3 }}>
        <Container maxWidth="lg">
          <Grid container spacing={2}>
            {trustItems.map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item.label}>
                <Stack spacing={0.25}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {item.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.detail}
                  </Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Stack spacing={1} sx={{ mb: 4, maxWidth: 720 }}>
          <Typography variant="overline" color="primary" sx={{ fontWeight: 700, letterSpacing: 0.12 }}>
            Why subscribers stay
          </Typography>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 700, letterSpacing: "-0.02em" }}>
            Straightforward fibre — from plan choice to going live
          </Typography>
          <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
            Compare speeds for Singapore and Malaysia, subscribe online, and follow your installation from your account.
            When work affects your area, we publish clear service notices so you are never left guessing.
          </Typography>
        </Stack>
        <Grid container spacing={2.5}>
          {featureCards.map(({ title, body, icon: Icon }) => (
            <Grid item xs={12} sm={6} md={3} key={title}>
              <Card
                variant="outlined"
                sx={{
                  height: "100%",
                  borderRadius: 2,
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": {
                    boxShadow: "0 10px 28px rgba(13, 27, 50, 0.14)",
                    transform: "translateY(-2px)"
                  }
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 1.5,
                      bgcolor: "rgba(13, 27, 50, 0.18)",
                      color: "primary.dark"
                    }}
                  >
                    <Icon />
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                    {title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                    {body}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How it works */}
      <Box
        sx={{
          py: { xs: 6, md: 8 },
          bgcolor: "rgba(254, 197, 86, 0.15)",
          borderTop: "1px solid",
          borderBottom: "1px solid",
          borderColor: "divider"
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={1} sx={{ mb: 4 }}>
            <Typography variant="overline" color="primary" sx={{ fontWeight: 700, letterSpacing: 0.12 }}>
              Subscriber journey
            </Typography>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 700 }}>
              From browse to broadband in three steps
            </Typography>
          </Stack>
          <Grid container spacing={3}>
            {steps.map((s) => (
              <Grid item xs={12} md={4} key={s.step}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: "100%",
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper"
                  }}
                >
                  <Typography
                    variant="overline"
                    sx={{ color: "primary.main", fontWeight: 800, letterSpacing: 0.15, fontSize: "0.75rem" }}
                  >
                    {s.step}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, mt: 1, mb: 1 }}>
                    {s.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {s.body}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Plans */}
      <Container id="plans" maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Stack spacing={1} sx={{ mb: 4 }}>
          <Typography variant="overline" color="primary" sx={{ fontWeight: 700, letterSpacing: 0.12 }}>
            Catalogue
          </Typography>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 700 }}>
            Residential plans
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 640, lineHeight: 1.7 }}>
            Choose the perfect speed for your household. All prices are in SGD per month. Compare speeds, pricing, and features side-by-side to find the right fit for your home.
          </Typography>
        </Stack>
        <PlanCatalogSections
          plans={plans}
          actionHref={(plan) => `/login?next=${encodeURIComponent(`/checkout/${plan.id}`)}`}
          actionLabel="Sign in to order"
        />
      </Container>

      {/* Coverage + help */}
      <Box sx={{ bgcolor: "background.paper", borderTop: "1px solid", borderColor: "divider", py: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Typography variant="overline" color="primary" sx={{ fontWeight: 700, letterSpacing: 0.12 }}>
                  Global Connectivity
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
                  Seamless Coverage Across Regions
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, fontSize: "1.05rem" }}>
                  Our award-winning fiber backbone powers homes and businesses across Singapore and Malaysia. We deliver direct peering to major global exchanges, guaranteeing ultra-low latency for gaming, financial trading, and seamless streaming.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ pt: 1 }}>
                  Enter your address during registration to instantly verify multi-gigabit fiber availability for your exact location.
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: "1px dashed",
                  borderColor: "primary.light",
                  bgcolor: "rgba(13, 27, 50, 0.1)"
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 2 }}>
                  <ChatOutlinedIcon color="primary" />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Need an account first?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.7 }}>
                      Create a subscriber login to save your service zone, select your preferred plan, and securely complete your checkout. Manage your entire connection from one place.
                    </Typography>
                  </Box>
                </Stack>
                <Button 
                  component={Link} 
                  href="/register" 
                  variant="contained" 
                  size="medium" 
                  fullWidth
                  sx={{
                    bgcolor: "#FEC556",
                    color: "#000000",
                    "&:hover": { bgcolor: "#FDB840" }
                  }}
                >
                  Get started
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Closing CTA */}
      <Box
        sx={{
          py: { xs: 6, md: 7 },
          bgcolor: "primary.main",
          color: "primary.contrastText"
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
          >
            <Box sx={{ maxWidth: 560 }}>
              <Typography variant="overline" sx={{ opacity: 0.85, fontWeight: 700, letterSpacing: 0.14 }}>
                Ready for an upgrade?
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 1, mb: 1.5, color: "primary.contrastText" }}>
                Switch to Brillar Broadband today
              </Typography>
              <Typography sx={{ opacity: 0.92, lineHeight: 1.75, color: "primary.contrastText" }}>
                Experience ultra-low latency, crystal-clear video calls, and seamless streaming with our next-generation fibre network. Check your coverage and schedule your installation in minutes.
              </Typography>
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ flexShrink: 0 }}>
              <Button
                component={Link}
                href="/register"
                variant="contained"
                size="large"
                  sx={{
                  bgcolor: "#FEC556",
                  color: "#000000",
                  "&:hover": { bgcolor: "#FDB840" }
                }}
              >
                Create account
              </Button>
              <Button
                component={Link}
                href="/login"
                variant="outlined"
                size="large"
                sx={{ borderColor: "#FEC556", color: "#FEC556", "&:hover": { borderColor: "#FDB840", color: "#FDB840" } }}
              >
                Sign in
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Box
        component="footer"
        sx={{
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          py: 4
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} sm={4} md={3}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: "text.primary" }}>
                Brillar Broadband
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
                Providing lightning-fast fibre broadband to homes and businesses across Singapore and Malaysia with award-winning customer support.
              </Typography>
              <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
                support@brillarbroadband.com
              </Typography>
              <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
                enterprise@brillarbroadband.com
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "text.primary" }}>
                Quick Links
              </Typography>
              <Stack spacing={1}>
                <MuiLink component={Link} href="/#plans" underline="hover" color="text.secondary" variant="body2">Residential Plans</MuiLink>
                <MuiLink component={Link} href="/enterprise" underline="hover" color="text.secondary" variant="body2">Enterprise Solutions</MuiLink>
                <MuiLink component={Link} href="/about" underline="hover" color="text.secondary" variant="body2">About Us</MuiLink>
                <MuiLink component={Link} href="/faq" underline="hover" color="text.secondary" variant="body2">Help Center & FAQ</MuiLink>
                <MuiLink component={Link} href="/service-status" underline="hover" color="text.secondary" variant="body2">Network Status</MuiLink>
                <MuiLink component={Link} href="/login" underline="hover" color="text.secondary" variant="body2">Subscriber Login</MuiLink>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "text.primary" }}>
                Coverage Areas
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">Singapore (Central & Suburbs)</Typography>
                <Typography variant="body2" color="text.secondary">Kuala Lumpur & Selangor</Typography>
                <Typography variant="body2" color="text.secondary">Penang & Johor Bahru</Typography>
                <Typography variant="body2" color="text.secondary">Enterprise Global Links</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={12} md={3}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "text.primary" }}>
                Our Offices
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>Singapore HQ</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>1 Raffles Place, #44-01<br/>One Raffles Place Tower 1<br/>Singapore 048616</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>Malaysia Office</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>Level 20, Menara Maxis<br/>KLCC, 50088 Kuala Lumpur</Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
          <Box sx={{ mt: 6, pt: 3, borderTop: "1px solid", borderColor: "divider", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} Brillar Broadband Pte. Ltd. All rights reserved.
            </Typography>
            <Stack direction="row" spacing={3} sx={{ mt: { xs: 2, sm: 0 } }}>
               <MuiLink href="#" underline="hover" color="text.secondary" variant="caption">Privacy Policy</MuiLink>
               <MuiLink href="#" underline="hover" color="text.secondary" variant="caption">Terms of Service</MuiLink>
               <MuiLink href="#" underline="hover" color="text.secondary" variant="caption">Acceptable Use Policy</MuiLink>
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
