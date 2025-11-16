import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';
import { Plus, DollarSign, TrendingUp, Calendar, Edit, Trash2, FileText } from 'lucide-react';
import { table } from '@devvai/devv-code-backend';
import { useAuthStore } from '../store/auth-store';

interface Building {
  _id: string;
  name: string;
  address: string;
}

interface BuildingCost {
  _id: string;
  building_id: string;
  building_name: string;
  cost_type: string;
  description: string;
  amount: number;
  cost_date: string;
  recorded_by: string;
  recorded_by_name: string;
  notes: string;
  status: string;
}

const costTypes = [
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'repairs', label: 'Repairs' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'security', label: 'Security' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'other', label: 'Other' },
];

const statusTypes = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500' },
  { value: 'approved', label: 'Approved', color: 'bg-blue-500' },
  { value: 'paid', label: 'Paid', color: 'bg-green-500' },
];

export default function CostsPage() {
  const { user } = useAuthStore();
  const role = user?.role;
  const { toast } = useToast();
  const [costs, setCosts] = useState<BuildingCost[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<BuildingCost | null>(null);
  const [filterBuilding, setFilterBuilding] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const [formData, setFormData] = useState({
    building_id: '',
    cost_type: '',
    description: '',
    amount: '',
    cost_date: new Date().toISOString().split('T')[0],
    notes: '',
    status: 'pending',
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

      // Load costs
      const costsResult = await table.getItems('f24hstw6yk1s', {
        limit: 100,
      });
      setCosts(costsResult.items as BuildingCost[]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load costs data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.building_id || !formData.cost_type || !formData.description || !formData.amount) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const building = buildings.find((b) => b._id === formData.building_id);
      const costData = {
        building_id: formData.building_id,
        building_name: building?.name || '',
        cost_type: formData.cost_type,
        description: formData.description,
        amount: parseFloat(formData.amount),
        cost_date: formData.cost_date,
        recorded_by: user?.uid || '',
        recorded_by_name: user?.email || '',
        notes: formData.notes,
        status: formData.status,
      };

      if (editingCost) {
        await table.updateItem('f24hstw6yk1s', {
          _uid: user?.uid || '',
          _id: editingCost._id,
          ...costData,
        });
        toast({
          title: 'Success',
          description: 'Cost updated successfully',
        });
      } else {
        await table.addItem('f24hstw6yk1s', {
          _uid: user?.uid || '',
          ...costData,
        });
        toast({
          title: 'Success',
          description: 'Cost added successfully',
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving cost:', error);
      toast({
        title: 'Error',
        description: 'Failed to save cost',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (cost: BuildingCost) => {
    setEditingCost(cost);
    setFormData({
      building_id: cost.building_id,
      cost_type: cost.cost_type,
      description: cost.description,
      amount: cost.amount.toString(),
      cost_date: cost.cost_date,
      notes: cost.notes,
      status: cost.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cost?')) return;

    try {
      const cost = costs.find(c => c._id === id);
      if (!cost) return;
      
      await table.deleteItem('f24hstw6yk1s', {
        _uid: user?.uid || '',
        _id: id,
      });
      toast({
        title: 'Success',
        description: 'Cost deleted successfully',
      });
      loadData();
    } catch (error) {
      console.error('Error deleting cost:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete cost',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setEditingCost(null);
    setFormData({
      building_id: '',
      cost_type: '',
      description: '',
      amount: '',
      cost_date: new Date().toISOString().split('T')[0],
      notes: '',
      status: 'pending',
    });
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  // Filter costs
  const filteredCosts = costs.filter((cost) => {
    if (filterBuilding !== 'all' && cost.building_id !== filterBuilding) return false;
    if (filterType !== 'all' && cost.cost_type !== filterType) return false;
    if (filterStatus !== 'all' && cost.status !== filterStatus) return false;
    return true;
  });

  // Calculate statistics
  const totalCosts = filteredCosts.reduce((sum, cost) => sum + cost.amount, 0);
  const pendingCosts = filteredCosts.filter((c) => c.status === 'pending').length;
  const thisMonthCosts = filteredCosts.filter((c) => {
    const costDate = new Date(c.cost_date);
    const now = new Date();
    return costDate.getMonth() === now.getMonth() && costDate.getFullYear() === now.getFullYear();
  });
  const thisMonthTotal = thisMonthCosts.reduce((sum, cost) => sum + cost.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading costs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Building Costs</h1>
          <p className="text-muted-foreground mt-1">Track and manage building expenses</p>
        </div>
        
          <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Cost
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingCost ? 'Edit Cost' : 'Add New Cost'}</DialogTitle>
                <DialogDescription>
                  {editingCost ? 'Update cost information' : 'Record a new building expense'}
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
                    <Label htmlFor="cost_type">Cost Type *</Label>
                    <Select
                      value={formData.cost_type}
                      onValueChange={(value) => setFormData({ ...formData, cost_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {costTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the cost"
                  />
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
                    <Label htmlFor="cost_date">Date *</Label>
                    <Input
                      id="cost_date"
                      type="date"
                      value={formData.cost_date}
                      onChange={(e) => setFormData({ ...formData, cost_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusTypes.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes or details"
                    rows={3}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => handleDialogChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">{editingCost ? 'Update' : 'Add'} Cost</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Costs</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCosts.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">{filteredCosts.length} total records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${thisMonthTotal.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">{thisMonthCosts.length} costs recorded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCosts}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label>Cost Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {costTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statusTypes.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Costs List */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Records</CardTitle>
          <CardDescription>All building expenses and costs</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCosts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">No costs found</h3>
              <p className="text-muted-foreground mt-2">
                {role === 'admin' || role === 'manager'
                  ? 'Add your first cost to start tracking expenses'
                  : 'No costs have been recorded yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCosts
                .sort((a, b) => new Date(b.cost_date).getTime() - new Date(a.cost_date).getTime())
                .map((cost) => {
                  const statusInfo = statusTypes.find((s) => s.value === cost.status);
                  return (
                    <div
                      key={cost._id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">{cost.description}</h4>
                          <Badge variant="outline">{costTypes.find((t) => t.value === cost.cost_type)?.label}</Badge>
                          <Badge className={statusInfo?.color}>{statusInfo?.label}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {cost.building_name} • {new Date(cost.cost_date).toLocaleDateString()}
                        </p>
                        {cost.notes && <p className="text-sm text-muted-foreground mt-1">{cost.notes}</p>}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-xl font-bold">${cost.amount.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">Recorded by {cost.recorded_by_name}</div>
                        </div>
                        {(role === 'admin' || role === 'manager') && (
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(cost)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(cost._id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
