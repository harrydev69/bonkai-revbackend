"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, ExternalLink, AlertCircle, RefreshCw, Plus, ChevronLeft, ChevronRight, Sparkles } from "lucide-react"

interface Event {
  id: string
  title: string
  date: string
  time: string
  type: string
  location?: string
  description: string
  relevanceScore: number
  tags: string[]
  verified: boolean
  source: string
  externalId?: string
  attendees?: number
  link?: string
  isRecurring?: boolean
  recurrenceRule?: string
  createdAt: string
  updatedAt: string
}

export function CalendarDashboard() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [showAddEventModal, setShowAddEventModal] = useState(false)
  const [filters, setFilters] = useState({
    verifiedOnly: false,
    type: '',
    tag: ''
  })

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        verifiedOnly: filters.verifiedOnly.toString(),
        ...(filters.type && { type: filters.type }),
        ...(filters.tag && { tag: filters.tag })
      })
      
      const response = await fetch(`/api/events?${params}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.status}`)
      }
      
      const data = await response.json()
      // Sort events by date (most recent first)
      const sortedEvents = (data.events || []).sort((a: Event, b: Event) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      })
      setEvents(sortedEvents)
      setLastUpdated(data.updatedAt)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events')
      console.error('Events fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
    
    // Refresh every 10 minutes
    const interval = setInterval(fetchEvents, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [filters])

  // Calendar navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }
  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }
  const goToToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today)
  }

  // Get calendar data for current month
  const getCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const currentDateObj = new Date(startDate)
    
    while (currentDateObj <= lastDay || days.length < 42) {
      days.push(new Date(currentDateObj))
      currentDateObj.setDate(currentDateObj.getDate() + 1)
    }
    
    return days
  }

  const hasEventsOnDate = (date: Date) => {
    return events.some(event => {
      const eventDate = new Date(event.date)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "conference":
        return "bg-blue-500"
      case "workshop":
        return "bg-green-500"
      case "meetup":
        return "bg-purple-500"
      case "ama":
        return "bg-orange-500"
      case "contest":
        return "bg-pink-500"
      case "burning":
        return "bg-red-500"
      case "exchange":
        return "bg-yellow-500"
      case "nft":
        return "bg-indigo-500"
      case "governance":
        return "bg-teal-500"
      case "partnership":
        return "bg-cyan-500"
      case "presentation":
        return "bg-amber-500"
      case "competition":
        return "bg-rose-500"
      case "tournament":
        return "bg-violet-500"
      case "tutorial":
        return "bg-emerald-500"
      case "analysis":
        return "bg-sky-500"
      case "panel":
        return "bg-lime-500"
      case "community-call":
        return "bg-fuchsia-500"
      case "awards":
        return "bg-amber-600"
      default:
        return "bg-gray-500"
    }
  }

  const getEventTypeVariant = (type: string) => {
    switch (type) {
      case "conference":
        return "default"
      case "workshop":
        return "secondary"
      case "meetup":
        return "outline"
      case "ama":
        return "destructive"
      case "contest":
        return "secondary"
      case "burning":
        return "destructive"
      case "exchange":
        return "outline"
      case "nft":
        return "default"
      case "governance":
        return "secondary"
      case "partnership":
        return "outline"
      case "presentation":
        return "default"
      case "competition":
        return "destructive"
      case "tournament":
        return "secondary"
      case "tutorial":
        return "outline"
      case "analysis":
        return "default"
      case "panel":
        return "secondary"
      case "community-call":
        return "outline"
      case "awards":
        return "default"
      default:
        return "secondary"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">BONK Event Calendar</h1>
          <p className="text-muted-foreground">Loading BONK ecosystem events...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 bg-muted rounded w-32 mb-2" />
                <div className="h-4 bg-muted rounded w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-20 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">BONK Event Calendar</h1>
          <p className="text-muted-foreground">Error loading events</p>
        </div>
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Failed to load events</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchEvents}
              className="mt-3 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              <RefreshCw className="h-4 h-4" />
              Try again
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const calendarDays = getCalendarDays()
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : []

  return (
    <div className="space-y-6 p-6">
      {/* Uniform Header */}
      <div>
        <h1 className="text-3xl font-bold">BONK Event Calendar</h1>
        <p className="text-muted-foreground">Stay updated with BONK ecosystem events, launches, and community activities. Let the dog run!</p>
      </div>

      {/* Enhanced Filters Card */}
      <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            Filters & Customization
          </CardTitle>
          <CardDescription>Refine your BONK event view</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Verification</label>
              <select
                value={filters.verifiedOnly ? 'true' : 'false'}
                onChange={(e) => setFilters(prev => ({ ...prev, verifiedOnly: e.target.value === 'true' }))}
                className="w-full mt-1 p-2 border border-orange-200 rounded-md focus:border-orange-500"
              >
                <option value="false">All Events</option>
                <option value="true">Verified Only</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Event Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full mt-1 p-2 border border-orange-200 rounded-md focus:border-orange-500"
              >
                <option value="">All Types</option>
                <option value="conference">Conference</option>
                <option value="workshop">Workshop</option>
                <option value="meetup">Meetup</option>
                <option value="ama">AMA</option>
                <option value="contest">Contest</option>
                <option value="burning">Burning</option>
                <option value="exchange">Exchange</option>
                <option value="nft">NFT</option>
                <option value="governance">Governance</option>
                <option value="partnership">Partnership</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Tag</label>
              <select
                value={filters.tag}
                onChange={(e) => setFilters(prev => ({ ...prev, tag: e.target.value }))}
                className="w-full mt-1 p-2 border border-orange-200 rounded-md focus:border-orange-500"
              >
                <option value="">All Tags</option>
                <option value="bonk">BONK</option>
                <option value="solana">Solana</option>
                <option value="ecosystem">Ecosystem</option>
                <option value="community">Community</option>
                <option value="defi">DeFi</option>
                <option value="nft">NFT</option>
                <option value="governance">Governance</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Calendar and Event List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-500" />
                Calendar
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={goToPreviousMonth} className="border-orange-200 hover:bg-orange-50">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToNextMonth} className="border-orange-200 hover:bg-orange-50">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardTitle>
            <CardDescription className="flex items-center justify-between">
              <span className="font-medium">{formatDate(currentDate)}</span>
              <Button variant="outline" size="sm" onClick={goToToday} className="border-orange-200 hover:bg-orange-50">
                Today
              </Button>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-xs font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
              {calendarDays.map((date, index) => {
                const isCurrentMonth = date.getMonth() === currentDate.getMonth()
                const isToday = date.toDateString() === new Date().toDateString()
                const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString()
                const hasEvents = hasEventsOnDate(date)
                
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(date)}
                    className={`
                      p-2 text-xs rounded-md transition-all duration-200 hover:bg-orange-100 dark:hover:bg-orange-900/30
                      ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/50'}
                      ${isToday ? 'bg-orange-500 text-white font-bold' : ''}
                      ${isSelected ? 'ring-2 ring-orange-500 ring-offset-2' : ''}
                      ${hasEvents ? 'font-semibold text-orange-600 dark:text-orange-400' : ''}
                    `}
                  >
                    {date.getDate()}
                    {hasEvents && (
                      <div className="w-1 h-1 bg-orange-500 rounded-full mx-auto mt-1"></div>
                    )}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              {selectedDate
                ? `Events on ${selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}`
                : 'Upcoming BONK Events'
              }
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <span>
                {selectedDate
                  ? `${selectedDateEvents.length} event${selectedDateEvents.length !== 1 ? 's' : ''} on this date`
                  : `${events.length} total events in the BONK ecosystem`
                }
              </span>
              <Button onClick={() => setShowAddEventModal(true)} className="ml-auto bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0">
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(selectedDate ? selectedDateEvents : events).length > 0 ? (
                (selectedDate ? selectedDateEvents : events).map((event) => (
                  <Card key={event.id} className="hover:shadow-lg transition-all duration-300 border-orange-200 hover:border-orange-400 group">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg group-hover:text-orange-600 transition-colors line-clamp-2">
                            {event.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {event.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Badge variant={getEventTypeVariant(event.type)} className="shadow-sm">
                            {event.type.replace('-', ' ')}
                          </Badge>
                          {event.verified && (
                            <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50 dark:bg-green-950/20">
                              ✓ Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-orange-500" />
                          {new Date(event.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })} at {event.time}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-orange-500" />
                            {event.location}
                          </div>
                        )}
                        {event.attendees && (
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-orange-500" />
                            {event.attendees} attending
                          </div>
                        )}
                      </div>

                      {/* Enhanced Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {event.tags.slice(0, 5).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs border-orange-200 text-orange-700 hover:bg-orange-50">
                            #{tag}
                          </Badge>
                        ))}
                        {event.tags.length > 5 && (
                          <Badge variant="outline" className="text-xs border-orange-200 text-orange-700">
                            +{event.tags.length - 5} more
                          </Badge>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {event.link && (
                          <Button asChild variant="outline" size="sm" className="border-orange-200 hover:bg-orange-50">
                            <a href={event.link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Event Details
                            </a>
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="border-orange-200 hover:bg-orange-50">
                          <Calendar className="w-4 h-4 mr-2" />
                          Add to Calendar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-orange-300" />
                  <h3 className="text-lg font-medium mb-2">
                    {selectedDate
                      ? 'No events on this date'
                      : 'No upcoming events found'
                    }
                  </h3>
                  <p className="text-sm">
                    {selectedDate
                      ? 'Try selecting a different date or check back later for new events.'
                      : 'Check back soon for exciting BONK ecosystem events!'
                    }
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Event Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{events.length}</div>
            <p className="text-xs text-muted-foreground">BONK ecosystem events</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Events</CardTitle>
            <Badge className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{events.filter(e => e.verified).length}</div>
            <p className="text-xs text-muted-foreground">Quality assured</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {events.filter(e => {
                const eventDate = new Date(e.date)
                const now = new Date()
                return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear()
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">Events this month</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Event Types</CardTitle>
            <Badge className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {new Set(events.map(e => e.type)).size}
            </div>
            <p className="text-xs text-muted-foreground">Different event types</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Last Updated Info */}
      {lastUpdated && (
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>Last updated: {new Date(lastUpdated).toLocaleString()}</span>
          </div>
          <p className="text-xs text-muted-foreground">
             BONK ecosystem events are constantly updated with fresh community activities
          </p>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Add New BONK Event</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Event Title</label>
                <input type="text" className="w-full p-2 border rounded-md" placeholder="Enter event title" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input type="date" className="w-full p-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time</label>
                <input type="time" className="w-full p-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Event Type</label>
                <select className="w-full p-2 border rounded-md">
                  <option value="">Select type</option>
                  <option value="conference">Conference</option>
                  <option value="workshop">Workshop</option>
                  <option value="meetup">Meetup</option>
                  <option value="ama">AMA</option>
                  <option value="contest">Contest</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input type="text" className="w-full p-2 border rounded-md" placeholder="Enter location" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea className="w-full p-2 border rounded-md" rows={3} placeholder="Enter event description"></textarea>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0">
                  Add Event
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddEventModal(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

