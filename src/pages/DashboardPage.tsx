import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users, Package, ShoppingCart, AlertTriangle,
  Check, Calendar, TrendingUp
} from "lucide-react";
import { DashboardStats } from "@/types";
import { WalletInfo } from "@/components/WalletInfo";
import { dashboardStats as mockStats } from "@/mock/data";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";

const CHART_COLORS = [
  "#8B5CF6", "#D946EF", "#F97316", "#0EA5E9", "#10B981", "#F59E0B", "#EF4444"
];

// Monthly distribution data - for line chart
const monthlyData = [
  { name: "Jan", distributions: 12 },
  { name: "Feb", distributions: 19 },
  { name: "Mar", distributions: 25 },
  { name: "Apr", distributions: 30 },
  { name: "May", distributions: 27 },
  { name: "Jun", distributions: 32 },
  { name: "Jul", distributions: 38 },
  { name: "Aug", distributions: 42 },
  { name: "Sep", distributions: 35 },
  { name: "Oct", distributions: 32 },
  { name: "Nov", distributions: 28 },
  { name: "Dec", distributions: 22 },
];

// Item category distribution - for pie chart
const categoryData = [
  { name: "Grains", value: 45 },
  { name: "Proteins", value: 20 },
  { name: "Essentials", value: 25 },
  { name: "Others", value: 10 },
];

// Daily distribution data - for bar chart
const dailyData = [
  { day: "Mon", completed: 12, scheduled: 15 },
  { day: "Tue", completed: 18, scheduled: 20 },
  { day: "Wed", completed: 15, scheduled: 17 },
  { day: "Thu", completed: 20, scheduled: 22 },
  { day: "Fri", completed: 25, scheduled: 25 },
  { day: "Sat", completed: 10, scheduled: 12 },
  { day: "Sun", completed: 5, scheduled: 8 },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [beneficiaryCount, setBeneficiaryCount] = useState<number | null>(null);
  const [distributorCount, setDistributorCount] = useState<number | null>(null);
  const [distributionCount, setDistributionCount] = useState<number | null>(null);
  const [lowStockCount, setLowStockCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      const [benRes, distRes, distriRes, invRes] = await Promise.all([
        supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "beneficiary"),
        supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "distributor"),
        supabase.from("claims").select("id", { count: "exact", head: true }),
        supabase.from("stock_records").select("quantity"),
      ]);
      setBeneficiaryCount(benRes.count ?? 0);
      setDistributorCount(distRes.count ?? 0);
      setDistributionCount(distriRes.count ?? 0);
      // Low stock: quantity <= 5
      const lowStock = (invRes.data || []).filter((item: any) => item.quantity <= 5).length;
      setLowStockCount(lowStock);
      setIsLoading(false);
    };
    fetchDashboardData();
  }, []);

  useEffect(() => {
    // In a real app, you would fetch this data from your API
    setStats(mockStats);
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-pulse text-primary">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome {user?.name || 'back'}, here's an overview of your ration distribution system
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Beneficiaries"
          value={beneficiaryCount ?? 0}
          description="Registered individuals"
          icon={Users}
        />
        <StatsCard
          title="Total Distributors"
          value={distributorCount ?? 0}
          description="Active distribution agents"
          icon={Package}
        />
        <StatsCard
          title="Distributions"
          value={distributionCount ?? 0}
          description={`${stats.pendingDistributions} pending`}
          icon={ShoppingCart}
        />
        <StatsCard
          title="Low Stock Items"
          value={lowStockCount ?? 0}
          description="Need restocking"
          icon={AlertTriangle}
          variant={lowStockCount && lowStockCount > 0 ? "destructive" : "default"}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Charts - Left column (double width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart Tabs */}
          <Tabs defaultValue="distributions">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Analytics</h3>
              <TabsList>
                <TabsTrigger value="distributions">Distributions</TabsTrigger>
                <TabsTrigger value="inventory">Inventory</TabsTrigger>
                <TabsTrigger value="daily">Daily</TabsTrigger>
              </TabsList>
            </div>

            {/* Monthly Distribution Trend */}
            <TabsContent value="distributions" className="p-0">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">
                    Monthly Distribution Trend
                  </CardTitle>
                  <CardDescription>
                    Total distributions made each month
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="distributions"
                          stroke="#8B5CF6"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Inventory by Category */}
            <TabsContent value="inventory" className="p-0">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">
                    Inventory by Category
                  </CardTitle>
                  <CardDescription>
                    Distribution of ration items by category
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Daily Distribution Activity */}
            <TabsContent value="daily" className="p-0">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">
                    Daily Distribution Activity
                  </CardTitle>
                  <CardDescription>
                    Scheduled vs completed distributions
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dailyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="scheduled" fill="#D946EF" />
                        <Bar dataKey="completed" fill="#8B5CF6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest distributions and inventory changes
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <ActivityItem
                  icon={Check}
                  title="Distribution Completed"
                  description="Sarah Wilson received 5kg rice, 2kg sugar"
                  time="10 minutes ago"
                  iconColor="text-green-500 bg-green-50"
                />
                <ActivityItem
                  icon={Calendar}
                  title="Distribution Scheduled"
                  description="David Martinez will receive 4kg rice, 3kg wheat flour"
                  time="30 minutes ago"
                  iconColor="text-blue-500 bg-blue-50"
                />
                <ActivityItem
                  icon={Package}
                  title="Inventory Updated"
                  description="1000kg rice added to stock"
                  time="2 hours ago"
                  iconColor="text-amber-500 bg-amber-50"
                />
                <ActivityItem
                  icon={TrendingUp}
                  title="New Beneficiary Registered"
                  description="Jennifer Thompson with 5 family members"
                  time="Yesterday"
                  iconColor="text-purple-500 bg-purple-50"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Wallet and Other Info */}
        <div className="space-y-6">
          {/* Wallet Information */}
          <WalletInfo />

          {/* Upcoming Distributions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">
                Upcoming Distributions
              </CardTitle>
              <CardDescription>
                Scheduled for the next 7 days
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <UpcomingDistribution
                  name="David Martinez"
                  items="4kg rice, 3kg wheat flour, 2kg lentils"
                  date="Tomorrow, 10:00 AM"
                  center="Central Distribution Center"
                />
                <UpcomingDistribution
                  name="Robert Garcia"
                  items="3kg rice, 1L cooking oil"
                  date="May 7, 2:30 PM"
                  center="Eastern Regional Center"
                />
                <UpcomingDistribution
                  name="Sarah Wilson"
                  items="5kg wheat flour, 3kg lentils"
                  date="May 10, 11:15 AM"
                  center="Central Distribution Center"
                />
              </div>
            </CardContent>
          </Card>

          {/* Summary Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">System Uptime</span>
                  <span className="font-medium">99.9%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="font-medium">Just now</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Blockchain Status</span>
                  <span className="font-medium text-green-500">Connected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Transaction</span>
                  <span className="font-medium">10 minutes ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
  variant?: 'default' | 'destructive';
}

function StatsCard({ title, value, description, icon: Icon, variant = 'default' }: StatsCardProps) {
  return (
    <Card className={variant === 'destructive' ? 'border-red-200' : ''}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <div className={`rounded-full p-2.5 ${variant === 'destructive'
            ? 'bg-red-100 text-red-600'
            : 'bg-primary/10 text-primary'
            }`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Activity Item Component
interface ActivityItemProps {
  icon: React.ElementType;
  title: string;
  description: string;
  time: string;
  iconColor: string;
}

function ActivityItem({ icon: Icon, title, description, time, iconColor }: ActivityItemProps) {
  return (
    <div className="flex items-start space-x-4">
      <div className={`rounded-full p-1.5 ${iconColor}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-none">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  );
}

// Upcoming Distribution Component
interface UpcomingDistributionProps {
  name: string;
  items: string;
  date: string;
  center: string;
}

function UpcomingDistribution({ name, items, date, center }: UpcomingDistributionProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">{name}</h4>
        <span className="text-xs text-muted-foreground">{date}</span>
      </div>
      <p className="text-xs text-muted-foreground">{items}</p>
      <p className="text-xs font-medium text-muted-foreground">{center}</p>
    </div>
  );
}
