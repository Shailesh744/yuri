import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { urlInputSchema, type UrlInput, type Video, type Playlist } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface UrlInputProps {
  onLoadingChange: (loading: boolean) => void;
  onSuccess: (data: { type: 'video' | 'playlist'; data: Video | Playlist }) => void;
  onError: (error: string) => void;
}

export default function UrlInput({ onLoadingChange, onSuccess, onError }: UrlInputProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UrlInput>({
    resolver: zodResolver(urlInputSchema),
    defaultValues: {
      url: "",
    },
  });

  const onSubmit = async (data: UrlInput) => {
    setIsSubmitting(true);
    onLoadingChange(true);
    onError("");

    try {
      const response = await apiRequest("POST", "/api/fetch-info", data);
      const result = await response.json();
      onSuccess(result);
    } catch (error) {
      onError(error instanceof Error ? error.message : "Failed to fetch video information");
    } finally {
      setIsSubmitting(false);
      onLoadingChange(false);
    }
  };

  return (
    <Card className="shadow-lg mb-8">
      <CardContent className="p-6 md:p-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Download YouTube Videos & Playlists
          </h2>
          <p className="text-gray-600">Enter a YouTube URL to get started</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type="url"
                          placeholder="Paste YouTube URL here..."
                          className="pr-10 py-3"
                          disabled={isSubmitting}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <LinkIcon className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-youtube-primary hover:bg-blue-700 text-white font-medium"
              >
                <Search className="w-4 h-4 mr-2" />
                {isSubmitting ? "Fetching..." : "Fetch Video"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
