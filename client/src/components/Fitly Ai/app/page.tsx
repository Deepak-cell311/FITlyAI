import { Button } from "@/components/ui/button"
import { ArrowRight, Play, TrendingUp, Zap, Target } from "lucide-react"
import {Link} from "react-router-dom"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-mint to-azure rounded-lg flex items-center justify-center mr-3">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-2xl font-semibold text-gunmetal">FitlyAI</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-600 hover:text-gunmetal transition-colors">
                Features
              </a>
              <a href="#" className="text-gray-600 hover:text-gunmetal transition-colors">
                Pricing
              </a>
              <a href="#" className="text-gray-600 hover:text-gunmetal transition-colors">
                About
              </a>
              <Button variant="ghost" className="text-gray-600 hover:text-gunmetal">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button className="bg-gunmetal hover:bg-gunmetal/90 text-white">
                <Link to="/signup">Get started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 lg:pt-32 lg:pb-20 relative">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-mint/20 to-azure/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-tr from-azure/10 to-mint/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="max-w-xl">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-mint/10 to-azure/10 border border-mint/20 mb-6">
                <div className="w-2 h-2 bg-mint rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm font-medium text-gunmetal">AI-Powered Fitness Revolution</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gunmetal leading-tight mb-6">
                The AI fitness platform powering your
                <span className="relative">
                  <span className="relative z-10"> transformation</span>
                  <div className="absolute bottom-2 left-0 w-full h-3 bg-gradient-to-r from-mint/30 to-azure/30 -rotate-1"></div>
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                FitlyAI delivers intelligent coaching, personalized nutrition, and data-driven insights. Built for
                individuals serious about achieving lasting results.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-gunmetal to-gunmetal/90 hover:from-gunmetal/90 hover:to-gunmetal text-white px-8 py-4 shadow-lg"
                >
                  <Link to="/signup">Start free trial</Link>
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="text-gunmetal hover:bg-gray-50 px-8 py-4 border border-gray-200"
                >
                  <Play className="mr-2 w-4 h-4" />
                  Watch demo
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-4">No credit card required • 14-day free trial</p>
            </div>
            <div className="relative">
              {/* Floating Elements */}
              <div className="absolute -top-6 -left-6 w-12 h-12 bg-gradient-to-br from-mint to-mint/80 rounded-xl rotate-12 shadow-lg"></div>
              <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-gradient-to-br from-azure to-azure/80 rounded-lg -rotate-12 shadow-lg"></div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 lg:p-12 relative">
                {/* Progress Ring */}
                <div className="absolute top-6 right-6">
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="28" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="4"
                        strokeDasharray="175.93"
                        strokeDashoffset="52.78"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-mint">73%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-mint to-azure"></div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gunmetal">Today's Progress</h3>
                    <span className="text-sm text-gray-500">March 15</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Calories burned</span>
                      <span className="font-semibold text-gunmetal">847</span>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-mint to-azure h-3 rounded-full relative"
                          style={{ width: "73%" }}
                        >
                          <div className="absolute right-0 top-0 w-3 h-3 bg-white rounded-full shadow-sm border-2 border-azure"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Workout completed</span>
                      <span className="font-semibold text-mint">45 min</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-6 relative">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-azure to-azure/80 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                      <span className="text-white text-sm font-medium">AI</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-600 mb-2">
                        Great job on today's workout! Based on your performance, I recommend increasing your protein
                        intake by 15g for optimal recovery.
                      </p>
                      <span className="text-xs text-gray-400">2 minutes ago</span>
                    </div>
                  </div>
                  {/* Typing indicator */}
                  <div className="flex items-center mt-3 text-gray-400">
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="text-xs ml-2">AI is analyzing your data...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 lg:py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-50 via-white to-gray-50"></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="relative inline-block mb-4">
                <div className="text-3xl lg:text-4xl font-bold text-gunmetal mb-2 relative z-10">50,000+</div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-mint to-azure rounded-full group-hover:w-20 transition-all duration-300"></div>
              </div>
              <div className="text-gray-600">Active users</div>
            </div>
            <div className="text-center group">
              <div className="relative inline-block mb-4">
                <div className="text-3xl lg:text-4xl font-bold text-gunmetal mb-2 relative z-10">2.5M+</div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-azure to-mint rounded-full group-hover:w-20 transition-all duration-300"></div>
              </div>
              <div className="text-gray-600">Workouts completed</div>
            </div>
            <div className="text-center group">
              <div className="relative inline-block mb-4">
                <div className="text-3xl lg:text-4xl font-bold text-gunmetal mb-2 relative z-10">89%</div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-mint to-azure rounded-full group-hover:w-20 transition-all duration-300"></div>
              </div>
              <div className="text-gray-600">Goal achievement rate</div>
            </div>
            <div className="text-center group">
              <div className="relative inline-block mb-4">
                <div className="text-3xl lg:text-4xl font-bold text-gunmetal mb-2 relative z-10">4.9</div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-azure to-mint rounded-full group-hover:w-20 transition-all duration-300"></div>
              </div>
              <div className="text-gray-600">App store rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Section */}
      <section className="py-16 lg:py-24 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mb-16 relative">
            <div className="absolute -top-8 -left-8 w-24 h-24 bg-gradient-to-br from-mint/20 to-azure/20 rounded-full blur-xl"></div>
            <h2 className="text-3xl lg:text-5xl font-bold text-gunmetal mb-6 relative">
              The core AI system for a modern approach to fitness
            </h2>
            <p className="text-xl text-gray-600 relative">
              Every aspect of your fitness journey, intelligently connected and optimized for results.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-mint/10 to-mint/5 border border-mint/20 mb-6">
                <TrendingUp className="w-4 h-4 text-mint mr-2" />
                <span className="text-mint text-sm font-medium">Intelligent Coaching</span>
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-gunmetal mb-4">
                AI coach that learns from your progress
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
                Our AI analyzes your performance patterns, recovery metrics, and preferences to deliver personalized
                coaching that evolves with you.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start group">
                  <div className="w-6 h-6 bg-gradient-to-br from-mint to-mint/80 rounded-full flex items-center justify-center mr-4 mt-0.5 group-hover:scale-110 transition-transform">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-gray-600">Real-time form analysis and corrections</span>
                </li>
                <li className="flex items-start group">
                  <div className="w-6 h-6 bg-gradient-to-br from-azure to-azure/80 rounded-full flex items-center justify-center mr-4 mt-0.5 group-hover:scale-110 transition-transform">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-gray-600">Adaptive workout intensity based on recovery</span>
                </li>
                <li className="flex items-start group">
                  <div className="w-6 h-6 bg-gradient-to-br from-mint to-azure rounded-full flex items-center justify-center mr-4 mt-0.5 group-hover:scale-110 transition-transform">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-gray-600">Personalized motivation and goal setting</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              {/* Floating shapes */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-mint/20 to-azure/20 rounded-2xl rotate-12"></div>
              <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-br from-azure/20 to-mint/20 rounded-xl -rotate-12"></div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 relative">
                <div className="bg-white rounded-2xl shadow-xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-mint via-azure to-mint"></div>
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="font-semibold text-gunmetal">Workout Analysis</h4>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-mint rounded-full mr-2 animate-pulse"></div>
                      <span className="text-xs text-gray-500 bg-mint/10 px-2 py-1 rounded-full">Live</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-mint/5 to-mint/10 rounded-xl border border-mint/20">
                      <span className="text-gray-700">Form accuracy</span>
                      <div className="flex items-center">
                        <div className="w-12 h-2 bg-gray-200 rounded-full mr-3">
                          <div className="w-11 h-2 bg-gradient-to-r from-mint to-mint/80 rounded-full"></div>
                        </div>
                        <span className="font-semibold text-mint">94%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-azure/5 to-azure/10 rounded-xl border border-azure/20">
                      <span className="text-gray-700">Heart rate zone</span>
                      <span className="font-semibold text-azure bg-azure/10 px-3 py-1 rounded-full">Zone 3</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <span className="text-gray-700">Recommended rest</span>
                      <span className="font-semibold text-gray-700">45 sec</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div className="lg:order-2">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-azure/10 to-azure/5 border border-azure/20 mb-6">
                <Target className="w-4 h-4 text-azure mr-2" />
                <span className="text-azure text-sm font-medium">Smart Nutrition</span>
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-gunmetal mb-4">
                Precision nutrition tailored to your metabolism
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
                Advanced algorithms analyze your body composition, activity levels, and goals to create meal plans that
                optimize your results.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start group">
                  <div className="w-6 h-6 bg-gradient-to-br from-azure to-azure/80 rounded-full flex items-center justify-center mr-4 mt-0.5 group-hover:scale-110 transition-transform">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-gray-600">Macro-optimized meal planning</span>
                </li>
                <li className="flex items-start group">
                  <div className="w-6 h-6 bg-gradient-to-br from-mint to-mint/80 rounded-full flex items-center justify-center mr-4 mt-0.5 group-hover:scale-110 transition-transform">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-gray-600">Ingredient substitutions for dietary restrictions</span>
                </li>
                <li className="flex items-start group">
                  <div className="w-6 h-6 bg-gradient-to-br from-azure to-mint rounded-full flex items-center justify-center mr-4 mt-0.5 group-hover:scale-110 transition-transform">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-gray-600">Shopping lists and meal prep guidance</span>
                </li>
              </ul>
            </div>
            <div className="lg:order-1 relative">
              {/* Floating nutrition icons */}
              <div className="absolute -top-6 -left-6 w-12 h-12 bg-gradient-to-br from-mint to-mint/80 rounded-xl rotate-12 flex items-center justify-center shadow-lg">
                <span className="text-white text-xs font-bold">P</span>
              </div>
              <div className="absolute -bottom-4 -right-4 w-10 h-10 bg-gradient-to-br from-azure to-azure/80 rounded-lg -rotate-12 flex items-center justify-center shadow-lg">
                <span className="text-white text-xs font-bold">C</span>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8">
                <div className="bg-white rounded-2xl shadow-xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-azure via-mint to-azure"></div>
                  <h4 className="font-semibold text-gunmetal mb-6">Today's Nutrition</h4>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                      <div className="text-2xl font-bold text-gunmetal mb-1">1,847</div>
                      <div className="text-xs text-gray-500">Calories</div>
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                        <div
                          className="bg-gradient-to-r from-gunmetal to-gunmetal/80 h-1 rounded-full"
                          style={{ width: "78%" }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-center p-3 bg-azure/5 rounded-xl">
                      <div className="text-2xl font-bold text-azure mb-1">142g</div>
                      <div className="text-xs text-gray-500">Protein</div>
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                        <div
                          className="bg-gradient-to-r from-azure to-azure/80 h-1 rounded-full"
                          style={{ width: "85%" }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-center p-3 bg-mint/5 rounded-xl">
                      <div className="text-2xl font-bold text-mint mb-1">89g</div>
                      <div className="text-xs text-gray-500">Carbs</div>
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                        <div
                          className="bg-gradient-to-r from-mint to-mint/80 h-1 rounded-full"
                          style={{ width: "62%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-mint rounded-full mr-3"></div>
                        <span className="text-gray-600 text-sm">Breakfast</span>
                      </div>
                      <span className="text-gunmetal font-medium text-sm">487 cal</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-azure rounded-full mr-3"></div>
                        <span className="text-gray-600 text-sm">Lunch</span>
                      </div>
                      <span className="text-gunmetal font-medium text-sm">623 cal</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-gray-300 rounded-full mr-3"></div>
                        <span className="text-gray-600 text-sm">Dinner</span>
                      </div>
                      <span className="text-gray-400 text-sm">Planned</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gunmetal via-gunmetal to-gunmetal/90"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-mint/20 to-azure/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-tr from-azure/20 to-mint/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                Ready to transform your approach to fitness?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join thousands of users who've achieved sustainable results with intelligent, personalized fitness
                coaching.
              </p>
              <Button size="lg" className="bg-white text-gunmetal hover:bg-gray-100 px-8 py-4 shadow-xl">
                <Link to="/signup">Start your free trial</Link>
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 group">
                    <div className="w-12 h-12 bg-gradient-to-br from-mint to-mint/80 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <span className="text-white font-semibold">1</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Complete assessment</h4>
                      <p className="text-gray-300 text-sm">Quick fitness and nutrition evaluation</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 group">
                    <div className="w-12 h-12 bg-gradient-to-br from-azure to-azure/80 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <span className="text-white font-semibold">2</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Receive your plan</h4>
                      <p className="text-gray-300 text-sm">AI-generated workout and nutrition strategy</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 group">
                    <div className="w-12 h-12 bg-gradient-to-br from-mint to-azure rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <span className="text-white font-semibold">3</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Start your transformation</h4>
                      <p className="text-gray-300 text-sm">Begin with guided coaching and support</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-mint to-azure rounded-lg flex items-center justify-center mr-3">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="text-2xl font-semibold text-gunmetal">FitlyAI</span>
              </div>
              <p className="text-gray-600 text-sm">Intelligent fitness coaching for sustainable results.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gunmetal mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="#" className="hover:text-gunmetal transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gunmetal transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gunmetal transition-colors">
                    API
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gunmetal transition-colors">
                    Integrations
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gunmetal mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="#" className="hover:text-gunmetal transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gunmetal transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gunmetal transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gunmetal transition-colors">
                    Press
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gunmetal mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="#" className="hover:text-gunmetal transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gunmetal transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gunmetal transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gunmetal transition-colors">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 mt-12 pt-8">
            <p className="text-gray-500 text-sm">© 2024 FitlyAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
