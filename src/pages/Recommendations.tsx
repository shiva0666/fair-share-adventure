
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Users, Calendar, ExternalLink } from "lucide-react";

const Recommendations = () => {
  const isMobile = useIsMobile();

  const recommendedDestinations = [
    {
      id: 1,
      name: "Bali, Indonesia",
      description: "Perfect for group retreats with stunning beaches and cultural experiences",
      rating: 4.8,
      estimatedCost: "$800-1200",
      bestFor: "Groups of 4-8",
      season: "Apr-Oct",
      image: "/placeholder.svg"
    },
    {
      id: 2,
      name: "Costa Rica",
      description: "Adventure-packed destination with wildlife and outdoor activities",
      rating: 4.7,
      estimatedCost: "$600-1000",
      bestFor: "Adventure groups",
      season: "Dec-Apr",
      image: "/placeholder.svg"
    },
    {
      id: 3,
      name: "Japan",
      description: "Cultural immersion with excellent group travel infrastructure",
      rating: 4.9,
      estimatedCost: "$1200-2000",
      bestFor: "Cultural enthusiasts",
      season: "Mar-May, Sep-Nov",
      image: "/placeholder.svg"
    }
  ];

  const groupActivities = [
    {
      title: "Cooking Classes",
      description: "Learn local cuisine together",
      icon: "👨‍🍳",
      avgCost: "$50-80 per person"
    },
    {
      title: "City Walking Tours",
      description: "Explore with guided local experts",
      icon: "🚶‍♂️",
      avgCost: "$20-40 per person"
    },
    {
      title: "Group Yoga Sessions",
      description: "Relax and unwind together",
      icon: "🧘‍♀️",
      avgCost: "$30-50 per person"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        {!isMobile && <Sidebar />}
        <main className="flex-1">
          <div className="container mx-auto p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Recommendations</h1>
              <p className="text-muted-foreground">
                Discover amazing destinations and activities perfect for group travel
              </p>
            </div>

            {/* Recommended Destinations */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6">Trending Destinations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedDestinations.map((destination) => (
                  <Card key={destination.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-muted relative">
                      <img 
                        src={destination.image} 
                        alt={destination.name}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-2 right-2 bg-background/90">
                        <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                        {destination.rating}
                      </Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {destination.name}
                      </CardTitle>
                      <CardDescription>{destination.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Estimated cost:</span>
                          <span className="font-medium">{destination.estimatedCost}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Best for:</span>
                          <span className="font-medium">{destination.bestFor}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Best season:</span>
                          <span className="font-medium">{destination.season}</span>
                        </div>
                      </div>
                      <Button className="w-full mt-4" variant="outline">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Learn More
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Group Activities */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6">Popular Group Activities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupActivities.map((activity, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <span className="text-2xl">{activity.icon}</span>
                        {activity.title}
                      </CardTitle>
                      <CardDescription>{activity.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Average cost:</span>
                        <Badge variant="secondary">{activity.avgCost}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Tips Section */}
            <section>
              <h2 className="text-2xl font-semibold mb-6">Group Travel Tips</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>💰 Budget Planning</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• Set a clear budget range before planning</li>
                      <li>• Use Splittos to track shared expenses</li>
                      <li>• Consider group discounts for accommodations</li>
                      <li>• Plan for unexpected expenses (10-15% buffer)</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>🗓️ Group Coordination</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• Create polls for destination decisions</li>
                      <li>• Share important documents in your group</li>
                      <li>• Assign responsibilities to different members</li>
                      <li>• Set up group communication channels</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Recommendations;
