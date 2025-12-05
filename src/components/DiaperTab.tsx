// components/DiaperTab.tsx

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
import { Droplet, Calendar, CheckCircle } from "lucide-react-native";
// import { DiaperLog } from "../../src/types"; // Commented out to define type locally

// --- DiaperLog Type Definition (Ensure this matches your src/types.ts) ---
interface DiaperLog {
    id: string;
    time: Date;
    type: "Wet" | "Dirty" | "Both"; // Changed from "Mixed" to "Both" based on DIAPER_TYPES array
    notes: string;
}
// -------------------------------------------------------------------------

const DIAPER_TYPES = ["Wet", "Dirty", "Both"];

interface DiaperTabProps {
  diaperHistory: DiaperLog[];
  logDiaper: (log: DiaperLog) => void;
}

export default function DiaperTab({ diaperHistory, logDiaper }: DiaperTabProps) {
  const [time, setTime] = useState(new Date());
  const [type, setType] = useState<DiaperLog["type"]>("Wet");
  const [notes, setNotes] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const handleLogDiaper = () => {
    if (!time || !type) {
        Alert.alert("Error", "Please select a time and diaper type.");
        return;
    }

    // Create the final log object
    const newLog: DiaperLog = {
      id: Date.now().toString(),
      time,
      type,
      notes,
    };

    // Log the diaper change using the parent function (which saves to AsyncStorage)
    logDiaper(newLog);
    
    // Reset form
    setTime(new Date());
    setNotes("");
  };

  // Helper function for the DateTimePicker change event
  const onTimeChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      setTime(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      {/* Log Diaper Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Droplet size={20} color="#06B6D4" />
          <Text style={styles.cardTitle}>Log Diaper Change</Text>
        </View>
        <Text style={styles.cardSubtitle}>Track diaper changes</Text>

        {/* Time Input */}
        <Text style={styles.label}>Time</Text>
        <TouchableOpacity 
          style={styles.timeInputContainer}
          onPress={() => setShowPicker(true)}
        >
          <Calendar size={18} color="#9CA3AF" />
          <Text style={styles.timeInputText}>
                {/* Formatting the Date object for display */}
                {time.toLocaleString("en-US", { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}
          </Text>
        </TouchableOpacity>

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
              {DIAPER_TYPES.map(item => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.dropdownItem,
                    type === item && styles.dropdownItemActive
                  ]}
                  onPress={() => { setType(item as DiaperLog["type"]); setShowTypeDropdown(false); }}
                >
                  <Text style={styles.dropdownText}>{item}</Text>
                  {type === item && <CheckCircle size={16} color="#06B6D4" />}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Notes */}
        <Text style={styles.label}>Notes</Text>
        <TextInput
          placeholder="Any notes..."
          placeholderTextColor="#9CA3AF"
          value={notes}
          onChangeText={setNotes}
          multiline
          style={[styles.input, styles.notesInput]}
        />

        <TouchableOpacity
          onPress={handleLogDiaper}
          style={styles.logButton}
        >
          <Text style={styles.logButtonText}>Log Diaper Change</Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker */}
      {showPicker && (
        <DateTimePicker
          value={time}
          mode="datetime"
          is24Hour={true}
          onChange={onTimeChange} // Use the clean helper function
        />
      )}

      {/* Diaper History */}
      <View style={styles.card}>
        <Text style={styles.historyTitle}>Diaper History</Text>
        <ScrollView style={styles.historyScroll}>
          {diaperHistory.map((log) => (
            <View key={log.id} style={styles.historyItem}>
              <Text style={styles.historyItemType}>
                {log.type}
              </Text>
              <Text style={styles.historyItemTime}>
                {log.time.toLocaleDateString()} {log.time.toLocaleTimeString()}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

// --- StyleSheet Definitions ---
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

  // Type Dropdown Wrapper: relative z-10 mb-4
  typeDropdownWrapper: {
    zIndex: 10,
    marginBottom: 16, // mb-4
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

  // Input common: border border-gray-300 rounded-lg p-3 h-20 bg-gray-50 mb-4 text-gray-800
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

  // History Item Type/Time: text-gray-900 font-bold / text-gray-600 text-sm
  historyItemType: {
    color: '#111827', // gray-900
    fontWeight: '700', // font-bold
  },
  historyItemTime: {
    color: '#4b5563', // gray-600
    fontSize: 14, // text-sm
  },
});