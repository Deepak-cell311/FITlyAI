import { AlertTriangle, Shield, Heart } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function SafetyFooter() {
  return (
    <div className="mt-8 space-y-4">
      {/* Safety Disclaimer */}
      <Alert className="border-amber-200 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <strong>Health & Safety Notice:</strong> FitlyAI provides general fitness and nutrition guidance for educational purposes only. 
          This is not medical advice. Always consult qualified healthcare professionals before starting any exercise program, 
          changing your diet, or if you have health concerns. Stop exercising if you feel pain or discomfort.
        </AlertDescription>
      </Alert>

      {/* Privacy & Data Protection */}
      <Alert className="border-blue-200 bg-blue-50">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Privacy Protected:</strong> Your conversations are encrypted and secure. We use industry-standard 
          security measures to protect your personal information. Your data is never shared with third parties 
          without your explicit consent.
        </AlertDescription>
      </Alert>

      {/* Emergency Notice */}
      <Alert className="border-red-200 bg-red-50">
        <Heart className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>Emergency Notice:</strong> If you're experiencing a medical emergency, chest pain, severe injury, 
          or any life-threatening condition, stop using this app immediately and call emergency services (911) 
          or go to your nearest emergency room.
        </AlertDescription>
      </Alert>

      {/* Footer Links */}
      <div className="text-center pt-4 border-t border-gray-200">
        <div className="flex justify-center space-x-6 text-sm text-gray-500">
          <button className="hover:text-primary transition-colors">Terms of Service</button>
          <button className="hover:text-primary transition-colors">Privacy Policy</button>
          <button className="hover:text-primary transition-colors">Medical Disclaimer</button>
          <button className="hover:text-primary transition-colors">Contact Support</button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          © 2024 FitlyAI. All rights reserved. Not affiliated with any medical institutions.
        </p>
      </div>
    </div>
  );
}