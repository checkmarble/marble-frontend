export function formatCountryName(countryIso2: string, language: string) {
  const intlCountry = new Intl.DisplayNames(language, { type: 'region' });
  return intlCountry.of(countryIso2);
}
