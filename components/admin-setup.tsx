"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function AdminSetup() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    credentials?: { email: string; password: string };
  } | null>(null);

  const handleSetup = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: "Failed to connect to setup endpoint",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Admin Setup for Vercel Deployment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-center">
            If you&apos;re having trouble logging in as admin on your Vercel deployment,
            click the button below to ensure the admin user is properly created.
          </p>

          <div className="flex justify-center">
            <Button
              onClick={handleSetup}
              disabled={isLoading}
              size="lg"
              className="w-full max-w-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                "Setup Admin User"
              )}
            </Button>
          </div>

          {result && (
            <Alert className={result.success ? "border-green-500" : "border-red-500"}>
              <div className="flex items-center">
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <AlertDescription className="ml-2">
                  {result.message}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {result?.success && result?.credentials && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg text-green-800">
                  Admin Credentials
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <strong>Email:</strong> {result.credentials.email}
                  </div>
                  <div>
                    <strong>Password:</strong> {result.credentials.password}
                  </div>
                </div>
                <p className="text-sm text-green-700 mt-3">
                  You can now login to the admin panel with these credentials.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Note:</strong> This setup process creates an admin user with the email
              &apos;admin@journal.com&apos; and password &apos;admin123&apos; if it doesn&apos;t already exist.
            </p>
            <p>
              After setup, make sure to change the admin password for security.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
