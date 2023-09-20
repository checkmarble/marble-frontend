import { useBackendInfoContext } from '@app-builder/components';
import { useEffect, useRef, useState } from 'react';

export function useDownloadDecisions(scheduleExecutionId: string) {
  const [downloadDecisionsLink, setDownloadDecisionsLink] = useState('');
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);
  const [downloading, setDownloading] = useState(false);
  const backendInfo = useBackendInfoContext();

  useEffect(() => {
    if (downloadDecisionsLink !== '' && downloadLinkRef.current) {
      downloadLinkRef.current.click();
      URL.revokeObjectURL(downloadDecisionsLink);
      setDownloadDecisionsLink('');
    }
  }, [downloadDecisionsLink]);

  const downloadScheduledExecution = async () => {
    if (downloading) {
      throw new Error('Internal error: Already downloading');
    }
    setDownloading(true);

    try {
      // TODO: backend url ?
      const downloadLink = `${
        backendInfo.backendUrl
      }/scheduled-executions/${encodeURIComponent(
        scheduleExecutionId
      )}/decisions.zip`;
      const response = await fetch(
        new Request(downloadLink, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${backendInfo.accessToken}`,
          },
        })
      );

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
    downloadScheduledExecution,
    downloadLinkRef,
    downloadDecisionsLink,
  };
}
