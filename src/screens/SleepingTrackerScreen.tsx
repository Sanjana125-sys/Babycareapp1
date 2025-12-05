import React, { useState } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    TouchableOpacity, 
    TextInput, 
    Alert, 
    Platform,
    Modal,
    StyleSheet, 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Baby, Moon, Sunrise, CheckCircle, XCircle } from 'lucide-react-native'; 
import RNDateTimePicker from '@react-native-community/datetimepicker';

// --- 1. Interfaces & Initial Data ---

interface SleepEntry {
    id: string;
    startTime: Date;
    endTime: Date;
    duration: number; // in minutes
    notes: string;
    quality: 'good' | 'fair' | 'poor';
}

const initialEntries: SleepEntry[] = [
    {
      id: '1',
      startTime: new Date(Date.now() - 3600000 * 4),
      endTime: new Date(Date.now() - 3600000 * 2),
      duration: 120,
      notes: 'Slept peacefully through the night',
      quality: 'good',
    },
    {
      id: '2',
      startTime: new Date(Date.now() - 3600000 * 7),
      endTime: new Date(Date.now() - 3600000 * 5.5),
      duration: 90,
      notes: 'Woke up once for feeding',
      quality: 'fair',
    },
];

initialEntries.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

// --- 2. Helper Functions ---

const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
        return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
};

// Returns a style object now
const getQualityStyles = (quality: string) => {
    switch (quality) {
      case 'good': return { 
          container: styles.goodBg, 
          border: styles.goodBorder, 
          color: '#10B981', // Green
          textColor: styles.goodText
      };
      case 'fair': return { 
          container: styles.fairBg, 
          border: styles.fairBorder, 
          color: '#F59E0B', // Amber
          textColor: styles.fairText
      };
      case 'poor': return { 
          container: styles.poorBg, 
          border: styles.poorBorder, 
          color: '#EF4444', // Red
          textColor: styles.poorText
      };
      default: return { 
          container: styles.defaultBg, 
          border: styles.defaultBorder, 
          color: '#D1D5DB', // Gray
          textColor: styles.defaultText
      };
    }
};

const getQualityIcon = (quality: string) => {
    return <Moon size={20} color={getQualityStyles(quality).color} />; 
};

const getQualityLabel = (quality: string) => {
    switch (quality) {
      case 'good': return 'Good';
      case 'fair': return 'Fair';
      case 'poor': return 'Poor';
      default: return '';
    }
};

// --- 3. Sleep Log Form Modal Component ---

interface SleepLogFormProps {
    isVisible: boolean;
    onClose: () => void;
    onSave: (entry: Omit<SleepEntry, 'id' | 'duration'>) => void;
}

const SleepLogForm: React.FC<SleepLogFormProps> = ({ isVisible, onClose, onSave }) => {
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [tempEntry, setTempEntry] = useState({
        startTime: new Date(Date.now() - 3600000), 
        endTime: new Date(),
        quality: 'good' as 'good' | 'fair' | 'poor',
        notes: '',
    });

    React.useEffect(() => {
        if (isVisible) {
            setTempEntry({
                startTime: new Date(Date.now() - 3600000), 
                endTime: new Date(),
                quality: 'good',
                notes: '',
            });
            setShowStartPicker(false);
            setShowEndPicker(false);
        }
    }, [isVisible]);


    const handleSave = () => {
        if (tempEntry.startTime >= tempEntry.endTime) {
            Alert.alert('Error', 'End time must be after start time.');
            return;
        }

        onSave(tempEntry);
        onClose();
    };

    const onChangeTime = (setter: 'startTime' | 'endTime', event: any, selectedDate: Date | undefined) => {
        if (Platform.OS === 'android') {
            setter === 'startTime' ? setShowStartPicker(false) : setShowEndPicker(false);
        }
        
        if (selectedDate) {
            setTempEntry(prev => ({...prev, [setter]: selectedDate}));
        }
    };


    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Log Sleep Session</Text>
                        <TouchableOpacity onPress={onClose} style={styles.p1}>
                            <XCircle size={24} color="#EF4444" />
                        </TouchableOpacity>
                    </View>

                    {/* Start Time Picker */}
                    <Text style={styles.label}>Start Time (Fell Asleep)</Text>
                    <TouchableOpacity
                        style={styles.timePickerButton}
                        onPress={() => setShowStartPicker(true)}
                    >
                        <View style={styles.row}>
                            <Moon size={20} color="#4A90E2" />
                            <Text style={styles.timeText}>{formatTime(tempEntry.startTime)}</Text>
                        </View>
                        <Text style={styles.dateText}>{formatDate(tempEntry.startTime)}</Text>
                    </TouchableOpacity>

                    {showStartPicker && (
                        <RNDateTimePicker
                            value={tempEntry.startTime}
                            mode="datetime"
                            display="default"
                            onChange={(event, date) => onChangeTime('startTime', event, date)}
                        />
                    )}

                    {/* End Time Picker */}
                    <Text style={[styles.label, styles.mt4]}>End Time (Woke Up)</Text>
                    <TouchableOpacity
                        style={styles.timePickerButton}
                        onPress={() => setShowEndPicker(true)}
                    >
                        <View style={styles.row}>
                            <Sunrise size={20} color="#4A90E2" />
                            <Text style={styles.timeText}>{formatTime(tempEntry.endTime)}</Text>
                        </View>
                        <Text style={styles.dateText}>{formatDate(tempEntry.endTime)}</Text>
                    </TouchableOpacity>

                    {showEndPicker && (
                        <RNDateTimePicker
                            value={tempEntry.endTime}
                            mode="datetime"
                            display="default"
                            onChange={(event, date) => onChangeTime('endTime', event, date)}
                        />
                    )}
                    
                    {/* Quality Selection */}
                    <Text style={[styles.label, styles.mt4]}>Sleep Quality</Text>
                    <View style={styles.qualityContainer}>
                        {(['good', 'fair', 'poor'] as const).map((quality) => {
                            const qualityStyles = getQualityStyles(quality);
                            const isSelected = tempEntry.quality === quality;
                            
                            return (
                                <TouchableOpacity
                                    key={quality}
                                    style={[
                                        styles.qualityButton,
                                        isSelected ? qualityStyles.container : styles.grayBg,
                                        isSelected ? qualityStyles.border : styles.grayBorder,
                                        { borderWidth: 2 }
                                    ]}
                                    onPress={() => setTempEntry(prev => ({...prev, quality}))}
                                >
                                    <View style={styles.rowCentered}>
                                        {getQualityIcon(quality)}
                                        <Text style={[styles.qualityText, isSelected ? styles.textGray800 : styles.textGray600]}>
                                            {getQualityLabel(quality)}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                    
                    {/* Notes */}
                    <Text style={styles.label}>Notes (Optional)</Text>
                    <TextInput
                        style={styles.notesInput}
                        placeholder="E.g., short nap, restless sleep, woke up crying."
                        multiline
                        value={tempEntry.notes}
                        onChangeText={(text) => setTempEntry(prev => ({...prev, notes: text}))}
                    />
                    
                    {/* Save Button */}
                    <TouchableOpacity 
                        style={styles.saveButton}
                        onPress={handleSave}
                    >
                        <CheckCircle size={20} color="white" />
                        <Text style={styles.saveButtonText}>Log Session ({formatDuration((tempEntry.endTime.getTime() - tempEntry.startTime.getTime()) / 60000)})</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};


// --- 4. Main Sleeping Tracker Screen Component ---

const SleepingTrackerScreen = () => {
    const router = useRouter();
    const [entries, setEntries] = useState<SleepEntry[]>(initialEntries);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleNewEntrySave = (data: Omit<SleepEntry, 'id' | 'duration'>) => {
        const durationMs = data.endTime.getTime() - data.startTime.getTime();
        const durationMinutes = Math.round(durationMs / 60000);

        if (durationMinutes <= 0) {
            Alert.alert('Error', 'Invalid sleep duration. Check your start and end times.');
            return;
        }

        const entry: SleepEntry = {
            ...data,
            id: Date.now().toString(),
            duration: durationMinutes,
        };

        const updatedEntries = [entry, ...entries];
        updatedEntries.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
        setEntries(updatedEntries);
        
        Alert.alert('Success', `Sleep of ${formatDuration(durationMinutes)} logged successfully!`);
    };

    const getTotalSleepToday = () => {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
        
        const todayEntries = entries.filter(entry => entry.startTime >= startOfDay);
        
        return todayEntries.reduce((total, entry) => total + entry.duration, 0);
    };

    return (
        <View style={styles.flex1}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.p1}>
                        <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.screenTitle}>Sleeping Tracker</Text>
                    <View style={styles.spacer} />
                </View>
            </View>

            <ScrollView style={styles.scrollViewContent}>
                {/* Stats Summary */}
                <View style={styles.statsCard}>
                    <View style={styles.statsHeader}>
                        <Text style={styles.cardTitle}>Today's Sleep</Text>
                        <Moon size={20} color="#4A90E2" />
                    </View>
                    
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValueBlue}>{formatDuration(getTotalSleepToday())}</Text>
                            <Text style={styles.statLabel}>Total Today</Text>
                        </View>
                        
                        <View style={styles.statItem}>
                            <Text style={styles.statValueGreen}>{entries.filter(e => e.quality === 'good').length}</Text>
                            <Text style={styles.statLabel}>Good Quality</Text>
                        </View>
                        
                        <View style={styles.statItem}>
                            <Text style={styles.statValueDefault}>{entries.length}</Text>
                            <Text style={styles.statLabel}>Total Sessions</Text>
                        </View>
                    </View>
                </View>

                {/* Recent Entries */}
                <View style={styles.recentEntriesContainer}>
                    <View style={styles.statsHeader}>
                        <Text style={styles.cardTitle}>Recent Sessions</Text>
                        <Baby size={20} color="#4A90E2" />
                    </View>
                    
                    {entries.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Text style={styles.textGray500}>No sleep sessions recorded yet. Tap '+' to start!</Text>
                        </View>
                    ) : (
                        <View style={styles.spaceY3}>
                            {entries.map((entry) => {
                                const borderStyle = getQualityStyles(entry.quality).border;
                                return (
                                    <View 
                                        key={entry.id} 
                                        style={[styles.entryCard, borderStyle]}
                                    >
                                        <View style={styles.entryHeader}>
                                            <View style={styles.rowCentered}>
                                                {getQualityIcon(entry.quality)}
                                                <Text style={styles.entryQualityText}>{getQualityLabel(entry.quality)} Sleep</Text>
                                            </View>
                                            <Text style={styles.entryDate}>{formatDate(entry.startTime)}</Text>
                                        </View>
                                        
                                        <View style={styles.entryTimeRow}>
                                            <Text style={styles.textGray600}>
                                                <Text style={styles.fontBold}>{formatTime(entry.startTime)}</Text> - <Text style={styles.fontBold}>{formatTime(entry.endTime)}</Text>
                                            </Text>
                                            <Text style={styles.entryDuration}>
                                                {formatDuration(entry.duration)}
                                            </Text>
                                        </View>
                                        
                                        {entry.notes ? (
                                            <View style={styles.entryNotesContainer}>
                                                <Text style={styles.entryNotesText}>Notes: "{entry.notes}"</Text>
                                            </View>
                                        ) : null}
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </View>
            </ScrollView>
            
            {/* Floating Action Button - Opens Modal */}
            <TouchableOpacity 
                style={styles.fab}
                onPress={() => setIsModalVisible(true)}
            >
                <Plus size={24} color="white" />
            </TouchableOpacity>

            {/* Sleep Log Modal */}
            <SleepLogForm
                isVisible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onSave={handleNewEntrySave}
            />
        </View>
    );
};

// --- 5. StyleSheet Definition ---

const styles = StyleSheet.create({
    // Utility Styles
    flex1: { flex: 1, backgroundColor: '#f9fafb' }, // bg-gray-50
    p1: { padding: 4 },
    row: { flexDirection: 'row', alignItems: 'center' },
    rowCentered: { flexDirection: 'row', alignItems: 'center' },
    mt4: { marginTop: 16 }, // mb-4
    mb2: { marginBottom: 8 },
    mb3: { marginBottom: 12 },
    mb4: { marginBottom: 16 },
    mt5: { marginTop: 20 },
    
    // Header Styles
    header: { 
        backgroundColor: 'white', 
        paddingTop: 48, // pt-12
        paddingBottom: 16, // pb-4
        paddingHorizontal: 16, // px-4
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2, // shadow-sm
    },
    headerRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
    },
    backButtonText: { 
        color: '#3b82f6', // text-blue-500
        fontWeight: '500', // font-medium
        fontSize: 18 // text-lg
    },
    screenTitle: { 
        fontSize: 20, // text-xl
        fontWeight: 'bold', // font-bold
        color: '#1f2937' // text-gray-800
    },
    spacer: { width: 40 }, // w-10

    // ScrollView Content
    scrollViewContent: { 
        flex: 1, 
        paddingHorizontal: 16, // px-4
        paddingVertical: 16 // py-4
    },

    // Stats Card
    statsCard: { 
        backgroundColor: 'white', 
        borderRadius: 12, // rounded-xl
        padding: 16, // p-4
        marginBottom: 16, // mb-4
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 3, // shadow-md
    },
    statsHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 12 // mb-3
    },
    cardTitle: { 
        fontSize: 18, // text-lg
        fontWeight: 'bold', 
        color: '#1f2937' // text-gray-800
    },
    statsRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-around' 
    },
    statItem: { alignItems: 'center' },
    statValueBlue: { 
        fontSize: 24, // text-2xl
        fontWeight: 'bold', 
        color: '#3b82f6' // text-blue-500
    },
    statValueGreen: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        color: '#10b981' // text-green-500
    },
    statValueDefault: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        color: '#1f2937' // text-gray-800
    },
    statLabel: { 
        color: '#4b5563' // text-gray-600
    },
    
    // Recent Entries
    recentEntriesContainer: { 
        marginBottom: 80 // mb-20 to account for FAB
    },
    emptyCard: { 
        backgroundColor: 'white', 
        borderRadius: 12, 
        padding: 24, // p-6
        alignItems: 'center', 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 3, // shadow-md
    },
    textGray500: { color: '#6b7280' },
    spaceY3: { gap: 12 }, // space-y-3

    // Entry Card
    entryCard: { 
        backgroundColor: 'white', 
        borderRadius: 12, 
        padding: 16, // p-4
        borderLeftWidth: 4, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2, // shadow-sm
    },
    entryHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start' 
    },
    entryQualityText: { 
        marginLeft: 8, 
        fontWeight: 'bold', 
        color: '#1f2937' 
    },
    entryDate: { 
        color: '#6b7280', 
        fontSize: 14 // text-sm
    },
    entryTimeRow: { 
        flexDirection: 'row', 
        marginTop: 8, 
        alignItems: 'center', 
        justifyContent: 'space-between' 
    },
    // Keep the first definition of textGray600 for use in components
    textGray600: { color: '#4b5563' }, 
    fontBold: { fontWeight: 'bold' },
    entryDuration: { 
        fontWeight: 'bold', 
        color: '#2563eb', // text-blue-600
        fontSize: 18 // text-lg
    },
    entryNotesContainer: { 
        marginTop: 8, 
        paddingTop: 8, 
        borderTopWidth: 1, 
        borderTopColor: '#f3f4f6' // border-gray-100
    },
    entryNotesText: { 
        color: '#4b5563', 
        fontStyle: 'italic', 
        fontSize: 14 // text-sm
    },

    // Quality Colors (for borders and backgrounds)
    goodBg: { backgroundColor: '#d1fae5' }, // bg-green-100
    goodBorder: { borderColor: '#10b981' }, // border-green-500
    fairBg: { backgroundColor: '#fef3c7' }, // bg-yellow-100
    fairBorder: { borderColor: '#f59e0b' }, // border-yellow-500
    poorBg: { backgroundColor: '#fee2e2' }, // bg-red-100
    poorBorder: { borderColor: '#ef4444' }, // border-red-500
    grayBg: { backgroundColor: '#f3f4f6' }, // bg-gray-100
    grayBorder: { borderColor: '#e5e7eb' }, // border-gray-200
    
    // Fixed/Quality Text Styles
    goodText: { color: '#10B981' }, 
    fairText: { color: '#F59E0B' }, 
    poorText: { color: '#EF4444' }, 
    defaultBg: { backgroundColor: '#ffffff' }, 
    defaultBorder: { borderColor: '#d1d5db' }, 
    defaultText: { color: '#6b7280' }, 

    textGray800: { color: '#1f2937' }, // Keep this definition

    // FAB (Floating Action Button)
    fab: {
        position: 'absolute',
        bottom: 24, 
        right: 24, 
        backgroundColor: '#3b82f6', 
        borderRadius: 9999, 
        width: 56, 
        height: 56, 
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8, 
    },
    
    // Modal Styles
    modalOverlay: { 
        flex: 1, 
        justifyContent: 'flex-end', 
        backgroundColor: 'rgba(0, 0, 0, 0.5)' 
    },
    modalContent: { 
        backgroundColor: 'white', 
        borderTopLeftRadius: 16, 
        borderTopRightRadius: 16,
        padding: 20, 
        width: '100%' 
    },
    modalHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 20 
    },
    modalTitle: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        color: '#1f2937' 
    },

    // Time Pickers
    label: { 
        fontWeight: '500', 
        color: '#4b5563', // text-gray-700
        marginTop: 8, 
        marginBottom: 8 
    },
    timePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16, 
        backgroundColor: '#f3f4f6', 
        borderRadius: 8, 
        borderWidth: 1,
        borderColor: '#e5e7eb' 
    },
    timeText: { 
        marginLeft: 12, 
        color: '#1f2937', 
        fontWeight: 'bold' 
    },
    dateText: { 
        color: '#6b7280' 
    },

    // Quality Selection
    qualityContainer: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginBottom: 16 
    },
    qualityButton: {
        flex: 1, 
        alignItems: 'center', 
        paddingVertical: 12, 
        marginHorizontal: 4, 
        borderRadius: 8, 
        borderColor: '#e5e7eb',
    },
    qualityText: { 
        marginLeft: 4, 
        fontWeight: '500', 
    },

    // Notes Input
    notesInput: {
        borderWidth: 1, 
        borderColor: '#d1d5db', 
        borderRadius: 8, 
        padding: 12, 
        height: 80, 
        backgroundColor: 'white',
        textAlignVertical: 'top'
    },

    // Save Button
    saveButton: {
        backgroundColor: '#3b82f6', 
        borderRadius: 8, 
        paddingVertical: 16, 
        alignItems: 'center',
        marginTop: 20, 
        flexDirection: 'row',
        justifyContent: 'center',
    },
    saveButtonText: {
        color: 'white', 
        fontWeight: 'bold', 
        fontSize: 18, 
        marginLeft: 8 
    }
});

export default SleepingTrackerScreen;