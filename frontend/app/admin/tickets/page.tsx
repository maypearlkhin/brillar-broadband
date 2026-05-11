"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { getData } from "@/lib/api";
import { useRouter } from "next/navigation";

type Ticket = {
  _id: string;
  title: string;
  description: string;
  status: "Open" | "Resolved" | "Rejected";
  customerName: string;
  customerEmail: string;
  zoneCountry: string;
  zoneDistrict: string;
  zonePostalCode: string;
  createdAt: string;
};

export default function AdminTicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [currentTab, setCurrentTab] = useState<"Open" | "Resolved" | "Rejected">("Open");

  async function loadTickets() {
    try {
      const { data } = await getData("/api/admin/tickets");
      setTickets(data.tickets || []);
    } catch (err) {
      console.error("Failed to load tickets", err);
    }
  }

  useEffect(() => {
    loadTickets();
  }, []);

  const filteredTickets = tickets.filter((t) => t.status === currentTab);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Support Tickets</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Manage and resolve customer support issues.
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={currentTab} onChange={(_, newVal) => setCurrentTab(newVal)}>
          <Tab label="Open" value="Open" />
          <Tab label="Resolved" value="Resolved" />
          <Tab label="Rejected" value="Rejected" />
        </Tabs>
      </Box>

      <Stack spacing={2}>
        {filteredTickets.length === 0 ? (
          <Typography color="text.secondary">No {currentTab.toLowerCase()} tickets found.</Typography>
        ) : (
          filteredTickets.map((ticket) => (
            <Card key={ticket._id} variant="outlined" sx={{ borderRadius: 2 }}>
              <CardActionArea onClick={() => router.push(`/admin/tickets/${ticket._id}`)}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {ticket.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Reported on {new Date(ticket.createdAt).toLocaleDateString()} by {ticket.customerName} ({ticket.customerEmail})
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Zone: {ticket.zoneDistrict}, {ticket.zoneCountry} ({ticket.zonePostalCode})
                      </Typography>
                    </Box>
                    <Chip
                      label={ticket.status}
                      color={ticket.status === "Open" ? "primary" : ticket.status === "Resolved" ? "success" : "error"}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          ))
        )}
      </Stack>
    </Box>
  );
}
