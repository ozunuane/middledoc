'use client'

import React, { useState, useEffect } from 'react'

interface AnalyticsData {
  completion_by_month: { month: string; total: number; received: number; rate: number }[]
  response_time: { avg_days: number; min_days: number; max_days: number }
  status_breakdown: { status: string; count: number }[]
  upload_activity: { day: string; count: number }[]
  top_clients: { name: string; uploads: number; requests: number }[]
  overall: {
    total_requests: number
    completed_requests: number
    total_uploads: number
    avg_uploads_per_request: number
    completion_rate: number
  }
}

function AnalyticsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[18px]">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-neutral-200 rounded-[18px] p-5 h-[120px]">
            <div className="h-3 w-24 bg-neutral-200 rounded mb-4"></div>
            <div className="h-8 w-16 bg-neutral-200 rounded"></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[18px]">
        <div className="bg-white border border-neutral-200 rounded-[18px] p-6 h-[280px]">
          <div className="h-3 w-40 bg-neutral-200 rounded mb-6"></div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-[18px] p-6 h-[280px]">
          <div className="h-3 w-32 bg-neutral-200 rounded mb-6"></div>
        </div>
      </div>
    </div>
  )
}

export function AnalyticsSection() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/analytics')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: AnalyticsData = await res.json()
        setAnalytics(data)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  if (loading) return <AnalyticsSkeleton />
  if (error || !analytics) return null
  if (analytics.overall.total_requests === 0) return null

  const data = analytics
  const maxTotal = Math.max(...data.completion_by_month.map(m => m.total), 1)
  const maxUploads = Math.max(...data.upload_activity.map(u => u.count), 1)
  const maxStatus = Math.max(...data.status_breakdown.map(s => s.count), 1)

  const statusColors: Record<string, string> = {
    pending: 'bg-warning-400',
    received: 'bg-primary-600',
    overdue: 'bg-danger-600',
    cancelled: 'bg-neutral-400',
  }

  const statusLabels: Record<string, string> = {
    pending: 'Pending',
    received: 'Received',
    overdue: 'Overdue',
    cancelled: 'Cancelled',
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-h3 font-serif text-neutral-900 mb-1">Analytics</h2>
        <p className="text-[13px] text-neutral-400">Your document collection performance</p>
      </div>

      {/* Row 1: Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[18px] mb-[18px]">
        <div className="bg-white border border-neutral-200 rounded-[18px] p-5 flex flex-col justify-between">
          <div className="text-[13px] text-neutral-400 uppercase tracking-wide">Completion Rate</div>
          <div className="mt-3">
            <span className="text-3xl font-semibold font-mono text-neutral-900">{data.overall.completion_rate}%</span>
          </div>
          <div className="text-[13px] text-neutral-500 mt-1">{data.overall.completed_requests} of {data.overall.total_requests} requests</div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-[18px] p-5 flex flex-col justify-between">
          <div className="text-[13px] text-neutral-400 uppercase tracking-wide">Avg Response Time</div>
          <div className="mt-3">
            <span className="text-3xl font-semibold font-mono text-neutral-900">{data.response_time.avg_days}</span>
            <span className="text-[13px] text-neutral-500 ml-1">days</span>
          </div>
          <div className="text-[13px] text-neutral-500 mt-1">{data.response_time.min_days}d min / {data.response_time.max_days}d max</div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-[18px] p-5 flex flex-col justify-between">
          <div className="text-[13px] text-neutral-400 uppercase tracking-wide">Total Uploads</div>
          <div className="mt-3">
            <span className="text-3xl font-semibold font-mono text-neutral-900">{data.overall.total_uploads}</span>
          </div>
          <div className="text-[13px] text-neutral-500 mt-1">across all requests</div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-[18px] p-5 flex flex-col justify-between">
          <div className="text-[13px] text-neutral-400 uppercase tracking-wide">Uploads / Request</div>
          <div className="mt-3">
            <span className="text-3xl font-semibold font-mono text-neutral-900">{data.overall.avg_uploads_per_request}</span>
          </div>
          <div className="text-[13px] text-neutral-500 mt-1">average per request</div>
        </div>
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[18px] mb-[18px]">
        {/* Completion by Month */}
        <div className="bg-white border border-neutral-200 rounded-[18px] p-6">
          <h3 className="text-body-md font-semibold text-neutral-900 mb-1">Completion Rate by Month</h3>
          <p className="text-[12px] text-neutral-400 mb-5">Received vs total requests over the last 6 months</p>
          {data.completion_by_month.length > 0 ? (
            <div className="flex items-end gap-2 h-40">
              {data.completion_by_month.map(m => {
                const recH = (m.received / maxTotal) * 120
                const pendH = ((m.total - m.received) / maxTotal) * 120
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col-reverse items-center gap-0">
                      <div className="w-full bg-primary-600 rounded-t" style={{ height: `${recH}px` }} title={`${m.received} received`}></div>
                      {m.total - m.received > 0 && <div className="w-full bg-neutral-200 rounded-t" style={{ height: `${pendH}px` }} title={`${m.total - m.received} not received`}></div>}
                    </div>
                    <span className="text-[9px] text-neutral-400 mt-1">{m.month.split(' ')[0]}</span>
                    <span className="text-[10px] text-neutral-600 font-mono">{m.rate}%</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-[13px] text-neutral-400">No data</div>
          )}
          {data.completion_by_month.length > 0 && (
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-neutral-100">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-primary-600"></div><span className="text-[11px] text-neutral-400">Received</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-neutral-200"></div><span className="text-[11px] text-neutral-400">Outstanding</span></div>
            </div>
          )}
        </div>

        {/* Upload Activity */}
        <div className="bg-white border border-neutral-200 rounded-[18px] p-6">
          <h3 className="text-body-md font-semibold text-neutral-900 mb-1">Upload Activity</h3>
          <p className="text-[12px] text-neutral-400 mb-5">Daily uploads over the last 30 days</p>
          <div className="flex items-end gap-px h-24">
            {data.upload_activity.map((d, i) => (
              <div key={i} className="flex-1 bg-primary-600 rounded-t-sm min-h-[2px] transition-all hover:bg-primary-500" style={{ height: `${Math.max(2, (d.count / maxUploads) * 80)}px` }} title={`${d.day}: ${d.count} uploads`}></div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-neutral-400">30 days ago</span>
            <span className="text-[10px] text-neutral-400">Today</span>
          </div>
        </div>
      </div>

      {/* Row 3: Status + Top Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[18px]">
        <div className="bg-white border border-neutral-200 rounded-[18px] p-6">
          <h3 className="text-body-md font-semibold text-neutral-900 mb-4">Status Breakdown</h3>
          <div className="space-y-3">
            {data.status_breakdown.map(s => (
              <div key={s.status} className="flex items-center gap-3">
                <span className="text-[12px] text-neutral-500 w-20 capitalize">{statusLabels[s.status] ?? s.status}</span>
                <div className="flex-1 h-5 bg-neutral-100 rounded-full overflow-hidden">
                  <div className={`h-full ${statusColors[s.status] ?? 'bg-neutral-400'} rounded-full`} style={{ width: `${(s.count / maxStatus) * 100}%` }}></div>
                </div>
                <span className="text-[13px] font-mono text-neutral-900 w-8 text-right">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-[18px] p-6">
          <h3 className="text-body-md font-semibold text-neutral-900 mb-4">Top Clients</h3>
          {data.top_clients.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide text-left pb-2">Client</th>
                  <th className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide text-right pb-2">Uploads</th>
                  <th className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide text-right pb-2">Requests</th>
                </tr>
              </thead>
              <tbody>
                {data.top_clients.map((c, i) => (
                  <tr key={i} className="border-b border-neutral-50 last:border-0">
                    <td className="text-[13px] text-neutral-900 py-2.5">{c.name}</td>
                    <td className="text-[13px] font-mono text-neutral-700 text-right py-2.5">{c.uploads}</td>
                    <td className="text-[13px] font-mono text-neutral-700 text-right py-2.5">{c.requests}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-[13px] text-neutral-400 py-6 text-center">No client data yet</div>
          )}
        </div>
      </div>
    </div>
  )
}
