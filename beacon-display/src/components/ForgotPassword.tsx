import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "@/services/api";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

interface ForgotPasswordProps {
  onBack: () => void;
  onSuccess: (email: string) => void;
}

export default function ForgotPassword({
  onBack,
  onSuccess,
}: ForgotPasswordProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [codeSent, setCodeSent] = useState(false);

  const validateForm = () => {
    try {
      forgotPasswordSchema.parse({ email });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await api.auth.forgotPassword(email);
      toast.success("Reset code sent to your email!");
      setCodeSent(true);
      // Move to success screen after short delay
      setTimeout(() => {
        onSuccess(email);
      }, 1000);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to request password reset";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // If code was sent, show success message
  if (codeSent) {
    return (
      <div className="w-full max-w-md">
        <div className="glass-panel p-8 animate-fade-in">
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500 animate-bounce" />
            <h2 className="text-2xl font-bold">Code Sent!</h2>
            <p className="text-muted-foreground">
              We've sent a password reset code to{" "}
              <span className="font-semibold">{email}</span>
            </p>
            <p className="text-sm text-muted-foreground bg-primary/10 p-3 rounded-lg">
              ✉️ Check your email for the reset code. The code expires in 1
              hour.
            </p>
            <p className="text-xs text-muted-foreground bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 p-3 rounded-lg">
              💡 <strong>Development Mode:</strong> If you don't see the email,
              check the backend console/terminal for the code.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="glass-panel p-8 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <Mail className="w-12 h-12 mx-auto text-primary mb-4" />
          <h2 className="text-2xl font-bold">Forgot Password?</h2>
          <p className="text-muted-foreground mt-2">
            Enter your email address and we'll send you a code to reset your
            password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="pl-10"
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-3 text-sm text-blue-900 dark:text-blue-200">
            <p>
              <strong>Note:</strong> You'll receive an email with a reset code.
              Enter it on the next screen to set a new password.
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Reset Code"
            )}
          </Button>

          {/* Back Button */}
          <button
            type="button"
            onClick={onBack}
            className="w-full flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
