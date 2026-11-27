import { useEffect, useState } from 'react'

import {
  History,
  ShieldCheck,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  CircleAlert,
} from 'lucide-react'

import { useAuthStore } from '../../store/authStore'

import {
  getAdminAuditLogs,
} from '../../services/adminService'

import type { AdminAuditLog } from '../../types/admin'

const PAGE_SIZE = 20

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Africa/Nairobi',
  }).format(new Date(value))
}

export default function AdminAuditLogsPage() {
  const profile = useAuthStore((state) => state.profile)

  if (!profile) return null

  return <AuditWorkspace key={profile.id} />
}

function AuditWorkspace() {
  const [logs, setLogs] = useState<AdminAuditLog[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  const [expandedId, setExpandedId] =
    useState<string | null>(null)

  useEffect(() => {
    let active = true

    getAdminAuditLogs(
      PAGE_SIZE + 1,
      page * PAGE_SIZE
    )
      .then((records) => {
        if (!active) return

        setLogs(records.slice(0, PAGE_SIZE))
        setHasMore(records.length > PAGE_SIZE)
      })
      .catch((err: unknown) => {
        if (!active) return

        setLogs([])
        setHasMore(false)

        setError(
          typeof err === 'object' &&
          err !== null &&
          'message' in err
            ? String(err.message)
            : 'Unable to retrieve administrative audit logs.'
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [page, reloadKey])

  function prepareReload() {
    setLoading(true)
    setError('')
    setLogs([])
    setHasMore(false)
    setExpandedId(null)
  }

  function refresh() {
    if (loading) return

    prepareReload()
    setReloadKey((previous) => previous + 1)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#123C35]">
            Administrative audit logs
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Track recorded privileged actions across UjuziLink.
          </p>
        </div>

        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold disabled:opacity-50"
        >
          <RefreshCw
            size={18}
            className={loading ? 'animate-spin' : ''}
          />
          Refresh
        </button>
      </div>

      <section className="rounded-3xl bg-[#123C35] p-7 text-white">

        <History size={38} className="text-[#D5F76A]" />

        <h2 className="mt-4 text-2xl font-bold">
          Accountability through transparency.
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70">
          Review recorded administrative changes, including
          role assignments and opportunity moderation.
          Audit records are read-only through this interface.
        </p>

      </section>

      {error && (
        <div
          role="alert"
          className="flex gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700"
        >
          <CircleAlert size={20} />
          {error}
        </div>
      )}

      {loading ? (
        <div
          role="status"
          className="flex justify-center rounded-2xl bg-white py-20"
        >
          <LoaderCircle
            size={38}
            className="animate-spin text-[#16826B]"
          />
        </div>
      ) : !error ? (
        <>
          {logs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">

              <History size={42} className="mx-auto text-slate-300" />

              <h3 className="mt-4 font-bold text-[#123C35]">
                No audit records found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Recorded administrator actions will appear here.
              </p>

            </div>
          ) : (
            <div className="space-y-4">

              {logs.map((log) => (
                <article
                  key={log.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >

                  <div className="flex flex-wrap items-start gap-4">

                    <div className="rounded-xl bg-[#EAF3EE] p-3 text-[#16826B]">
                      <History size={24} />
                    </div>

                    <div className="min-w-0 flex-1">

                      <h2 className="text-lg font-bold capitalize text-[#123C35]">
                        {log.action
                          .replaceAll('_', ' ')
                          .toLowerCase()}
                      </h2>

                      <p className="mt-1 text-xs text-slate-500">
                        {formatDate(log.created_at)} EAT
                      </p>

                      <p className="mt-2 text-sm text-slate-600">
                        Resource: {log.target_type}
                      </p>

                    </div>

                    <button
                      type="button"
                      aria-expanded={expandedId === log.id}
                      onClick={() =>
                        setExpandedId(
                          expandedId === log.id ? null : log.id
                        )
                      }
                      className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold"
                    >
                      {expandedId === log.id
                        ? 'Hide details'
                        : 'View details'}
                    </button>

                  </div>

                  <div className="mt-4 rounded-xl bg-[#F6F8F5] p-4">

                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Administrative reason
                    </p>

                    <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-700">
                      {log.reason || 'No reason recorded'}
                    </p>

                  </div>

                  {expandedId === log.id && (
                    <div className="mt-5 space-y-4">

                      <div className="space-y-2 text-xs text-slate-500">

                        <p className="break-all">
                          <strong>Administrator ID:</strong> {log.admin_id}
                        </p>

                        <p className="break-all">
                          <strong>Target ID:</strong> {log.target_id || 'None'}
                        </p>

                        <p className="break-all">
                          <strong>Audit ID:</strong> {log.id}
                        </p>

                      </div>

                      <div className="grid gap-4 md:grid-cols-2">

                        <div className="min-w-0 rounded-xl border border-slate-200 p-4">

                          <h3 className="mb-3 text-sm font-semibold text-[#123C35]">
                            Previous values
                          </h3>

                          <pre className="overflow-x-auto whitespace-pre-wrap break-all text-xs text-slate-600">
                            {JSON.stringify(log.previous_data, null, 2)}
                          </pre>

                        </div>

                        <div className="min-w-0 rounded-xl border border-emerald-200 bg-emerald-50 p-4">

                          <h3 className="mb-3 text-sm font-semibold text-emerald-800">
                            Updated values
                          </h3>

                          <pre className="overflow-x-auto whitespace-pre-wrap break-all text-xs text-emerald-900">
                            {JSON.stringify(log.new_data, null, 2)}
                          </pre>

                        </div>

                      </div>
                    </div>
                  )}

                </article>
              ))}

            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">

            <p className="text-sm text-slate-500">
              Page {page + 1} · {logs.length} records
            </p>

            <div className="flex gap-3">

              <button
                type="button"
                disabled={page === 0}
                onClick={() => {
                  prepareReload()
                  setPage((previous) => previous - 1)
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm disabled:opacity-40"
              >
                <ChevronLeft size={17} />
                Previous
              </button>

              <button
                type="button"
                disabled={!hasMore}
                onClick={() => {
                  prepareReload()
                  setPage((previous) => previous + 1)
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm disabled:opacity-40"
              >
                Next
                <ChevronRight size={17} />
              </button>

            </div>
          </div>
        </>
      ) : null}

      <section className="flex items-start gap-3 rounded-xl bg-[#EAF3EE] p-5">

        <ShieldCheck
          size={23}
          className="shrink-0 text-[#16826B]"
        />

        <div>
          <h3 className="font-semibold text-[#123C35]">
            Protected audit history
          </h3>

          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            Administrators cannot directly modify or delete
            audit records through the application.
            This history covers actions performed through
            the audited administrative functions.
          </p>
        </div>

      </section>

    </div>
  )
}