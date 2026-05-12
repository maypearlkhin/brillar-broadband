import bcrypt from "bcryptjs";
import Plan from "./models/planModel.js";
import PlanCategory from "./models/planCategoryModel.js";
import ServiceZone from "./models/serviceZoneModel.js";
import User from "./models/userModel.js";


/** Two residential catalogue lines × 3 plans each (order = categorySortOrder, then price). */
export const DEFAULT_PLANS = [
  {
    id: "plan_004",
    name: "100Mbps Essential",
    monthlyPrice: 32,
    price90Days: 96,
    price180Days: 192,
    price365Days: 384,
    downloadSpeedMbps: 100,
    features: ["Unlimited data", "Wi-Fi 5 router included", "Email & browsing bundle"],
    categoryId: "res_everyday",
    categoryTitle: "Residential · Everyday fibre",
    categorySortOrder: 0,
    planSortOrder: 0,
    isActive: true
  },
  {
    id: "plan_005",
    name: "250Mbps Everyday",
    monthlyPrice: 39,
    price90Days: 117,
    price180Days: 234,
    price365Days: 468,
    downloadSpeedMbps: 250,
    features: ["HD streaming ready", "Wi-Fi 6 router", "Standard installation"],
    categoryId: "res_everyday",
    categoryTitle: "Residential · Everyday fibre",
    categorySortOrder: 0,
    planSortOrder: 1,
    isActive: true
  },
  {
    id: "plan_006",
    name: "350Mbps Family starter",
    monthlyPrice: 46,
    price90Days: 138,
    price180Days: 276,
    price365Days: 552,
    downloadSpeedMbps: 350,
    features: ["Multiple devices", "Parental controls", "Weekday install slots"],
    categoryId: "res_everyday",
    categoryTitle: "Residential · Everyday fibre",
    categorySortOrder: 0,
    planSortOrder: 2,
    isActive: true
  },
  {
    id: "plan_001",
    name: "500Mbps Basic",
    monthlyPrice: 49,
    price90Days: 147,
    price180Days: 294,
    price365Days: 588,
    downloadSpeedMbps: 500,
    features: ["Unlimited data", "Wi-Fi 6 router", "Standard installation"],
    categoryId: "res_performance",
    categoryTitle: "Residential · Performance & gaming",
    categorySortOrder: 1,
    planSortOrder: 0,
    isActive: true
  },
  {
    id: "plan_002",
    name: "1Gbps Gamer Pro",
    monthlyPrice: 89.99,
    price90Days: 269.97,
    price180Days: 539.94,
    price365Days: 1079.88,
    downloadSpeedMbps: 1000,
    features: ["Free Mesh Router", "Static IP", "Low-latency routing"],
    categoryId: "res_performance",
    categoryTitle: "Residential · Performance & gaming",
    categorySortOrder: 1,
    planSortOrder: 1,
    isActive: true
  },
  {
    id: "plan_003",
    name: "2Gbps Family Max",
    monthlyPrice: 109,
    price90Days: 327,
    price180Days: 654,
    price365Days: 1308,
    downloadSpeedMbps: 2000,
    features: ["Multi-room coverage", "Parental controls", "Premium installation"],
    categoryId: "res_performance",
    categoryTitle: "Residential · Performance & gaming",
    categorySortOrder: 1,
    planSortOrder: 2,
    isActive: true
  }
];

const DEFAULT_PLAN_CATEGORIES = [
  {
    id: "res_everyday",
    title: "Residential Â· Everyday fibre",
    sortOrder: 0,
    isActive: true
  },
  {
    id: "res_performance",
    title: "Residential Â· Performance & gaming",
    sortOrder: 1,
    isActive: true
  }
];

const DEMO_SERVICE_ZONES = [
  // ── Singapore ────────────────────────────────────────────────
  { country: "Singapore", district: "Jurong East", postalCode: "609606" },
  { country: "Singapore", district: "Tampines", postalCode: "529653" },
  { country: "Singapore", district: "Orchard / Somerset", postalCode: "238858" },
  { country: "Singapore", district: "Bishan", postalCode: "570623" },
  { country: "Singapore", district: "Woodlands", postalCode: "730651" },
  { country: "Singapore", district: "Marina Bay / Downtown", postalCode: "018956" },
  { country: "Singapore", district: "Ang Mo Kio", postalCode: "560123" },
  { country: "Singapore", district: "Bedok", postalCode: "460025" },
  { country: "Singapore", district: "Clementi", postalCode: "120456" },
  { country: "Singapore", district: "Toa Payoh", postalCode: "310789" },
  { country: "Singapore", district: "Sengkang", postalCode: "540321" },
  { country: "Singapore", district: "Punggol", postalCode: "820654" },
  { country: "Singapore", district: "Bukit Batok", postalCode: "651234" },
  { country: "Singapore", district: "Bukit Panjang / Cashew", postalCode: "671234" },
  { country: "Singapore", district: "Choa Chu Kang", postalCode: "689812" },
  { country: "Singapore", district: "Hougang", postalCode: "530234" },
  { country: "Singapore", district: "Pasir Ris", postalCode: "510567" },
  { country: "Singapore", district: "Serangoon", postalCode: "557890" },
  { country: "Singapore", district: "Bukit Timah / Holland", postalCode: "588123" },
  { country: "Singapore", district: "Queenstown / Commonwealth", postalCode: "140078" },
  { country: "Singapore", district: "Geylang / Tanjong Katong", postalCode: "427378" },
  { country: "Singapore", district: "Marine Parade / Joo Chiat", postalCode: "438786" },
  { country: "Singapore", district: "Sembawang / Canberra", postalCode: "752034" },
  { country: "Singapore", district: "Yishun", postalCode: "761234" },
  { country: "Singapore", district: "West Coast / Dover", postalCode: "126567" },
  { country: "Singapore", district: "Kallang / Lavender / Balestier", postalCode: "328456" },
  { country: "Singapore", district: "Newton / Novena", postalCode: "307591" },
  { country: "Singapore", district: "Little India / Rochor", postalCode: "218456" },
  { country: "Singapore", district: "Chinatown / Tanjong Pagar", postalCode: "089012" },
  { country: "Singapore", district: "HarbourFront / Sentosa Gateway", postalCode: "098585" },

  // ── Malaysia ───────────────────────────────────────────────────
  { country: "Malaysia", district: "Kuala Lumpur — Bukit Bintang", postalCode: "55100" },
  { country: "Malaysia", district: "Kuala Lumpur — Ampang", postalCode: "50450" },
  { country: "Malaysia", district: "Kuala Lumpur — Bangsar", postalCode: "59100" },
  { country: "Malaysia", district: "Kuala Lumpur — Mont Kiara / Sri Hartamas", postalCode: "50480" },
  { country: "Malaysia", district: "Kuala Lumpur — KLCC / Kampung Baru", postalCode: "50088" },
  { country: "Malaysia", district: "Kuala Lumpur — Cheras", postalCode: "56000" },
  { country: "Malaysia", district: "Selangor — Subang Jaya", postalCode: "47500" },
  { country: "Malaysia", district: "Selangor — Petaling Jaya", postalCode: "46050" },
  { country: "Malaysia", district: "Selangor — Petaling Jaya (Damansara)", postalCode: "46000" },
  { country: "Malaysia", district: "Selangor — Shah Alam", postalCode: "40150" },
  { country: "Malaysia", district: "Selangor — Shah Alam (Sections)", postalCode: "40000" },
  { country: "Malaysia", district: "Selangor — Cyberjaya", postalCode: "63000" },
  { country: "Malaysia", district: "Selangor — Klang / Port Klang", postalCode: "41050" },
  { country: "Malaysia", district: "Selangor — Kajang / Bangi", postalCode: "43000" },
  { country: "Malaysia", district: "Selangor — Serdang / South KV", postalCode: "43400" },
  { country: "Malaysia", district: "Selangor — Puchong", postalCode: "47100" },
  { country: "Malaysia", district: "Selangor — Rawang", postalCode: "48000" },
  { country: "Malaysia", district: "Johor — Johor Bahru City Centre", postalCode: "80000" },
  { country: "Malaysia", district: "Johor — Skudai / Universiti", postalCode: "81300" },
  { country: "Malaysia", district: "Johor — Iskandar Puteri / Nusajaya", postalCode: "79100" },
  { country: "Malaysia", district: "Johor — Pasir Gudang / Masai", postalCode: "81750" },
  { country: "Malaysia", district: "Penang — George Town", postalCode: "10200" },
  { country: "Malaysia", district: "Penang — Bayan Lepas / Industrial", postalCode: "11900" },
  { country: "Malaysia", district: "Penang — Butterworth / Seberang Perai", postalCode: "12300" },
  { country: "Malaysia", district: "Penang — Bukit Mertajam", postalCode: "14000" },
  { country: "Malaysia", district: "Sabah — Kota Kinabalu", postalCode: "88000" },
  { country: "Malaysia", district: "Sabah — Sandakan", postalCode: "90000" },
  { country: "Malaysia", district: "Sarawak — Kuching", postalCode: "93050" },
  { country: "Malaysia", district: "Sarawak — Miri", postalCode: "98000" },
  { country: "Malaysia", district: "Perak — Ipoh", postalCode: "30450" },
  { country: "Malaysia", district: "Melaka — Melaka City", postalCode: "75000" },
  { country: "Malaysia", district: "Negeri Sembilan — Seremban", postalCode: "70200" },
  { country: "Malaysia", district: "Pahang — Kuantan", postalCode: "25000" },
  { country: "Malaysia", district: "Terengganu — Kuala Terengganu", postalCode: "20400" },
  { country: "Malaysia", district: "Kedah — Alor Setar", postalCode: "05100" },
  { country: "Malaysia", district: "Kelantan — Kota Bharu", postalCode: "15300" },
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
      DEFAULT_PLAN_CATEGORIES.map((category) =>
        PlanCategory.updateOne({ id: category.id }, { $set: category }, { upsert: true })
      )
    );

    await Promise.all(
      DEFAULT_PLANS.map((plan) => Plan.updateOne({ id: plan.id }, { $set: plan }, { upsert: true }))
    );

    await Promise.all(
      DEMO_SERVICE_ZONES.map((zone) =>
        ServiceZone.updateOne({ postalCode: zone.postalCode }, { $set: zone }, { upsert: true })
      )
    );

    const keepPostalCodes = DEMO_SERVICE_ZONES.map((z) => z.postalCode);
    await ServiceZone.deleteMany({ postalCode: { $nin: keepPostalCodes } });

  })();

  return seedPromise;
}
