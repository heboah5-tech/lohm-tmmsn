export interface Settings {
  blockedCardBins: string[];
  allowedCountries: string[];
}

const requestSettings = async <T>(
  init?: RequestInit,
): Promise<T> => {
  const response = await fetch("/api/dashboard/settings", {
    ...init,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Settings request failed");
  }
  return payload as T;
};

export async function getSettings(): Promise<Settings> {
  const result = await requestSettings<{ data: Settings }>();
  return result.data;
}

export async function updateSettings(settings: Settings) {
  await requestSettings({ method: "PATCH", body: JSON.stringify(settings) });
}

export async function updateBlockedCardBins(bins: string[]) {
  const settings = await getSettings();
  await updateSettings({ ...settings, blockedCardBins: bins });
}

export async function addBlockedCardBin(bin: string) {
  const settings = await getSettings();
  if (!settings.blockedCardBins.includes(bin)) {
    await updateBlockedCardBins([...settings.blockedCardBins, bin]);
  }
}

export async function removeBlockedCardBin(bin: string) {
  const settings = await getSettings();
  await updateBlockedCardBins(settings.blockedCardBins.filter((value) => value !== bin));
}

export async function updateAllowedCountries(countries: string[]) {
  const settings = await getSettings();
  await updateSettings({ ...settings, allowedCountries: countries });
}

export async function addAllowedCountry(country: string) {
  const normalized = country.toUpperCase();
  const settings = await getSettings();
  if (!settings.allowedCountries.includes(normalized)) {
    await updateAllowedCountries([...settings.allowedCountries, normalized]);
  }
}

export async function removeAllowedCountry(country: string) {
  const settings = await getSettings();
  await updateAllowedCountries(
    settings.allowedCountries.filter((value) => value !== country.toUpperCase()),
  );
}

export async function isCardBlocked(cardNumber: string) {
  const settings = await getSettings();
  return settings.blockedCardBins.includes(cardNumber.replace(/\s/g, "").slice(0, 4));
}

export async function isCountryAllowed(countryCode: string) {
  const settings = await getSettings();
  return (
    settings.allowedCountries.length === 0 ||
    settings.allowedCountries.includes(countryCode.toUpperCase())
  );
}