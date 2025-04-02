import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CreditCard, Users, Smartphone, Globe, Map, PieChart, CheckCircle } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-700 to-blue-500 text-white py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1000')] opacity-10 bg-cover bg-center"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Split Expenses with Friends, <span className="text-yellow-300">Hassle-Free</span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-gray-100 animate-fade-in">
              Splittos makes sharing expenses on trips simple and fair for everyone. No more awkward money conversations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Link to="/login">
                <Button size="lg" className="w-full sm:w-auto group">
                  Get Started
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 w-full sm:w-auto">
                  Learn More
                </Button>
              </a>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Why Choose Splittos?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card hover:shadow-lg transition-shadow duration-300 rounded-xl p-6 hover-scale">
              <div className="mb-4 bg-primary/10 p-3 rounded-full w-fit">
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Smart Expense Tracking</h3>
              <p className="text-muted-foreground">Track every expense automatically and see who owes what in real-time.</p>
            </div>
            
            <div className="bg-card hover:shadow-lg transition-shadow duration-300 rounded-xl p-6 hover-scale">
              <div className="mb-4 bg-primary/10 p-3 rounded-full w-fit">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Fair Split Options</h3>
              <p className="text-muted-foreground">Split bills equally or customize amounts for each person based on what they consumed.</p>
            </div>
            
            <div className="bg-card hover:shadow-lg transition-shadow duration-300 rounded-xl p-6 hover-scale">
              <div className="mb-4 bg-primary/10 p-3 rounded-full w-fit">
                <Smartphone className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Works Everywhere</h3>
              <p className="text-muted-foreground">Access your trips and expenses from any device with our responsive design.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">What Our Users Say</h2>
          
          <Carousel className="w-full max-w-4xl mx-auto">
            <CarouselContent>
              <CarouselItem>
                <div className="bg-card p-8 rounded-xl shadow-sm">
                  <p className="text-lg italic mb-6">"DiviTrip saved our friendship! After our trip to Europe, settling expenses was a breeze instead of a nightmare."</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">JD</div>
                    <div className="ml-4">
                      <p className="font-medium">Jamie Doe</p>
                      <p className="text-sm text-muted-foreground">Group Trip Organizer</p>
                    </div>
                  </div>
                </div>
              </CarouselItem>
              
              <CarouselItem>
                <div className="bg-card p-8 rounded-xl shadow-sm">
                  <p className="text-lg italic mb-6">"The custom split feature is amazing! Some friends ordered expensive drinks while others stayed sober, and DiviTrip made it fair for everyone."</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">SK</div>
                    <div className="ml-4">
                      <p className="font-medium">Sam Kim</p>
                      <p className="text-sm text-muted-foreground">Weekend Traveler</p>
                    </div>
                  </div>
                </div>
              </CarouselItem>
              
              <CarouselItem>
                <div className="bg-card p-8 rounded-xl shadow-sm">
                  <p className="text-lg italic mb-6">"I organize trips for large groups and DiviTrip has become essential. The email reports feature helps everyone keep track of their expenses."</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">MT</div>
                    <div className="ml-4">
                      <p className="font-medium">Maria Torres</p>
                      <p className="text-sm text-muted-foreground">Travel Coordinator</p>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            </CarouselContent>
            <div className="mt-6 flex justify-center">
              <CarouselPrevious className="static transform-none mx-2" />
              <CarouselNext className="static transform-none mx-2" />
            </div>
          </Carousel>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">How Splittos Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="mb-4 bg-purple-100 dark:bg-purple-900/30 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                <Globe className="h-10 w-10 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Create a Trip</h3>
              <p className="text-muted-foreground">Start by creating a new trip and inviting your friends to join.</p>
            </div>
            
            <div className="text-center">
              <div className="mb-4 bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                <CreditCard className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Add Expenses</h3>
              <p className="text-muted-foreground">Everyone can add their expenses as you go. Split them your way.</p>
            </div>
            
            <div className="text-center">
              <div className="mb-4 bg-green-100 dark:bg-green-900/30 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                <PieChart className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Track Balances</h3>
              <p className="text-muted-foreground">See who owes what in real-time with our intuitive dashboard.</p>
            </div>
            
            <div className="text-center">
              <div className="mb-4 bg-orange-100 dark:bg-orange-900/30 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                <CheckCircle className="h-10 w-10 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Settle Up</h3>
              <p className="text-muted-foreground">When the trip ends, everyone knows exactly what they owe.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1483058712412-4245e9b90334?auto=format&fit=crop&q=80&w=1000')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Make Trip Expenses Simple?</h2>
            <p className="text-xl mb-10">Join thousands of travelers who have simplified their group expenses.</p>
            <Link to="/login">
              <Button size="lg" className="bg-white text-purple-700 hover:bg-gray-100 hover:text-purple-800 transition-colors">
                Start Your Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">Splittos</h3>
              <p className="mb-4">Making group expenses fair and simple since 2023.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Features</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Expense Tracking</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Custom Splits</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Trip Management</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Email Reports</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Connect</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
            <p>© 2023 Splittos. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
