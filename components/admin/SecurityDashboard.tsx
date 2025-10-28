'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Users,
  Globe,
  Timer,
  RefreshCw,
  Trash2,
  TestTube
} from 'lucide-react'

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

interface SecurityData {
  security: SecurityStats
  system: SystemInfo
  request: {
    ip: string
    userAgent?: string
    referer?: string
    url: string
    method: string
  }
  generated_at: string
}

export function SecurityDashboard() {
  const [data, setData] = useState<SecurityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/security/stats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SECURITY_API_KEY || 'demo-key'}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      if (result.success) {
        setData(result.data)
      } else {
        throw new Error(result.error || 'Failed to fetch security data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch security data')
    } finally {
      setLoading(false)
    }
  }

  const executeAction = async (action: string) => {
    try {
      setActionLoading(action)
      setError(null)

      const response = await fetch('/api/security/stats', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SECURITY_API_KEY || 'demo-key'}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      if (result.success) {
        // Refresh data after successful action
        await fetchData()
      } else {
        throw new Error(result.error || 'Action failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setActionLoading(null)
    }
  }

  useEffect(() => {
    fetchData()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    return `${hours}h ${minutes}m ${secs}s`
  }

  const formatMemory = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB'
  }

  const getEventSeverity = (type: string) => {
    const criticalEvents = ['blocked_ip', 'rate_limit_exceeded']
    const warningEvents = ['suspicious_request', 'invalid_webhook_signature']

    if (criticalEvents.includes(type)) return 'critical'
    if (warningEvents.includes(type)) return 'warning'
    return 'info'
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'rate_limit_exceeded':
      case 'blocked_ip':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'suspicious_request':
      case 'invalid_webhook_signature':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <Shield className="h-4 w-4 text-blue-500" />
    }
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading security data...</p>
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Error Loading Security Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchData} variant="outline" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time security monitoring and threat detection
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => executeAction('test-alert')}
            disabled={actionLoading === 'test-alert'}
            variant="outline"
            size="sm"
          >
            <TestTube className="h-4 w-4 mr-2" />
            {actionLoading === 'test-alert' ? 'Sending...' : 'Test Alert'}
          </Button>
          <Button
            onClick={() => executeAction('cleanup')}
            disabled={actionLoading === 'cleanup'}
            variant="outline"
            size="sm"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {actionLoading === 'cleanup' ? 'Cleaning...' : 'Cleanup'}
          </Button>
          <Button
            onClick={fetchData}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {data && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Security Events</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.security.totalEvents}</div>
                <p className="text-xs text-muted-foreground">
                  All-time security events
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Blocked IPs</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{data.security.blockedIPs}</div>
                <p className="text-xs text-muted-foreground">
                  Currently blocked addresses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rate Limit Entries</CardTitle>
                <Timer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.security.rateLimitEntries}</div>
                <p className="text-xs text-muted-foreground">
                  Active rate limits
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatUptime(data.system.uptime)}</div>
                <p className="text-xs text-muted-foreground">
                  Server running time
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Event Types Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Events by Type</CardTitle>
                <CardDescription>
                  Breakdown of security events detected
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(data.security.eventsByType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getEventIcon(type)}
                        <span className="text-sm font-medium capitalize">
                          {type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <Badge
                        variant={
                          getEventSeverity(type) === 'critical' ? 'destructive' :
                          getEventSeverity(type) === 'warning' ? 'secondary' : 'default'
                        }
                      >
                        {count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest security events and activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.security.recentActivity.slice(0, 10).map((event) => (
                    <div key={event.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {getEventIcon(event.type)}
                        <div>
                          <div className="font-medium capitalize">
                            {event.type.replace(/_/g, ' ')}
                          </div>
                          <div className="text-muted-foreground">
                            IP: {event.ip}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>
                Current system status and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Platform</div>
                  <div className="font-semibold">{data.system.platform}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Node Version</div>
                  <div className="font-semibold">{data.system.nodeVersion}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Environment</div>
                  <Badge variant={data.system.environment === 'production' ? 'default' : 'secondary'}>
                    {data.system.environment}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Memory Usage</div>
                  <div className="font-semibold">{(data.system.memoryUsage as any)?.used ? formatMemory((data.system.memoryUsage as any).used) : 'N/A'} / {(data.system.memoryUsage as any)?.total ? formatMemory((data.system.memoryUsage as any).total) : 'N/A'}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}