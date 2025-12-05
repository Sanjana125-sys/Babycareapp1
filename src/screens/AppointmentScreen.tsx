import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    ScrollView, 
    StyleSheet, 
    SafeAreaView, 
    Dimensions, 
    TextInput,
    Modal,
    Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker'; 

const { width } = Dimensions.get('window');

// --- Icon Placeholder (Using Emojis) ---
const Icon = ({ name, size = 20, style = {} }: { name: string, size?: number, style?: object }) => (
    <Text style={[{ fontSize: size }, style]}>
        {
            {
                ArrowLeft: "⬅️",
                MapPin: "📍",
                Star: "⭐",
                Phone: "📞",
                Mail: "✉️",
                Calendar: "🗓️",
                Clock: "⏰",
                User: "👤",
                Message: "💬",
                X: "❌",
                Plus: "➕",
                CheckCircle: "✅", 
                ClipboardList: "📋", // New Icon for Appointment Card
            }[name] || name
        }
    </Text>
);

// --- Type Definitions & Mock Data ---
interface Doctor {
    id: number;
    name: string;
    specialty: string;
    location: string;
    phone: string;
    email: string;
    rating: number;
}

interface AppointmentDetails {
    doctor: Doctor;
    babyName: string;
    date: string;
    time: string;
    reason: string;
    // Added status to distinguish between upcoming and past
    status: 'Scheduled' | 'Completed' | 'Cancelled'; 
}

const mockDoctors: Doctor[] = [
    { id: 1, name: "Michael Chen", specialty: "Child Development", location: "458 Healthcare Ave, Floor 2", phone: "+1-555-0102", email: "michael.chen@childcare.com", rating: 4.9 },
    { id: 2, name: "Sophia Patel", specialty: "Pediatric Nutrition", location: "789 Wellness Blvd, Suite 5", phone: "+1-555-0103", email: "sophia.patel@childcare.com", rating: 4.8 },
    { id: 3, name: "David Kim", specialty: "Pediatric Cardiology", location: "321 Healthy Way, Floor 3", phone: "+1-555-0104", email: "davidkim@cardio.com", rating: 4.7 }, 
    { id: 4, name: "Olivia Garcia", specialty: "General Pediatrics", location: "654 Family St, Suite 1", phone: "+1-555-0105", email: "olivia.garcia@pedia.com", rating: 4.9 }, 
    { id: 5, name: "James Wilson", specialty: "Pediatric Neurology", location: "987 Childcare Rd, Floor 4", phone: "+1-555-0106", email: "jamews.wilson@neuropedia.com", rating: 4.6 },
    { id: 6, name: "Emma Thompson", specialty: "Pediatric Endocrinology", location: "159 Growth Ln, Suite 3", phone: "+1-555-0107", email: "emma.thom@pediaendo.com", rating: 4.8 },

    // ... other doctors
];

const mockBabies = ["--- Choose a baby ---", "Baby Leo", "Jane Doe", "ABC"];

// Mock initial data for demonstration
const initialAppointments: AppointmentDetails[] = [
    { 
        doctor: mockDoctors[0], 
        babyName: 'Jane Doe', 
        date: 'November 25, 2025', 
        time: '09:00 AM', 
        reason: 'Vaccination follow-up.',
        status: 'Completed'
    },
    { 
        doctor: mockDoctors[0], 
        babyName: 'Baby Leo', 
        date: 'December 1st, 2025', 
        time: '11:00 AM', 
        reason: 'Routine 6-month checkup.',
        status: 'Scheduled'
    },
];

// =================================================================
// 0. Appointment Card Component (New Feature Display)
// =================================================================

const AppointmentCard: React.FC<{ appointment: AppointmentDetails }> = ({ appointment }) => {
    const isUpcoming = appointment.status === 'Scheduled';
    const statusColor = isUpcoming ? '#4F46E5' : '#10B981';
    const statusText = isUpcoming ? 'Upcoming Appointment' : 'Completed Visit';
    const StatusIcon = isUpcoming ? 'Clock' : 'CheckCircle';

    return (
        <View style={cardStyles.card}>
            <View style={cardStyles.header}>
                <Icon name={StatusIcon} size={18} style={{ color: statusColor, marginRight: 8 }} />
                <Text style={[cardStyles.headerText, { color: statusColor }]}>
                    {statusText}
                </Text>
            </View>
            <Text style={cardStyles.doctorName}>Dr. {appointment.doctor.name}</Text>
            
            <View style={cardStyles.detailRow}>
                <Icon name="User" size={16} style={{ color: '#4B5563' }} />
                <Text style={cardStyles.detailText}>Patient: **{appointment.babyName}**</Text>
            </View>
            <View style={cardStyles.detailRow}>
                <Icon name="Calendar" size={16} style={{ color: '#4B5563' }} />
                <Text style={cardStyles.detailText}>Date: **{appointment.date}**</Text>
            </View>
            <View style={cardStyles.detailRow}>
                <Icon name="Clock" size={16} style={{ color: '#4B5563' }} />
                <Text style={cardStyles.detailText}>Time: **{appointment.time}**</Text>
            </View>
            <View style={cardStyles.detailRow}>
                <Icon name="ClipboardList" size={16} style={{ color: '#4B5563' }} />
                <Text style={cardStyles.detailText}>Reason: {appointment.reason}</Text>
            </View>
        </View>
    );
};


// =================================================================
// 1. Appointment Confirmation Modal Component (Unchanged)
// =================================================================

interface ConfirmationModalProps {
    isVisible: boolean;
    onClose: () => void;
    onConfirm: (details: AppointmentDetails) => void;
    details: AppointmentDetails; 
}

// DetailRow component is defined here...
const DetailRow: React.FC<{ icon: string, label: string, value: string, isReason?: boolean }> = ({ icon, label, value, isReason = false }) => (
    <View style={[styles.detailRow, isReason && styles.reasonRow]}>
        <Icon name={icon} size={20} style={{ color: isReason ? '#6B7280' : '#4F46E5', marginRight: 12 }} />
        <View style={styles.detailTextWrapper}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={isReason ? styles.reasonValue : styles.detailValue}>{value}</Text>
        </View>
    </View>
);

const AppointmentConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isVisible,
    onClose,
    onConfirm,
    details
}) => {
    
    const handleConfirm = () => {
        onConfirm(details);
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
           <View style={styles.centeredView}>
        <View style={styles.modalView}>
            {/* Header */}
            <View style={styles.modalHeader}>
                <Icon name="CheckCircle" size={24} style={styles.confirmCheckIcon} /> 
                <Text style={styles.modalTitle}>Confirm Your Appointment</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Icon name="X" size={20} style={{ color: '#9CA3AF' }} /> 
                </TouchableOpacity>
            </View>
                        <Text style={styles.modalSubtitle}>
                            Please verify the details below before scheduling.
                        </Text>

                        <View style={styles.doctorCardConfirm}>
                            <Text style={styles.doctorTitleConfirm}>Dr. {details.doctor.name}</Text>
                            <Text style={styles.doctorSpecialtyConfirm}>{details.doctor.specialty}</Text>
                        </View>

                        <View style={styles.summaryContainer}>
                            <DetailRow icon="User" label="Baby Patient" value={details.babyName} />
                            <DetailRow icon="Calendar" label="Appointment Date" value={details.date} />
                            <DetailRow icon="Clock" label="Appointment Time" value={details.time} />
                            
                            {details.reason && (
                                <DetailRow 
                                    icon="Message" 
                                    label="Reason for Visit" 
                                    value={details.reason.length > 100 ? details.reason.substring(0, 100) + '...' : details.reason}
                                    isReason={true}
                                />
                            )}
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={styles.backButtonConfirm}
                                onPress={onClose}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.backButtonText}>Edit Details</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={handleConfirm}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.confirmButtonText}>Confirm & Schedule</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
    );
};

// =================================================================
// 2. Book Appointment Modal Component (Unchanged)
// =================================================================

interface BookingModalProps {
    isVisible: boolean;
    onClose: () => void;
    onBook: (details: Omit<AppointmentDetails, 'doctor'> & { doctor: Doctor }) => void;
    doctor: Doctor | null;
}

const BookAppointmentModal: React.FC<BookingModalProps> = ({ isVisible, onClose, onBook, doctor }) => {
    const [selectedBaby, setSelectedBaby] = useState(mockBabies[0]); 
    const [appointmentDate, setAppointmentDate] = useState("MM/DD/YYYY"); 
    const [appointmentTime, setAppointmentTime] = useState("HH:MM AM/PM"); 
    const [reason, setReason] = useState("");

    if (!doctor) return null;

    const handleBooking = () => {
        if (selectedBaby === mockBabies[0]) {
            Alert.alert("Required Field", "Please select a baby from the dropdown menu.");
            return;
        }

        const details: Omit<AppointmentDetails, 'doctor'> & { doctor: Doctor } = {
        doctor: doctor,
        babyName: selectedBaby,
        date: appointmentDate.trim(),
        time: appointmentTime.trim(),
        reason: reason.trim(),
        // 🌟 ADD THIS LINE: Providing the required 'status' property
        status: 'Scheduled', 
    };
    
    onBook(details);
};

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Icon name="X" size={20} style={{ color: '#9CA3AF' }} />
                    </TouchableOpacity>

                    <Text style={styles.modalTitle}>Book Appointment</Text>
                    <Text style={styles.modalSubtitle}>Schedule an appointment with Dr. {doctor.name}</Text>

                    {/* Form Fields */}
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Select Baby</Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={selectedBaby}
                                onValueChange={(itemValue) => setSelectedBaby(itemValue)}
                                style={styles.pickerStyle}
                            >
                                {mockBabies.map((babyName, index) => (
                                    <Picker.Item 
                                        key={index} 
                                        label={babyName} 
                                        value={babyName} 
                                    />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Appointment Date</Text>
                        <View style={styles.inputField}>
                            <Icon name="Calendar" size={18} style={{ color: '#6B7280' }} />
                            <TextInput
                                style={styles.textInput}
                                placeholder="e.g., December 6th, 2025"
                                placeholderTextColor="#9CA3AF"
                                value={appointmentDate}
                                onChangeText={setAppointmentDate}
                            />
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Appointment Time</Text>
                        <View style={styles.inputField}>
                            <TextInput
                                style={styles.textInput}
                                placeholder="e.g., 02:30 PM"
                                placeholderTextColor="#9CA3AF"
                                value={appointmentTime}
                                onChangeText={setAppointmentTime}
                            />
                            <Icon name="Clock" size={18} style={{ color: '#6B7280' }} />
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Reason for Visit (Optional)</Text>
                        <View style={styles.textareaContainer}>
                            <TextInput
                                style={styles.textarea}
                                placeholder="Describe the reason for this appointment..."
                                placeholderTextColor="#9CA3AF"
                                multiline={true}
                                numberOfLines={4}
                                value={reason}
                                onChangeText={setReason}
                            />
                            <Text style={styles.textareaIcon}>✍️</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.bookButton}
                        onPress={handleBooking}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.bookButtonText}>Confirm Booking</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};


// =================================================================
// 3. Main Appointment Screen (UPDATED)
// =================================================================

const DoctorCard: React.FC<{ doctor: Doctor, onBook: (doc: Doctor) => void }> = ({ doctor, onBook }) => (
    <View style={styles.doctorCard}>
        <View style={styles.doctorCardHeader}>
            <Text style={styles.doctorCardName}>Dr. {doctor.name}</Text>
            <View style={styles.ratingContainer}>
                <Text style={styles.ratingText}>{doctor.rating}</Text>
                <Icon name="Star" size={14} style={{ color: '#FCD34D', marginLeft: 4 }} />
            </View>
        </View>
        <Text style={styles.doctorCardSpecialty}>{doctor.specialty}</Text>
        <View style={styles.infoRow}>
            <Icon name="MapPin" size={14} style={{ color: '#6B7280' }} />
            <Text style={styles.infoText}>{doctor.location}</Text>
        </View>
        <View style={styles.infoRow}>
            <Icon name="Phone" size={14} style={{ color: '#6B7280' }} />
            <Text style={styles.infoText}>{doctor.phone}</Text>
        </View>
        <View style={styles.infoRow}>
            <Icon name="Mail" size={14} style={{ color: '#6B7280' }} />
            <Text style={styles.infoTextEmail}>{doctor.email}</Text>
        </View>
        <TouchableOpacity style={styles.bookDoctorButton} onPress={() => onBook(doctor)} activeOpacity={0.8}>
            <Text style={styles.bookDoctorButtonText}>Book Appointment</Text>
        </TouchableOpacity>
    </View>
);

const AppointmentScreen: React.FC = () => {
    // 🌟 STATE TO HOLD ALL APPOINTMENTS (New Feature)
    const [appointments, setAppointments] = useState<AppointmentDetails[]>(initialAppointments);

    // --- State for Modals ---
    const [isBookingModalVisible, setIsBookingModalVisible] = useState(false);
    const [isConfirmationModalVisible, setIsConfirmationModalVisible] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [pendingAppointment, setPendingAppointment] = useState<AppointmentDetails | null>(null);

    // --- Handlers ---
    const handleBookAppointmentPress = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        setIsBookingModalVisible(true);
        setIsConfirmationModalVisible(false);
    };

    const handleBookingConfirmation = (details: Omit<AppointmentDetails, 'doctor'> & { doctor: Doctor }) => {
        // Set the details, adding the default 'Scheduled' status for confirmation
        setPendingAppointment({ ...details, status: 'Scheduled' } as AppointmentDetails); 
        setIsBookingModalVisible(false);
        setIsConfirmationModalVisible(true); 
    };

    const handleFinalSchedule = (details: AppointmentDetails) => {
        console.log("Appointment SCHEDULED & Backend Called:", details);
        
        // 🌟 FEATURE IMPLEMENTATION: Add new appointment to the list
        setAppointments(prevAppointments => [
            { ...details, status: 'Scheduled' }, // Ensure status is set
            ...prevAppointments
        ]);

        // 2. Clear state and close modals
        setPendingAppointment(null);
        setSelectedDoctor(null);
        setIsConfirmationModalVisible(false);
        
        Alert.alert("Success! 🎉", `Appointment successfully scheduled with Dr. ${details.doctor.name} on ${details.date} at ${details.time}.`);
    };

    // 🌟 LOGIC TO FILTER APPOINTMENTS
    const upcomingAppointments = appointments.filter(a => a.status === 'Scheduled');
    const pastAppointments = appointments.filter(a => a.status === 'Completed' || a.status === 'Cancelled');


    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Find a Pediatrician</Text>
                    <Text style={styles.headerSubtitle}>Locate and book appointments with pediatricians near you</Text>
                </View>
                
                {/* --- APPOINTMENTS LISTING --- */}
                <View style={mainStyles.listSection}>
                    <Text style={mainStyles.sectionTitle}>Upcoming Appointments</Text>
                    {upcomingAppointments.length > 0 ? (
                        upcomingAppointments.map((app, index) => (
                            <AppointmentCard key={`upcoming-${index}`} appointment={app} />
                        ))
                    ) : (
                        <Text style={mainStyles.emptyText}>No upcoming appointments scheduled.</Text>
                    )}

                    <View style={mainStyles.separator} />

                    <Text style={mainStyles.sectionTitle}>Past Visits</Text>
                    {pastAppointments.length > 0 ? (
                        pastAppointments.map((app, index) => (
                            <AppointmentCard key={`past-${index}`} appointment={app} />
                        ))
                    ) : (
                        <Text style={mainStyles.emptyText}>No past visits found.</Text>
                    )}

                    <View style={mainStyles.separator} />
                </View>


                {/* Doctor Search Header */}
                <Text style={styles.headerTitle}>Find & Book</Text>
                <Text style={styles.headerSubtitle}>Select a doctor to begin booking:</Text>

                {/* Doctor Listings */}
                <View style={styles.doctorGrid}>
                    {mockDoctors.map(doctor => (
                        <DoctorCard 
                            key={doctor.id} 
                            doctor={doctor} 
                            onBook={handleBookAppointmentPress} 
                        />
                    ))}
                </View>
            </ScrollView>

            {/* Modals */}
            {selectedDoctor && (
                <BookAppointmentModal
                    isVisible={isBookingModalVisible}
                    onClose={() => setIsBookingModalVisible(false)}
                    onBook={handleBookingConfirmation}
                    doctor={selectedDoctor}
                />
            )}

            {pendingAppointment && (
                <AppointmentConfirmationModal
                    isVisible={isConfirmationModalVisible}
                    onClose={() => setIsConfirmationModalVisible(false)}
                    onConfirm={handleFinalSchedule}
                    details={pendingAppointment}
                />
            )}
        </SafeAreaView>
    );
};

// =================================================================
// 4. Stylesheet (Combined)
// =================================================================

const mainStyles = StyleSheet.create({
    listSection: {
        marginBottom: 20,
        paddingHorizontal: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginTop: 10,
        marginBottom: 10,
    },
    emptyText: {
        color: '#6B7280',
        fontSize: 14,
        textAlign: 'center',
        paddingVertical: 15,
        backgroundColor: '#E5E7EB',
        borderRadius: 8,
        marginBottom: 10,
    },
    separator: {
        height: 1,
        backgroundColor: '#D1D5DB',
        marginVertical: 15,
    }
});

const cardStyles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        borderLeftWidth: 4,
        borderLeftColor: '#4ECDC4',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    headerText: {
        fontSize: 14,
        fontWeight: '600',
    },
    doctorName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    detailText: {
        fontSize: 14,
        color: '#4B5563',
        marginLeft: 8,
    },
});

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F7F8FC',
    },
    scrollContainer: {
        padding: 16,
    },
    header: {
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    // Map Styles (Unchanged)
    mapPlaceholder: {
        height: 200,
        backgroundColor: '#E0E7FF', 
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        position: 'relative',
    },
    mapText: {
        color: '#4F46E5',
        fontSize: 16,
    },
    mapControls: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
    },
    mapControl: {
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    locationPin: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        padding: 8,
        backgroundColor: 'white',
        borderRadius: 9999,
        borderWidth: 1,
        borderColor: '#4F46E5',
    },
    // Doctor Card Styles (Unchanged)
    doctorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginHorizontal: -8, 
    },
    doctorCard: {
        width: (width - 48) / 2, 
        maxWidth: 250,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        marginHorizontal: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
    },
    doctorCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    doctorCardName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    doctorCardSpecialty: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 8,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 12,
        color: '#F59E0B',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 12,
        color: '#4B5563',
        marginLeft: 8,
    },
    infoTextEmail: {
        fontSize: 11,
        color: '#4F46E5',
        marginLeft: 8,
    },
    bookDoctorButton: {
        backgroundColor: '#4ECDC4', 
        padding: 10,
        borderRadius: 8,
        marginTop: 12,
        alignItems: 'center',
    },
    bookDoctorButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
    // --- General Modal Styles (Unchanged) ---
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)', 
    },
    modalView: {
        width: width * 0.9,
        maxWidth: 400,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 20,
    },
    closeButton: {
        padding: 8,
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 10,
    },
    // --- Booking Form Styles (Unchanged) ---
    formGroup: {
        marginBottom: 16,
    },
    formLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 6,
    },
    inputField: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 4,
        backgroundColor: '#F9FAFB',
    },
    inputText: {
        fontSize: 16,
        color: '#1F2937',
    },
    textInput: { 
        fontSize: 16,
        color: '#1F2937',
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: '#4ECDC4', 
        borderRadius: 8,
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
    pickerStyle: {
        height: 50,
        width: '100%',
        color: '#1F2937',
    },
    textareaContainer: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        backgroundColor: '#F9FAFB',
        padding: 8,
    },
    textarea: {
        minHeight: 80,
        fontSize: 15,
        textAlignVertical: 'top',
        color: '#1F2937',
    },
    textareaIcon: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        fontSize: 16,
        color: '#9CA3AF',
    },
    bookButton: {
        backgroundColor: '#4ECDC4',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    bookButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    // --- Confirmation Modal Styles (Unchanged) ---
    confirmCheckIcon: {
        color: '#10B981', 
        marginRight: 10,
    },
    doctorCardConfirm: {
        backgroundColor: '#F3F4F6',
        padding: 12,
        borderRadius: 10,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#4F46E5',
    },
    doctorTitleConfirm: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
    },
    doctorSpecialtyConfirm: {
        fontSize: 14,
        color: '#6B7280',
    },
    summaryContainer: {
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F9FAFB',
    },
    reasonRow: {
        alignItems: 'flex-start',
    },
    detailTextWrapper: {
        flex: 1,
        marginLeft: 4,
    },
    detailLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginTop: 2,
    },
    reasonValue: {
        fontSize: 15,
        color: '#4B5563',
        lineHeight: 22,
        marginTop: 2,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    confirmButton: {
        flex: 1,
        backgroundColor: '#10B981', 
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginLeft: 10,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    confirmButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    backButtonConfirm: {
        flex: 1,
        backgroundColor: '#E5E7EB',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginRight: 10,
    },
    backButtonText: {
        color: '#4B5563',
        fontWeight: '600',
        fontSize: 16,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8, 
    },
});

export default AppointmentScreen;