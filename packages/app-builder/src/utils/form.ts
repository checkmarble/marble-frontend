export const submitOnBlur: React.FocusEventHandler<
  HTMLInputElement | HTMLTextAreaElement
> = (event) => {
  if (event.currentTarget.value !== event.currentTarget.defaultValue) {
    event.currentTarget.form?.requestSubmit();
  }
};

export function adaptToStringArray(
  value: string | (string | undefined)[] | undefined,
): string[] {
  if (value === undefined) {
    return [];
  }
  if (typeof value === 'string') {
    return [value];
  }
  return value.filter((val) => val !== undefined);
}
