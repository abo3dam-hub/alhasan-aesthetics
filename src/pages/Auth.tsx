import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import doctorLogo from "/assets/3.jpg";
import { ArrowRight, Loader2, Lock, Mail } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/dashboard",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

function errorMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "string" && err) return err;
  return "Sign-in failed. Please try again.";
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recordFailedAttempt = useMutation(api.loginRateLimit.recordFailedAttempt);
  const resetLoginAttempts = useMutation(api.loginRateLimit.resetLoginAttempts);
  const normalizedEmail = email.trim().toLowerCase();
  const loginStatus = useQuery(
    api.loginRateLimit.getLoginStatus,
    mode === "signIn" && normalizedEmail ? { email: normalizedEmail } : "skip",
  );

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (mode === "signIn" && loginStatus?.blocked) {
        setError(
          loginStatus.retryAfterMs
            ? `Too many failed attempts. Try again in ${Math.ceil(loginStatus.retryAfterMs / 60000)} minute(s).`
            : "Too many failed attempts. Please try again later.",
        );
        return;
      }
      await signIn("password", {
        email,
        password,
        flow: mode,
      });
      if (mode === "signIn") {
        void resetLoginAttempts({ email });
      }
      navigate(redirect);
    } catch (err) {
      console.error("Sign-in error:", err);
      const message = errorMessage(err);
      setError(message);
      if (mode === "signIn") {
        void recordFailedAttempt({ email });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Glassmorphism background */}
      <div className="absolute inset-0 hero-gradient pointer-events-none" />
      <div className="absolute top-20 right-10 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(197, 168, 130, 0.15)" }} />
      <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(212, 196, 173, 0.12)" }} />

      {/* Auth Content */}
      <div className="relative flex-1 flex items-center justify-center">
        <div className="flex items-center justify-center h-full flex-col">
        <Card className="min-w-[350px] pb-0 border shadow-md glass-elevated">
          <CardHeader className="text-center">
            <div className="flex justify-center">
              <img
                src={doctorLogo}
                alt="Dr. Al Hasan Al Saiem"
                width={64}
                height={64}
                className="rounded-full mb-4 mt-4 cursor-pointer border-2 border-primary/30"
                onClick={() => navigate("/")}
              />
            </div>
            <CardTitle className="text-xl">
              {mode === "signIn" ? "Admin Sign In" : "Create Admin Account"}
            </CardTitle>
            <CardDescription>
              {mode === "signIn"
                ? "Enter your email and password to access the dashboard."
                : "Register an administrator account. Registration closes after two admin accounts exist."}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="At least 8 characters"
                    className="pl-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    minLength={8}
                    autoComplete={mode === "signIn" ? "current-password" : "new-password"}
                  />
                </div>
              </div>
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === "signIn" ? "Signing in..." : "Creating..."}
                  </>
                ) : (
                  <>
                    {mode === "signIn" ? "Sign in" : "Create account"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setMode(mode === "signIn" ? "signUp" : "signIn");
                  setError(null);
                }}
                disabled={isLoading}
                className="w-full"
              >
                {mode === "signIn"
                  ? "Don't have an account? Create one"
                  : "Have an account? Sign in"}
              </Button>
            </CardFooter>
          </form>
          <div className="py-4 px-6 text-xs text-center text-muted-foreground bg-muted border-t rounded-b-lg">
            Admin portal access
          </div>
        </Card>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}