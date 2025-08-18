"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Calendar, Music, Settings, Save, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EventForm {
  title: string
  date: string
  time: string
  type: "conference" | "webinar" | "launch" | "update" | "community"
  location: string
  description: string
  attendees: number
  link: string
}

interface AudioForm {
  title: string
  artist: string
  duration: string
  category: "podcast" | "interview" | "analysis" | "news"
  description: string
  tags: string
}

export default function AdminPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("events")
  
  // Event form state
  const [eventForm, setEventForm] = useState<EventForm>({
    title: "",
    date: "",
    time: "",
    type: "community",
    location: "",
    description: "",
    attendees: 0,
    link: ""
  })
  
  // Audio form state
  const [audioForm, setAudioForm] = useState<AudioForm>({
    title: "",
    artist: "",
    duration: "",
    category: "podcast",
    description: "",
    tags: ""
  })
  
  const [showEventForm, setShowEventForm] = useState(false)
  const [showAudioForm, setShowAudioForm] = useState(false)

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventForm)
      })
      
      if (response.ok) {
        toast({
          title: "Event created",
          description: "The event has been added successfully.",
        })
        setEventForm({
          title: "",
          date: "",
          time: "",
          type: "community",
          location: "",
          description: "",
          attendees: 0,
          link: ""
        })
        setShowEventForm(false)
      } else {
        throw new Error('Failed to create event')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleAudioSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...audioForm,
          tags: audioForm.tags.split(',').map(tag => tag.trim())
        })
      })
      
      if (response.ok) {
        toast({
          title: "Audio track created",
          description: "The audio track has been added successfully.",
        })
        setAudioForm({
          title: "",
          artist: "",
          duration: "",
          category: "podcast",
          description: "",
          tags: ""
        })
        setShowAudioForm(false)
      } else {
        throw new Error('Failed to create audio track')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create audio track. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
          <Settings className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage events, audio content, and platform settings</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="audio">Audio Library</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Event Management</CardTitle>
                  <CardDescription>Create and manage BONK ecosystem events</CardDescription>
                </div>
                <Button onClick={() => setShowEventForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Event
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No events created yet. Click "Add Event" to get started.</p>
              </div>
            </CardContent>
          </Card>

          {showEventForm && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Add New Event</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowEventForm(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEventSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="event-title">Event Title</Label>
                      <Input
                        id="event-title"
                        value={eventForm.title}
                        onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                        placeholder="BONK Community AMA"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="event-type">Event Type</Label>
                      <Select
                        value={eventForm.type}
                        onValueChange={(value: EventForm["type"]) => setEventForm({ ...eventForm, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="conference">Conference</SelectItem>
                          <SelectItem value="webinar">Webinar</SelectItem>
                          <SelectItem value="launch">Launch</SelectItem>
                          <SelectItem value="update">Update</SelectItem>
                          <SelectItem value="community">Community</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="event-date">Date</Label>
                      <Input
                        id="event-date"
                        type="date"
                        value={eventForm.date}
                        onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="event-time">Time (UTC)</Label>
                      <Input
                        id="event-time"
                        type="time"
                        value={eventForm.time}
                        onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="event-location">Location</Label>
                    <Input
                      id="event-location"
                      value={eventForm.location}
                      onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                      placeholder="Discord, Online, Singapore"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="event-description">Description</Label>
                    <Textarea
                      id="event-description"
                      value={eventForm.description}
                      onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                      placeholder="Describe the event..."
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="event-attendees">Expected Attendees</Label>
                      <Input
                        id="event-attendees"
                        type="number"
                        value={eventForm.attendees}
                        onChange={(e) => setEventForm({ ...eventForm, attendees: parseInt(e.target.value) || 0 })}
                        placeholder="1000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="event-link">Event Link</Label>
                      <Input
                        id="event-link"
                        type="url"
                        value={eventForm.link}
                        onChange={(e) => setEventForm({ ...eventForm, link: e.target.value })}
                        placeholder="https://discord.gg/bonk"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      <Save className="w-4 h-4 mr-2" />
                      Create Event
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowEventForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="audio" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Audio Library Management</CardTitle>
                  <CardDescription>Add and manage podcasts, interviews, and analysis content</CardDescription>
                </div>
                <Button onClick={() => setShowAudioForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Audio Track
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No audio tracks created yet. Click "Add Audio Track" to get started.</p>
              </div>
            </CardContent>
          </Card>

          {showAudioForm && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Add New Audio Track</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowAudioForm(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAudioSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="audio-title">Track Title</Label>
                      <Input
                        id="audio-title"
                        value={audioForm.title}
                        onChange={(e) => setAudioForm({ ...audioForm, title: e.target.value })}
                        placeholder="BONK Market Analysis: Q4 2024 Review"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="audio-artist">Artist/Creator</Label>
                      <Input
                        id="audio-artist"
                        value={audioForm.artist}
                        onChange={(e) => setAudioForm({ ...audioForm, artist: e.target.value })}
                        placeholder="Crypto Analytics Team"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="audio-duration">Duration</Label>
                      <Input
                        id="audio-duration"
                        value={audioForm.duration}
                        onChange={(e) => setAudioForm({ ...audioForm, duration: e.target.value })}
                        placeholder="24:35"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="audio-category">Category</Label>
                      <Select
                        value={audioForm.category}
                        onValueChange={(value: AudioForm["category"]) => setAudioForm({ ...audioForm, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="podcast">Podcast</SelectItem>
                          <SelectItem value="interview">Interview</SelectItem>
                          <SelectItem value="analysis">Analysis</SelectItem>
                          <SelectItem value="news">News</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="audio-description">Description</Label>
                    <Textarea
                      id="audio-description"
                      value={audioForm.description}
                      onChange={(e) => setAudioForm({ ...audioForm, description: e.target.value })}
                      placeholder="Describe the audio content..."
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="audio-tags">Tags (comma-separated)</Label>
                    <Input
                      id="audio-tags"
                      value={audioForm.tags}
                      onChange={(e) => setAudioForm({ ...audioForm, tags: e.target.value })}
                      placeholder="market-analysis, bonk, q4-review"
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      <Save className="w-4 h-4 mr-2" />
                      Create Audio Track
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowAudioForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>Configure platform-wide settings and integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">API Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Solana RPC (Helius)</span>
                      <span className="text-green-600">✓ Connected</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>CoinGecko</span>
                      <span className="text-green-600">✓ Connected</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Google Calendar</span>
                      <span className="text-yellow-600">⚠ Not configured</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>AWS S3</span>
                      <span className="text-yellow-600">⚠ Not configured</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Feature Flags</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Real-time Metrics</span>
                      <span className="text-green-600">✓ Enabled</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Audio Streaming</span>
                      <span className="text-yellow-600">⚠ Disabled</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Google Calendar Events</span>
                      <span className="text-yellow-600">⚠ Disabled</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
