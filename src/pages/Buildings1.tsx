// UserTable.tsx
import React, { useState, useEffect } from 'react';
import { House1 } from '../types/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
// import { DollarSign, TrendingUp, Calendar, FileText } from 'lucide-react';
import { Textarea } from '../components/ui/textarea';


const Buildings1: React.FC = () => {
  const [houses, setHouses] = useState<House1[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<House1 | null>(null);

  const [formData, setFormData] = useState({
    buildingId: '',
    name: '',
    address: '',
    totalUnits: '',
    managerId: '',  
    status:'pending',
    createdAt: new Date().toISOString().split('T')[0]
  });

  

  // Fetch data from API
  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
      try {
        setLoading(true);
        setIsDialogOpen(false);
        //const response = await fetch('https://jsonplaceholder.typicode.com/users');
        const response = await fetch('https://localhost:7207/api/building/all');
                
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: House1[] = await response.json();
        setHouses(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">بارگذاری اطلاعات ساختمان ها...</div>
      </div>
    );
  }

  const handleEdit = (item: House1) => {
      setEditingBuilding(item);
      setFormData({
        buildingId: item.buildingId.toString(),
        name: item.name || '',
        address: item.address || '',
        totalUnits: (item as any).totalUnits?.toString() || '',
        managerId: item.managerId?.toString() || '',  
        status: (item as any).status || 'pending',
        createdAt: item.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      });
      setIsDialogOpen(true);
    };
  
    // const handleDelete = async (id: string) => {
    //   if (!confirm('Are you sure you want to delete this cost?')) return;
  
    //   try {
    //     const cost = costs.find(c => c._id === id);
    //     if (!cost) return;
        
    //     await table.deleteItem('f24hstw6yk1s', {
    //       _uid: user?.uid || '',
    //       _id: id,
    //     });
    //     toast({
    //       title: 'Success',
    //       description: 'Cost deleted successfully',
    //     });
    //     loadData();
    //   } catch (error) {
    //     console.error('Error deleting cost:', error);
    //     toast({
    //       title: 'Error',
    //       description: 'Failed to delete cost',
    //       variant: 'destructive',
    //     });
    //   }
    // };

  const resetForm = () => {
    setEditingBuilding(null);
    setFormData({
    buildingId: '',
    name: '',
    address: '',
    totalUnits: '',
    managerId: '',  
    status:'pending',
    createdAt: new Date().toISOString().split('T')[0]
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
  
      if (!formData.buildingId || !formData.name || !formData.address || !formData.managerId) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        });
        return;
      }
  
      try {
        //const Building = houses.find((b) => b.buildingId.toString() === formData.buildingId);
        // const buildingData = {
        //   building_id: formData.building_id,
        //   building_name: building?.name || '',
        //   cost_type: formData.cost_type,
        //   description: formData.description,
        //   amount: parseFloat(formData.amount),
        //   cost_date: formData.cost_date,
        //   recorded_by: user?.uid || '',
        //   recorded_by_name: user?.email || '',
        //   notes: formData.notes,
        //   status: formData.status,
        // };
  
        // if (editingBuilding) {
        //   await table.updateItem('f24hstw6yk1s', {
        //     _uid: user?.uid || '',
        //     _id: editingCost._id,
        //     ...costData,
        //   });
        //   toast({
        //     title: 'Success',
        //     description: 'Cost updated successfully',
        //   });
        // } else {
        //   await table.addItem('f24hstw6yk1s', {
        //     _uid: user?.uid || '',
        //     ...costData,
        //   });
        //   toast({
        //     title: 'Success',
        //     description: 'Cost added successfully',
        //   });
        // }
  
        setIsDialogOpen(false);
        resetForm();
        fetchBuildings();
      } catch (error) {
        console.error('خطا در ذخیره اطلاعات ساختمان:', error);
        toast({
          title: 'خطا',
          description: 'خطا در ذخیره اطلاعات ساختمان',
          variant: 'destructive',
        });
      }
    };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-red-500 text-lg">خطا: {error}</div>
      </div>
    );
  }

  return (
    // <div className="container border-b mx-auto p-4">
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">لیست ساختمان ها</h1>
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
                <DialogTitle>{editingBuilding ? 'Edit Building' : 'Add New Building'}</DialogTitle>
                <DialogDescription>
                  {editingBuilding ? 'Update Building information' : 'Record a new building Information'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="building_id">ساختمان *</Label>
                    <Select
                      value={formData.buildingId}
                      onValueChange={(value) => setFormData({ ...formData, buildingId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="انتخاب ساختمان" />
                      </SelectTrigger>
                      <SelectContent>
                        {houses.map((building) => (
                          <SelectItem key={building.buildingId} value={building.name}>
                            {building.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* <div className="space-y-2">
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
                  </div> */}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">عنوان *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="عنوان ساختمان"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="managerId">managerId *</Label>
                    <Input
                      id="managerId"
                      type="number"
                      step="0.01"
                      value={formData.managerId}
                      onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="createdAt">تاریخ ایجاد *</Label>
                    <Input
                      id="createdAt"
                      type="date"
                      value={formData.createdAt}
                      onChange={(e) => setFormData({ ...formData, createdAt: e.target.value })}
                    />
                  </div>
                </div>

                {/* <div className="space-y-2">
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
                </div> */}

                <div className="space-y-2">
                  <Label htmlFor="address">آدرس</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Additional notes or details"
                    rows={3}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => handleDialogChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">{editingBuilding ? ' ویرایش' : ' ثبت'} ساختمان</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        
      </div>

      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-right">شناسه</th>
              <th className="py-2 px-4 border-b text-right">عنوان</th>
              <th className="py-2 px-4 border-b text-right">آدرس</th>
              <th className="py-2 px-4 border-b text-right">مدیر</th>
              {/* <th className="py-3 px-4 border-b text-left">Website</th>
              <th className="py-3 px-4 border-b text-left">Company</th> */}
            </tr>
          </thead>
          <tbody>
            {houses.map((item) => (
              <tr key={item.buildingId} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{item.buildingId}</td>
                <td className="py-2 px-4 border-b font-medium">{item.name}</td>
                {/* <td className="py-2 px-4 border-b text-blue-600">
                  <a href={`mailto:${item.email}`}>{item.email}</a>
                </td> */}
                <td className="py-2 px-4 border-b">{item.address}</td>
                {/* <td className="py-2 px-4 border-b text-blue-600">
                  <a 
                    href={`http://${user.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {item.website}
                  </a>
                </td> */}
                <td className="py-2 px-4 border-b">{item.managerId}</td>
                <td className="py-2 px-4 border-b">
                  <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            {/* <Button variant="ghost" size="icon" onClick={() => handleDelete(item.buildingId)}>
                              <Trash2 className="h-4 w-4" />
                            </Button> */}
                          </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        Showing {houses.length} buildings.
      </div>
    </div>
  );
};

export default Buildings1;