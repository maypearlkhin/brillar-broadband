import { getTokenFromRequest, verifyJwt, resolveRequestUserId } from "../../auth.js";
import Appointment from "../../models/appointmentModel.js";
import Subscription from "../../models/subscriptionModel.js";

const MAX_SLOTS_PER_WINDOW = 5; // hardcoded: 5 ISP team members

function addDays(from, days) {
  const date = new Date(from);
  date.setDate(date.getDate() + days);
  return date;
}

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

  const userId = resolveRequestUserId(req, currentUser);
  if (!userId) {
    return res.status(400).json({ message: "userId is required in request body." });
  }

  const { scheduledDate, timeSlot, notes, type, subscriptionId } = req.body;

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

  const appointmentType = type === "installation" ? "installation" : "home_service";

  // Installation appointment validation
  if (appointmentType === "installation") {
    if (!subscriptionId) {
      return res.status(400).json({ message: "subscriptionId is required for installation appointments." });
    }

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found." });
    }

    if (subscription.userId.toString() !== userId) {
      return res.status(403).json({ message: "This subscription does not belong to you." });
    }

    if (subscription.status !== "Pending") {
      return res.status(400).json({ message: "Installation can only be scheduled for pending subscriptions." });
    }

    // Check no existing installation appointment for this subscription
    const existingInstallAppt = await Appointment.findOne({
      subscriptionId: subscriptionId,
      type: "installation",
      status: { $ne: "Cancelled" },
    });

    if (existingInstallAppt) {
      return res.status(409).json({ message: "An installation appointment already exists for this subscription." });
    }
  }

  const appointment = await Appointment.create({
    customerId: userId,
    type: appointmentType,
    subscriptionId: appointmentType === "installation" ? subscriptionId : null,
    scheduledDate,
    timeSlot,
    notes: notes ?? "",
    status: "Pending",
  });

  // If installation appointment, update the subscription
  if (appointmentType === "installation") {
    await Subscription.findByIdAndUpdate(subscriptionId, {
      status: "Scheduled",
      installationAppointmentId: appointment._id,
    });
  }

  return res.status(201).json({
    success: true,
    message: appointmentType === "installation"
      ? "Installation appointment scheduled successfully."
      : "Appointment scheduled successfully.",
    appointment,
  });
}

export async function listAppointments(req, res) {
  const currentUser = getCurrentUser(req);
  if (!currentUser) {
    return res.status(401).json({ message: "Authentication required." });
  }

  const userId = resolveRequestUserId(req, currentUser);

  let query = {};
  if (currentUser.role === "customer") {
    if (!userId) {
      return res.status(400).json({ message: "userId is required in request body." });
    }
    query.customerId = userId;
  }
  // admin and isp_team see all

  const appointments = await Appointment.find(query)
    .sort({ scheduledDate: 1, timeSlot: 1, createdAt: -1 })
    .populate("customerId", "name email serviceZone phone")
    .populate({
      path: "subscriptionId",
      populate: { path: "planId", select: "name downloadSpeedMbps monthlyPrice" },
    })
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
  const { status, routerId } = req.body;

  const validStatuses = ["Approved", "Completed", "Cancelled"];
  if (!validStatuses.includes(status)) {
    return res
      .status(400)
      .json({ message: `Status must be one of: ${validStatuses.join(", ")}` });
  }

  const appointment = await Appointment.findById(id);
  if (!appointment) {
    return res.status(404).json({ message: "Appointment not found." });
  }

  const now = new Date();
  const timestampField =
    status === "Approved"
      ? { approvedAt: now }
      : status === "Completed"
      ? { completedAt: now }
      : { cancelledAt: now };

  // If this is an installation appointment being completed, require routerId
  if (appointment.type === "installation" && status === "Completed") {
    if (!routerId || !routerId.trim()) {
      return res.status(400).json({
        message: "Router ID is required to complete an installation appointment."
      });
    }

    // Update the linked subscription — prepaid term begins when installation completes
    if (appointment.subscriptionId) {
      const sub = await Subscription.findById(appointment.subscriptionId).select("billingTerm");
      const termDays = Number(sub?.billingTerm ?? "30");
      const safeDays = Number.isFinite(termDays) && termDays > 0 ? termDays : 30;
      const serviceStart = now;
      const serviceEnd = addDays(now, safeDays);

      await Subscription.findByIdAndUpdate(appointment.subscriptionId, {
        status: "Installed",
        routerId: routerId.trim(),
        installedAt: now,
        startDate: serviceStart,
        endDate: serviceEnd,
      });
    }
  }

  // If installation appointment is cancelled, revert subscription to Pending
  if (appointment.type === "installation" && status === "Cancelled") {
    if (appointment.subscriptionId) {
      const sub = await Subscription.findById(appointment.subscriptionId);
      if (sub && sub.status === "Scheduled") {
        sub.status = "Pending";
        sub.installationAppointmentId = null;
        await sub.save();
      }
    }
  }

  const updatedAppointment = await Appointment.findByIdAndUpdate(
    id,
    { status, ...timestampField },
    { new: true }
  ).populate("customerId", "name email serviceZone phone");

  return res.json({ success: true, appointment: updatedAppointment });
}
