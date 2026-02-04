/**
 * Utilitaires pour le budget des films :
 * - Formatage monétaire (USD/EUR)
 * - Conversion USD → EUR
 * - Calcul d'inflation (CPI US)
 */

// Taux de change fixe USD → EUR (approximatif, suffisant pour un site de podcast cinéma)
const USD_TO_EUR_RATE = 0.92;

/**
 * Données CPI (Consumer Price Index) US par année
 * Source : Bureau of Labor Statistics (BLS)
 * Base : moyennes annuelles, normalisées pour le calcul d'inflation
 */
const CPI_DATA: Record<number, number> = {
  1920: 20.0,
  1925: 17.5,
  1930: 16.7,
  1935: 13.7,
  1940: 14.0,
  1945: 18.0,
  1950: 24.1,
  1955: 26.8,
  1960: 29.6,
  1965: 31.5,
  1970: 38.8,
  1971: 40.5,
  1972: 41.8,
  1973: 44.4,
  1974: 49.3,
  1975: 53.8,
  1976: 56.9,
  1977: 60.6,
  1978: 65.2,
  1979: 72.6,
  1980: 82.4,
  1981: 90.9,
  1982: 96.5,
  1983: 99.6,
  1984: 103.9,
  1985: 107.6,
  1986: 109.6,
  1987: 113.6,
  1988: 118.3,
  1989: 124.0,
  1990: 130.7,
  1991: 136.2,
  1992: 140.3,
  1993: 144.5,
  1994: 148.2,
  1995: 152.4,
  1996: 156.9,
  1997: 160.5,
  1998: 163.0,
  1999: 166.6,
  2000: 172.2,
  2001: 177.1,
  2002: 179.9,
  2003: 184.0,
  2004: 188.9,
  2005: 195.3,
  2006: 201.6,
  2007: 207.3,
  2008: 215.3,
  2009: 214.5,
  2010: 218.1,
  2011: 224.9,
  2012: 229.6,
  2013: 233.0,
  2014: 236.7,
  2015: 237.0,
  2016: 240.0,
  2017: 245.1,
  2018: 251.1,
  2019: 255.7,
  2020: 258.8,
  2021: 271.0,
  2022: 292.7,
  2023: 304.7,
  2024: 313.0,
  2025: 319.0,
  2026: 325.0,
};

/**
 * Récupère le CPI pour une année, avec interpolation pour les années manquantes
 */
function getCPI(year: number): number {
  if (CPI_DATA[year]) return CPI_DATA[year];

  // Trouver les années les plus proches
  const years = Object.keys(CPI_DATA)
    .map(Number)
    .sort((a, b) => a - b);
  const minYear = years[0];
  const maxYear = years[years.length - 1];

  if (year < minYear) return CPI_DATA[minYear];
  if (year > maxYear) return CPI_DATA[maxYear];

  // Interpolation linéaire
  let lower = minYear;
  let upper = maxYear;
  for (const y of years) {
    if (y <= year) lower = y;
    if (y >= year && upper === maxYear) upper = y;
  }

  if (lower === upper) return CPI_DATA[lower];

  const ratio = (year - lower) / (upper - lower);
  return CPI_DATA[lower] + ratio * (CPI_DATA[upper] - CPI_DATA[lower]);
}

/**
 * Formate un montant avec séparateurs de milliers
 */
export function formatBudget(
  amount: number,
  currency: "USD" | "EUR" = "USD"
): string {
  const formatted = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);

  return formatted;
}

/**
 * Formate un montant en version courte (ex: 200M $)
 */
export function formatBudgetShort(
  amount: number,
  currency: "USD" | "EUR" = "USD"
): string {
  const symbol = currency === "USD" ? "$" : "€";

  if (amount >= 1_000_000_000) {
    const value = amount / 1_000_000_000;
    return `${value.toFixed(value % 1 === 0 ? 0 : 1)}Md ${symbol}`;
  }
  if (amount >= 1_000_000) {
    const value = amount / 1_000_000;
    return `${value.toFixed(value % 1 === 0 ? 0 : 1)}M ${symbol}`;
  }
  if (amount >= 1_000) {
    const value = amount / 1_000;
    return `${value.toFixed(0)}k ${symbol}`;
  }
  return `${amount} ${symbol}`;
}

/**
 * Convertit USD → EUR
 */
export function convertUsdToEur(amountUsd: number): number {
  return Math.round(amountUsd * USD_TO_EUR_RATE);
}

/**
 * Calcule l'inflation entre deux années
 * @returns Le montant ajusté pour l'inflation
 */
export function calculateInflation(
  amount: number,
  fromYear: number,
  toYear: number = new Date().getFullYear()
): number {
  const fromCPI = getCPI(fromYear);
  const toCPI = getCPI(toYear);

  if (fromCPI === 0) return amount;

  return Math.round(amount * (toCPI / fromCPI));
}

/**
 * Retourne toutes les données formatées pour l'affichage du budget
 */
export function getBudgetDisplay(
  budget: number,
  year: number,
  revenue?: number | null
) {
  const currentYear = new Date().getFullYear();
  const adjustedBudget = calculateInflation(budget, year, currentYear);
  const budgetEur = convertUsdToEur(budget);
  const adjustedBudgetEur = convertUsdToEur(adjustedBudget);

  const result: {
    original: string;
    originalShort: string;
    originalEur: string;
    originalEurShort: string;
    adjusted: string;
    adjustedShort: string;
    adjustedEur: string;
    adjustedEurShort: string;
    adjustedYear: number;
    revenue?: {
      original: string;
      originalShort: string;
      originalEur: string;
      originalEurShort: string;
      adjustedShort: string;
      adjustedEurShort: string;
      roi: string;
    };
  } = {
    original: formatBudget(budget, "USD"),
    originalShort: formatBudgetShort(budget, "USD"),
    originalEur: formatBudget(budgetEur, "EUR"),
    originalEurShort: formatBudgetShort(budgetEur, "EUR"),
    adjusted: formatBudget(adjustedBudget, "USD"),
    adjustedShort: formatBudgetShort(adjustedBudget, "USD"),
    adjustedEur: formatBudget(adjustedBudgetEur, "EUR"),
    adjustedEurShort: formatBudgetShort(adjustedBudgetEur, "EUR"),
    adjustedYear: currentYear,
  };

  if (revenue && revenue > 0) {
    const revenueEur = convertUsdToEur(revenue);
    const adjustedRevenue = calculateInflation(revenue, year, currentYear);
    const adjustedRevenueEur = convertUsdToEur(adjustedRevenue);
    const roiPercent = ((revenue - budget) / budget) * 100;

    result.revenue = {
      original: formatBudget(revenue, "USD"),
      originalShort: formatBudgetShort(revenue, "USD"),
      originalEur: formatBudget(revenueEur, "EUR"),
      originalEurShort: formatBudgetShort(revenueEur, "EUR"),
      adjustedShort: formatBudgetShort(adjustedRevenue, "USD"),
      adjustedEurShort: formatBudgetShort(adjustedRevenueEur, "EUR"),
      roi: `${roiPercent >= 0 ? "+" : ""}${roiPercent.toFixed(0)}%`,
    };
  }

  return result;
}
