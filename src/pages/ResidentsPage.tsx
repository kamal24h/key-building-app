import { useState, useEffect } from 'react';
import { Users, Home, Building2, Mail, Search, UserPlus } from 'lucide-react';
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

interface Unit {
  _id: string;
  _uid: string;
  building_id: string;
  building_name: string;
  unit_number: string;
  floor: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  resident_id?: string;
  resident_name?: string;
  resident_email?: string;
  status: string;
}

interface Building {
  _id: string;
  name: string;
}

interface UserProfile {
  _id: string;
  _uid: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
}

const UNITS_TABLE_ID = 'f24gxm1s2pz5';
const BUILDINGS_TABLE_ID = 'f24gxm1s2pz4';
const USER_PROFILES_TABLE_ID = 'f24gxm1pktmo';

export default function ResidentsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [residents, setResidents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedResidentId, setSelectedResidentId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBuilding, setFilterBuilding] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [unitsResult, buildingsResult, residentsResult] = await Promise.all([
        table.getItems(UNITS_TABLE_ID, { limit: 100, order: 'desc' }),
        table.getItems(BUILDINGS_TABLE_ID, { limit: 100 }),
        table.getItems(USER_PROFILES_TABLE_ID, { limit: 100 }),
      ]);
      
      setUnits(unitsResult.items as Unit[]);
      setBuildings(buildingsResult.items as Building[]);
      
      // Filter only residents
      const residentUsers = (residentsResult.items as UserProfile[]).filter(
        (u) => u.role === 'resident'
      );
      setResidents(residentUsers);
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

  const handleAssignResident = async () => {
    if (!selectedUnit || !selectedResidentId) return;

    try {
      const selectedResident = residents.find(r => r._uid === selectedResidentId);
      
      await table.updateItem(UNITS_TABLE_ID, {
        _uid: selectedUnit._uid,
        _id: selectedUnit._id,
        resident_id: selectedResidentId,
        resident_name: selectedResident?.name || '',
        resident_email: selectedResident?.email || '',
        status: 'occupied',
      });

      toast({
        title: 'Success',
        description: 'Resident assigned successfully',
      });

      setIsDialogOpen(false);
      setSelectedUnit(null);
      setSelectedResidentId('');
      loadData();
    } catch (error) {
      console.error('Failed to assign resident:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign resident',
        variant: 'destructive',
      });
    }
  };

  const handleUnassignResident = async (unit: Unit) => {
    if (!confirm(`Remove resident from unit ${unit.unit_number}?`)) return;

    try {
      await table.updateItem(UNITS_TABLE_ID, {
        _uid: unit._uid,
        _id: unit._id,
        resident_id: '',
        resident_name: '',
        resident_email: '',
        status: 'vacant',
      });

      toast({
        title: 'Success',
        description: 'Resident unassigned successfully',
      });

      loadData();
    } catch (error) {
      console.error('Failed to unassign resident:', error);
      toast({
        title: 'Error',
        description: 'Failed to unassign resident',
        variant: 'destructive',
      });
    }
  };

  const openAssignDialog = (unit: Unit) => {
    setSelectedUnit(unit);
    setSelectedResidentId(unit.resident_id || '');
    setIsDialogOpen(true);
  };

  const filteredUnits = units.filter((unit) => {
    const matchesSearch =
      unit.unit_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.building_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.resident_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBuilding = filterBuilding === 'all' || unit.building_id === filterBuilding;
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'occupied' && unit.resident_id) ||
      (filterStatus === 'vacant' && !unit.resident_id);
    
    return matchesSearch && matchesBuilding && matchesStatus;
  });

  const occupiedUnits = units.filter(u => u.resident_id);
  const vacantUnits = units.filter(u => !u.resident_id);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Unit Residents</h1>
          <p className="text-slate-600 mt-1">Assign residents to units</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Home className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Units</p>
              <p className="text-2xl font-bold text-slate-900">{units.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Occupied</p>
              <p className="text-2xl font-bold text-slate-900">{occupiedUnits.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Home className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Vacant</p>
              <p className="text-2xl font-bold text-slate-900">{vacantUnits.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-50 rounded-lg">
              <UserPlus className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Available Residents</p>
              <p className="text-2xl font-bold text-slate-900">{residents.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search units or residents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterBuilding} onValueChange={setFilterBuilding}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Buildings</SelectItem>
            {buildings.map((building) => (
              <SelectItem key={building._id} value={building._id}>
                {building.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full md:w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="occupied">Occupied</SelectItem>
            <SelectItem value="vacant">Vacant</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-slate-200 rounded w-3/4"></div>
            </Card>
          ))}
        </div>
      ) : units.length === 0 ? (
        <Card className="p-12 text-center">
          <Home className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No units yet</h3>
          <p className="text-slate-600">Create units first to assign residents</p>
        </Card>
      ) : filteredUnits.length === 0 ? (
        <Card className="p-12 text-center">
          <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No matching units</h3>
          <p className="text-slate-600">Try adjusting your search or filters</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredUnits.map((unit) => (
            <Card key={unit._id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`p-2 rounded-lg ${unit.resident_id ? 'bg-emerald-50' : 'bg-blue-50'}`}>
                    <Home className={`w-6 h-6 ${unit.resident_id ? 'text-emerald-600' : 'text-blue-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-slate-900">Unit {unit.unit_number}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        unit.resident_id 
                          ? 'text-emerald-600 bg-emerald-50' 
                          : 'text-blue-600 bg-blue-50'
                      }`}>
                        {unit.resident_id ? 'Occupied' : 'Vacant'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        <span>{unit.building_name}</span>
                      </div>
                      <span>Floor {unit.floor}</span>
                      <span>{unit.area}m²</span>
                      <span>{unit.bedrooms} bed, {unit.bathrooms} bath</span>
                    </div>
                    {unit.resident_name && (
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        <Users className="w-4 h-4 text-slate-500" />
                        <span className="font-medium text-slate-700">{unit.resident_name}</span>
                        <span className="text-slate-500">•</span>
                        <Mail className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-600">{unit.resident_email}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  {unit.resident_id ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => openAssignDialog(unit)}
                        className="gap-2"
                      >
                        Change
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleUnassignResident(unit)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => openAssignDialog(unit)}
                      disabled={residents.length === 0}
                      className="gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Assign Resident
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Assign Resident Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Unit Resident</DialogTitle>
            <DialogDescription>
              Select a resident for Unit {selectedUnit?.unit_number} in {selectedUnit?.building_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {residents.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">No residents available</p>
                <p className="text-sm text-slate-500 mt-1">
                  Users with resident role will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Select Resident</Label>
                <Select
                  value={selectedResidentId}
                  onValueChange={setSelectedResidentId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a resident" />
                  </SelectTrigger>
                  <SelectContent>
                    {residents.map((resident) => (
                      <SelectItem key={resident._uid} value={resident._uid}>
                        <div className="flex flex-col">
                          <span>{resident.name}</span>
                          <span className="text-xs text-slate-500">{resident.email}</span>
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
              onClick={handleAssignResident}
              disabled={!selectedResidentId || residents.length === 0}
            >
              Assign Resident
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
