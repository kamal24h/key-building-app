import { useState, useEffect } from 'react';
import { Plus, Building2, Edit, Trash2, MapPin, Users } from 'lucide-react';
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
  status: 'active' | 'inactive' | 'under_construction';
  created_at: string;
}

const BUILDINGS_TABLE_ID = 'f24gxm1s2pz4';

export default function BuildingsPage() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    total_units: '',
    status: 'active' as Building['status'],
  });
  const { toast } = useToast();
  const { user } = useAuthStore();

  useEffect(() => {
    loadBuildings();
  }, []);

  const loadBuildings = async () => {
    try {
      setLoading(true);
      const result = await table.getItems(BUILDINGS_TABLE_ID, {
        limit: 100,
        order: 'desc',
      });
      setBuildings(result.items as Building[]);
    } catch (error) {
      console.error('Failed to load buildings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load buildings',
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
      const buildingData = {
        _uid: user.uid,
        name: formData.name,
        address: formData.address,
        total_units: parseInt(formData.total_units),
        status: formData.status,
        created_at: new Date().toISOString(),
      };

      if (editingBuilding) {
        await table.updateItem(BUILDINGS_TABLE_ID, {
          _uid: editingBuilding._uid,
          _id: editingBuilding._id,
          ...buildingData,
        });
        toast({
          title: 'Success',
          description: 'Building updated successfully',
        });
      } else {
        await table.addItem(BUILDINGS_TABLE_ID, buildingData);
        toast({
          title: 'Success',
          description: 'Building created successfully',
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadBuildings();
    } catch (error) {
      console.error('Failed to save building:', error);
      toast({
        title: 'Error',
        description: 'Failed to save building',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (building: Building) => {
    setEditingBuilding(building);
    setFormData({
      name: building.name,
      address: building.address,
      total_units: building.total_units.toString(),
      status: building.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (building: Building) => {
    if (!confirm(`Are you sure you want to delete "${building.name}"?`)) {
      return;
    }

    try {
      await table.deleteItem(BUILDINGS_TABLE_ID, {
        _uid: building._uid,
        _id: building._id,
      });
      toast({
        title: 'Success',
        description: 'Building deleted successfully',
      });
      loadBuildings();
    } catch (error) {
      console.error('Failed to delete building:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete building',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      total_units: '',
      status: 'active',
    });
    setEditingBuilding(null);
  };

  const getStatusColor = (status: Building['status']) => {
    switch (status) {
      case 'active':
        return 'text-emerald-600 bg-emerald-50';
      case 'inactive':
        return 'text-gray-600 bg-gray-100';
      case 'under_construction':
        return 'text-amber-600 bg-amber-50';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: Building['status']) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'inactive':
        return 'Inactive';
      case 'under_construction':
        return 'Under Construction';
      default:
        return status;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Buildings</h1>
          <p className="text-slate-600 mt-1">Manage your property buildings</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Building
        </Button>
      </div>

      {/* Buildings Grid */}
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
      ) : buildings.length === 0 ? (
        <Card className="p-12 text-center">
          <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No buildings yet</h3>
          <p className="text-slate-600 mb-6">Get started by adding your first building</p>
          <Button
            onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Building
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {buildings.map((building) => (
            <Card key={building._id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{building.name}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                        building.status
                      )}`}
                    >
                      {getStatusLabel(building.status)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(building)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(building)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{building.address}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Users className="w-4 h-4 flex-shrink-0" />
                  <span>{building.total_units} units</span>
                </div>
                {building.manager_name && (
                  <div className="pt-2 border-t">
                    <span className="text-xs text-slate-500">Manager:</span>
                    <p className="text-sm font-medium text-slate-700">
                      {building.manager_name}
                    </p>
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
              {editingBuilding ? 'Edit Building' : 'Add New Building'}
            </DialogTitle>
            <DialogDescription>
              {editingBuilding
                ? 'Update the building information'
                : 'Create a new building in your property portfolio'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Building Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Sunset Towers"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="e.g., 123 Main Street, City"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total_units">Total Units</Label>
                <Input
                  id="total_units"
                  type="number"
                  min="1"
                  placeholder="e.g., 50"
                  value={formData.total_units}
                  onChange={(e) =>
                    setFormData({ ...formData, total_units: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: Building['status']) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="under_construction">
                      Under Construction
                    </SelectItem>
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
                {editingBuilding ? 'Update' : 'Create'} Building
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
