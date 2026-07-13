export function formatCountryName(countryIso2: string, language: string) {
  // `Intl.DisplayNames.of` throws a RangeError on codes that are not valid region
  // subtags (two ASCII letters or three digits). Some entries lack an ISO alpha-2
  // code (e.g. England/Scotland/Wales), so guard before calling.
  if (!/^([A-Za-z]{2}|\d{3})$/.test(countryIso2)) {
    return undefined;
  }
  const intlCountry = new Intl.DisplayNames(language, { type: 'region' });
  return intlCountry.of(countryIso2);
}
