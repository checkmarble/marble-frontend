# Performance Optimization

Patterns for optimizing React component performance.

---

## Memoization

### useMemo for Expensive Computations

```typescript
import { useMemo } from 'react';

const filteredItems = useMemo(() => {
  return items
    .filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));
}, [items, search]);
```

### useCallback for Event Handlers

```typescript
import { useCallback } from 'react';

const handleSelect = useCallback((id: string) => {
  setSelectedId(id);
  onSelect?.(id);
}, [onSelect]);
```

### React.memo for Components

```typescript
import { memo } from 'react';

export const ListItem = memo<ListItemProps>(({ item, onSelect }) => {
  return (
    <div onClick={() => onSelect(item.id)}>
      {item.name}
    </div>
  );
});
```

---

## When to Optimize

**Use useMemo when:**
- Filtering/sorting large arrays
- Complex calculations
- Transforming data structures

**Use useCallback when:**
- Functions passed to child components
- Functions in dependency arrays

**Use React.memo when:**
- Component renders frequently with same props
- Expensive rendering logic

---

## Cleanup in useEffect

```typescript
useEffect(() => {
  const controller = new AbortController();

  fetchData({ signal: controller.signal });

  return () => {
    controller.abort();
  };
}, []);

useEffect(() => {
  const intervalId = setInterval(() => {
    // ...
  }, 1000);

  return () => clearInterval(intervalId);
}, []);
```

---

## List Rendering

### Stable Keys

```typescript
// Good - unique ID
{items.map(item => (
  <ListItem key={item.id} item={item} />
))}

// Avoid - index as key
{items.map((item, index) => (
  <ListItem key={index} item={item} /> // Bad if list reorders
))}
```

---

## Lazy Loading

```typescript
import { lazy, Suspense } from 'react';

const HeavyChart = lazy(() => import('./HeavyChart'));

<Suspense fallback={<Skeleton />}>
  <HeavyChart />
</Suspense>
```

---

## Summary

- `useMemo` for expensive computations
- `useCallback` for functions passed to children
- `React.memo` for frequently re-rendering components
- Cleanup effects properly
- Stable keys for lists
