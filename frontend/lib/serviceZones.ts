export type ServiceZone = {
  country: string;
  district: string;
  postalCode: string;
};

export function formatServiceZone(zone: ServiceZone) {
  return `${zone.country} (${zone.district}) - ${zone.postalCode}`;
}
