import { z } from "zod";

export const videoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  thumbnail: z.string(),
  duration: z.string(),
  viewCount: z.string().optional(),
  publishDate: z.string().optional(),
  url: z.string(),
});

export const playlistSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  videoCount: z.number(),
  totalDuration: z.string(),
  videos: z.array(videoSchema),
});

export const downloadProgressSchema = z.object({
  id: z.string(),
  filename: z.string(),
  progress: z.number(),
  downloadedBytes: z.number(),
  totalBytes: z.number(),
  speed: z.string(),
  status: z.enum(['downloading', 'completed', 'error']),
});

export const urlInputSchema = z.object({
  url: z.string().url("Please enter a valid URL").refine((url) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  }, "Please enter a valid YouTube URL"),
});

export const downloadRequestSchema = z.object({
  url: z.string().url(),
  format: z.enum(['mp4-1080p', 'mp4-720p', 'mp4-480p', 'mp3']),
  videoId: z.string().optional(),
});

export type Video = z.infer<typeof videoSchema>;
export type Playlist = z.infer<typeof playlistSchema>;
export type DownloadProgress = z.infer<typeof downloadProgressSchema>;
export type UrlInput = z.infer<typeof urlInputSchema>;
export type DownloadRequest = z.infer<typeof downloadRequestSchema>;
