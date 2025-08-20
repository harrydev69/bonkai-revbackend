"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, ExternalLink } from "lucide-react"

export function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState("bonk")

  // Dune Analytics Dashboard URLs
  const duneUrls = {
    bonk: "https://dune.com/adam_tehc/bonk", // Main Bonk dashboard
    letsbonk: "https://dune.com/embeds/YOUR_LETSBONK_DASHBOARD_ID" // Replace with actual LetsBonk dashboard URL
  }

  // Organized Bonk Ecosystem Dune Embeds by Category
  const bonkEmbedGroups = {
    price: [
      { id: "5509666/8973669", title: "BONK Price & Volume" },
      { id: "5509669/8973679", title: "BONK Market Cap" },
      { id: "1835500/3019431", title: "BONK Market Analysis" },
      { id: "1835473/3019393", title: "BONK Market Trends" }
    ],
    trading: [
      { id: "5509710/8973761", title: "BONK Trading Activity" },
      { id: "5509724/8973806", title: "BONK Transaction Volume" },
      { id: "1833152/3015340", title: "BONK Trading Metrics" },
      { id: "1839468/3025923", title: "BONK Market Dynamics" },
      { id: "1839468/3025908", title: "BONK Trading Patterns" }
    ],
    network: [
      { id: "5509724/8973808", title: "BONK Holder Distribution" },
      { id: "5509724/8973779", title: "BONK Network Growth" },
      { id: "1833130/3015331", title: "BONK Network Insights" }
    ],
    social: [
      { id: "5509754/8973891", title: "BONK Social Sentiment" },
      { id: "5509754/8973894", title: "BONK Development Activity" }
    ],
    performance: [
      { id: "5509704/8973825", title: "BONK Ecosystem Metrics" },
      { id: "5629573/9149706", title: "BONK Performance Analysis" },
      { id: "5532081/9009973", title: "BONK Market Trends" },
      { id: "5532183/9009987", title: "BONK Network Statistics" },
      { id: "1835429/3019368", title: "BONK Performance Data" },
      { id: "1851828/3047206", title: "BONK Ecosystem Overview" }
    ]
  }

  // Organized LetsBonk.Fun Ecosystem Dune Embeds by Category
  const letsbonkEmbedGroups = {
    price: [
      { id: "5123675/8449162", title: "LetsBonk Price Analysis" },
      { id: "5123675/8449164", title: "LetsBonk Market Trends" },
      { id: "5124374/8449208", title: "LetsBonk Market Overview" }
    ],
    trading: [
      { id: "5123675/8767713", title: "LetsBonk Trading Activity" },
      { id: "5123675/8767730", title: "LetsBonk Transaction Volume" },
      { id: "5123675/8767721", title: "LetsBonk Trading Patterns" },
      { id: "5123675/8767722", title: "LetsBonk Market Dynamics" }
    ],
    network: [
      { id: "5124374/8449213", title: "LetsBonk Network Growth" },
      { id: "5123675/8448689", title: "LetsBonk Holder Distribution" },
      { id: "5353796/8767633", title: "LetsBonk Network Insights" }
    ],
    performance: [
      { id: "5124477/8449366", title: "LetsBonk Performance Metrics" },
      { id: "5128982/8455655", title: "LetsBonk Ecosystem Health" },
      { id: "5425249/8856516", title: "LetsBonk Analytics Overview" },
      { id: "5123626/8448127", title: "LetsBonk Market Analysis" },
      { id: "5467963/8915205", title: "LetsBonk Performance Data" },
      { id: "5467963/8915204", title: "LetsBonk Ecosystem Metrics" }
    ]
  }

    return (
      <div className="space-y-6 p-6">
      {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Real-time analytics and insights for BONK and LetsBonk.fun ecosystems</p>
        </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bonk">Bonk Ecosystem</TabsTrigger>
          <TabsTrigger value="letsbonk">LetsBonk.Fun Ecosystem</TabsTrigger>
        </TabsList>

        {/* Bonk Ecosystem Tab */}
        <TabsContent value="bonk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Bonk Ecosystem Analytics
              </CardTitle>
              <CardDescription>
                Comprehensive analytics and insights for the Bonk ecosystem and related tokens. Huge thanks to these contributors: @adam_tehc and @oladee
              </CardDescription>
              </CardHeader>
              <CardContent>
              <div className="space-y-12">
                
                                 {/* PRICE GROUP */}
                 <div className="space-y-6">
                   <div className="border-b pb-2">
                     <h2 className="text-2xl font-semibold">Price & Market Metrics</h2>
                     <p className="text-sm text-muted-foreground">Price analysis, market cap, and market trends</p>
        </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {bonkEmbedGroups.price.map((embed, index) => (
                      <div key={index} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-muted-foreground">{embed.title}</h3>
      </div>
                        <div className="w-full h-[300px] bg-white rounded-lg border overflow-hidden shadow-sm relative">
                          <iframe
                            src={`https://dune.com/embeds/${embed.id}?theme=dark&hide_legend=true&clean=true&hide_title=true&hide_branding=true&disable_links=true`}
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            title={embed.title}
                            className="w-full h-full"
                            style={{
                              filter: 'contrast(1.1) brightness(1.05)',
                            }}
                          />
                          {/* CSS Magic to hide Dune branding elements AND block clickable links */}
                          <>
                            <div className="absolute bottom-0 left-0 w-28 h-12 bg-gradient-to-tr from-white via-transparent to-transparent pointer-events-none z-20" />
                            <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-tl from-white via-transparent to-transparent pointer-events-none z-20" />
                            
                            {/* Targeted link blocking - only blocks specific link areas, allows chart interaction */}
                            <div className="absolute top-0 left-0 w-32 h-16 bg-transparent pointer-events-auto z-30" />
                            <div className="absolute bottom-0 left-0 w-24 h-8 bg-transparent pointer-events-auto z-30" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 bg-transparent pointer-events-auto z-30" />
                          </>
              </div>
            </div>
                    ))}
        </div>
      </div>

                                 {/* TRADING GROUP */}
                 <div className="space-y-6">
                   <div className="border-b pb-2">
                     <h2 className="text-2xl font-semibold">Trading & Transaction Metrics</h2>
                     <p className="text-sm text-muted-foreground">Trading activity, volume, fees, and transaction patterns</p>
                   </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {bonkEmbedGroups.trading.map((embed, index) => (
                      <div key={index} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-muted-foreground">{embed.title}</h3>
      </div>
                        <div className="w-full h-[300px] bg-white rounded-lg border overflow-hidden shadow-sm relative">
                          <iframe
                            src={`https://dune.com/embeds/${embed.id}?theme=dark&hide_legend=true&clean=true&hide_title=true&hide_branding=true&disable_links=true`}
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            title={embed.title}
                            className="w-full h-full"
                            style={{
                              filter: 'contrast(1.1) brightness(1.05)',
                            }}
                          />
                          {/* CSS Magic to hide Dune branding elements AND block clickable links */}
                          <>
                            <div className="absolute bottom-0 left-0 w-28 h-12 bg-gradient-to-tr from-white via-transparent to-transparent pointer-events-none z-20" />
                            <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-tl from-white via-transparent to-transparent pointer-events-none z-20" />
                            
                            {/* Targeted link blocking - only blocks specific link areas, allows chart interaction */}
                            <div className="absolute top-0 left-0 w-32 h-16 bg-transparent pointer-events-auto z-30" />
                            <div className="absolute bottom-0 left-0 w-24 h-8 bg-transparent pointer-events-auto z-30" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 bg-transparent pointer-events-auto z-30" />
                          </>
              </div>
              </div>
        ))}
                  </div>
      </div>

                                 {/* NETWORK GROUP */}
                 <div className="space-y-6">
                   <div className="border-b pb-2">
                     <h2 className="text-2xl font-semibold">Network & Holder Metrics</h2>
                     <p className="text-sm text-muted-foreground">Holder distribution, network growth, and network insights</p>
        </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {bonkEmbedGroups.network.map((embed, index) => (
                      <div key={index} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-muted-foreground">{embed.title}</h3>
                  </div>
                        <div className="w-full h-[300px] bg-white rounded-lg border overflow-hidden shadow-sm relative">
                          <iframe
                            src={`https://dune.com/embeds/${embed.id}?theme=dark&hide_legend=true&clean=true&hide_title=true&hide_branding=true&disable_links=true`}
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            title={embed.title}
                            className="w-full h-full"
                            style={{
                              filter: 'contrast(1.1) brightness(1.05)',
                            }}
                          />
                          {/* CSS Magic to hide Dune branding elements AND block clickable links */}
                          <>
                            <div className="absolute bottom-0 left-0 w-28 h-12 bg-gradient-to-tr from-white via-transparent to-transparent pointer-events-none z-20" />
                            <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-tl from-white via-transparent to-transparent pointer-events-none z-20" />
                            
                            {/* Targeted link blocking - only blocks specific link areas, allows chart interaction */}
                            <div className="absolute top-0 left-0 w-32 h-16 bg-transparent pointer-events-auto z-30" />
                            <div className="absolute bottom-0 left-0 w-24 h-8 bg-transparent pointer-events-auto z-30" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 bg-transparent pointer-events-auto z-30" />
                          </>
                  </div>
                  </div>
                    ))}
                  </div>
                </div>

                                 {/* SOCIAL GROUP */}
                 <div className="space-y-6">
                   <div className="border-b pb-2">
                     <h2 className="text-2xl font-semibold">Social & Development Metrics</h2>
                     <p className="text-sm text-muted-foreground">Social sentiment, development activity, and community engagement</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {bonkEmbedGroups.social.map((embed, index) => (
                      <div key={index} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-muted-foreground">{embed.title}</h3>
                  </div>
                        <div className="w-full h-[300px] bg-white rounded-lg border overflow-hidden shadow-sm relative">
                          <iframe
                            src={`https://dune.com/embeds/${embed.id}?theme=dark&hide_legend=true&clean=true&hide_title=true&hide_branding=true&disable_links=true`}
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            title={embed.title}
                            className="w-full h-full"
                            style={{
                              filter: 'contrast(1.1) brightness(1.05)',
                            }}
                          />
                          {/* CSS Magic to hide Dune branding elements AND block clickable links */}
                          <>
                            <div className="absolute bottom-0 left-0 w-28 h-12 bg-gradient-to-tr from-white via-transparent to-transparent pointer-events-none z-20" />
                            <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-tl from-white via-transparent to-transparent pointer-events-none z-20" />
                            
                            {/* Targeted link blocking - only blocks specific link areas, allows chart interaction */}
                            <div className="absolute top-0 left-0 w-32 h-16 bg-transparent pointer-events-auto z-30" />
                            <div className="absolute bottom-0 left-0 w-24 h-8 bg-transparent pointer-events-auto z-30" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 bg-transparent pointer-events-auto z-30" />
                          </>
                  </div>
                  </div>
                    ))}
                  </div>
                </div>

                                 {/* PERFORMANCE GROUP */}
                 <div className="space-y-6">
                   <div className="border-b pb-2">
                     <h2 className="text-2xl font-semibold">Performance & Ecosystem Metrics</h2>
                     <p className="text-sm text-muted-foreground">Overall performance, ecosystem health, and comprehensive analytics</p>
                      </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {bonkEmbedGroups.performance.map((embed, index) => (
                      <div key={index} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-muted-foreground">{embed.title}</h3>
                      </div>
                        <div className="w-full h-[300px] bg-white rounded-lg border overflow-hidden shadow-sm relative">
                          <iframe
                            src={`https://dune.com/embeds/${embed.id}?theme=dark&hide_legend=true&clean=true&hide_title=true&hide_branding=true&disable_links=true`}
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            title={embed.title}
                            className="w-full h-full"
                            style={{
                              filter: 'contrast(1.1) brightness(1.05)',
                            }}
                          />
                          {/* CSS Magic to hide Dune branding elements AND block clickable links */}
                          <>
                            <div className="absolute bottom-0 left-0 w-28 h-12 bg-gradient-to-tr from-white via-transparent to-transparent pointer-events-none z-20" />
                            <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-tl from-white via-transparent to-transparent pointer-events-none z-20" />
                            
                            {/* Targeted link blocking - only blocks specific link areas, allows chart interaction */}
                            <div className="absolute top-0 left-0 w-32 h-16 bg-transparent pointer-events-auto z-30" />
                            <div className="absolute bottom-0 left-0 w-24 h-8 bg-transparent pointer-events-auto z-30" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 bg-transparent pointer-events-auto z-30" />
                          </>
                    </div>
                  </div>
                ))}
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LetsBonk.Fun Ecosystem Tab */}
        <TabsContent value="letsbonk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                LetsBonk.Fun Ecosystem Analytics
              </CardTitle>
              <CardDescription>
                Comprehensive analytics and insights for the LetsBonk.fun ecosystem and related tokens. Huge thanks to these contributors: @adam_tehc and @oladee
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-12">
                
                {/* PRICE GROUP */}
                <div className="space-y-6">
                  <div className="border-b pb-2">
                    <h2 className="text-2xl font-semibold">Price & Market Metrics</h2>
                    <p className="text-sm text-muted-foreground">Price analysis, market cap, and market trends for LetsBonk.fun ecosystem</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {letsbonkEmbedGroups.price.map((embed, index) => (
                      <div key={index} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-muted-foreground">{embed.title}</h3>
                        </div>
                        <div className="w-full h-[300px] bg-white rounded-lg border overflow-hidden shadow-sm relative">
                          <iframe
                            src={`https://dune.com/embeds/${embed.id}?theme=dark&hide_legend=true&clean=true&hide_title=true&hide_branding=true&disable_links=true`}
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            title={embed.title}
                            className="w-full h-full"
                            style={{
                              filter: 'contrast(1.1) brightness(1.05)',
                            }}
                          />
                          {/* CSS Magic to hide Dune branding elements AND block clickable links */}
                          <>
                            <div className="absolute bottom-0 left-0 w-28 h-12 bg-gradient-to-tr from-white via-transparent to-transparent pointer-events-none z-20" />
                            <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-tl from-white via-transparent to-transparent pointer-events-none z-20" />
                            
                            {/* Targeted link blocking - only blocks specific link areas, allows chart interaction */}
                            <div className="absolute top-0 left-0 w-32 h-16 bg-transparent pointer-events-auto z-30" />
                            <div className="absolute bottom-0 left-0 w-24 h-8 bg-transparent pointer-events-auto z-30" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 bg-transparent pointer-events-auto z-30" />
                          </>
                        </div>
                      </div>
                    ))}
                  </div>
                    </div>

                {/* TRADING GROUP */}
                <div className="space-y-6">
                  <div className="border-b pb-2">
                    <h2 className="text-2xl font-semibold">Trading & Transaction Metrics</h2>
                    <p className="text-sm text-muted-foreground">Trading activity, volume, fees, and transaction patterns</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {letsbonkEmbedGroups.trading.map((embed, index) => (
                      <div key={index} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-muted-foreground">{embed.title}</h3>
                    </div>
                        <div className="w-full h-[300px] bg-white rounded-lg border overflow-hidden shadow-sm relative">
                          <iframe
                            src={`https://dune.com/embeds/${embed.id}?theme=dark&hide_legend=true&clean=true&hide_title=true&hide_branding=true&disable_links=true`}
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            title={embed.title}
                            className="w-full h-full"
                            style={{
                              filter: 'contrast(1.1) brightness(1.05)',
                            }}
                          />
                          {/* CSS Magic to hide Dune branding elements AND block clickable links */}
                          <>
                            <div className="absolute bottom-0 left-0 w-28 h-12 bg-gradient-to-tr from-white via-transparent to-transparent pointer-events-none z-20" />
                            <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-tl from-white via-transparent to-transparent pointer-events-none z-20" />
                            
                            {/* Targeted link blocking - only blocks specific link areas, allows chart interaction */}
                            <div className="absolute top-0 left-0 w-32 h-16 bg-transparent pointer-events-auto z-30" />
                            <div className="absolute bottom-0 left-0 w-24 h-8 bg-transparent pointer-events-auto z-30" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 bg-transparent pointer-events-auto z-30" />
                          </>
                  </div>
                    </div>
                    ))}
                  </div>
                </div>

                {/* NETWORK GROUP */}
                <div className="space-y-6">
                  <div className="border-b pb-2">
                    <h2 className="text-2xl font-semibold">Network & Holder Metrics</h2>
                    <p className="text-sm text-muted-foreground">Holder distribution, network growth, and network insights</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {letsbonkEmbedGroups.network.map((embed, index) => (
                      <div key={index} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-muted-foreground">{embed.title}</h3>
                        </div>
                        <div className="w-full h-[300px] bg-white rounded-lg border overflow-hidden shadow-sm relative">
                          <iframe
                            src={`https://dune.com/embeds/${embed.id}?theme=dark&hide_legend=true&clean=true&hide_title=true&hide_branding=true&disable_links=true`}
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            title={embed.title}
                            className="w-full h-full"
                            style={{
                              filter: 'contrast(1.1) brightness(1.05)',
                            }}
                          />
                          {/* CSS Magic to hide Dune branding elements AND block clickable links */}
                          <>
                            <div className="absolute bottom-0 left-0 w-28 h-12 bg-gradient-to-tr from-white via-transparent to-transparent pointer-events-none z-20" />
                            <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-tl from-white via-transparent to-transparent pointer-events-none z-20" />
                            
                            {/* Targeted link blocking - only blocks specific link areas, allows chart interaction */}
                            <div className="absolute top-0 left-0 w-32 h-16 bg-transparent pointer-events-auto z-30" />
                            <div className="absolute bottom-0 left-0 w-24 h-8 bg-transparent pointer-events-auto z-30" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 bg-transparent pointer-events-auto z-30" />
                          </>
                        </div>
                    </div>
                    ))}
                  </div>
                    </div>

                {/* PERFORMANCE GROUP */}
                <div className="space-y-6">
                  <div className="border-b pb-2">
                    <h2 className="text-2xl font-semibold">Performance & Ecosystem Metrics</h2>
                    <p className="text-sm text-muted-foreground">Overall performance, ecosystem health, and comprehensive analytics</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {letsbonkEmbedGroups.performance.map((embed, index) => (
                      <div key={index} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-muted-foreground">{embed.title}</h3>
                    </div>
                        <div className="w-full h-[300px] bg-white rounded-lg border overflow-hidden shadow-sm relative">
                          <iframe
                            src={`https://dune.com/embeds/${embed.id}?theme=dark&hide_legend=true&clean=true&hide_title=true&hide_branding=true&disable_links=true`}
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            title={embed.title}
                            className="w-full h-full"
                            style={{
                              filter: 'contrast(1.1) brightness(1.05)',
                            }}
                          />
                          {/* CSS Magic to hide Dune branding elements AND block clickable links */}
                          <>
                            <div className="absolute bottom-0 left-0 w-28 h-12 bg-gradient-to-tr from-white via-transparent to-transparent pointer-events-none z-20" />
                            <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-tl from-white via-transparent to-transparent pointer-events-none z-20" />
                            
                            {/* Targeted link blocking - only blocks specific link areas, allows chart interaction */}
                            <div className="absolute top-0 left-0 w-32 h-16 bg-transparent pointer-events-auto z-30" />
                            <div className="absolute bottom-0 left-0 w-24 h-8 bg-transparent pointer-events-auto z-30" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 bg-transparent pointer-events-auto z-30" />
                          </>
                  </div>
                      </div>
                    ))}
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

