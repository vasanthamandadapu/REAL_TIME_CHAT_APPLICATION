"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Database, Key, Globe, CheckCircle } from "lucide-react"

export default function SupabaseSetupGuide() {
  const steps = [
    {
      title: "Create Supabase Account",
      description: "Sign up for a free Supabase account",
      action: "Go to Supabase",
      url: "https://supabase.com/dashboard",
      icon: <Globe className="h-5 w-5" />,
    },
    {
      title: "Create New Project",
      description: "Create a new project in your Supabase dashboard",
      action: "Create Project",
      icon: <Database className="h-5 w-5" />,
    },
    {
      title: "Get API Credentials",
      description: "Navigate to Settings → API to find your credentials",
      action: "Get Credentials",
      icon: <Key className="h-5 w-5" />,
    },
    {
      title: "Update Configuration",
      description: "Replace the placeholder values in lib/supabase-config.ts",
      action: "Update Code",
      icon: <CheckCircle className="h-5 w-5" />,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Database className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Supabase Setup Required</CardTitle>
          <p className="text-gray-600">Follow these steps to configure your Supabase backend</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {index + 1}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  {step.icon}
                  <h3 className="font-semibold text-gray-900">{step.title}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-3">{step.description}</p>
                {step.url && (
                  <Button asChild size="sm" variant="outline">
                    <a href={step.url} target="_blank" rel="noopener noreferrer">
                      {step.action}
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          ))}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">Configuration Files to Update:</h4>
            <div className="space-y-2">
              <Badge variant="secondary" className="font-mono text-xs">
                lib/supabase-config.ts
              </Badge>
              <p className="text-sm text-yellow-700">
                Replace the placeholder URL and anon key with your actual Supabase project credentials.
              </p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">What you'll need:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Project URL (format: https://your-project-id.supabase.co)</li>
              <li>• Anon/Public API Key (safe for client-side use)</li>
              <li>• Run the database schema script to create tables</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
