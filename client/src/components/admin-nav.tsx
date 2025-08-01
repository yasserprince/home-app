import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Shield, Home } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function AdminNav() {
  const { user } = useAuth();

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-red-600 text-white py-2 px-4 flex items-center justify-between z-50">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4" />
        <span className="text-sm font-medium">Admin Mode</span>
      </div>
      <div className="flex gap-2">
        <Link href="/">
          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
            <Home className="h-4 w-4 mr-1" />
            Home
          </Button>
        </Link>
        <Link href="/admin">
          <Button variant="secondary" size="sm">
            Admin Panel
          </Button>
        </Link>
      </div>
    </div>
  );
}