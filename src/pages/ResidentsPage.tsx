import React, { useState, useEffect } from "react";
import { Resident } from "../types/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useToast } from "../hooks/use-toast";
import { Textarea } from "../components/ui/textarea";

const ResidentsPage: React.FC = () => {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);

  const [formData, setFormData] = useState({
    residentId: 0,
    residentGuid: "",
    name: "",
    family: "",
    userName: "",
    password: "",
    active: true,
    createdAt: new Date().toISOString().split("T")[0],
  });

  // Fetch data from API
  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      setLoading(true);
      setIsDialogOpen(false);
      const response = await fetch("https://localhost:7207/api/resident/all");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: Resident[] = await response.json();
      setResidents(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">بارگذاری اطلاعات ساکنین...</div>
      </div>
    );
  }

  const handleEdit = (item: Resident) => {
    setEditingResident(item);
    setFormData({
      residentId: item.residentId,
      residentGuid: item.residentGuid.toString(),
      name: item.name || "",
      family: item.family || "",
      userName: item.userName || "",
      password: item.password || "",
      active: item.active,
      createdAt: item.createdAt
        ? new Date(item.createdAt).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this resident?")) return;

    try {
      const resident = residents.find((c) => c.residentId === id);
      if (!resident) return;

      // await table.deleteItem('f24hstw6yk1s', {
      //   _uid: user?.uid || '',
      //   _id: id,
      // });
      toast({
        title: "Success",
        description: "Resident deleted successfully",
      });
      fetchResidents();
    } catch (error) {
      console.error("Error deleting Resident:", error);
      toast({
        title: "Error",
        description: "Failed to delete Resident",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingResident(null);
    setFormData({
      residentId: 0,
      residentGuid: "",
      name: "",
      family: "",
      userName: "",
      password: "",
      active: true,
      createdAt: new Date().toISOString().split("T")[0],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.residentId ||
      !formData.name ||
      !formData.family ||
      !formData.userName ||
      !formData.password
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      //const Resident = residents.find((b) => b.residentId.toString() === formData.residentId);
      // const residentData = {
      //   resident_id: formData.resident_id,
      //   resident_name: resident?.name || '',
      //   cost_type: formData.cost_type,
      //   description: formData.description,
      //   amount: parseFloat(formData.amount),
      //   cost_date: formData.cost_date,
      //   recorded_by: user?.uid || '',
      //   recorded_by_name: user?.email || '',
      //   notes: formData.notes,
      //   status: formData.status,
      // };

      // if (editingResident) {
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
      fetchResidents();
    } catch (error) {
      console.error("خطا در ذخیره اطلاعات ساکن:", error);
      toast({
        title: "خطا",
        description: "خطا در ذخیره اطلاعات ساکن",
        variant: "destructive",
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
          <h1 className="text-3xl font-bold tracking-tight">لیست ساکنین</h1>
          <p className="text-muted-foreground mt-1">Manage residents List</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              افزودن ساکن
            </Button>
          </DialogTrigger>
          <DialogContent
            dir="rtl"
            className="max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <DialogHeader>
              <DialogTitle>
                {editingResident ? "ویرایش ساکن" : "ساکن جدید"}
              </DialogTitle>
              <DialogDescription>
                {editingResident ? "ویرایش اطلاعات" : "ثبت اطلاعات ساکن"}
              </DialogDescription>
            </DialogHeader>
            <form dir="rtl" onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">نام *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="نام ساکن"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="family">نام خانوادگی *</Label>
                  <Input
                    id="family"
                    type="string"
                    value={formData.family}
                    onChange={(e) =>
                      setFormData({ ...formData, family: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="createdAt">تاریخ ثبت *</Label>
                  <Input
                    id="createdAt"
                    type="date"
                    value={formData.createdAt}
                    onChange={(e) =>
                      setFormData({ ...formData, createdAt: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="userName">نام کاربری</Label>
                  <Textarea
                    id="userName"
                    value={formData.userName}
                    onChange={(e) =>
                      setFormData({ ...formData, userName: e.target.value })
                    }
                    placeholder="نام کاربری"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">رمز عبور</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="رمز عبور"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogChange(false)}
                >
                  لغو
                </Button>
                <Button type="submit">
                  {editingResident ? " ویرایش" : " ثبت"} ساکن
                </Button>
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
              <th className="py-2 px-4 border-b text-right">نام</th>
              <th className="py-2 px-4 border-b text-right">نام خانوادگی</th>
              <th className="py-2 px-4 border-b text-right">نام کاربری</th>
              <th className="py-3 px-4 border-b text-left">فعال</th>
              <th className="py-3 px-4 border-b text-left">تاریخ ایجاد</th>
              <th className="py-2 px-4 border-b text-right">اقدامات</th> 
            </tr>
          </thead>
          <tbody>
            {residents.map((item) => (
              <tr key={item.residentId} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{item.residentId}</td>
                <td className="py-2 px-4 border-b font-medium">{item.name}</td>
                <td className="py-2 px-4 border-b">{item.family}</td>
                <td className="py-2 px-4 border-b">{item.userName}</td>
                <td className="py-2 px-4 border-b">{item.active ? "فعال" : "غیرفعال"}</td>
                <td className="py-2 px-4 border-b">{new Date(item.createdAt).toLocaleDateString()}</td>
                <td className="py-2 px-4 border-b text-right">
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.residentId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        نمایش {residents.length} ساکن.
      </div>
    </div>
  );
};

export default ResidentsPage;
