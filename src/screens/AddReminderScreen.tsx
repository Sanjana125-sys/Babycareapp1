import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  Platform, 
  StyleSheet, 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications'; 
import { ChevronLeft, Clock, Calendar, Repeat, ClipboardList, Milk, Pill, Shield, Users, Utensils, Moon, Activity, Baby } from 'lucide-react-native';

// Set up default handler for notifications (required by Expo)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true, // Controls banner/alert display on iOS/Android
    shouldShowList: true,
  }),
});

// Utility to get the correct icon component based on type ID
const getTypeIcon = (id: string, color: string) => {
  switch (id) {
    case 'feeding': return <Milk color={color} size={20} />;
    case 'medicine': return <Pill color={color} size={20} />;
    case 'vaccination': return <Shield color={color} size={20} />;
    case 'tummy_time': return <Users color={color} size={20} />;
    case 'bath': return <Utensils color={color} size={20} />;
    case 'sleep': return <Moon color={color} size={20} />;
    case 'appointment': return <Activity color={color} size={20} />;
    case 'activity': return <Baby color={color} size={20} />;
    default: return <ClipboardList color={color} size={20} />;
  }
};

// Reminder types data with added smart defaults
const reminderTypes = [
  { id: 'feeding', name: 'Feeding', description: 'Breastfeeding, bottle feeding, solids', defaultTitle: 'Time to Feed Baby', defaultRepeat: 'Daily' },
  { id: 'medicine', name: 'Medicine', description: 'Medication schedules and dosages', defaultTitle: 'Give Medication Dose', defaultRepeat: 'Daily' },
  { id: 'vaccination', name: 'Vaccination', description: 'Immunization appointments', defaultTitle: 'Vaccination Appointment', defaultRepeat: 'None' },
  { id: 'tummy_time', name: 'Tummy Time', description: 'Tummy time sessions', defaultTitle: 'Start Tummy Time', defaultRepeat: 'Daily' },
  { id: 'bath', name: 'Bath Time', description: 'Bathing routine', defaultTitle: 'Evening Bath Time', defaultRepeat: 'Weekly' },
  { id: 'sleep', name: 'Nap/Sleep', description: 'Sleep schedules and bedtime', defaultTitle: 'Bedtime Routine', defaultRepeat: 'Daily' },
  { id: 'appointment', name: 'Appointment', description: 'Doctor visits and checkups', defaultTitle: 'Doctor Checkup', defaultRepeat: 'None' },
  { id: 'activity', name: 'Activity', description: 'Playtime, outings, events', defaultTitle: 'Playtime Fun', defaultRepeat: 'None' },
];

const repeatOptions = [
  'None',
  'Daily',
  'Weekly',
  'Monthly',
  'Yearly',
  'Custom'
];
const REMINDERS_STORAGE_KEY = '@BabyCareReminders';

// --- Reminder Log Storage (Mock) ---
let reminderLog: any[] = [];
console.log("Current Reminder Log (Mock):", reminderLog);

// --- Storage Helpers ---
// Gets all reminders from storage
const getStoredReminders = async (): Promise<any[]> => {
    try {
        const jsonValue = await AsyncStorage.getItem(REMINDERS_STORAGE_KEY);
        // Parse the JSON string into an array, or return an empty array if null
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.error("Error reading reminders from storage:", e);
        return [];
    }
};

// Saves the entire array of reminders to storage
const saveRemindersToStorage = async (reminders: any[]) => {
    try {
        const jsonValue = JSON.stringify(reminders);
        await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, jsonValue);
    } catch (e) {
        console.error("Error saving reminders to storage:", e);
    }
};


export default function AddReminderScreen() {
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [notes, setNotes] = useState('');
  const [repeatOption, setRepeatOption] = useState('None');
  const [customRepeat, setCustomRepeat] = useState('');

  // Find the selected type object dynamically
  const selectedTypeDetails = useMemo(() => {
    return reminderTypes.find(type => type.id === selectedType);
  }, [selectedType]);

  // --- Notification Permission Request ---
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Notification permissions are needed to schedule reminders.');
      }
    })();
  }, []);

  // Set Defaults on Type Change
  useEffect(() => {
    if (selectedTypeDetails) {
      if (!title.trim() || title === reminderTypes.find(t => t.id !== selectedType)?.defaultTitle) {
        setTitle(selectedTypeDetails.defaultTitle);
      }
      setRepeatOption(selectedTypeDetails.defaultRepeat);
      setCustomRepeat('');
      
      if (selectedType === 'medicine') {
        setNotes('Remember to check the dosage amount before administering.');
      } else if (selectedType === 'vaccination') {
        setNotes('Bring the immunization card and ensure the baby is well-rested.');
      }
    }
  }, [selectedType]);

// --- Helper: Schedule Notification ---
  // --- Helper: Schedule Notification ---
const schedulePushNotification = async (reminderTitle: string, reminderNotes: string) => {
    // Combine Date and Time into a single JavaScript Date object
    const finalDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        time.getHours(),
        time.getMinutes(),
        0
    );

    const now = new Date();
    let secondsUntilTrigger = (finalDate.getTime() - now.getTime()) / 1000;
    
    // Safety check for past time
    if (secondsUntilTrigger < 0) {
        // Use a small delay for immediate triggers if time is in the past
        secondsUntilTrigger = 1; 
        console.warn('Scheduled time is in the past. Scheduling now (1 sec delay).');
    }

    // 1. Initialize scheduleTrigger to null.
    let scheduleTrigger: Notifications.NotificationTriggerInput | null = null;
    
    // 2. Set the base trigger for the scheduled time (Time Interval).
    if (repeatOption === 'None' || repeatOption === 'Custom') {
        scheduleTrigger = {
            // Use the string literal and assert the type as correct (TS workaround)
            type: 'timeInterval' as any,
            seconds: secondsUntilTrigger, 
            repeats: false,
        } as Notifications.TimeIntervalTriggerInput;
    } 
    // 3. Set the repeating Calendar Trigger for Daily/Weekly/Monthly/Yearly
    else if (secondsUntilTrigger > 0) {
        
        // Calendar trigger base setup
        const calendarTriggerBase: Notifications.CalendarTriggerInput = {
            // Use the string literal and assert the type as correct (TS workaround)
            type: 'calendar' as any, 
            hour: time.getHours(),
            minute: time.getMinutes(),
            repeats: true,
        };
        

        switch (repeatOption) {
            case 'Daily':
                scheduleTrigger = calendarTriggerBase;
                break;
            case 'Weekly':
                scheduleTrigger = { 
                    ...calendarTriggerBase,
                    weekday: finalDate.getDay() + 1, // 1=Sun, 7=Sat
                } as Notifications.CalendarTriggerInput; 
                break;
            case 'Monthly':
                scheduleTrigger = { 
                    ...calendarTriggerBase,
                    day: finalDate.getDate(), 
                } as Notifications.CalendarTriggerInput; 
                break;
            case 'Yearly':
                scheduleTrigger = { 
                    ...calendarTriggerBase,
                    month: finalDate.getMonth() + 1, // 1=Jan, 12=Dec
                    day: finalDate.getDate(), 
                } as Notifications.CalendarTriggerInput; 
                break;
            default:
                scheduleTrigger = null; 
                break;
        }
    }
    
    // 4. Final Type Guard: Ensure the variable holds an object before use.
    if (!scheduleTrigger) {
        // Fallback to immediate one-time trigger if logic failed
        scheduleTrigger = { 
            type: 'timeInterval' as any, // Use string literal
            seconds: 1, 
            repeats: false 
        } as Notifications.TimeIntervalTriggerInput; 
        console.error("Warning: scheduleTrigger could not be set. Defaulting to immediate trigger.");
    }

    try {
        const triggerDetails = await Notifications.scheduleNotificationAsync({
            content: {
                title: `🚨 REMINDER: ${reminderTitle}`,
                body: reminderNotes || `Time for ${reminderTitle}! Don't forget.`,
                // Data is stored for logging/future actions
                data: { type: selectedTypeDetails?.id, notes: reminderNotes },
                sound: 'default',
            },
            trigger: scheduleTrigger, 
        });
        
        // Expo returns the notification ID, which is triggerDetails (a string)
        return triggerDetails; 
    } catch (error) {
        console.error("Error scheduling notification:", error);
        return null;
    }
};


// --- Main Save Handler ---
const handleSaveReminder = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a title for your reminder');
      return;
    }

    if (!selectedType) {
      Alert.alert('Validation Error', 'Please select a reminder type');
      return;
    }

    // 1. Schedule the Notification and retrieve the ID
    const notificationId = await schedulePushNotification(title, notes);

    if (!notificationId) {
        Alert.alert('Scheduling Failed', 'Could not schedule the notification. Check permissions or logs.');
        return;
    }
    
    // 2. Create New Reminder Object
    const newReminder = {
        id: Date.now().toString(),
        title: title.trim(),
        type: selectedType,
        dateTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes()),
        notes: notes,
        repeat: repeatOption === 'Custom' ? customRepeat : repeatOption,
        notificationId: notificationId, // Store the notification ID
    };

    // 3. Get existing reminders, append the new one, and save
    const existingReminders = await getStoredReminders();
    const updatedReminders = [...existingReminders, newReminder];
    await saveRemindersToStorage(updatedReminders); // **Persistently saves the updated list**

    console.log("Reminder Saved to AsyncStorage:", newReminder);

    Alert.alert(
      'Reminder Saved & Scheduled! 🔔',
      `'${title}' has been successfully scheduled as a notification with repeat: ${repeatOption}.`,
      [ { text: 'OK', onPress: () => router.back() } ]
    );
};

  // Handlers for Date/Time Pickers
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      

      <ScrollView style={styles.scrollViewContent} contentContainerStyle={styles.scrollViewPadding}>
        
        {/* Title Input */}
        <View style={styles.sectionMargin}>
          <Text style={styles.label}>Title</Text>
          <View style={styles.inputContainerWithIcon}>
            {selectedTypeDetails ? getTypeIcon(selectedTypeDetails.id, '#4A90E2') : <ClipboardList color="#4A90E2" size={20} />}
            <TextInput
              style={styles.textInput}
              placeholder="What do you want to remember?"
              value={title}
              onChangeText={setTitle}
            />
          </View>
        </View>

        {/* Reminder Types */}
        <View style={styles.sectionMargin}>
          <Text style={styles.label}>Reminder Type</Text>
          <View style={styles.typeGrid}>
            {reminderTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeButtonBase,
                  selectedType === type.id ? styles.typeButtonSelected : styles.typeButtonUnselected,
                  { width: '48.5%' } 
                ]}
                onPress={() => setSelectedType(type.id)}
              >
                <View style={styles.typeIconContainer}>
                    {getTypeIcon(type.id, selectedType === type.id ? '#2563EB' : '#4A90E2')}
                </View>
                <Text style={styles.typeButtonName}>{type.name}</Text>
                <Text style={styles.typeButtonDescription}>{type.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Date and Time */}
        <View style={styles.sectionMargin}>
          <Text style={styles.label}>Date & Time</Text>
          <View style={styles.dateTimeRow}>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar color="#4A90E2" size={20} style={styles.iconMarginRight} />
              <Text style={styles.dateTimeText}>
                {date.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Clock color="#4A90E2" size={20} style={styles.iconMarginRight} />
              <Text style={styles.dateTimeText}>
                {time.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="spinner"
              onChange={onDateChange}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display="spinner"
              onChange={onTimeChange}
            />
          )}
        </View>

        {/* Repeat Options */}
        <View style={styles.sectionMargin}>
          <Text style={styles.label}>Repeat</Text>
          <View style={styles.repeatContainer}>
            <View style={styles.repeatHeader}>
              <View style={styles.repeatHeaderLeft}>
                <Repeat color="#4A90E2" size={20} style={styles.iconMarginRight} />
                <Text style={styles.repeatHeaderText}>Repeat Schedule:</Text>
              </View>
              <Text style={styles.repeatValue}>
                {repeatOption === 'Custom' ? customRepeat : repeatOption}
              </Text>
            </View>

            <View style={styles.repeatOptionsRow}>
              {repeatOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.repeatOptionBase,
                    repeatOption === option ? styles.repeatOptionSelected : styles.repeatOptionUnselected
                  ]}
                  onPress={() => setRepeatOption(option)}
                >
                  <Text
                    style={[
                      styles.repeatOptionTextBase,
                      repeatOption === option ? styles.repeatOptionTextSelected : styles.repeatOptionTextUnselected
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {repeatOption === 'Custom' && (
              <TextInput
                style={styles.customRepeatInput}
                placeholder="Enter custom repeat pattern (e.g., every 2 days)"
                value={customRepeat}
                onChangeText={setCustomRepeat}
              />
            )}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.notesSection}>
          <Text style={styles.label}>Notes</Text>
          <View style={styles.notesInputContainer}>
            <ClipboardList color="#4A90E2" size={20} style={styles.notesIcon} />
            <TextInput
              style={styles.notesInput}
              placeholder="Add any additional details..."
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              value={notes}
              onChangeText={setNotes}
            />
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.saveButtonWrapper}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveReminder}
        >
          <Text style={styles.saveButtonText}>Save Smart Reminder</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ----------------------------------------------------
// ## 🎨 StyleSheet Definition
// ----------------------------------------------------

const styles = StyleSheet.create({
  // Global Layout
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // gray-50
  },
  scrollViewContent: {
    flex: 1,
  },
  scrollViewPadding: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  sectionMargin: {
    marginBottom: 24,
  },
  label: {
    color: '#4B5563', // gray-700
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },

  // Header
  header: {
    backgroundColor: '#3B82F6', // blue-500
    paddingTop: 48, // pt-12
    paddingBottom: 16, // pb-4
    paddingHorizontal: 16, // px-4
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12, // mr-3
    padding: 8, // p-2
    borderRadius: 9999, // rounded-full
    backgroundColor: '#60A5FA', // blue-400
  },
  headerTitle: {
    color: 'white',
    fontSize: 20, // text-xl
    fontWeight: '700', // font-bold
  },
  
  // Title Input
  inputContainerWithIcon: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB', // gray-300
    borderRadius: 12, // rounded-xl
    padding: 16, // p-4
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 16, // text-base
    marginLeft: 8, // ml-2
    color: '#1F2937', // gray-900
  },

  // Reminder Types
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12, // gap-3
    justifyContent: 'space-between',
  },
  typeButtonBase: {
    borderRadius: 12, // rounded-xl
    padding: 16, // p-4
    borderWidth: 1,
    minHeight: 90,
  },
  typeButtonSelected: {
    backgroundColor: '#DBEAFE', // blue-100
    borderColor: '#3B82F6', // blue-500
  },
  typeButtonUnselected: {
    backgroundColor: 'white',
    borderColor: '#E5E7EB', // gray-200
  },
  typeIconContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    opacity: 0.8,
  },
  typeButtonName: {
    fontWeight: '600', // font-semibold
    color: '#1F2937', // gray-800
    marginTop: 8,
  },
  typeButtonDescription: {
    fontSize: 12, // text-xs
    color: '#4B5563', // gray-600
    marginTop: 4,
  },
  
  // Date and Time
  dateTimeRow: {
    flexDirection: 'row',
    gap: 16, // gap-4
    marginBottom: 16, // mb-4
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB', // gray-300
    borderRadius: 12, // rounded-xl
    padding: 16, // p-4
  },
  dateTimeText: {
    color: '#1F2937', // gray-800
  },
  iconMarginRight: {
    marginRight: 8, // mr-2
  },

  // Repeat Options
  repeatContainer: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB', // gray-300
    borderRadius: 12, // rounded-xl
    padding: 16, // p-4
  },
  repeatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12, // mb-3
  },
  repeatHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  repeatHeaderText: {
    color: '#1F2937', // gray-800
    fontWeight: '500', // font-medium
  },
  repeatValue: {
    color: '#3B82F6', // blue-500
    fontWeight: '600', // font-semibold
  },
  repeatOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8, // gap-2
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6', // gray-100
  },
  repeatOptionBase: {
    paddingHorizontal: 12, // px-3
    paddingVertical: 8, // py-2
    borderRadius: 9999, // rounded-full
  },
  repeatOptionSelected: {
    backgroundColor: '#3B82F6', // blue-500
  },
  repeatOptionUnselected: {
    backgroundColor: '#E5E7EB', // gray-200
  },
  repeatOptionTextBase: {
    fontSize: 14, // text-sm
  },
  repeatOptionTextSelected: {
    color: 'white',
  },
  repeatOptionTextUnselected: {
    color: '#4B5563', // gray-700
  },
  customRepeatInput: {
    marginTop: 12, // mt-3
    borderWidth: 1,
    borderColor: '#D1D5DB', // gray-300
    borderRadius: 8, // rounded-lg
    padding: 12, // p-3
  },

  // Notes
  notesSection: {
    marginBottom: 32, // mb-8
  },
  notesInputContainer: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB', // gray-300
    borderRadius: 12, // rounded-xl
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  notesIcon: {
    marginTop: 4, // mt-1
    marginRight: 8, // mr-2
  },
  notesInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937', // dark text
    minHeight: 80, // for multiline
  },

  // Save Button
  saveButtonWrapper: {
    paddingHorizontal: 16, // px-4
    paddingBottom: 24, // pb-6
  },
  saveButton: {
    backgroundColor: '#3B82F6', // blue-500
    borderRadius: 12, // rounded-xl
    paddingVertical: 16, // py-4
    alignItems: 'center',
    // shadow-lg shadow-blue-500/50 approximation for Android (elevation)
    elevation: 5, 
    // iOS shadow properties for shadow-lg effect
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18, // text-lg
    fontWeight: '700', // font-bold
  },
});