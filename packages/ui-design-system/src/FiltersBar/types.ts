export type FilterBarLevel = 'main' | 'additional';

export type CommittedDynamicValues = Record<string, unknown>;

export interface BaseFilter<T> {
  name: string;
  placeholder: string;
  selectedValue: T | null;
  onChange?: (value: T | null) => void;
  removable?: boolean;
  isOpen?: boolean;
  isActive: boolean;
  onOpenChange?: (open: boolean) => void;
  unavailable?: boolean;
}

export type NumberOperator = 'eq' | 'ne' | 'lt' | 'lte' | 'gt' | 'gte';

export type TextOperator = 'in';

// Number filters use a single ComparisonFilter with a single number value
export interface NumberComparisonFilter {
  operator: NumberOperator;
  value: number;
}

// Text filters use an array of ComparisonFilter objects, each with a single string value
export interface TextComparisonFilter {
  operator: TextOperator;
  value: string;
}

// Legacy type kept for backward compatibility - prefer NumberComparisonFilter or TextComparisonFilter
export interface ComparisonFilter<T> {
  operator: NumberOperator | TextOperator;
  value: T | T[];
}

export interface StaticDateRangeFilterType {
  type: 'static';
  startDate: string;
  endDate: string;
}

export interface DynamicDateRangeFilterType {
  type: 'dynamic';
  fromNow: string;
}

export type DateRangeFilterType =
  | StaticDateRangeFilterType
  | DynamicDateRangeFilterType
  | null
  | undefined;

export interface NumberFilter extends BaseFilter<NumberComparisonFilter> {
  type: 'number';
  operator: NumberOperator;
}
export interface TextFilter extends BaseFilter<TextComparisonFilter[]> {
  type: 'text';
  operator: TextOperator;
}
export interface BooleanFilter extends BaseFilter<boolean> {
  type: 'boolean';
}
export interface CheckboxFilter extends BaseFilter<boolean> {
  type: 'checkbox';
}
export interface SelectFilter extends BaseFilter<string> {
  type: 'select';
  options: string[] | { label: string; value: string }[];
}
export interface MultiSelectFilter extends BaseFilter<string[]> {
  type: 'multi-select';
  options: string[] | { label: string; value: string }[];
}
export interface DateRangePopoverFilter extends BaseFilter<DateRangeFilterType> {
  type: 'date-range-popover';
  onClear?: () => void;
}
export interface RadioFilter extends BaseFilter<string> {
  type: 'radio';
  options: string[] | { label: string; value: string }[];
}
export type Filter =
  | TextFilter
  | NumberFilter
  | BooleanFilter
  | CheckboxFilter
  | SelectFilter
  | MultiSelectFilter
  | DateRangePopoverFilter
  | RadioFilter;

// Exhaustive value type accepted/emitted by FiltersBar
export type FilterValue =
  | TextComparisonFilter[]
  | NumberComparisonFilter
  | boolean
  | string
  | string[]
  | DateRangeFilterType
  | null
  | undefined;

// New controlled API types
export interface BaseFilterDescriptor {
  name: string;
  placeholder: string;
  removable?: boolean;
  instantUpdate?: boolean;
  unavailable?: boolean;
}
export interface NumberFilterDescriptor extends BaseFilterDescriptor {
  type: 'number';
  operator: NumberOperator;
}
export interface TextFilterDescriptor extends BaseFilterDescriptor {
  type: 'text';
  operator: TextOperator;
}
export interface BooleanFilterDescriptor extends BaseFilterDescriptor {
  type: 'boolean';
}
export interface CheckboxFilterDescriptor extends BaseFilterDescriptor {
  type: 'checkbox';
}
export interface SelectFilterDescriptor extends BaseFilterDescriptor {
  type: 'select';
  options: string[] | { label: string; value: string }[];
}
export interface MultiSelectFilterDescriptor extends BaseFilterDescriptor {
  type: 'multi-select';
  options: string[] | { label: string; value: string }[];
}
export interface DateRangePopoverFilterDescriptor extends BaseFilterDescriptor {
  type: 'date-range-popover';
}
export interface RadioFilterDescriptor extends BaseFilterDescriptor {
  type: 'radio';
  options: string[] | { label: string; value: string }[];
}
export type FilterDescriptor =
  | TextFilterDescriptor
  | NumberFilterDescriptor
  | BooleanFilterDescriptor
  | CheckboxFilterDescriptor
  | SelectFilterDescriptor
  | MultiSelectFilterDescriptor
  | DateRangePopoverFilterDescriptor
  | RadioFilterDescriptor;

export type FilterChange =
  | { type: 'set'; name: string; value: FilterValue }
  | { type: 'remove'; name: string };

export type FilterBarOptions = {
  dynamicSkeletons?: {
    enabled: boolean;
    state: 'loading' | 'error' | 'success';
  };
};

export interface FiltersBarProps {
  descriptors: FilterDescriptor[];
  dynamicDescriptors?: FilterDescriptor[];
  value: Record<string, FilterValue>;
  onUpdate?: (next: { value: Record<string, FilterValue> }) => void;
  onChange?: (change: FilterChange, next: { value: Record<string, FilterValue> }) => void;
  options?: FilterBarOptions | null;
}
