import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { NotificationService } from '../services/NotificationService';
import { useConvexAuth, useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';

interface NotificationContextType {
  notifications: any[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode; userId?: string }> = ({ 
  children, 
  userId 
}) => {
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  // Convex mutations and queries
  const registerToken = useMutation(api.pushTokens.registerPushToken);
  const userNotifications = useQuery(
    api.notifications.getUserNotifications,
    userId ? { userId } : 'skip'
  );
  const unreadCount = useQuery(
    api.notifications.getUnreadCount,
    userId ? { userId } : 'skip'
  );
  const markNotificationAsRead = useMutation(api.notifications.markAsRead);
  const markAllNotificationsAsRead = useMutation(api.notifications.markAllAsRead);

  useEffect(() => {
    if (userId) {
      registerForPushNotifications();
    }

    // Listener for notifications received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      refreshNotifications();
    });

    // Listener for when user taps on notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      const notificationData = response.notification.request.content.data;
      // Handle notification tap (navigate to relevant screen)
      handleNotificationTap(notificationData);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [userId]);

  useEffect(() => {
    if (userNotifications) {
      setNotifications(userNotifications);
    }
  }, [userNotifications]);

  // Update badge count when unread count changes
  useEffect(() => {
    if (unreadCount !== undefined) {
      NotificationService.setBadgeCount(unreadCount);
    }
  }, [unreadCount]);

  const registerForPushNotifications = async () => {
    try {
      const token = await NotificationService.registerForPushNotifications();
      if (token && userId) {
        setExpoPushToken(token);
        await registerToken({
          userId,
          token,
          platform: Platform.OS as 'ios' | 'android'
        });
      }
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  };

  const handleNotificationTap = (data: any) => {
    // Navigate based on notification type
    if (data.rideId) {
      // Navigate to ride details
    } else if (data.routeId) {
      // Navigate to route details
    }
    // Add more navigation logic as needed
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead({ notificationId });
      refreshNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;
    try {
      await markAllNotificationsAsRead({ userId });
      refreshNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const refreshNotifications = () => {
    // Trigger re-fetch by updating a state or calling refetch if available
    // This depends on your Convex setup
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount: unreadCount || 0,
      markAsRead,
      markAllAsRead,
      refreshNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};