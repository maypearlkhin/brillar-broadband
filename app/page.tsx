import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Rating,
  Stack,
  Typography
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import BoltIcon from "@mui/icons-material/Bolt";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import RouterIcon from "@mui/icons-material/Router";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import StarIcon from "@mui/icons-material/Star";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import WifiIcon from "@mui/icons-material/Wifi";
import Link from "next/link";
import PlanGrid, { type PlanCardData } from "@/components/PlanGrid";
import { connectToDatabase } from "@/lib/db";
import Plan from "@/lib/models/Plan";

export const dynamic = "force-dynamic";

async function getPlans(): Promise<PlanCardData[]> {
  await connectToDatabase();

  const plans = await Plan.find({ isActive: true }).sort({ monthlyPrice: 1 }).lean();

  return plans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    monthlyPrice: plan.monthlyPrice,
    downloadSpeedMbps: plan.downloadSpeedMbps,
    features: plan.features
  }));
}

function DecorativeStars() {
  return (
    <>
      {[["12%", "18%"], ["88%", "22%"], ["20%", "76%"], ["78%", "72%"]].map(
        ([left, top]) => (
          <StarIcon
            key={`${left}-${top}`}
            sx={{
              position: "absolute",
              left,
              top,
              color: "#ffd84d",
              fontSize: 22,
              filter: "drop-shadow(0 2px 0 #5b2477)",
              animation: "twinkle 3.8s ease-in-out infinite"
            }}
          />
        )
      )}
    </>
  );
}

function CampaignVisual() {
  return (
    <Box
      sx={{
        position: "relative",
        minHeight: { xs: 360, md: 500 },
        display: "grid",
        placeItems: "center"
      }}
    >
      <Box
        sx={{
          position: "absolute",
          width: { xs: 300, sm: 430, md: 520 },
          height: { xs: 230, sm: 310, md: 340 },
          bgcolor: "#efe2ff",
          border: "3px dashed #b44cc1",
          borderRadius: 6,
          boxShadow: "0 30px 80px rgba(91, 36, 119, 0.18)",
          animation: "softFloat 6s ease-in-out infinite"
        }}
      />
      <DecorativeStars />
      <Stack
        spacing={1.5}
        alignItems="center"
        sx={{ position: "relative", zIndex: 1, textAlign: "center" }}
      >
        <Typography sx={{ color: "#32104c", fontWeight: 900, fontSize: { xs: 22, md: 28 } }}>
          New fibre deal
        </Typography>
        <Typography
          sx={{
            color: "#5b2477",
            fontWeight: 950,
            fontSize: { xs: 72, sm: 96, md: 128 },
            lineHeight: 0.82,
            textShadow: "7px 7px 0 #ffb234"
          }}
        >
          1Gbps
        </Typography>
        <Typography sx={{ color: "#32104c", fontWeight: 900, fontSize: { xs: 24, md: 34 } }}>
          from $49/month
        </Typography>
        <Stack direction="row" spacing={1.5}>
          <Chip color="secondary" label="Wi-Fi router" />
          <Chip color="primary" label="Fast install" />
        </Stack>
      </Stack>
      <Box
        sx={{
          position: "absolute",
          left: { xs: 16, md: 32 },
          bottom: { xs: 8, md: 44 },
          width: 86,
          height: 86,
          bgcolor: "#ffffff",
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          boxShadow: "0 16px 36px rgba(91, 36, 119, 0.2)"
        }}
      >
        <RouterIcon sx={{ fontSize: 42, color: "#b44cc1" }} />
      </Box>
      <Box
        sx={{
          position: "absolute",
          right: { xs: 20, md: 42 },
          top: { xs: 26, md: 72 },
          width: 58,
          height: 58,
          bgcolor: "#d6ff00",
          borderRadius: 3,
          transform: "rotate(14deg)",
          boxShadow: "0 14px 26px rgba(91, 36, 119, 0.16)",
          animation: "driftShape 5s ease-in-out infinite"
        }}
      />
    </Box>
  );
}

function AppMockup() {
  return (
    <Box
      sx={{
        width: { xs: 230, md: 300 },
        height: { xs: 430, md: 540 },
        bgcolor: "#ffffff",
        border: "12px solid #1f1f22",
        borderRadius: 8,
        p: 2,
        boxShadow: "0 30px 80px rgba(31,31,34,0.25)",
        transform: "rotate(3deg)",
        animation: "softFloat 6.2s ease-in-out infinite"
      }}
    >
      <Stack spacing={2}>
        <Typography textAlign="center" fontWeight={900}>
          Dashboard
        </Typography>
        <Card sx={{ bgcolor: "#f3e5ff" }}>
          <CardContent>
            <Typography variant="caption">Account</Typography>
            <Typography fontWeight={900} color="#5b2477">
              1Gbps Gamer Pro
            </Typography>
            <Typography variant="body2">Pending Admin Approval</Typography>
          </CardContent>
        </Card>
        <Box
          sx={{
            bgcolor: "#b44cc1",
            color: "common.white",
            borderRadius: "50%",
            width: 180,
            height: 180,
            display: "grid",
            placeItems: "center",
            mx: "auto",
            textAlign: "center"
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 42, fontWeight: 950 }}>900</Typography>
            <Typography variant="body2">Mbps ready</Typography>
          </Box>
        </Box>
        <Grid container spacing={1}>
          {["Billing", "Visit", "Top-up", "Ticket"].map((label) => (
            <Grid item xs={6} key={label}>
              <Box sx={{ bgcolor: "#eef8ff", p: 1.25, borderRadius: 2, textAlign: "center" }}>
                <Typography variant="caption" fontWeight={800}>
                  {label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Box>
  );
}

const serviceCards = [
  {
    icon: <RouterIcon sx={{ fontSize: 92 }} />,
    title: "Broadband",
    body: "Surf with ultra-fast home fibre.",
    dark: true
  },
  {
    icon: <SportsEsportsIcon sx={{ fontSize: 92 }} />,
    title: "Gamer Broadband",
    body: "Lower latency packages for serious play."
  },
  {
    icon: <SmartphoneIcon sx={{ fontSize: 92 }} />,
    title: "Customer App",
    body: "Track purchase requests and installation status.",
    purple: true
  },
  {
    icon: <BusinessCenterIcon sx={{ fontSize: 92 }} />,
    title: "Business",
    body: "Digital connectivity for growing teams."
  }
];

const reviews = [
  {
    name: "Gary Tay",
    body: "Good quality lines and clear plan choices. Easy to see what I purchased and what is still pending.",
    plan: "Brillar 1Gbps Broadband"
  },
  {
    name: "Peng Hui",
    body: "The checkout and approval process is simple. I can follow every package from my dashboard.",
    plan: "Brillar 500Mbps Basic"
  }
];

export default async function HomePage() {
  const plans = await getPlans();

  return (
    <Box
      sx={{
        bgcolor: "#fbfaf2",
        "@keyframes softFloat": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-16px) rotate(1deg)" }
        },
        "@keyframes driftShape": {
          "0%, 100%": { transform: "translate(0, 0) rotate(14deg)" },
          "50%": { transform: "translate(12px, -10px) rotate(28deg)" }
        },
        "@keyframes twinkle": {
          "0%, 100%": { opacity: 0.55, transform: "scale(0.9)" },
          "50%": { opacity: 1, transform: "scale(1.18)" }
        }
      }}
    >
      <Box
        sx={{
          bgcolor: "#f2efe4",
          overflow: "hidden",
          borderBottom: "1px solid rgba(91,36,119,0.08)"
        }}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
          <Grid container spacing={{ xs: 5, md: 8 }} alignItems="center">
            <Grid item xs={12} md={6}>
              <CampaignVisual />
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                <Chip
                  label="Brillar Broadband launch offer"
                  sx={{
                    alignSelf: "flex-start",
                    bgcolor: "#ffffff",
                    color: "#5b2477",
                    fontWeight: 900,
                    boxShadow: "0 10px 30px rgba(91,36,119,0.08)"
                  }}
                />
                <Typography
                  variant="h1"
                  sx={{
                    color: "#2d2234",
                    fontSize: { xs: 42, md: 64 },
                    lineHeight: 1.05
                  }}
                >
                  Broadband plans built for every home.
                </Typography>
                <Typography sx={{ color: "#3d3444", fontSize: 20, lineHeight: 1.6 }}>
                  Choose a plan, register your service zone, pay through mock checkout,
                  then track admin approval and installation from your account.
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Button
                    component={Link}
                    href="/plans"
                    variant="contained"
                    size="large"
                    startIcon={<ShoppingCartIcon />}
                    sx={{
                      bgcolor: "#b44cc1",
                      "&:hover": { bgcolor: "#9436a1" }
                    }}
                  >
                    Register to Purchase
                  </Button>
                  <Button
                    component={Link}
                    href="#services"
                    size="large"
                    startIcon={<PlayCircleIcon />}
                    sx={{ color: "#5b2477" }}
                  >
                    Explore services
                  </Button>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container id="services" maxWidth="xl" sx={{ py: { xs: 6, md: 8 } }}>
        <Grid container spacing={3}>
          {serviceCards.map((service) => (
            <Grid item xs={12} sm={6} md={3} key={service.title}>
              <Card
                sx={{
                  height: "100%",
                  bgcolor: service.dark ? "#2a123d" : service.purple ? "#b44cc1" : "#ffffff",
                  color: service.dark || service.purple ? "common.white" : "text.primary",
                  boxShadow: "0 16px 38px rgba(31,31,34,0.12)",
                  transition: "transform 180ms ease, box-shadow 180ms ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 22px 48px rgba(31,31,34,0.18)"
                  }
                }}
              >
                <CardContent sx={{ minHeight: 340, display: "flex", flexDirection: "column" }}>
                  <Box sx={{ color: service.dark || service.purple ? "#ffffff" : "#b44cc1", mb: 3 }}>
                    {service.icon}
                  </Box>
                  <Typography variant="h5" fontWeight={900}>
                    {service.title}
                  </Typography>
                  <Typography sx={{ mt: 2, opacity: 0.9 }}>{service.body}</Typography>
                  <Button
                    component={Link}
                    href="/plans"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      mt: "auto",
                      alignSelf: "flex-start",
                      color: service.dark || service.purple ? "common.white" : "#b44cc1",
                      px: 0
                    }}
                  >
                    Find Out More
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box sx={{ bgcolor: "#ffffff" }}>
        <Grid container>
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              minHeight: 360,
              bgcolor: "#f8f2e4",
              display: "grid",
              placeItems: "center",
              position: "relative",
              overflow: "hidden"
            }}
          >
            <Box
              sx={{
                width: 250,
                height: 170,
                bgcolor: "#f0c5ce",
                borderRadius: 4,
                transform: "rotate(-8deg)",
                boxShadow: "22px 22px 0 #f3d35e"
              }}
            />
            <CardGiftcardIcon
              sx={{
                position: "absolute",
                fontSize: 130,
                color: "#5b2477",
                animation: "softFloat 5.8s ease-in-out infinite"
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} sx={{ p: { xs: 4, md: 8 } }}>
            <Stack spacing={2.5} justifyContent="center" sx={{ height: "100%" }}>
              <Typography variant="h3" fontWeight={900}>
                New homeowners
              </Typography>
              <Typography sx={{ fontSize: 19, lineHeight: 1.7 }}>
                Enjoy exclusive broadband deals when your home is inside one of
                Brillar’s supported service zones.
              </Typography>
              <Button
                component={Link}
                href="/register"
                endIcon={<ArrowForwardIcon />}
                sx={{ alignSelf: "flex-start", color: "#b44cc1", px: 0 }}
              >
                Register Your Zone
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ bgcolor: "#d8ff00", py: { xs: 6, md: 9 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={5}>
              <Box sx={{ position: "relative", minHeight: 280 }}>
                <CardGiftcardIcon
                  sx={{
                    fontSize: { xs: 180, md: 240 },
                    color: "#6a2f8f",
                    filter: "drop-shadow(20px 18px 0 rgba(255,255,255,0.55))"
                  }}
                />
                <DecorativeStars />
              </Box>
            </Grid>
            <Grid item xs={12} md={7}>
              <Stack spacing={2.5}>
                <Typography variant="h3" fontWeight={900}>
                  Get 10% off with a referral
                </Typography>
                <Typography sx={{ fontSize: 18, lineHeight: 1.8 }}>
                  Existing customers can refer a friend to Brillar Broadband. New
                  customers can start with a discounted installation package in Phase 2.
                </Typography>
                <Button
                  component={Link}
                  href="/plans"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ alignSelf: "flex-start", color: "#b44cc1", px: 0 }}
                >
                  View Broadband Plans
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ bgcolor: "#d9cff7", overflow: "hidden" }}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
          <Grid container spacing={5} alignItems="center">
            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                <Typography variant="h3" fontWeight={900}>
                  Stay updated with the Brillar account dashboard
                </Typography>
                <Typography sx={{ fontSize: 18, lineHeight: 1.75 }}>
                  Track purchased installments, billing placeholders, appointment
                  state, and support requests from one account page.
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Button variant="contained" sx={{ bgcolor: "#111111" }}>
                    App Store
                  </Button>
                  <Button variant="contained" sx={{ bgcolor: "#111111" }}>
                    Google Play
                  </Button>
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: "grid", placeItems: "center" }}>
              <AppMockup />
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container id="plans" maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
        <Stack spacing={4}>
          <Box sx={{ textAlign: "center" }}>
            <Chip icon={<BoltIcon />} label="Special offer" color="primary" sx={{ mb: 2 }} />
            <Typography variant="h3" fontWeight={900}>
              Special offer for you
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Select a package, log in, add card details, and submit for admin approval.
            </Typography>
          </Box>
          <PlanGrid
            plans={plans}
            actionHref={() => "/plans"}
            actionLabel="Register to Purchase"
          />
        </Stack>
      </Container>

      <Box id="reviews" sx={{ bgcolor: "#ffffff", py: { xs: 6, md: 9 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  border: "2px solid #2f64ff",
                  p: 4,
                  color: "#2f64ff",
                  fontWeight: 900,
                  fontSize: 28
                }}
              >
                LAST REVIEWED MAY 2026.
                <br />
                READ IT ON BRILLAR REVIEWS
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <Stack spacing={3}>
                <Typography variant="h3" fontWeight={900}>
                  What our customers are saying
                </Typography>
                <Grid container spacing={3}>
                  {reviews.map((review) => (
                    <Grid item xs={12} md={6} key={review.name}>
                      <Stack spacing={2}>
                        <Rating readOnly value={5} icon={<StarIcon fontSize="inherit" />} />
                        <Typography sx={{ lineHeight: 1.7 }}>{review.body}</Typography>
                        <Box>
                          <Typography fontWeight={900}>{review.name}</Typography>
                          <Typography color="#b44cc1">{review.plan}</Typography>
                        </Box>
                      </Stack>
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container id="help" maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
        <Box
          sx={{
            bgcolor: "#b44cc1",
            color: "common.white",
            p: { xs: 3, md: 5 },
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            gap: 3,
            alignItems: { xs: "flex-start", md: "center" },
            boxShadow: "0 20px 50px rgba(180,76,193,0.22)"
          }}
        >
          <Box>
            <Typography variant="h4">Have a question?</Typography>
            <Typography sx={{ mt: 1, opacity: 0.9 }}>
              We are ready to help with plan choice, installation, and service requests.
            </Typography>
          </Box>
          <Button
            component={Link}
            href="/login"
            variant="outlined"
            startIcon={<HelpOutlineIcon />}
            sx={{ color: "common.white", borderColor: "rgba(255,255,255,0.8)" }}
          >
            Ask Us
          </Button>
        </Box>
      </Container>

      <Box sx={{ bgcolor: "#282828", color: "common.white", py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {[
              ["About", "About Us", "Blog", "Contact Us"],
              ["Services", "Broadband", "Gamer Broadband", "Business"],
              ["Promotions", "Referral", "Group Buys", "New Homeowners"],
              ["Account", "Dashboard", "Billing", "Appointments"]
            ].map(([heading, ...items]) => (
              <Grid item xs={6} md={3} key={heading}>
                <Typography fontWeight={900} sx={{ mb: 2 }}>
                  {heading}
                </Typography>
                <Stack spacing={1}>
                  {items.map((item) => (
                    <Typography variant="body2" key={item} sx={{ opacity: 0.8 }}>
                      {item}
                    </Typography>
                  ))}
                </Stack>
              </Grid>
            ))}
          </Grid>
          <Typography variant="body2" sx={{ mt: 5, opacity: 0.65 }}>
            © 2026 Brillar Broadband
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
