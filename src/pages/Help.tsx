
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { HelpSupportSection } from "@/components/settings/HelpSupportSection";

const Help = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        {!isMobile && <Sidebar />}
        <main className="flex-1">
          <div className="container mx-auto p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Help & Support</h1>
              <p className="text-muted-foreground">
                Get help with using Splittos or contact our support team
              </p>
            </div>
            
            <HelpSupportSection />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Help;
