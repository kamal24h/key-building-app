import { useState, useEffect } from 'react';
import { Plus, Home, Edit, Trash2, Building2, User, Bed, Bath, Maximize } from 'lucide-react';
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
  status: 'occupied' | 'vacant' | 'maintenance';
  created_at: string;
}

interface Building {
  _id: string;
  name: string;
}

const UNITS_TABLE_ID = 'f24gxm1s2pz5';
const BUILDINGS_TABLE_ID = 'f24gxm1s2pz4';

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [formData, setFormData] = useState({
    building_id: '',
    unit_number: '',
    floor: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    status: 'vacant' as Unit['status'],
  });
  const { toast } = useToast();
  const { user } = useAuthStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [unitsResult, buildingsResult] = await Promise.all([
        table.getItems(UNITS_TABLE_ID, { limit: 100, order: 'desc' }),
        table.getItems(BUILDINGS_TABLE_ID, { limit: 100 }),
      ]);
      setUnits(unitsResult.items as Unit[]);
      setBuildings(buildingsResult.items as Building[]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in',
        variant: 'destructive',
      });
      return;
    }

    try {
      const selectedBuilding = buildings.find(b => b._id === formData.building_id);
      
      const unitData = {
        _uid: user.uid,
        building_id: formData.building_id,
        building_name: selectedBuilding?.name || '',
        unit_number: formData.unit_number,
        floor: parseInt(formData.floor),
        area: parseFloat(formData.area),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        status: formData.status,
        created_at: new Date().toISOString(),
      };

      if (editingUnit) {
        await table.updateItem(UNITS_TABLE_ID, {
          _uid: editingUnit._uid,
          _id: editingUnit._id,
          ...unitData,
        });
        toast({
          title: 'Success',
          description: 'Unit updated successfully',
        });
      } else {
        await table.addItem(UNITS_TABLE_ID, unitData);
        toast({
          title: 'Success',
          description: 'Unit created successfully',
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Failed to save unit:', error);
      toast({
        title: 'Error',
        description: 'Failed to save unit',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setFormData({
      building_id: unit.building_id,
      unit_number: unit.unit_number,
      floor: unit.floor.toString(),
      area: unit.area.toString(),
      bedrooms: unit.bedrooms.toString(),
      bathrooms: unit.bathrooms.toString(),
      status: unit.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (unit: Unit) => {
    if (!confirm(`Are you sure you want to delete unit ${unit.unit_number}?`)) {
      return;
    }

    try {
      await table.deleteItem(UNITS_TABLE_ID, {
        _uid: unit._uid,
        _id: unit._id,
      });
      toast({
        title: 'Success',
        description: 'Unit deleted successfully',
      });
      loadData();
    } catch (error) {
      console.error('Failed to delete unit:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete unit',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      building_id: '',
      unit_number: '',
      floor: '',
      area: '',
      bedrooms: '',
      bathrooms: '',
      status: 'vacant',
    });
    setEditingUnit(null);
  };

  const getStatusColor = (status: Unit['status']) => {
    switch (status) {
      case 'occupied':
        return 'text-emerald-600 bg-emerald-50';
      case 'vacant':
        return 'text-blue-600 bg-blue-50';
      case 'maintenance':
        return 'text-amber-600 bg-amber-50';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: Unit['status']) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Units</h1>
          <p className="text-slate-600 mt-1">Manage property units</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
          className="gap-2"
          disabled={buildings.length === 0}
        >
          <Plus className="w-4 h-4" />
          Add Unit
        </Button>
      </div>

      {/* Empty state for no buildings */}
      {!loading && buildings.length === 0 && (
        <Card className="p-12 text-center">
          <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No buildings yet</h3>
          <p className="text-slate-600 mb-6">You need to create a building first before adding units</p>
        </Card>
      )}

      {/* Units Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-slate-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-2/3"></div>
            </Card>
          ))}
        </div>
      ) : units.length === 0 && buildings.length > 0 ? (
        <Card className="p-12 text-center">
          <Home className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No units yet</h3>
          <p className="text-slate-600 mb-6">Get started by adding your first unit</p>
          <Button
            onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Unit
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {units.map((unit) => (
            <Card key={unit._id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Home className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Unit {unit.unit_number}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                        unit.status
                      )}`}
                    >
                      {getStatusLabel(unit.status)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(unit)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(unit)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Building2 className="w-4 h-4 flex-shrink-0" />
                  <span>{unit.building_name}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                  <div className="flex flex-col items-center p-2 bg-slate-50 rounded">
                    <Bed className="w-4 h-4 text-slate-600 mb-1" />
                    <span className="text-xs text-slate-500">Beds</span>
                    <span className="text-sm font-semibold text-slate-900">{unit.bedrooms}</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-slate-50 rounded">
                    <Bath className="w-4 h-4 text-slate-600 mb-1" />
                    <span className="text-xs text-slate-500">Baths</span>
                    <span className="text-sm font-semibold text-slate-900">{unit.bathrooms}</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-slate-50 rounded">
                    <Maximize className="w-4 h-4 text-slate-600 mb-1" />
                    <span className="text-xs text-slate-500">Area</span>
                    <span className="text-sm font-semibold text-slate-900">{unit.area}m²</span>
                  </div>
                </div>

                <div className="text-xs text-slate-500 pt-2 border-t">
                  Floor {unit.floor}
                </div>

                {unit.resident_name && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-slate-500" />
                      <div>
                        <p className="font-medium text-slate-700">{unit.resident_name}</p>
                        <p className="text-xs text-slate-500">{unit.resident_email}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUnit ? 'Edit Unit' : 'Add New Unit'}
            </DialogTitle>
            <DialogDescription>
              {editingUnit
                ? 'Update the unit information'
                : 'Create a new unit in a building'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="building_id">Building</Label>
                <Select
                  value={formData.building_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, building_id: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a building" />
                  </SelectTrigger>
                  <SelectContent>
                    {buildings.map((building) => (
                      <SelectItem key={building._id} value={building._id}>
                        {building.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit_number">Unit Number</Label>
                <Input
                  id="unit_number"
                  placeholder="e.g., 101, A-3"
                  value={formData.unit_number}
                  onChange={(e) =>
                    setFormData({ ...formData, unit_number: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="floor">Floor</Label>
                <Input
                  id="floor"
                  type="number"
                  min="0"
                  placeholder="e.g., 1"
                  value={formData.floor}
                  onChange={(e) =>
                    setFormData({ ...formData, floor: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">Area (m²)</Label>
                <Input
                  id="area"
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="e.g., 75.5"
                  value={formData.area}
                  onChange={(e) =>
                    setFormData({ ...formData, area: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    min="0"
                    placeholder="e.g., 2"
                    value={formData.bedrooms}
                    onChange={(e) =>
                      setFormData({ ...formData, bedrooms: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    min="0"
                    placeholder="e.g., 1"
                    value={formData.bathrooms}
                    onChange={(e) =>
                      setFormData({ ...formData, bathrooms: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: Unit['status']) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vacant">Vacant</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingUnit ? 'Update' : 'Create'} Unit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
