import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/auth-store';
import { table } from '@devvai/devv-code-backend';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';
import { Bell, CheckCheck, Trash2, ExternalLink, Megaphone, DollarSign, AlertCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Notification {
  _id: string;
  user_id: string;
  type: 'announcement' | 'bill' | 'payment' | 'system';
  title: string;
  message: string;
  link: string;
  is_read: string;
  created_at: string;
  related_id?: string;
}

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await table.getItems('f26wla7m4wld', { limit: 100, order: 'desc' });
      const allNotifications = (response.items || []) as Notification[];
      // Filter notifications for current user
      const userNotifications = allNotifications
        .filter(n => n.user_id === user?.uid)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const notification = notifications.find(n => n._id === id);
      if (!notification) return;

      const { _id: _, ...payload } = notification;
      await table.updateItem('f26wla7m4wld', {
        _uid: notification.user_id,
        _id: id,
        ...payload,
        is_read: 'true',
      });

      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, is_read: 'true' } : n
      ));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive',
      });
      console.error('Mark as read error:', error);
    }
  };
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => n.is_read === 'false');
      await Promise.all(
        unreadNotifications.map(notification => {
          const { _id: _, ...payload } = notification;
          return table.updateItem('f26wla7m4wld', {
            _uid: notification.user_id,
            _id: notification._id,
            ...payload,
            is_read: 'true',
          });
        })
      );

      setNotifications(notifications.map(n => ({ ...n, is_read: 'true' })));
      toast({ title: 'Success', description: 'All notifications marked as read' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark all as read',
        variant: 'destructive',
      });
      console.error('Mark all as read error:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const notification = notifications.find(n => n._id === id);
      if (!notification) return;
      await table.deleteItem('f26wla7m4wld', {
        _uid: notification.user_id,
        _id: id,
      });
      setNotifications(notifications.filter(n => n._id !== id));
      toast({ title: 'Success', description: 'Notification deleted' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive',
      });
      console.error('Delete notification error:', error);
    }
  };

  const deleteAllRead = async () => {
    try {
      const readNotifications = notifications.filter(n => n.is_read === 'true');
      await Promise.all(readNotifications.map(n => 
        table.deleteItem('f26wla7m4wld', {
          _uid: n.user_id,
          _id: n._id,
        })
      ));
      setNotifications(notifications.filter(n => n.is_read === 'false'));
      toast({ title: 'Success', description: 'All read notifications deleted' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete notifications',
        variant: 'destructive',
      });
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (notification.is_read === 'false') {
      await markAsRead(notification._id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement':
        return <Megaphone className="h-5 w-5" />;
      case 'bill':
        return <DollarSign className="h-5 w-5" />;
      case 'payment':
        return <CheckCheck className="h-5 w-5" />;
      case 'system':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'announcement':
        return 'text-blue-500';
      case 'bill':
        return 'text-orange-500';
      case 'payment':
        return 'text-green-500';
      case 'system':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => n.is_read === 'false')
    : notifications;

  const unreadCount = notifications.filter(n => n.is_read === 'false').length;

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
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with important announcements and updates
          </p>
        </div>
        {unreadCount > 0 && (
          <Badge variant="default" className="text-lg px-3 py-1">
            {unreadCount} Unread
          </Badge>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All ({notifications.length})
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </Button>
        </div>

        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark All Read
            </Button>
          )}
          {notifications.some(n => n.is_read === 'true') && (
            <Button variant="outline" onClick={deleteAllRead}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Read
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </h3>
              <p className="text-muted-foreground text-center">
                {filter === 'unread' 
                  ? "You're all caught up! Check back later for new updates."
                  : "You'll see announcements, bills, and important updates here."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification._id}
              className={`transition-all cursor-pointer hover:shadow-md ${
                notification.is_read === 'false' ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800' : ''
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`mt-1 ${getTypeColor(notification.type)}`}>
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-base">
                          {notification.title}
                        </CardTitle>
                        {notification.is_read === 'false' && (
                          <Badge variant="default" className="text-xs">New</Badge>
                        )}
                      </div>
                      <CardDescription className="text-xs">
                        {new Date(notification.created_at).toLocaleString()}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {notification.link && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNotificationClick(notification);
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification._id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">{notification.message}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
