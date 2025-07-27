import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { urlInputSchema, downloadRequestSchema, type Video, type Playlist } from "@shared/schema";
import { randomUUID } from "crypto";
import ytdl from "@distube/ytdl-core";
import fs from "fs";
import path from "path";

// Real YouTube data fetching using ytdl-core
const getVideoInfo = async (url: string): Promise<Video> => {
  try {
    const info = await ytdl.getInfo(url);
    const videoDetails = info.videoDetails;
    
    return {
      id: videoDetails.videoId,
      title: videoDetails.title,
      description: videoDetails.description || undefined,
      thumbnail: videoDetails.thumbnails[videoDetails.thumbnails.length - 1]?.url || "",
      duration: formatDuration(parseInt(videoDetails.lengthSeconds)),
      viewCount: formatViewCount(parseInt(videoDetails.viewCount)),
      publishDate: formatPublishDate(videoDetails.publishDate),
      url: url,
    };
  } catch (error) {
    console.error('Error fetching video info:', error);
    throw new Error('Failed to fetch video information. Please check the URL and try again.');
  }
};

const getPlaylistInfo = async (url: string): Promise<Playlist> => {
  try {
    const playlistId = extractPlaylistId(url);
    if (!playlistId) {
      throw new Error('Invalid playlist URL');
    }

    // For now, we'll simulate playlist info since ytdl-core playlist support is complex
    // In a production app, you'd use YouTube API for playlist details
    const firstVideoUrl = url.split('&')[0]; // Get first video from playlist URL
    const firstVideo = await getVideoInfo(firstVideoUrl);
    
    return {
      id: playlistId,
      title: "YouTube Playlist",
      description: "Playlist containing multiple videos",
      videoCount: 1, // For demo, showing 1 video
      totalDuration: firstVideo.duration,
      videos: [firstVideo],
    };
  } catch (error) {
    console.error('Error fetching playlist info:', error);
    throw new Error('Failed to fetch playlist information. Please check the URL and try again.');
  }
};

// Helper functions
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const formatViewCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M views`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K views`;
  }
  return `${count} views`;
};

const formatPublishDate = (publishDate: string): string => {
  try {
    const date = new Date(publishDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  } catch {
    return 'Unknown date';
  }
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
        const playlistInfo = await getPlaylistInfo(url);
        res.json({ type: 'playlist', data: playlistInfo });
      } else {
        const videoInfo = await getVideoInfo(url);
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
      const isAudio = format === 'mp3';
      const extension = isAudio ? 'mp3' : 'mp4';
      const filename = `${videoId}_${format}.${extension}`;
      
      // Initialize download progress
      await storage.setDownloadProgress({
        id: downloadId,
        filename: filename,
        progress: 0,
        downloadedBytes: 0,
        totalBytes: 0,
        speed: "0 MB/s",
        status: 'downloading',
      });

      // Start actual download
      startYouTubeDownload(downloadId, url, format, filename);
      
      res.json({ downloadId, message: "Download started" });
    } catch (error) {
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Invalid download request" 
      });
    }
  });

  // Serve downloaded files
  app.get("/api/download/:id/file", async (req, res) => {
    try {
      const { id } = req.params;
      const progress = await storage.getDownloadProgress(id);
      
      if (!progress) {
        return res.status(404).json({ message: "Download not found" });
      }
      
      if (progress.status !== 'completed') {
        return res.status(400).json({ message: "Download not completed yet" });
      }
      
      const downloadsDir = path.join(process.cwd(), 'downloads');
      const filePath = path.join(downloadsDir, progress.filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found" });
      }
      
      // Set appropriate headers for file download
      res.setHeader('Content-Disposition', `attachment; filename="${progress.filename}"`);
      res.setHeader('Content-Type', progress.filename.endsWith('.mp3') ? 'audio/mpeg' : 'video/mp4');
      
      // Stream the file to the client
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
      
      // Clean up file after a delay
      setTimeout(() => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        storage.removeDownloadProgress(id);
      }, 300000); // Clean up after 5 minutes
      
    } catch (error) {
      res.status(500).json({ message: "Error serving file" });
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

// Real YouTube download function
async function startYouTubeDownload(downloadId: string, url: string, format: string, filename: string) {
  try {
    // Ensure downloads directory exists
    const downloadsDir = path.join(process.cwd(), 'downloads');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }
    
    const filePath = path.join(downloadsDir, filename);
    const isAudio = format === 'mp3';
    
    // Determine quality filter based on format
    let quality: any = 'highest';
    if (format === 'mp4-1080p') quality = 'highestvideo';
    else if (format === 'mp4-720p') quality = 'highestvideo';
    else if (format === 'mp4-480p') quality = 'lowestvideo';
    else if (format === 'mp3') quality = 'highestaudio';
    
    const stream = ytdl(url, {
      quality: quality,
      filter: isAudio ? 'audioonly' : 'videoandaudio',
    });
    
    const writeStream = fs.createWriteStream(filePath);
    
    let downloadedBytes = 0;
    let totalBytes = 0;
    let startTime = Date.now();
    
    stream.on('info', (info) => {
      const formats = ytdl.filterFormats(info.formats, isAudio ? 'audioonly' : 'videoandaudio');
      if (formats.length > 0) {
        totalBytes = parseInt(formats[0].contentLength || '0') || 50000000; // Default 50MB if unknown
      }
    });
    
    stream.on('data', async (chunk) => {
      downloadedBytes += chunk.length;
      const progress = totalBytes > 0 ? Math.round((downloadedBytes / totalBytes) * 100) : 0;
      const elapsed = (Date.now() - startTime) / 1000;
      const speed = elapsed > 0 ? `${(downloadedBytes / elapsed / 1024 / 1024).toFixed(1)} MB/s` : '0 MB/s';
      
      await storage.setDownloadProgress({
        id: downloadId,
        filename: filename,
        progress: Math.min(progress, 99), // Don't show 100% until actually complete
        downloadedBytes: downloadedBytes,
        totalBytes: totalBytes,
        speed: speed,
        status: 'downloading',
      });
    });
    
    stream.on('end', async () => {
      await storage.setDownloadProgress({
        id: downloadId,
        filename: filename,
        progress: 100,
        downloadedBytes: totalBytes || downloadedBytes,
        totalBytes: totalBytes || downloadedBytes,
        speed: "0 MB/s",
        status: 'completed',
      });
    });
    
    stream.on('error', async (error) => {
      console.error('Download error:', error);
      await storage.setDownloadProgress({
        id: downloadId,
        filename: filename,
        progress: 0,
        downloadedBytes: 0,
        totalBytes: 0,
        speed: "0 MB/s",
        status: 'error',
      });
      
      // Clean up partial file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
    
    stream.pipe(writeStream);
    
  } catch (error) {
    console.error('Error starting download:', error);
    await storage.setDownloadProgress({
      id: downloadId,
      filename: filename,
      progress: 0,
      downloadedBytes: 0,
      totalBytes: 0,
      speed: "0 MB/s",
      status: 'error',
    });
  }
}
