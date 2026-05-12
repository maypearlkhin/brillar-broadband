"use client";

import { useState } from "react";
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { postData } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function CancelPlanButton({
  subscriptionId,
  onAfterCancel,
}: {
  subscriptionId: string;
  /** Runs after cancel succeeds (e.g. refetch dashboard subscription state). */
  onAfterCancel?: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleCancel = async () => {
    setLoading(true);
    try {
      await postData("/api/cancel-plan", { subscriptionId });
      setOpen(false);
      await onAfterCancel?.();
      router.refresh();
    } catch (error) {
      console.error("Failed to cancel plan", error);
      alert("Failed to cancel plan. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        color="error"
        onClick={handleOpen}
        size="small"
        sx={{
          bgcolor: "background.paper",
          fontWeight: 600,
          "&:hover": {
            bgcolor: "rgba(211, 47, 47, 0.06)",
          },
        }}
      >
        Cancel Plan
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Cancel Subscription</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel your active subscription? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Keep Plan
          </Button>
          <Button onClick={handleCancel} color="error" autoFocus disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Yes, Cancel Plan"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
