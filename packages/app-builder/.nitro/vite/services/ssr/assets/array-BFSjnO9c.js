const replace = (list2, newItem, match) => {
  if (!list2)
    return [];
  if (newItem === void 0)
    return [...list2];
  for (let idx = 0; idx < list2.length; idx++) {
    const item = list2[idx];
    if (match(item, idx)) {
      return [
        ...list2.slice(0, idx),
        newItem,
        ...list2.slice(idx + 1, list2.length)
      ];
    }
  }
  return [...list2];
};
const select = (array, mapper, condition) => {
  if (!array)
    return [];
  return array.reduce((acc, item, index) => {
    if (!condition(item, index))
      return acc;
    acc.push(mapper(item, index));
    return acc;
  }, []);
};
const toggle = (list2, item, toKey, options) => {
  if (!list2 && !item)
    return [];
  if (!list2)
    return [item];
  if (!item)
    return [...list2];
  const matcher = (x) => x === item;
  const existing = list2.find(matcher);
  if (existing)
    return list2.filter((x, idx) => !matcher(x));
  return [...list2, item];
};
const diff = (root, other, identity = (t) => t) => {
  if (!root?.length && !other?.length)
    return [];
  if (root?.length === void 0)
    return [...other];
  if (!other?.length)
    return [...root];
  const bKeys = other.reduce((acc, item) => {
    acc[identity(item)] = true;
    return acc;
  }, {});
  return root.filter((a) => !bKeys[identity(a)]);
};
export {
  diff as d,
  replace as r,
  select as s,
  toggle as t
};
