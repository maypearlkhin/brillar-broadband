import { getTokenFromRequest, verifyJwt } from "../../auth.js";
import Appointment from "../../models/appointmentModel.js";

const MAX_SLOTS_PER_WINDOW = 5; // hardcoded: 5 ISP team members

function getNextSevenDates() {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 1; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    dates.push(`${yyyy}-${mm}-${dd}`);
  }
  return dates;
}

function getCurrentUser(req) {
  const token = getTokenFromRequest(req);
  return token ? verifyJwt(token) : null;
}

export async function getAvailableSlots(_req, res) {
  const dates = getNextSevenDates();

  // Fetch all bookings in that window that aren't cancelled
  const bookings = await Appointment.find({
    scheduledDate: { $in: dates },
    status: { $ne: "Cancelled" },
  }).lean();

  // Build a map: "YYYY-MM-DD|morning" => count
  const countMap = {};
  for (const b of bookings) {
    const key = `${b.scheduledDate}|${b.timeSlot}`;
    countMap[key] = (countMap[key] || 0) + 1;
  }

  const slots = dates.map((date) => {
    return {
      date,
      windows: ["morning", "afternoon"].map((timeSlot) => {
        const booked = countMap[`${date}|${timeSlot}`] || 0;
        const available = MAX_SLOTS_PER_WINDOW - booked;
        return { timeSlot, booked, available, isFull: available <= 0 };
      }),
    };
  });

  return res.json({ success: true, data: slots });
}

export async function createAppointment(req, res) {
  const currentUser = getCurrentUser(req);
  if (!currentUser) {
    return res.status(401).json({ message: "Authentication required." });
  }
  if (currentUser.role !== "customer") {
    return res.status(403).json({ message: "Only customers can book appointments." });
  }

  const { scheduledDate, timeSlot, notes } = req.body;

  if (!scheduledDate || !["morning", "afternoon"].includes(timeSlot)) {
    return res.status(400).json({ message: "scheduledDate and timeSlot (morning|afternoon) are required." });
  }

  // Validate date is within next 7 days
  const validDates = getNextSevenDates();
  if (!validDates.includes(scheduledDate)) {
    return res.status(400).json({ message: "Selected date is not available. Please pick from the next 7 days." });
  }

  // Check slot capacity
  const booked = await Appointment.countDocuments({
    scheduledDate,
    timeSlot,
    status: { $ne: "Cancelled" },
  });

  if (booked >= MAX_SLOTS_PER_WINDOW) {
    return res.status(409).json({ message: "This time slot is fully booked. Please choose another." });
  }

  const appointment = await Appointment.create({
    customerId: currentUser.userId,
    scheduledDate,
    timeSlot,
    notes: notes ?? "",
    status: "Pending",
  });

  return res.status(201).json({
    success: true,
    message: "Appointment scheduled successfully.",
    appointment,
  });
}

export async function listAppointments(req, res) {
  const currentUser = getCurrentUser(req);
  if (!currentUser) {
    return res.status(401).json({ message: "Authentication required." });
  }

  let query = {};
  if (currentUser.role === "customer") {
    query.customerId = currentUser.userId;
  }
  // admin and isp_team see all

  const appointments = await Appointment.find(query)
    .sort({ scheduledDate: 1, timeSlot: 1, createdAt: -1 })
    .populate("customerId", "name email serviceZone")
    .lean();

  return res.json({ success: true, data: appointments });
}

export async function updateAppointmentStatus(req, res) {
  const currentUser = getCurrentUser(req);
  if (!currentUser) {
    return res.status(401).json({ message: "Authentication required." });
  }

  if (!["admin", "isp_team"].includes(currentUser.role)) {
    return res.status(403).json({ message: "Only ISP team or admin can update appointment status." });
  }

  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ["Approved", "Completed", "Cancelled"];
  if (!validStatuses.includes(status)) {
    return res
      .status(400)
      .json({ message: `Status must be one of: ${validStatuses.join(", ")}` });
  }

  const now = new Date();
  const timestampField =
    status === "Approved"
      ? { approvedAt: now }
      : status === "Completed"
      ? { completedAt: now }
      : { cancelledAt: now };

  const appointment = await Appointment.findByIdAndUpdate(
    id,
    { status, ...timestampField },
    { new: true }
  ).populate("customerId", "name email serviceZone");

  if (!appointment) {
    return res.status(404).json({ message: "Appointment not found." });
  }

  return res.json({ success: true, appointment });
}
