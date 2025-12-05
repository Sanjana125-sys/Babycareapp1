import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, SafeAreaView, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';

// Define RootStackParamList for TypeScript navigation safety
type RootStackParamList = {
    Dashboard: undefined;
    BabyProfile: undefined;
    FeedingTracker: undefined;
    GrowthTracker: undefined; 
    VaccinationTracker: undefined;
    CryAnalyzer: undefined;
    ClothingGuide: undefined;
    MedicationTracker: undefined;
    PediatricianMap: undefined;
    'Parental Guide': undefined; 
    'Lullabies & Stories': undefined;
    'My Appointments': undefined; // Assuming 'AppointmentScreen' is registered as 'My Appointments'
    MemoryBookScreen: undefined;
    SmartReminders: undefined;
    MilestoneScreen: undefined;
    BabyTracker: undefined;
    TelehealthConsultation: undefined;
};

// Define the type for the navigation prop
type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

interface Props {
    navigation: DashboardScreenNavigationProp;
}

interface DashboardItem {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
}

const dashboardItems: DashboardItem[] = [
    { id: '0', title: 'Baby Profile', description: "Manage your baby's information", icon: 'child', color: '#6a0dad' },
    { id: '1', title: 'Vaccinations', description: 'Track vaccination schedule', icon: 'syringe', color: '#ff7e5f' },
    { id: '2', title: 'Memory Book', description: 'Save precious moments', icon: 'camera', color: '#feb47b' },
    { id: '3', title: 'Cry Analyzer', description: 'AI-powered cry analysis', icon: 'microphone', color: '#ffc77e' },
    { id: '4', title: 'Lullabies & Stories', description: 'Soothing sounds for your baby', icon: 'music', color: '#b99aff' },
    { id: '5', title: 'Pediatricians', description: 'Find nearby pediatricians', icon: 'stethoscope', color: '#97d5c9' },
    { id: '6', title: 'My Appointments', description: 'View and manage appointments', icon: 'calendar-alt', color: '#f79483' },
    { id: '7', title: 'Feeding Tracker', description: 'Track feeding times and amounts', icon: 'utensils', color: '#a1c4fd' }, // Updated icon for better fit
    { id: '8', title: 'Clothing Guide', description: 'Seasonal outfits and size charts', icon: 'tshirt', color: '#c2e0f4' },
    { id: '9', title: 'Medication Tracker', description: 'Manage medicines with dosage schedules', icon: 'pills', color: '#ff9a9e' },
    { id: '10', title: 'Growth Tracker', description: 'Monitor height, weight, and BMI progress', icon: 'chart-line', color: '#4CAF50' },
    { id: '11', title: 'Parental Guide', description: 'Essential baby care techniques', icon: 'book-open', color: '#90dffe' },
    { id: '12', title: 'Baby Tracker', description: 'Monitor your baby’s activities patterns', icon: 'bed', color: '#fbc2eb' },
    { id: '13', title: 'Telehealth Consultation ', description: 'Connect with pediatrician specialists', icon: 'video', color: '#a18cd1' },
    { id: '14', title: 'Smart Reminders', description: 'Reminders to help out the parents', icon: 'bell', color: '#667eea' },
    { id: '15', title: 'Milestone Screen', description: 'Enhance the journey milestones of baby', icon: 'chart-bar', color: '#f7971e' },
];

// --- 🌟 NEW HEADER COMPONENT ---
const CustomHeader: React.FC<{ navigation: DashboardScreenNavigationProp }> = ({ navigation }) => (
    <View style={headerStyles.headerContainer}>
        <View style={headerStyles.logoContainer}>
            <FontAwesome5 name="baby" size={20} color="#6a0dad" />
            <Text style={headerStyles.logoText}>Baby Care</Text>
        </View>
        <TouchableOpacity 
            style={headerStyles.profileIcon}
            onPress={() => navigation.navigate('BabyProfile')}
        >
            {/* Using a general user/profile icon for the navigation button */}
            <FontAwesome5 name="user-circle" size={24} color="#333" /> 
        </TouchableOpacity>
    </View>
);
// --- END NEW HEADER COMPONENT ---

const DashboardScreen: React.FC<Props> = ({ navigation }) => {

    const renderItem = ({ item }: { item: DashboardItem }) => (
        <TouchableOpacity 
            style={[styles.card, {borderColor: item.color}]} 
            onPress={() => {
                // Navigate based on item ID
                switch (item.id) {
                    case '0':
                        navigation.navigate('BabyProfile');
                        break;
                    case '7':
                        navigation.navigate('FeedingTracker');
                        break;
                    case '10':
                        navigation.navigate('GrowthTracker' as never);
                        break;
                    case '1':
                        navigation.navigate('VaccinationTracker' as never);
                        break;
                    case '3':
                        navigation.navigate('CryAnalyzer' as never);
                        break;
                    case '8':
                        navigation.navigate('ClothingGuide' as never);
                        break;
                    case '9':
                        navigation.navigate('MedicationTracker' as never);
                        break;
                    case '5':
                        navigation.navigate('PediatricianMap' as never);
                        break;
                    case '11':
                        navigation.navigate('Parental Guide' as never);
                        break;
                    case '4':
                        navigation.navigate('Lullabies & Stories' as never);
                        break;
                    case '6':
                        navigation.navigate('AppointmentScreen' as never); // Navigate to My Appointments screen
                        break;
                    case '2':
                        navigation.navigate('Memory Book' as never); 
                        break;
                    case '12':
                        navigation.navigate('Baby Tracker' as never); 
                        break;
                    case '13':
                        navigation.navigate('Telehealth Consultation' as never); 
                        break;
                    case '14':
                        navigation.navigate('Smart Reminders' as never); 
                        break;
                    case '15':
                        navigation.navigate('MilestoneScreen' as never); 
                        break;
                    default:
                        Alert.alert(item.title, `You clicked on ${item.title}`);
                        break;
                }
            }}
        >
            <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                <FontAwesome5 name={item.icon} size={24} color={item.color} />
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>
        </TouchableOpacity>
    );
    

    return (
        <SafeAreaView style={styles.container}>
            {/* 🌟 CUSTOM HEADER IMPLEMENTATION */}
            <CustomHeader navigation={navigation} /> 
            
            {/* Main Content Title */}
            <Text style={styles.contentTitle}>Welcome Back!</Text>
            <Text style={styles.contentSubtitle}>Everything you need to care for your little one</Text>
            
            <FlatList
                data={dashboardItems}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                numColumns={2} 
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.listContainer}
            />
        </SafeAreaView>
    );
};

// --- 🌟 NEW HEADER STYLES ---
const headerStyles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#6a0dad', // Baby Care color
        marginLeft: 8,
    },
    profileIcon: {
        padding: 4,
    },
});
// --- END NEW HEADER STYLES ---

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 0 : 0, // Removed extra padding as header handles it
        backgroundColor: '#fff',
    },
    // Updated these styles to differentiate from the header
    contentTitle: { 
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
        marginHorizontal: 16,
        color: '#333',
        textAlign: 'center', // Center text like the screenshot
    },
    contentSubtitle: { // Updated these styles
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
        marginHorizontal: 16,
        textAlign: 'center', // Center text like the screenshot
    },
    listContainer: {
        paddingHorizontal: 8, 
    },
    row: {
        flex: 1,
        justifyContent: 'space-around',
    },
    card: {
        flex: 1,
        margin: 8,
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3, 
        minHeight: 150,
        justifyContent: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    cardDescription: {
        fontSize: 12,
        color: '#666',
    },
});

export default DashboardScreen;