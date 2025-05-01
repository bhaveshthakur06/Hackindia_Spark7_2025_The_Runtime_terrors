
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-muted/40">
      <div className="flex flex-col items-center text-center max-w-md px-4">
        <div className="rounded-full bg-red-100 p-4 mb-6">
          <Shield className="h-12 w-12 text-red-600" />
        </div>
        
        <h1 className="text-4xl font-bold mb-2">Access Denied</h1>
        
        <p className="text-xl text-muted-foreground mb-6">
          You don't have permission to access this page
        </p>
        
        <p className="text-muted-foreground mb-8">
          Please contact your administrator if you believe you should have access to this resource.
        </p>
        
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Return to Dashboard
          </Button>
          <Button onClick={() => navigate("/login")}>
            Login with Different Account
          </Button>
        </div>
      </div>
    </div>
  );
}
