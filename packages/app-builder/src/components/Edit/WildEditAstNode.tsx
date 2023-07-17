import { type AstNode, NewAstNode, NoConstant } from '@app-builder/models';
import { Button, Input } from '@ui-design-system';
import { useFieldArray } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel } from '../Form';
import { RemoveButton } from './RemoveButton';

export function WildEditAstNode<TName extends string>({
  name,
  remove,
}: {
  name: TName;
  remove?: () => void;
}) {
  return (
    <div className="group flex w-fit flex-row-reverse gap-2 rounded border p-2">
      {remove && (
        <RemoveButton
          className="peer"
          onClick={() => {
            remove();
          }}
        />
      )}
      <div className="peer-hover:bg-purple-10 flex flex-col gap-2 p-2">
        <FormField
          name={`${name}.name`}
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-1">
              <FormLabel>Operator</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField<AstNode>
          name={`${name}.constant` as 'constant'}
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-1">
              <FormLabel>Constant</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={
                    field.value === NoConstant || !field.value
                      ? ''
                      : field.value.toString()
                  }
                  onChange={(event) => {
                    field.onChange(event.target.value || NoConstant);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormChildren name={`${name}.children`} />
      </div>
    </div>
  );
}

function FormChildren({ name }: { name: string }) {
  const { fields, append, remove } = useFieldArray({ name });
  return (
    <div className="flex flex-col gap-1">
      <p>Children</p>
      {fields.map((child, index) => (
        <WildEditAstNode
          key={child.id}
          name={`${name}.${index}`}
          remove={() => {
            remove(index);
          }}
        />
      ))}
      <Button
        onClick={() => {
          append(NewAstNode());
        }}
      >
        + child
      </Button>
    </div>
  );
}
