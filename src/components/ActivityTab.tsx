// components/ActivityTab.tsx

import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Alert 
} from "react-native";
import { Activity, Calendar, CheckCircle } from "lucide-react-native";

// --- Assuming ActivityLog type is imported or defined ---
interface ActivityLog {
    id: string;
    time: Date;
    durationMinutes: number;
    type: string;
    notes: string;
}
// ---------------------------------------------------

const ACTIVITY_TYPES = ["Tummy Time", "Playtime", "Massage", "Walk"];

interface ActivityTabProps {
  activityHistory: ActivityLog[];
  logActivity: (log: ActivityLog) => void;
  formatDuration: (minutes: number) => string;
}

export default function ActivityTab({ activityHistory, logActivity, formatDuration }: ActivityTabProps) {
  // Use a string state to capture user input for time
  const [timeStr, setTimeStr] = useState(new Date().toLocaleString());
  const [type, setType] = useState(ACTIVITY_TYPES[1]);
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const handleLogActivity = () => {
    // Attempt to parse the time string into a Date object
    const parsedTime = new Date(timeStr);
    const durationMinutes = parseInt(duration, 10);
    
    // Validation check 1: Time parsing
    if (isNaN(parsedTime.getTime())) {
        Alert.alert("Error", "Invalid Time format. Please use a recognizable format (e.g., 'DD-MM-YYYY HH:MM:SS').");
        return;
    }

    // Validation check 2: Required fields
    if (!type || isNaN(durationMinutes) || durationMinutes <= 0) {
      Alert.alert("Error", "Please ensure Type and a valid Duration are entered.");
      return;
    }

    const newLog: ActivityLog = {
      id: Date.now().toString(),
      time: parsedTime, // Log entry gets the Date object
      durationMinutes,
      type,
      notes,
    };
    logActivity(newLog); // Calls the parent function to store data

    // Reset form
    setTimeStr(new Date().toLocaleString());
    setDuration("");
    setNotes("");
  };

  return (
    <View style={styles.container}>
      {/* Log Activity Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Activity size={20} color="#06B6D4" />
          <Text style={styles.cardTitle}>Log Activity</Text>
        </View>
        <Text style={styles.cardSubtitle}>Track daily activities</Text>

        {/* Time Input (Text) */}
        <Text style={styles.label}>Time (YYYY-MM-DD HH:MM)</Text>
        <View 
          style={styles.timeInputContainer}
        >
          <Calendar size={18} color="#9CA3AF" />
          <TextInput
                style={styles.timeInputText}
                value={timeStr}
                onChangeText={setTimeStr}
                placeholder="Enter activity date and time"
                placeholderTextColor="#9CA3AF"
            />
        </View>

        <View style={styles.row}>
          {/* Type Dropdown */}
          <View style={styles.typeDropdownWrapper}>
            <Text style={styles.label}>Type</Text>
            <TouchableOpacity 
              style={styles.dropdownButton}
              onPress={() => setShowTypeDropdown(!showTypeDropdown)}
            >
              <Text style={styles.dropdownText}>{type}</Text>
            </TouchableOpacity>
            {showTypeDropdown && (
              <View style={styles.dropdownMenu}>
                {ACTIVITY_TYPES.map(item => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.dropdownItem,
                      type === item && styles.dropdownItemActive
                    ]}
                    onPress={() => { setType(item); setShowTypeDropdown(false); }}
                  >
                    <Text style={styles.dropdownText}>{item}</Text>
                    {type === item && <CheckCircle size={16} color="#06B6D4" />}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Duration */}
          <View style={styles.durationInputWrapper}>
            <Text style={styles.label}>Duration (minutes)</Text>
            <TextInput
              placeholder="e.g., 15"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={duration}
              onChangeText={setDuration}
              style={styles.input}
            />
          </View>
        </View>

        {/* Notes */}
        <Text style={styles.label}>Notes</Text>
        <TextInput
          placeholder="Any notes about this activity..."
          placeholderTextColor="#9CA3AF"
          value={notes}
          onChangeText={setNotes}
          multiline
          style={[styles.input, styles.notesInput]}
        />

        <TouchableOpacity
          onPress={handleLogActivity}
          style={styles.logButton}
        >
          <Text style={styles.logButtonText}>Log Activity</Text>
        </TouchableOpacity>
      </View>

      {/* Activity History */}
      <View style={[styles.card]}>
        <Text style={styles.historyTitle}>Activity History</Text>
        <ScrollView style={styles.historyScroll}>
          {activityHistory.map((log) => (
            <View key={log.id} style={styles.historyItem}>
              <Text style={styles.historyItemType}>
                {log.type}
              </Text>
              <Text style={styles.historyItemTime}>
                {log.time.toLocaleDateString()} {log.time.toLocaleTimeString()}
              </Text>
              <Text style={styles.historyItemDuration}>
                Duration: {formatDuration(log.durationMinutes)}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

// --- StyleSheet Definitions (Renamed to 'styles' to match usage) ---
const styles = StyleSheet.create({
  // Equivalent to: px-4
  container: {
    paddingHorizontal: 16,
  },

  // Equivalent to: bg-white rounded-xl shadow-md p-5 mb-6
  card: {
    backgroundColor: 'white',
    borderRadius: 12, // rounded-xl
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 20, // p-5
    marginBottom: 24, // mb-6
  },
  
  // Equivalent to: flex-row items-center mb-4
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16, // mb-4
  },
  
  // Equivalent to: text-gray-900 text-lg font-bold ml-2
  cardTitle: {
    color: '#111827', // gray-900
    fontSize: 18, // text-lg
    fontWeight: '700', // font-bold
    marginLeft: 8, // ml-2
  },

  // Equivalent to: text-sm text-gray-500 mb-4
  cardSubtitle: {
    fontSize: 14, // text-sm
    color: '#6b7280', // gray-500
    marginBottom: 16, // mb-4
  },

  // Equivalent to: text-gray-700 font-medium mb-1
  label: {
    color: '#374151', // gray-700
    fontWeight: '500', // font-medium
    marginBottom: 4, // mb-1
  },

  // Time Input Container: flex-row items-center border border-gray-300 rounded-lg p-3 mb-4 bg-gray-50
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db', // gray-300
    borderRadius: 8, // rounded-lg
    padding: 12, // p-3
    marginBottom: 16, // mb-4
    backgroundColor: '#f9fafb', // gray-50
  },
  
  // Equivalent to: ml-2 flex-1 text-gray-800
  timeInputText: {
    marginLeft: 8, // ml-2
    flex: 1, // flex-1
    color: '#1f2937', // gray-800
    paddingVertical: 0, // Added to normalize height for TextInput
  },

  // Equivalent to: flex-row justify-between mb-4
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16, // mb-4
  },

  // Type Dropdown Wrapper: w-[60%] relative z-10
  typeDropdownWrapper: {
    width: '60%',
    zIndex: 10,
  },
  
  // Duration Input Wrapper: w-[35%]
  durationInputWrapper: {
    width: '35%',
  },

  // Dropdown Button: border border-gray-300 rounded-lg p-3 bg-white flex-row justify-between items-center
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#d1d5db', // gray-300
    borderRadius: 8, // rounded-lg
    padding: 12, // p-3
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Dropdown Menu: absolute top-full w-full bg-white border border-gray-300 rounded-lg mt-1 shadow-lg
  dropdownMenu: {
    position: 'absolute',
    top: 50, // Approximation for top-full
    width: '100%',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db', // gray-300
    borderRadius: 8, // rounded-lg
    marginTop: 4, // mt-1
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },

  // Dropdown Item: p-3 flex-row items-center justify-between
  dropdownItem: {
    padding: 12, // p-3
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Dropdown Item Active: bg-indigo-50
  dropdownItemActive: {
    backgroundColor: '#eef2ff', // indigo-50
  },

  // Dropdown/Input Text: text-gray-800
  dropdownText: {
    color: '#1f2937', // gray-800
  },

  // Input common: border border-gray-300 rounded-lg p-3 bg-gray-50 text-gray-800
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db', // gray-300
    borderRadius: 8, // rounded-lg
    padding: 12, // p-3
    backgroundColor: '#f9fafb', // gray-50
    color: '#1f2937', // gray-800
  },
  
  // Notes Input: h-20 mb-4
  notesInput: {
    height: 80, // h-20
    marginBottom: 16, // mb-4
  },

  // Log Button: bg-teal-500 rounded-lg py-3 items-center
  logButton: {
    backgroundColor: '#14b8a6', // teal-500
    borderRadius: 8, // rounded-lg
    paddingVertical: 12, // py-3
    alignItems: 'center',
  },

  // Log Button Text: text-white text-base font-bold
  logButtonText: {
    color: 'white',
    fontSize: 16, // text-base
    fontWeight: '700', // font-bold
  },
  
  // History Title: text-gray-900 text-xl font-bold mb-4
  historyTitle: {
    color: '#111827', // gray-900
    fontSize: 20, // text-xl
    fontWeight: '700', // font-bold
    marginBottom: 16, // mb-4
  },

  // History Scroll: maxHeight: 300
  historyScroll: {
    maxHeight: 300,
  },

  // History Item: border-b border-gray-100 py-3
  historyItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6', // gray-100
    paddingVertical: 12, // py-3
  },

  // History Item Type: text-gray-900 font-bold
  historyItemType: {
    color: '#111827', // gray-900
    fontWeight: '700', // font-bold
  },
  
  // History Item Time/Duration: text-gray-600 text-sm
  historyItemTime: {
    color: '#4b5563', // gray-600
    fontSize: 14, // text-sm
  },
  historyItemDuration: {
    color: '#4b5563', // gray-600
    fontSize: 14, // text-sm
  },
});