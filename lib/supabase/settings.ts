import { getSupabaseClient } from "@/lib/supabase";

export interface Settings {
  blockedCardBins: string[];
  allowedCountries: string[];
}

const SETTINGS_ID = "app_settings";
const DEFAULT_SETTINGS: Settings = {
  blockedCardBins: [],
  allowedCountries: [],
};

const normalizeSettings = (value: unknown): Settings => {
  const settings =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};

  return {
    blockedCardBins: Array.isArray(settings.blockedCardBins)
      ? settings.blockedCardBins.filter((value): value is string => typeof value === "string")
      : [],
    allowedCountries: Array.isArray(settings.allowedCountries)
      ? settings.allowedCountries.filter((value): value is string => typeof value === "string")
      : [],
  };
};

export async function getSettings(): Promise<Settings> {
  const { data, error } = await getSupabaseClient()
    .from("application_settings")
    .select("settings")
    .eq("id", SETTINGS_ID)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    await saveSettings(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }

  return normalizeSettings(data.settings);
}

async function saveSettings(settings: Settings) {
  const { error } = await getSupabaseClient()
    .from("application_settings")
    .upsert(
      { id: SETTINGS_ID, settings },
      { onConflict: "id" },
    );

  if (error) throw error;
}

export async function updateBlockedCardBins(bins: string[]) {
  const settings = await getSettings();
  await saveSettings({ ...settings, blockedCardBins: bins });
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
  await saveSettings({ ...settings, allowedCountries: countries });
}

export async function addAllowedCountry(country: string) {
  const normalizedCountry = country.toUpperCase();
  const settings = await getSettings();
  if (!settings.allowedCountries.includes(normalizedCountry)) {
    await updateAllowedCountries([...settings.allowedCountries, normalizedCountry]);
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