const localizedProfileWordByLocale = {
  en: "profile",
  nl: "profiel",
  zh: "个人资料",
};

function capitalizeWords(value) {
  return value.replace(/\b([a-z])/gi, (letter) => letter.toUpperCase());
}

export function buildProfileHeading(name, locale) {
  const normalizedName = String(name ?? "").trim();
  const activeLocale = String(locale ?? "en").split("-")[0];
  const localizedProfileWord = localizedProfileWordByLocale[activeLocale] ?? "profile";

  if (!normalizedName) {
    return localizedProfileWord.charAt(0).toUpperCase() + localizedProfileWord.slice(1);
  }

  const capitalizedName = capitalizeWords(normalizedName);
  if (activeLocale === "zh") {
    return `${capitalizedName}的${localizedProfileWord}`;
  }
  return `${capitalizedName}'s ${localizedProfileWord}`;
}
