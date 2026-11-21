import { useEffect, useState } from "react";
import api from "../api";

export default function useSettings() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.get("/settings").then((r) => setSettings(r.data)).catch(() => {});
  }, []);

  return settings;
}