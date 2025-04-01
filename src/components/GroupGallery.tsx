import { useState } from "react";
import { Group } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Upload, X, Download, Send, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface GroupGalleryProps {
  group: Group;
}

interface GalleryImage {
  id: string;
  url: string;
  name: string;
  uploadedAt: string;
}

export function GroupGallery({ group }: GroupGalleryProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [shareEmail, setShareEmail] = useState("");
  const [shareMessage, setShareMessage] = useState(`Check out these photos from our ${group.name} group!`);
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploading(true);
      
      setTimeout(() => {
        const newImages = Array.from(e.target.files || []).map((file) => ({
          id: Math.random().toString(36).substring(2, 9),
          url: URL.createObjectURL(file),
          name: file.name,
          uploadedAt: new Date().toISOString(),
        }));
        
        setImages([...images, ...newImages]);
        setUploading(false);
        
        toast({
          title: "Images uploaded",
          description: `${newImages.length} image(s) uploaded successfully.`,
        });
      }, 1500);
    }
  };

  const handleDeleteImage = (id: string) => {
    setImages(images.filter(img => img.id !== id));
    toast({
      title: "Image deleted",
      description: "The image has been removed from the gallery.",
    });
  };

  const handleShareImages = () => {
    setShareDialogOpen(true);
    setSelectedImages(images.map(img => img.id));
  };

  const toggleImageSelection = (id: string) => {
    setSelectedImages(prev => 
      prev.includes(id) 
        ? prev.filter(imgId => imgId !== id)
        : [...prev, id]
    );
  };

  const handleSendShare = () => {
    setIsSharing(true);
    
    setTimeout(() => {
      setIsSharing(false);
      setShareDialogOpen(false);
      
      toast({
        title: "Images shared",
        description: `${selectedImages.length} image(s) have been shared with ${shareEmail}.`,
      });
      
      setShareEmail("");
      setSelectedImages([]);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Group Photos</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleShareImages} disabled={images.length === 0}>
              <Send className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Label htmlFor="upload-images" className="mb-0">
              <Button variant="default" asChild>
                <div>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Photos
                </div>
              </Button>
            </Label>
            <Input 
              id="upload-images" 
              type="file" 
              accept="image/*" 
              multiple 
              className="hidden" 
              onChange={handleFileUpload}
            />
          </div>
        </CardHeader>
        <CardContent>
          {uploading && (
            <div className="p-8 text-center">
              <div className="animate-pulse">Uploading images...</div>
            </div>
          )}
          
          {images.length === 0 && !uploading ? (
            <div className="text-center p-8 border border-dashed rounded-lg">
              <p className="text-muted-foreground mb-4">No photos uploaded yet.</p>
              <Label htmlFor="upload-empty" className="cursor-pointer">
                <Button variant="outline" asChild>
                  <div>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload your first photo
                  </div>
                </Button>
              </Label>
              <Input 
                id="upload-empty" 
                type="file" 
                accept="image/*" 
                multiple 
                className="hidden" 
                onChange={handleFileUpload}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <div 
                  key={image.id} 
                  className="group relative rounded-lg overflow-hidden border"
                >
                  <img 
                    src={image.url} 
                    alt={image.name} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => window.open(image.url, '_blank')}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteImage(image.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-2 text-xs truncate">{image.name}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Share Photos</DialogTitle>
            <DialogDescription>
              Select photos to share with others.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="share-email">Share with</Label>
              <Input 
                id="share-email" 
                type="email" 
                placeholder="Enter email address" 
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="share-message">Message</Label>
              <Input 
                id="share-message" 
                placeholder="Add a message" 
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Select Photos</Label>
              <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto p-1">
                {images.map(image => (
                  <div 
                    key={image.id} 
                    className={`relative rounded overflow-hidden border-2 ${
                      selectedImages.includes(image.id) ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img 
                      src={image.url} 
                      alt={image.name} 
                      className="w-full h-24 object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Checkbox 
                        checked={selectedImages.includes(image.id)}
                        onCheckedChange={() => toggleImageSelection(image.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShareDialogOpen(false)}
              disabled={isSharing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendShare}
              disabled={isSharing || !shareEmail || selectedImages.length === 0}
            >
              {isSharing ? "Sharing..." : "Share"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
