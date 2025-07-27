import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { DownloadProgress as DownloadProgressType } from "@shared/schema";

interface DownloadProgressProps {
  downloadIds: string[];
  onDownloadComplete: (downloadId: string) => void;
}

export default function DownloadProgress({ downloadIds, onDownloadComplete }: DownloadProgressProps) {
  return (
    <Card className="shadow-lg mt-8">
      <CardHeader>
        <CardTitle>Download Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {downloadIds.map((downloadId) => (
            <DownloadItem
              key={downloadId}
              downloadId={downloadId}
              onComplete={() => onDownloadComplete(downloadId)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface DownloadItemProps {
  downloadId: string;
  onComplete: () => void;
}

function DownloadItem({ downloadId, onComplete }: DownloadItemProps) {
  const { data: progress, isError } = useQuery<DownloadProgressType>({
    queryKey: ["/api/download", downloadId, "progress"],
    refetchInterval: 1000,
    enabled: true,
  });

  useEffect(() => {
    if (progress?.status === 'completed') {
      setTimeout(() => {
        onComplete();
      }, 3000); // Show completed state for 3 seconds
    }
  }, [progress?.status, onComplete]);

  if (isError || !progress) {
    return (
      <div className="border border-red-200 rounded-lg p-4 bg-red-50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-red-900">Download Error</span>
          <span className="text-sm text-red-500">Failed</span>
        </div>
        <p className="text-xs text-red-600">Unable to fetch download progress</p>
      </div>
    );
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-900 truncate">
          {progress.filename}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {progress.status === 'completed' ? 'Complete' : 
             progress.status === 'error' ? 'Error' : `${progress.progress}%`}
          </span>
          {progress.status === 'completed' && (
            <a
              href={`/api/download/${downloadId}/file`}
              download={progress.filename}
              className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-youtube-success hover:bg-green-600 rounded transition-colors"
            >
              Download
            </a>
          )}
        </div>
      </div>
      
      <Progress 
        value={progress.progress} 
        className={`w-full h-2 mb-2 ${progress.status === 'error' ? 'bg-red-100' : ''}`} 
      />
      
      <div className="flex justify-between text-xs text-gray-500">
        <span>
          {formatBytes(progress.downloadedBytes)} / {formatBytes(progress.totalBytes)}
        </span>
        {progress.status === 'downloading' && (
          <span>{progress.speed}</span>
        )}
        {progress.status === 'error' && (
          <span className="text-red-500">Download failed</span>
        )}
      </div>
    </div>
  );
}