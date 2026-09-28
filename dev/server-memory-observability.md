# Investigating app-builder server memory

The app-builder image runs the Nitro server with **Bun** on Cloud Run. The existing
Cloud Run container memory graph includes more than the JavaScript heap, and its
aggregate view can hide which instance is growing.

## Enable the sample log

Deploy this change, then set `MEMORY_OBSERVABILITY=true` on the app-builder Cloud Run
service for the revision being investigated. The observer is off by default. It
emits one structured `server_memory_sample` log per minute per process while the
process is active, starting with its first request. It also samples at the end of
a request if Cloud Run throttled the timer while the instance was idle. Disable it
by removing the variable or setting it to `false`.

Use this filter in Cloud Logging Logs Explorer:

```
resource.type="cloud_run_revision"
jsonPayload.event="server_memory_sample"
```

Filter further by `resource.labels.service_name` and
`resource.labels.revision_name`. Within one revision, group samples by
`jsonPayload.process_instance_id`; each ID denotes one server process, even if
multiple instances have the same PID. The log also includes `revision`,
`app_version`, `pid`, and `uptime_seconds`.

The sizes are **bytes**:

| Field | What it measures |
| --- | --- |
| `rss_bytes` | Process resident memory, including heap, native allocations, and runtime overhead. |
| `heap_used_bytes` | JavaScript heap in use at the sample instant. |
| `heap_total_bytes` | JavaScript heap capacity allocated by the runtime. |
| `external_bytes`, `array_buffers_bytes` | Memory outside the JavaScript heap reported by Bun's Node-compatible API. |
| `active_handlers` | Request handlers currently running; a streaming response may continue after its handler returns. |
| `completed_handlers` | Handlers completed during the sample interval, including health checks. |
| `completed_server_fns` | Counts by server function name, capped at 30 names per interval. |
| `completed_other_requests`, `completed_other_server_fns` | Non-server-function requests and names beyond that cap. |

Compare samples **within the same `process_instance_id`**. A rising
`heap_used_bytes` low point over several garbage-collection cycles suggests
retained JavaScript objects. Rising `rss_bytes` with a stable heap can point to
native allocations, fragmentation, or other container memory. A rise that follows
`active_handlers` or request volume and then falls may be normal load. A single
sample, or a high value before garbage collection, cannot establish a leak.

`completed_server_fns` gives context for a repeatable load experiment. Exercise
one route or function at a time against a staging revision, allow the process to
settle, and compare memory at similar request counts and concurrency. The counts
show correlation; they do not attribute allocated bytes to a function.

If the JavaScript heap keeps rising, capture two heap snapshots from the **same
local or isolated staging process** around a repeatable workload and compare
retained objects. Bun supports `Bun.generateHeapSnapshot('v8')`. Snapshots can
contain session and customer data, and producing them can pause the process, so
keep them out of normal production logs and artifacts.

## Current code findings

- `router.tsx` already shares the bootstrap i18next instance and clears the
  per-request QueryClient when SSR cleanup runs (prior fix `d16d31bf2`).
- The root loader still creates an i18next instance per SSR request and replaces
  the locale entry in a four-key cache. This is bounded by locale count, but a
  heap comparison can show whether older instances remain referenced elsewhere.
- The app-builder production image currently sets `NODE_ENV=development` in its
  runtime stage. Confirm whether this was intentional before changing it; it can
  alter application and dependency behavior and complicate memory comparisons.

The memory observer does not retain requests, responses, user data, or raw URL
paths. Its function-count map is bounded and cleared after each sample.
