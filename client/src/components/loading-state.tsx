import { Card, CardContent } from "@/components/ui/card";

export default function LoadingState() {
  return (
    <Card className="shadow-lg mb-8">
      <CardContent className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-youtube-primary mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Fetching video information...</p>
            <p className="text-sm text-gray-500 mt-1">This may take a few seconds</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
