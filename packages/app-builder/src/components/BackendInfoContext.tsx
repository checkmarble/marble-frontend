import { type BackendInfo } from '@app-builder/models';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { type PropsWithChildren } from 'react';

const BackendInfoContext = createSimpleContext<BackendInfo>(
  'BackendInfoProvider'
);

export const BackendInfoProvider = ({
  backendInfo,
  children,
}: PropsWithChildren<{ backendInfo: BackendInfo }>) => {
  return (
    <BackendInfoContext.Provider value={backendInfo}>
      {children}
    </BackendInfoContext.Provider>
  );
};

export const useBackendInfoContext = BackendInfoContext.useValue;
