import { ErrorComponent, Page } from '@app-builder/components';
import {
  BreadCrumbLink,
  type BreadCrumbProps,
  BreadCrumbs,
} from '@app-builder/components/Breadcrumbs';
import { LoadingIcon } from '@app-builder/components/Spinner';
import { useUploadListDataFile } from '@app-builder/queries/upload-list-data';
import { DeleteList } from '@app-builder/routes/ressources+/lists+/delete';
import { EditList } from '@app-builder/routes/ressources+/lists+/edit';
import { NewListValue } from '@app-builder/routes/ressources+/lists+/value_create';
import { DeleteListValue } from '@app-builder/routes/ressources+/lists+/value_delete';
import {
  isCreateListValueAvailable,
  isDeleteListAvailable,
  isDeleteListValueAvailable,
  isEditListAvailable,
} from '@app-builder/services/feature-access';
import { initServerServices } from '@app-builder/services/init.server';
import useAsync from '@app-builder/utils/hooks/use-async';
import { handleParseParamError } from '@app-builder/utils/http/handle-errors';
import { REQUEST_TIMEOUT } from '@app-builder/utils/http/http-status-codes';
import { parseIdParamSafe } from '@app-builder/utils/input-validation';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type LoaderFunctionArgs } from '@remix-run/node';
import { Link, useLoaderData, useRevalidator, useRouteError } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import clsx from 'clsx';
import { type Namespace } from 'i18next';
import * as React from 'react';
import { useDropzone } from 'react-dropzone-esm';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { ClientOnly } from 'remix-utils/client-only';
import { Button, CtaClassName, Input, ModalV2, Table, useVirtualTable } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { user, customListsRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const parsedParams = await parseIdParamSafe(params, 'listId');
  if (!parsedParams.success) {
    return handleParseParamError(request, parsedParams.error!);
  }
  const customList = await customListsRepository.getCustomList(parsedParams.data.listId);

  return {
    customList: customList,
    listFeatureAccess: {
      isCreateListValueAvailable: isCreateListValueAvailable(user),
      isDeleteListValueAvailable: isDeleteListValueAvailable(user),
      isEditListAvailable: isEditListAvailable(user),
      isDeleteListAvailable: isDeleteListAvailable(user),
    },
  };
}

export const handle = {
  i18n: ['lists', 'common'] satisfies Namespace,
  BreadCrumbs: [
    ({ isLast }: BreadCrumbProps) => {
      const { customList } = useLoaderData<typeof loader>();

      return (
        <BreadCrumbLink
          to={getRoute('/lists/:listId', { listId: fromUUIDtoSUUID(customList.id) })}
          isLast={isLast}
        >
          {customList.name}
        </BreadCrumbLink>
      );
    },
  ],
};

type CustomListValue = {
  id: string;
  value: string;
};

const columnHelper = createColumnHelper<CustomListValue>();

export default function Lists() {
  const { customList, listFeatureAccess } = useLoaderData<typeof loader>();
  const listValues = customList.values ?? [];
  const { t } = useTranslation(handle.i18n);
  const columns = React.useMemo(
    () => [
      columnHelper.accessor((row) => row.value, {
        id: 'value',
        header: t('lists:detail.values-list.header'),
        size: 500,
        sortingFn: 'text',
        enableSorting: true,
        cell: ({ getValue, row }) => {
          const value = getValue();
          return (
            <div className="group flex items-center justify-between">
              <p className="text-grey-00 text-s font-medium">{value}</p>
              {listFeatureAccess.isDeleteListValueAvailable ? (
                <DeleteListValue listId={customList.id} listValueId={row.original.id} value={value}>
                  <button
                    className="group-hover:text-grey-00 text-transparent transition-colors duration-200 ease-in-out"
                    name="delete"
                    tabIndex={-1}
                  >
                    <Icon icon="delete" className="size-6 shrink-0" />
                    <span className="sr-only">{t('common:delete')}</span>
                  </button>
                </DeleteListValue>
              ) : null}
            </div>
          );
        },
      }),
    ],
    [t, listFeatureAccess.isDeleteListValueAvailable, customList.id],
  );

  const virtualTable = useVirtualTable({
    data: listValues,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
  return (
    <Page.Main>
      <Page.Header className="justify-between">
        <BreadCrumbs />
        {listFeatureAccess.isEditListAvailable ? (
          <EditList
            listId={customList.id}
            name={customList.name}
            description={customList.description}
          />
        ) : null}
      </Page.Header>
      <Page.Container>
        {customList.description ? (
          <Page.Description>{customList.description}</Page.Description>
        ) : null}
        <Page.Content className="max-w-screen-xl">
          {listValues.length > 0 ? <DownloadAsCSV listId={customList.id} /> : null}
          <UploadAsCsv listId={customList.id} />
          <div className="flex flex-col gap-2 overflow-hidden lg:gap-4">
            <div className="flex flex-row gap-2 lg:gap-4">
              <form className="flex grow items-center">
                <Input
                  className="w-full"
                  disabled={listValues.length === 0}
                  type="search"
                  aria-label={t('common:search')}
                  placeholder={t('common:search')}
                  startAdornment="search"
                  onChange={(event) => {
                    virtualTable.table.setGlobalFilter(event.target.value);
                  }}
                />
              </form>
              {listFeatureAccess.isCreateListValueAvailable ? (
                <NewListValue listId={customList.id} />
              ) : null}
            </div>
            {virtualTable.isEmpty ? (
              <div className="bg-grey-100 border-grey-90 flex h-28 flex-col items-center justify-center rounded-lg border border-solid p-4">
                <p className="text-s font-medium">
                  {listValues.length > 0
                    ? t('lists:empty_custom_list_matches')
                    : t('lists:empty_custom_list_values_list')}
                </p>
              </div>
            ) : (
              <Table.Default {...virtualTable}></Table.Default>
            )}
          </div>
          {listFeatureAccess.isDeleteListAvailable ? <DeleteList listId={customList.id} /> : null}
        </Page.Content>
      </Page.Container>
    </Page.Main>
  );
}
export function ErrorBoundary() {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);
  return <ErrorComponent error={error} />;
}

function DownloadAsCSV({ listId }: { listId: string }) {
  const { t } = useTranslation(handle.i18n);
  const downloadUrl = getRoute('/ressources/lists/download-csv-file/:listId', {
    listId: fromUUIDtoSUUID(listId),
  });

  return (
    <Link
      reloadDocument
      to={downloadUrl}
      className={CtaClassName({ variant: 'secondary', className: 'w-fit' })}
    >
      <Icon icon="download" className="size-6" />
      {t('lists:download_values_as_csv')}
    </Link>
  );
}

const UploadAsCsvDropzone = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
  function UploadAsCsvDropzone({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={clsx(
          'text-s flex h-40 flex-col items-center justify-center gap-4 rounded border-2 border-dashed',
          className,
        )}
        {...props}
      />
    );
  },
);

type State =
  | {
      open: boolean;
      success: false;
      message: string;
    }
  | {
      open: boolean;
      success: true;
      total: {
        existing: number;
        deleted: number;
        created: number;
      };
    };
type Actions =
  | {
      type: 'success';
      total: {
        existing: number;
        deleted: number;
        created: number;
      };
    }
  | {
      type: 'error';
      message: string;
    }
  | {
      type: 'setOpen';
      open: boolean;
    };

const initialState: State = {
  open: false,
  message: '',
  success: false,
};

function modalReducer(state: State, action: Actions): State {
  switch (action.type) {
    case 'success':
      return {
        open: true,
        success: true,
        total: action.total,
      };
    case 'error':
      return {
        open: true,
        success: false,
        message: action.message,
      };
    case 'setOpen':
      return {
        // we don't want to reset the full state in case of a close animation
        ...state,
        open: action.open,
      };
    default:
      return state;
  }
}

function ClientUploadAsCsv({ listId }: { listId: string }) {
  const { t } = useTranslation(handle.i18n);
  const [modalState, dispatch] = React.useReducer(modalReducer, initialState);
  const uploadListDataFile = useUploadListDataFile(listId);

  const revalidator = useRevalidator();
  const [onDrop, { loading }] = useAsync(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await uploadListDataFile.mutateAsync(formData);

      if (!response.ok) {
        if (response.status === REQUEST_TIMEOUT) {
          toast.error(t('lists:errors.request_timeout'));
          return;
        }
        let errorMessage: string | undefined;
        try {
          const errorResponse = z
            .object({
              message: z.string(),
            })
            .parse(await response.json());
          errorMessage = errorResponse.message;
        } catch (_error) {
          errorMessage = (await response.text()).trim();
        }

        dispatch({
          type: 'error',
          message:
            t('lists:errors.failure_message', {
              replace: { errorMessage },
            }) ?? t('common:global_error'),
        });
        return;
      }

      const { results } = z
        .object({
          results: z.object({
            total_existing: z.number(),
            total_deleted: z.number(),
            total_created: z.number(),
          }),
        })
        .parse(await response.json());

      dispatch({
        type: 'success',
        total: {
          existing: results.total_existing,
          deleted: results.total_deleted,
          created: results.total_created,
        },
      });
      revalidator.revalidate();
    } catch (error) {
      dispatch({
        type: 'error',
        message: error instanceof Error ? error.message : t('common:global_error'),
      });
    }
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      void onDrop(acceptedFiles);
    },
    accept: { 'text/*': ['.csv'] },
    multiple: false,
  });

  return (
    <UploadAsCsvDropzone
      {...getRootProps()}
      className={isDragActive ? 'bg-purple-96 border-purple-82 opacity-90' : 'border-grey-50'}
    >
      <input {...getInputProps()} />
      <p>{t('lists:drop_csv_here')}</p>
      <p className="text-grey-80 uppercase">{t('common:or')}</p>
      <Button>
        <LoadingIcon icon="upload" loading={loading} className="size-6" />
        {t('lists:pick_csv')}
      </Button>

      <ModalV2.Root
        open={modalState.open}
        setOpen={(open) => {
          dispatch({ type: 'setOpen', open });
        }}
      >
        <ModalV2.Content onClick={(e) => e.stopPropagation()}>
          <div className="bg-grey-100 text-s flex flex-col items-center gap-6 p-6">
            <Icon
              icon={modalState.success ? 'tick' : 'cross'}
              className={clsx(
                'size-[108px] rounded-full border-8',
                modalState.success
                  ? 'bg-purple-96 border-purple-96 text-purple-65'
                  : 'bg-red-95 border-red-95 text-red-47',
              )}
            />
            <div className="flex flex-col items-center gap-2 text-center">
              <p className="text-l font-semibold">{t('lists:upload_csv.results')}</p>
              {modalState.success ? (
                <div className="flex flex-col items-start">
                  <p>{t('lists:upload_csv.success')}</p>
                  <ul className="list-inside list-disc text-start">
                    <li>
                      {t('lists:upload_csv.success.existing', {
                        count: modalState.total.existing,
                      })}
                    </li>
                    <li>
                      {t('lists:upload_csv.success.deleted', {
                        count: modalState.total.deleted,
                      })}
                    </li>
                    <li>
                      {t('lists:upload_csv.success.created', {
                        count: modalState.total.created,
                      })}
                    </li>
                  </ul>
                </div>
              ) : (
                <p>{modalState.message}</p>
              )}
            </div>
            <ModalV2.Close render={<Button />}>
              <Icon icon="tick" className="size-6" />
              {t('common:understand')}
            </ModalV2.Close>
          </div>
        </ModalV2.Content>
      </ModalV2.Root>
    </UploadAsCsvDropzone>
  );
}

function UploadAsCsv({ listId }: { listId: string }) {
  return (
    <ClientOnly
      fallback={
        <UploadAsCsvDropzone className="border-grey-50">
          <LoadingIcon icon="upload" loading={true} className="size-6" />
        </UploadAsCsvDropzone>
      }
    >
      {() => <ClientUploadAsCsv listId={listId} />}
    </ClientOnly>
  );
}
