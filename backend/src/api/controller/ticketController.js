import { getTokenFromRequest, verifyJwt } from "../../auth.js";
import Ticket from "../../models/ticketModel.js";
import TicketComment from "../../models/ticketCommentModel.js";
import User from "../../models/userModel.js";

// CUSTOMER ENDPOINTS

export async function createTicket(req, res) {
  const token = getTokenFromRequest(req);
  const currentUser = token ? verifyJwt(token) : null;

  if (!currentUser) {
    return res.status(401).json({ message: "Authentication required." });
  }

  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: "Title and description are required." });
  }

  const user = await User.findById(currentUser.userId).lean();
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  if (!user.serviceZone) {
    return res.status(400).json({ message: "Service zone is required to create a ticket." });
  }

  const ticket = await Ticket.create({
    userId: user._id,
    title: title.trim(),
    description: description.trim(),
    status: "Open",
    customerName: user.name?.trim() || "Customer",
    customerEmail: user.email,
    zoneCountry: user.serviceZone.country,
    zoneDistrict: user.serviceZone.district,
    zonePostalCode: user.serviceZone.postalCode
  });

  return res.status(201).json({ message: "Ticket created successfully.", ticket });
}

export async function getMyTickets(req, res) {
  const token = getTokenFromRequest(req);
  const currentUser = token ? verifyJwt(token) : null;

  if (!currentUser) {
    return res.status(401).json({ message: "Authentication required." });
  }

  const tickets = await Ticket.find({ userId: currentUser.userId }).sort({ createdAt: -1 }).lean();
  return res.json({ tickets });
}

export async function getTicketDetails(req, res) {
  const token = getTokenFromRequest(req);
  const currentUser = token ? verifyJwt(token) : null;

  if (!currentUser) {
    return res.status(401).json({ message: "Authentication required." });
  }

  const ticketId = req.params.id;
  const ticket = await Ticket.findById(ticketId).lean();

  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found." });
  }

  // Ensure customer can only view their own tickets
  if (currentUser.role !== "admin" && ticket.userId.toString() !== currentUser.userId) {
    return res.status(403).json({ message: "Access denied." });
  }

  const comments = await TicketComment.find({ ticketId }).sort({ createdAt: 1 }).populate("userId", "name role").lean();

  return res.json({ ticket, comments });
}

export async function addComment(req, res) {
  const token = getTokenFromRequest(req);
  const currentUser = token ? verifyJwt(token) : null;

  if (!currentUser) {
    return res.status(401).json({ message: "Authentication required." });
  }

  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ message: "Comment content is required." });
  }

  const ticketId = req.params.id;
  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found." });
  }

  if (currentUser.role !== "admin" && ticket.userId.toString() !== currentUser.userId) {
    return res.status(403).json({ message: "Access denied." });
  }

  if (ticket.status === "Resolved") {
    return res.status(400).json({ message: "Cannot add comments to a resolved ticket." });
  }

  const comment = await TicketComment.create({
    ticketId,
    userId: currentUser.userId,
    content: content.trim(),
    isAdmin: currentUser.role === "admin"
  });

  return res.status(201).json({ message: "Comment added.", comment });
}

// ADMIN ENDPOINTS

export async function getAdminTickets(req, res) {
  const tickets = await Ticket.find().sort({ createdAt: -1 }).lean();
  return res.json({ tickets });
}

export async function updateTicketStatus(req, res) {
  const { status } = req.body;
  
  if (!["Open", "Resolved", "Rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status." });
  }

  const ticketId = req.params.id;
  const ticket = await Ticket.findByIdAndUpdate(ticketId, { status }, { new: true });

  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found." });
  }

  return res.json({ message: "Ticket status updated.", ticket });
}
