import { r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { t as tryCatch, S as StringCodeComponent, D as DateBirthdateComponent, a as StringCountryComponent, b as StringEmailComponent, c as StringPhoneComponent, d as DateDatetimeComponent } from "./DataField-vckdVtrg.js";
import { E as ExternalLink } from "./ExternalLink-CG_77QdX.js";
import { b as clsx, v as getCountryByName, w as formatDateTimeWithoutPresets, F as FormatContext } from "./format-NPGUXq-g.js";
import { M, T as Temporal } from "./services-middleware-DR8Hua1Y.js";
import { j as uuid, o as object, k as array, s as string } from "./short-uuid-MIi3jWzx.js";
import "./screenings-CS8peAlI.js";
function HighlightText({ text, highlight, className, asParagraph }) {
  const isMatch = reactExports.useMemo(() => {
    if (!highlight || highlight.length === 0) {
      return false;
    }
    const textLower = text.toLowerCase();
    const highlightLower = highlight.toLowerCase();
    if (textLower === highlightLower) {
      return true;
    }
    const words = highlightLower.split(/\s+/).filter((word) => word.length > 0);
    return words.some((word) => textLower === word);
  }, [text, highlight]);
  const Component = asParagraph ? "p" : "span";
  if (isMatch) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Component, { className: clsx("bg-yellow-background rounded-sm", className), children: text });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Component, { className, children: text });
}
const addressEntityUuidSchema = uuid();
const rawAddressEntitySchema = object({
  caption: string().optional(),
  schema: string().optional(),
  properties: object({
    full: array(string()).optional(),
    street: array(string()).optional(),
    city: array(string()).optional(),
    country: array(string()).optional(),
    postalCode: array(string()).optional(),
    notes: array(string()).optional()
  })
});
const POSTAL_CODE_PATTERN = /^\d[\dA-Za-z\s-]*$/;
const MAX_DISPLAY_PATH_SEGMENT_LENGTH = 20;
const EMBEDDED_ENGLISH_DATE_REGEX = /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}\b/g;
const FULL_BIRTH_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const YEAR_ONLY_BIRTH_DATE_PATTERN = /^\d{4}$/;
const ALWAYS_SKIPPED_SCRIPTS = ["Common", "Inherited"];
function getSkippedScripts(language) {
  const isArabicInterface = language === "ar" || language.startsWith("ar-");
  return new Set(isArabicInterface ? [...ALWAYS_SKIPPED_SCRIPTS, "Arabic"] : [...ALWAYS_SKIPPED_SCRIPTS, "Latin"]);
}
const NEUTRAL_CHAR = new RegExp("\\p{General_Category=Punctuation}|\\p{General_Category=Separator}|\\p{General_Category=Number}", "u");
const SCRIPT_NAME_OVERRIDES = {
  Hangul: "Hangul Syllables",
  Han: "Han"
};
const UNICODE_SCRIPTS = [
  "Adlam",
  "Ahom",
  "Anatolian_Hieroglyphs",
  "Arabic",
  "Armenian",
  "Avestan",
  "Balinese",
  "Bamum",
  "Bassa_Vah",
  "Batak",
  "Bengali",
  "Bhaiksuki",
  "Brahmi",
  "Braille",
  "Buginese",
  "Buhid",
  "Canadian_Aboriginal",
  "Carian",
  "Caucasian_Albanian",
  "Chakma",
  "Cham",
  "Cherokee",
  "Chorasmian",
  "Coptic",
  "Cuneiform",
  "Cypriot",
  "Cypro_Minoan",
  "Cyrillic",
  "Deseret",
  "Devanagari",
  "Dives_Akuru",
  "Dogra",
  "Duployan",
  "Egyptian_Hieroglyphs",
  "Elbasan",
  "Elymaic",
  "Ethiopic",
  "Georgian",
  "Glagolitic",
  "Gothic",
  "Grantha",
  "Greek",
  "Gujarati",
  "Gunjala_Gondi",
  "Gurmukhi",
  "Han",
  "Hangul",
  "Hanifi_Rohingya",
  "Hanunoo",
  "Hatran",
  "Hebrew",
  "Hiragana",
  "Imperial_Aramaic",
  "Inscriptional_Pahlavi",
  "Inscriptional_Parthian",
  "Javanese",
  "Kaithi",
  "Kannada",
  "Katakana",
  "Kawi",
  "Kayah_Li",
  "Kharoshthi",
  "Khitan_Small_Script",
  "Khmer",
  "Khojki",
  "Khudawadi",
  "Lao",
  "Lepcha",
  "Limbu",
  "Linear_A",
  "Linear_B",
  "Lisu",
  "Lycian",
  "Lydian",
  "Mahajani",
  "Makasar",
  "Malayalam",
  "Mandaic",
  "Manichaean",
  "Marchen",
  "Masaram_Gondi",
  "Medefaidrin",
  "Meetei_Mayek",
  "Mende_Kikakui",
  "Meroitic_Cursive",
  "Meroitic_Hieroglyphs",
  "Miao",
  "Modi",
  "Mongolian",
  "Mro",
  "Multani",
  "Myanmar",
  "Nabataean",
  "Nag_Mundari",
  "Nandinagari",
  "New_Tai_Lue",
  "Newa",
  "Nko",
  "Nushu",
  "Nyiakeng_Puachue_Hmong",
  "Ogham",
  "Ol_Chiki",
  "Old_Hungarian",
  "Old_Italic",
  "Old_North_Arabian",
  "Old_Permic",
  "Old_Persian",
  "Old_Sogdian",
  "Old_South_Arabian",
  "Old_Turkic",
  "Old_Uyghur",
  "Oriya",
  "Osage",
  "Osmanya",
  "Pahawh_Hmong",
  "Palmyrene",
  "Pau_Cin_Hau",
  "Phags_Pa",
  "Phoenician",
  "Psalter_Pahlavi",
  "Rejang",
  "Runic",
  "Samaritan",
  "Saurashtra",
  "Sharada",
  "Shavian",
  "Siddham",
  "SignWriting",
  "Sinhala",
  "Sogdian",
  "Sora_Sompeng",
  "Soyombo",
  "Sundanese",
  "Syloti_Nagri",
  "Syriac",
  "Tagalog",
  "Tagbanwa",
  "Tai_Le",
  "Tai_Tham",
  "Tai_Viet",
  "Takri",
  "Tamil",
  "Tangsa",
  "Tangut",
  "Telugu",
  "Thaana",
  "Thai",
  "Tibetan",
  "Tifinagh",
  "Tirhuta",
  "Toto",
  "Ugaritic",
  "Vai",
  "Vithkuqi",
  "Wancho",
  "Warang_Citi",
  "Yezidi",
  "Yi",
  "Zanabazar_Square"
];
const SCRIPT_CHAR_TESTERS = UNICODE_SCRIPTS.map((script) => ({
  script,
  test: new RegExp(`\\p{Script=${script}}`, "u")
}));
function formatScriptName(script) {
  return SCRIPT_NAME_OVERRIDES[script] ?? script.replaceAll("_", " ");
}
function getCharScript(char) {
  if (NEUTRAL_CHAR.test(char)) return null;
  for (const { script, test } of SCRIPT_CHAR_TESTERS) {
    if (test.test(char)) return script;
  }
  return null;
}
function firstValue(values) {
  return values?.[0];
}
function normalizeAddressKey(value) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}
function resolveCountryCode(country) {
  if (country.length === 2) return country.toLowerCase();
  return getCountryByName(country)?.isoAlpha2 ?? country;
}
function joinStreetSegments(segments) {
  if (segments.length === 0) return "";
  if (segments.length === 1) return segments[0];
  const [first, second, ...rest] = segments;
  if (/^\d+$/.test(first)) {
    return [`${first}, ${second}`, ...rest].filter(Boolean).join(", ");
  }
  return segments.join(", ");
}
function trimLongTrailingPathSegments(pathname) {
  const segments = pathname.split("/").filter((segment) => segment.length > 0);
  let lastRemoved;
  while (segments.length > 0 && (segments.at(-1)?.length ?? 0) > MAX_DISPLAY_PATH_SEGMENT_LENGTH) {
    lastRemoved = segments.pop();
  }
  if (!lastRemoved) {
    return segments.length > 0 ? `/${segments.join("/")}` : "/";
  }
  const base = segments.length > 0 ? `/${segments.join("/")}` : "";
  return `${base}/${segmentPreview(lastRemoved)}...`;
}
function segmentPreview(segment) {
  const decoded = tryCatch(() => decodeURIComponent(segment));
  const value = decoded.ok ? decoded.value : segment;
  return value.slice(0, MAX_DISPLAY_PATH_SEGMENT_LENGTH);
}
function formatPathForDisplay(pathname) {
  if (pathname === "/") return pathname;
  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}
function decodeUrlForDisplay(url) {
  const decoded = tryCatch(() => decodeURI(url));
  return decoded.ok ? decoded.value : url;
}
function isAddressEntityUuid(value) {
  return typeof value === "string" && addressEntityUuidSchema.safeParse(value).success;
}
function isRawAddressEntity(value) {
  return rawAddressEntitySchema.safeParse(value).success;
}
function adaptRawAddressEntity(raw) {
  const full = firstValue(raw.properties.full);
  const caption = raw.caption ?? full;
  return {
    caption,
    properties: {
      full,
      street: firstValue(raw.properties.street),
      city: firstValue(raw.properties.city),
      country: firstValue(raw.properties.country) ? resolveCountryCode(firstValue(raw.properties.country)) : void 0,
      postalCode: firstValue(raw.properties.postalCode),
      notes: firstValue(raw.properties.notes)
    }
  };
}
function parseStringAddress(address) {
  const segments = address.split(",").map((part) => part.trim()).filter((part) => part.length > 0);
  let country;
  let postalCode;
  let city;
  let streetSegments = [...segments];
  if (streetSegments.length > 0) {
    const last = streetSegments.pop();
    country = resolveCountryCode(last);
  }
  if (streetSegments.length > 0) {
    const candidatePostalCode = streetSegments.at(-1);
    if (POSTAL_CODE_PATTERN.test(candidatePostalCode)) {
      postalCode = streetSegments.pop();
    }
  }
  if (streetSegments.length > 0) {
    city = streetSegments.pop();
  }
  const street = joinStreetSegments(streetSegments);
  return {
    caption: address,
    properties: {
      full: address,
      street: street || void 0,
      city,
      postalCode,
      country
    }
  };
}
function getAddressDedupeKey(entity) {
  const key = entity.properties.full ?? entity.caption;
  if (key) return normalizeAddressKey(key);
  return normalizeAddressKey(
    [entity.properties.street, entity.properties.city, entity.properties.postalCode, entity.properties.country].filter(Boolean).join(", ")
  );
}
function mergeAddresses(addressStrings, rawAddressEntities) {
  const merged = /* @__PURE__ */ new Map();
  for (const raw of rawAddressEntities) {
    if (isAddressEntityUuid(raw) || !isRawAddressEntity(raw)) continue;
    const entity = adaptRawAddressEntity(raw);
    merged.set(getAddressDedupeKey(entity), entity);
  }
  for (const address of addressStrings) {
    const entity = parseStringAddress(address);
    const key = getAddressDedupeKey(entity);
    if (!merged.has(key)) {
      merged.set(key, entity);
    }
  }
  return [...merged.values()];
}
function getPersonName(entity) {
  const { firstName, lastName, name, alias } = entity.properties;
  if (firstName?.[0] || lastName?.[0]) return [firstName?.[0], lastName?.[0]].filter(Boolean).join(" ");
  if (name?.[0]) return name[0];
  if (alias?.[0]) return alias[0];
  return "?";
}
function hasDisplayableName(properties) {
  const { firstName, lastName, name, alias, caption } = properties;
  return Boolean(caption || firstName?.[0] || lastName?.[0] || name?.[0] || alias?.[0]);
}
function splitTextWithEmbeddedDates(value) {
  const segments = [];
  let lastIndex = 0;
  for (const match2 of value.matchAll(EMBEDDED_ENGLISH_DATE_REGEX)) {
    const index = match2.index ?? 0;
    if (index > lastIndex) {
      segments.push({ type: "text", value: value.slice(lastIndex, index) });
    }
    segments.push({ type: "date", value: match2[0] });
    lastIndex = index + match2[0].length;
  }
  if (lastIndex < value.length) {
    segments.push({ type: "text", value: value.slice(lastIndex) });
  }
  return segments;
}
function detectNativeScript(value, language) {
  const skippedScripts = getSkippedScripts(language);
  const counts = /* @__PURE__ */ new Map();
  for (const char of value) {
    const script = getCharScript(char);
    if (!script || skippedScripts.has(script)) continue;
    const scriptName = formatScriptName(script);
    counts.set(scriptName, (counts.get(scriptName) ?? 0) + 1);
  }
  if (counts.size === 0) return null;
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}
function cleanUrl(url) {
  const parsed = tryCatch(() => new URL(url));
  if (!parsed.ok) return url;
  const { origin, hostname, pathname } = parsed.value;
  const cleanedPathname = M(hostname).when(
    (host) => host === "web.archive.org",
    () => {
      const archiveMatch = pathname.match(/^\/web\/(\d{14})/);
      if (!archiveMatch) return trimLongTrailingPathSegments(pathname);
      const kept = `/web/${archiveMatch[1]}`;
      const removedSegments = pathname.slice(kept.length).split("/").filter((segment) => segment.length > 0);
      const lastRemoved = removedSegments.at(-1);
      if (!lastRemoved) return kept;
      return `${kept}/${segmentPreview(lastRemoved)}...`;
    }
  ).otherwise(() => trimLongTrailingPathSegments(pathname));
  return decodeUrlForDisplay(formatPathForDisplay(origin + cleanedPathname));
}
function classifyBirthDate(value) {
  if (FULL_BIRTH_DATE_PATTERN.test(value)) return "full";
  if (YEAR_ONLY_BIRTH_DATE_PATTERN.test(value)) return "year";
  return null;
}
function toBirthDate(value, kind) {
  if (kind === "full") return Temporal.PlainDate.from(value);
  return Temporal.PlainDate.from(`${value}-07-01`);
}
function getAgeYears(value, kind) {
  const today = Temporal.Now.plainDateISO();
  return Math.max(0, toBirthDate(value, kind).until(today, { largestUnit: "year" }).years);
}
function getBirthDateRange(classified) {
  if (classified.length < 2) return null;
  const allYearOnly = classified.every((entry) => entry.kind === "year");
  if (allYearOnly) {
    const years = classified.map((entry) => Number(entry.value)).sort((a, b) => a - b);
    const minYear = years[0];
    const maxYear = years[years.length - 1];
    if (minYear === maxYear) return null;
    return { type: "years", minYear, maxYear };
  }
  const dates = classified.map((entry) => toBirthDate(entry.value, entry.kind)).sort(Temporal.PlainDate.compare);
  const min = dates[0];
  const max = dates[dates.length - 1];
  if (Temporal.PlainDate.compare(min, max) === 0) return null;
  if (min.year === max.year) {
    return { type: "same_year", min, max, year: min.year };
  }
  return { type: "full", min, max };
}
function formatPlainDate(date, language, options) {
  return formatDateTimeWithoutPresets(date.toString(), { language, ...options });
}
function formatBirthDateRange(range, language, t) {
  return M(range).with(
    { type: "years" },
    ({ minYear, maxYear }) => t("screenings:entity.property.birthDate.approximative_age.between_years", { min: minYear, max: maxYear })
  ).with(
    { type: "same_year" },
    ({ min, max, year }) => t("screenings:entity.property.birthDate.approximative_age.between_same_year", {
      min: formatPlainDate(min, language, { day: "numeric", month: "long" }),
      max: formatPlainDate(max, language, { day: "numeric", month: "long" }),
      year
    })
  ).with(
    { type: "full" },
    ({ min, max }) => t("screenings:entity.property.birthDate.approximative_age.between_dates", {
      min: formatPlainDate(min, language, { day: "numeric", month: "long", year: "numeric" }),
      max: formatPlainDate(max, language, { day: "numeric", month: "long", year: "numeric" })
    })
  ).exhaustive();
}
const SEARCH_ENTITIES = {
  Thing: { fields: ["name"] },
  Person: {
    fields: ["name", "birthDate", "nationality", "passportNumber", "address"]
  },
  Organization: {
    fields: ["name", "country", "registrationNumber", "address"]
  },
  Vehicle: {
    fields: ["name", "registrationNumber"]
  }
};
const schemaProperties = {
  Thing: [
    "name",
    "summary",
    "description",
    "country",
    "alias",
    "previousName",
    "weakAlias",
    "sourceUrl",
    "publisher",
    "wikidataId",
    "keywords",
    "address",
    "addressEntity",
    "program",
    "notes",
    "createdAt"
  ],
  LegalEntity: [
    "email",
    "phone",
    "website",
    "legalForm",
    "incorporationDate",
    "dissolutionDate",
    "status",
    "sector",
    "classification",
    "registrationNumber",
    "idNumber",
    "taxNumber",
    "vatCode",
    "jurisdiction",
    "mainCountry",
    "opencorporatesUrl",
    "icijId",
    "okpoCode",
    "innCode",
    "ogrnCode",
    "leiCode",
    "dunsCode",
    "uniqueEntityId",
    "npiCode",
    "swiftBic"
  ],
  Person: [
    "title",
    "firstName",
    "secondName",
    "middleName",
    "fatherName",
    "motherName",
    "lastName",
    "nameSuffix",
    "birthDate",
    "deathDate",
    "position",
    "nationality",
    "citizenship",
    "passportNumber",
    "socialSecurityNumber",
    "gender",
    "ethnicity",
    "height",
    "weight",
    "eyeColor",
    "hairColor",
    "appearance",
    "religion",
    "political",
    "education"
  ],
  Organization: [],
  Company: [],
  Vehicle: ["registrationNumber"],
  Airplane: [],
  Vessel: [],
  Family: [],
  Associate: [],
  MembershipMember: [],
  Sanction: [
    "country",
    "authority",
    "authorityId",
    "program",
    "startDate",
    "endDate",
    "listingDate",
    "sourceUrl",
    "reason",
    "summary",
    "programId",
    "programUrl"
  ]
};
const schemaInheritence = {
  Thing: null,
  LegalEntity: "Thing",
  Person: "LegalEntity",
  Organization: "LegalEntity",
  Company: "Organization",
  Vehicle: "Thing",
  Vessel: "Vehicle",
  Airplane: "Vehicle",
  Sanction: null,
  Family: null,
  Associate: null,
  MembershipMember: null
};
const propertyMetadata = {
  address: { type: "string" },
  addressEntity: { type: "string" },
  alias: { type: "string" },
  appearance: { type: "string" },
  birthDate: { type: "string", format: "dateOfBirth" },
  citizenship: { type: "string", format: "country" },
  classification: { type: "string" },
  country: { type: "string", format: "country" },
  createdAt: { type: "string", format: "dateTime" },
  deathDate: { type: "string", format: "date" },
  description: { type: "string" },
  dissolutionDate: { type: "string", format: "date" },
  dunsCode: { type: "string", format: "monospace" },
  education: { type: "string" },
  email: { type: "string", format: "email" },
  ethnicity: { type: "string" },
  eyeColor: { type: "string" },
  fatherName: { type: "string" },
  firstName: { type: "string" },
  gender: { type: "string", format: "monospace" },
  hairColor: { type: "string" },
  height: { type: "string" },
  icijId: { type: "string" },
  idNumber: { type: "string", format: "monospace" },
  incorporationDate: { type: "string", format: "date" },
  innCode: { type: "string", format: "monospace" },
  jurisdiction: { type: "string", format: "country" },
  keywords: { type: "string" },
  lastName: { type: "string" },
  legalForm: { type: "string" },
  leiCode: { type: "string" },
  mainCountry: { type: "string", format: "country" },
  middleName: { type: "string" },
  motherName: { type: "string" },
  name: { type: "string" },
  nameSuffix: { type: "string" },
  nationality: { type: "string", format: "country" },
  notes: { type: "string" },
  npiCode: { type: "string" },
  ogrnCode: { type: "string" },
  okpoCode: { type: "string" },
  opencorporatesUrl: { type: "url" },
  passportNumber: { type: "string", format: "monospace" },
  phone: { type: "string", format: "phone" },
  political: { type: "string" },
  position: { type: "string", format: "position" },
  previousName: { type: "string" },
  program: { type: "string" },
  publisher: { type: "string" },
  registrationNumber: { type: "string" },
  religion: { type: "string" },
  secondName: { type: "string" },
  sector: { type: "string" },
  socialSecurityNumber: { type: "string" },
  sourceUrl: { type: "url" },
  status: { type: "string", format: "monospace" },
  summary: { type: "string" },
  swiftBic: { type: "string" },
  taxNumber: { type: "string", format: "monospace" },
  title: { type: "string" },
  uniqueEntityId: { type: "string", format: "monospace" },
  vatCode: { type: "string", format: "monospace" },
  weakAlias: { type: "string" },
  website: { type: "url" },
  weight: { type: "string" },
  wikidataId: { type: "wikidataId" },
  authority: { type: "string" },
  authorityId: { type: "string" },
  startDate: { type: "string", format: "date" },
  endDate: { type: "string", format: "date" },
  programId: { type: "string" },
  programUrl: { type: "url" },
  reason: { type: "string" },
  listingDate: { type: "string", format: "dateTime" }
};
const SCRIPT_TAGGED_PROPERTIES = [
  "name",
  "title",
  "firstName",
  "secondName",
  "middleName",
  "fatherName",
  "motherName",
  "lastName",
  "nameSuffix",
  "alias",
  "weakAlias",
  "previousName"
];
const propertyMetadataList = [
  "address",
  "addressEntity",
  ...SCRIPT_TAGGED_PROPERTIES
];
function isScriptTaggedProperty(property) {
  return SCRIPT_TAGGED_PROPERTIES.includes(property);
}
function getSanctionEntityProperties(schema) {
  let currentSchema = schema;
  const properties = [];
  do {
    properties.push(...schemaProperties[currentSchema]);
    currentSchema = schemaInheritence[currentSchema];
  } while (currentSchema !== null);
  return properties;
}
function isPropertyListed(property) {
  return propertyMetadataList.includes(property);
}
function createPropertyTransformer(ctx) {
  return function TransformProperty({ property, value }) {
    const { type, format } = propertyMetadata[property];
    switch (type) {
      case "string":
        return value.includes("\n") ? value.split("\n").map(
          (v, index) => v ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: formatedValue(format, v, ctx.highlightText) }, `chunk-${index}`) : /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}, `chunk-${index}`)
        ) : formatedValue(format, value, ctx.highlightText);
      case "url":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "break-all", href: value, title: value, children: cleanUrl(value) });
      case "wikidataId":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { href: `https://wikidata.org/wiki/${value}`, className: "normal-case break-all", children: cleanUrl(value) });
    }
  };
}
function formatedValue(format, value, highlightText) {
  const { locale } = FormatContext.useValue();
  return M(format).with("monospace", () => StringCodeComponent({ value })).with("date", () => /* @__PURE__ */ jsxRuntimeExports.jsx("time", { dateTime: value, children: formatDateTimeWithoutPresets(value, { language: locale, dateStyle: "short" }) })).with("dateTime", () => /* @__PURE__ */ jsxRuntimeExports.jsx("time", { dateTime: value, children: formatDateTimeWithoutPresets(value, { language: locale, dateStyle: "short", timeStyle: "short" }) })).with("dateOfBirth", () => DateBirthdateComponent({ value })).with("country", () => StringCountryComponent({ value, withCountryName: true })).with("countryFlag", () => StringCountryComponent({ value, withCountryName: false })).with("position", () => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: value })).with("email", () => StringEmailComponent({ value })).with("phone", () => StringPhoneComponent({ value })).with(void 0, () => /* @__PURE__ */ jsxRuntimeExports.jsx(TextWithEmbeddedDates, { value, highlightText })).exhaustive();
}
function TextWithEmbeddedDates({ value, highlightText }) {
  const segments = splitTextWithEmbeddedDates(value);
  if (segments.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(HighlightText, { text: value, highlight: highlightText });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: segments.map(
    (segment, index) => segment.type === "date" ? /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Fragment, { children: DateDatetimeComponent({
      value: segment.value,
      withTime: false,
      monospaced: true,
      className: "p-0 inline-block"
    }) }, index) : segment.value.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(HighlightText, { text: segment.value, highlight: highlightText }, index) : null
  ) });
}
export {
  HighlightText as H,
  SEARCH_ENTITIES as S,
  getBirthDateRange as a,
  getSanctionEntityProperties as b,
  classifyBirthDate as c,
  detectNativeScript as d,
  createPropertyTransformer as e,
  formatBirthDateRange as f,
  getAgeYears as g,
  isPropertyListed as h,
  isScriptTaggedProperty as i,
  getPersonName as j,
  cleanUrl as k,
  hasDisplayableName as l,
  mergeAddresses as m
};
