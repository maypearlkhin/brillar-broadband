import type { PlanCardData } from "@/components/PlanGrid";

export type PlanCategorySection<TPlan extends PlanCardData = PlanCardData> = {
  categoryId: string;
  categoryTitle: string;
  categorySortOrder: number;
  plans: TPlan[];
};

/** Groups API plans into catalogue sections (each residential line shows three tiers). */
export function groupPlansByCategory<TPlan extends PlanCardData>(plans: TPlan[]): PlanCategorySection<TPlan>[] {
  const sorted = [...plans].sort((a, b) => {
    const oa = a.categorySortOrder ?? 999;
    const ob = b.categorySortOrder ?? 999;
    if (oa !== ob) {
      return oa - ob;
    }

    const pa = a.planSortOrder ?? 999;
    const pb = b.planSortOrder ?? 999;
    if (pa !== pb) {
      return pa - pb;
    }

    return a.monthlyPrice - b.monthlyPrice;
  });

  const sections: PlanCategorySection<TPlan>[] = [];

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
