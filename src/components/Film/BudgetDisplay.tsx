import { getBudgetDisplay } from "@/helpers/budgetHelpers";
import styles from "./BudgetDisplay.module.css";

interface BudgetDisplayProps {
  budget: number;
  revenue?: number | null;
  year: number;
}

function CoinUSD({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="16" cy="16" r="15" fill="url(#coinGoldGrad)" stroke="#b8860b" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="12" fill="none" stroke="#b8860b" strokeWidth="0.5" opacity="0.5" />
      <text
        x="16"
        y="21"
        textAnchor="middle"
        fill="#7a5a00"
        fontSize="14"
        fontWeight="800"
        fontFamily="system-ui, sans-serif"
      >
        $
      </text>
      <defs>
        <linearGradient id="coinGoldGrad" x1="4" y1="4" x2="28" y2="28">
          <stop offset="0%" stopColor="#ffd700" />
          <stop offset="50%" stopColor="#ffec80" />
          <stop offset="100%" stopColor="#daa520" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function CoinEUR({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="16" cy="16" r="15" fill="url(#coinSilverGrad)" stroke="#8a8a8a" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="12" fill="none" stroke="#8a8a8a" strokeWidth="0.5" opacity="0.5" />
      <text
        x="16"
        y="21"
        textAnchor="middle"
        fill="#4a4a4a"
        fontSize="14"
        fontWeight="800"
        fontFamily="system-ui, sans-serif"
      >
        €
      </text>
      <defs>
        <linearGradient id="coinSilverGrad" x1="4" y1="4" x2="28" y2="28">
          <stop offset="0%" stopColor="#e8e8e8" />
          <stop offset="50%" stopColor="#f8f8f8" />
          <stop offset="100%" stopColor="#b0b0b0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function TrendIcon({ positive, className }: { positive: boolean; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {positive ? (
        <path
          d="M3 14l4-4 3 3 7-7M14 6h3v3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M3 6l4 4 3-3 7 7M14 14h3v-3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

export default function BudgetDisplay({
  budget,
  revenue,
  year,
}: BudgetDisplayProps) {
  const data = getBudgetDisplay(budget, year, revenue);
  const roiPositive = data.revenue?.roi.startsWith("+") ?? false;
  const roiValue = data.revenue
    ? parseInt(data.revenue.roi.replace(/[+%]/g, ""))
    : 0;
  const roiBarWidth = Math.min(Math.abs(roiValue) / 10, 100);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.coinStack}>
          <CoinUSD className={`${styles.coin} ${styles.coinBack}`} />
          <CoinEUR className={`${styles.coin} ${styles.coinFront}`} />
        </div>
        <h3 className={styles.title}>Budget & Box-office</h3>
      </div>

      {/* Budget row */}
      <div className={styles.row}>
        <div className={styles.rowHeader}>
          <CoinUSD className={styles.rowCoin} />
          <span className={styles.rowLabel}>Budget ({year})</span>
        </div>
        <div className={styles.values}>
          <span className={styles.primaryValue}>{data.originalShort}</span>
          <span className={styles.secondaryValue}>{data.originalEurShort}</span>
        </div>
      </div>

      {/* Adjusted row */}
      <div className={styles.row}>
        <div className={styles.rowHeader}>
          <CoinEUR className={styles.rowCoin} />
          <span className={styles.rowLabel}>Ajusté {data.adjustedYear}</span>
        </div>
        <div className={styles.values}>
          <span className={styles.primaryValue}>{data.adjustedShort}</span>
          <span className={styles.secondaryValue}>
            {data.adjustedEurShort}
          </span>
        </div>
      </div>

      {/* Revenue */}
      {data.revenue && (
        <>
          <div className={styles.divider} />

          <div className={styles.row}>
            <div className={styles.rowHeader}>
              <CoinUSD className={styles.rowCoin} />
              <span className={styles.rowLabel}>Box-office ({year})</span>
            </div>
            <div className={styles.values}>
              <span className={styles.primaryValue}>
                {data.revenue.originalShort}
              </span>
              <span className={styles.secondaryValue}>
                {data.revenue.originalEurShort}
              </span>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.rowHeader}>
              <CoinEUR className={styles.rowCoin} />
              <span className={styles.rowLabel}>Ajusté {data.adjustedYear}</span>
            </div>
            <div className={styles.values}>
              <span className={styles.primaryValue}>
                {data.revenue.adjustedShort}
              </span>
              <span className={styles.secondaryValue}>
                {data.revenue.adjustedEurShort}
              </span>
            </div>
          </div>

          {/* ROI */}
          <div className={styles.roiSection}>
            <div className={styles.roiHeader}>
              <TrendIcon
                positive={roiPositive}
                className={`${styles.trendIcon} ${
                  roiPositive ? styles.trendPositive : styles.trendNegative
                }`}
              />
              <span className={styles.roiLabel}>Retour sur investissement</span>
            </div>
            <div className={styles.roiDisplay}>
              <span
                className={`${styles.roiValue} ${
                  roiPositive ? styles.roiPositive : styles.roiNegative
                }`}
              >
                {data.revenue.roi}
              </span>
              <div className={styles.roiBarTrack}>
                <div
                  className={`${styles.roiBar} ${
                    roiPositive ? styles.roiBarPositive : styles.roiBarNegative
                  }`}
                  style={{ width: `${roiBarWidth}%` }}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
