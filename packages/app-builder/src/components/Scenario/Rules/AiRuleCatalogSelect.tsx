import { Highlight } from '@app-builder/components/Highlight';
import { useRuleCatalogQuery } from '@app-builder/queries/scenarios/rule-catalog';
import { useOrganizationDetails } from '@app-builder/services/organization/organization-detail';
import { getClientEnv, isFlagActive } from '@app-builder/utils/environment';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { cn, Input, inputIconClassName, Popover } from 'ui-design-system';
import { Icon } from 'ui-icons';

export interface AiRuleCatalogInfo {
  name: string;
  description: string;
}

interface AiRuleCatalogSelectProps {
  disabled?: boolean;
  isGenerating?: boolean;
  onSelect: (instruction: string, catalogInfo?: AiRuleCatalogInfo) => void;
}

export function AiRuleCatalogSelect({ disabled, isGenerating, onSelect }: AiRuleCatalogSelectProps) {
  const { t, i18n } = useTranslation(['scenarios']);
  const { org } = useOrganizationDetails();
  const isRuleCatalogEnabled = isFlagActive(getClientEnv('AI_RULE_CATALOG_ENABLED'), org.id);
  const ruleCatalogQuery = useRuleCatalogQuery({ isEnabled: isRuleCatalogEnabled });
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const language = i18n.language as 'ar' | 'en' | 'fr';
  const endIconClass = inputIconClassName({ inputSize: 'large', placement: 'end' });
  const normalizedSearch = search.trim().toLowerCase();
  const matchingPrompts =
    ruleCatalogQuery.data?.rules.filter((catalogPrompt) => {
      const name = catalogPrompt.name[language] ?? catalogPrompt.name['en'];
      return [name].some((text) => text.toLowerCase().includes(normalizedSearch));
    }) ?? [];

  const selectInstruction = (instruction: string, catalogInfo?: AiRuleCatalogInfo) => {
    onSelect(instruction, catalogInfo);
    setOpen(false);
    setSearch('');
  };

  const inputEl = (
    <div className="relative">
      <Input
        value={search}
        disabled={disabled}
        endAdornment="caret-down"
        className="[&>svg]:invisible"
        placeholder={t('scenarios:rules.ai_generate.placeholder')}
        onFocus={() => setTimeout(() => setOpen(true), 0)}
        onChange={(event) => {
          setSearch(event.currentTarget.value);
          setOpen(true);
        }}
        onEnterKeyDown={(event) => {
          if (!search.trim()) return;
          event.preventDefault();
          selectInstruction(search.trim());
        }}
      />
      {isRuleCatalogEnabled ? (
        <Icon
          icon={isGenerating ? 'spinner' : 'caret-down'}
          className={cn('pointer-events-none', endIconClass, { 'animate-spin': isGenerating })}
        />
      ) : null}
    </div>
  );

  return isRuleCatalogEnabled ? (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Anchor asChild>{inputEl}</Popover.Anchor>
      <Popover.Content
        align="start"
        side="bottom"
        sideOffset={4}
        onOpenAutoFocus={(event) => event.preventDefault()}
        className="w-(--radix-popover-trigger-width)"
      >
        <div className="flex flex-col p-xs" role="listbox" onMouseDown={(event) => event.preventDefault()}>
          {match(ruleCatalogQuery)
            .with({ isPending: true }, () => (
              <p className="text-s text-grey-secondary p-sm">{t('scenarios:rules.ai_generate.catalog_loading')}</p>
            ))
            .with({ isError: true }, () => (
              <p className="text-s text-grey-secondary p-sm">{t('scenarios:rules.ai_generate.catalog_unavailable')}</p>
            ))
            .with({ isSuccess: true }, () => {
              return matchingPrompts.map((catalogPrompt) => {
                const name = catalogPrompt.name[language] ?? catalogPrompt.name['en'];
                const description = catalogPrompt.description[language] ?? catalogPrompt.description['en'];

                return (
                  <button
                    key={catalogPrompt.prompt}
                    type="button"
                    role="option"
                    className="hover:bg-purple-background-light focus-visible:ring-purple-primary flex w-full flex-col gap-xs rounded-xs p-md text-start outline-hidden focus-visible:ring-2"
                    onClick={() => selectInstruction(catalogPrompt.prompt, { name, description })}
                  >
                    <Highlight
                      text={name}
                      query={search}
                      className="text-grey-primary font-medium"
                      markClassName="bg-transparent text-purple-primary"
                    />
                    {description ? <span className="text-grey-secondary text-tiny">{description}</span> : null}
                  </button>
                );
              });
            })
            .exhaustive()}
          {!ruleCatalogQuery.isPending && matchingPrompts.length === 0 ? (
            search.trim() ? (
              <button
                type="button"
                className="hover:bg-purple-background-light focus-visible:ring-purple-primary rounded-xs p-sm text-start text-s outline-hidden focus-visible:ring-2"
                onClick={() => selectInstruction(search.trim())}
              >
                {t('scenarios:rules.ai_generate.use_free_text', { instruction: search.trim() })}
              </button>
            ) : (
              <p className="text-s text-grey-secondary p-sm">{t('scenarios:rules.ai_generate.catalog_empty')}</p>
            )
          ) : null}
        </div>
      </Popover.Content>
    </Popover.Root>
  ) : (
    inputEl
  );
}
