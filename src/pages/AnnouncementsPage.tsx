import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/auth-store';
import { table } from '@devvai/devv-code-backend';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';
import { Megaphone, Plus, Pencil, Archive, Send, FileText, Filter } from 'lucide-react';

interface Building {
  _id: string;
  name: string;
  address: string;
}

interface Announcement {
  _id: string;
  _uid: string;
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  target_role: 'all' | 'admin' | 'manager' | 'resident';
  target_building_id: string;
  status: 'draft' | 'published' | 'archived';
  created_by: string;
  created_at: string;
  published_at?: string;
}

interface FormData {
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  target_role: 'all' | 'admin' | 'manager' | 'resident';
  target_building_id: string;
}

export default function AnnouncementsPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    priority: 'normal',
    target_role: 'all',
    target_building_id: '',
  });

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [announcementsRes, buildingsRes] = await Promise.all([
        table.getItems('f26wla7m4wlc', { limit: 100, order: 'desc' }),
        table.getItems('f24gxm1s2pz4', { limit: 100 }),
      ]);

      setAnnouncements(announcementsRes.items as Announcement[]);
      setBuildings(buildingsRes.items as Building[]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const now = new Date().toISOString();
      const announcementData = {
        ...formData,
        status,
        created_by: user?.uid || '',
        created_at: editingId ? announcements.find(a => a._id === editingId)?.created_at || now : now,
        published_at: status === 'published' ? now : undefined,
      };

      if (editingId) {
        const existing = announcements.find(a => a._id === editingId);
        await table.updateItem('f26wla7m4wlc', {
          _uid: existing?._uid || user?.uid || '',
          _id: editingId,
          ...announcementData,
        });
        toast({ title: 'Success', description: 'Announcement updated successfully' });
      } else {
        await table.addItem('f26wla7m4wlc', {
          _uid: user?.uid || '',
          ...announcementData,
        });
        toast({ title: 'Success', description: `Announcement ${status === 'published' ? 'published' : 'saved as draft'}` });
        
        // Create notifications if published
        if (status === 'published') {
          await createNotifications(announcementData);
        }
      }

      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save announcement',
        variant: 'destructive',
      });
      console.error('Submit error:', error);
    }
  };

  const createNotifications = async (announcement: any) => {
    try {
      // Get all user profiles based on target
      const profilesRes = await table.getItems('f24gxm1pktmo', { limit: 100 });
      let targetUsers = profilesRes.items || [];
      
      // Filter by role
      if (announcement.target_role !== 'all') {
        targetUsers = targetUsers.filter((u: any) => u.role === announcement.target_role);
      }

      // Filter by building if specified
      if (announcement.target_building_id) {
        const unitsRes = await table.getItems('f24gxm1s2pz5', { limit: 100 });
        const buildingUnits = (unitsRes.items || []).filter(
          (unit: any) => unit.building_id === announcement.target_building_id
        );
        const residentIds = buildingUnits.map((unit: any) => unit.resident_id).filter(Boolean);
        targetUsers = targetUsers.filter((u: any) => residentIds.includes(u.user_id));
      }

      // Create notification for each target user
      const notifications = targetUsers.map((targetUser: any) => ({
        user_id: targetUser.user_id,
        type: 'announcement',
        title: announcement.title,
        message: announcement.content.substring(0, 100) + (announcement.content.length > 100 ? '...' : ''),
        link: '/announcements',
        is_read: 'false',
        created_at: new Date().toISOString(),
        related_id: '', // Will be set after announcement is created
      }));

      await Promise.all(notifications.map(notif => 
        table.addItem('f26wla7m4wld', { _uid: notif.user_id, ...notif })
      ));
    } catch (error) {
      console.error('Failed to create notifications:', error);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingId(announcement._id);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      target_role: announcement.target_role,
      target_building_id: announcement.target_building_id,
    });
    setDialogOpen(true);
  };

  const handlePublish = async (id: string) => {
    try {
      const announcement = announcements.find(a => a._id === id);
      if (!announcement) return;

      const updatedData = {
        ...announcement,
        status: 'published',
        published_at: new Date().toISOString(),
      };

      const { _id, _uid, ...updatedRest } = updatedData;
      await table.updateItem('f26wla7m4wlc', {
        _uid: announcement._uid || user?.uid || '',
        _id: id,
        ...updatedRest,
      });
      await createNotifications(updatedData);
      
      toast({ title: 'Success', description: 'Announcement published successfully' });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to publish announcement',
        variant: 'destructive',
      });
      console.error('Publish error:', error);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      const announcement = announcements.find(a => a._id === id);
      if (!announcement) return;
      const { _id, _uid, ...announcementRest } = announcement;
      await table.updateItem('f26wla7m4wlc', {
        _uid: announcement._uid || user?.uid || '',
        _id: id,
        ...announcementRest,
        status: 'archived',
      });
      toast({ title: 'Success', description: 'Announcement archived successfully' });
      loadData();
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to archive announcement',
        variant: 'destructive',
      });
      console.error('Archive error:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      priority: 'normal',
      target_role: 'all',
      target_building_id: '',
    });
    setEditingId(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 hover:bg-red-600';
      case 'high': return 'bg-orange-500 hover:bg-orange-600';
      case 'normal': return 'bg-blue-500 hover:bg-blue-600';
      case 'low': return 'bg-gray-500 hover:bg-gray-600';
      default: return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500';
      case 'draft': return 'bg-yellow-500';
      case 'archived': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    if (filterStatus !== 'all' && announcement.status !== filterStatus) return false;
    if (filterPriority !== 'all' && announcement.priority !== filterPriority) return false;
    return true;
  });

  const stats = {
    total: announcements.length,
    published: announcements.filter(a => a.status === 'published').length,
    drafts: announcements.filter(a => a.status === 'draft').length,
    urgent: announcements.filter(a => a.priority === 'urgent' && a.status === 'published').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground">
            Create and manage announcements for residents and managers
          </p>
        </div>
        {(isAdmin || isManager) && (
          <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            New Announcement
          </Button>
        )}
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Announcements</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.published}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.drafts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Active</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.urgent}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No announcements found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {(isAdmin || isManager) ? 'Create your first announcement to keep everyone informed' : 'Check back later for updates'}
              </p>
              {(isAdmin || isManager) && (
                <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Announcement
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredAnnouncements.map((announcement) => (
            <Card key={announcement._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle>{announcement.title}</CardTitle>
                      <Badge className={getPriorityColor(announcement.priority)}>
                        {announcement.priority}
                      </Badge>
                      <Badge className={getStatusColor(announcement.status)}>
                        {announcement.status}
                      </Badge>
                      <Badge variant="outline">{announcement.target_role}</Badge>
                    </div>
                    <CardDescription>
                      {announcement.published_at
                        ? `Published on ${new Date(announcement.published_at).toLocaleDateString()}`
                        : `Created on ${new Date(announcement.created_at).toLocaleDateString()}`}
                      {announcement.target_building_id && (
                        <span className="ml-2">
                          • Building: {buildings.find(b => b._id === announcement.target_building_id)?.name || 'Unknown'}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  {(isAdmin || isManager) && (
                    <div className="flex gap-2">
                      {announcement.status === 'draft' && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handlePublish(announcement._id)}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Publish
                        </Button>
                      )}
                      {announcement.status !== 'archived' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(announcement)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleArchive(announcement._id)}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{announcement.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Announcement' : 'Create New Announcement'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update announcement details' : 'Fill in the details to create a new announcement'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter announcement title"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Content *</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter announcement content"
                rows={6}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Target Audience</label>
                <Select
                  value={formData.target_role}
                  onValueChange={(value: any) => setFormData({ ...formData, target_role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="admin">Admins Only</SelectItem>
                    <SelectItem value="manager">Managers Only</SelectItem>
                    <SelectItem value="resident">Residents Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Target Building (Optional)</label>
              <Select
                value={formData.target_building_id}
                onValueChange={(value) => setFormData({ ...formData, target_building_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All buildings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Buildings</SelectItem>
                  {buildings.map((building) => (
                    <SelectItem key={building._id} value={building._id}>
                      {building.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="outline" onClick={() => handleSubmit('draft')}>
              Save as Draft
            </Button>
            <Button onClick={() => handleSubmit('published')}>
              <Send className="mr-2 h-4 w-4" />
              Publish Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
