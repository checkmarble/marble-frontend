import { findDataModelTableByName } from '@app-builder/models';
import { type DataModelField } from '@app-builder/models/data-model';
import { type LuaAstNode } from '@app-builder/models/astNode/lua';
import { useRunLuaScriptMutation } from '@app-builder/queries/scenarios/run-lua-script';
import { fromSUUIDtoUUID } from '@app-builder/utils/short-uuid';
import { useParams } from '@tanstack/react-router';
import Prism from 'prismjs';
import 'prismjs/components/prism-lua';
import './Lua.css';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Editor from 'react-simple-code-editor';
import { Button, Input } from 'ui-design-system';

import { AstBuilderDataSharpFactory } from '../../../../Provider';
import { AstBuilderNodeSharpFactory } from '../../../node-store';
import { OperandEditModalContainer } from '../../Container';
import { type OperandEditModalProps } from '../../EditModal';

type PayloadValue = string | number | boolean;

function PayloadFieldInput({
  id,
  field,
  value,
  onChange,
}: {
  id: string;
  field: DataModelField;
  value: PayloadValue | undefined;
  onChange: (value: PayloadValue | undefined) => void;
}) {
  if (field.isEnum && field.values) {
    return (
      <select
        id={id}
        className="border-grey-border text-s text-grey-primary h-10 rounded-sm border px-2 font-medium"
        value={value === undefined ? '' : String(value)}
        onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value)}
      >
        <option value="" />
        {field.values.map((v) => (
          <option key={String(v)} value={String(v)}>
            {String(v)}
          </option>
        ))}
      </select>
    );
  }

  switch (field.dataType) {
    case 'Bool':
      return (
        <input
          id={id}
          type="checkbox"
          className="size-5"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
        />
      );
    case 'Int':
    case 'Float':
      return (
        <Input
          id={id}
          type="number"
          step={field.dataType === 'Int' ? '1' : 'any'}
          value={value === undefined ? '' : String(value)}
          onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
        />
      );
    case 'Timestamp':
      return (
        <Input
          id={id}
          type="datetime-local"
          value={value === undefined ? '' : String(value)}
          onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value)}
        />
      );
    default:
      return (
        <Input
          id={id}
          type="text"
          value={value === undefined ? '' : String(value)}
          onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value)}
        />
      );
  }
}

export function EditLua(props: Omit<OperandEditModalProps, 'node'>) {
  const { t } = useTranslation(['scenarios', 'common']);
  const nodeSharp = AstBuilderNodeSharpFactory.useSharp();
  const node = nodeSharp.select((s) => s.node as LuaAstNode);

  const dataModel = AstBuilderDataSharpFactory.select((s) => s.data.dataModel);
  const triggerObjectType = AstBuilderDataSharpFactory.select((s) => s.data.triggerObjectType);
  const fields = useMemo(() => {
    const table = findDataModelTableByName({ dataModel, tableName: triggerObjectType });
    return table.fields.filter((field) => !field.hidden);
  }, [dataModel, triggerObjectType]);

  const params = useParams({ strict: false });
  const scenarioIterationId = params.iterationId ? fromSUUIDtoUUID(params.iterationId) : undefined;

  const runLuaScript = useRunLuaScriptMutation();

  // The script is persisted on the node; the local mirror keeps the controlled editor in sync.
  const [code, setCode] = useState(node.namedChildren.code.constant ?? '');
  // The test payload is only local dry-run state — it is not part of the persisted node.
  const [payload, setPayload] = useState<Record<string, PayloadValue>>({});

  const setField = (name: string, value: PayloadValue | undefined) => {
    setPayload((prev) => {
      const next = { ...prev };
      if (value === undefined) {
        delete next[name];
      } else {
        next[name] = value;
      }
      return next;
    });
  };

  const handleRun = () => {
    if (!scenarioIterationId) return;
    runLuaScript.mutate({ scenarioIterationId, code, payload });
  };

  return (
    <OperandEditModalContainer {...props} title={t('scenarios:edit_lua.title')} size="full">
      <div className="flex gap-4">
        <div className="flex min-w-0 flex-[2] flex-col gap-2">
          <span className="text-s text-grey-primary font-medium">{t('scenarios:edit_lua.code_label')}</span>
          <div className="lua-editor border-grey-border text-s text-grey-primary min-h-96 overflow-auto rounded-sm border">
            <Editor
              value={code}
              onValueChange={(value) => {
                setCode(value);
                node.namedChildren.code.constant = value;
              }}
              highlight={(value) => Prism.highlight(value, Prism.languages['lua'] ?? {}, 'lua')}
              placeholder={t('scenarios:edit_lua.code_placeholder')}
              padding={8}
              textareaClassName="outline-none"
              className="min-h-96 font-mono"
              style={{ fontFamily: 'monospace', fontSize: 12 }}
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-s text-grey-primary font-medium">{t('scenarios:edit_lua.payload_label')}</span>
            <div className="border-grey-border flex max-h-96 flex-col gap-3 overflow-auto rounded-sm border p-3">
              {fields.map((field) => (
                <div key={field.id} className="flex items-center gap-2">
                  <label
                    className="text-s text-grey-primary w-1/3 shrink-0 font-medium"
                    htmlFor={`lua-payload-${field.id}`}
                  >
                    {field.name}
                    <span className="text-grey-secondary ml-1 font-normal">({field.dataType})</span>
                  </label>
                  <div className="flex-1">
                    <PayloadFieldInput
                      id={`lua-payload-${field.id}`}
                      field={field}
                      value={payload[field.name]}
                      onChange={(value) => setField(field.name, value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="secondary" onClick={handleRun} disabled={!scenarioIterationId || runLuaScript.isPending}>
              {t('scenarios:edit_lua.run')}
            </Button>
            {runLuaScript.isError ? (
              <pre className="text-s text-red-primary whitespace-pre-wrap">{String(runLuaScript.error)}</pre>
            ) : null}
            {runLuaScript.isSuccess && runLuaScript.data.error ? (
              <div className="flex flex-col gap-1">
                <span className="text-s text-red-primary font-medium">{t('scenarios:edit_lua.error_label')}</span>
                <pre className="bg-red-background text-s text-red-primary overflow-auto whitespace-pre-wrap rounded-sm p-2">
                  {runLuaScript.data.error}
                </pre>
              </div>
            ) : null}
            {runLuaScript.isSuccess && !runLuaScript.data.error ? (
              <div className="flex flex-col gap-1">
                <span className="text-s text-grey-primary font-medium">{t('scenarios:edit_lua.result_label')}</span>
                <pre className="bg-grey-background-light text-s text-grey-primary overflow-auto rounded-sm p-2">
                  {JSON.stringify(runLuaScript.data.returnValue, null, 2)}
                </pre>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </OperandEditModalContainer>
  );
}
