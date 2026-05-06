import { Box, Button, Container, Stack, Typography } from "@mui/material";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "calc(100vh - 64px)", py: 8 }}>
      <Container maxWidth="sm">
        <Stack spacing={3}>
          <Typography variant="h4">Page not found</Typography>
          <Typography color="text.secondary">
            The plan or page you requested is not available.
          </Typography>
          <Button component={Link} href="/" variant="contained">
            View Plans
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
