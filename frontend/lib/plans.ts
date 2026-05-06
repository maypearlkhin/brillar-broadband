import type { PlanCardData } from "@/components/PlanGrid";

export type PlanCategorySection = {
  categoryId: string;
  categoryTitle: string;
  categorySortOrder: number;
  plans: PlanCardData[];
};

/** Groups API plans into catalogue sections (each residential line shows three tiers). */
export function groupPlansByCategory(plans: PlanCardData[]): PlanCategorySection[] {
  const sorted = [...plans].sort((a, b) => {
    const oa = a.categorySortOrder ?? 999;
    const ob = b.categorySortOrder ?? 999;
    if (oa !== ob) {
      return oa - ob;
    }

    return a.monthlyPrice - b.monthlyPrice;
  });

  const sections: PlanCategorySection[] = [];

  for (const plan of sorted) {
    const categoryId = plan.categoryId ?? "_default";
    let section = sections.find((s) => s.categoryId === categoryId);

    if (!section) {
      section = {
        categoryId,
        categoryTitle: plan.categoryTitle ?? "Plans",
        categorySortOrder: plan.categorySortOrder ?? 999,
        plans: []
      };
      sections.push(section);
    }

    section.plans.push(plan);
  }

  return sections;
}
