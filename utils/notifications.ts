import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// إعداد الإشعارات: طلب الإذن + قناة أندرويد
export const setupNotifications = async (): Promise<void> => {
  const { status, canAskAgain } = await Notifications.getPermissionsAsync();

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
      sound: 'default', // Ensure sound is a string
    });
  }
};



// جدولة إشعار بتاريخ ووقت معين
export const scheduleNotification = async (
    title: string,
    body: string,
    selectedDate: Date, // Date chosen via DateTimePicker
    selectedTime: Date
): Promise<void> => {

    const combinedDateTime = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        selectedTime.getHours(),
        selectedTime.getMinutes()
      );

    const trigger: Notifications.CalendarTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR, // Correct type
        year: combinedDateTime.getFullYear(),
        month: combinedDateTime.getMonth() + 1,
        day: combinedDateTime.getDate(),
        hour: combinedDateTime.getHours(),
        minute: combinedDateTime.getMinutes(),
        repeats: false,
      };

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
      },
      trigger,
    });
  } catch (error) {
    console.error('Failed to schedule notification:', error);
  }
};
