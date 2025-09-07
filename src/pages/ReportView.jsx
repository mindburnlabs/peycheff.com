import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import SEO from '../components/SEO'

const ReportView = () => {
  const { token } = useParams()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const { data, error } = await supabase
          .from('audit_reports')
          .select('*')
          .eq('token', token)
          .eq('is_public', true)
          .single()
        if (error) throw error
        setReport(data)
      } catch (err) {
        setError('Report not found or not public.')
      } finally {
        setLoading(false)
      }
    }
    fetchReport()
  }, [token])

  return (
    <>
      <SEO title={report ? `Audit Report` : 'Audit Report'} description="Shareable audit preview" />
      <div className="px-6 py-24 min-h-screen">
        <div className="max-w-3xl mx-auto relative">
          {loading && (
            <div className="text-muted-foreground">Loading…</div>
          )}
          {error && (
            <div className="p-4 border border-destructive/20 bg-destructive/10 rounded-lg text-destructive">{error}</div>
          )}
          {report && (
            <div className="relative border border-border/30 rounded-xl p-6 bg-surface/40 overflow-hidden">
              <div className="absolute top-4 right-4 text-xs px-2 py-1 rounded bg-accent/10 text-accent">
                {report.watermark || 'Audit Preview'}
              </div>
              <h1 className="text-h2 mb-2">Audit preview</h1>
              <p className="text-muted-foreground mb-6">
                {report.goal ? `Goal: ${report.goal} • ` : ''}{report.stack ? `Stack: ${report.stack}` : ''}
              </p>
              <div className="space-y-4">
                {(report.issues || []).length === 0 && (
                  <p className="text-text-tertiary">No issues listed in this preview.</p>
                )}
                {(report.issues || []).map((issue, idx) => (
                  <div key={idx} className="border border-border/30 rounded-lg p-4">
                    <div className="font-semibold mb-1">{issue.title || `Issue #${idx + 1}`}</div>
                    <p className="text-text-tertiary">{issue.detail || ''}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/products" className="btn-primary hover-spring">Run your own audit</Link>
                <button
                  className="btn-ghost hover-spring"
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                >
                  Copy share link
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ReportView


