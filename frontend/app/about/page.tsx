import { Box, Container, Typography, Stack, Grid, Paper, Avatar } from "@mui/material";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";

export const dynamic = "force-dynamic";

const coreValues = [
  {
    title: "Global Reach, Local Presence",
    desc: "While our network spans international borders, our support teams live and work in the communities we serve.",
    icon: PublicOutlinedIcon
  },
  {
    title: "Customer-First Philosophy",
    desc: "We believe in transparent pricing, honest speed advertisements, and resolving issues on the first call.",
    icon: HandshakeOutlinedIcon
  },
  {
    title: "Empowered Teams",
    desc: "Our engineers and customer success teams are empowered to make decisions that best serve our subscribers.",
    icon: GroupsOutlinedIcon
  }
];

export default function AboutPage() {
  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      {/* Hero */}
      <Box sx={{ bgcolor: "background.paper", borderBottom: "1px solid", borderColor: "divider", py: { xs: 8, md: 12 } }}>
        <Container maxWidth="md" sx={{ textAlign: "center" }}>
          <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 700, letterSpacing: 1.5 }}>
            Our Story
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: "-0.02em", mt: 2, mb: 3 }}>
            Connecting Southeast Asia to the world.
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, lineHeight: 1.7 }}>
            Founded with a vision to democratize high-speed internet access, Brillar Broadband has grown into one of the region's most trusted internet service providers. We operate a vast, modern fiber-optic network across Singapore and Malaysia.
          </Typography>
        </Container>
      </Box>

      {/* Mission & Vision */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 4, bgcolor: "rgba(236, 72, 153, 0.05)", borderRadius: 4, border: "1px dashed", borderColor: "primary.light" }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                Our Mission
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                To provide reliable, ultra-fast, and secure digital connectivity that empowers homes and businesses to thrive in a digital-first economy. We are committed to bridging the digital divide through continuous infrastructure investment.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack spacing={4}>
              {coreValues.map((val) => (
                <Stack key={val.title} direction="row" spacing={3}>
                  <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
                    <val.icon fontSize="medium" sx={{ color: "common.white" }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {val.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {val.desc}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Container>

      {/* Milestones */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "background.paper", borderTop: "1px solid", borderColor: "divider" }}>
        <Container maxWidth="lg">
          <Stack spacing={2} sx={{ textAlign: "center", mb: 6 }}>
             <Typography variant="h3" sx={{ fontWeight: 800 }}>Our Journey</Typography>
             <Typography color="text.secondary" sx={{ maxWidth: 600, mx: "auto" }}>From a local startup to a regional telecom leader.</Typography>
          </Stack>
          <Grid container spacing={4}>
            {[
              { year: "2018", title: "Inception", text: "Brillar Broadband was founded in Singapore to challenge legacy ISPs." },
              { year: "2020", title: "10Gbps Core", text: "Upgraded our entire core routing infrastructure to support 10Gbps residential connections." },
              { year: "2023", title: "Malaysia Expansion", text: "Launched our first major nodes in Kuala Lumpur and Johor Bahru." },
              { year: "2026", title: "Enterprise Excellence", text: "Recognized as the top Enterprise ISP in Southeast Asia." }
            ].map((milestone) => (
              <Grid item xs={12} sm={6} md={3} key={milestone.year}>
                <Paper elevation={0} sx={{ p: 4, height: "100%", bgcolor: "grey.50", borderTop: "4px solid", borderColor: "primary.main" }}>
                   <Typography variant="h4" color="primary.main" sx={{ fontWeight: 900, mb: 1 }}>{milestone.year}</Typography>
                   <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{milestone.title}</Typography>
                   <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{milestone.text}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
