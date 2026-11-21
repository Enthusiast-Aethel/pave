export const money = (n = 0) => `KES ${Number(n).toLocaleString("en-KE")}`;

// Parse M-Pesa confirmation messages (Kenya) - no SMS permission needed
// Supports Safaricom formats like:
// "M-PESA: Confirmed! You have received KES 1,500 from JOHN DOE. Txn: ABC123"
// "M-PESA: You have sent KES 200 to MUSA M. Txn: XYZ789"
// "M-PESA: Paid! KES 3,000 to KPLC. Txn: PAY456"
export function parseMpesa(text) {
  if (!text || typeof text !== "string") return null;

  // Look for amount patterns: KES 1,500 or KES 1500
  const amountMatch = text.match(/KES\s*([\d,]+)/i);
  if (!amountMatch) return null;
  const amount = Number(amountMatch[1].replace(/,/g, ""));
  if (isNaN(amount) || amount <= 0) return null;

  // Date: look for date patterns like 15/11/2026 or 15 Nov 2026
  let date = new Date();
  const dateMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (dateMatch) {
    const day = Number(dateMatch[1]);
    const month = Number(dateMatch[2]);
    let year = Number(dateMatch[3]);
    if (year < 100) year += 2000;
    date = new Date(year, month - 1, day);
  } else {
    // Try ISO format
    const isoMatch = text.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      date = new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
    }
  }

  // Extract merchant: look for "to <NAME>" or "from <NAME>" or "paid to <NAME>"
  let merchant = "";
  const toMatch = text.match(/(?:to|paid to)\s+([A-Z][A-Z0-9\s.]+?)(?:\.|,|\s+Txn|\s+On|\s+Date|\s+Ref|\s+Balance|\s+Your)/i);
  const fromMatch = text.match(/from\s+([A-Z][A-Z0-9\s.]+?)(?:\.|,|\s+Txn|\s+On|\s+Date|\s+Ref|\s+Balance|\s+Your)/i);
  if (toMatch) {
    merchant = toMatch[1].trim();
  } else if (fromMatch) {
    merchant = fromMatch[1].trim();
  }

  return {
    amount,
    date: date.toISOString().slice(0, 10),
    merchant: merchant || "M-Pesa transaction",
  };
}

// yyyy-mm-dd in the user's LOCAL time (avoids timezone off-by-one)
export const toInputDate = (d = new Date()) => {
  const x = new Date(d);
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const day = String(x.getDate()).padStart(2, "0");
  return `${x.getFullYear()}-${m}-${day}`;
};

// "Today", "Yesterday", or "28 Oct 2026" from a yyyy-mm-dd key
export const dayLabel = (key) => {
  const today = toInputDate();
  const yest = toInputDate(new Date(Date.now() - 86400000));
  if (key === today) return "Today";
  if (key === yest) return "Yesterday";
  return new Date(key + "T00:00:00").toLocaleDateString("en-KE", {
    day: "numeric", month: "short", year: "numeric",
  });
};