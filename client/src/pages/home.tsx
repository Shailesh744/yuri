import { useState } from "react";
import { Download, HelpCircle, Info } from "lucide-react";
import UrlInput from "@/components/url-input";
import LoadingState from "@/components/loading-state";
import VideoPreview from "@/components/video-preview";
import PlaylistPreview from "@/components/playlist-preview";
import DownloadProgress from "@/components/download-progress";
import ErrorState from "@/components/error-state";
import type { Video, Playlist } from "@shared/schema";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<{ type: 'video' | 'playlist'; data: Video | Playlist } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloads, setDownloads] = useState<string[]>([]);

  const handleFetchSuccess = (result: { type: 'video' | 'playlist'; data: Video | Playlist }) => {
    setData(result);
    setError(null);
    setIsLoading(false);
  };

  const handleFetchError = (errorMessage: string) => {
    setError(errorMessage);
    setData(null);
    setIsLoading(false);
  };

  const handleDownloadStart = (downloadId: string) => {
    setDownloads(prev => [...prev, downloadId]);
  };

  const handleDownloadComplete = (downloadId: string) => {
    setDownloads(prev => prev.filter(id => id !== downloadId));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Download className="text-youtube-primary text-2xl w-6 h-6" />
              <h1 className="text-xl font-semibold text-gray-900">YouTube Downloader</h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="text-gray-600 hover:text-youtube-primary transition-colors flex items-center">
                <HelpCircle className="w-4 h-4 mr-1" />
                Help
              </a>
              <a href="#" className="text-gray-600 hover:text-youtube-primary transition-colors flex items-center">
                <Info className="w-4 h-4 mr-1" />
                About
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UrlInput
          onLoadingChange={setIsLoading}
          onSuccess={handleFetchSuccess}
          onError={handleFetchError}
        />

        {isLoading && <LoadingState />}

        {error && <ErrorState message={error} />}

        {data?.type === 'video' && (
          <VideoPreview 
            video={data.data as Video} 
            onDownloadStart={handleDownloadStart}
          />
        )}

        {data?.type === 'playlist' && (
          <PlaylistPreview 
            playlist={data.data as Playlist} 
            onDownloadStart={handleDownloadStart}
          />
        )}

        {downloads.length > 0 && (
          <DownloadProgress 
            downloadIds={downloads}
            onDownloadComplete={handleDownloadComplete}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">YouTube Video Downloader - Free & Fast</p>
            <p className="text-sm flex items-center justify-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Privacy-focused • No data stored • Open source
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
