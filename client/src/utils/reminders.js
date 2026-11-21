import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import api from "../api";
import { money } from "./format";

export const isNative = Capacitor.isNativePlatform();

const CHANNEL = "bills";
const DAY = 86400000;

const parseKey = (key) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const shortDate = (date) =>
  date.toLocaleDateString("en-KE", { day: "numeric", month: "short" });

// date + shiftDays, at "HH:MM" local time
const at = (date, shiftDays, time) => {
  const [h, m] = time.split(":").map(Number);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + shiftDays, h, m, 0);
};

// Unpaid bills (this month + next), with days-to-due worked out on THIS device
export async function fetchDueSoon() {
  const now = new Date();
  const { data } = await api.get("/bills/unpaid", {
    params: { year: now.getFullYear(), month: now.getMonth() + 1 },
  });
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return data
    .map((b) => {
      const due = parseKey(b.dueKey);
      return { ...b, due, daysToDue: Math.round((due - today) / DAY) };
    })
    .filter((b) => b.daysToDue <= 30)
    .sort((a, b) => a.due - b.due);
}

async function ensurePermission() {
  let perm = await LocalNotifications.checkPermissions();
  if (perm.display !== "granted") perm = await LocalNotifications.requestPermissions();
  return perm.display === "granted";
}

const createChannel = () =>
  LocalNotifications.createChannel({
    id: CHANNEL,
    name: "Bill reminders",
    description: "Reminders for bills that are due",
    importance: 4,
    visibility: 1,
  });

export async function cancelReminders() {
  if (!isNative) return;
  try {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }
  } catch {
    /* ignore */
  }
}

// Clears old reminders and schedules fresh ones from the latest data
export async function syncReminders() {
  if (!isNative) return;
  try {
    const { data: s } = await api.get("/settings");
    await cancelReminders();
    if (!s.billReminders) return;
    if (!(await ensurePermission())) return;
    await createChannel();

    const bills = await fetchDueSoon();
    const now = new Date();
    const time = s.reminderTime || "08:00";
    const days = Number(s.reminderDaysBefore) || 0;

    const items = [];
    let id = 1;
    const add = (when, title, body) => {
      if (when <= now) return;
      items.push({
        id: id++,
        title,
        body,
        channelId: CHANNEL,
        schedule: { at: when, allowWhileIdle: true },
        extra: { route: "/bills" },
      });
    };

    // Overdue: one grouped reminder per day for the next 3 days
    const overdue = bills.filter((b) => b.daysToDue < 0);
    if (overdue.length) {
      const total = overdue.reduce((sum, b) => sum + b.outstanding, 0);
      const body =
        overdue.length === 1
          ? `${overdue[0].name} · ${money(overdue[0].outstanding)} is overdue`
          : `${overdue.length} bills are overdue (${money(total)} in total)`;
      for (let i = 0; i < 3; i++) add(at(now, i, time), "Bills overdue", body);
    }

    // Upcoming: N days before + on the due date
    bills
      .filter((b) => b.daysToDue >= 0)
      .forEach((b) => {
        const label = `${b.name} · ${money(b.outstanding)}`;
        if (days > 0 && b.daysToDue >= days) {
          add(
            at(b.due, -days, time),
            "Bill due soon",
            `${label} is due in ${days} day${days === 1 ? "" : "s"} (${shortDate(b.due)})`
          );
        }
        add(at(b.due, 0, time), "Bill due today", label);
      });

    if (items.length) await LocalNotifications.schedule({ notifications: items });
  } catch (err) {
    console.warn("Reminder sync failed:", err);
  }
}

// For the "Send test reminder" button
export async function sendTestReminder() {
  if (!isNative) return false;
  if (!(await ensurePermission())) return false;
  await createChannel();
  await LocalNotifications.schedule({
    notifications: [
      {
        id: 999999,
        title: "Pave reminder test",
        body: "Bill reminders are working ✓",
        channelId: CHANNEL,
        schedule: { at: new Date(Date.now() + 5000), allowWhileIdle: true },
        extra: { route: "/bills" },
      },
    ],
  });
  return true;
}