import { useState } from "react";
import { Download, ChevronDown, Eye, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Playlist, Video } from "@shared/schema";

interface PlaylistPreviewProps {
  playlist: Playlist;
  onDownloadStart: (downloadId: string) => void;
}

export default function PlaylistPreview({ playlist, onDownloadStart }: PlaylistPreviewProps) {
  const [showAllVideos, setShowAllVideos] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const { toast } = useToast();

  const displayVideos = showAllVideos ? playlist.videos : playlist.videos.slice(0, 3);

  const handleDownloadAll = async () => {
    setIsDownloadingAll(true);
    
    try {
      // Download all videos in the playlist
      for (const video of playlist.videos) {
        const response = await apiRequest("POST", "/api/download", {
          url: video.url,
          format: "mp4-1080p",
          videoId: video.id,
        });
        
        const result = await response.json();
        onDownloadStart(result.downloadId);
      }
      
      toast({
        title: "Playlist Downloads Started",
        description: `Started downloading ${playlist.videos.length} videos.`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to start downloads",
        variant: "destructive",
      });
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const handleSingleDownload = async (video: Video, format: string) => {
    try {
      const response = await apiRequest("POST", "/api/download", {
        url: video.url,
        format: format,
        videoId: video.id,
      });
      
      const result = await response.json();
      onDownloadStart(result.downloadId);
      
      toast({
        title: "Download Started",
        description: `Started downloading "${video.title}".`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to start download",
        variant: "destructive",
      });
    }
  };

  const formatOptions = [
    { value: "mp4-1080p", label: "1080p" },
    { value: "mp4-720p", label: "720p" },
    { value: "mp3", label: "MP3" },
  ];

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{playlist.title}</h3>
            <p className="text-gray-600 mt-1">
              {playlist.videoCount} videos • {playlist.totalDuration}
            </p>
          </div>
          <Button
            onClick={handleDownloadAll}
            disabled={isDownloadingAll}
            className="bg-youtube-primary hover:bg-blue-700 text-white font-medium"
          >
            <Download className="w-4 h-4 mr-2" />
            {isDownloadingAll ? "Starting..." : "Download All"}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {displayVideos.map((video, index) => (
            <VideoListItem
              key={video.id}
              video={video}
              onDownload={handleSingleDownload}
              formatOptions={formatOptions}
            />
          ))}
        </div>

        {playlist.videos.length > 3 && (
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              onClick={() => setShowAllVideos(!showAllVideos)}
              className="text-youtube-primary hover:text-blue-700 font-medium"
            >
              {showAllVideos ? "Show less" : `Show all ${playlist.videoCount} videos`}
              <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showAllVideos ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface VideoListItemProps {
  video: Video;
  onDownload: (video: Video, format: string) => void;
  formatOptions: { value: string; label: string }[];
}

function VideoListItem({ video, onDownload, formatOptions }: VideoListItemProps) {
  const [selectedFormat, setSelectedFormat] = useState("mp4-1080p");

  return (
    <div className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex-shrink-0 relative">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-20 h-12 object-cover rounded"
        />
        <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white px-1 py-0.5 rounded text-xs">
          {video.duration}
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 truncate">
          {video.title}
        </h4>
        {(video.viewCount || video.publishDate) && (
          <div className="flex items-center gap-2 mt-1">
            {video.viewCount && (
              <span className="text-xs text-gray-500 flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                {video.viewCount}
              </span>
            )}
            {video.publishDate && (
              <span className="text-xs text-gray-500 flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {video.publishDate}
              </span>
            )}
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <Select value={selectedFormat} onValueChange={setSelectedFormat}>
          <SelectTrigger className="w-20 h-8 text-xs">
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
          size="sm"
          variant="ghost"
          onClick={() => onDownload(video, selectedFormat)}
          className="p-2 h-8 w-8 text-gray-400 hover:text-youtube-success transition-colors"
        >
          <Download className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
