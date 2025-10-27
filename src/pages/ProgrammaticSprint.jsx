import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import SEO from '../components/SEO'

const toTitle = (s) => (s || '').replace(/-/g, ' ').replace(/\s+/g, ' ').trim().replace(/\b\w/g, c => c.toUpperCase())

const ProgrammaticSprint = () => {
  const { role, stack, niche } = useParams()
  const roleT = toTitle(role)
  const stackT = toTitle(stack)
  const nicheT = toTitle(niche)

  const [goal, setGoal] = useState(`30-day sprint for ${roleT} in ${nicheT}`)
  const [tech, setTech] = useState(stackT)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setGoal(`30-day sprint for ${roleT} in ${nicheT}`)
    setTech(stackT)
  }, [roleT, stackT, nicheT])

  const runPreview = async () => {
    try {
      setLoading(true)
      setPreview(null)
      // Use production sprint generator with preview mode
      const res = await fetch('/api/generate-sprint-production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          goal, 
          stack: tech,
          email: 'preview@demo.com',
          purchaseId: null // This triggers preview mode
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Preview failed')
      setPreview(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { runPreview() }, [])

  const startCheckout = async () => {
    const { createCheckoutSession } = await import('../lib/stripe')
    await createCheckoutSession('PACK_30DAY', { context: { goal, stack: tech } }, 'AUDIT_PRO')
  }

  const pageTitle = `30-Day Sprint for ${roleT} using ${stackT} in ${nicheT}`
  const pageDesc = `Generate a personalized, 30‑day operating cadence for a ${roleT} in ${nicheT} using ${stackT}. Preview Week‑1, then generate your plan.`

  return (
    <>
      <SEO title={pageTitle} description={pageDesc} />
      <div className="px-6 py-24 min-h-screen">
        <div className="max-w-container mx-auto">
          <h1 className="text-h1 mb-6">{pageTitle}</h1>
          <p className="text-text-tertiary mb-8">{pageDesc}</p>

          <div className="grid md:grid-cols-3 gap-3 max-w-3xl mb-6">
            <input className="bg-input border border-border rounded-lg px-4 py-3" value={goal} onChange={(e)=>setGoal(e.target.value)} />
            <input className="bg-input border border-border rounded-lg px-4 py-3" value={tech} onChange={(e)=>setTech(e.target.value)} />
            <button className="btn-primary" onClick={runPreview} disabled={loading}>{loading?'Generating…':'Refresh preview'}</button>
          </div>

          {preview && (
            <div className="border border-border/30 rounded-xl p-6 bg-surface/40">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-h3">Week‑1 outline</h2>
                <div className="text-xs px-2 py-1 rounded bg-accent/10 text-accent">{preview.watermark}</div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {preview.week1?.map((d,i)=> (
                  <div key={i} className="rounded-lg border border-border/30 p-4 bg-background/40">
                    <div className="font-semibold mb-2">{d.name}</div>
                    <ul className="list-disc pl-5 space-y-1 text-text-tertiary">
                      {d.bullets.map((b,j)=>(<li key={j}>{b}</li>))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={startCheckout} className="btn-primary">Generate my plan</button>
                <button onClick={runPreview} className="btn-ghost" disabled={loading}>{loading?'Refreshing…':'Refresh'}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ProgrammaticSprint


