// BabyTrackingScreen.tsx

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  StyleSheet 
} from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { useRouter } from "expo-router"; 
import AsyncStorage from '@react-native-async-storage/async-storage'; // 💡 NEW

import { SleepLog, DiaperLog, ActivityLog, TrackingHistory } from "../../src/types"; 

// Import Tab Components
import SleepTab from "../components/SleepTab";
import DiaperTab from "../components/DiaperTab";
import ActivityTab from "../components/ActivityTab";
import ReportsTab from "../components/ReportsTab";
import OverviewTab from "../components/OverviewTab";

// --- Constants ---
const STORAGE_KEY = '@BabyTracker:history';

// --- Mock Initial Data & Helper Function ---
const initialHistory: TrackingHistory = { 
  sleep: [
    {
      id: "s1",
      startTime: new Date(2025, 11, 2, 15, 6),
      endTime: new Date(2025, 11, 2, 17, 10),
      durationMinutes: 124, 
      type: "Nap",
      quality: "Good",
      notes: "Slept soundly.",
    },
    {
      id: "s2",
      startTime: new Date(2025, 11, 1, 9, 30),
      endTime: new Date(2025, 11, 1, 11, 30),
      durationMinutes: 120, 
      type: "Nap",
      quality: "Excellent",
      notes: "Morning nap.",
    },
  ],
  diaper: [
    {
      id: "d1",
      time: new Date(2025, 11, 2, 15, 6),
      type: "Wet",
      notes: "Just a regular wet diaper.",
    },
    {
      id: "d2",
      time: new Date(2025, 11, 2, 11, 0),
      type: "Dirty",
      notes: "A big one.",
    },
  ],
  activity: [
    {
      id: "a1",
      time: new Date(2025, 11, 2, 15, 6),
      durationMinutes: 15,
      type: "Tummy Time",
      notes: "Managed 15 minutes before fussing.",
    },
    {
      id: "a2",
      time: new Date(2025, 11, 1, 14, 0),
      durationMinutes: 30,
      type: "Reading",
      notes: "Read for half an hour.",
    },
  ],
}; 
const formatDuration = (minutes: number) /*: string*/ => { 
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h > 0 ? h + "h " : ""}${m}m`;
};


export default function BabyTrackingScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Overview"); 
  const [history, setHistory] = useState<TrackingHistory>(initialHistory);

  const TABS = ["Overview", "Sleep", "Diaper", "Activity", "Reports"];

    // ---------------------------------------------
    // 💡 Persistence: Load data from AsyncStorage on component mount
    // ---------------------------------------------
    useEffect(() => {
        const loadHistory = async () => {
            try {
                const storedHistory = await AsyncStorage.getItem(STORAGE_KEY);
                if (storedHistory !== null) {
                    const parsedHistory: TrackingHistory = JSON.parse(storedHistory);

                    // Rehydrate Date objects from strings stored in AsyncStorage
                    parsedHistory.sleep.forEach(log => {
                        log.startTime = new Date(log.startTime);
                        if (log.endTime) log.endTime = new Date(log.endTime);
                    });
                    parsedHistory.diaper.forEach(log => {
                        log.time = new Date(log.time);
                    });
                    parsedHistory.activity.forEach(log => {
                        log.time = new Date(log.time);
                    });
                    
                    setHistory(parsedHistory);
                }
            } catch (error) {
                console.error("Error loading history:", error);
            }
        };
        loadHistory();
    }, []); 

    // ---------------------------------------------
    // 💡 Persistence: Save data to AsyncStorage whenever 'history' state changes
    // ---------------------------------------------
    useEffect(() => {
        const saveHistory = async () => {
            try {
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history));
                console.log("History saved successfully.");
            } catch (error) {
                console.error("Error saving history:", error);
            }
        };
        
        // Check to prevent saving initial placeholder data
        if (history !== initialHistory) {
            saveHistory();
        }
    }, [history]); 


  // --- LOGGING FUNCTIONS ---
    const logSleep = (newLog: SleepLog) => {
        setHistory(prevHistory => {
            const updatedSleep = [newLog, ...prevHistory.sleep]; 
            Alert.alert("Success", `Logged ${newLog.type}: ${formatDuration(newLog.durationMinutes)}`);
            return {
                ...prevHistory,
                sleep: updatedSleep,
            };
        });
    };

  const logDiaper = useCallback((newLog: DiaperLog) => { 
        setHistory(prevHistory => ({
            ...prevHistory,
            diaper: [newLog, ...prevHistory.diaper],
        }));
        Alert.alert("Success", `Logged Diaper: ${newLog.type}`);
    }, []);

  const logActivity = useCallback((newLog: ActivityLog) => { 
        setHistory(prevHistory => ({
            ...prevHistory,
            activity: [newLog, ...prevHistory.activity],
        }));
        Alert.alert("Success", `Logged Activity: ${newLog.type}`);
    }, []);


  // --- RENDERING LOGIC ---
  const renderContent = useMemo(() => {
    switch (activeTab) {
      case "Overview":
        return <OverviewTab history={history} formatDuration={formatDuration} />;
      case "Sleep":
        return <SleepTab sleepHistory={history.sleep} logSleep={logSleep} formatDuration={formatDuration} />;
      case "Diaper":
        return <DiaperTab diaperHistory={history.diaper} logDiaper={logDiaper} />;
      case "Activity":
        return <ActivityTab activityHistory={history.activity} logActivity={logActivity} formatDuration={formatDuration} />;
      case "Reports":
        // Passing the full history object to the ReportsTab
        return <ReportsTab history={history} formatDuration={formatDuration} />;
      default:
        return <OverviewTab history={history} formatDuration={formatDuration} />;
        
    }
  }, [activeTab, history, logSleep, logDiaper, logActivity]);

  return (
    // Replaced className="flex-1 bg-gray-50" with style={styles.container}
    <View style={styles.container}>
      
      {/* Header */}
      {/* Replaced className="..." with style={styles.header} */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            Baby Tracking
          </Text>
        </View>

        {/* Tab Navigation */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabContainer}
        >
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tabButton,
                activeTab === tab ? styles.tabButtonActive : styles.tabButtonInactive
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab ? styles.tabTextActive : styles.tabTextInactive
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Content Area */}
      {/* Replaced className="flex-1 pt-4" with style={styles.contentArea} */}
      <ScrollView style={styles.contentArea}>
        {renderContent}
      </ScrollView>
    </View>
  );
}


// --- StyleSheet Definitions ---
const styles = StyleSheet.create({
  // Equivalent to: flex-1 bg-gray-50
  container: {
    flex: 1,
    backgroundColor: '#f9fafb', // gray-50
  },

  // Equivalent to: bg-white pt-12 pb-2 px-4 border-b border-gray-200 shadow-sm
  header: {
    backgroundColor: 'white',
    paddingTop: 48, // pt-12 (assuming standard Expo safe area offset)
    paddingBottom: 8, // pb-2
    paddingHorizontal: 16, // px-4
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb', // gray-200
    shadowColor: '#000', // shadow-sm equivalent
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2, // Android shadow
  },

  // Equivalent to: flex-row items-center
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Equivalent to: mr-3 p-2
  backButton: {
    marginRight: 12, // mr-3
    padding: 8, // p-2
  },

  // Equivalent to: text-gray-900 text-xl font-bold
  headerTitle: {
    color: '#111827', // gray-900
    fontSize: 20, // text-xl
    fontWeight: '700', // font-bold
  },

  // Equivalent to: mt-3 flex-row
  tabContainer: {
    marginTop: 12, // mt-3
    flexDirection: 'row',
  },

  // Common styles for both active and inactive tabs
  tabButton: {
    paddingVertical: 8, // py-2
    paddingHorizontal: 16, // px-4
    borderRadius: 9999, // rounded-full
    marginRight: 8, // mr-2
    minWidth: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Equivalent to: bg-teal-500 shadow-sm
  tabButtonActive: {
    backgroundColor: '#14b8a6', // teal-500
    shadowColor: '#14b8a6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 0,
  },

  // Equivalent to: bg-white border border-gray-200
  tabButtonInactive: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb', // gray-200
  },
  
  // Common text style
  tabText: {
    fontSize: 14, // text-sm
    fontWeight: '500', // font-medium
  },

  // Equivalent to: text-white
  tabTextActive: {
    color: 'white',
  },

  // Equivalent to: text-gray-600
  tabTextInactive: {
    color: '#4b5563', // gray-600
  },
  
  // Equivalent to: flex-1 pt-4
  contentArea: {
    flex: 1,
    paddingTop: 16, // pt-4
  },
});