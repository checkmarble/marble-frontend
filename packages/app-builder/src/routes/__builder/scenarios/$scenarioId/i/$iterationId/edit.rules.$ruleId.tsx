import {
  Callout,
  Paper,
  scenarioI18n,
  ScenarioPage,
} from "@app-builder/components";
import { EditAstNode, RootOrOperator } from "@app-builder/components/Edit";
import { setToastMessage } from "@app-builder/components/MarbleToaster";
import { Consequence } from "@app-builder/components/Scenario/Rule/Consequence";
import { type AstNode } from "@app-builder/models";
import { EditorIdentifiersProvider } from "@app-builder/services/editor";
import { serverServices } from "@app-builder/services/init.server";
import { fromParams, fromUUID } from "@app-builder/utils/short-uuid";
import { DevTool } from "@hookform/devtools";
import { type ActionArgs, json, type LoaderArgs } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { Button, Tag } from "@ui-design-system";
import { type Namespace } from "i18next";
import { Form, FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ClientOnly } from "remix-utils";

export const handle = {
  i18n: [...scenarioI18n, "common"] satisfies Namespace,
};

export async function loader({ request, params }: LoaderArgs) {
  const { authService } = serverServices;
  const { editor, scenario } = await authService.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const ruleId = fromParams(params, "ruleId");
  const scenarioId = fromParams(params, "scenarioId");

  const scenarioIterationRule = scenario.getScenarioIterationRule({
    ruleId,
  });

  const identifiers = editor.listIdentifiers({
    scenarioId,
  });

  return json({
    rule: await scenarioIterationRule,
    identifiers: await identifiers,
  });
}

export async function action({ request, params }: ActionArgs) {
  const { authService,sessionService: { getSession, commitSession }} = serverServices;
  const session = await getSession(request);
  const { editor } = await authService.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  try {
    const ruleId = fromParams(params, "ruleId");

    const expression = (await request.json()) as FormValues;

    await editor.saveRule({ ruleId, astNode: expression.astNode });

    setToastMessage(session, {
      type: "success",
      messageKey: "common:success.save",
    });
    return json({
      success: true as const,
      error: null,
      values: expression,
    },
    { headers: { "Set-Cookie": await commitSession(session) } });
  } catch (error) {
    setToastMessage(session, {
      type: "error",
      messageKey: "common:errors.unknown",
    });

    return json(
      {
        success: false as const,
        error: null,
        values: null,
      },
      { headers: { "Set-Cookie": await commitSession(session) } }
    );
  }
}

interface FormValues {
  astNode: AstNode;
}

export default function RuleView() {
  const { t } = useTranslation(handle.i18n);
  const { rule, identifiers } = useLoaderData<typeof loader>();
  console.log("view ast", JSON.stringify(rule.astNode, null, 2));
  const fetcher = useFetcher<typeof action>();
  const formMethods = useForm<FormValues>({
    // TODO(builder): defaultValues is not working
    defaultValues: { astNode: rule.astNode as AstNode },
  });

  return (
    <ScenarioPage.Container>
      <ScenarioPage.Header>
        <div className="flex flex-row items-center gap-4">
          <Link to="./..">
            <ScenarioPage.BackButton />
          </Link>
          {rule.name ?? fromUUID(rule.id)}
          <Tag size="big" border="square">
            {/* TODO(builder): use transaltion */}
            Edit
          </Tag>
        </div>
      </ScenarioPage.Header>
      <ScenarioPage.Content className="max-w-3xl">
        <Callout>{rule.description}</Callout>
        <Form
          control={formMethods.control}
          onSubmit={({ data }) => {
            fetcher.submit(data, {
              method: "PATCH",
              encType: "application/json",
            });
          }}
        >
          <div className="max-w flex flex-col gap-4">
            <Consequence scoreIncrease={rule.scoreModifier} />
            <Paper.Container scrollable={false}>
              <EditorIdentifiersProvider identifiers={identifiers}>
                <FormProvider {...formMethods}>
                  {/* <RootOrOperator
                  renderAstNode={({ name }) => <WildEditAstNode name={name} />}
                /> */}
                  <RootOrOperator
                    renderAstNode={({ name }) => <EditAstNode name={name} />}
                  />
                </FormProvider>
              </EditorIdentifiersProvider>
            </Paper.Container>
            <Button type="submit" className="w-fit">
              {t("common:save")}
            </Button>
          </div>
        </Form>
        <ClientOnly>
          {() => (
            <DevTool
              control={formMethods.control}
              placement="bottom-right"
              styles={{
                panel: { width: "450px" },
              }}
            />
          )}
        </ClientOnly>
      </ScenarioPage.Content>
    </ScenarioPage.Container>
  );
}
