import bcrypt from "bcryptjs";
import Plan from "./models/planModel.js";
import ServiceZone from "./models/serviceZoneModel.js";
import User from "./models/userModel.js";

/** Two residential catalogue lines × 3 plans each (order = categorySortOrder, then price). */
export const DEFAULT_PLANS = [
  {
    id: "plan_004",
    name: "100Mbps Essential",
    monthlyPrice: 32,
    downloadSpeedMbps: 100,
    features: ["Unlimited data", "Wi-Fi 5 router included", "Email & browsing bundle"],
    categoryId: "res_everyday",
    categoryTitle: "Residential · Everyday fibre",
    categorySortOrder: 0,
    isActive: true
  },
  {
    id: "plan_005",
    name: "250Mbps Everyday",
    monthlyPrice: 39,
    downloadSpeedMbps: 250,
    features: ["HD streaming ready", "Wi-Fi 6 router", "Standard installation"],
    categoryId: "res_everyday",
    categoryTitle: "Residential · Everyday fibre",
    categorySortOrder: 0,
    isActive: true
  },
  {
    id: "plan_006",
    name: "350Mbps Family starter",
    monthlyPrice: 46,
    downloadSpeedMbps: 350,
    features: ["Multiple devices", "Parental controls", "Weekday install slots"],
    categoryId: "res_everyday",
    categoryTitle: "Residential · Everyday fibre",
    categorySortOrder: 0,
    isActive: true
  },
  {
    id: "plan_001",
    name: "500Mbps Basic",
    monthlyPrice: 49,
    downloadSpeedMbps: 500,
    features: ["Unlimited data", "Wi-Fi 6 router", "Standard installation"],
    categoryId: "res_performance",
    categoryTitle: "Residential · Performance & gaming",
    categorySortOrder: 1,
    isActive: true
  },
  {
    id: "plan_002",
    name: "1Gbps Gamer Pro",
    monthlyPrice: 89.99,
    downloadSpeedMbps: 1000,
    features: ["Free Mesh Router", "Static IP", "Low-latency routing"],
    categoryId: "res_performance",
    categoryTitle: "Residential · Performance & gaming",
    categorySortOrder: 1,
    isActive: true
  },
  {
    id: "plan_003",
    name: "2Gbps Family Max",
    monthlyPrice: 109,
    downloadSpeedMbps: 2000,
    features: ["Multi-room coverage", "Parental controls", "Premium installation"],
    categoryId: "res_performance",
    categoryTitle: "Residential · Performance & gaming",
    categorySortOrder: 1,
    isActive: true
  }
];

const DEMO_SERVICE_ZONES = [
  { country: "Singapore", district: "Jurong East", postalCode: "609606" },
  { country: "Singapore", district: "Tampines", postalCode: "529653" },
  { country: "Singapore", district: "Orchard / Somerset", postalCode: "238858" },
  { country: "Singapore", district: "Bishan", postalCode: "570623" },
  { country: "Singapore", district: "Woodlands", postalCode: "730651" },
  { country: "Singapore", district: "Marina Bay / Downtown", postalCode: "018956" },
  { country: "Malaysia", district: "Kuala Lumpur — Bukit Bintang", postalCode: "55100" },
  { country: "Malaysia", district: "Kuala Lumpur — Ampang", postalCode: "50450" },
  { country: "Malaysia", district: "Johor Bahru — Skudai", postalCode: "81300" },
  { country: "Malaysia", district: "Penang — Georgetown", postalCode: "10200" },
  { country: "Malaysia", district: "Selangor — Subang Jaya", postalCode: "47500" },
  { country: "Malaysia", district: "Sabah — Kota Kinabalu", postalCode: "88000" }
];

let seedPromise = null;

export async function seedDatabase() {
  if (seedPromise) {
    return seedPromise;
  }

  seedPromise = (async () => {
    const passwordHash = await bcrypt.hash("password123", 10);

    await User.updateOne(
      { email: "admin@brillar.com" },
      { $setOnInsert: {
          email: "admin@brillar.com",
          passwordHash,
          role: "admin",
          name: "Brillar Admin",
          serviceZone: {
            country: "Singapore",
            district: "Jurong East",
            postalCode: "609606"
          }
        }
      },
      { upsert: true }
    );

    await User.updateOne({ email: "admin@brillar.com" }, { $set: { name: "Brillar Admin" } });

    await Promise.all(
      DEFAULT_PLANS.map((plan) => Plan.updateOne({ id: plan.id }, { $set: plan }, { upsert: true }))
    );

    await Promise.all(
      DEMO_SERVICE_ZONES.map((zone) =>
        ServiceZone.updateOne({ postalCode: zone.postalCode }, { $set: zone }, { upsert: true })
      )
    );
  })();

  return seedPromise;
}
