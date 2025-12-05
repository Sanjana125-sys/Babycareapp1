// TelehealthConsultationScreen.tsx

import React, { useState, useMemo, useEffect } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  Alert,
  TextInput
} from "react-native";
import { 
  ChevronLeft, 
  Video, 
  Calendar, 
  Mic, 
  PhoneCall, 
  Camera, 
  User, 
  Clock, 
  ClipboardList
} from "lucide-react-native";
import { useRouter } from "expo-router"; 
import { Camera as ExpoCamera } from "expo-camera"; // Use ExpoCamera for permissions
import * as Location from 'expo-location'; // For location permission

// Assuming this interface is defined in src/types.ts
interface Appointment {
  id: string;
  name: string;
  specialty: string;
  date: string;
  time: string;
  duration: string;
  notes: string;
  status: "Upcoming" | "History";
}

// --- Mock Data ---
const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "u1",
    name: "Dr. Sarael Chen",
    specialty: "Pediatrics",
    date: "Jun 15, 2023",
    time: "2:00 AM",
    duration: "25 mins",
    notes: "Regular checkup for 6-month-old",
    status: "Upcoming",
  },
  {
    id: "h1",
    name: "Dr. Michael Chen",
    specialty: "Pediatrics",
    date: "Jun 15, 2023",
    time: "2:35 PM",
    duration: "30 mins",
    notes: "Regular checkup for 6-month-old",
    status: "History",
  },
  {
    id: "h2",
    name: "Dr. Sarah Johnson",
    specialty: "Child Nutrition",
    date: "May 28, 2023",
    time: "11:00 AM",
    duration: "30 mins",
    notes: "Discussed sleeping patterns",
    status: "History",
  },
];

const TAB_OPTIONS = ["Upcoming", "History"];

// --- Component Definition ---

export default function TelehealthConsultationScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [isCalling, setIsCalling] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [callNotes, setCallNotes] = useState("");

  const filteredAppointments = useMemo(() => {
    return MOCK_APPOINTMENTS.filter(app => app.status === activeTab);
  }, [activeTab]);

  // ----------------------------------------------------
  // 💡 Permissions Logic (Camera, Mic, Location)
  // ----------------------------------------------------
  const requestPermissions = async () => {
    const { status: cameraStatus } = await ExpoCamera.requestCameraPermissionsAsync();
    const { status: micStatus } = await ExpoCamera.requestMicrophonePermissionsAsync();
    const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
    
    // Check if all necessary permissions are granted
    const allGranted = (
        cameraStatus === 'granted' && 
        micStatus === 'granted' &&
        locationStatus === 'granted'
    );
    
    setPermissionsGranted(allGranted);

    if (!allGranted) {
      Alert.alert(
        "Permissions Required",
        "Camera, Microphone, and Location access are essential for video consultation. Please enable them in your app settings.",
        [{ text: "OK" }]
      );
    }
    return allGranted;
  };

  const handleStartConsultation = async () => {
    const granted = await requestPermissions();
    if (granted) {
      // In a real app, this would initiate the WebRTC connection
      setIsCalling(true);
      Alert.alert("Call Started", "Connecting to specialist now...");
    }
  };

  const handleEndCall = () => {
    setIsCalling(false);
    Alert.alert("Call Ended", "Thank you for using the service.");
  };

  // ----------------------------------------------------
  // 💡 Rendering Helpers
  // ----------------------------------------------------
  const renderAppointmentItem = (item: Appointment) => (
    <View key={item.id} style={styles.appointmentCard}>
      <View style={styles.doctorInfo}>
        <View style={styles.avatarPlaceholder}>
          <User size={24} color="#14b8a6" />
        </View>
        <View>
          <Text style={styles.doctorName}>{item.name}</Text>
          <Text style={styles.doctorSpecialty}>{item.specialty}</Text>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <Calendar size={16} color="#6b7280" />
        <Text style={styles.detailText}>{item.date} {item.time}</Text>
      </View>
      <View style={styles.detailsRow}>
        <Clock size={16} color="#6b7280" />
        <Text style={styles.detailText}>{item.duration}</Text>
      </View>
      <View style={styles.detailsRow}>
        <ClipboardList size={16} color="#6b7280" />
        <Text style={styles.detailText}>{item.notes}</Text>
      </View>
      
      <TouchableOpacity style={styles.viewDetailsButton}>
        <Text style={styles.viewDetailsText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );

  // ----------------------------------------------------
  // 💡 Main Render
  // ----------------------------------------------------

  if (isCalling) {
    // --- Video Consultation View ---
    return (
      <View style={styles.callContainer}>
        {/* Placeholder for the large video feed */}
        <View style={styles.remoteVideo}>
          <Text style={styles.videoText}>Dr. Sarah Johnson (Remote Feed)</Text>
          {/* In a real app, ExpoCamera/WebView/WebRTC Stream goes here */}
        </View>

        {/* Local Video Feed (Picture-in-picture) */}
        <View style={styles.localVideo}>
          <Text style={styles.localVideoText}>You (Local Feed)</Text>
        </View>

        {/* Call Notes Section */}
        <View style={styles.callNotesSection}>
            <Text style={styles.callNotesHeader}>Call Notes</Text>
            <TextInput
                style={styles.notesInput}
                onChangeText={setCallNotes}
                value={callNotes}
                placeholder="Take notes during the call..."
                multiline
                placeholderTextColor="#9ca3af"
            />
            <TouchableOpacity style={styles.saveNotesButton}>
                <Text style={styles.saveNotesText}>Save Notes</Text>
            </TouchableOpacity>
        </View>

        {/* Call Controls */}
        <View style={styles.callControls}>
          {/* Mute/Unmute */}
          <TouchableOpacity style={styles.controlButton}>
            <Mic size={24} color="white" />
          </TouchableOpacity>
          {/* End Call */}
          <TouchableOpacity 
            style={[styles.controlButton, styles.endCallButton]} 
            onPress={handleEndCall}
          >
            <PhoneCall size={24} color="white" />
          </TouchableOpacity>
          {/* Toggle Camera */}
          <TouchableOpacity style={styles.controlButton}>
            <Camera size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }


  // --- Scheduling/Listing View ---
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Telehealth Consultation</Text>
        <Text style={styles.headerSubtitle}>Connect with pediatric specialists</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Quick Consultation Section */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.scheduleButton}>
            <Calendar size={20} color="#374151" />
            <Text style={styles.scheduleText}>Schedule for Later</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.consultButton} 
            onPress={handleStartConsultation}
          >
            <Video size={20} color="white" />
            <Text style={styles.consultText}>Start Video Consultation</Text>
          </TouchableOpacity>
          
          <Text style={styles.quickConnectText}>
            Connect with pediatric specialist now
          </Text>
        </View>
        
        {/* Appointment Tabs */}
        <View style={styles.tabContainer}>
          {TAB_OPTIONS.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tabButton,
                activeTab === tab ? styles.tabButtonActive : styles.tabButtonInactive
              ]}
            >
              <Text style={styles.tabText}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Appointment List */}
        {filteredAppointments.map(renderAppointmentItem)}
        
      </ScrollView>
    </View>
  );
}

// --- StyleSheet Definitions ---

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb', // gray-50
        paddingTop: 50, // Adjust for safe area
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    header: {
        backgroundColor: 'white',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
        elevation: 1,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1f2937',
        marginTop: 5,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 8,
    },
    backButton: {
        alignSelf: 'flex-start',
        marginBottom: 5,
    },

    // --- Action Section Styles ---
    section: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginVertical: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    scheduleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginBottom: 10,
        borderRadius: 8,
        backgroundColor: '#e5e7eb', // gray-200
        width: '100%',
        justifyContent: 'center',
    },
    scheduleText: {
        marginLeft: 10,
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    consultButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 8,
        backgroundColor: '#2563eb', // blue-600
        width: '100%',
        justifyContent: 'center',
    },
    consultText: {
        marginLeft: 10,
        fontSize: 18,
        fontWeight: '700',
        color: 'white',
    },
    quickConnectText: {
        marginTop: 10,
        fontSize: 14,
        color: '#6b7280',
    },

    // --- Tab Styles ---
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginBottom: 15,
        borderBottomWidth: 2,
        borderBottomColor: '#e5e7eb',
    },
    tabButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    tabButtonActive: {
        borderBottomWidth: 2,
        borderBottomColor: '#2563eb',
    },
    tabButtonInactive: {},
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },

    // --- Appointment Card Styles ---
    appointmentCard: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#f3f4f6',
    },
    doctorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        paddingBottom: 10,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e0f2f1', // light teal
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    doctorName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1f2937',
    },
    doctorSpecialty: {
        fontSize: 14,
        color: '#14b8a6', // teal-500
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    detailText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#4b5563',
    },
    viewDetailsButton: {
        marginTop: 10,
        alignSelf: 'flex-end',
    },
    viewDetailsText: {
        color: '#2563eb',
        fontWeight: '600',
        fontSize: 14,
    },

    // --- Video Call Styles (isCalling === true) ---
    callContainer: {
        flex: 1,
        backgroundColor: '#1f2937', // Dark background for video
    },
    remoteVideo: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    videoText: {
        color: 'white',
        fontSize: 18,
    },
    localVideo: {
        position: 'absolute',
        top: 60,
        right: 20,
        width: 100,
        height: 150,
        backgroundColor: '#4b5563',
        borderRadius: 8,
        borderWidth: 2,
        borderColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    localVideoText: {
        color: 'white',
        fontSize: 12,
    },
    callControls: {
        position: 'absolute',
        bottom: 10,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 50,
        paddingBottom: 20,
    },
    controlButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#4b5563',
        justifyContent: 'center',
        alignItems: 'center',
    },
    endCallButton: {
        backgroundColor: '#ef4444', // Red-500
        width: 70,
        height: 70,
        borderRadius: 35,
    },

    // Call Notes Styles
    callNotesSection: {
        backgroundColor: 'white',
        padding: 16,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        maxHeight: 250,
        position: 'absolute',
        bottom: 80,
        left: 0,
        right: 0,
    },
    callNotesHeader: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 8,
        color: '#1f2937',
    },
    notesInput: {
        minHeight: 80,
        borderColor: '#e5e7eb',
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        textAlignVertical: 'top',
        color: '#1f2937',
    },
    saveNotesButton: {
        marginTop: 10,
        backgroundColor: '#14b8a6', // Teal-500
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveNotesText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
    }
});