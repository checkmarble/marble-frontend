import { getListsFn } from '@app-builder/server-fns/lists';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export function useGetCustomListsQuery() {
  const getLists = useServerFn(getListsFn);

  return useQuery({
    queryKey: ['custom-lists'],
    queryFn: () => getLists(),
  });
}
