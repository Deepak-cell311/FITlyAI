import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Zap, Eye, Check } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react";
import { supabaseAuth, supabase } from "@/lib/supabase";

export default function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!acceptTerms) {
      setError("You must accept the Terms of Service and Privacy Policy.");
      return;
    }
    if (!firstName || !lastName || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const username = `${firstName} ${lastName}`.trim();

      // 1. Supabase Auth signup
      const data = await supabaseAuth.signUp(email, password, username);
      const user = data.user;
      if (!user) throw new Error("Signup failed: No user returned from Supabase.");
      console.log("Signup payload:", {
        supabaseId: user.id,
        email,
        username,
        first_name: firstName,
        last_name: lastName
      });
      // 2. Call your backend to insert into users table
      const response = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supabaseId: user.id,
          email,
          username,
          first_name: firstName,
          last_name: lastName
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create user profile.");
      }

      setSuccess("Signup successful! Please check your email to verify your account.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      if (err.status === 429) {
        setError("Too many signup attempts. Please wait a few minutes and try again.");
      } else {
        setError(err.message || "Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-mint/20 to-azure/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-tr from-azure/10 to-mint/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-1/3 w-48 h-48 bg-gradient-to-br from-gunmetal/5 to-mint/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link to="/" className="flex items-center text-gray-600 hover:text-gunmetal transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
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
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-6 py-8">
        <div className="w-full max-w-md">
          {/* Floating decorative elements */}
          <div className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-azure/20 to-mint/20 rounded-2xl rotate-12"></div>
          <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-gradient-to-br from-mint/20 to-azure/20 rounded-xl -rotate-12"></div>
          <div className="absolute top-1/2 -left-12 w-6 h-6 bg-gradient-to-br from-azure/30 to-mint/30 rounded-lg rotate-45"></div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-100 p-8 relative">
            {/* Top accent */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-azure via-mint to-azure rounded-full"></div>

            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gunmetal mb-2">Start your transformation</h1>
              <p className="text-gray-600">Create your account and begin your fitness journey</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Social Signup */}
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full py-3 border-gray-200 hover:bg-gray-50 transition-colors bg-transparent"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign up with Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full py-3 border-gray-200 hover:bg-gray-50 transition-colors bg-transparent"
                >
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Sign up with Facebook
                </Button>
              </div>

              <div className="relative">
                <Separator className="my-6" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-white px-4 text-sm text-gray-500">or sign up with email</span>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 mb-2 block">
                      First name
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-azure/20 focus:border-azure transition-colors"
                      required
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 mb-2 block">
                      Last name
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-azure/20 focus:border-azure transition-colors"
                      required
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-azure/20 focus:border-azure transition-colors"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-2 block">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a strong password"
                      className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-azure/20 focus:border-azure transition-colors"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Password Requirements */}
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center text-xs text-gray-500">
                      <div className="w-3 h-3 rounded-full bg-gray-200 mr-2 flex items-center justify-center">
                        <Check className="w-2 h-2 text-gray-400" />
                      </div>
                      At least 8 characters
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <div className="w-3 h-3 rounded-full bg-gray-200 mr-2 flex items-center justify-center">
                        <Check className="w-2 h-2 text-gray-400" />
                      </div>
                      One uppercase letter
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <div className="w-3 h-3 rounded-full bg-mint mr-2 flex items-center justify-center">
                        <Check className="w-2 h-2 text-white" />
                      </div>
                      One number
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms and Privacy */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox id="terms" className="mt-1" checked={acceptTerms} onCheckedChange={setAcceptTerms} />
                  <Label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                    I agree to the{" "}
                    <Link to="/terms" className="text-azure hover:text-azure/80 transition-colors">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-azure hover:text-azure/80 transition-colors">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox id="marketing" className="mt-1" checked={marketing} onCheckedChange={setMarketing} />
                  <Label htmlFor="marketing" className="text-sm text-gray-600 leading-relaxed">
                    I'd like to receive fitness tips, product updates, and special offers via email
                  </Label>
                </div>
              </div>
              {error && <div className="text-red-600 text-sm text-center">{error}</div>}
              {success && <div className="text-green-600 text-sm text-center">{success}</div>}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-gunmetal to-gunmetal/90 hover:from-gunmetal/90 hover:to-gunmetal text-white py-3 rounded-xl shadow-lg transition-all duration-200"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create your account"}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="text-azure hover:text-azure/80 font-medium transition-colors">
                  Sign in
                </Link>
              </p>
            </div>

            {/* Trust indicators */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-mint/20 rounded-full flex items-center justify-center mr-2">
                    <Check className="w-2 h-2 text-mint" />
                  </div>
                  14-day free trial
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-azure/20 rounded-full flex items-center justify-center mr-2">
                    <Check className="w-2 h-2 text-azure" />
                  </div>
                  No credit card required
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gunmetal/20 rounded-full flex items-center justify-center mr-2">
                    <Check className="w-2 h-2 text-gunmetal" />
                  </div>
                  Cancel anytime
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
