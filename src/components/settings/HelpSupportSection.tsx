import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, Clock } from "lucide-react";

const faqs = [
  {
    question: "How do I create a new trip or group?",
    answer: "To create a new trip or group, go to the dashboard and click on the 'New Trip' or 'New Group' button. Fill in the required details and click 'Create'.",
  },
  {
    question: "How are expenses split between participants?",
    answer: "By default, expenses are split equally among all participants. However, you can customize the split by selecting 'Custom Split' when adding or editing an expense.",
  },
  {
    question: "How do I add participants to my trip or group?",
    answer: "Go to your trip or group details page, click on the 'Participants' tab, and then click the 'Add Participant' button. You can add participants by email or invite them directly.",
  },
  {
    question: "How do I settle a debt?",
    answer: "Go to the 'Settlements' tab in your trip or group and click 'Mark as Settled' next to the payment. Confirm the settlement to update balances.",
  },
  {
    question: "Can I export my trip or group data?",
    answer: "Yes, you can export your data in various formats. Go to 'Profile & Settings' > 'App Settings' > 'Data Management' and select your preferred export format.",
  },
];

export const HelpSupportSection = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [feedbackType, setFeedbackType] = useState("question");
  const [feedbackText, setFeedbackText] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  
  const filteredFaqs = faqs.filter(
    (faq) => 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSendFeedback = () => {
    if (!feedbackText) {
      toast({
        title: "Missing Information",
        description: "Please enter your feedback before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, you'd send the feedback to the server
    toast({
      title: "Feedback Sent",
      description: "Thank you for your feedback! We'll review it shortly.",
    });
    
    setFeedbackText("");
    setContactEmail("");
  };
  
  return (
    <div className="space-y-6">
      {/* Company Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>
            Get in touch with our team directly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Email Support</p>
              <a 
                href="mailto:support@splittos.com" 
                className="text-primary hover:underline"
              >
                support@splittos.com
              </a>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Phone className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Phone Support</p>
              <a 
                href="tel:+911234567890" 
                className="text-primary hover:underline"
              >
                +91-123-456-7890
              </a>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Business Hours</p>
              <p className="text-muted-foreground">Monday - Friday, 10:00 AM to 6:00 PM IST</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>
            Find answers to common questions about using the app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="mb-4">
            <Input
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          
          {filteredFaqs.length > 0 ? (
            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <div key={index} className="space-y-2">
                  <h3 className="font-medium">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-6">
              <p className="text-muted-foreground">No results found. Try a different search term.</p>
            </div>
          )}
          
          <div className="pt-4 text-center">
            <Button variant="outline">View Full Help Center</Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Contact Support</CardTitle>
          <CardDescription>
            Have a problem or question? Get in touch with our support team
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feedback-type">Type</Label>
            <Select value={feedbackType} onValueChange={setFeedbackType}>
              <SelectTrigger id="feedback-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="question">Question</SelectItem>
                <SelectItem value="bug">Report a Bug</SelectItem>
                <SelectItem value="feature">Feature Request</SelectItem>
                <SelectItem value="feedback">General Feedback</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contact-email">Your Email (optional)</Label>
            <Input
              id="contact-email"
              type="email"
              placeholder="Where we can reach you"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="feedback-text">Message</Label>
            <Textarea
              id="feedback-text"
              placeholder="Describe your question, issue, or feedback in detail"
              rows={5}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
            />
          </div>
          
          <Button onClick={handleSendFeedback}>Send Message</Button>
        </CardContent>
      </Card>
    </div>
  );
};
