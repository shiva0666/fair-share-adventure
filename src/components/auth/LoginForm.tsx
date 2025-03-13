
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Github, Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const phoneRegex = /^(\+\d{1,3})?\s?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;

const loginSchema = z.object({
  emailOrPhone: z.string().refine(val => {
    // Check if it's a valid email or phone number
    return val.includes('@') || phoneRegex.test(val);
  }, {
    message: "Please enter a valid email address or phone number",
  }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

type LoginValues = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const { toast } = useToast();
  const { loginUser, loginWithGoogle } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrPhone: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginValues) => {
    try {
      await loginUser(data.emailOrPhone, data.password);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Google. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="emailOrPhone">Email or Phone Number</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="emailOrPhone"
            placeholder="name@example.com or +1 (555) 123-4567"
            type="text"
            autoCapitalize="none"
            autoComplete="email tel"
            autoCorrect="off"
            className="pl-10"
            {...register("emailOrPhone")}
          />
        </div>
        {errors.emailOrPhone && (
          <p className="text-sm text-destructive">{errors.emailOrPhone.message}</p>
        )}
      </div>
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <a href="#" className="text-sm text-primary hover:underline">
            Forgot password?
          </a>
        </div>
        <div className="relative">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2.5 h-7 w-7 px-0"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="sr-only">
              {showPassword ? "Hide password" : "Show password"}
            </span>
          </Button>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoCapitalize="none"
            autoComplete="current-password"
            {...register("password")}
          />
        </div>
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign In"}
      </Button>

      <Button 
        type="button" 
        variant="outline" 
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center"
      >
        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
          <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
        </svg>
        Continue with Google
      </Button>

      <Button 
        type="button" 
        variant="outline" 
        className="w-full flex items-center justify-center"
      >
        <Github className="mr-2 h-4 w-4" />
        Continue with GitHub
      </Button>
    </form>
  );
};

export default LoginForm;
