import { type PivotObject } from '@app-builder/models/cases';
import { type TFunction } from 'i18next';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function PivotsPanel({ pivotObjects }: { pivotObjects: PivotObject[] }) {
  const { t } = useTranslation(['cases']);
  if (!pivotObjects[0]) {
    throw new Error('no pivot object');
  }

  const [currentPivotObject, setCurrentPivotObject] = useState(pivotObjects[0]);
  console.log(currentPivotObject.pivotValue, pivotObjects);

  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-l font-semibold">{t('cases:case_detail.pivot_panel.title')}</h2>
      {pivotObjects.length > 1 ? (
        <div className="border-grey-90 flex gap-2 self-start rounded border p-1">
          {pivotObjects.map((pivotObject) => (
            <button
              key={pivotObject.pivotValue}
              className="aria-[current=true]:bg-purple-65 aria-[current=true]:text-grey-100 min-h-8 rounded p-1"
              aria-current={pivotObject.pivotValue === currentPivotObject.pivotValue}
              onClick={() => setCurrentPivotObject(pivotObject)}
            >
              {pivotObject.pivotObjectName}
            </button>
          ))}
        </div>
      ) : null}
      <PivotObjectDetails t={t} pivotObject={currentPivotObject} />
    </div>
  );
}

type PivotObjectDetailsProps = {
  t: TFunction<['cases'], undefined>;
  pivotObject: PivotObject;
};
function PivotObjectDetails({ pivotObject, t }: PivotObjectDetailsProps) {
  return (
    <DataCard title={t('cases:case_detail.pivot_panel.informations')}>
      <pre className="whitespace-pre-wrap">{JSON.stringify(pivotObject, null, 2)}</pre>
    </DataCard>
  );
}

type DataCardProps = {
  title: string;
  children: ReactNode;
};
function DataCard({ title, children }: DataCardProps) {
  return (
    <div>
      <h3 className="border-grey-90 text-s mb-3 border-b px-2 py-3 font-semibold">{title}</h3>
      <div className="flex flex-col gap-8">{children}</div>
    </div>
  );
}
