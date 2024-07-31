export function hasExactlyTwoElements<T>(data: T[]): data is [T, T] {
  return data.length === 2;
}
