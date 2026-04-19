import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMongoAuth } from "@/hooks/useMongoAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ForgotPassword from "@/components/ForgotPassword";
import ResetPasswordCode from "@/components/ResetPasswordCode";
import { Monitor, Loader2, Mail, Lock, User } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signUpSchema = signInSchema.extend({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
});

export default function Auth() {
  const [view, setView] = useState<"signin" | "signup" | "forgot" | "reset">(
    "signin",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [resetEmail, setResetEmail] = useState("");

  const { signIn, signUp, user } = useMongoAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const validateForm = () => {
    try {
      if (view === "signup") {
        signUpSchema.parse(formData);
      } else if (view === "signin") {
        signInSchema.parse(formData);
      }
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
      if (view === "signup") {
        const { error } = await signUp(
          formData.email,
          formData.password,
          formData.fullName,
          "admin",
        );
        if (error) {
          if (error.message.includes("already exists")) {
            toast.error(
              "This email is already registered. Please sign in instead.",
            );
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Account created successfully!");
          navigate("/dashboard");
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          if (error.message.includes("Invalid")) {
            toast.error("Invalid email or password");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Signed in successfully!");
          navigate("/dashboard");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSuccess = (email: string) => {
    setResetEmail(email);
    setView("reset"); // Move to reset password view
  };

  const handleResetPasswordSuccess = () => {
    setView("signin");
    setFormData({ email: resetEmail, password: "", fullName: "" });
    setResetEmail("");
  };

  // Show forgot password view
  if (view === "forgot") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent pointer-events-none" />
        <ForgotPassword
          onBack={() => {
            setView("signin");
            setFormData({ email: "", password: "", fullName: "" });
            setErrors({});
          }}
          onSuccess={handleForgotPasswordSuccess}
        />
      </div>
    );
  }

  // Show reset password view (after entering email)
  if (view === "reset" && resetEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent pointer-events-none" />
        <ResetPasswordCode
          email={resetEmail}
          onBack={() => {
            setView("signin");
            setResetEmail("");
          }}
          onSuccess={handleResetPasswordSuccess}
        />
      </div>
    );
  }

  // Show sign in / sign up view
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent pointer-events-none" />

      <div className="w-full max-w-md">
        <div className="glass-panel p-8 animate-fade-in">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/20 flex items-center justify-center animate-pulse-glow">
              <Monitor className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">KU Notice Board</h1>
            <p className="text-muted-foreground mt-1">
              {view === "signup" ? "Create admin account" : "Admin sign in"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {view === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    placeholder="John Doe"
                    className="pl-10"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs text-destructive">{errors.fullName}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="admin@example.com"
                  className="pl-10"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••••"
                  className="pl-10"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>

            {view === "signin" && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setView("forgot")}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              variant="glow"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {view === "signup" ? "Creating account..." : "Signing in..."}
                </>
              ) : view === "signup" ? (
                "Create Admin Account"
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setView(view === "signup" ? "signin" : "signup");
                setErrors({});
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {view === "signup" ? (
                <>
                  Already have an account?{" "}
                  <span className="text-primary">Sign in</span>
                </>
              ) : (
                <>
                  Don't have an account?{" "}
                  <span className="text-primary">Sign up</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
