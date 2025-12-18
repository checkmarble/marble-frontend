function setAdditionalFields(fields, prev) {
  const result = {};
  for (const field of fields) {
    result[field] = prev[field] ?? "";
  }
  return result;
}
export {
  setAdditionalFields as s
};
