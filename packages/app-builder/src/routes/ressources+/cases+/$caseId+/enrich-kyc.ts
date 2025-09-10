import { KycCaseEnrichment } from '@app-builder/models/kyc-case-enrichment';
import { initServerServices } from '@app-builder/services/init.server';
import { ActionFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

function enrichAnalysisWithLinks(enrichments: KycCaseEnrichment[]): KycCaseEnrichment[] {
  return enrichments.map((enrichment) => {
    let updatedAnalysis = enrichment.analysis;

    updatedAnalysis = updatedAnalysis.replace(/\[(\d+)\]/g, (match, numStr: string) => {
      const index = parseInt(numStr, 10) - 1;
      const citation = enrichment.citations[index];
      if (citation && citation.url) {
        // Escape quotes in title if necessary
        const safeTitle = citation.title.replace(/"/g, "'");
        return `[\[${numStr}\]](${citation.url} "${safeTitle}")`;
      }
      return match;
    });

    return {
      ...enrichment,
      analysis: updatedAnalysis,
    };
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession },
  } = initServerServices(request);

  const { caseId } = params;
  invariant(caseId, 'caseId is required');
  const { cases } = await authService.isAuthenticated(request, {
    failureRedirect: '/sign-in',
  });

  const [_t, _session] = await Promise.all([
    getFixedT(request, ['common', 'cases']),
    getSession(request),
  ]);

  if (request.method === 'POST') {
    try {
      const kycCaseEnrichments = await cases.enrichPivotObjectOfCaseWithKyc({ caseId });

      if (!kycCaseEnrichments) {
        return Response.json(
          { success: false, error: 'KYC enrichment not found' },
          {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );
      }
      return Response.json({
        success: true,
        kycCaseEnrichments: enrichAnalysisWithLinks(kycCaseEnrichments),
      });
    } catch (error) {
      console.error('Error enriching KYC', error);
      const status = (error as any)?.status || 500;
      const message = (error as any)?.message || 'Error enriching KYC';
      throw Response.json(
        { success: false, error: { code: status, message } },
        { status, headers: { 'Content-Type': 'application/json' } },
      );
    }
  }
}
