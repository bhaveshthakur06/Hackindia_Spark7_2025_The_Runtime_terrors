
import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Wallet, Mail, Loader2, UserPlus } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  govtId: z.string().min(4, "Government ID must be at least 4 characters"),
  role: z.enum(["distributor", "beneficiary"]),
});

export default function LoginPage() {
  const { user, login, loginWithWallet, isLoading, registerUserWithWallet } = useAuth();
  const [activeTab, setActiveTab] = useState("email");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();
  
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registrationForm = useForm<z.infer<typeof registrationSchema>>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: "",
      govtId: "",
      role: "beneficiary",
    },
  });

  // If user is already logged in, redirect to dashboard
  if (user && user.isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmitLogin = async (values: z.infer<typeof loginSchema>) => {
    const success = await login({
      email: values.email,
      password: values.password
    });
    if (success) {
      navigate("/dashboard");
    }
  };

  const handleWalletLogin = async () => {
    setIsConnecting(true);
    try {
      const success = await loginWithWallet();
      if (success) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Wallet login error:", error);
      toast.error("Error connecting to wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const onSubmitRegistration = async (values: z.infer<typeof registrationSchema>) => {
    setIsRegistering(true);
    try {
      const success = await registerUserWithWallet({
        name: values.name,
        govtId: values.govtId,
        role: values.role as "distributor" | "beneficiary"
      });
      if (success) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Error during registration");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <span className="text-2xl font-bold text-white">G</span>
          </div>
          <CardTitle className="text-2xl">Welcome to GrainLink</CardTitle>
          <CardDescription>
            Blockchain-Powered Ration Distribution System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="email" disabled={isLoading}>
                <Mail className="mr-2 h-4 w-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="wallet" disabled={isLoading}>
                <Wallet className="mr-2 h-4 w-4" />
                Wallet
              </TabsTrigger>
              <TabsTrigger value="register" disabled={isLoading}>
                <UserPlus className="mr-2 h-4 w-4" />
                Register
              </TabsTrigger>
            </TabsList>
            <TabsContent value="email" className="mt-4">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onSubmitLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : "Login"}
                  </Button>
                </form>
              </Form>
              <div className="mt-4 text-center text-sm text-muted-foreground">
                <p>Demo logins:</p>
                <p className="mt-1">admin@grainlink.com / password</p>
                <p>distributor@grainlink.com / password</p>
                <p>beneficiary@grainlink.com / password</p>
              </div>
            </TabsContent>
            <TabsContent value="wallet" className="mt-4">
              <div className="space-y-4">
                <div className="text-center py-4">
                  <p className="mb-4 text-muted-foreground">
                    Connect your Ethereum wallet to login securely using your blockchain identity
                  </p>
                  <Button 
                    onClick={handleWalletLogin} 
                    className="w-full flex items-center justify-center"
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Wallet className="mr-2 h-4 w-4" />
                        Connect Wallet
                      </>
                    )}
                  </Button>
                </div>
                <div className="my-4">
                  <Separator />
                </div>
                <div className="text-center text-xs text-muted-foreground">
                  <p>
                    Wallet logins use the Ethereum blockchain to authenticate your identity.
                    Make sure you have MetaMask or another Ethereum wallet installed.
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="register" className="mt-4">
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-muted-foreground">
                    Register your wallet with the GrainLink platform
                  </p>
                </div>
                <Form {...registrationForm}>
                  <form onSubmit={registrationForm.handleSubmit(onSubmitRegistration)} className="space-y-4">
                    <FormField
                      control={registrationForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Your Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registrationForm.control}
                      name="govtId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Government ID</FormLabel>
                          <FormControl>
                            <Input placeholder="ID Number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registrationForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="beneficiary">Beneficiary</SelectItem>
                              <SelectItem value="distributor">Distributor</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isRegistering}
                    >
                      {isRegistering ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        <>
                          <Wallet className="mr-2 h-4 w-4" />
                          Register with Wallet
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-center text-sm text-muted-foreground w-full">
            <p>Secure blockchain-powered ration distribution</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
