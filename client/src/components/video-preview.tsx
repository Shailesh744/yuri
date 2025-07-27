import { useState } from "react";
import { Eye, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Video } from "@shared/schema";

interface VideoPreviewProps {
  video: Video;
  onDownloadStart: (downloadId: string) => void;
}

export default function VideoPreview({ video, onDownloadStart }: VideoPreviewProps) {
  const [selectedFormat, setSelectedFormat] = useState<string>("mp4-1080p");
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    setIsDownloading(true);
    
    try {
      const response = await apiRequest("POST", "/api/download", {
        url: video.url,
        format: selectedFormat,
        videoId: video.id,
      });
      
      const result = await response.json();
      onDownloadStart(result.downloadId);
      
      toast({
        title: "Download Started",
        description: "Your video download has begun.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to start download",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const formatOptions = [
    { value: "mp4-1080p", label: "MP4 - 1080p (Best Quality)" },
    { value: "mp4-720p", label: "MP4 - 720p (Good Quality)" },
    { value: "mp4-480p", label: "MP4 - 480p (Medium Quality)" },
    { value: "mp3", label: "MP3 - Audio Only" },
  ];

  return (
    <Card className="shadow-lg overflow-hidden mb-8">
      <div className="md:flex">
        <div className="md:w-1/3 relative">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-48 md:h-full object-cover"
          />
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm font-medium">
            {video.duration}
          </div>
        </div>
        
        <div className="p-6 md:w-2/3">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
            {video.title}
          </h3>
          
          {video.description && (
            <p className="text-gray-600 mb-4 line-clamp-3">
              {video.description}
            </p>
          )}
          
          <div className="flex flex-wrap gap-2 mb-4">
            {video.viewCount && (
              <Badge variant="secondary" className="flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                {video.viewCount}
              </Badge>
            )}
            {video.publishDate && (
              <Badge variant="secondary" className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {video.publishDate}
              </Badge>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formatOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                onClick={handleDownload}
                disabled={isDownloading}
                className="bg-youtube-success hover:bg-green-600 text-white font-medium"
              >
                <Download className="w-4 h-4 mr-2" />
                {isDownloading ? "Starting..." : "Download"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}