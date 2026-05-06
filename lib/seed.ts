import bcrypt from "bcryptjs";
import Plan from "@/lib/models/Plan";
import User from "@/lib/models/User";

const DEFAULT_PLANS = [
  {
    id: "500-basic",
    name: "500Mbps Basic",
    monthlyPrice: 49,
    downloadSpeedMbps: 500,
    features: ["Unlimited data", "Wi-Fi 6 router", "Standard installation"],
    isActive: true
  },
  {
    id: "1gbps-gamer-pro",
    name: "1Gbps Gamer Pro",
    monthlyPrice: 79,
    downloadSpeedMbps: 1000,
    features: ["Low-latency routing", "Priority support", "Wi-Fi 6 router"],
    isActive: true
  },
  {
    id: "2gbps-family-max",
    name: "2Gbps Family Max",
    monthlyPrice: 109,
    downloadSpeedMbps: 2000,
    features: ["Multi-room coverage", "Parental controls", "Premium installation"],
    isActive: true
  }
];

let seedPromise: Promise<void> | null = null;

export async function seedDatabase() {
  if (seedPromise) {
    return seedPromise;
  }

  seedPromise = (async () => {
    const passwordHash = await bcrypt.hash("password123", 10);

    await User.updateOne(
      { email: "admin@brillar.com" },
      {
        $setOnInsert: {
          email: "admin@brillar.com",
          passwordHash,
          role: "admin",
          serviceZone: {
            country: "Singapore",
            district: "Jurong East",
            postalCode: "609606"
          }
        }
      },
      { upsert: true }
    );

    await Promise.all(
      DEFAULT_PLANS.map((plan) =>
        Plan.updateOne({ id: plan.id }, { $setOnInsert: plan }, { upsert: true })
      )
    );
  })();

  return seedPromise;
}
