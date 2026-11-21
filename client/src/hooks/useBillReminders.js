import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { syncReminders } from "../utils/reminders";

export default function useBillReminders() {
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    // Wait a moment so several quick changes only trigger one re-schedule
    const run = () => {
      clearTimeout(timer);
      timer = setTimeout(syncReminders, 800);
    };
    const onVisible = () => document.visibilityState === "visible" && run();

    run();
    window.addEventListener("pave:data-changed", run);
    document.addEventListener("visibilitychange", onVisible);

    let handle;
    if (Capacitor.isNativePlatform()) {
      LocalNotifications.addListener("localNotificationActionPerformed", (e) => {
        navigate(e.notification?.extra?.route || "/bills");
      }).then((h) => (handle = h));
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener("pave:data-changed", run);
      document.removeEventListener("visibilitychange", onVisible);
      handle?.remove();
    };
  }, [navigate]);
}