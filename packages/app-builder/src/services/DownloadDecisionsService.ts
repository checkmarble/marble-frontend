import { useEffect, useRef, useState } from 'react';

import { useBackendInfo } from './auth/auth.client';
import { clientServices } from './init.client';

export function useDownloadDecisions(scheduleExecutionId: string) {
  const [downloadDecisionsLink, setDownloadDecisionsLink] = useState('');
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);
  const [downloading, setDownloading] = useState(false);
  const { backendUrl, accessToken } = useBackendInfo(
    clientServices.authenticationClientService
  );

  useEffect(() => {
    if (downloadDecisionsLink !== '' && downloadLinkRef.current) {
      downloadLinkRef.current.click();
      setDownloadDecisionsLink('');
    }
  }, [downloadDecisionsLink]);

  const downloadDecisions = async () => {
    if (downloading) {
      throw new Error('Internal error: Already downloading');
    }
    setDownloading(true);

    try {
      const downloadLink = `${backendUrl}/scheduled-executions/${encodeURIComponent(
        scheduleExecutionId
      )}/decisions.zip`;
      const response = await fetch(downloadLink, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${await accessToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          'Internal error: Failed to download decisions: ' + response.statusText
        );
      }

      const file = await response.blob();
      const link = URL.createObjectURL(file);

      setDownloadDecisionsLink(link);
    } finally {
      setDownloading(false);
    }
  };

  return {
    downloadDecisions,
    downloadLinkRef,
    downloadDecisionsLink,
    downloadingDecisions: downloading,
    decisionsFilename: `decisions-${scheduleExecutionId}`,
  };
}
