import { useState, useEffect } from 'react';
import { UserCog, Building2, Mail, Phone, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { useToast } from '../hooks/use-toast';
import { table } from '@devvai/devv-code-backend';
import { useAuthStore } from '../store/auth-store';

interface Building {
  _id: string;
  _uid: string;
  name: string;
  address: string;
  total_units: number;
  manager_id?: string;
  manager_name?: string;
  status: string;
}

interface UserProfile {
  _id: string;
  _uid: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
}

const BUILDINGS_TABLE_ID = 'f24gxm1s2pz4';
const USER_PROFILES_TABLE_ID = 'f24gxm1pktmo';

export default function ManagersPage() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [managers, setManagers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [selectedManagerId, setSelectedManagerId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { user } = useAuthStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [buildingsResult, managersResult] = await Promise.all([
        table.getItems(BUILDINGS_TABLE_ID, { limit: 100, order: 'desc' }),
        table.getItems(USER_PROFILES_TABLE_ID, { limit: 100 }),
      ]);
      
      setBuildings(buildingsResult.items as Building[]);
      
      // Filter only managers
      const managerUsers = (managersResult.items as UserProfile[]).filter(
        (u) => u.role === 'manager'
      );
      setManagers(managerUsers);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignManager = async () => {
    if (!selectedBuilding || !selectedManagerId) return;

    try {
      const selectedManager = managers.find(m => m._uid === selectedManagerId);
      
      await table.updateItem(BUILDINGS_TABLE_ID, {
        _uid: selectedBuilding._uid,
        _id: selectedBuilding._id,
        manager_id: selectedManagerId,
        manager_name: selectedManager?.name || '',
      });

      toast({
        title: 'Success',
        description: 'Manager assigned successfully',
      });

      setIsDialogOpen(false);
      setSelectedBuilding(null);
      setSelectedManagerId('');
      loadData();
    } catch (error) {
      console.error('Failed to assign manager:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign manager',
        variant: 'destructive',
      });
    }
  };

  const handleUnassignManager = async (building: Building) => {
    if (!confirm(`Remove manager from "${building.name}"?`)) return;

    try {
      await table.updateItem(BUILDINGS_TABLE_ID, {
        _uid: building._uid,
        _id: building._id,
        manager_id: '',
        manager_name: '',
      });

      toast({
        title: 'Success',
        description: 'Manager unassigned successfully',
      });

      loadData();
    } catch (error) {
      console.error('Failed to unassign manager:', error);
      toast({
        title: 'Error',
        description: 'Failed to unassign manager',
        variant: 'destructive',
      });
    }
  };

  const openAssignDialog = (building: Building) => {
    setSelectedBuilding(building);
    setSelectedManagerId(building.manager_id || '');
    setIsDialogOpen(true);
  };

  const filteredBuildings = buildings.filter(
    (building) =>
      building.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      building.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      building.manager_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const assignedBuildings = filteredBuildings.filter(b => b.manager_id);
  const unassignedBuildings = filteredBuildings.filter(b => !b.manager_id);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Building Managers</h1>
          <p className="text-slate-600 mt-1">Assign managers to buildings</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search buildings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Buildings</p>
              <p className="text-2xl font-bold text-slate-900">{buildings.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <UserCog className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Assigned</p>
              <p className="text-2xl font-bold text-slate-900">{assignedBuildings.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <UserCog className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Available Managers</p>
              <p className="text-2xl font-bold text-slate-900">{managers.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-slate-200 rounded w-3/4"></div>
            </Card>
          ))}
        </div>
      ) : buildings.length === 0 ? (
        <Card className="p-12 text-center">
          <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No buildings yet</h3>
          <p className="text-slate-600">Create buildings first to assign managers</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Unassigned Buildings */}
          {unassignedBuildings.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">
                Unassigned Buildings ({unassignedBuildings.length})
              </h2>
              <div className="space-y-3">
                {unassignedBuildings.map((building) => (
                  <Card key={building._id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-amber-50 rounded-lg">
                          <Building2 className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{building.name}</h3>
                          <p className="text-sm text-slate-600">{building.address}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {building.total_units} units
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => openAssignDialog(building)}
                        disabled={managers.length === 0}
                        className="gap-2"
                      >
                        <UserCog className="w-4 h-4" />
                        Assign Manager
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Assigned Buildings */}
          {assignedBuildings.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">
                Assigned Buildings ({assignedBuildings.length})
              </h2>
              <div className="space-y-3">
                {assignedBuildings.map((building) => (
                  <Card key={building._id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-emerald-50 rounded-lg">
                          <Building2 className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">{building.name}</h3>
                          <p className="text-sm text-slate-600">{building.address}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-2 text-sm">
                              <UserCog className="w-4 h-4 text-slate-500" />
                              <span className="font-medium text-slate-700">
                                {building.manager_name}
                              </span>
                            </div>
                            <span className="text-xs text-slate-500">
                              {building.total_units} units
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => openAssignDialog(building)}
                          className="gap-2"
                        >
                          Change
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleUnassignManager(building)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Assign Manager Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Building Manager</DialogTitle>
            <DialogDescription>
              Select a manager for {selectedBuilding?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {managers.length === 0 ? (
              <div className="text-center py-8">
                <UserCog className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">No managers available</p>
                <p className="text-sm text-slate-500 mt-1">
                  Users with manager role will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Select Manager</Label>
                <Select
                  value={selectedManagerId}
                  onValueChange={setSelectedManagerId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {managers.map((manager) => (
                      <SelectItem key={manager._uid} value={manager._uid}>
                        <div className="flex items-center gap-2">
                          <span>{manager.name}</span>
                          <span className="text-xs text-slate-500">({manager.email})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignManager}
              disabled={!selectedManagerId || managers.length === 0}
            >
              Assign Manager
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
