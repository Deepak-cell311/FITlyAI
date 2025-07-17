import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Zap, Mail } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-mint/20 to-azure/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-tr from-azure/10 to-mint/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/login" className="flex items-center text-gray-600 hover:text-gunmetal transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to login
          </Link>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-mint to-azure rounded-lg flex items-center justify-center mr-3">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-2xl font-semibold text-gunmetal">FitlyAI</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-6">
        <div className="w-full max-w-md">
          {/* Floating decorative elements */}
          <div className="absolute -top-6 -left-6 w-12 h-12 bg-gradient-to-br from-mint/30 to-azure/30 rounded-xl rotate-12"></div>
          <div className="absolute -bottom-6 -right-6 w-8 h-8 bg-gradient-to-br from-azure/30 to-mint/30 rounded-lg -rotate-12"></div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-100 p-8 relative">
            {/* Top accent */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-mint to-azure rounded-full"></div>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-azure/10 to-mint/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-azure" />
              </div>
              <h1 className="text-3xl font-bold text-gunmetal mb-2">Reset your password</h1>
              <p className="text-gray-600">Enter your email and we'll send you a link to reset your password</p>
            </div>

            <form className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-azure/20 focus:border-azure transition-colors"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-gunmetal to-gunmetal/90 hover:from-gunmetal/90 hover:to-gunmetal text-white py-3 rounded-xl shadow-lg transition-all duration-200"
              >
                Send reset link
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Remember your password?{" "}
                <Link href="/login" className="text-azure hover:text-azure/80 font-medium transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
