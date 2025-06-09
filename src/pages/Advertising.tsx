
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Star, MapPin, Camera, Plane, Hotel, Car, Sparkles, TrendingUp, Gift, Utensils, Music, ShoppingBag, Gamepad2, Heart, Shield, Wifi, Phone, CreditCard } from "lucide-react";
import { useState, useEffect } from "react";

const Advertising = () => {
  const isMobile = useIsMobile();
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Auto-rotate banner ads
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % bannerAds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Enhanced Banner ads data with more options
  const bannerAds = [
    {
      id: 1,
      title: "Travel More, Spend Less",
      description: "Get 20% off your next group booking with TravelDeals",
      image: "/placeholder.svg",
      cta: "Book Now",
      link: "#",
      gradient: "from-blue-600 via-purple-600 to-blue-800"
    },
    {
      id: 2,
      title: "Premium Hotels Worldwide",
      description: "Luxury accommodations for your group trips",
      image: "/placeholder.svg",
      cta: "Explore Hotels",
      link: "#",
      gradient: "from-emerald-500 via-teal-600 to-cyan-600"
    },
    {
      id: 3,
      title: "Group Flight Discounts",
      description: "Save up to 30% on group flight bookings",
      image: "/placeholder.svg",
      cta: "Find Flights",
      link: "#",
      gradient: "from-orange-500 via-red-500 to-pink-600"
    },
    {
      id: 4,
      title: "Epic Group Adventures",
      description: "Discover amazing destinations with friends",
      image: "/placeholder.svg",
      cta: "Start Adventure",
      link: "#",
      gradient: "from-purple-500 via-pink-500 to-red-500"
    },
    {
      id: 5,
      title: "Weekend Getaway Deals",
      description: "Perfect short trips for busy schedules",
      image: "/placeholder.svg",
      cta: "Book Weekend",
      link: "#",
      gradient: "from-green-500 via-blue-500 to-purple-500"
    }
  ];

  // Expanded sponsored cards data
  const sponsoredCards = [
    {
      id: 1,
      title: "Adventure Tours Costa Rica",
      description: "Experience the ultimate group adventure with zip-lining, wildlife tours, and more!",
      price: "From $299/person",
      rating: 4.8,
      reviews: 1247,
      image: "/placeholder.svg",
      link: "#",
      category: "Adventure",
      color: "from-green-400 to-emerald-600"
    },
    {
      id: 2,
      title: "European City Breaks",
      description: "Discover Europe's most beautiful cities with our guided group tours.",
      price: "From $450/person",
      rating: 4.9,
      reviews: 856,
      image: "/placeholder.svg",
      link: "#",
      category: "Cultural",
      color: "from-blue-400 to-indigo-600"
    },
    {
      id: 3,
      title: "Beach Resort Packages",
      description: "All-inclusive beach resorts perfect for group getaways and celebrations.",
      price: "From $199/night",
      rating: 4.7,
      reviews: 2134,
      image: "/placeholder.svg",
      link: "#",
      category: "Beach",
      color: "from-cyan-400 to-teal-600"
    },
    {
      id: 4,
      title: "Mountain Hiking Expeditions",
      description: "Join guided hiking groups and explore breathtaking mountain trails.",
      price: "From $125/person",
      rating: 4.6,
      reviews: 634,
      image: "/placeholder.svg",
      link: "#",
      category: "Adventure",
      color: "from-amber-400 to-orange-600"
    },
    {
      id: 5,
      title: "Wine Tasting Tours",
      description: "Explore world-class vineyards with exclusive group tastings.",
      price: "From $89/person",
      rating: 4.9,
      reviews: 892,
      image: "/placeholder.svg",
      link: "#",
      category: "Culinary",
      color: "from-purple-400 to-pink-600"
    },
    {
      id: 6,
      title: "Safari Adventures Africa",
      description: "Witness the Big Five in their natural habitat with expert guides.",
      price: "From $1299/person",
      rating: 4.8,
      reviews: 445,
      image: "/placeholder.svg",
      link: "#",
      category: "Wildlife",
      color: "from-yellow-400 to-red-600"
    },
    {
      id: 7,
      title: "Music Festival Packages",
      description: "VIP access to the hottest music festivals worldwide.",
      price: "From $350/person",
      rating: 4.7,
      reviews: 1678,
      image: "/placeholder.svg",
      link: "#",
      category: "Entertainment",
      color: "from-pink-400 to-purple-600"
    },
    {
      id: 8,
      title: "Cooking Class Getaways",
      description: "Learn authentic cuisine from local chefs in amazing locations.",
      price: "From $179/person",
      rating: 4.6,
      reviews: 723,
      image: "/placeholder.svg",
      link: "#",
      category: "Culinary",
      color: "from-orange-400 to-red-600"
    }
  ];

  // Expanded affiliate offers
  const affiliateOffers = [
    {
      id: 1,
      title: "Travel Insurance",
      description: "Protect your group trip with comprehensive travel insurance",
      discount: "15% OFF",
      provider: "SafeTravel Insurance",
      icon: <Shield className="h-6 w-6" />,
      link: "#",
      color: "from-purple-400 to-purple-600"
    },
    {
      id: 2,
      title: "Car Rentals",
      description: "Rent vehicles for your group at discounted rates",
      discount: "25% OFF",
      provider: "RentACar Plus",
      icon: <Car className="h-6 w-6" />,
      link: "#",
      color: "from-blue-400 to-blue-600"
    },
    {
      id: 3,
      title: "Travel Gear",
      description: "Essential travel accessories and luggage for groups",
      discount: "20% OFF",
      provider: "TravelGear Pro",
      icon: <Camera className="h-6 w-6" />,
      link: "#",
      color: "from-green-400 to-green-600"
    },
    {
      id: 4,
      title: "International SIM Cards",
      description: "Stay connected worldwide with affordable data plans",
      discount: "30% OFF",
      provider: "GlobalConnect",
      icon: <Phone className="h-6 w-6" />,
      link: "#",
      color: "from-indigo-400 to-indigo-600"
    },
    {
      id: 5,
      title: "Travel Credit Cards",
      description: "Earn points and get travel rewards with every purchase",
      discount: "No Annual Fee",
      provider: "TravelRewards Bank",
      icon: <CreditCard className="h-6 w-6" />,
      link: "#",
      color: "from-emerald-400 to-emerald-600"
    },
    {
      id: 6,
      title: "Portable WiFi Devices",
      description: "High-speed internet access for your entire group",
      discount: "40% OFF",
      provider: "WiFiToGo",
      icon: <Wifi className="h-6 w-6" />,
      link: "#",
      color: "from-cyan-400 to-cyan-600"
    }
  ];

  // New section: Quick deals
  const quickDeals = [
    {
      id: 1,
      title: "Last Minute Hotel Deals",
      description: "Up to 60% off tonight's stay",
      icon: <Hotel className="h-5 w-5" />,
      discount: "60% OFF",
      color: "from-red-500 to-pink-500"
    },
    {
      id: 2,
      title: "Restaurant Group Bookings",
      description: "Free appetizers for groups of 8+",
      icon: <Utensils className="h-5 w-5" />,
      discount: "Free Apps",
      color: "from-orange-500 to-red-500"
    },
    {
      id: 3,
      title: "Entertainment Tickets",
      description: "Group discounts on shows & events",
      icon: <Music className="h-5 w-5" />,
      discount: "25% OFF",
      color: "from-purple-500 to-pink-500"
    },
    {
      id: 4,
      title: "Shopping Mall Vouchers",
      description: "Exclusive group shopping perks",
      icon: <ShoppingBag className="h-5 w-5" />,
      discount: "15% OFF",
      color: "from-blue-500 to-cyan-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navbar />
      <div className="flex">
        {!isMobile && <Sidebar />}
        <main className="flex-1">
          <div className="container mx-auto p-6">
            {/* Enhanced Header */}
            <div className="text-center mb-12 animate-fade-in">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent">
                  Featured Offers & Promotions
                </h1>
                <Sparkles className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover exclusive deals and services for your group travel adventures
              </p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-green-600">New deals added weekly!</span>
              </div>
            </div>

            {/* Quick Deals Strip */}
            <section className="mb-12">
              <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 rounded-xl p-6 border border-primary/20">
                <h2 className="text-xl font-bold text-center mb-6 flex items-center justify-center gap-2">
                  <Gift className="h-6 w-6 text-primary" />
                  Flash Deals - Limited Time Only!
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {quickDeals.map((deal) => (
                    <div key={deal.id} className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-white/20 hover:scale-105 transition-transform">
                      <div className={`w-12 h-12 bg-gradient-to-r ${deal.color} rounded-full flex items-center justify-center mx-auto mb-3 text-white`}>
                        {deal.icon}
                      </div>
                      <h3 className="font-semibold text-sm mb-1">{deal.title}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{deal.description}</p>
                      <Badge className="bg-red-500 text-white text-xs">{deal.discount}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Enhanced Banner Ads Section */}
            <section className="mb-16">
              <div className="relative group">
                <Card className="overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-500">
                  <div className={`relative h-72 md:h-96 bg-gradient-to-r ${bannerAds[currentBannerIndex].gradient}`}>
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    
                    {/* Floating elements */}
                    <div className="absolute top-6 right-6 animate-bounce">
                      <Gift className="h-8 w-8 text-white/80" />
                    </div>
                    
                    <div className="relative z-10 h-full flex items-center justify-center text-center text-white p-6">
                      <div className="space-y-6">
                        <Badge className="bg-red-500/90 backdrop-blur-sm border-0 text-white shadow-lg hover:bg-red-600 transition-colors">
                          <Sparkles className="h-4 w-4 mr-2" />
                          Limited Time Offer
                        </Badge>
                        <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                          {bannerAds[currentBannerIndex].title}
                        </h2>
                        <p className="text-lg md:text-xl opacity-90 max-w-md mx-auto">
                          {bannerAds[currentBannerIndex].description}
                        </p>
                        <Button 
                          size="lg" 
                          className="bg-white text-black hover:bg-gray-100 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 font-semibold"
                        >
                          {bannerAds[currentBannerIndex].cta}
                          <ExternalLink className="ml-2 h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Enhanced Navigation Dots */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
                      {bannerAds.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentBannerIndex(index)}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            index === currentBannerIndex 
                              ? 'bg-white scale-125 shadow-lg' 
                              : 'bg-white/50 hover:bg-white/70'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            </section>

            {/* Enhanced Sponsored Cards Section */}
            <section className="mb-16">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold mb-4">Sponsored Travel Experiences</h2>
                <p className="text-muted-foreground">Handpicked adventures for unforgettable group memories</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sponsoredCards.map((card, index) => (
                  <Card 
                    key={card.id} 
                    className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] bg-gradient-to-br from-white to-gray-50/50"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <Badge className="absolute top-4 right-4 z-10 bg-orange-500/90 backdrop-blur-sm border-0 text-white shadow-lg">
                      <Star className="h-3 w-3 mr-1" />
                      Sponsored
                    </Badge>
                    
                    <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 relative overflow-hidden">
                      <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-80`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Category Badge */}
                      <Badge className="absolute bottom-4 left-4 z-10 bg-white/90 text-gray-800 backdrop-blur-sm border-0">
                        {card.category}
                      </Badge>
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Button variant="secondary" size="sm" className="transform scale-90 group-hover:scale-100 transition-transform">
                          View Details
                        </Button>
                      </div>
                    </div>
                    
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {card.title}
                        </CardTitle>
                        <div className="text-right">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                            <span className="font-medium">{card.rating}</span>
                            <span className="ml-1">({card.reviews})</span>
                          </div>
                        </div>
                      </div>
                      <CardDescription className="text-sm leading-relaxed">
                        {card.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-primary">{card.price}</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="hover:bg-primary hover:text-primary-foreground transition-all duration-300 group-hover:shadow-md"
                        >
                          Learn More
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Enhanced Affiliate Offers Section */}
            <section className="mb-16">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold mb-4">Exclusive Partner Offers</h2>
                <p className="text-muted-foreground">Special discounts from our trusted partners</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {affiliateOffers.map((offer, index) => (
                  <Card 
                    key={offer.id} 
                    className="group text-center hover:shadow-xl transition-all duration-500 hover:scale-105 border-0 bg-gradient-to-br from-white to-gray-50/50"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <CardHeader className="pb-4">
                      <div className={`mx-auto w-16 h-16 bg-gradient-to-br ${offer.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow group-hover:scale-110 transform duration-300`}>
                        <div className="text-white">
                          {offer.icon}
                        </div>
                      </div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {offer.title}
                      </CardTitle>
                      <Badge 
                        variant="secondary" 
                        className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200 font-semibold"
                      >
                        {offer.discount}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {offer.description}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium">
                        Partner: {offer.provider}
                      </p>
                      <Button 
                        className="w-full shadow-md hover:shadow-lg transition-all duration-300 group-hover:scale-105" 
                        size="sm"
                      >
                        Get Offer
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Enhanced Disclaimer */}
            <section>
              <Card className="bg-gradient-to-r from-muted/30 to-muted/50 border-0 shadow-inner">
                <CardContent className="p-6">
                  <p className="text-xs text-muted-foreground text-center leading-relaxed">
                    <strong className="text-foreground">Disclaimer:</strong> These are sponsored advertisements and affiliate offers. 
                    Splittos may receive compensation for clicks or purchases made through these links. 
                    All offers are subject to partner terms and conditions. Prices and availability may vary.
                  </p>
                </CardContent>
              </Card>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Advertising;
