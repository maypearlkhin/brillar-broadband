import NetworkIncident from "../../models/networkIncidentModel.js";
import ServiceZone from "../../models/serviceZoneModel.js";

export async function listNetworkStatus(_req, res) {
  const incidents = await NetworkIncident.find().sort({ createdAt: -1 }).lean();

  return res.json({
    incidents: incidents.map((incident) => ({
      id: incident._id,
      country: incident.country,
      district: incident.district,
      postalCode: incident.postalCode,
      message: incident.message,
      createdAt: incident.createdAt,
      resolvedAt: incident.resolvedAt ?? null
    }))
  });
}

export async function createNetworkIncident(req, res) {
  const { location, message } = req.body;

  if (!location?.country || !location?.district || !location?.postalCode) {
    return res.status(400).json({
      message: "location with country, district, and postalCode is required."
    });
  }

  if (!message?.trim()) {
    return res.status(400).json({ message: "Outage message is required." });
  }

  const allowed = await ServiceZone.findOne({
    country: location.country,
    district: location.district,
    postalCode: location.postalCode
  }).lean();

  if (!allowed) {
    return res.status(400).json({
      message: "Please choose one of Brillar Broadband's supported service zones."
    });
  }

  const incident = await NetworkIncident.create({
    country: location.country,
    district: location.district,
    postalCode: location.postalCode,
    message: message.trim()
  });

  return res.status(201).json({
    incident: {
      id: incident._id,
      country: incident.country,
      district: incident.district,
      postalCode: incident.postalCode,
      message: incident.message,
      createdAt: incident.createdAt
    }
  });
}

export async function resolveNetworkIncident(req, res) {
  const incident = await NetworkIncident.findByIdAndUpdate(
    req.params.id,
    { $set: { resolvedAt: new Date() } },
    { new: true }
  );

  if (!incident) {
    return res.status(404).json({ message: "Incident not found." });
  }

  return res.json({ message: "Incident cleared.", incident: { id: incident._id, resolvedAt: incident.resolvedAt } });
}
