import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { urlInputSchema, downloadRequestSchema, type Video, type Playlist } from "@shared/schema";
import { randomUUID } from "crypto";

// Note: In a real implementation, you would install and use ytdl-core
// For now, we'll create a mock implementation that returns proper structure
const mockGetVideoInfo = async (url: string): Promise<Video> => {
  // Extract video ID from URL
  const videoId = extractVideoId(url);
  
  return {
    id: videoId,
    title: "Sample Video Title",
    description: "Sample video description",
    thumbnail: "https://i.ytimg.com/vi/" + videoId + "/maxresdefault.jpg",
    duration: "10:30",
    viewCount: "1.2M views",
    publishDate: "2 days ago",
    url: url,
  };
};

const mockGetPlaylistInfo = async (url: string): Promise<Playlist> => {
  const playlistId = extractPlaylistId(url);
  
  return {
    id: playlistId,
    title: "Sample Playlist Title",
    description: "Sample playlist description",
    videoCount: 3,
    totalDuration: "30:45",
    videos: [
      {
        id: "video1",
        title: "Video 1 Title",
        thumbnail: "https://i.ytimg.com/vi/video1/maxresdefault.jpg",
        duration: "8:42",
        url: "https://youtube.com/watch?v=video1",
      },
      {
        id: "video2", 
        title: "Video 2 Title",
        thumbnail: "https://i.ytimg.com/vi/video2/maxresdefault.jpg",
        duration: "15:23",
        url: "https://youtube.com/watch?v=video2",
      },
      {
        id: "video3",
        title: "Video 3 Title", 
        thumbnail: "https://i.ytimg.com/vi/video3/maxresdefault.jpg",
        duration: "22:17",
        url: "https://youtube.com/watch?v=video3",
      },
    ],
  };
};

function extractVideoId(url: string): string {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : 'defaultVideoId';
}

function extractPlaylistId(url: string): string {
  const regex = /[?&]list=([^&]+)/;
  const match = url.match(regex);
  return match ? match[1] : 'defaultPlaylistId';
}

function isPlaylistUrl(url: string): boolean {
  return url.includes('list=');
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Fetch video/playlist information
  app.post("/api/fetch-info", async (req, res) => {
    try {
      const { url } = urlInputSchema.parse(req.body);
      
      if (isPlaylistUrl(url)) {
        const playlistInfo = await mockGetPlaylistInfo(url);
        res.json({ type: 'playlist', data: playlistInfo });
      } else {
        const videoInfo = await mockGetVideoInfo(url);
        res.json({ type: 'video', data: videoInfo });
      }
    } catch (error) {
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Invalid URL format" 
      });
    }
  });

  // Start download
  app.post("/api/download", async (req, res) => {
    try {
      const { url, format, videoId } = downloadRequestSchema.parse(req.body);
      
      const downloadId = randomUUID();
      
      // Initialize download progress
      await storage.setDownloadProgress({
        id: downloadId,
        filename: `video.${format.includes('mp3') ? 'mp3' : 'mp4'}`,
        progress: 0,
        downloadedBytes: 0,
        totalBytes: 100000000, // 100MB mock
        speed: "0 MB/s",
        status: 'downloading',
      });

      // Simulate download progress
      simulateDownloadProgress(downloadId);
      
      res.json({ downloadId, message: "Download started" });
    } catch (error) {
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Invalid download request" 
      });
    }
  });

  // Get download progress
  app.get("/api/download/:id/progress", async (req, res) => {
    try {
      const { id } = req.params;
      const progress = await storage.getDownloadProgress(id);
      
      if (!progress) {
        return res.status(404).json({ message: "Download not found" });
      }
      
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Simulate download progress for demo purposes
async function simulateDownloadProgress(downloadId: string) {
  let progress = 0;
  const interval = setInterval(async () => {
    progress += Math.random() * 10;
    if (progress >= 100) {
      progress = 100;
      await storage.setDownloadProgress({
        id: downloadId,
        filename: `video.mp4`,
        progress: 100,
        downloadedBytes: 100000000,
        totalBytes: 100000000,
        speed: "0 MB/s",
        status: 'completed',
      });
      clearInterval(interval);
      
      // Clean up after 30 seconds
      setTimeout(async () => {
        await storage.removeDownloadProgress(downloadId);
      }, 30000);
    } else {
      await storage.setDownloadProgress({
        id: downloadId,
        filename: `video.mp4`,
        progress: Math.round(progress),
        downloadedBytes: Math.round((progress / 100) * 100000000),
        totalBytes: 100000000,
        speed: `${(Math.random() * 5 + 1).toFixed(1)} MB/s`,
        status: 'downloading',
      });
    }
  }, 1000);
}
