import { getEpisodesWithBudgetStats } from "@/app/actions/episode";
import BudgetShowcase from "./BudgetShowcase";

export default async function BudgetCarousel() {
  const result = await getEpisodesWithBudgetStats();

  if (!result.success || !result.data || result.data.length === 0) {
    return null;
  }

  return <BudgetShowcase items={result.data} />;
}
