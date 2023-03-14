import { type PlainMessage } from '@bufbuild/protobuf';
import { type Data as DataMessage } from '@marble-front/api/marble';
import { assertNever } from '@marble-front/builder/utils/assert-never';
import { NestedDataField } from './NestedDataField';
import { Scalar } from './Scalar';

interface DataProps {
  data: PlainMessage<DataMessage>;
}

export function Data({ data: { value } }: DataProps) {
  switch (value.case) {
    case 'constant':
      return <Scalar scalar={value.value} />;
    case 'nestedDataField':
      return <NestedDataField nestedDataField={value.value} />;
    case undefined:
      return null;
    default:
      assertNever('unknwon Data case:', value);
  }
}
