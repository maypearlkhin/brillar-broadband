import { Box, Container, Typography, Stack, Paper, Accordion, AccordionSummary, AccordionDetails, Chip } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { FAQs } from "@/data/faqs";
import SiteFooter from "@/components/SiteFooter";

export const dynamic = "force-dynamic";

function renderAnswer(answer: string) {
  const lines = answer.split("\n");
  const blocks: Array<{ type: "p"; text: string } | { type: "ul"; items: string[] }> = [];
  let currentList: string[] = [];
  let currentParagraph: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      blocks.push({ type: "p", text: currentParagraph.join(" ") });
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (currentList.length > 0) {
      blocks.push({ type: "ul", items: currentList });
      currentList = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (line.startsWith("- ")) {
      flushParagraph();
      currentList.push(line.slice(2).trim());
      continue;
    }

    flushList();
    currentParagraph.push(line);
  }

  flushParagraph();
  flushList();

  return blocks.map((block, idx) => {
    if (block.type === "ul") {
      return (
        <Box key={`ul-${idx}`} component="ul" sx={{ mt: 0.5, mb: 2, pl: 3 }}>
          {block.items.map((item, itemIdx) => (
            <Typography key={`li-${idx}-${itemIdx}`} component="li" variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              {item}
            </Typography>
          ))}
        </Box>
      );
    }

    return (
      <Typography key={`p-${idx}`} variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 1.5 }}>
        {block.text}
      </Typography>
    );
  });
}

export default function FaqPage() {
  const faqs = FAQs;

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <Box sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="md">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
            }}
          >
            <Stack spacing={2} alignItems="center" sx={{ mb: 5, textAlign: "center" }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  bgcolor: "rgba(254, 197, 86, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "primary.main",
                  mb: 1
                }}
              >
                <HelpOutlineIcon fontSize="large" />
              </Box>
              <Typography variant="h3" component="h1" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
                Help Center & FAQs
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, lineHeight: 1.6 }}>
                Find quick solutions to common network issues, billing inquiries, and router setup steps.
              </Typography>
            </Stack>

            {faqs.length === 0 ? (
              <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                No FAQs available at the moment.
              </Typography>
            ) : (
              <Box>
                {faqs.map((faq) => (
                  <Accordion
                    key={faq.id}
                    elevation={0}
                    sx={{
                      "&:before": { display: "none" },
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      "&:last-of-type": { borderBottom: 0 },
                      bgcolor: "transparent"
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon color="primary" />}
                      sx={{ px: 1, py: 1.5, "& .MuiAccordionSummary-content": { my: 0 } }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                        <Chip label={faq.category} size="small" variant="outlined" color="primary" sx={{ borderRadius: 1 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {faq.question}
                        </Typography>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 1, pb: 3, pt: 0 }}>
                      <Box>{renderAnswer(faq.answer)}</Box>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            )}
          </Paper>
        </Container>
      </Box>
      <SiteFooter dark />
    </Box>
  );
}
