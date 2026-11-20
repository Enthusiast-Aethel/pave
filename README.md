# Pave

**Plan every shilling, track every spend, and make progress toward your goals.**

Pave is a personal budgeting and net-worth app for recording income, expenses, savings, recurring bills, savings goals, and asset or liability balances. It uses Kenyan shillings (KES) and is available as a web app and an Android app.

## Get Pave

- **Web app:** [pave-omega.vercel.app](https://pave-omega.vercel.app). On a compatible phone browser, use **Install app** or **Add to Home Screen** to add Pave to your home screen.
- **Android app:** [Download the latest APK](https://github.com/Enthusiast-Aethel/pave/releases/latest/download/Pave.apk)
- **All Android versions:** [GitHub Releases](https://github.com/Enthusiast-Aethel/pave/releases)

The Android APK is distributed through GitHub Releases and is not currently listed on Google Play. Android may ask you to allow your browser or file manager to install apps from that source. Only install an APK you have verified came from the official Pave release link, and pay attention to your device's security warnings.

## What you can do

### Core features
- **Record transactions:** Add income, expenses, and savings with a date, category, amount, and optional note. Review monthly totals and filter or edit your transaction history.
- **Plan a monthly budget:** Set category amounts for income, expenses, and savings, see how actual activity compares with the plan, and copy the previous month's plan.
- **Track bills:** Add monthly, quarterly, or yearly bills; view due dates in a calendar; and track paid, upcoming, and overdue amounts.
- **Set savings goals:** Give each goal a target, date, linked savings category, and monthly plan. Pave tracks progress from savings transactions in that category.
- **Track net worth:** Add asset and liability accounts and record their month-end balances to view your net worth, history, and asset allocation.
- **Review budget health:** Compare spending with the budget-rule percentages configured in your account.
- **Get bill reminders:** Configure reminder timing in Account settings. The Android app can schedule local device notifications; the web app shows due bills in Notifications.

### New features
- **Time-aware greeting:** Home screen shows "Good morning/afternoon/evening" or "Night owl" based on the current hour.
- **App update notifications:** Account screen checks GitHub Releases and shows an "Update available" link when a new version is published.
- **Dark & Light mode:** Toggle between themes in Account settings; preference is saved and applies instantly.
- **Screenshot protection:** Android app prevents screenshots and screen recording; web app disables printing.
- **M-Pesa paste-to-add:** On the Add Transaction screen, tap "Paste M-Pesa" to read a Safaricom confirmation message from your clipboard and auto-fill amount, date, and merchant. No SMS permissions required.
- **One-tap "Mark as paid":** On each bill, tap "Paid" to log the expense in the bill's linked category for the outstanding amount—skipping the full transaction form.
- **Custom categories:** Add, rename, or hide categories from the new Categories screen. Everyone budgets differently.
- **App lock (PIN + auto-lock):** Protect Pave with a 4-digit PIN. Optionally lock automatically after 1 minute in the background. Biometric support planned.
- **Hide amounts:** Tap the eye icon on Home to blur all balances when you're in public.
- **Export all data:** Download a complete JSON backup of your transactions, bills, goals, accounts, investments, settings, and custom categories from Account settings.
- **Safe to spend today:** One number on Home: remaining budget ÷ days left in the month.
- **Spending insights:** "You spent 23% more on Transport than last month," top merchants, daily average, and a month-end forecast ("at this pace you'll overspend by KES 1,800").
- **Financial health score:** A 92% gauge built from 50/30/20 adherence, savings rate, emergency-fund months, and debt-to-asset ratio.
- **Investment tracker:** Track MMF, stocks, SACCO shares, and bonds with gains/losses over time.

## Getting started

1. Open Pave and create an account with your name, email, and a password of at least eight characters.
2. Record your transactions from **Transact**.
3. Use **Explore → Plan budget** to set monthly category amounts.
4. Add recurring bills, savings goals, and account balances as needed.
5. In **Account**, set your name, budget rule, late-income rule, net-worth goal, and bill-reminder preferences.

## Important notes

- **Pave does not connect to your bank or import transactions automatically.** Add and update your financial activity and account balances yourself.
- **Currency:** Amounts are shown in Kenyan shillings (KES).
- **Bill matching:** An expense recorded in a bill's linked category counts toward that bill's payment.
- **Savings goals:** Savings recorded in a goal's linked category count toward its progress.
- **Late income:** When enabled, income received on or after your chosen day is counted toward the following month.
- **Reminders:** Scheduled notifications are available in the Android app and require notification permission on the device. In a web browser, unpaid bills are shown in the app, but scheduled phone reminders are not available.
- **Connectivity and account recovery:** Pave uses an online API to load and sync account data. Self-service password reset and in-app data export are not currently available, so keep your sign-in details secure.

## Project structure

- `client/` — React, Vite, Tailwind CSS, and Capacitor web/Android app
- `server/` — Express API, authentication, and MongoDB models

The API is mounted under `/api`. Registration and login are public; personal finance endpoints require an authenticated account.