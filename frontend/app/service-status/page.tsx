import ServiceStatusClient, {
  type AnnouncementPublic,
  type IncidentPublic,
} from "@/components/service-status/ServiceStatusClient";
import { getServerApiBaseUrl } from "@/lib/backend";

export const metadata = {
  title: "Service status · Brillar Broadband",
  description: "Current network impacts, notices, and resolved incident history.",
};

export const dynamic = "force-dynamic";

async function loadStatus(): Promise<{ incidents: IncidentPublic[]; announcements: AnnouncementPublic[] }> {
  const base = getServerApiBaseUrl();

  try {
    const [netRes, annRes] = await Promise.all([
      fetch(`${base}/api/network/status`, { cache: "no-store" }),
      fetch(`${base}/api/announcements`, { cache: "no-store" }),
    ]);

    const incidentsJson = netRes.ok ? await netRes.json() : { incidents: [] };
    const annJson = annRes.ok ? await annRes.json() : { announcements: [] };

    const incidents = (incidentsJson.incidents ?? []) as IncidentPublic[];
    const announcements = (annJson.announcements ?? []) as AnnouncementPublic[];

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

export default async function ServiceStatusPage() {
  const { incidents, announcements } = await loadStatus();

  return <ServiceStatusClient incidents={incidents} announcements={announcements} />;
}
