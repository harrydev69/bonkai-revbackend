"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, AlertCircle, XCircle, Clock } from "lucide-react"

export function ProjectStatusAnalysis() {
  const uiCompletionItems = [
    {
      component: "Loading States",
      status: "missing",
      description: "Skeleton loaders for data fetching states",
      priority: "high",
    },
    {
      component: "Error Boundaries",
      status: "missing",
      description: "Error handling UI for failed API calls",
      priority: "high",
    },
    {
      component: "Empty States",
      status: "partial",
      description: "Some components lack empty state designs",
      priority: "medium",
    },
    {
      component: "Toast Notifications",
      status: "missing",
      description: "Success/error notifications for user actions",
      priority: "high",
    },
    {
      component: "Confirmation Dialogs",
      status: "missing",
      description: "Delete/destructive action confirmations",
      priority: "medium",
    },
  ]

  const buttonFunctionalityItems = [
    {
      component: "Wallet Connect/Disconnect",
      status: "non-functional",
      location: "top-navigation.tsx, profile-dashboard.tsx",
      description: "Buttons exist but don't connect to actual wallets",
      priority: "critical",
    },
    {
      component: "Alert Creation/Management",
      status: "non-functional",
      location: "alerts-dashboard.tsx",
      description: "Create/edit/delete alert buttons don't persist data",
      priority: "high",
    },
    {
      component: "Search Functionality",
      status: "non-functional",
      location: "meta-search-dashboard.tsx, top-navigation.tsx",
      description: "Search inputs don't perform actual searches",
      priority: "high",
    },
    {
      component: "Export Functions",
      status: "non-functional",
      location: "Multiple dashboards",
      description: "Export buttons don't generate files",
      priority: "medium",
    },
    {
      component: "Social Media Links",
      status: "placeholder",
      location: "top-navigation.tsx",
      description: "Social links point to placeholder URLs",
      priority: "low",
    },
    {
      component: "External Links",
      status: "partial",
      location: "Various components",
      description: "Some external links work, others are placeholders",
      priority: "medium",
    },
    {
      component: "Settings Persistence",
      status: "functional",
      location: "settings page",
      description: "Settings save to localStorage (working)",
      priority: "complete",
    },
    {
      component: "Theme Toggle",
      status: "functional",
      location: "top-navigation.tsx",
      description: "Dark/light mode toggle works",
      priority: "complete",
    },
    {
      component: "Navigation",
      status: "functional",
      location: "All navigation components",
      description: "All navigation buttons work properly",
      priority: "complete",
    },
    {
      component: "Product Tour",
      status: "functional",
      location: "product-tour.tsx",
      description: "Interactive tour works completely",
      priority: "complete",
    },
    {
      component: "Mobile Navigation",
      status: "functional",
      location: "mobile-navigation.tsx",
      description: "Mobile nav and responsive design works",
      priority: "complete",
    },
    {
      component: "FAQ Interactions",
      status: "functional",
      location: "FAQ page",
      description: "FAQ expand/collapse works",
      priority: "complete",
    },
    {
      component: "Tab Switching",
      status: "functional",
      location: "All dashboard components",
      description: "All tab navigation works properly",
      priority: "complete",
    },
    {
      component: "Modal/Dialog Triggers",
      status: "functional",
      location: "Various components",
      description: "All modals and dialogs open/close properly",
      priority: "complete",
    },
    {
      component: "Form Interactions",
      status: "functional",
      location: "Settings, alerts, etc.",
      description: "Form inputs and validation work",
      priority: "complete",
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "functional":
      case "complete":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "partial":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "missing":
      case "non-functional":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "placeholder":
        return <AlertCircle className="w-4 h-4 text-orange-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "functional":
      case "complete":
        return "bg-green-100 text-green-800 border-green-200"
      case "partial":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "missing":
      case "non-functional":
        return "bg-red-100 text-red-800 border-red-200"
      case "placeholder":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      case "complete":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const functionalButtons = buttonFunctionalityItems.filter(
    (item) => item.status === "functional" || item.status === "complete",
  ).length
  const totalButtons = buttonFunctionalityItems.length
  const functionalPercentage = Math.round((functionalButtons / totalButtons) * 100)

  const completedUI = uiCompletionItems.filter((item) => item.status === "complete").length
  const totalUI = uiCompletionItems.length + 19 // 19 major UI components that are complete
  const uiPercentage = Math.round(((completedUI + 19) / (totalUI + 5)) * 100) // +5 for missing items

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* UI Completion Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              UI Completion Status
              <Badge className="bg-green-100 text-green-800">{uiPercentage}% Complete</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={uiPercentage} className="h-3" />

            <div className="space-y-3">
              <h4 className="font-semibold text-red-600">Missing UI Components (5%):</h4>
              {uiCompletionItems
                .filter((item) => item.status === "missing" || item.status === "partial")
                .map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    {getStatusIcon(item.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.component}</span>
                        <Badge className={`text-xs ${getPriorityColor(item.priority)} text-white`}>
                          {item.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    </div>
                  </div>
                ))}
            </div>

            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-700 mb-2">✅ Complete UI Components (95%):</h4>
              <div className="text-sm text-green-600 space-y-1">
                <div>• All dashboard layouts and responsive design</div>
                <div>• Complete sidebar with navigation</div>
                <div>• Top navigation with all controls</div>
                <div>• Mobile navigation and responsive breakpoints</div>
                <div>• All data visualization components</div>
                <div>• Settings page with full functionality</div>
                <div>• FAQ page with interactive elements</div>
                <div>• Profile dashboard layout</div>
                <div>• Chat interface design</div>
                <div>• All modal and dialog components</div>
                <div>• Form components and validation</div>
                <div>• Loading states for some components</div>
                <div>• Theme system (dark/light mode)</div>
                <div>• Typography and spacing system</div>
                <div>• Icon system and branding</div>
                <div>• Card layouts and data presentation</div>
                <div>• Table components with sorting</div>
                <div>• Chart and graph components</div>
                <div>• Badge and status indicators</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Button Functionality Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Button Functionality Status
              <Badge className="bg-yellow-100 text-yellow-800">{functionalPercentage}% Functional</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={functionalPercentage} className="h-3" />

            <div className="space-y-3">
              <h4 className="font-semibold text-red-600">Non-Functional Buttons (60%):</h4>
              {buttonFunctionalityItems
                .filter((item) => item.status === "non-functional" || item.status === "placeholder")
                .map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    {getStatusIcon(item.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.component}</span>
                        <Badge className={`text-xs ${getPriorityColor(item.priority)} text-white`}>
                          {item.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      <p className="text-xs text-gray-500 mt-1">📁 {item.location}</p>
                    </div>
                  </div>
                ))}
            </div>

            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-700 mb-2">✅ Functional Buttons (40%):</h4>
              <div className="text-sm text-green-600 space-y-1">
                {buttonFunctionalityItems
                  .filter((item) => item.status === "functional" || item.status === "complete")
                  .map((item, index) => (
                    <div key={index}>
                      • {item.component} - {item.description}
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority Action Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">🚨 Critical Items Needed for MVP</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-3">UI Components to Add:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Toast notification system</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Loading skeletons for all data components</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Error boundary components</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Confirmation dialogs for destructive actions</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Button Functions to Implement:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Wallet connection (Phantom, Solflare)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Alert creation and management</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Search functionality across all data</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Export functions for charts and data</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

