import { Box, Container, Typography, Stack, Grid, Paper, Button, Divider } from "@mui/material";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import SpeedOutlinedIcon from "@mui/icons-material/SpeedOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import Link from "next/link";

export const dynamic = "force-dynamic";

const enterpriseFeatures = [
  {
    title: "Dedicated Internet Access (DIA)",
    desc: "Uncontended, symmetrical bandwidth up to 10Gbps with a 99.99% SLA. Perfect for mission-critical applications.",
    icon: SpeedOutlinedIcon
  },
  {
    title: "Managed SD-WAN",
    desc: "Intelligent routing across multiple paths, reducing WAN costs while improving performance for your branch offices.",
    icon: BusinessCenterOutlinedIcon
  },
  {
    title: "Enterprise Cybersecurity",
    desc: "Built-in DDoS protection, managed firewalls, and secure edge access to keep your corporate data secure.",
    icon: SecurityOutlinedIcon
  }
];

export default function EnterprisePage() {
  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      {/* Hero */}
      <Box
        sx={{
          borderBottom: "1px solid",
          borderColor: "rgba(254, 197, 86, 0.4)",
          color: "common.white",
          py: { xs: 8, md: 12 },
          backgroundImage:
            "linear-gradient(rgba(7, 16, 35, 0.5), rgba(7, 16, 35, 0.5)), url('/images/enterprise-hero-family.png?v=1')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={8}>
              <Stack spacing={3}>
                <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 700, letterSpacing: 1.5 }}>
                  Brillar Enterprise
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                  Next-generation connectivity for digital business.
                </Typography>
                <Typography variant="h6" sx={{ color: "rgba(255, 255, 255, 0.9)", fontWeight: 400, lineHeight: 1.6, maxWidth: 600 }}>
                  Scale your operations with dedicated fiber, SD-WAN, and zero-trust security. Engineered for high-growth enterprises in Singapore and Malaysia.
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ pt: 2 }}>
                  <Button variant="contained" color="primary" size="large" sx={{ px: 4 }}>
                    Contact Sales
                  </Button>
                  <Button variant="outlined" color="primary" size="large" sx={{ px: 4 }}>
                    View Solutions
                  </Button>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Solutions Grid */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Stack spacing={1} sx={{ mb: 6, textAlign: "center", alignItems: "center" }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Enterprise-Grade Infrastructure
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 600 }}>
            We provide the backbone for modern digital enterprises. Whether you need dark fiber or managed network services, Brillar delivers.
          </Typography>
        </Stack>
        <Grid container spacing={4}>
          {enterpriseFeatures.map((feat) => (
            <Grid item xs={12} md={4} key={feat.title}>
              <Paper elevation={0} sx={{ p: 4, height: "100%", border: "1px solid", borderColor: "divider", borderRadius: 3, transition: "transform 0.2s", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" } }}>
                <Box sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: "rgba(254, 197, 86, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "primary.main", mb: 3 }}>
                  <feat.icon fontSize="large" />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                  {feat.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {feat.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Global Footprint */}
      <Box
        sx={{
          py: { xs: 8, md: 10 },
          backgroundImage:
            "linear-gradient(rgba(7, 16, 35, 0.62), rgba(7, 16, 35, 0.62)), url('/images/enterprise-global-bg.png?v=1')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={5}>
              <Stack spacing={2}>
                <Typography variant="overline" color="primary" sx={{ fontWeight: 700, letterSpacing: 1.2 }}>
                  Global Network
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.02em", color: "common.white" }}>
                  Connected to the world's largest exchanges.
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.8, color: "rgba(255, 255, 255, 0.9)" }}>
                  Our resilient fiber ring connects directly to Equinix SG1, Global Switch, and major international submarine cables. This ensures your data travels the shortest, most secure path to cloud providers like AWS, Google Cloud, and Azure.
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={7}>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Paper elevation={0} sx={{ p: 3, border: "1px dashed", borderColor: "primary.light", bgcolor: "rgba(255, 255, 255, 0.9)", borderRadius: 2 }}>
                    <Typography variant="h3" color="primary.main" sx={{ fontWeight: 800, mb: 1 }}>
                      2Tbps+
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      International Capacity
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper elevation={0} sx={{ p: 3, border: "1px dashed", borderColor: "primary.light", bgcolor: "rgba(255, 255, 255, 0.9)", borderRadius: 2 }}>
                    <Typography variant="h3" color="primary.main" sx={{ fontWeight: 800, mb: 1 }}>
                      &lt;2ms
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Local Gateway Latency
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Divider />

      {/* SLA / Contact CTA */}
      <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: "grey.50" }}>
        <Container maxWidth="md" sx={{ textAlign: "center" }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
            Guaranteed 99.99% Uptime
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.8 }}>
            Your business can't afford downtime. Our enterprise Service Level Agreements (SLAs) ensure proactive monitoring and sub-4-hour hardware replacement across all service zones.
          </Typography>
          <Button component={Link} href="/faq" variant="contained" size="large" sx={{ py: 1.5, px: 5, borderRadius: 2 }}>
            Visit Enterprise Help Center
          </Button>
        </Container>
      </Box>
    </Box>
  );
}
