import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';
import { Plus, DollarSign, AlertCircle, CheckCircle, Edit, Trash2, FileText } from 'lucide-react';
import { table } from '@devvai/devv-code-backend';
import { useAuthStore } from '../store/auth-store';

interface Bill {
  _id: string;
  unit_id: string;
  unit_number: string;
  building_id: string;
  building_name: string;
  resident_id: string;
  resident_name: string;
  billing_period: string;
  total_amount: number;
  paid_amount: number;
  payment_status: string;
  due_date: string;
  issue_date: string;
  payment_date: string;
  charges_breakdown: string;
  notes: string;
}

interface Building {
  _id: string;
  name: string;
}

interface Unit {
  _id: string;
  unit_number: string;
  building_id: string;
  building_name: string;
  resident_id: string;
  resident_name: string;
}

interface BuildingCharge {
  _id: string;
  building_id: string;
  charge_type: string;
  amount: number;
  billing_cycle: string;
  is_active: string;
}

const paymentStatuses = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500', icon: AlertCircle },
  { value: 'partial', label: 'Partial', color: 'bg-blue-500', icon: DollarSign },
  { value: 'paid', label: 'Paid', color: 'bg-green-500', icon: CheckCircle },
  { value: 'overdue', label: 'Overdue', color: 'bg-red-500', icon: AlertCircle },
];

export default function BillsPage() {
  const { user } = useAuthStore();
  const role = user?.role;
  const { toast } = useToast();
  const [bills, setBills] = useState<Bill[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [charges, setCharges] = useState<BuildingCharge[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [filterBuilding, setFilterBuilding] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const [generateForm, setGenerateForm] = useState({
    building_id: '',
    billing_period: new Date().toISOString().slice(0, 7), // YYYY-MM
  });

  const [paymentForm, setPaymentForm] = useState({
    paid_amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    notes: '',
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

      // Load units
      const unitsResult = await table.getItems('f24gxm1s2pz5', {
        limit: 100,
      });
      setUnits(unitsResult.items as Unit[]);

      // Load charges
      const chargesResult = await table.getItems('f24hstx8f7k0', {
        limit: 100,
      });
      setCharges(chargesResult.items as BuildingCharge[]);

      // Load bills
      const billsResult = await table.getItems('f24hstxawxkw', {
        limit: 100,
      });
      setBills(billsResult.items as Bill[]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load bills data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBills = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!generateForm.building_id || !generateForm.billing_period) {
      toast({
        title: 'Validation Error',
        description: 'Please select building and billing period',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Get units for the selected building with assigned residents
      const buildingUnits = units.filter(
        (u) => u.building_id === generateForm.building_id && u.resident_id
      );

      if (buildingUnits.length === 0) {
        toast({
          title: 'No Units Found',
          description: 'No units with assigned residents in this building',
          variant: 'destructive',
        });
        return;
      }

      // Get active charges for this building
      const buildingCharges = charges.filter(
        (c) => c.building_id === generateForm.building_id && c.is_active === 'true'
      );

      if (buildingCharges.length === 0) {
        toast({
          title: 'No Charges Found',
          description: 'No active charges defined for this building',
          variant: 'destructive',
        });
        return;
      }

      const building = buildings.find((b) => b._id === generateForm.building_id);
      let generatedCount = 0;

      // Generate bills for each unit
      for (const unit of buildingUnits) {
        // Check if bill already exists for this period
        const existingBill = bills.find(
          (b) => b.unit_id === unit._id && b.billing_period === generateForm.billing_period
        );

        if (existingBill) continue;

        // Calculate charges
        const chargesBreakdown: any[] = [];
        let totalAmount = 0;

        buildingCharges.forEach((charge) => {
          chargesBreakdown.push({
            type: charge.charge_type,
            amount: charge.amount,
          });
          totalAmount += charge.amount;
        });

        // Create bill
        const billData = {
          unit_id: unit._id,
          unit_number: unit.unit_number,
          building_id: unit.building_id,
          building_name: building?.name || '',
          resident_id: unit.resident_id,
          resident_name: unit.resident_name,
          billing_period: generateForm.billing_period,
          total_amount: totalAmount,
          paid_amount: 0,
          payment_status: 'pending',
          due_date: new Date(new Date(generateForm.billing_period + '-01').setMonth(new Date(generateForm.billing_period + '-01').getMonth() + 1, 5)).toISOString().split('T')[0],
          issue_date: new Date().toISOString().split('T')[0],
          payment_date: '',
          charges_breakdown: JSON.stringify(chargesBreakdown),
          notes: '',
        };

        await table.addItem('f24hstxawxkw', {
          _uid: unit.resident_id,
          ...billData,
        });
        generatedCount++;
      }

      toast({
        title: 'Success',
        description: `Generated ${generatedCount} bills for ${generateForm.billing_period}`,
      });

      setIsGenerateDialogOpen(false);
      setGenerateForm({
        building_id: '',
        billing_period: new Date().toISOString().slice(0, 7),
      });
      loadData();
    } catch (error) {
      console.error('Error generating bills:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate bills',
        variant: 'destructive',
      });
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBill || !paymentForm.paid_amount) {
      toast({
        title: 'Validation Error',
        description: 'Please enter payment amount',
        variant: 'destructive',
      });
      return;
    }

    try {
      const paidAmount = parseFloat(paymentForm.paid_amount);
      const newTotalPaid = selectedBill.paid_amount + paidAmount;
      let newStatus = 'pending';

      if (newTotalPaid >= selectedBill.total_amount) {
        newStatus = 'paid';
      } else if (newTotalPaid > 0) {
        newStatus = 'partial';
      }

      await table.updateItem('f24hstxawxkw', {
        _uid: selectedBill.resident_id,
        _id: selectedBill._id,
        paid_amount: newTotalPaid,
        payment_status: newStatus,
        payment_date: newStatus === 'paid' ? paymentForm.payment_date : selectedBill.payment_date,
        notes: paymentForm.notes || selectedBill.notes,
      });

      toast({
        title: 'Success',
        description: 'Payment recorded successfully',
      });

      setIsPaymentDialogOpen(false);
      setSelectedBill(null);
      setPaymentForm({
        paid_amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        notes: '',
      });
      loadData();
    } catch (error) {
      console.error('Error recording payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to record payment',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bill?')) return;

    try {
      const bill = bills.find(b => b._id === id);
      if (!bill) return;
      
      await table.deleteItem('f24hstxawxkw', {
        _uid: bill.resident_id,
        _id: id,
      });
      toast({
        title: 'Success',
        description: 'Bill deleted successfully',
      });
      loadData();
    } catch (error) {
      console.error('Error deleting bill:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete bill',
        variant: 'destructive',
      });
    }
  };

  const openPaymentDialog = (bill: Bill) => {
    setSelectedBill(bill);
    setPaymentForm({
      paid_amount: '',
      payment_date: new Date().toISOString().split('T')[0],
      notes: bill.notes,
    });
    setIsPaymentDialogOpen(true);
  };

  // Filter bills
  const filteredBills = bills.filter((bill) => {
    if (filterBuilding !== 'all' && bill.building_id !== filterBuilding) return false;
    if (filterStatus !== 'all' && bill.payment_status !== filterStatus) return false;
    
    // Residents can only see their own bills
    if (role === 'resident' && bill.resident_id !== user?.uid) return false;
    
    return true;
  });

  // Calculate statistics
  const totalRevenue = filteredBills.reduce((sum, bill) => sum + bill.total_amount, 0);
  const totalPaid = filteredBills.reduce((sum, bill) => sum + bill.paid_amount, 0);
  const pendingBills = filteredBills.filter((b) => b.payment_status === 'pending' || b.payment_status === 'overdue').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading bills...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bills Management</h1>
          <p className="text-muted-foreground mt-1">Generate and track resident bills</p>
        </div>
        {(role === 'admin' || role === 'manager') && (
          <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Generate Bills
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Bills</DialogTitle>
                <DialogDescription>
                  Create bills for all units in a building for the specified period
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleGenerateBills} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="building_id">Building *</Label>
                  <Select
                    value={generateForm.building_id}
                    onValueChange={(value) => setGenerateForm({ ...generateForm, building_id: value })}
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
                  <Label htmlFor="billing_period">Billing Period *</Label>
                  <Input
                    id="billing_period"
                    type="month"
                    value={generateForm.billing_period}
                    onChange={(e) => setGenerateForm({ ...generateForm, billing_period: e.target.value })}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Generate Bills</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Billed</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">{filteredBills.length} bills</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPaid.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((totalPaid / totalRevenue) * 100 || 0).toFixed(1)}% collected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payment</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingBills}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting payment</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      {role !== 'resident' && (
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
                <Label>Payment Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {paymentStatuses.map((status) => (
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
      )}

      {/* Bills List */}
      <Card>
        <CardHeader>
          <CardTitle>Bills</CardTitle>
          <CardDescription>All generated bills and payment status</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredBills.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">No bills found</h3>
              <p className="text-muted-foreground mt-2">
                {role === 'admin' || role === 'manager'
                  ? 'Generate your first bill to start billing residents'
                  : 'No bills have been generated for you yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBills
                .sort((a, b) => b.billing_period.localeCompare(a.billing_period))
                .map((bill) => {
                  const statusInfo = paymentStatuses.find((s) => s.value === bill.payment_status);
                  const StatusIcon = statusInfo?.icon || FileText;
                  const breakdown = bill.charges_breakdown ? JSON.parse(bill.charges_breakdown) : [];

                  return (
                    <div
                      key={bill._id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">
                            {bill.building_name} - Unit {bill.unit_number}
                          </h4>
                          <Badge className={statusInfo?.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo?.label}
                          </Badge>
                          <Badge variant="outline">{bill.billing_period}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Resident: {bill.resident_name} • Due: {new Date(bill.due_date).toLocaleDateString()}
                        </p>
                        {breakdown.length > 0 && (
                          <div className="text-xs text-muted-foreground mt-2">
                            {breakdown.map((item: any, idx: number) => (
                              <span key={idx}>
                                {item.type}: ${item.amount.toFixed(2)}
                                {idx < breakdown.length - 1 ? ' + ' : ''}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-xl font-bold">${bill.total_amount.toFixed(2)}</div>
                          {bill.paid_amount > 0 && (
                            <div className="text-sm text-green-600">
                              Paid: ${bill.paid_amount.toFixed(2)}
                            </div>
                          )}
                        </div>
                        {(role === 'admin' || role === 'manager') && (
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openPaymentDialog(bill)}
                              disabled={bill.payment_status === 'paid'}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(bill._id)}>
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

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment for {selectedBill?.building_name} - Unit {selectedBill?.unit_number}
            </DialogDescription>
          </DialogHeader>
          {selectedBill && (
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div className="p-4 bg-accent/50 rounded-lg space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Amount:</span>
                  <span className="font-semibold">${selectedBill.total_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Already Paid:</span>
                  <span className="font-semibold">${selectedBill.paid_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-1">
                  <span className="text-sm text-muted-foreground">Remaining:</span>
                  <span className="font-semibold">${(selectedBill.total_amount - selectedBill.paid_amount).toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paid_amount">Payment Amount *</Label>
                <Input
                  id="paid_amount"
                  type="number"
                  step="0.01"
                  value={paymentForm.paid_amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paid_amount: e.target.value })}
                  placeholder="0.00"
                  max={selectedBill.total_amount - selectedBill.paid_amount}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_date">Payment Date *</Label>
                <Input
                  id="payment_date"
                  type="date"
                  value={paymentForm.payment_date}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Record Payment</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
