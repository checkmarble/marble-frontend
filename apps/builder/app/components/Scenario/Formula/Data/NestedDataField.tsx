import { type PlainMessage } from '@bufbuild/protobuf';
import { type NestedDataField as NestedDataFieldMessage } from '@marble-front/api/marble';
import { Tooltip } from '@marble-front/ui/design-system';

export function NestedDataField({
  nestedDataField,
}: {
  nestedDataField: PlainMessage<NestedDataFieldMessage>;
}) {
  const fields = [
    nestedDataField.rootTableName,
    ...nestedDataField.linkNames,
    nestedDataField.finalDataField,
  ];

  return (
    <Tooltip.Default
      content={
        <span className="font-medium text-purple-100">{fields.join('.')}</span>
      }
    >
      <span
        // Hack to have text-ellipsis truncate beggining of the fields
        dir="rtl"
        className="max-w-[250px] overflow-hidden text-ellipsis font-medium text-purple-100 max-md:max-w-[150px]"
      >
        {fields.slice(1).join('.')}
      </span>
    </Tooltip.Default>
  );
}
