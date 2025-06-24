import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";
import { FaGoogle } from "react-icons/fa";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, username: string) => void;
}

export function AuthModal({ isOpen, onClose, onLogin }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && username.trim()) {
      onLogin(email.trim(), username.trim());
      onClose();
      // Reset form
      setEmail("");
      setUsername("");
      setPassword("");
    }
  };

  const handleGoogleAuth = () => {
    // In a real app, this would initiate Google OAuth flow
    const googleEmail = "user@gmail.com";
    const googleUsername = "Google User";
    onLogin(googleEmail, googleUsername);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {isSignUp ? "Sign Up for SoundPix" : "Sign In to SoundPix"}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Google Sign In */}
          <Button
            onClick={handleGoogleAuth}
            variant="outline"
            className="w-full flex items-center justify-center space-x-3 py-3"
          >
            <FaGoogle className="text-red-500" />
            <span>Continue with Google</span>
          </Button>

          <div className="relative">
            <Separator />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="px-2 bg-white text-sm text-gray-500">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            
            <Button type="submit" className="w-full py-3 font-medium">
              {isSignUp ? "Sign Up" : "Sign In"}
            </Button>
          </form>

          <div className="text-center">
            <Button
              variant="link"
              className="text-sm text-primary hover:underline"
            >
              Forgot your password?
            </Button>
          </div>

          <div className="text-center text-sm text-gray-600">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
            <Button
              variant="link"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary hover:underline font-medium ml-1"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
