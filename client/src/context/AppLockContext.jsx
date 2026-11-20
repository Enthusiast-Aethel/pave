import { createContext, useContext, useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import api from "../api";

const AppLockContext = createContext(null);
const STORAGE_KEY = "pave_app_lock";

export function AppLockProvider({ children }) {
  const [isLocked, setIsLocked] = useState(true);
  const [settings, setSettings] = useState(null);
  const [pin, setPin] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    api.get("/settings").then((r) => setSettings(r.data)).catch(() => {});
  }, []);

  // Check biometric availability on native
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // Biometric auth not available in this build, will fallback to PIN
      setBiometricAvailable(false);
    }
  }, []);

  useEffect(() => {
    const checkLock = async () => {
      if (!settings?.appLockEnabled) {
        setIsLocked(false);
        return;
      }
      const lastActive = Number(localStorage.getItem(STORAGE_KEY) || "0");
      const minutes = settings.autoLockMinutes || 1;
      if (Date.now() - lastActive > minutes * 60 * 1000) {
        setIsLocked(true);
      } else {
        setIsLocked(false);
      }
    };
    checkLock();
    const interval = setInterval(checkLock, 10000);
    return () => clearInterval(interval);
  }, [settings]);

  const touch = () => localStorage.setItem(STORAGE_KEY, Date.now().toString());

  const authenticate = async (method, pinInput) => {
    if (method === "PIN" || method === "Both") {
      if (pinInput !== settings?.appLockPIN) {
        setFailedAttempts((f) => f + 1);
        return false;
      }
    }
    if (method === "Biometric" || method === "Both") {
      if (Capacitor.isNativePlatform() && biometricAvailable) {
        // Biometric would go here if plugin was available
        // For now fallback to PIN
        if (pinInput !== settings?.appLockPIN) {
          setFailedAttempts((f) => f + 1);
          return false;
        }
      } else if (!biometricAvailable) {
        if (pinInput !== settings?.appLockPIN) {
          setFailedAttempts((f) => f + 1);
          return false;
        }
      }
    }
    setFailedAttempts(0);
    setIsLocked(false);
    touch();
    return true;
  };

  const lock = () => {
    setIsLocked(true);
    setPin("");
  };

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") touch();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  return (
    <AppLockContext.Provider value={{ isLocked, pin, setPin, authenticate, lock, biometricAvailable, failedAttempts, settings, touch }}>
      {children}
    </AppLockContext.Provider>
  );
}

export function useAppLock() {
  const context = useContext(AppLockContext);
  if (!context) throw new Error("useAppLock must be used within an AppLockProvider");
  return context;
}