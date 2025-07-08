import { User, Crown, Heart, LogOut, BarChart3, Settings, CreditCard, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Link } from "wouter";

interface NavigationHeaderProps {
  user: {
    id: number;
    username: string;
    email: string;
    subscriptionStatus: string;
  } | null;
  onLogout: () => void;
  onLoginClick?: () => void;
}

export function NavigationHeader({ user, onLogout, onLoginClick }: NavigationHeaderProps) {

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Heart className="text-white w-4 h-4" />
                </div>
                <span className="text-xl font-bold text-gray-900">FITlyAI</span>
              </div>
            </Link>
            
            {user && (
              <nav className="hidden md:flex items-center space-x-6">
                <Link href="/">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                    Chat
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
              </nav>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {user?.subscriptionStatus === 'active' && (
                  <div className="hidden sm:flex items-center space-x-2">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full flex items-center space-x-1">
                      <Crown className="w-3 h-3" />
                      <span>Pro Member</span>
                    </span>
                  </div>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 h-auto p-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user?.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-gray-700">{user?.username}</span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user?.username}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <Link href="/account">
                      <DropdownMenuItem className="cursor-pointer">
                        <Settings className="w-4 h-4 mr-2" />
                        Account Settings
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button 
                onClick={onLoginClick}
                variant="outline" 
                size="sm"
                className="text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                <User className="w-4 h-4 mr-2" />
                Log In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
