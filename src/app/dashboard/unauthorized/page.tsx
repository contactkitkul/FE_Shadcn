"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldX, LogOut, Mail } from "lucide-react";

export default function UnauthorizedPage() {
  const { user, logout } = useAuth();

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
            <ShieldX className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Insufficient Permissions</CardTitle>
          <CardDescription>
            Your account does not have access to the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg text-sm">
            <p className="font-medium mb-2">Account Details:</p>
            <p className="text-muted-foreground">
              Email: {user?.email || "Unknown"}
            </p>
            <p className="text-muted-foreground">
              Role: {user?.roleName || "Unknown"} (Priority:{" "}
              {user?.priority ?? 0})
            </p>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            If you believe this is an error, please contact your administrator
            to request elevated permissions.
          </p>

          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                (window.location.href =
                  "mailto:contact@kitkul.com?subject=Permission Request")
              }
            >
              <Mail className="mr-2 h-4 w-4" />
              Contact Support
            </Button>
            <Button variant="destructive" className="w-full" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
