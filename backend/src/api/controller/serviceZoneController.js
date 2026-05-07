import ServiceZone from "../../models/serviceZoneModel.js";

export async function listServiceZones(_req, res) {
  const zones = await ServiceZone.find().sort({ country: 1, postalCode: 1 }).lean();

  return res.json({
    zones: zones.map((z) => ({
      country: z.country,
      district: z.district,
      postalCode: z.postalCode
    }))
  });
}
