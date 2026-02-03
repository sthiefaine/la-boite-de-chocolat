import { getEpisodesWithBudgetStats } from "@/app/actions/episode";
import BudgetPageClient from "./BudgetPageClient";
import { Metadata } from "next";
import styles from "./BudgetPage.module.css";

export const metadata: Metadata = {
  title: "Budget & Box-office des Films",
  description:
    "Classements des films analysés par budget et recettes box-office. Découvrez les plus gros succès, les flops et les surprises parmi les films de notre podcast cinéma.",
};

export default async function BudgetPage() {
  const result = await getEpisodesWithBudgetStats();

  if (!result.success || !result.data) {
    return (
      <div className={styles.empty}>
        <p>Impossible de charger les données budget.</p>
      </div>
    );
  }

  return <BudgetPageClient items={result.data} />;
}
