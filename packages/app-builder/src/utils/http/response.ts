export const hasHeader = (headers: Headers, name: string) => {
  return headers.get(name) !== null ? (headers.get(name) as string) : false;
};
