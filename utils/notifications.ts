import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native'; 
import AsyncStorage from '@react-native-async-storage/async-storage';


// Request notification permissions and set Android notification channel
export const setupNotifications = async (): Promise<void> => {
  const { status, canAskAgain } = await Notifications.getPermissionsAsync();
  console.log('Notification Permission Status:', status);

  if (status !== 'granted') {
    if (canAskAgain) {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      if (newStatus !== 'granted') {
        console.warn('Notifications permission denied');
        return;
      }
    } else {
      console.warn('Cannot request permissions again. Notifications not enabled.');
      return;
    }
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default Channel',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });
    console.log('Notification channel set up successfully.');
    
  }
};

// // Schedule a notification with a specific date and time
// export const scheduleNotification = async (
//   title: string,
//   body: string,
//   selectedDate: Date, // The date chosen by the user
//   selectedTime: Date  // The time chosen by the user
// ): Promise<void> => {
//   // Combine the date and time into a single Date object
// //   const selectedDate = new Date(2025, 3, 11); // Example: April 11, 2025
// // const selectedTime = new Date(2025, 3, 11, 14, 30); // Example: 2:30 PM on April 11, 2025

//   // Check for invalid selectedDate
//   if (!(selectedDate instanceof Date) || isNaN(selectedDate.getTime())) {
//     console.error('Invalid selectedDate:', selectedDate);
//     return;
//   }

//   // Check for invalid selectedTime, and set default if missing
//   if (!(selectedTime instanceof Date) || isNaN(selectedTime.getTime())) {
//     console.warn('Invalid selectedTime, setting default time.');
//     selectedTime = new Date();
//     selectedTime.setHours(0, 0, 0, 0); // Default to midnight
//   }

//   // Combine date and time
//   const combinedDateTime = new Date(
//     selectedDate.getFullYear(),
//     selectedDate.getMonth(),
//     selectedDate.getDate(),
//     selectedTime.getHours(),
//     selectedTime.getMinutes()
//   );

//   console.log('Combined Date-Time:', combinedDateTime);

//   const currentTime = new Date();
//   if (combinedDateTime <= currentTime) {
//     console.error('The selected time is in the past. Please pick a future time.');
//     return;
//   }

//   console.log('Combined Date Time:', combinedDateTime.toString());
//   console.log('Current Time:', currentTime.toString());


//   if (!(selectedDate instanceof Date) || !(selectedTime instanceof Date)) {
//     console.error('Invalid input: selectedDate or selectedTime is not a Date object.');
//     return;
//   }


//   try {
// // Clear duplicate notifications only if needed
// // const existingNotifications = await Notifications.getAllScheduledNotificationsAsync();
// // const duplicateNotifications = existingNotifications.filter(notification => {
// //   // Add logic to identify duplicates based on your criteria (e.g., title, date)
// //   return notification.content.title === title; // Example: match titles
// // });

// // for (const notification of duplicateNotifications) {
// //   await Notifications.cancelScheduledNotificationAsync(notification.identifier);
// // }

// const scheduledNotifications2 = await Notifications.getAllScheduledNotificationsAsync();
// console.log('Scheduled Notifications:', scheduledNotifications2);

//     console.log('Attempting to schedule notification...');
//     await Notifications.scheduleNotificationAsync({
//       content: {
//         title,
//         body,
//       },
//       trigger: {
//         type: Notifications.SchedulableTriggerInputTypes.DATE,
//         // date: combinedDateTime,
//         date: new Date(Date.now() + 5000), 
//       },
//     });
//     console.log('Notification scheduled successfully for:', combinedDateTime);

//     const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
//     console.log('Scheduled Notifications:', JSON.stringify(scheduledNotifications, null, 2));
    


//   } catch (error) {
//     console.error('Failed to schedule notification:', error);
//   }
// };


export const scheduleNotification = async (
  taskId: string,
  title: string,
  body: string,
  selectedDate: Date, // The date chosen by the user
  selectedTime: Date  // The time chosen by the user
): Promise<void> => {
  // Combine the date and time into a single Date object
  const combinedDateTime = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate(),
    selectedTime.getHours(),
    selectedTime.getMinutes()
  );

  // Calculate the time interval (in seconds) until the notification
  const currentTime = new Date();
  const timeInterval = Math.floor((combinedDateTime.getTime() - currentTime.getTime()) / 1000);

  if (timeInterval <= 0) {
    console.error('The selected time is in the past. Please pick a future time.');
    return;
  }

  try {

   // Clear duplicate notifications only if needed







    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: timeInterval,
        repeats: false,
      },
    }); 
    
    await AsyncStorage.setItem(`notification_${taskId}`, notificationId);
    
    console.log('Notification scheduled successfully for:', combinedDateTime.toString());
  } catch (error) {
    console.error('Failed to schedule notification:', error);
  }
};

export const cleanNotification = async (taskId: string): Promise<void> => {
  try {
    // Retrieve the notification ID for the task
    const notificationId = await AsyncStorage.getItem(`notification_${taskId}`);
    if (notificationId) {
      // Cancel the scheduled notification
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log(`Notification for task ${taskId} cleared successfully!`);

      // Remove the notification ID from storage
      await AsyncStorage.removeItem(`notification_${taskId}`);
    } else {
      console.log(`No notification found for task ${taskId}.`);
    }
  } catch (error) {
    console.error('Failed to clean notification:', error);
  }
};
