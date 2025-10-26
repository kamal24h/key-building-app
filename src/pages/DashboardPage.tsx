import { useState, useEffect } from 'react';
import { Building2, Users, Home, UserCog } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useAuthStore } from '../store/auth-store';
import { table } from '@devvai/devv-code-backend';

const BUILDINGS_TABLE_ID = 'f24gxm1s2pz4';
const UNITS_TABLE_ID = 'f24gxm1s2pz5';
const USER_PROFILES_TABLE_ID = 'f24gxm1pktmo';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBuildings: 0,
    totalUnits: 0,
    occupiedUnits: 0,
    totalManagers: 0,
    totalResidents: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [buildingsResult, unitsResult, usersResult] = await Promise.all([
        table.getItems(BUILDINGS_TABLE_ID, { limit: 100 }),
        table.getItems(UNITS_TABLE_ID, { limit: 100 }),
        table.getItems(USER_PROFILES_TABLE_ID, { limit: 100 }),
      ]);

      const buildings = buildingsResult.items;
      const units = unitsResult.items;
      const users = usersResult.items;

      setStats({
        totalBuildings: buildings.length,
        totalUnits: units.length,
        occupiedUnits: units.filter((u: any) => u.resident_id).length,
        totalManagers: users.filter((u: any) => u.role === 'manager').length,
        totalResidents: users.filter((u: any) => u.role === 'resident').length,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const dashboardStats = [
    {
      title: 'Total Buildings',
      value: loading ? '...' : stats.totalBuildings.toString(),
      icon: Building2,
      description: 'Active properties',
      roles: ['admin', 'manager'],
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Total Units',
      value: loading ? '...' : stats.totalUnits.toString(),
      icon: Home,
      description: `${stats.occupiedUnits} occupied`,
      roles: ['admin', 'manager'],
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Building Managers',
      value: loading ? '...' : stats.totalManagers.toString(),
      icon: UserCog,
      description: 'Active managers',
      roles: ['admin'],
      bgColor: 'bg-violet-50',
      iconColor: 'text-violet-600',
    },
    {
      title: 'Total Residents',
      value: loading ? '...' : stats.totalResidents.toString(),
      icon: Users,
      description: 'Registered residents',
      roles: ['admin', 'manager'],
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
  ];

  const visibleStats = dashboardStats.filter(
    (stat) => user && stat.roles.includes(user.role)
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}! Here's your overview.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {visibleStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Property occupancy overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Occupancy Rate</span>
                <span className="text-lg font-semibold text-slate-900">
                  {stats.totalUnits > 0 
                    ? `${Math.round((stats.occupiedUnits / stats.totalUnits) * 100)}%`
                    : '0%'}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ 
                    width: stats.totalUnits > 0 
                      ? `${(stats.occupiedUnits / stats.totalUnits) * 100}%`
                      : '0%'
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <p className="text-xs text-slate-500">Occupied</p>
                  <p className="text-2xl font-bold text-emerald-600">{stats.occupiedUnits}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Vacant</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.totalUnits - stats.occupiedUnits}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current implementation progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-slate-700">Buildings Management</span>
                <span className="text-xs text-emerald-600 font-medium">✓ Active</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-slate-700">Units Management</span>
                <span className="text-xs text-emerald-600 font-medium">✓ Active</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-slate-700">Manager Assignments</span>
                <span className="text-xs text-emerald-600 font-medium">✓ Active</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-slate-700">Resident Assignments</span>
                <span className="text-xs text-emerald-600 font-medium">✓ Active</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-700">Financial Tracking</span>
                <span className="text-xs text-amber-600 font-medium">⟳ Phase 3</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
