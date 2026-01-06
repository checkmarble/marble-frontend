import { type FunctionComponent, useMemo } from 'react';

interface JsonDiffProps {
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
}

export const JsonDiff: FunctionComponent<JsonDiffProps> = ({ oldData, newData }) => {
  const allKeys = useMemo(() => {
    const keys = new Set<string>();
    if (oldData) Object.keys(oldData).forEach((k) => keys.add(k));
    if (newData) Object.keys(newData).forEach((k) => keys.add(k));
    return Array.from(keys).sort();
  }, [oldData, newData]);

  if (allKeys.length === 0) {
    return <span className="text-grey-placeholder text-sm">No data</span>;
  }

  return (
    <div className="bg-grey-background-light border-grey-border overflow-auto rounded-sm border p-3 font-mono text-xs">
      {allKeys.map((key) => {
        const oldValue = oldData?.[key];
        const newValue = newData?.[key];
        const oldStr = oldValue !== undefined ? JSON.stringify(oldValue) : undefined;
        const newStr = newValue !== undefined ? JSON.stringify(newValue) : undefined;

        const isAdded = oldStr === undefined && newStr !== undefined;
        const isRemoved = oldStr !== undefined && newStr === undefined;
        const isChanged = oldStr !== undefined && newStr !== undefined && oldStr !== newStr;
        const isUnchanged = oldStr === newStr;

        return (
          <div key={key} className="flex flex-col">
            {isUnchanged && (
              <div className="text-grey-placeholder">
                <span className="text-grey-placeholder">{key}:</span> {newStr}
              </div>
            )}
            {isAdded && (
              <div className="bg-green-background-light text-green-primary">
                <span className="font-semibold">+ {key}:</span> {newStr}
              </div>
            )}
            {isRemoved && (
              <div className="bg-red-background-light text-red-primary line-through">
                <span className="font-semibold">- {key}:</span> {oldStr}
              </div>
            )}
            {isChanged && (
              <>
                <div className="bg-red-background-light text-red-primary line-through">
                  <span className="font-semibold">- {key}:</span> {oldStr}
                </div>
                <div className="bg-green-background-light text-green-primary">
                  <span className="font-semibold">+ {key}:</span> {newStr}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};
