import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert, StyleSheet } from 'react-native';
import { MapPin, Calendar, Clock, User, Phone, CheckCircle, Star } from 'lucide-react-native';
// Note: Assuming 'expo-router' is set up, though the router import isn't strictly necessary for the screen structure.

// Mock data for pediatricians
const mockPediatricians = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Pediatrician',
    distance: '0.8 miles',
    rating: 4.9,
    address: '123 Main Street, New York, NY',
    phone: '(555) 123-4567',
    lat: 40.7128,
    lng: -74.0060,
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea811ec6?w=150&h=150&auto=format&fit=crop&q=60'
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    specialty: 'Pediatric Cardiologist',
    distance: '1.2 miles',
    rating: 4.8,
    address: '456 Park Avenue, New York, NY',
    phone: '(555) 987-6543',
    lat: 40.7589,
    lng: -73.9851,
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&auto=format&fit=crop&q=60'
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    specialty: 'Pediatric Neurologist',
    distance: '2.1 miles',
    rating: 4.7,
    address: '789 Broadway, New York, NY',
    phone: '(555) 456-7890',
    lat: 40.7282,
    lng: -73.9942,
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=150&h=150&auto=format&fit=crop&q=60'
  },
  {
    id: '4',
    name: 'Dr. James Wilson',
    specialty: 'Pediatrician',
    distance: '3.5 miles',
    rating: 4.6,
    address: '101 First Ave, New York, NY',
    phone: '(555) 234-5678',
    lat: 40.7359,
    lng: -73.9911,
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&h=150&auto=format&fit=crop&q=60'
  }
];

// Mock data for booked appointments
const mockAppointments = [
  {
    id: '101',
    pediatricianId: '1',
    pediatricianName: 'Dr. Sarah Johnson',
    date: '2023-06-15',
    time: '10:30 AM',
    status: 'confirmed'
  },
  {
    id: '102',
    pediatricianId: '2',
    pediatricianName: 'Dr. Michael Chen',
    date: '2023-06-20',
    time: '2:15 PM',
    status: 'pending'
  }
];

// Simple implementation of useRouter for demonstration (replace with actual router in a real Expo project)
const useRouter = () => ({
    back: () => console.log('Go Back') // Mock router back function
});

export default function PediatricianMapScreen() {
  const router = useRouter();
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [isBookingModalVisible, setIsBookingModalVisible] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [appointments, setAppointments] = useState(mockAppointments);

  const handleBookAppointment = () => {
    if (!bookingDate || !bookingTime) {
      Alert.alert('Error', 'Please select both date and time');
      return;
    }

    // Create new appointment
    const newAppointment = {
      id: `${appointments.length + 100}`,
      pediatricianId: selectedDoctor.id,
      pediatricianName: selectedDoctor.name,
      date: bookingDate,
      time: bookingTime,
      status: 'pending' // New appointments typically start as 'pending'
    };

    setAppointments([...appointments, newAppointment]);
    setIsBookingModalVisible(false);
    setBookingDate('');
    setBookingTime('');
    
    Alert.alert('Success', 'Appointment booked successfully! Status: Pending Confirmation');
  };

  const formatDate = (dateString: string) => {
    // Use a safer date parsing method if dateString is not guaranteed to be 'YYYY-MM-DD'
    try {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
      return date.toLocaleDateString(undefined, options);
    } catch (e) {
      return dateString; // Fallback
    }
  };

  // --- UI Components ---
  const MapPlaceholder = () => (
    <View style={styles.mapPlaceholder}>
      <View style={styles.mapOverlay} />
      <MapPin size={48} color="#4A90E2" />
      <Text style={styles.mapTitle}>Interactive Map View</Text>
      <Text style={styles.mapSubtitle}>Showing doctors near you</Text>
      
      {/* Doctor Markers (Matching image numbering) */}
      <View style={[styles.doctorMarker, { top: 32, left: 64 }]}><Text style={styles.markerText}>1</Text></View>
      <View style={[styles.doctorMarker, { top: 64, right: 80 }]}><Text style={styles.markerText}>2</Text></View>
      <View style={[styles.doctorMarker, { bottom: 48, left: 96 }]}><Text style={styles.markerText}>3</Text></View>
      <View style={[styles.doctorMarker, { bottom: 80, right: 64 }]}><Text style={styles.markerText}>4</Text></View>
      
      {/* Small "Book Appointment" button shown in the image that scrolls up */}
       <View style={styles.mapButtonWrapper}>
           <TouchableOpacity
               style={styles.mapBookButton}
               onPress={() => console.log('Map Book Appointment clicked')}
           >
               <Text style={styles.mapBookButtonText}>Book Appointment</Text>
           </TouchableOpacity>
       </View>
    </View>
  );

  const AppointmentItem = ({ appointment }: { appointment: typeof mockAppointments[0] }) => {
    const statusConfirmed = appointment.status === 'confirmed';
    return (
      <View style={styles.appointmentCard}>
        <View style={styles.appointmentStatusIcon}>
          {statusConfirmed ? (
            <CheckCircle size={24} color="#50C878" />
          ) : (
            <Clock size={24} color="#FF7F50" />
          )}
        </View>
        
        <View style={styles.appointmentDetails}>
          <Text style={styles.appointmentDoctorName}>{appointment.pediatricianName}</Text>
          
          <View style={styles.appointmentMetaRow}>
            <Calendar size={16} color="#4A90E2" />
            <Text style={styles.appointmentMetaText}>{formatDate(appointment.date)}</Text>
          </View>
          
          <View style={styles.appointmentMetaRow}>
            <Clock size={16} color="#4A90E2" />
            <Text style={styles.appointmentMetaText}>{appointment.time}</Text>
          </View>
          
          <Text style={[styles.appointmentStatusText, { color: statusConfirmed ? '#38A169' : '#ED8936' }]}>
            {statusConfirmed ? 'Confirmed' : 'Pending'}
          </Text>
        </View>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      

      {/* Map Placeholder */}
      <MapPlaceholder />

      <ScrollView style={styles.scrollView}>
        {/* Nearby Doctors Section */}
        <Text style={styles.sectionTitle}>Nearby Pediatricians</Text>
        
        {mockPediatricians.map((doctor) => (
          <View key={doctor.id} style={styles.doctorCard}>
            <View style={styles.doctorAvatar}>
              <User size={32} color="#4A90E2" />
            </View>
            
            <View style={styles.doctorDetails}>
              <View style={styles.doctorNameRow}>
                <View>
                  <Text style={styles.doctorName}>{doctor.name}</Text>
                  <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
                </View>
                <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>{doctor.rating}</Text>
                  <Star size={10} color="#000" style={{marginLeft: 2}} />
                </View>
              </View>
              
              <View style={styles.doctorMetaRow}>
                <MapPin size={16} color="#4A90E2" />
                <Text style={styles.doctorMetaText}>{doctor.distance} • {doctor.address}</Text>
              </View>
              
              <View style={styles.doctorMetaRow}>
                <Phone size={16} color="#4A90E2" />
                <Text style={styles.doctorMetaText}>{doctor.phone}</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.bookButton}
                onPress={() => {
                  setSelectedDoctor(doctor);
                  setIsBookingModalVisible(true);
                }}
              >
                <Text style={styles.bookButtonText}>Book Appointment</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* My Appointments Section */}
        {appointments.length > 0 && (
          <View style={styles.appointmentsSection}>
            <Text style={styles.sectionTitle}>My Appointments</Text>
            
            {appointments.map((appointment) => (
              <AppointmentItem key={appointment.id} appointment={appointment} />
            ))}
          </View>
        )}
        <View style={{height: 50}} />
      </ScrollView>

      {/* Booking Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isBookingModalVisible}
        onRequestClose={() => setIsBookingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalSeparator}></View>
              <Text style={styles.modalTitle}>Book Appointment</Text>
              {selectedDoctor && (
                <Text style={styles.modalSubtitle}>{selectedDoctor.name}</Text>
              )}
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Select Date</Text>
              <TextInput
                style={styles.textInput}
                placeholder="YYYY-MM-DD (e.g., 2023-06-15)"
                value={bookingDate}
                onChangeText={setBookingDate}
                keyboardType="numbers-and-punctuation"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Select Time</Text>
              <TextInput
                style={styles.textInput}
                placeholder="HH:MM AM/PM (e.g., 10:30 AM)"
                value={bookingTime}
                onChangeText={setBookingTime}
              />
            </View>
            
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setIsBookingModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleBookAppointment}
              >
                <Text style={styles.confirmButtonText}>Confirm Booking</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// StyleSheet to replace Tailwind classes with React Native styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB', // gray-50
    },
    // --- Header Styles ---
    header: {
        backgroundColor: '#3B82F6', // blue-500
        paddingTop: 48, // pt-12 (approx)
        paddingBottom: 24, // pb-6
        paddingHorizontal: 16, // px-4
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerBackText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '500', // font-medium
    },
    headerTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    // --- Map Placeholder Styles ---
    mapPlaceholder: {
        height: 256, // h-64
        backgroundColor: '#DBEAFE', // blue-100
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    mapOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#BFDBFE', // blue-200
        opacity: 0.5,
    },
    mapTitle: {
        marginTop: 8, // mt-2
        color: '#1E40AF', // blue-800
        fontWeight: '600', // font-semibold
    },
    mapSubtitle: {
        color: '#2563EB', // blue-600
    },
    doctorMarker: {
        position: 'absolute',
        width: 32, // w-8
        height: 32, // h-8
        borderRadius: 16, // rounded-full
        backgroundColor: '#EF4444', // red-500
        alignItems: 'center',
        justifyContent: 'center',
    },
    markerText: {
        color: 'white',
        fontSize: 12, // text-xs
        fontWeight: 'bold',
    },
    mapButtonWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        paddingBottom: 8,
        // Using a semi-transparent background to match the scroll-up effect in the image
        backgroundColor: 'rgba(219, 234, 254, 0.7)', // Slightly transparent blue-100
    },
    mapBookButton: {
        backgroundColor: '#3B82F6', // blue-500
        paddingVertical: 12, // py-3
        borderRadius: 8, // rounded-lg
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: -12, // Pull button up slightly
    },
    mapBookButtonText: {
        color: 'white',
        fontWeight: '500', // font-medium
        fontSize: 16,
    },
    // --- ScrollView Content Styles ---
    scrollView: {
        flex: 1,
        paddingHorizontal: 16, // px-4
        paddingVertical: 16, // py-4
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937', // gray-800
        marginBottom: 16, // mb-4
    },
    doctorCard: {
        backgroundColor: 'white',
        borderRadius: 12, // rounded-xl
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        marginBottom: 16, // mb-4
        padding: 16, // p-4
        borderWidth: 1,
        borderColor: '#F3F4F6', // gray-100
        flexDirection: 'row',
    },
    doctorAvatar: {
        backgroundColor: '#E5E7EB', // gray-200
        borderRadius: 32, // rounded-full
        width: 64, // w-16
        height: 64, // h-16
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16, // mr-4
    },
    doctorDetails: {
        flex: 1,
    },
    doctorNameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    doctorName: {
        fontWeight: 'bold',
        fontSize: 18,
        color: '#1F2937', // gray-800
    },
    doctorSpecialty: {
        color: '#3B82F6', // blue-500
        fontSize: 14,
    },
    ratingBadge: {
        backgroundColor: '#EFF6FF', // blue-100
        paddingHorizontal: 8, // px-2
        paddingVertical: 4, // py-1
        borderRadius: 9999, // rounded-full
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        color: '#1D4ED8', // blue-700
        fontWeight: '500', // font-medium
    },
    doctorMetaRow: {
        flexDirection: 'row',
        marginTop: 8, // mt-2
        alignItems: 'center',
    },
    doctorMetaText: {
        marginLeft: 4, // ml-1
        color: '#4B5563', // gray-600
        flexShrink: 1,
    },
    bookButton: {
        marginTop: 12, // mt-3
        backgroundColor: '#3B82F6', // blue-500
        paddingVertical: 8, // py-2
        borderRadius: 8, // rounded-lg
        alignItems: 'center',
    },
    bookButtonText: {
        color: 'white',
        fontWeight: '500', // font-medium
    },
    // --- Appointments Section Styles ---
    appointmentsSection: {
        marginTop: 24, // mt-6
    },
    appointmentCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        marginBottom: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        flexDirection: 'row',
        alignItems: 'center',
    },
    appointmentStatusIcon: {
        marginRight: 12, // mr-3
    },
    appointmentDetails: {
        flex: 1,
    },
    appointmentDoctorName: {
        fontWeight: 'bold',
        fontSize: 18,
        color: '#1F2937',
    },
    appointmentMetaRow: {
        flexDirection: 'row',
        marginTop: 4,
        alignItems: 'center',
    },
    appointmentMetaText: {
        marginLeft: 4,
        color: '#4B5563',
    },
    appointmentStatusText: {
        marginTop: 8,
        fontWeight: '500',
    },
    // --- Modal Styles ---
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24, // rounded-t-3xl
        borderTopRightRadius: 24,
        padding: 24, // p-6
        height: '60%', // h-3/5
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 16, // mb-4
    },
    modalSeparator: {
        width: 48, // w-12
        height: 4, // h-1
        backgroundColor: '#D1D5DB', // gray-300
        borderRadius: 9999, // rounded-full
        marginBottom: 8, // mb-2
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937', // gray-800
    },
    modalSubtitle: {
        color: '#4B5563', // gray-600
        marginTop: 4, // mt-1
    },
    inputGroup: {
        marginBottom: 24, // mb-6
    },
    inputLabel: {
        fontWeight: '500', // font-medium
        color: '#374151', // gray-700
        marginBottom: 8, // mb-2
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#D1D5DB', // gray-300
        borderRadius: 8, // rounded-lg
        padding: 12, // p-3
        backgroundColor: '#F9FAFB', // gray-50
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20, // Added margin for spacing
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#E5E7EB', // gray-200
        paddingVertical: 12, // py-3
        borderRadius: 8, // rounded-lg
        marginRight: 8, // mr-2
        alignItems: 'center',
    },
    cancelButtonText: {
        fontWeight: '500', // font-medium
        color: '#4B5563', // gray-700
    },
    confirmButton: {
        flex: 1,
        backgroundColor: '#3B82F6', // blue-500
        paddingVertical: 12, // py-3
        borderRadius: 8, // rounded-lg
        marginLeft: 8, // ml-2
        alignItems: 'center',
    },
    confirmButtonText: {
        fontWeight: '500', // font-medium
        color: 'white',
    },
});