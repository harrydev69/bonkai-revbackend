"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, ExternalLink } from "lucide-react"

interface Event {
  id: string
  title: string
  date: string
  time: string
  type: "conference" | "webinar" | "launch" | "update" | "community"
  location?: string
  description: string
  attendees?: number
  link?: string
}

export function CalendarDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date())

  const events: Event[] = [
    {
      id: "1",
      title: "BONK Community AMA",
      date: "2024-01-15",
      time: "18:00 UTC",
      type: "community",
      location: "Discord",
      description: "Monthly community AMA with the BONK team discussing recent developments and roadmap updates.",
      attendees: 2500,
      link: "https://discord.gg/bonk",
    },
    {
      id: "2",
      title: "Solana Breakpoint 2024",
      date: "2024-01-20",
      time: "09:00 UTC",
      type: "conference",
      location: "Singapore",
      description: "Annual Solana conference featuring ecosystem updates, developer workshops, and networking.",
      attendees: 5000,
      link: "https://solana.com/breakpoint",
    },
    {
      id: "3",
      title: "Jupiter DEX Integration",
      date: "2024-01-25",
      time: "14:00 UTC",
      type: "launch",
      description: "Launch of enhanced BONK trading features on Jupiter DEX with improved liquidity pools.",
      link: "https://jup.ag",
    },
    {
      id: "4",
      title: "DeFi Yield Farming Webinar",
      date: "2024-01-28",
      time: "16:00 UTC",
      type: "webinar",
      location: "Online",
      description: "Educational webinar on yield farming strategies in the Solana ecosystem.",
      attendees: 1200,
    },
    {
      id: "5",
      title: "BONK Ecosystem Update",
      date: "2024-02-01",
      time: "12:00 UTC",
      type: "update",
      description: "Quarterly ecosystem update covering partnerships, integrations, and upcoming features.",
      attendees: 3500,
    },
  ]

  const getEventTypeColor = (type: Event["type"]) => {
    switch (type) {
      case "conference":
        return "bg-blue-500"
      case "webinar":
        return "bg-green-500"
      case "launch":
        return "bg-purple-500"
      case "update":
        return "bg-orange-500"
      case "community":
        return "bg-pink-500"
      default:
        return "bg-gray-500"
    }
  }

  const getEventTypeBadge = (type: Event["type"]) => {
    switch (type) {
      case "conference":
        return "default"
      case "webinar":
        return "secondary"
      case "launch":
        return "destructive"
      case "update":
        return "outline"
      case "community":
        return "default"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Event Calendar</h1>
        <p className="text-muted-foreground">
          Stay updated with BONK ecosystem events, launches, and community activities
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Calendar
            </CardTitle>
            <CardDescription>Select a date to view events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="p-2 font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <Button
                    key={day}
                    variant={day === 15 || day === 20 || day === 25 || day === 28 ? "default" : "ghost"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setSelectedDate(new Date(2024, 0, day))}
                  >
                    {day}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Important dates and events in the BONK ecosystem</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.type)} mt-2`} />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{event.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {event.date} at {event.time}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {event.location}
                            </div>
                          )}
                          {event.attendees && (
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {event.attendees.toLocaleString()} attendees
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge variant={getEventTypeBadge(event.type)}>{event.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                    {event.link && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={event.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Learn More
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Community Events</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.filter((e) => e.type === "community").length}</div>
            <p className="text-xs text-muted-foreground">AMAs and meetups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Product Launches</CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.filter((e) => e.type === "launch").length}</div>
            <p className="text-xs text-muted-foreground">New features</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {events.reduce((sum, event) => sum + (event.attendees || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Expected participants</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

