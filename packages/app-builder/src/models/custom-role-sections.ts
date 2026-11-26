// Mirrors the backend's app sections (marble-backend models/app_section.go), in display order.
export const APP_SECTIONS = [
  'scenarios',
  'customer_scoring',
  'continuous_monitoring',
  'case_manager',
  'manual_screening',
  'customer_hub',
  'data_model',
  'settings',
] as const;

export type AppSection = (typeof APP_SECTIONS)[number];

export type SectionsVisibility = Record<AppSection, boolean>;

// The backend treats a section missing from the map as visible.
export function sectionsVisibility(sections: Partial<Record<string, boolean>> = {}): SectionsVisibility {
  return Object.fromEntries(APP_SECTIONS.map((section) => [section, sections[section] ?? true])) as SectionsVisibility;
}
