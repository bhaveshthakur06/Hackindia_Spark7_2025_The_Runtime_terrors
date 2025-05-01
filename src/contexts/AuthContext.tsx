import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, LoginCredentials } from '../types';
import { toast } from "sonner";
import { connectWallet, getUserRole } from '../blockchain/utils';
import { supabase } from '../integrations/supabase/client';
import { useBlockchain } from './BlockchainContext';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  loginWithWallet: () => Promise<boolean>;
  isLoading: boolean;
  registerUserWithWallet: (userData: { name?: string, govtId: string, role: UserRole }) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  onLogout?: () => void;
}

export function AuthProvider({ children, onLogout }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { disconnectWallet } = useBlockchain();

  useEffect(() => {
    // Check if user was logged in previously
    const storedUser = localStorage.getItem('grainlink-user');

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('grainlink-user');
      }
    }

    setIsLoading(false);
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('grainlink-user', JSON.stringify(user));
    }
  }, [user]);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setIsLoading(true);

      // In a real app, this would call your backend API
      // For now, we'll simulate a successful login with mock credentials
      if (credentials.email === 'admin@grainlink.com' && credentials.password === 'password') {
        setUser({
          id: '1',
          name: 'Admin User',
          email: credentials.email,
          role: 'admin',
          isAuthenticated: true
        });
        toast.success('Welcome, Admin!');
        return true;
      }

      if (credentials.email === 'distributor@grainlink.com' && credentials.password === 'password') {
        setUser({
          id: '2',
          name: 'Distributor User',
          email: credentials.email,
          role: 'distributor',
          isAuthenticated: true
        });
        toast.success('Welcome, Distributor!');
        return true;
      }

      if (credentials.email === 'beneficiary@grainlink.com' && credentials.password === 'password') {
        setUser({
          id: '3',
          name: 'Beneficiary User',
          email: credentials.email,
          role: 'beneficiary',
          isAuthenticated: true
        });
        toast.success('Welcome, Beneficiary!');
        return true;
      }

      toast.error('Invalid email or password');
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const registerUserWithWallet = async (userData: { name?: string, govtId: string, role: UserRole }): Promise<boolean> => {
    try {
      setIsLoading(true);

      if (!window.ethereum) {
        toast.error("MetaMask or an Ethereum wallet is required");
        return false;
      }

      // Connect wallet and get address
      const address = await connectWallet();

      if (!address) {
        toast.error("Failed to connect wallet");
        return false;
      }

      // Check if user already exists in database
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', address)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Error checking existing user:", checkError);
        toast.error("Error verifying wallet address");
        return false;
      }

      if (existingUser) {
        toast.error("This wallet is already registered");
        return false;
      }

      // Insert new user into database
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            wallet_address: address,
            role: userData.role,
            name: userData.name,
            govt_id: userData.govtId
          }
        ])
        .select()
        .single();

      if (error) {
        console.error("Error registering user:", error);
        toast.error("Failed to register user");
        return false;
      }

      // Create user object
      const newUser: User = {
        id: data.id,
        walletAddress: address,
        name: userData.name,
        role: userData.role,
        isAuthenticated: true,
        govtId: userData.govtId // This is now allowed by our updated User interface
      };

      setUser(newUser);

      toast.success(`Registered as ${userData.role}`);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An error occurred during registration');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithWallet = async (): Promise<boolean> => {
    try {
      setIsLoading(true);

      if (!window.ethereum) {
        toast.error("MetaMask or an Ethereum wallet is required");
        return false;
      }

      // Connect wallet and get address
      const address = await connectWallet();

      if (!address) {
        toast.error("Failed to connect wallet");
        return false;
      }

      // First, try to get the user's session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Session error:", sessionError);
        toast.error("Error getting session");
        return false;
      }

      // Check if user exists in database using a service role client
      const { data: userData, error } = await supabase
        .from('users')
        .select('id, name, role, govt_id')
        .eq('wallet_address', address.toLowerCase())
        .maybeSingle();

      if (error) {
        console.error("Database error:", error);

        if (error.code === '42P17') {
          // RLS policy recursion error - try alternative approach
          const { data: altUserData, error: altError } = await supabase
            .from('users')
            .select('id, name, role, govt_id')
            .eq('wallet_address', address.toLowerCase())
            .limit(1)
            .maybeSingle();

          if (altError) {
            console.error("Alternative query error:", altError);
            toast.error("Authentication system error. Please try again later.");
            return false;
          }

          if (!altUserData) {
            toast.info("Wallet not registered. Please register first.");
            return false;
          }

          // Create user object from alternative query result
          const walletUser: User = {
            id: altUserData.id,
            walletAddress: address,
            name: altUserData.name,
            role: altUserData.role as UserRole,
            isAuthenticated: true,
            govtId: altUserData.govt_id
          };

          setUser(walletUser);
          toast.success(`Connected as ${altUserData.role}`);
          return true;
        } else if (error.code === 'PGRST116') {
          toast.info("Wallet not registered. Please register first.");
          return false;
        } else {
          toast.error("Error connecting to database. Please try again later.");
          return false;
        }
      }

      if (!userData) {
        toast.info("Wallet not registered. Please register first.");
        return false;
      }

      // Create user object
      const walletUser: User = {
        id: userData.id,
        walletAddress: address,
        name: userData.name,
        role: userData.role as UserRole,
        isAuthenticated: true,
        govtId: userData.govt_id
      };

      setUser(walletUser);
      toast.success(`Connected as ${userData.role}`);
      return true;
    } catch (error) {
      console.error('Wallet login error:', error);
      toast.error('An error occurred during wallet login');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Disconnect wallet
      disconnectWallet();

      setUser(null);
      toast.success("Logged out successfully");
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error("Failed to log out");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loginWithWallet, isLoading, registerUserWithWallet }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
