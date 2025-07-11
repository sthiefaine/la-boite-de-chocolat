import AdminCard from "../AdminCard/AdminCard";
import styles from "./AdminCardsGrid.module.css";

interface AdminCardData {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: "chocolate" | "blue" | "green" | "purple" | "red";
  href?: string;
  onClick?: () => void;
  loading?: boolean;
  buttonText?: string;
  stats?: {
    label: string;
    value: string;
  };
}

interface AdminCardsGridProps {
  cards: AdminCardData[];
}

export default function AdminCardsGrid({ cards }: AdminCardsGridProps) {
  return (
    <div className={styles.cardsGrid}>
      {cards.map((card) => (
        <AdminCard key={card.id} {...card} />
      ))}
    </div>
  );
}
