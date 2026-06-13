import { useState } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import {
  Zap,
  LogIn,
  UserPlus,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

function getOAuthUrl() {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);

  return url.toString();
}

type AuthMode = "login" | "register";

export default function Login() {
  const { isAuthenticated } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const registerMutation = trpc.localAuth.register.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("local_auth_token", data.token);
      setSuccess("Account created successfully! Redirecting...");
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    },
    onError: (err) => {
      setError(err.message || "Registration failed");
    },
  });

  const loginMutation = trpc.localAuth.login.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("local_auth_token", data.token);
      setSuccess("Signed in successfully! Redirecting...");
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    },
    onError: (err) => {
      setError(err.message || "Login failed");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (mode === "register") {
      if (!displayName.trim()) {
        setError("Display name is required");
        return;
      }
      registerMutation.mutate({ username, password, displayName });
    } else {
      loginMutation.mutate({ username, password });
    }
  };

  const isSubmitting = registerMutation.isPending || loginMutation.isPending;

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
        <Card className="w-full max-w-sm bg-[#111111] border-[#27272a]">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-[#00f0ff] mx-auto mb-4" />
            <p className="text-white font-display text-lg mb-2">
              Already Signed In
            </p>
            <p className="text-xs text-[#a1a1aa] mb-4">
              You are already authenticated.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[#00f0ff] text-xs font-mono-code uppercase tracking-wider hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Home
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <Zap className="w-6 h-6 text-[#00f0ff] group-hover:animate-pulse" />
            <span className="font-display text-2xl font-semibold text-white">
              LUMINA
            </span>
          </Link>
          <p className="text-xs text-[#a1a1aa] mt-2 font-mono-code">
            {mode === "login" ? "Sign in to continue" : "Create your account"}
          </p>
        </div>

        <Card className="bg-[#111111] border-[#27272a]">
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-lg text-white text-center">
              {mode === "login" ? "Welcome Back" : "Get Started"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* OAuth button */}
            <Button
              className="w-full bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] hover:bg-[#00f0ff]/20 font-mono-code text-xs uppercase tracking-wider"
              size="lg"
              variant="outline"
              onClick={() => {
                window.location.href = getOAuthUrl();
              }}
            >
              <Zap className="w-4 h-4 mr-2" />
              Sign in with Kimi
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#27272a]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#111111] px-3 text-[#a1a1aa] font-mono-code uppercase">
                  or
                </span>
              </div>
            </div>

            {/* Local auth form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-mono-code text-[#a1a1aa] uppercase tracking-wider">
                  Username
                </Label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="bg-[#050505] border-[#27272a] text-white text-sm placeholder:text-[#27272a] focus:border-[#00f0ff]/50 focus:ring-[#00f0ff]/20"
                  required
                  minLength={3}
                />
              </div>

              {mode === "register" && (
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-mono-code text-[#a1a1aa] uppercase tracking-wider">
                    Display Name
                  </Label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="How should we call you?"
                    className="bg-[#050505] border-[#27272a] text-white text-sm placeholder:text-[#27272a] focus:border-[#00f0ff]/50 focus:ring-[#00f0ff]/20"
                    required
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-[10px] font-mono-code text-[#a1a1aa] uppercase tracking-wider">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="bg-[#050505] border-[#27272a] text-white text-sm placeholder:text-[#27272a] focus:border-[#00f0ff]/50 focus:ring-[#00f0ff]/20 pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a1a1aa] hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-400/10 border border-red-400/20 px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-2">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  {success}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-[#00f0ff] text-[#050505] hover:bg-[#00f0ff]/90 font-mono-code text-xs uppercase tracking-wider"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 border-2 border-[#050505]/30 border-t-[#050505] rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : mode === "login" ? (
                  <span className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Create Account
                  </span>
                )}
              </Button>
            </form>

            {/* Toggle mode */}
            <div className="text-center pt-2">
              <button
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login");
                  setError("");
                  setSuccess("");
                }}
                className="text-xs text-[#a1a1aa] hover:text-[#00f0ff] transition-colors font-mono-code"
              >
                {mode === "login"
                  ? "Need an account? Register"
                  : "Already have an account? Sign In"}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Back link */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[10px] font-mono-code text-[#a1a1aa] hover:text-[#00f0ff] transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to LUMINA
          </Link>
        </div>
      </div>
    </div>
  );
}
