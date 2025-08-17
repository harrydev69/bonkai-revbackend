"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Bell,
  Plus,
  TrendingUp,
  Volume2,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2,
} from "lucide-react"
import { LoadingSkeleton } from "./loading-skeleton"
// import { EmptyState } from "./empty-state" // removed to avoid required `type` prop mismatch
import { ConfirmationDialog } from "./confirmation-dialog"
import { dataService } from "../services/data-service"
import { toast } from "@/hooks/use-toast"
import type { BonkData } from "../dashboard/page"

interface Alert {
  id: string
  name: string
  type: "price" | "volume" | "social" | "news"
  condition: string
  value: string
  isActive: boolean
  triggered: boolean
  lastTriggered?: string
  priority: "low" | "medium" | "high"
  createdAt: string
}

export interface AlertsDashboardProps {
  bonkData: BonkData
}

export const AlertsDashboard: React.FC<AlertsDashboardProps> = ({ bonkData: _bonkData }) => {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const [newAlert, setNewAlert] = useState<{
    name: string
    type: Alert["type"]
    condition: string
    value: string
    priority: Alert["priority"]
  }>({
    name: "",
    type: "price",
    condition: "",
    value: "",
    priority: "medium",
  })

  useEffect(() => {
    loadAlerts()
  }, [])

  const loadAlerts = async () => {
    setLoading(true)
    try {
      const storedAlerts = dataService.getStoredAlerts()
      setAlerts(storedAlerts)
    } catch (error) {
      console.error("Failed to load alerts:", error)
      toast({
        title: "Error",
        description: "Failed to load alerts",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleAlert = async (id: string) => {
    try {
      const alert = alerts.find((a) => a.id === id)
      if (!alert) return

      const updatedAlert = await dataService.updateAlert(id, { isActive: !alert.isActive })
      setAlerts((prev) => prev.map((a) => (a.id === id ? updatedAlert : a)))

      toast({
        title: updatedAlert.isActive ? "Alert Activated" : "Alert Deactivated",
        description: `${updatedAlert.name} has been ${updatedAlert.isActive ? "activated" : "deactivated"}`,
      })
    } catch (error) {
      console.error("Failed to toggle alert:", error)
      toast({
        title: "Error",
        description: "Failed to update alert",
        variant: "destructive",
      })
    }
  }

  const deleteAlert = async (id: string) => {
    try {
      await dataService.deleteAlert(id)
      setAlerts((prev) => prev.filter((a) => a.id !== id))
      setDeleteConfirm(null)

      toast({
        title: "Alert Deleted",
        description: "Alert has been successfully deleted",
      })
    } catch (error) {
      console.error("Failed to delete alert:", error)
      toast({
        title: "Error",
        description: "Failed to delete alert",
        variant: "destructive",
      })
    }
  }

  const createAlert = async () => {
    if (!newAlert.name || !newAlert.condition || !newAlert.value) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setCreating(true)
    try {
      const alert = await dataService.createAlert(newAlert)
      setAlerts((prev) => [alert, ...prev])
      setNewAlert({ name: "", type: "price", condition: "", value: "", priority: "medium" })

      // use default variant (allowed)
      toast({
        title: "Alert Created",
        description: `${alert.name} has been created successfully`,
      })
    } catch (error) {
      console.error("Failed to create alert:", error)
      toast({
        title: "Error",
        description: "Failed to create alert",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const exportAlerts = async () => {
    try {
      await dataService.exportData("json", alerts, "bonkai-alerts")
    } catch (error) {
      console.error("Failed to export alerts:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export alerts",
        variant: "destructive",
      })
    }
  }

  const getAlertIcon = (type: Alert["type"]) => {
    switch (type) {
      case "price":
        return TrendingUp
      case "volume":
        return Volume2
      case "social":
        return Users
      case "news":
        return Bell
      default:
        return Bell
    }
  }

  const getPriorityColor = (priority: Alert["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const activeAlerts = alerts.filter((alert) => alert.isActive)
  const triggeredAlerts = alerts.filter((alert) => alert.triggered)

  return (
    <div className="flex-1 overflow-y-auto h-full">
      <div className="w-full px-8 py-8 min-h-full">
        {/* Header */}
        <div className="flex items-center gap-6 mb-12">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Bell className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200">Smart Alerts</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Custom BONK alerts for price, volume, and social activity
            </p>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <Card className="border-orange-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <Bell className="w-10 h-10 text-orange-500" />
                <Badge className="bg-orange-500 text-white text-sm px-3 py-1">Total</Badge>
              </div>
              <div className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">{alerts.length}</div>
              <div className="text-base text-gray-600 dark:text-gray-400 mb-2">Total Alerts</div>
              <div className="text-base font-medium text-orange-500">All configured</div>
            </CardContent>
          </Card>

          <Card className="border-orange-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
                <Badge className="bg-green-500 text-white text-sm px-3 py-1">Active</Badge>
              </div>
              <div className="text-3xl font-bold text-green-500 mb-2">{activeAlerts.length}</div>
              <div className="text-base text-gray-600 dark:text-gray-400 mb-2">Active Alerts</div>
              <div className="text-base font-medium text-green-500">Monitoring</div>
            </CardContent>
          </Card>

          <Card className="border-orange-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <AlertTriangle className="w-10 h-10 text-red-500" />
                <Badge className="bg-red-500 text-white text-sm px-3 py-1">Triggered</Badge>
              </div>
              <div className="text-3xl font-bold text-red-500 mb-2">{triggeredAlerts.length}</div>
              <div className="text-base text-gray-600 dark:text-gray-400 mb-2">Triggered Today</div>
              <div className="text-base font-medium text-red-500">Needs attention</div>
            </CardContent>
          </Card>

          <Card className="border-orange-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-10 h-10 text-blue-500" />
                <Badge className="bg-blue-500 text-white text-sm px-3 py-1">Weekly</Badge>
              </div>
              <div className="text-3xl font-bold text-blue-500 mb-2">12</div>
              <div className="text-base text-gray-600 dark:text-gray-400 mb-2">This Week</div>
              <div className="text-base font-medium text-blue-500">Total triggers</div>
            </CardContent>
          </Card>
        </div>

        {/* Main */}
        <Card className="border-orange-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="border-b border-orange-200/50 dark:border-gray-700/50 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-md">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Alert Management</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Configure and manage your BONK price and activity alerts
                  </p>
                </div>
              </div>
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-base px-6 py-2">
                <Plus className="w-4 h-4 mr-2" />
                New Alert
              </Button>
            </div>
          </CardHeader>

          {/* Content area */}
          <div className="h-[600px] flex flex-col">
            <div className="flex-1 overflow-y-auto p-6">
              <Tabs defaultValue="active" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8 h-12">
                  <TabsTrigger value="active" className="text-base">
                    Active Alerts ({activeAlerts.length})
                  </TabsTrigger>
                  <TabsTrigger value="create" className="text-base">
                    Create Alert
                  </TabsTrigger>
                  <TabsTrigger value="history" className="text-base">
                    Alert History
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {loading ? (
                      <>
                        <LoadingSkeleton />
                        <LoadingSkeleton />
                        <LoadingSkeleton />
                      </>
                    ) : alerts.length === 0 ? (
                      // Inline empty state
                      <div className="col-span-full">
                        <div className="flex flex-col items-center justify-center border rounded-xl py-12 text-center">
                          <Bell className="w-10 h-10 text-gray-400 mb-3" />
                          <h3 className="text-xl font-semibold mb-1">No alerts created</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Create your first alert to start monitoring BONK.
                          </p>
                        </div>
                      </div>
                    ) : (
                      alerts.map((alert) => {
                        const AlertIcon = getAlertIcon(alert.type)
                        return (
                          <Card
                            key={alert.id}
                            className={`border-orange-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 ${
                              alert.triggered ? "ring-2 ring-red-500" : ""
                            }`}
                          >
                            <CardHeader className="pb-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                  <div
                                    className={`w-12 h-12 rounded-xl ${getPriorityColor(
                                      alert.priority
                                    )} flex items-center justify-center shadow-sm`}
                                  >
                                    <AlertIcon className="w-6 h-6 text-white" />
                                  </div>
                                  <div>
                                    <CardTitle className="text-xl">{alert.name}</CardTitle>
                                    <Badge variant="outline" className="text-sm mt-2 capitalize">
                                      {alert.type}
                                    </Badge>
                                  </div>
                                </div>
                                <Switch checked={alert.isActive} onCheckedChange={() => toggleAlert(alert.id)} />
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                                  <p className="text-base font-medium text-gray-800 dark:text-gray-200">Condition</p>
                                  <p className="text-base text-gray-600 dark:text-gray-400">{alert.condition}</p>
                                </div>

                                {alert.triggered && (
                                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-700">
                                    <div className="flex items-center gap-3">
                                      <AlertTriangle className="w-5 h-5 text-red-500" />
                                      <span className="text-base font-medium text-red-700 dark:text-red-400">
                                        Alert Triggered
                                      </span>
                                    </div>
                                    {alert.lastTriggered && (
                                      <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                                        {alert.lastTriggered}
                                      </p>
                                    )}
                                  </div>
                                )}

                                <div className="flex gap-3">
                                  <Button size="sm" variant="outline" className="flex-1 bg-transparent h-10">
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 bg-transparent text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 h-10"
                                    onClick={() => setDeleteConfirm(alert.id)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="create" className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                          Alert Name
                        </label>
                        <Input
                          placeholder="e.g., BONK Price Alert"
                          value={newAlert.name}
                          onChange={(e) => setNewAlert({ ...newAlert, name: e.target.value })}
                          className="border-orange-300 focus:border-orange-500 h-12 text-base"
                        />
                      </div>

                      <div>
                        <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                          Alert Type
                        </label>
                        <Select
                          value={newAlert.type}
                          onValueChange={(value: Alert["type"]) => setNewAlert({ ...newAlert, type: value })}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="price">Price Alert</SelectItem>
                            <SelectItem value="volume">Volume Alert</SelectItem>
                            <SelectItem value="social">Social Alert</SelectItem>
                            <SelectItem value="news">News Alert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                          Priority
                        </label>
                        <Select
                          value={newAlert.priority}
                          onValueChange={(value: Alert["priority"]) => setNewAlert({ ...newAlert, priority: value })}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low Priority</SelectItem>
                            <SelectItem value="medium">Medium Priority</SelectItem>
                            <SelectItem value="high">High Priority</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                          Condition
                        </label>
                        <Input
                          placeholder="e.g., price > $0.00005"
                          value={newAlert.condition}
                          onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value })}
                          className="border-orange-300 focus:border-orange-500 h-12 text-base"
                        />
                      </div>

                      <div>
                        <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                          Trigger Value
                        </label>
                        <Input
                          placeholder="e.g., 0.00005"
                          value={newAlert.value}
                          onChange={(e) => setNewAlert({ ...newAlert, value: e.target.value })}
                          className="border-orange-300 focus:border-orange-500 h-12 text-base"
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={createAlert}
                          disabled={creating}
                          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white h-12 text-base"
                        >
                          <Plus className="w-5 h-5 mr-2" />
                          {creating ? "Creating..." : "Create Alert"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() =>
                            setNewAlert({ name: "", type: "price", condition: "", value: "", priority: "medium" })
                          }
                          className="h-12 text-base"
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="space-y-8">
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                    <h3 className="text-2xl font-semibold mb-4">Alert History</h3>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                      View your complete alert history and performance analytics.
                    </p>
                    <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-base px-8 py-3">
                      View Full History
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </Card>
      </div>

      <ConfirmationDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirm(null)
        }}
        onConfirm={() => deleteAlert(deleteConfirm!)}
        title="Delete Alert"
        description="Are you sure you want to delete this alert? This action cannot be undone."
      />
    </div>
  )
}
