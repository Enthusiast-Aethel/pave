export const money = (n = 0) => `KES ${Number(n).toLocaleString("en-KE")}`;

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