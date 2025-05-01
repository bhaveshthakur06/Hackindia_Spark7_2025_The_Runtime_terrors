import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBlockchain } from '../contexts/BlockchainContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import {
  User, LogOut, Settings,
  ChevronDown, Wallet, Loader2
} from 'lucide-react';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

export function Header() {
  const { user, logout } = useAuth();
  const { walletConnected, walletAddress, connectWallet, isLoading } = useBlockchain();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLocalConnecting, setIsLocalConnecting] = useState(false);

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const handleConnectWallet = async () => {
    if (isLocalConnecting) return;

    setIsLocalConnecting(true);
    try {
      await connectWallet();
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error("Failed to connect wallet");
    } finally {
      setIsLocalConnecting(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              asChild
            >
              <Link to="/dashboard">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                  G
                </div>
              </Link>
            </Button>
          </div>
          <div className="hidden md:block">
            <h1 className="text-xl font-semibold tracking-tight">
              GrainLink - Ration Distribution System
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Wallet connection status */}
          {walletConnected && walletAddress ? (
            <div className="hidden md:flex items-center">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Wallet className="h-3.5 w-3.5 mr-1" />
                {formatAddress(walletAddress)}
              </Badge>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex"
              onClick={handleConnectWallet}
              disabled={isLoading || isLocalConnecting}
            >
              {isLoading || isLocalConnecting ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="mr-1.5 h-4 w-4" />
                  Connect Wallet
                </>
              )}
            </Button>
          )}

          {user ? (
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-base">
                  <span className="hidden md:inline-block">{user.name || user.email || 'User'}</span>
                  <User className="h-5 w-5 md:ml-1.5" />
                  <ChevronDown className="ml-1.5 h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user.name || user.email || 'User'}</span>
                    <span className="text-xs text-muted-foreground">
                      Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                    {user.walletAddress && (
                      <span className="text-xs font-mono text-muted-foreground mt-1">
                        {formatAddress(user.walletAddress)}
                      </span>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link to="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
