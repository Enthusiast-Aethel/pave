const MANDATORY = [
  "Rent", "Electricity", "Water", "Gas", "Internet/Airtime", "Transport",
  "Essential Groceries", "Healthcare", "Transactional Charges",
];
const SAVINGS_AND_DEBT = ["Mshwari Loan", "Helb Loan", "Debt"];

// Everything else (Tithe, Allowances, Personal Care, Subscription, Misc…) = wants
export function bucketOf(category) {
  if (MANDATORY.includes(category)) return "mandatory";
  if (SAVINGS_AND_DEBT.includes(category)) return "savings";
  return "wants";
}