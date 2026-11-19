# Pave

**Plan every shilling, track every spend, and make progress toward your goals.**

Pave is a personal budgeting and net-worth app for recording income, expenses, savings, recurring bills, savings goals, and asset or liability balances. It uses Kenyan shillings (KES) and is available as a web app and an Android app.

## Get Pave

- **Web app:** [pave-omega.vercel.app](https://pave-omega.vercel.app). On a compatible phone browser, use **Install app** or **Add to Home Screen** to add Pave to your home screen.
- **Android app:** [Download the latest APK](https://github.com/Enthusiast-Aethel/pave/releases/latest/download/Pave.apk)
- **All Android versions:** [GitHub Releases](https://github.com/Enthusiast-Aethel/pave/releases)

The Android APK is distributed through GitHub Releases and is not currently listed on Google Play. Android may ask you to allow your browser or file manager to install apps from that source. Only install an APK you have verified came from the official Pave release link, and pay attention to your device’s security warnings.

## What you can do

- **Record transactions:** Add income, expenses, and savings with a date, category, amount, and optional note. Review monthly totals and filter or edit your transaction history.
- **Plan a monthly budget:** Set category amounts for income, expenses, and savings, see how actual activity compares with the plan, and copy the previous month’s plan.
- **Track bills:** Add monthly, quarterly, or yearly bills; view due dates in a calendar; and track paid, upcoming, and overdue amounts.
- **Set savings goals:** Give each goal a target, date, linked savings category, and monthly plan. Pave tracks progress from savings transactions in that category.
- **Track net worth:** Add asset and liability accounts and record their month-end balances to view your net worth, history, and asset allocation.
- **Review budget health:** Compare spending with the budget-rule percentages configured in your account.
- **Get bill reminders:** Configure reminder timing in Account settings. The Android app can schedule local device notifications; the web app shows due bills in Notifications.

## Getting started

1. Open Pave and create an account with your name, email, and a password of at least eight characters.
2. Record your transactions from **Transact**.
3. Use **Explore → Plan budget** to set monthly category amounts.
4. Add recurring bills, savings goals, and account balances as needed.
5. In **Account**, set your name, budget rule, late-income rule, net-worth goal, and bill-reminder preferences.

## Important notes

- **Pave does not connect to your bank or import transactions automatically.** Add and update your financial activity and account balances yourself.
- **Currency:** Amounts are shown in Kenyan shillings (KES).
- **Bill matching:** An expense recorded in a bill’s linked category counts toward that bill’s payment.
- **Savings goals:** Savings recorded in a goal’s linked category count toward its progress.
- **Late income:** When enabled, income received on or after your chosen day is counted toward the following month.
- **Reminders:** Scheduled notifications are available in the Android app and require notification permission on the device. In a web browser, unpaid bills are shown in the app, but scheduled phone reminders are not available.
- **Connectivity and account recovery:** Pave uses an online API to load and sync account data. Self-service password reset and in-app data export are not currently available, so keep your sign-in details secure.

## Run locally

### Requirements

- Node.js 20 or later
- A MongoDB instance, local or hosted

### Start the API

Create `server/.env` with your own database URI and a private JWT secret:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/pave
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_URL=http://localhost:5173
```

Then install dependencies and start the API:

```powershell
cd server
npm install
npm run dev
```

The API connects to MongoDB before it starts listening. Keep `server/.env` private; do not commit secrets.

### Start the web client

In a second terminal:

```powershell
cd client
npm install
npm run dev
```

Open the Vite URL printed in the terminal (by default, `http://localhost:5173`). During local development, Vite forwards `/api` requests to `http://localhost:5000`. The client’s `VITE_API_URL` setting can be used when the API is hosted at a different URL.

To create a production web build:

```powershell
cd client
npm run build
```

For deployment, configure the API’s `MONGO_URI`, `JWT_SECRET`, and allowed client origin (`CLIENT_URL`), and point the client’s `VITE_API_URL` at the deployed API as needed.

## Project structure

- `client/` — React, Vite, Tailwind CSS, and Capacitor web/Android app
- `server/` — Express API, authentication, and MongoDB models

The API is mounted under `/api`. Registration and login are public; personal finance endpoints require an authenticated account.
