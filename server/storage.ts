import { type Video, type Playlist, type DownloadProgress } from "@shared/schema";

export interface IStorage {
  // Video/Playlist operations
  getVideoInfo(url: string): Promise<Video | undefined>;
  getPlaylistInfo(url: string): Promise<Playlist | undefined>;
  
  // Download progress tracking
  getDownloadProgress(id: string): Promise<DownloadProgress | undefined>;
  setDownloadProgress(progress: DownloadProgress): Promise<void>;
  removeDownloadProgress(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private downloadProgress: Map<string, DownloadProgress>;

  constructor() {
    this.downloadProgress = new Map();
  }

  async getVideoInfo(url: string): Promise<Video | undefined> {
    // This will be implemented with ytdl-core in routes
    return undefined;
  }

  async getPlaylistInfo(url: string): Promise<Playlist | undefined> {
    // This will be implemented with ytdl-core in routes
    return undefined;
  }

  async getDownloadProgress(id: string): Promise<DownloadProgress | undefined> {
    return this.downloadProgress.get(id);
  }

  async setDownloadProgress(progress: DownloadProgress): Promise<void> {
    this.downloadProgress.set(progress.id, progress);
  }

  async removeDownloadProgress(id: string): Promise<void> {
    this.downloadProgress.delete(id);
  }
}

export const storage = new MemStorage();
