import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Mail, Facebook, Twitter, Github } from "lucide-react"

export default function Component() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="text-center space-y-4 pb-6">
          {/* Logo/Brand Mark */}
          <div className="mx-auto w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-white" />
          </div>

          {/* Headlines */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Subscribe to My Newsletter</h1>
            <p className="text-gray-600 text-sm leading-relaxed">
              Get the latest updates, exclusive content, and insider tips delivered straight to your inbox every week.
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Social Sign-up Options */}
          <div className="space-y-3">
            <Button variant="outline" className="w-full h-11 text-sm font-medium bg-transparent">
              <Facebook className="w-4 h-4 mr-2" />
              Continue with Facebook
            </Button>
            <Button variant="outline" className="w-full h-11 text-sm font-medium bg-transparent">
              <Twitter className="w-4 h-4 mr-2" />
              Continue with Twitter
            </Button>
            <Button variant="outline" className="w-full h-11 text-sm font-medium bg-transparent">
              <Github className="w-4 h-4 mr-2" />
              Continue with GitHub
            </Button>
          </div>

          <div className="relative">
            <Separator />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-white px-3 text-xs text-gray-500 font-medium">OR</span>
            </div>
          </div>

          {/* Email Form */}
          <form className="space-y-4">
            <div className="space-y-2">
              <Input type="email" placeholder="Enter your email address" className="h-11 text-sm" required />
            </div>
            <Button className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white font-medium">
              Subscribe Now
            </Button>
          </form>

          {/* Additional Links */}
          <div className="flex justify-center space-x-4 text-xs text-gray-500">
            <a href="#" className="hover:text-purple-600 transition-colors">
              Terms
            </a>
            <span>•</span>
            <a href="#" className="hover:text-purple-600 transition-colors">
              Privacy
            </a>
            <span>•</span>
            <a href="#" className="hover:text-purple-600 transition-colors">
              Help
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="text-center">
            <p className="text-xs text-gray-500 leading-relaxed">
              🔒 We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
