"use client";

import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { jsPDF } from "jspdf";

export type ReceiptPayload = {
  invoiceNumber: string;
  paidAt: string;
  customerName?: string;
  planName: string;
  downloadSpeedMbps: number;
  billingTermDays: number;
  amount: number;
  currency?: string;
  serviceStart?: string | null;
  serviceEnd?: string | null;
  subscriptionStatus?: string;
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

function safePdfFilename(invoiceNumber: string) {
  return `Brillar-${invoiceNumber.replace(/[^a-zA-Z0-9-_.]/g, "_")}.pdf`;
}

function buildPdfLines(receipt: ReceiptPayload): string[] {
  const currency = receipt.currency ?? "SGD";
  const lines = [
    "Tax invoice / payment receipt",
    "",
    `Invoice no. ${receipt.invoiceNumber}`,
    `Paid on: ${formatDate(receipt.paidAt)}`,
  ];
  if (receipt.customerName) {
    lines.push(`Account holder: ${receipt.customerName}`);
  }
  lines.push(
    "",
    "Service",
    `${receipt.planName} — ${receipt.downloadSpeedMbps} Mbps`,
    `Prepaid term: ${receipt.billingTermDays} days`,
    `Service period: ${formatDate(receipt.serviceStart)} → ${formatDate(receipt.serviceEnd)}`,
  );
  if (receipt.subscriptionStatus) {
    lines.push(`Subscription status: ${receipt.subscriptionStatus}`);
  }
  lines.push("", `Amount paid: ${currency} $${receipt.amount.toFixed(2)}`, "", "Brillar Broadband · fibre broadband services");
  return lines;
}

function downloadInvoicePdf(receipt: ReceiptPayload) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  const pageW = doc.internal.pageSize.getWidth();
  let y = margin;
  const bodySize = 10;
  const lineHeight = 14;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Brillar Broadband", margin, y);
  y += 26;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(bodySize);
  const lines = buildPdfLines(receipt);
  for (const line of lines) {
    if (!line) {
      y += lineHeight * 0.5;
      continue;
    }
    const wrapped = doc.splitTextToSize(line, pageW - margin * 2) as string[];
    for (const w of wrapped) {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(w, margin, y);
      y += lineHeight;
    }
  }

  doc.save(safePdfFilename(receipt.invoiceNumber));
}

export default function BillingReceiptButton({ receipt }: { receipt: ReceiptPayload }) {
  const [open, setOpen] = useState(false);
  const currency = receipt.currency ?? "SGD";

  function handlePrint() {
    window.print();
  }

  return (
    <>
      <Button size="small" variant="outlined" startIcon={<ReceiptLongIcon />} onClick={() => setOpen(true)}>
        Invoice
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth scroll="paper">
        <DialogTitle sx={{ fontWeight: 700 }}>Tax invoice / payment receipt</DialogTitle>
        <DialogContent dividers className="billing-receipt-print">
          <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary">
              Invoice no. <strong>{receipt.invoiceNumber}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Paid on: {formatDate(receipt.paidAt)}
            </Typography>
            {receipt.customerName ? (
              <Typography variant="body2" color="text.secondary">
                Account holder: <strong>{receipt.customerName}</strong>
              </Typography>
            ) : null}
            <Divider />
            <Typography variant="subtitle1" fontWeight={700}>
              {receipt.planName}
            </Typography>
            <Typography variant="body2">
              {receipt.downloadSpeedMbps} Mbps · Prepaid term: {receipt.billingTermDays} days
            </Typography>
            <Typography variant="body2">
              Service period: {formatDate(receipt.serviceStart)} → {formatDate(receipt.serviceEnd)}
            </Typography>
            {receipt.subscriptionStatus ? (
              <Typography variant="body2">
                Subscription status: <strong>{receipt.subscriptionStatus}</strong>
              </Typography>
            ) : null}
            <Divider />
            <Typography variant="h6" fontWeight={800}>
              Amount paid: {currency} ${receipt.amount.toFixed(2)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Thank you for choosing Brillar Broadband. Retain this document for your records.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }} className="billing-receipt-no-print">
          <Button onClick={() => setOpen(false)}>Close</Button>
          <Button variant="outlined" onClick={handlePrint}>
            Print
          </Button>
          <Button variant="contained" onClick={() => downloadInvoicePdf(receipt)}>
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>
      <style>{`
        @media print {
          .billing-receipt-no-print { display: none !important; }
          .billing-receipt-print { border: none !important; }
        }
      `}</style>
    </>
  );
}
