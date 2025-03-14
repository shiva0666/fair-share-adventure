
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const { loginUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const forgotPasswordForm = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await loginUser(values.email, values.password);
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      
      navigate("/dashboard"); // Redirect to dashboard instead of root
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (values: z.infer<typeof forgotPasswordSchema>) => {
    try {
      // Simulate API call to send reset password email
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast({
        title: "Reset email sent",
        description: "Check your inbox for password reset instructions",
      });
      
      setResetEmailSent(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Request failed",
        description: "Failed to send reset email. Please try again.",
      });
    }
  };

  const closeForgotPasswordDialog = () => {
    setForgotPasswordOpen(false);
    setResetEmailSent(false);
    forgotPasswordForm.reset();
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Button 
                    variant="link" 
                    className="px-0 text-sm font-medium"
                    type="button"
                    onClick={() => setForgotPasswordOpen(true)}
                  >
                    Forgot password?
                  </Button>
                </div>
                <FormControl>
                  <Input type="password" placeholder="Enter your password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </Form>

      <Dialog open={forgotPasswordOpen} onOpenChange={closeForgotPasswordDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reset password</DialogTitle>
            <DialogDescription>
              {!resetEmailSent ? 
                "Enter your email address and we'll send you a link to reset your password." :
                "We've sent you an email with instructions to reset your password."
              }
            </DialogDescription>
          </DialogHeader>

          {!resetEmailSent ? (
            <Form {...forgotPasswordForm}>
              <form onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)} className="space-y-4">
                <FormField
                  control={forgotPasswordForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={closeForgotPasswordDialog}>
                    Cancel
                  </Button>
                  <Button type="submit">Send reset link</Button>
                </DialogFooter>
              </form>
            </Form>
          ) : (
            <DialogFooter>
              <Button onClick={closeForgotPasswordDialog}>Close</Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LoginForm;
