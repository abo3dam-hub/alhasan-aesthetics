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
import { useAdminText } from "@/hooks/use-admin-text";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import doctorLogo from "/assets/3.jpg";
import { ArrowLeft, Loader2, Lock, Mail } from "lucide-react";
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

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );
  const admin = useAdminText();
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
            ? admin.auth.retryAfter.replace(
                "{seconds}",
                String(Math.max(1, Math.ceil(loginStatus.retryAfterMs / 1000))),
              )
            : admin.auth.tooManyAttempts,
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
      const message =
        err instanceof Error && err.message
          ? err.message
          : typeof err === "string" && err
            ? err
            : admin.auth.signInFailed;
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
              {mode === "signIn" ? admin.auth.signInTitle : admin.auth.signUpTitle}
            </CardTitle>
            <CardDescription>
              {mode === "signIn" ? admin.auth.signInDesc : admin.auth.signUpDesc}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{admin.auth.email}</Label>
                <div className="relative flex items-center">
                  <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={admin.auth.emailPlaceholder}
                    className="ps-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{admin.auth.password}</Label>
                <div className="relative flex items-center">
                  <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder={admin.auth.passwordPlaceholder}
                    className="ps-9"
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
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                    {mode === "signIn" ? admin.auth.signingIn : admin.auth.creating}
                  </>
                ) : (
                  <>
                    {mode === "signIn" ? admin.auth.signIn : admin.auth.createAccount}
                    <ArrowLeft className="rtl:rotate-180 ms-2 h-4 w-4" />
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
                {mode === "signIn" ? admin.auth.switchToSignUp : admin.auth.switchToSignIn}
              </Button>
            </CardFooter>
          </form>
          <div className="py-4 px-6 text-xs text-center text-muted-foreground bg-muted border-t rounded-b-lg">
            {admin.auth.portalAccess}
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