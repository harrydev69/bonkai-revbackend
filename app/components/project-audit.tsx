"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, Clock, Database, Zap, Settings, Bell } from "lucide-react"

export function ProjectAudit() {
  const auditResults = {
    // UI Components Status
    uiComponents: [
      { name: "Sidebar Navigation", status: "complete", functional: true },
      { name: "Top Navigation", status: "complete", functional: true },
      { name: "Mobile Navigation", status: "complete", functional: true },
      { name: "Dashboard Cards", status: "complete", functional: true },
      { name: "Chat Interface", status: "complete", functional: false, note: "Needs OpenAI API" },
      { name: "Settings Page", status: "complete", functional: true },
      { name: "Profile Dashboard", status: "complete", functional: false, note: "Needs wallet integration" },
      { name: "FAQ Page", status: "complete", functional: true },
    ],

    // Button Functionality
    buttons: [
      { name: "Connect Wallet", status: "mock", functional: false, note: "Mock implementation" },
      { name: "Disconnect Wallet", status: "mock", functional: false, note: "Mock implementation" },
      { name: "Take Tour", status: "complete", functional: true },
      { name: "Settings", status: "complete", functional: true },
      { name: "Theme Toggle", status: "complete", functional: true },
      { name: "Search", status: "ui-only", functional: false, note: "No search backend" },
      { name: "Alert Creation", status: "ui-only", functional: false, note: "No alert backend" },
      { name: "Export Functions", status: "ui-only", functional: false, note: "No export logic" },
      { name: "External Links", status: "complete", functional: true },
      { name: "Navigation Buttons", status: "complete", functional: true },
    ],

    // Data Integration Status
    dataIntegration: [
      { name: "BONK Price Data", status: "mock", source: "Static/Mock", needsApi: "CoinGecko API" },
      { name: "Market Data", status: "mock", source: "Static/Mock", needsApi: "CoinGecko/CoinMarketCap" },
      { name: "Social Sentiment", status: "mock", source: "Static/Mock", needsApi: "Twitter/Reddit APIs" },
      { name: "Whale Tracking", status: "mock", source: "Static/Mock", needsApi: "Blockchain APIs" },
      { name: "News Feed", status: "mock", source: "Static/Mock", needsApi: "News APIs" },
      { name: "Ecosystem Tokens", status: "mock", source: "Static/Mock", needsApi: "CoinGecko API" },
    ],

    // Backend Requirements
    backendNeeds: [
      { feature: "User Authentication", priority: "high", complexity: "medium" },
      { feature: "Wallet Integration", priority: "high", complexity: "high" },
      { feature: "Real-time Price Feeds", priority: "high", complexity: "medium" },
      { feature: "Alert System", priority: "high", complexity: "high" },
      { feature: "AI Chat Backend", priority: "medium", complexity: "high" },
      { feature: "Search Engine", priority: "medium", complexity: "high" },
      { feature: "User Settings Storage", priority: "medium", complexity: "low" },
      { feature: "Analytics Tracking", priority: "low", complexity: "medium" },
    ],

    // API Endpoints Needed
    apiEndpoints: [
      { endpoint: "/api/auth", method: "POST", purpose: "User authentication" },
      { endpoint: "/api/wallet", method: "GET/POST", purpose: "Wallet operations" },
      { endpoint: "/api/prices", method: "GET", purpose: "Real-time price data" },
      { endpoint: "/api/alerts", method: "GET/POST/DELETE", purpose: "Alert management" },
      { endpoint: "/api/chat", method: "POST", purpose: "AI chat responses", status: "exists" },
      { endpoint: "/api/search", method: "GET", purpose: "Meta search functionality" },
      { endpoint: "/api/sentiment", method: "GET", purpose: "Sentiment analysis data" },
      { endpoint: "/api/whales", method: "GET", purpose: "Whale movement tracking" },
    ],

    // Database Schema Needed
    databaseTables: [
      { table: "users", fields: ["id", "wallet_address", "settings", "created_at"] },
      { table: "alerts", fields: ["id", "user_id", "type", "condition", "value", "active"] },
      { table: "price_history", fields: ["id", "token", "price", "volume", "timestamp"] },
      { table: "social_data", fields: ["id", "platform", "mentions", "sentiment", "timestamp"] },
      { table: "whale_transactions", fields: ["id", "wallet", "amount", "type", "timestamp"] },
    ],

    // Third-party Integrations
    thirdPartyApis: [
      { name: "CoinGecko API", purpose: "Price & market data", status: "needed", cost: "Free tier available" },
      { name: "OpenAI API", purpose: "AI chat responses", status: "partial", cost: "Pay per use" },
      { name: "Twitter API", purpose: "Social sentiment", status: "needed", cost: "Paid" },
      { name: "Solana RPC", purpose: "Blockchain data", status: "needed", cost: "Free/Paid tiers" },
      { name: "WebSocket APIs", purpose: "Real-time updates", status: "needed", cost: "Varies" },
    ],

    // Security Considerations
    security: [
      { aspect: "API Key Management", status: "needed", priority: "critical" },
      { aspect: "Rate Limiting", status: "needed", priority: "high" },
      { aspect: "Input Validation", status: "partial", priority: "high" },
      { aspect: "CORS Configuration", status: "needed", priority: "medium" },
      { aspect: "Authentication Tokens", status: "needed", priority: "high" },
    ],
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "complete":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "partial":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case "needed":
      case "mock":
      case "ui-only":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "complete":
        return <Badge className="bg-green-500">Complete</Badge>
      case "partial":
        return <Badge className="bg-yellow-500">Partial</Badge>
      case "mock":
        return <Badge className="bg-orange-500">Mock Data</Badge>
      case "ui-only":
        return <Badge className="bg-blue-500">UI Only</Badge>
      case "needed":
        return <Badge className="bg-red-500">Needed</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">BONKai Project Audit</h1>
        <p className="text-muted-foreground">Comprehensive analysis of current functionality and backend readiness</p>
      </div>

      {/* Overall Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">UI Components</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {auditResults.uiComponents.filter((c) => c.status === "complete").length}/
              {auditResults.uiComponents.length}
            </div>
            <p className="text-xs text-muted-foreground">Complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Functional Buttons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {auditResults.buttons.filter((b) => b.functional).length}/{auditResults.buttons.length}
            </div>
            <p className="text-xs text-muted-foreground">Working</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Data Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">0/{auditResults.dataIntegration.length}</div>
            <p className="text-xs text-muted-foreground">Real APIs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Backend Ready</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">25%</div>
            <p className="text-xs text-muted-foreground">Estimated</p>
          </CardContent>
        </Card>
      </div>

      {/* UI Components Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            UI Components Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {auditResults.uiComponents.map((component, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(component.status)}
                  <div>
                    <span className="font-medium">{component.name}</span>
                    {component.note && <p className="text-sm text-muted-foreground">{component.note}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(component.status)}
                  {component.functional ? (
                    <Badge className="bg-green-500">Functional</Badge>
                  ) : (
                    <Badge className="bg-red-500">Non-Functional</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Button Functionality */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Button Functionality
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {auditResults.buttons.map((button, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(button.functional ? "complete" : "needed")}
                  <div>
                    <span className="font-medium">{button.name}</span>
                    {button.note && <p className="text-sm text-muted-foreground">{button.note}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(button.status)}
                  {button.functional ? (
                    <Badge className="bg-green-500">Working</Badge>
                  ) : (
                    <Badge className="bg-red-500">Needs Backend</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Data Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {auditResults.dataIntegration.map((data, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(data.status)}
                  <div>
                    <span className="font-medium">{data.name}</span>
                    <p className="text-sm text-muted-foreground">
                      Current: {data.source} → Needs: {data.needsApi}
                    </p>
                  </div>
                </div>
                {getStatusBadge(data.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Backend Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Backend Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {auditResults.backendNeeds.map((need, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="font-medium">{need.feature}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      need.priority === "high" ? "destructive" : need.priority === "medium" ? "default" : "secondary"
                    }
                  >
                    {need.priority} priority
                  </Badge>
                  <Badge variant="outline">{need.complexity} complexity</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Endpoints Needed */}
      <Card>
        <CardHeader>
          <CardTitle>Required API Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {auditResults.apiEndpoints.map((api, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(api.status || "needed")}
                  <div>
                    <span className="font-medium font-mono">{api.endpoint}</span>
                    <p className="text-sm text-muted-foreground">{api.purpose}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{api.method}</Badge>
                  {api.status === "exists" ? (
                    <Badge className="bg-green-500">Exists</Badge>
                  ) : (
                    <Badge className="bg-red-500">Needed</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Third-party APIs */}
      <Card>
        <CardHeader>
          <CardTitle>Third-party API Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {auditResults.thirdPartyApis.map((api, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(api.status)}
                  <div>
                    <span className="font-medium">{api.name}</span>
                    <p className="text-sm text-muted-foreground">{api.purpose}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(api.status)}
                  <Badge variant="outline">{api.cost}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary & Recommendations */}
      <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
        <CardHeader>
          <CardTitle className="text-orange-700 dark:text-orange-400">Summary & Next Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">✅ What's Working</h4>
              <ul className="text-sm space-y-1">
                <li>• Complete UI/UX implementation</li>
                <li>• Responsive design (mobile + desktop)</li>
                <li>• Navigation and routing</li>
                <li>• Theme switching</li>
                <li>• Settings persistence</li>
                <li>• Product tour functionality</li>
                <li>• Mock data visualization</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2">❌ What Needs Backend</h4>
              <ul className="text-sm space-y-1">
                <li>• Real-time price data</li>
                <li>• Wallet integration</li>
                <li>• Alert system</li>
                <li>• AI chat responses</li>
                <li>• Search functionality</li>
                <li>• User authentication</li>
                <li>• Data persistence</li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-2">🚀 Immediate Next Steps for Backend Integration:</h4>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Set up database schema (users, alerts, price_history)</li>
              <li>Implement CoinGecko API integration for real price data</li>
              <li>Add Solana wallet connection (Phantom, Solflare)</li>
              <li>Create alert system with WebSocket notifications</li>
              <li>Implement user authentication and session management</li>
              <li>Add rate limiting and API key management</li>
              <li>Set up real-time data feeds and caching</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

