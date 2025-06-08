
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Star, MapPin, Camera, Plane, Hotel, Car } from "lucide-react";
import { useState } from "react";

const Advertising = () => {
  const isMobile = useIsMobile();
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Banner ads data
  const bannerAds = [
    {
      id: 1,
      title: "Travel More, Spend Less",
      description: "Get 20% off your next group booking with TravelDeals",
      image: "/placeholder.svg",
      cta: "Book Now",
      link: "#"
    },
    {
      id: 2,
      title: "Premium Hotels Worldwide",
      description: "Luxury accommodations for your group trips",
      image: "/placeholder.svg",
      cta: "Explore Hotels",
      link: "#"
    },
    {
      id: 3,
      title: "Group Flight Discounts",
      description: "Save up to 30% on group flight bookings",
      image: "/placeholder.svg",
      cta: "Find Flights",
      link: "#"
    }
  ];

  // Sponsored cards data
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
      category: "Adventure"
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
      category: "Cultural"
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
      category: "Beach"
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
      category: "Adventure"
    }
  ];

  // Affiliate offers
  const affiliateOffers = [
    {
      id: 1,
      title: "Travel Insurance",
      description: "Protect your group trip with comprehensive travel insurance",
      discount: "15% OFF",
      provider: "SafeTravel Insurance",
      icon: <Star className="h-5 w-5" />,
      link: "#"
    },
    {
      id: 2,
      title: "Car Rentals",
      description: "Rent vehicles for your group at discounted rates",
      discount: "25% OFF",
      provider: "RentACar Plus",
      icon: <Car className="h-5 w-5" />,
      link: "#"
    },
    {
      id: 3,
      title: "Travel Gear",
      description: "Essential travel accessories and luggage for groups",
      discount: "20% OFF",
      provider: "TravelGear Pro",
      icon: <Camera className="h-5 w-5" />,
      link: "#"
    }
  ];

  const nextBanner = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % bannerAds.length);
  };

  const prevBanner = () => {
    setCurrentBannerIndex((prev) => (prev - 1 + bannerAds.length) % bannerAds.length);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        {!isMobile && <Sidebar />}
        <main className="flex-1">
          <div className="container mx-auto p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Featured Offers & Promotions</h1>
              <p className="text-muted-foreground">
                Discover exclusive deals and services for your group travel adventures
              </p>
            </div>

            {/* Banner Ads Section */}
            <section className="mb-12">
              <div className="relative">
                <Card className="overflow-hidden">
                  <div className="relative h-64 md:h-80 bg-gradient-to-r from-blue-500 to-purple-600">
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="relative z-10 h-full flex items-center justify-center text-center text-white p-6">
                      <div>
                        <Badge className="mb-4 bg-red-500">Advertisement</Badge>
                        <h2 className="text-2xl md:text-4xl font-bold mb-4">
                          {bannerAds[currentBannerIndex].title}
                        </h2>
                        <p className="text-lg mb-6 opacity-90">
                          {bannerAds[currentBannerIndex].description}
                        </p>
                        <Button size="lg" className="bg-white text-black hover:bg-gray-100">
                          {bannerAds[currentBannerIndex].cta}
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {bannerAds.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentBannerIndex(index)}
                          className={`w-3 h-3 rounded-full ${
                            index === currentBannerIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            </section>

            {/* Sponsored Cards Section */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6">Sponsored Travel Experiences</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {sponsoredCards.map((card) => (
                  <Card key={card.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                    <Badge className="absolute top-4 right-4 z-10 bg-orange-500">Sponsored</Badge>
                    <div className="aspect-video bg-gray-200 relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <Badge className="absolute bottom-4 left-4 z-10">{card.category}</Badge>
                    </div>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{card.title}</CardTitle>
                        <div className="text-right">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                            {card.rating} ({card.reviews})
                          </div>
                        </div>
                      </div>
                      <CardDescription className="text-sm">{card.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-primary">{card.price}</span>
                        <Button variant="outline" size="sm">
                          Learn More
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Affiliate Offers Section */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6">Exclusive Partner Offers</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {affiliateOffers.map((offer) => (
                  <Card key={offer.id} className="text-center hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        {offer.icon}
                      </div>
                      <CardTitle className="text-lg">{offer.title}</CardTitle>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {offer.discount}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{offer.description}</p>
                      <p className="text-xs text-muted-foreground mb-4">Partner: {offer.provider}</p>
                      <Button className="w-full" size="sm">
                        Get Offer
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Disclaimer */}
            <section>
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground text-center">
                    <strong>Disclaimer:</strong> These are sponsored advertisements and affiliate offers. 
                    Splittos may receive compensation for clicks or purchases made through these links. 
                    All offers are subject to partner terms and conditions.
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
