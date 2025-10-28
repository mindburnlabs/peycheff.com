'use client'

import React, { useState, useEffect } from 'react'
import { Shield, AlertTriangle, CheckCircle, XCircle, Activity, Users, Globe, Cpu } from 'lucide-react'

interface SecurityStats {
  totalEvents: number
  eventsByType: Record<string, number>
  blockedIPs: number
  rateLimitEntries: number
  recentActivity: Array<{
    id: string
    type: string
    timestamp: string
    ip: string
  }>
}

interface SystemInfo {
  uptime: number
  memoryUsage: NodeJS.MemoryUsage
  platform: string
  nodeVersion: string
  environment: string
  timestamp: string
}

interface SecurityHealth {
  status: 'healthy' | 'warning' | 'critical'
  issues: string[]
  recommendations: string[]
  metrics: {
    blockedIPs: number
    totalViolations: number
    averageReputationScore: number
    highRiskIPs: number
  }
}

export default function SecurityDashboard() {
  const [stats, setStats] = useState<SecurityStats | null>(null)
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [health, setHealth] = useState<SecurityHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState<string>('')
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    // Check for stored API key
    const storedKey = localStorage.getItem('security-api-key')
    if (storedKey) {
      setApiKey(storedKey)
      setAuthenticated(true)
      fetchData(storedKey)
    }
  }, [])

  const fetchData = async (key: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/security/stats', {
        headers: {
          'X-API-Key': key,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status}`)
      }

      const data = await response.json()
      setStats(data.data.security)
      setSystemInfo(data.data.system)

      // Get health check
      const healthResponse = await fetch('/api/security/health', {
        headers: {
          'X-API-Key': key,
          'Content-Type': 'application/json'
        }
      })

      if (healthResponse.ok) {
        const healthData = await healthResponse.json()
        setHealth(healthData.data)
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch security data')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (apiKey.trim()) {
      localStorage.setItem('security-api-key', apiKey)
      setAuthenticated(true)
      fetchData(apiKey)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('security-api-key')
    setApiKey('')
    setAuthenticated(false)
    setStats(null)
    setSystemInfo(null)
    setHealth(null)
  }

  const triggerCleanup = async () => {
    try {
      const response = await fetch('/api/security/stats', {
        method: 'POST',
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'cleanup' })
      })

      if (response.ok) {
        fetchData(apiKey) // Refresh data
      }
    } catch (err) {
      setError('Failed to trigger cleanup')
    }
  }

  const sendTestAlert = async () => {
    try {
      const response = await fetch('/api/security/stats', {
        method: 'POST',
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'test-alert' })
      })

      if (response.ok) {
        fetchData(apiKey) // Refresh data
      }
    } catch (err) {
      setError('Failed to send test alert')
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-slate-700">
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 bg-blue-500/10 rounded-full">
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white text-center mb-2">Security Dashboard</h1>
          <p className="text-slate-400 text-center mb-6">Enter your security API key to continue</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-slate-300 mb-2">
                Security API Key
              </label>
              <input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your API key"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading security data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md">
          <div className="flex items-center mb-4">
            <XCircle className="w-6 h-6 text-red-500 mr-2" />
            <h3 className="text-lg font-semibold text-red-400">Error</h3>
          </div>
          <p className="text-slate-300 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null)
              fetchData(apiKey)
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500'
      case 'warning': return 'text-yellow-500'
      case 'critical': return 'text-red-500'
      default: return 'text-slate-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5" />
      case 'warning': return <AlertTriangle className="w-5 h-5" />
      case 'critical': return <XCircle className="w-5 h-5" />
      default: return <Activity className="w-5 h-5" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="p-3 bg-blue-500/10 rounded-full mr-4">
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Security Dashboard</h1>
              <p className="text-slate-400">Real-time security monitoring and analysis</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={sendTestAlert}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Test Alert
            </button>
            <button
              onClick={triggerCleanup}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Cleanup Data
            </button>
            <button
              onClick={handleLogout}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>

        {/* System Health */}
        {health && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <div className={`bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border ${health.status === 'critical' ? 'border-red-500/20' : health.status === 'warning' ? 'border-yellow-500/20' : 'border-green-500/20'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">System Health</h3>
                <div className={getStatusColor(health.status)}>
                  {getStatusIcon(health.status)}
                </div>
              </div>
              <div className="text-2xl font-bold text-white capitalize mb-2">{health.status}</div>
              <div className="text-sm text-slate-400">
                {health.issues.length} issues • {health.recommendations.length} recommendations
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Blocked IPs</h3>
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <Globe className="w-5 h-5 text-red-500" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-2">{health.metrics.blockedIPs}</div>
              <div className="text-sm text-slate-400">Currently blocked</div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Total Violations</h3>
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-2">{health.metrics.totalViolations}</div>
              <div className="text-sm text-slate-400">All time</div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">High Risk IPs</h3>
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Users className="w-5 h-5 text-orange-500" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-2">{health.metrics.highRiskIPs}</div>
              <div className="text-sm text-slate-400">Reputation score ≥ 5</div>
            </div>
          </div>
        )}

        {/* Security Stats */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Security Events</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Total Events</span>
                  <span className="text-white font-medium">{stats.totalEvents}</span>
                </div>
                {Object.entries(stats.eventsByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-slate-400 capitalize">{type.replace(/_/g, ' ')}</span>
                    <span className="text-white font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">System Information</h3>
              {systemInfo && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Platform</span>
                    <span className="text-white font-medium">{systemInfo.platform}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Node Version</span>
                    <span className="text-white font-medium">{systemInfo.nodeVersion}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Environment</span>
                    <span className="text-white font-medium capitalize">{systemInfo.environment}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Uptime</span>
                    <span className="text-white font-medium">{Math.floor(systemInfo.uptime / 3600)}h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Memory Usage</span>
                    <span className="text-white font-medium">{(systemInfo.memoryUsage as any)?.used ? Math.round((systemInfo.memoryUsage as any).used / 1024 / 1024) : 'N/A'}MB</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {stats?.recentActivity && stats.recentActivity.length > 0 && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Security Activity</h3>
            <div className="space-y-2">
              {stats.recentActivity.slice(0, 10).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center">
                    <Activity className="w-4 h-4 text-blue-500 mr-3" />
                    <div>
                      <div className="text-white font-medium capitalize">
                        {event.type.replace(/_/g, ' ')}
                      </div>
                      <div className="text-sm text-slate-400">
                        {event.ip} • {new Date(event.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Issues and Recommendations */}
        {health && (health.issues.length > 0 || health.recommendations.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {health.issues.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center">
                  <XCircle className="w-5 h-5 mr-2" />
                  Security Issues
                </h3>
                <ul className="space-y-2">
                  {health.issues.map((issue, index) => (
                    <li key={index} className="text-slate-300 flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {health.recommendations.length > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Recommendations
                </h3>
                <ul className="space-y-2">
                  {health.recommendations.map((rec, index) => (
                    <li key={index} className="text-slate-300 flex items-start">
                      <span className="text-yellow-500 mr-2">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}