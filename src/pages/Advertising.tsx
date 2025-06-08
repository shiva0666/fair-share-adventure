
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Megaphone, Users, BarChart3, Mail, Target, TrendingUp } from "lucide-react";

const Advertising = () => {
  const isMobile = useIsMobile();

  const adPackages = [
    {
      id: 1,
      name: "Starter Package",
      description: "Perfect for small businesses and local tour operators",
      price: "$99/month",
      features: [
        "Banner ads on trip pages",
        "Up to 1,000 impressions",
        "Basic analytics",
        "Email support"
      ],
      highlight: false
    },
    {
      id: 2,
      name: "Professional Package",
      description: "Ideal for travel agencies and medium-sized businesses",
      price: "$299/month",
      features: [
        "Premium banner placements",
        "Up to 10,000 impressions",
        "Detailed analytics dashboard",
        "Priority support",
        "Custom ad creatives"
      ],
      highlight: true
    },
    {
      id: 3,
      name: "Enterprise Package",
      description: "For large brands and tourism boards",
      price: "Custom pricing",
      features: [
        "Full homepage takeover",
        "Unlimited impressions",
        "Advanced targeting",
        "Dedicated account manager",
        "Custom integrations"
      ],
      highlight: false
    }
  ];

  const stats = [
    { label: "Monthly Active Users", value: "50K+", icon: Users },
    { label: "Trip Views", value: "200K+", icon: BarChart3 },
    { label: "Avg. Session Duration", value: "8.5 min", icon: TrendingUp },
    { label: "User Engagement", value: "85%", icon: Target }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        {!isMobile && <Sidebar />}
        <main className="flex-1">
          <div className="container mx-auto p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <Megaphone className="h-8 w-8 text-primary" />
                Advertising with Splittos
              </h1>
              <p className="text-muted-foreground">
                Reach thousands of travel enthusiasts and group organizers with our targeted advertising solutions
              </p>
            </div>

            {/* Platform Stats */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6">Platform Reach</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <Card key={index}>
                    <CardContent className="p-6 text-center">
                      <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Advertising Packages */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6">Advertising Packages</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {adPackages.map((pkg) => (
                  <Card key={pkg.id} className={`relative ${pkg.highlight ? 'border-primary shadow-lg' : ''}`}>
                    {pkg.highlight && (
                      <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        Most Popular
                      </Badge>
                    )}
                    <CardHeader>
                      <CardTitle>{pkg.name}</CardTitle>
                      <CardDescription>{pkg.description}</CardDescription>
                      <div className="text-2xl font-bold text-primary">{pkg.price}</div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 mb-6">
                        {pkg.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className="w-full" 
                        variant={pkg.highlight ? "default" : "outline"}
                      >
                        Get Started
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Why Advertise with Splittos */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6">Why Choose Splittos for Advertising?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>🎯 Targeted Audience</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Reach active travelers who are already planning group trips and looking for experiences, 
                      accommodations, and travel services.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>📊 Detailed Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Track your campaign performance with comprehensive analytics including impressions, 
                      clicks, conversions, and ROI metrics.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>🚀 High Engagement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Our users spend significant time planning their trips, making them highly engaged 
                      with relevant travel content and advertisements.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>🤝 Partnership Opportunities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Beyond advertising, explore partnership opportunities for featured recommendations, 
                      exclusive offers, and co-marketing initiatives.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Contact Section */}
            <section>
              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2">
                    <Mail className="h-5 w-5" />
                    Ready to Get Started?
                  </CardTitle>
                  <CardDescription>
                    Contact our advertising team to discuss custom packages and partnership opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button size="lg" className="mr-4">
                      Contact Sales Team
                    </Button>
                    <Button variant="outline" size="lg">
                      Download Media Kit
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Email: advertising@splittos.com | Phone: (555) 123-4567
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
