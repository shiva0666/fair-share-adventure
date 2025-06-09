import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Coffee, Star, Gift, ExternalLink, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SupportUs = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const handleSupportClick = (optionTitle: string) => {
    toast({
      title: "Thank you for your support!",
      description: `You've chosen to support us with ${optionTitle}. Redirecting to payment page...`,
    });
    // In a real app, you would redirect to payment processor
    console.log(`Support option selected: ${optionTitle}`);
  };

  const handleShareSplittos = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Splittos - Expense Splitting Made Easy',
        text: 'Check out Splittos, the best app for splitting expenses with friends and groups!',
        url: window.location.origin,
      }).then(() => {
        toast({
          title: "Thanks for sharing!",
          description: "You've helped spread the word about Splittos.",
        });
      }).catch((error) => {
        console.log('Error sharing:', error);
        handleFallbackShare();
      });
    } else {
      handleFallbackShare();
    }
  };

  const handleFallbackShare = () => {
    const shareText = `Check out Splittos, the best app for splitting expenses with friends and groups! ${window.location.origin}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        toast({
          title: "Link copied!",
          description: "Share link has been copied to your clipboard.",
        });
      }).catch(() => {
        toast({
          title: "Share Splittos",
          description: "Copy this link to share: " + window.location.origin,
        });
      });
    } else {
      toast({
        title: "Share Splittos",
        description: "Copy this link to share: " + window.location.origin,
      });
    }
  };

  const handleSendFeedback = () => {
    const subject = encodeURIComponent("Feedback for Splittos");
    const body = encodeURIComponent("Hi Splittos team,\n\nI have some feedback about the app:\n\n");
    const mailtoLink = `mailto:support@splittos.com?subject=${subject}&body=${body}`;
    
    window.open(mailtoLink, '_blank');
    
    toast({
      title: "Feedback form opened",
      description: "Your email client should open with a pre-filled feedback email.",
    });
  };

  const supportOptions = [
    {
      title: "Buy us a Coffee",
      description: "Support our development with a small donation",
      icon: <Coffee className="w-8 h-8" />,
      amount: "$5",
      color: "bg-amber-100 text-amber-800",
      popular: false
    },
    {
      title: "Monthly Supporter",
      description: "Help us maintain and improve Splittos regularly",
      icon: <Heart className="w-8 h-8" />,
      amount: "$10/month",
      color: "bg-pink-100 text-pink-800",
      popular: true
    },
    {
      title: "Feature Sponsor",
      description: "Sponsor a specific feature development",
      icon: <Star className="w-8 h-8" />,
      amount: "$50",
      color: "bg-yellow-100 text-yellow-800",
      popular: false
    }
  ];

  const teamMembers = [
    {
      name: "Alex",
      role: "Lead Developer",
      avatar: "/placeholder.svg",
      favorite: "Building seamless user experiences"
    },
    {
      name: "Sarah",
      role: "UX Designer",
      avatar: "/placeholder.svg",
      favorite: "Creating intuitive interfaces"
    },
    {
      name: "Mike",
      role: "Backend Engineer",
      avatar: "/placeholder.svg",
      favorite: "Optimizing performance and security"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        {!isMobile && <Sidebar />}
        <main className="flex-1">
          <div className="container mx-auto p-6">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">
                <Heart className="w-10 h-10 inline-block mr-3 text-pink-500" />
                Support Splittos
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Help us keep Splittos free and amazing for everyone. Your support helps us 
                build new features, fix bugs, and maintain our servers.
              </p>
            </div>

            {/* Support Options */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-center mb-8">Choose Your Support Level</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {supportOptions.map((option, index) => (
                  <Card key={index} className={`relative hover:shadow-lg transition-shadow ${option.popular ? 'ring-2 ring-primary' : ''}`}>
                    {option.popular && (
                      <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        Most Popular
                      </Badge>
                    )}
                    <CardHeader className="text-center">
                      <div className={`w-16 h-16 rounded-full ${option.color} flex items-center justify-center mx-auto mb-4`}>
                        {option.icon}
                      </div>
                      <CardTitle>{option.title}</CardTitle>
                      <CardDescription>{option.description}</CardDescription>
                      <div className="text-2xl font-bold text-primary mt-2">{option.amount}</div>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        className="w-full" 
                        variant={option.popular ? "default" : "outline"}
                        onClick={() => handleSupportClick(option.title)}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Support Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Impact Section */}
            <section className="mb-12">
              <div className="bg-muted/50 rounded-lg p-8">
                <h2 className="text-2xl font-semibold text-center mb-6">Your Impact</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-primary mb-2">10K+</div>
                    <div className="text-sm text-muted-foreground">Happy Users</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary mb-2">500+</div>
                    <div className="text-sm text-muted-foreground">Groups Created</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary mb-2">$2M+</div>
                    <div className="text-sm text-muted-foreground">Expenses Tracked</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Team Section */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-center mb-8">Meet the Team</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {teamMembers.map((member, index) => (
                  <Card key={index} className="text-center">
                    <CardHeader>
                      <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                        <Users className="w-8 h-8" />
                      </div>
                      <CardTitle>{member.name}</CardTitle>
                      <CardDescription>{member.role}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground italic">
                        "{member.favorite}"
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Alternative Support */}
            <section>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5" />
                    Other Ways to Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Share the Love</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Tell your friends about Splittos and help us grow our community.
                      </p>
                      <Button variant="outline" size="sm" onClick={handleShareSplittos}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Share Splittos
                      </Button>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Give Feedback</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Your suggestions help us build better features and improve the app.
                      </p>
                      <Button variant="outline" size="sm" onClick={handleSendFeedback}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Send Feedback
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SupportUs;
