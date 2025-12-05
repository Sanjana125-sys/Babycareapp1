// components/SleepTab.tsx

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
import DateTimePicker from "@react-native-community/datetimepicker";
import { Clock, Calendar, CheckCircle } from "lucide-react-native";
// Removed: import AsyncStorage from '@react-native-async-storage/async-storage'; 
// Rationale: AsyncStorage belongs in the parent screen (SleepTrackerScreen.tsx) for state persistence.

import { SleepLog } from "../../src/types"; // Correct absolute path

const SLEEP_TYPES = ["Nap", "Night Sleep"];
const SLEEP_QUALITIES = ["Excellent", "Good", "Fair", "Poor"];

interface SleepTabProps {
  sleepHistory: SleepLog[];
  logSleep: (log: SleepLog) => void; // This function updates the state AND triggers AsyncStorage save in the parent
  formatDuration: (minutes: number) => string;
}

export default function SleepTab({ sleepHistory, logSleep, formatDuration }: SleepTabProps) {
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [type, setType] = useState<SleepLog["type"]>("Nap");
  const [quality, setQuality] = useState<SleepLog["quality"]>("Good");
  const [notes, setNotes] = useState("");
  const [showPicker, setShowPicker] = useState<"start" | "end" | null>(null);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showQualityDropdown, setShowQualityDropdown] = useState(false);

  const handleLogSleep = () => {
    if (!startTime) return;

    let durationMinutes = 0;
    if (endTime) {
      // Calculate duration in minutes
      durationMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));
    }

    if (durationMinutes < 0) {
      Alert.alert("Error", "End time must be after start time.");
      return;
    }

    const newLog: SleepLog = {
      id: Date.now().toString(),
      startTime,
      endTime, 
      durationMinutes,
      type,
      quality, 
      notes,
    };
    
    // 💡 THE FIX: This correctly calls the parent function, which in turn saves the data.
    logSleep(newLog); 

    // Reset form
    setStartTime(new Date());
    setEndTime(null);
    setNotes("");
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(null);
    if (selectedDate) {
      if (showPicker === "start") {
        setStartTime(selectedDate);
      } else {
        setEndTime(selectedDate);
      }
    }
  };

  // Helper function for date formatting (consistent with is24Hour=true)
  const formatDateTime = (date: Date) => {
    return date.toLocaleString("en-US", { 
      month: '2-digit', 
      day: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false // Force 24-hour format (e.g., 23:00)
    });
  };

  return (
    <View style={styles.container}>
      {/* Log Sleep Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Clock size={20} color="#06B6D4" />
          <Text style={styles.cardTitle}>Log Sleep</Text>
        </View>
        <Text style={styles.cardSubtitle}>Track your baby's sleep patterns</Text>

        {/* Start Time */}
        <Text style={styles.label}>Start Time</Text>
        <TouchableOpacity 
          style={styles.timeInputContainer}
          onPress={() => setShowPicker("start")}
        >
          <Calendar size={18} color="#9CA3AF" />
          <Text style={styles.timeInputText}>
            {formatDateTime(startTime)}
          </Text>
        </TouchableOpacity>

        {/* End Time (Optional) */}
        <Text style={styles.label}>End Time (optional)</Text>
        <TouchableOpacity 
          style={styles.timeInputContainer}
          onPress={() => setShowPicker("end")}
        >
          <Calendar size={18} color="#9CA3AF" />
          <Text style={[styles.timeInputText, !endTime && styles.placeholderText]}>
            {endTime ? formatDateTime(endTime) : "dd-mm-yyyy --:--"}
          </Text>
        </TouchableOpacity>

        <View style={styles.row}>
          {/* Type Dropdown */}
          <View style={styles.dropdownWrapper}>
            <Text style={styles.label}>Type</Text>
            <TouchableOpacity 
              style={styles.dropdownButton}
              onPress={() => { setShowTypeDropdown(!showTypeDropdown); setShowQualityDropdown(false); }}
            >
              <Text style={styles.dropdownText}>{type}</Text>
            </TouchableOpacity>
            {showTypeDropdown && (
              <View style={[styles.dropdownMenu, { zIndex: 20 }]}>
                {SLEEP_TYPES.map(item => (
                  <TouchableOpacity
                    key={item}
                    style={[styles.dropdownItem, type === item && styles.dropdownItemActive]}
                    onPress={() => { setType(item as SleepLog["type"]); setShowTypeDropdown(false); }}
                  >
                    <Text style={styles.dropdownText}>{item}</Text>
                    {type === item && <CheckCircle size={16} color="#06B6D4" />}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Quality Dropdown */}
          <View style={styles.dropdownWrapper}>
            <Text style={styles.label}>Quality</Text>
            <TouchableOpacity 
              style={styles.dropdownButton}
              onPress={() => { setShowQualityDropdown(!showQualityDropdown); setShowTypeDropdown(false); }}
            >
              <Text style={styles.dropdownText}>{quality}</Text>
            </TouchableOpacity>
            {showQualityDropdown && (
              <View style={[styles.dropdownMenu, { right: 0, zIndex: 20 }]}>
                {SLEEP_QUALITIES.map(item => (
                  <TouchableOpacity
                    key={item}
                    style={[styles.dropdownItem, quality === item && styles.dropdownItemActive]}
                    onPress={() => { setQuality(item as SleepLog["quality"]); setShowQualityDropdown(false); }}
                  >
                    <Text style={styles.dropdownText}>{item}</Text>
                    {quality === item && <CheckCircle size={16} color="#06B6D4" />}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Notes */}
        <Text style={styles.label}>Notes</Text>
        <TextInput
          placeholder="Any notes about this sleep..."
          placeholderTextColor="#9CA3AF"
          value={notes}
          onChangeText={setNotes}
          multiline
          style={[styles.input, styles.notesInput]}
        />

        <TouchableOpacity
          onPress={handleLogSleep}
          style={styles.logButton}
        >
          <Text style={styles.logButtonText}>Log Sleep</Text>
        </TouchableOpacity>
      </View>

      {/* Date Pickers */}
      {showPicker && (
        <DateTimePicker
          value={showPicker === "start" ? startTime : (endTime || new Date())}
          mode="datetime"
          is24Hour={true}
          onChange={handleDateChange}
        />
      )}

      {/* Sleep History */}
      <View style={styles.card}>
        <Text style={styles.historyTitle}>Sleep History</Text>
        <ScrollView style={styles.historyScroll}>
          {sleepHistory.map((log) => (
            <View key={log.id} style={styles.historyItem}>
              <Text style={styles.historyItemType}>
                {log.type}
              </Text>
              <Text style={styles.historyItemTime}>
                {log.startTime.toLocaleDateString()} {log.startTime.toLocaleTimeString()} 
                {log.endTime ? ` - ${log.endTime.toLocaleTimeString()}` : ' (Ongoing)'}
              </Text>
              {log.endTime && (
                  <Text style={styles.historyItemDetails}>
                      Duration: {formatDuration(log.durationMinutes)} | Quality: {log.quality}
                  </Text>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

// --- StyleSheet Definitions (No changes needed) ---
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
  },
  
  // Placeholder text color for optional field
  placeholderText: {
    color: '#9CA3AF', // placeholderTextColor="#9CA3AF"
  },

  // Row: flex-row justify-between mb-4
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16, // mb-4
  },

  // Dropdown Wrapper: w-[48%] relative z-10
  dropdownWrapper: {
    width: '48%',
    zIndex: 10,
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
  
  // History Item Time/Details: text-gray-600 text-sm
  historyItemTime: {
    color: '#4b5563', // gray-600
    fontSize: 14, // text-sm
  },
  historyItemDetails: {
    color: '#4b5563', // gray-600
    fontSize: 14, // text-sm
    marginTop: 2,
  }
});