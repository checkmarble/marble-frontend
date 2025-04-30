export function reorder<TItem>(list: TItem[], startIndex: number, endIndex: number): TItem[] {
  const result = [...list];
  const [removed] = result.splice(startIndex, 1);
  if (removed) result.splice(endIndex, 0, removed);
  return result;
}
