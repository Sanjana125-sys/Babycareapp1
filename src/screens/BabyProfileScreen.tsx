import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    ActivityIndicator, 
    Alert, 
    ScrollView, 
    Platform, 
    Image,
    Dimensions
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FontAwesome5 } from '@expo/vector-icons';
import { ArrowLeft } from 'lucide-react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import * as ImagePicker from 'expo-image-picker'; 
import { Picker } from '@react-native-picker/picker'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 

const { width } = Dimensions.get('window');

// --- CONSTANTS for AsyncStorage ---
const BABY_PROFILE_KEY = 'BABY_PROFILE_DATA';

// --- Type Definitions ---
interface Baby {
    id: string;
    name: string;
    date_of_birth: string;
    gender: string | null;
    photo_uri: string | null;
    birth_weight: number | null;
    birth_height: number | null;
    birth_head_circumference: number | null;
}

// Define an initial empty state
const initialBabyState: Baby = {
    id: 'mock-1',
    name: '',
    date_of_birth: '',
    gender: null,
    photo_uri: null,
    birth_weight: null,
    birth_height: null,
    birth_head_circumference: null,
};

type RootStackParamList = {
    Dashboard: undefined;
    BabyProfile: undefined;
};

type BabyProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'BabyProfile'>;

interface Props {
    navigation: BabyProfileScreenNavigationProp;
}

// --- Gender Picker Component ---
const GenderPicker: React.FC<{ value: string | null, onValueChange: (v: string) => void }> = ({ value, onValueChange }) => {
    const genders = ['Male', 'Female', 'Other', 'Prefer Not To Say'];

    return (
        <View style={inputStyles.pickerContainer}>
            <Picker
                selectedValue={value || 'Select Gender'}
                onValueChange={(itemValue) => onValueChange(itemValue)}
                style={inputStyles.pickerStyle}
                itemStyle={inputStyles.pickerItemStyle}
            >
                <Picker.Item label="Select Gender" value="" enabled={false} style={{ color: '#9CA3AF' }} />
                {genders.map((g) => (
                    <Picker.Item key={g} label={g} value={g} />
                ))}
            </Picker>
        </View>
    );
};


// =================================================================
// MAIN COMPONENT
// =================================================================

const BabyProfileScreen: React.FC<Props> = ({ navigation }) => {
    
    // Use the main baby state as the single source of truth
    const [baby, setBaby] = useState<Baby>(initialBabyState); 
    const [loading, setLoading] = useState(false);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false); 

    // 1. LOAD DATA ON MOUNT
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem(BABY_PROFILE_KEY);
                if (jsonValue != null) {
                    const loadedData: Baby = JSON.parse(jsonValue);
                    setBaby(loadedData);
                }
            } catch (e) {
                console.error("Failed to load baby profile from storage:", e);
                Alert.alert("Error", "Failed to load profile data.");
            } finally {
                setDataLoaded(true);
            }
        };
        loadProfile();
    }, []);


    // --- Helper functions to update baby state ---

    const updateBabyField = (field: keyof Baby, value: any) => {
        setBaby(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    // Date Picker Handlers
    const showDatePicker = () => setDatePickerVisibility(true);
    const hideDatePicker = () => setDatePickerVisibility(false);
    
    // 🌟 CORRECTED: Updates the main baby state's date_of_birth field
    const handleConfirmDOB = (date: Date) => {
        const formattedDate = date.toISOString().split('T')[0];
        updateBabyField('date_of_birth', formattedDate); 
        hideDatePicker();
    };

    // Photo Upload Handler 
    const handlePhotoUpload = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission denied', 'Sorry, we need media library permissions to upload a photo.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, 
            aspect: [1, 1], 
            quality: 0.7,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            updateBabyField('photo_uri', result.assets[0].uri);
        }
    };

    // Submission Handler (unchanged)
    const handleSubmit = async () => {
        if (!baby.name || !baby.date_of_birth) {
            Alert.alert("Required Fields", "Please fill in the Baby's Name and Date of Birth.");
            return;
        }

        setLoading(true);
        
        // Ensure metric fields are correctly parsed as numbers or null
        const finalBabyData: Baby = {
            ...baby,
            birth_weight: baby.birth_weight ? parseFloat(baby.birth_weight.toString()) : null,
            birth_height: baby.birth_height ? parseFloat(baby.birth_height.toString()) : null,
            birth_head_circumference: baby.birth_head_circumference ? parseFloat(baby.birth_head_circumference.toString()) : null,
        };
        
        try {
            const jsonValue = JSON.stringify(finalBabyData);
            await AsyncStorage.setItem(BABY_PROFILE_KEY, jsonValue);
            
            Alert.alert("Success ", "Baby profile saved successfully! (Data is persistent)");
        } catch (e) {
            console.error("Failed to save baby profile to storage:", e);
            Alert.alert("Error", "Failed to save profile data.");
        } finally {
            setLoading(false);
        }
    };

    // Function to format YYYY-MM-DD to DD-MM-YYYY for display
    const formatDateForDisplay = (isoDate: string) => {
        if (!isoDate) return 'Select Date of Birth';
        const parts = isoDate.split('-');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return isoDate;
    };

    if (!dataLoaded) {
        return (
            <View style={[styles.mainContainer, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ marginTop: 10, color: colors.label }}>Loading Profile...</Text>
            </View>
        );
    }


    return (
        <View style={styles.mainContainer}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#374151" /> 
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Baby Profile</Text>
            </View>

            {/* Main Content */}
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Baby Information</Text>
                    <Text style={styles.cardDescription}>Add or update your baby's details</Text>
                    
                    <View style={styles.formSpace}>
                        {/* Photo Upload Section */}
                        <View style={styles.photoContainer}>
                            <View style={styles.photoPlaceholder}>
                                {baby.photo_uri ? (
                                    <Image source={{ uri: baby.photo_uri }} style={styles.profileImage} />
                                ) : (
                                    <FontAwesome5 name="baby" size={64} color="#6A0DAD" />
                                )}
                            </View>
                            <TouchableOpacity onPress={handlePhotoUpload} style={inputStyles.uploadButton}>
                                <FontAwesome5 name="camera" size={14} color="#FFF" style={{marginRight: 8}} />
                                <Text style={inputStyles.uploadButtonText}>Upload Photo</Text>
                            </TouchableOpacity>
                            {baby.photo_uri && (
                                <TouchableOpacity onPress={() => updateBabyField('photo_uri', null)} style={inputStyles.removePhotoButton}>
                                    <FontAwesome5 name="times-circle" size={16} color="#EF4444" />
                                    <Text style={inputStyles.removeButtonText}>Remove Photo</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Name Input */}
                        <View style={inputStyles.inputGroup}>
                            <Text style={inputStyles.label}>Baby's Name *</Text>
                            <TextInput
                                style={inputStyles.input}
                                // 🌟 Use baby.name directly
                                value={baby.name}
                                // 🌟 Update baby.name directly
                                onChangeText={(text) => updateBabyField('name', text)}
                                placeholder="Enter baby's full name"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        {/* Date of Birth Input */}
                        <View style={inputStyles.inputGroup}>
                            <Text style={inputStyles.label}>Date of Birth *</Text>
                            <TouchableOpacity onPress={showDatePicker} style={inputStyles.dateInput}>
                                <Text style={{color: baby.date_of_birth ? colors.text : '#9CA3AF'}}>
                                    {/* 🌟 Use baby.date_of_birth directly */}
                                    {formatDateForDisplay(baby.date_of_birth)}
                                </Text>
                                <FontAwesome5 name="calendar-alt" size={18} color={colors.primary} />
                            </TouchableOpacity>
                            <DateTimePickerModal
                                isVisible={isDatePickerVisible}
                                mode="date"
                                onConfirm={handleConfirmDOB}
                                onCancel={hideDatePicker}
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            />
                        </View>

                        {/* Gender Picker */}
                        <View style={inputStyles.inputGroup}>
                            <Text style={inputStyles.label}>Gender</Text>
                            <GenderPicker 
                                value={baby.gender} 
                                onValueChange={(value) => updateBabyField('gender', value)} 
                            />
                        </View>
                        
                        {/* Birth Metrics Row */}
                        <Text style={[inputStyles.label, {marginTop: 10}]}>Birth Metrics (Optional)</Text>
                        <View style={inputStyles.multiInputRow}>
                            {/* Birth Weight */}
                            <View style={inputStyles.halfInput}>
                                <Text style={inputStyles.tinyLabel}>Weight (kg)</Text>
                                <TextInput
                                    style={inputStyles.inputSmall}
                                    value={baby.birth_weight?.toString() || ''} // Handle null safely
                                    onChangeText={(text) => updateBabyField('birth_weight', text)}
                                    keyboardType="numeric"
                                    placeholder="0.0"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                            
                            {/* Birth Height */}
                            <View style={inputStyles.halfInput}>
                                <Text style={inputStyles.tinyLabel}>Height (cm)</Text>
                                <TextInput
                                    style={inputStyles.inputSmall}
                                    value={baby.birth_height?.toString() || ''}
                                    onChangeText={(text) => updateBabyField('birth_height', text)}
                                    keyboardType="numeric"
                                    placeholder="0.0"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                        </View>
                        
                        {/* Head Circumference */}
                        <View style={inputStyles.inputGroup}>
                            <Text style={inputStyles.label}>Head Circumference (cm)</Text>
                            <TextInput
                                style={inputStyles.input}
                                value={baby.birth_head_circumference?.toString() || ''}
                                onChangeText={(text) => updateBabyField('birth_head_circumference', text)}
                                keyboardType="numeric"
                                placeholder="0.0"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>


                        {/* Submit Button */}
                        <TouchableOpacity style={inputStyles.submitButton} onPress={handleSubmit} disabled={loading}>
                            <Text style={inputStyles.submitButtonText}>
                                {loading ? <ActivityIndicator color="#fff" /> : "Save & Update Profile"}
                            </Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

// =================================================================
// STYLESHEETS (Unchanged from previous response)
// =================================================================

const colors = {
    primary: '#4ECDC4', 
    secondary: '#6A0DAD', 
    background: '#F7F8FC',
    text: '#374151',
    label: '#6B7280',
    border: '#D1D5DB',
    lightBackground: '#F9FAFB',
    error: '#EF4444',
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: Platform.OS === 'android' ? 30 : 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
    },
    scrollContent: {
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 5,
        padding: 24,
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },
    cardDescription: {
        fontSize: 14,
        color: colors.label,
        marginBottom: 20,
    },
    formSpace: {
        // Space management
    },
    photoContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    photoPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.lightBackground,
        borderWidth: 2,
        borderColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        overflow: 'hidden',
    },
    profileImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
});

const inputStyles = StyleSheet.create({
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: colors.text,
    },
    tinyLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: colors.label,
        marginBottom: 5,
    },
    input: {
        backgroundColor: colors.lightBackground,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
        color: colors.text,
        minHeight: 48,
    },
    dateInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.lightBackground,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 12,
        borderRadius: 8,
        minHeight: 48,
    },
    multiInputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    halfInput: {
        width: '48%',
    },
    inputSmall: {
        backgroundColor: colors.lightBackground,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
        color: colors.text,
        minHeight: 48,
    },
    pickerContainer: {
        backgroundColor: colors.lightBackground,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        overflow: 'hidden',
    },
    pickerStyle: {
        height: 48,
        width: '100%',
    },
    pickerItemStyle: {
        color: colors.text,
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    uploadButtonText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: 'bold',
    },
    removePhotoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        padding: 5,
    },
    removeButtonText: {
        color: colors.error,
        marginLeft: 5,
        fontSize: 13,
        fontWeight: '600',
    },
    submitButton: {
        backgroundColor: colors.primary,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 10,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 10,
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default BabyProfileScreen;