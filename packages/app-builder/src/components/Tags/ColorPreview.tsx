import { type TagColor } from '@app-builder/models/tags';

export const ColorPreview = ({ color }: { color: TagColor }) => {
  return <div className="border-grey-disabled size-4 rounded-full border" style={{ backgroundColor: color }} />;
};
