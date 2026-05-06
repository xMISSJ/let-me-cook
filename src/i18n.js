import { createI18n } from "vue-i18n";
import en from "./locales/en";
import nl from "./locales/nl";
import zh from "./locales/zh";

const SUPPORTED_LOCALES = ["en", "nl", "zh"];

function getDeviceLocale() {
  if (typeof navigator === "undefined") return "en";

  const raw =
    (Array.isArray(navigator.languages) && navigator.languages[0]) ||
    navigator.language ||
    "en";

  const normalized = String(raw).toLowerCase();
  const base = normalized.split("-")[0];

  if (base === "nl") return "nl";
  if (base === "zh") return "zh";
  if (base === "en") return "en";

  return "en";
}

const messages = {
  en,
  nl,
  zh,
};

const i18n = createI18n({
  legacy: false,
  locale: SUPPORTED_LOCALES.includes(getDeviceLocale()) ? getDeviceLocale() : "en",
  fallbackLocale: "en",
  messages,
});

export default i18n;
