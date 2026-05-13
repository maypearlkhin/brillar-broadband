export type ServiceZone = {
  country: string;
  district: string;
  postalCode: string;
};

export function formatServiceZone(zone: ServiceZone | null | undefined) {
  if (!zone?.country && !zone?.district && !zone?.postalCode) {
    return "—";
  }
  const country = zone.country?.trim() || "—";
  const district = zone.district?.trim() || "—";
  const postal = zone.postalCode?.trim() || "—";
  return `${country} (${district}) - ${postal}`;
}
