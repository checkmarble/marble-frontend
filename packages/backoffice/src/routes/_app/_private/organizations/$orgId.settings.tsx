import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/_private/organizations/$orgId/settings')(
  {
    component: RouteComponent,
  },
)

function RouteComponent() {
  return <div>Hello "/_private/organizations/$orgId/settings"!</div>
}
