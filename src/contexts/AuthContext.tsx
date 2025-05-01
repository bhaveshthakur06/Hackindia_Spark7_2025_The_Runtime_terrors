
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, LoginCredentials } from '../types';
import { toast } from "sonner";
import { connectWallet, getUserRole } from '../blockchain/utils';
import { supabase } from '../integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  loginWithWallet: () => Promise<boolean>;
  isLoading: boolean;
  registerUserWithWallet: (userData: { name?: string, govtId: string, role: UserRole }) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
        govtId: userData.govtId
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
      
      // Check if user exists in database
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', address)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No user found with this wallet
          toast.info("Wallet not registered. Please register first.");
          return false;
        } else {
          console.error("Database error:", error);
          toast.error("Error connecting to database");
          return false;
        }
      }
      
      // Determine role from database
      const role = userData.role as UserRole;
      
      // Create user object
      const walletUser: User = {
        id: userData.id,
        walletAddress: address,
        name: userData.name,
        role: role || 'guest',
        isAuthenticated: true,
        govtId: userData.govt_id
      };
      
      setUser(walletUser);
      
      toast.success(`Connected as ${role || 'guest'}`);
      return true;
    } catch (error) {
      console.error('Wallet login error:', error);
      toast.error('An error occurred during wallet login');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('grainlink-user');
    toast.info('You have been logged out');
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
