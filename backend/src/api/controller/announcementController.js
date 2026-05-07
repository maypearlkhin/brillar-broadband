import Announcement from "../../models/announcementModel.js";

export async function listAnnouncementsPublic(_req, res) {
  const announcements = await Announcement.find({ isActive: true }).sort({ createdAt: -1 }).lean();

  return res.json({
    announcements: announcements.map((announcement) => ({
      id: announcement._id,
      message: announcement.message,
      createdAt: announcement.createdAt
    }))
  });
}

export async function listAnnouncementsAdmin(_req, res) {
  const announcements = await Announcement.find().sort({ createdAt: -1 }).lean();

  return res.json({
    announcements: announcements.map((announcement) => ({
      id: announcement._id,
      message: announcement.message,
      isActive: announcement.isActive,
      createdAt: announcement.createdAt
    }))
  });
}

export async function createAnnouncement(req, res) {
  const { message } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ message: "Announcement message is required." });
  }

  const announcement = await Announcement.create({
    message: message.trim(),
    isActive: true
  });

  return res.status(201).json({
    announcement: {
      id: announcement._id,
      message: announcement.message,
      createdAt: announcement.createdAt
    }
  });
}

export async function deactivateAnnouncement(req, res) {
  const announcement = await Announcement.findByIdAndUpdate(
    req.params.id,
    { $set: { isActive: false } },
    { new: true }
  );

  if (!announcement) {
    return res.status(404).json({ message: "Announcement not found." });
  }

  return res.json({ message: "Announcement removed." });
}
