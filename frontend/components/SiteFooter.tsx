import { Box, Container, Grid, Stack, Typography, Link as MuiLink } from "@mui/material";
import Link from "next/link";

interface SiteFooterProps {
  dark?: boolean;
}

export default function SiteFooter({ dark = false }: SiteFooterProps) {
  const sectionTitleColor = dark ? "common.white" : "text.primary";
  const bodyColor = dark ? "rgba(255, 255, 255, 0.82)" : "text.secondary";
  const strongBodyColor = dark ? "common.white" : "text.primary";

  return (
    <Box
      sx={{
        pt: { xs: 6, md: 8 },
        pb: { xs: 3, md: 4 },
        borderTop: "1px solid",
        borderColor: dark ? "rgba(255,255,255,0.14)" : "divider",
        bgcolor: dark ? "#0D1B32" : "#f8fafc"
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4} md={3}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: sectionTitleColor }}>
              Brillar Broadband
            </Typography>
            <Typography variant="body2" color={bodyColor} sx={{ mb: 2, lineHeight: 1.7 }}>
              Providing lightning-fast fibre broadband to homes and businesses across Singapore and Malaysia with award-winning customer support.
            </Typography>
            <Typography variant="body2" color={strongBodyColor} sx={{ fontWeight: 600 }}>
              support@brillarbroadband.com
            </Typography>
            <Typography variant="body2" color={strongBodyColor} sx={{ fontWeight: 600 }}>
              enterprise@brillarbroadband.com
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4} md={3}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: sectionTitleColor }}>
              Quick Links
            </Typography>
            <Stack spacing={1}>
              <MuiLink component={Link} href="/#plans" underline="hover" color={bodyColor} variant="body2">Residential Plans</MuiLink>
              <MuiLink component={Link} href="/enterprise" underline="hover" color={bodyColor} variant="body2">Enterprise Solutions</MuiLink>
              <MuiLink component={Link} href="/about" underline="hover" color={bodyColor} variant="body2">About Us</MuiLink>
              <MuiLink component={Link} href="/faq" underline="hover" color={bodyColor} variant="body2">Help Center & FAQ</MuiLink>
              <MuiLink component={Link} href="/service-status" underline="hover" color={bodyColor} variant="body2">Network Status</MuiLink>
              <MuiLink component={Link} href="/login" underline="hover" color={bodyColor} variant="body2">Subscriber Login</MuiLink>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={4} md={3}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: sectionTitleColor }}>
              Coverage Areas
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2" color={bodyColor}>Singapore (Central & Suburbs)</Typography>
              <Typography variant="body2" color={bodyColor}>Kuala Lumpur & Selangor</Typography>
              <Typography variant="body2" color={bodyColor}>Penang & Johor Bahru</Typography>
              <Typography variant="body2" color={bodyColor}>Enterprise Global Links</Typography>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={12} md={3}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: sectionTitleColor }}>
              Our Offices
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color={strongBodyColor} sx={{ fontWeight: 600 }}>Singapore HQ</Typography>
                <Typography variant="body2" color={bodyColor} sx={{ lineHeight: 1.6 }}>
                  7 Temasek Boulevard #12-07<br />Suntec Tower One<br />Singapore 038987
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color={strongBodyColor} sx={{ fontWeight: 600 }}>Malaysia Office</Typography>
                <Typography variant="body2" color={bodyColor} sx={{ lineHeight: 1.6 }}>
                  Level 5, Jalan Cempaka SD12/5<br />Bandar Sri Damansara<br />52200 Kuala Lumpur
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, pt: 2, borderTop: "1px solid", borderColor: dark ? "rgba(255,255,255,0.14)" : "divider", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="body2" color={bodyColor}>
            © {new Date().getFullYear()} Brillar Broadband Pte. Ltd. All rights reserved.
          </Typography>
          <Stack direction="row" spacing={3} sx={{ mt: { xs: 2, sm: 0 } }}>
            <MuiLink href="#" underline="hover" color={bodyColor} variant="caption">Privacy Policy</MuiLink>
            <MuiLink href="#" underline="hover" color={bodyColor} variant="caption">Terms of Service</MuiLink>
            <MuiLink href="#" underline="hover" color={bodyColor} variant="caption">Acceptable Use Policy</MuiLink>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
