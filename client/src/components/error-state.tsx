import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorStateProps {
  message: string;
}

export default function ErrorState({ message }: ErrorStateProps) {
  return (
    <Card className="bg-red-50 border-red-200 mb-8">
      <CardContent className="p-6">
        <div className="flex items-center">
          <AlertTriangle className="text-red-500 w-6 h-6 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-red-900">Error</h3>
            <p className="text-red-700 mt-1">{message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}