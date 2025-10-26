import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { useToast } from '../hooks/use-toast';
import { Plus, DollarSign, Calendar, Edit, Trash2, FileText, TrendingUp } from 'lucide-react';
import { table } from '@devvai/devv-code-backend';
import { useAuthStore } from '../store/auth-store';

interface Building {
  _id: string;
  name: string;
  address: string;
}

interface BuildingCharge {
  _id: string;
  building_id: string;
  building_name: string;
  charge_type: string;
  amount: number;
  billing_cycle: string;
  effective_date: string;
  description: string;
  is_active: string;
}

const chargeTypes = [
  { value: 'monthly_rent', label: 'Monthly Rent' },
  { value: 'maintenance_fee', label: 'Maintenance Fee' },
  { value: 'water', label: 'Water' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'gas', label: 'Gas' },
  { value: 'parking', label: 'Parking' },
  { value: 'internet', label: 'Internet' },
  { value: 'other', label: 'Other' },
];

const billingCycles = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' },
  { value: 'one_time', label: 'One-time' },
];

export default function ChargesPage() {
  const { user } = useAuthStore();
  const role = user?.role;
  const { toast } = useToast();
  const [charges, setCharges] = useState<BuildingCharge[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCharge, setEditingCharge] = useState<BuildingCharge | null>(null);
  const [filterBuilding, setFilterBuilding] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<string>('all');
  
  const [formData, setFormData] = useState({
    building_id: '',
    charge_type: '',
    amount: '',
    billing_cycle: 'monthly',
    effective_date: new Date().toISOString().split('T')[0],
    description: '',
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load buildings
      const buildingsResult = await table.getItems('f24gxm1s2pz4', {
        limit: 100,
      });
      setBuildings(buildingsResult.items as Building[]);

      // Load charges
      const chargesResult = await table.getItems('f24hstx8f7k0', {
        limit: 100,
      });
      setCharges(chargesResult.items as BuildingCharge[]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load charges data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.building_id || !formData.charge_type || !formData.amount) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const building = buildings.find((b) => b._id === formData.building_id);
      const chargeData = {
        building_id: formData.building_id,
        building_name: building?.name || '',
        charge_type: formData.charge_type,
        amount: parseFloat(formData.amount),
        billing_cycle: formData.billing_cycle,
        effective_date: formData.effective_date,
        description: formData.description,
        is_active: formData.is_active ? 'true' : 'false',
      };

      if (editingCharge) {
        await table.updateItem('f24hstx8f7k0', {
          _uid: user?.uid || '',
          _id: editingCharge._id,
          ...chargeData,
        });
        toast({
          title: 'Success',
          description: 'Charge updated successfully',
        });
      } else {
        await table.addItem('f24hstx8f7k0', {
          _uid: user?.uid || '',
          ...chargeData,
        });
        toast({
          title: 'Success',
          description: 'Charge added successfully',
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving charge:', error);
      toast({
        title: 'Error',
        description: 'Failed to save charge',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (charge: BuildingCharge) => {
    setEditingCharge(charge);
    setFormData({
      building_id: charge.building_id,
      charge_type: charge.charge_type,
      amount: charge.amount.toString(),
      billing_cycle: charge.billing_cycle,
      effective_date: charge.effective_date,
      description: charge.description,
      is_active: charge.is_active === 'true',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this charge?')) return;

    try {
      const charge = charges.find(c => c._id === id);
      if (!charge) return;
      
      await table.deleteItem('f24hstx8f7k0', {
        _uid: user?.uid || '',
        _id: id,
      });
      toast({
        title: 'Success',
        description: 'Charge deleted successfully',
      });
      loadData();
    } catch (error) {
      console.error('Error deleting charge:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete charge',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setEditingCharge(null);
    setFormData({
      building_id: '',
      charge_type: '',
      amount: '',
      billing_cycle: 'monthly',
      effective_date: new Date().toISOString().split('T')[0],
      description: '',
      is_active: true,
    });
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  // Filter charges
  const filteredCharges = charges.filter((charge) => {
    if (filterBuilding !== 'all' && charge.building_id !== filterBuilding) return false;
    if (filterActive === 'active' && charge.is_active !== 'true') return false;
    if (filterActive === 'inactive' && charge.is_active !== 'false') return false;
    return true;
  });

  // Calculate statistics
  const activeCharges = charges.filter((c) => c.is_active === 'true');
  const totalActiveAmount = activeCharges.reduce((sum, charge) => {
    // Normalize to monthly amount
    let monthlyAmount = charge.amount;
    if (charge.billing_cycle === 'quarterly') monthlyAmount = charge.amount / 3;
    if (charge.billing_cycle === 'annually') monthlyAmount = charge.amount / 12;
    return sum + monthlyAmount;
  }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading charges...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Building Charges</h1>
          <p className="text-muted-foreground mt-1">Define and manage recurring charges for buildings</p>
        </div>
        {role === 'admin' ? (
          <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Charge
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingCharge ? 'Edit Charge' : 'Add New Charge'}</DialogTitle>
                <DialogDescription>
                  {editingCharge ? 'Update charge information' : 'Define a new building charge'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="building_id">Building *</Label>
                    <Select
                      value={formData.building_id}
                      onValueChange={(value) => setFormData({ ...formData, building_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select building" />
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
                    <Label htmlFor="charge_type">Charge Type *</Label>
                    <Select
                      value={formData.charge_type}
                      onValueChange={(value) => setFormData({ ...formData, charge_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {chargeTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="billing_cycle">Billing Cycle *</Label>
                    <Select
                      value={formData.billing_cycle}
                      onValueChange={(value) => setFormData({ ...formData, billing_cycle: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {billingCycles.map((cycle) => (
                          <SelectItem key={cycle.value} value={cycle.value}>
                            {cycle.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="effective_date">Effective Date *</Label>
                  <Input
                    id="effective_date"
                    type="date"
                    value={formData.effective_date}
                    onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Additional details about this charge"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active (applies to new bills)</Label>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => handleDialogChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">{editingCharge ? 'Update' : 'Add'} Charge</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        ) : null}
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Charges</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCharges.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalActiveAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Estimated per month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Charges</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{charges.length}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Building</Label>
              <Select value={filterBuilding} onValueChange={setFilterBuilding}>
                <SelectTrigger>
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
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filterActive} onValueChange={setFilterActive}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charges List */}
      <Card>
        <CardHeader>
          <CardTitle>Charge Definitions</CardTitle>
          <CardDescription>All building charges configuration</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCharges.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">No charges found</h3>
              <p className="text-muted-foreground mt-2">
                {role === 'admin'
                  ? 'Add your first charge to start billing residents'
                  : 'No charges have been configured yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCharges
                .sort((a, b) => new Date(b.effective_date).getTime() - new Date(a.effective_date).getTime())
                .map((charge) => (
                  <div
                    key={charge._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">
                          {chargeTypes.find((t) => t.value === charge.charge_type)?.label}
                        </h4>
                        <Badge variant="outline">
                          {billingCycles.find((c) => c.value === charge.billing_cycle)?.label}
                        </Badge>
                        {charge.is_active === 'true' ? (
                          <Badge className="bg-green-500">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {charge.building_name} • Effective from {new Date(charge.effective_date).toLocaleDateString()}
                      </p>
                      {charge.description && (
                        <p className="text-sm text-muted-foreground mt-1">{charge.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xl font-bold">${charge.amount.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">
                          per {charge.billing_cycle === 'one_time' ? 'time' : charge.billing_cycle.replace('ly', '')}
                        </div>
                      </div>
                      {role === 'admin' && (
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(charge)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(charge._id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
