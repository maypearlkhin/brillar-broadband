import ServiceStatusClient, {
  type AnnouncementPublic,
  type IncidentPublic,
} from "@/components/service-status/ServiceStatusClient";
import { axiosServer } from "@/lib/axiosServer";

export const metadata = {
  title: "Service status · Brillar Broadband",
  description: "Current network impacts, notices, and resolved incident history.",
};

export const dynamic = "force-dynamic";

async function loadStatus(): Promise<{ incidents: IncidentPublic[]; announcements: AnnouncementPublic[] }> {
  try {
    const api = axiosServer();
    const [netRes, annRes] = await Promise.all([
      api.get<{ incidents: IncidentPublic[] }>("/api/network/status"),
      api.get<{ announcements: AnnouncementPublic[] }>("/api/announcements"),
    ]);

    const incidents = netRes.data.incidents ?? [];
    const announcements = annRes.data.announcements ?? [];

    return {
      incidents: incidents.map((i) => ({
        ...i,
        resolvedAt: i.resolvedAt ?? null,
        createdAt: typeof i.createdAt === "string" ? i.createdAt : new Date(i.createdAt as Date).toISOString(),
      })),
      announcements: announcements.map((a) => ({
        ...a,
        createdAt:
          typeof a.createdAt === "string" ? a.createdAt : new Date(a.createdAt as Date).toISOString(),
      })),
    };
  } catch {
    return { incidents: [], announcements: [] };
  }
}

export default async function ServiceStatusPage({
  searchParams,
}: {
  searchParams?: { tab?: string };
}) {
  const validTabs = new Set(["active", "notices", "resolved"]);
  const tabFromUrl = searchParams?.tab;
  const initialTab = validTabs.has(String(tabFromUrl)) ? (tabFromUrl as "active" | "notices" | "resolved") : "active";
  const { incidents, announcements } = await loadStatus();

  return (
    <ServiceStatusClient
      incidents={incidents}
      announcements={announcements}
      initialTab={initialTab}
    />
  );
}
