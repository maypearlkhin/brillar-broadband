export type ServiceZone = {
  country: string;
  district: string;
  postalCode: string;
};

export const SERVICE_ZONES: ServiceZone[] = [
  {
    country: "Singapore",
    district: "Jurong East",
    postalCode: "609606"
  },
  {
    country: "Malaysia",
    district: "Kuala Lumpur, Bukit Bintang",
    postalCode: "55100"
  },
  {
    country: "Malaysia",
    district: "Johor Bahru, Skudai",
    postalCode: "81300"
  }
];

export function formatServiceZone(zone: ServiceZone) {
  return `${zone.country} (${zone.district}) - ${zone.postalCode}`;
}

export function isValidServiceZone(zone: unknown): zone is ServiceZone {
  if (!zone || typeof zone !== "object") {
    return false;
  }

  const candidate = zone as ServiceZone;

  return SERVICE_ZONES.some(
    (allowedZone) =>
      allowedZone.country === candidate.country &&
      allowedZone.district === candidate.district &&
      allowedZone.postalCode === candidate.postalCode
  );
}
