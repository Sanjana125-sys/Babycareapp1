import React, { useState } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    TouchableOpacity, 
    TextInput, 
    Alert, 
    Dimensions,
    StyleSheet, // 👈 Import StyleSheet
    Platform 
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
    Plus, 
    Calendar, 
    Baby, 
    Droplets, 
    Wind, 
    BarChart2,
    CheckCircle
} from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LineChart } from 'react-native-chart-kit'; // For the combined screen

// --- 1. Interfaces & Initial Data ---

interface DiaperEntry {
    id: string;
    timestamp: Date;
    type: 'wet' | 'solid' | 'mixed';
    notes: string;
}

const initialEntries: DiaperEntry[] = [
    // Today's entries
    {
        id: '1',
        timestamp: new Date(Date.now() - 3600000),
        type: 'wet',
        notes: 'Normal wet diaper',
    },
    {
        id: '2',
        timestamp: new Date(Date.now() - 7200000),
        type: 'solid',
        notes: 'Large bowel movement',
    },
    // Past entries (for chart)
    {
        id: '3',
        timestamp: new Date(Date.now() - 10800000 - (24 * 3600000)), // Yesterday
        type: 'mixed',
        notes: '',
    },
    {
        id: '4',
        timestamp: new Date(Date.now() - 86400000 - (48 * 3600000)), // 3 days ago
        type: 'wet',
        notes: 'Extra wet today',
    },
    {
        id: '5',
        timestamp: new Date(Date.now() - 172800000 - (72 * 3600000)), // 4 days ago
        type: 'solid',
        notes: 'Small amount',
    },
];

// Sort by latest timestamp
initialEntries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

// --- 2. Helper Functions ---

const screenWidth = Dimensions.get('window').width;

const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDateShort = (date: Date) => {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

// Returns a style object now
const getTypeStyles = (type: string) => {
    switch (type) {
        case 'wet': return { 
            bg: styles.wetBg, 
            border: styles.wetBorder, 
            color: '#4A90E2', // Blue
            text: styles.wetText 
        };
        case 'solid': return { 
            bg: styles.soiledBg, 
            border: styles.soiledBorder, 
            color: '#FF7F50', // Coral/Amber
            text: styles.soiledText 
        };
        case 'mixed': return { 
            bg: styles.mixedBg, 
            border: styles.mixedBorder, 
            color: '#8A2BE2', // Purple
            text: styles.mixedText 
        };
        default: return { 
            bg: styles.defaultBg, 
            border: styles.defaultBorder, 
            color: '#6b7280', // Gray
            text: styles.defaultText 
        };
    }
};

const getTypeIcon = (type: string) => {
    const color = getTypeStyles(type).color;

    switch (type) {
        case 'wet': return <Droplets size={20} color={color} />;
        case 'solid': return <Wind size={20} color={color} />;
        case 'mixed': return (
            <View style={styles.mixedIconRow}>
                <Droplets size={16} color="#4A90E2" />
                <Wind size={16} color="#FF7F50" />
            </View>
        );
        default: return null;
    }
};

const getTypeLabel = (type: string) => {
    switch (type) {
        case 'wet': return 'Wet';
        case 'solid': return 'Solid';
        case 'mixed': return 'Mixed';
        default: return '';
    }
};

// --- 3. Chart Data Processor ---

const getChartData = (entries: DiaperEntry[]) => {
    const days = [];
    const wetData = [];
    const soiledData = [];
    const today = new Date();
    
    // Iterate over the last 7 days (including today)
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        
        days.push(formatDateShort(date));
        
        const dayEntries = entries.filter(entry => {
            const entryDate = new Date(entry.timestamp);
            return entryDate.toDateString() === date.toDateString();
        });
        
        wetData.push(dayEntries.filter(e => e.type === 'wet' || e.type === 'mixed').length);
        soiledData.push(dayEntries.filter(e => e.type === 'solid' || e.type === 'mixed').length);
    }
    
    return {
        labels: days,
        datasets: [
            {
                data: wetData,
                color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`, // Blue
                strokeWidth: 2
            },
            {
                data: soiledData,
                color: (opacity = 1) => `rgba(255, 127, 80, ${opacity})`, // Coral
                strokeWidth: 2
            }
        ],
        legend: ['Wet Diapers', 'Solid Diapers']
    };
};

// --- 4. Main Component ---

const DiaperTrackerScreen = () => {
    const router = useRouter();
    const [entries, setEntries] = useState<DiaperEntry[]>(initialEntries);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [newEntry, setNewEntry] = useState({
        timestamp: new Date(),
        type: 'wet' as 'wet' | 'solid' | 'mixed',
        notes: '',
    });

    // --- Data Handlers ---

    const handleSaveEntry = () => {
        if (!newEntry.type) {
            Alert.alert('Error', 'Please select a diaper type');
            return;
        }

        const entry: DiaperEntry = {
            id: Date.now().toString(),
            timestamp: newEntry.timestamp,
            type: newEntry.type,
            notes: newEntry.notes,
        };

        // Add and sort
        const updatedEntries = [entry, ...entries];
        updatedEntries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setEntries(updatedEntries);

        // Reset form
        setNewEntry({
            timestamp: new Date(),
            type: 'wet',
            notes: '',
        });
        
        Alert.alert('Success', 'Diaper entry saved successfully!');
    };

    const onChangeTime = (event: any, selectedDate: Date | undefined) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        
        if (selectedDate) {
            setNewEntry(prev => ({...prev, timestamp: selectedDate}));
        }
    };

    // --- Calculated Stats ---

    const chartData = getChartData(entries);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayEntries = entries.filter(e => e.timestamp.toDateString() === today.toDateString());
    
    const todayWet = todayEntries.filter(e => e.type === 'wet').length;
    const todaySoiled = todayEntries.filter(e => e.type === 'solid').length;
    const todayMixed = todayEntries.filter(e => e.type === 'mixed').length;

    const totalWet = entries.filter(e => e.type === 'wet').length;
    const totalSoiled = entries.filter(e => e.type === 'solid').length;
    const totalMixed = entries.filter(e => e.type === 'mixed').length;
    
    const averagePerDay = (totalWet + totalSoiled + totalMixed) / 7;
    const formattedAverage = Math.round(averagePerDay * 10) / 10;


    return (
        <View style={styles.flex1}>
            

            <ScrollView style={styles.scrollViewContent}>
                
                {/* 1. Add New Entry Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Log New Diaper</Text>
                    
                    {/* Time Picker */}
                    <Text style={styles.inputLabel}>Time of Change</Text>
                    <TouchableOpacity 
                        style={styles.timePickerButton}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Calendar size={20} color="#4A90E2" />
                        <Text style={styles.timeText}>
                            {formatTime(newEntry.timestamp)} - {formatDateShort(newEntry.timestamp)}
                        </Text>
                    </TouchableOpacity>
                    
                    {showDatePicker && (
                        <DateTimePicker
                            value={newEntry.timestamp}
                            mode="time"
                            is24Hour={true}
                            onChange={onChangeTime}
                        />
                    )}
                    
                    {/* Diaper Type Selection */}
                    <Text style={styles.inputLabel}>Diaper Type</Text>
                    <View style={styles.typeSelectionContainer}>
                        {(['wet', 'solid', 'mixed'] as const).map((type) => {
                            const typeStyles = getTypeStyles(type);
                            const isSelected = newEntry.type === type;

                            return (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.typeButton,
                                        isSelected ? typeStyles.bg : styles.gray100Bg,
                                        { borderWidth: 2 },
                                        isSelected ? typeStyles.border : styles.gray200Border,
                                    ]}
                                    onPress={() => setNewEntry({...newEntry, type})}
                                >
                                    <View style={styles.rowCentered}>
                                        {getTypeIcon(type)}
                                        <Text style={[
                                            styles.typeButtonText,
                                            isSelected ? styles.textGray800 : styles.textGray600
                                        ]}>
                                            {getTypeLabel(type)}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                    
                    {/* Notes */}
                    <Text style={styles.inputLabel}>Notes</Text>
                    <TextInput
                        style={styles.notesInput}
                        placeholder="Consistency, amount, or any unusual observations..."
                        multiline
                        value={newEntry.notes}
                        onChangeText={(text) => setNewEntry({...newEntry, notes: text})}
                    />
                    
                    {/* Save Button */}
                    <TouchableOpacity 
                        style={styles.saveButton}
                        onPress={handleSaveEntry}
                    >
                        <CheckCircle size={20} color="white" />
                        <Text style={styles.saveButtonText}>Log Diaper</Text>
                    </TouchableOpacity>
                </View>

                {/* 2. Today's Summary */}
                <View style={styles.card}>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.cardTitle}>Today's Summary</Text>
                        <Calendar size={20} color="#4A90E2" />
                    </View>
                    
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValueBlue}>{todayWet}</Text>
                            <Text style={styles.statLabel}>Wet</Text>
                        </View>
                        
                        <View style={styles.statItem}>
                            <Text style={styles.statValueAmber}>{todaySoiled}</Text>
                            <Text style={styles.statLabel}>Solid</Text>
                        </View>
                        
                        <View style={styles.statItem}>
                            <Text style={styles.statValuePurple}>{todayMixed}</Text>
                            <Text style={styles.statLabel}>Mixed</Text>
                        </View>
                        
                        <View style={styles.statItem}>
                            <Text style={styles.statValueDefault}>{todayEntries.length}</Text>
                            <Text style={styles.statLabel}>Total</Text>
                        </View>
                    </View>
                </View>

                {/* 3. Weekly Overview Chart */}
                <View style={styles.card}>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.cardTitle}>Weekly Overview</Text>
                        <BarChart2 size={20} color="#4A90E2" />
                    </View>
                    
                    <View style={styles.chartContainer}>
                        <LineChart
                            data={chartData}
                            width={screenWidth - 48} // card padding (16*2) + screen padding (16*2) = 64. Use 48 for card padding consistency.
                            height={220}
                            chartConfig={chartConfig}
                            bezier
                            style={styles.chartStyle}
                        />
                    </View>
                </View>

                {/* 4. Total Statistics */}
                <View style={styles.card}>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.cardTitle}>All-Time Statistics</Text>
                        <Baby size={20} color="#4A90E2" />
                    </View>
                    
                    <View style={styles.statsRow}>
                        <StatCircle icon={<Droplets size={32} color="#4A90E2" />} count={totalWet} label="Wet" bgStyle={styles.wetBg} textStyle={styles.statValueBlue} />
                        <StatCircle icon={<Wind size={32} color="#FF7F50" />} count={totalSoiled} label="Solid" bgStyle={styles.soiledBg} textStyle={styles.statValueAmber} />
                        <StatCircle icon={<View style={styles.mixedIconRow}><Droplets size={20} color="#4A90E2" /><Wind size={20} color="#FF7F50" /></View>} count={totalMixed} label="Mixed" bgStyle={styles.mixedBg} textStyle={styles.statValuePurple} />
                    </View>
                    
                    <View style={styles.summaryFooter}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.textGray600}>Total Entries</Text>
                            <Text style={styles.fontBold}>{totalWet + totalSoiled + totalMixed}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.textGray600}>Average per day (last 7 days)</Text>
                            <Text style={styles.fontBold}>{formattedAverage} diapers</Text>
                        </View>
                    </View>
                </View>

                {/* 5. Recent Entries */}
                <View style={styles.mb20}>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.cardTitle}>Recent Entries</Text>
                    </View>
                    
                    {entries.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Text style={styles.textGray500}>No entries yet</Text>
                        </View>
                    ) : (
                        <View style={styles.spaceY3}>
                            {entries.map((entry) => {
                                const borderStyle = getTypeStyles(entry.type).border;
                                return (
                                    <View 
                                        key={entry.id} 
                                        style={[styles.entryCard, borderStyle]}
                                    >
                                        <View style={styles.entryHeaderRow}>
                                            <View style={styles.rowCentered}>
                                                {getTypeIcon(entry.type)}
                                                <Text style={styles.entryTypeText}>{getTypeLabel(entry.type)}</Text>
                                            </View>
                                            <Text style={styles.entryDateText}>
                                                {formatTime(entry.timestamp)} - {formatDateShort(entry.timestamp)}
                                            </Text>
                                        </View>
                                        
                                        {entry.notes ? (
                                            <View style={styles.entryNotesContainer}>
                                                <Text style={styles.entryNotesText}>"{entry.notes}"</Text>
                                            </View>
                                        ) : null}
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </View>

            </ScrollView>
        </View>
    );
};

// --- Sub Component for Stat Circles ---
interface StatCircleProps {
    icon: React.ReactNode;
    count: number;
    label: string;
    bgStyle: any; // Use 'any' for dynamically assigned style objects
    textStyle: any;
}

const StatCircle: React.FC<StatCircleProps> = ({ icon, count, label, bgStyle, textStyle }) => (
    <View style={styles.statItem}>
        <View style={[styles.statCircle, bgStyle]}>
            {icon}
        </View>
        <Text style={[styles.statValue, textStyle]}>{count}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);


// --- Chart Configuration ---

const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`, // Blue
    labelColor: (opacity = 1) => `rgba(44, 62, 80, ${opacity})`, // Gray
    style: {
        borderRadius: 16
    },
    propsForDots: {
        r: '4',
        strokeWidth: '2',
        stroke: '#4A90E2'
    }
};

// --- 5. StyleSheet Definition ---

const styles = StyleSheet.create({
    // --- Layout & Utility ---
    flex1: { flex: 1, backgroundColor: '#f9fafb' }, // bg-gray-50
    p1: { padding: 4 },
    rowCentered: { flexDirection: 'row', alignItems: 'center' },
    fontBold: { fontWeight: 'bold' },
    spaceY3: { gap: 12 }, // space-y-3
    mb20: { marginBottom: 80 }, // mb-20
    
    // --- Header Styles ---
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

    // --- Card & Content Layout ---
    scrollViewContent: { 
        flex: 1, 
        paddingHorizontal: 16, // px-4
        paddingVertical: 16 // py-4
    },
    card: { 
        backgroundColor: 'white', 
        borderRadius: 12, // rounded-xl
        padding: 16, // p-4
        marginBottom: 16, // mb-4
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2, // shadow-sm
    },
    cardHeaderRow: { 
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

    // --- Input & Form Styles ---
    inputLabel: { 
        fontWeight: '500', 
        color: '#4b5563', // text-gray-700
        marginTop: 8, 
        marginBottom: 8 
    },
    timePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16, // mb-4
        padding: 12, // p-3
        backgroundColor: '#f3f4f6', // bg-gray-100
        borderRadius: 8, // rounded-lg
    },
    timeText: { 
        marginLeft: 8, // ml-2
        color: '#4b5563', // text-gray-700
    },
    typeSelectionContainer: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginBottom: 16 // mb-4
    },
    typeButton: {
        flex: 1, 
        alignItems: 'center', 
        paddingVertical: 12, // py-3
        marginHorizontal: 4, // mx-1
        borderRadius: 8, // rounded-lg
        borderColor: '#e5e7eb', // border-gray-200 (default)
    },
    typeButtonText: {
        marginLeft: 4, 
        fontWeight: '500', 
    },
    mixedIconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4
    },
    notesInput: {
        borderWidth: 1, 
        borderColor: '#d1d5db', // border-gray-300
        borderRadius: 8, // rounded-lg
        padding: 12, // p-3
        marginBottom: 16, // mb-4
        height: 96, // h-24
        backgroundColor: 'white',
        textAlignVertical: 'top'
    },
    saveButton: {
        backgroundColor: '#3b82f6', // bg-blue-500
        borderRadius: 8, 
        paddingVertical: 12, // py-3
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    saveButtonText: {
        color: 'white', 
        fontWeight: 'bold', 
        fontSize: 18, 
        marginLeft: 8 
    },

    // --- Stats & Summary Styles ---
    statsRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-around',
        paddingVertical: 8,
    },
    statItem: { alignItems: 'center', marginHorizontal: 4 },
    statValue: { fontSize: 24, fontWeight: 'bold' },
    statValueBlue: { color: '#3b82f6' }, // text-blue-500
    statValueAmber: { color: '#f59e0b' }, // text-amber-500
    statValuePurple: { color: '#8A2BE2' }, // text-purple-500 (Used a slightly darker shade for visibility)
    statValueDefault: { color: '#1f2937' }, // text-gray-800
    statLabel: { color: '#4b5563' }, // text-gray-600

    statCircle: {
        width: 64, // w-16
        height: 64, // h-16
        borderRadius: 32, // rounded-full
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8, // mb-2
    },
    summaryFooter: {
        marginTop: 16, // mt-4
        paddingTop: 16, // pt-4
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6', // border-gray-100
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },

    // --- Chart Styles ---
    chartContainer: {
        alignItems: 'center',
    },
    chartStyle: {
        marginVertical: 8,
        borderRadius: 16
    },

    // --- Entry Card Styles ---
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
    entryHeaderRow: {
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center'
    },
    entryTypeText: {
        marginLeft: 8, // ml-2
        fontWeight: 'bold', 
        color: '#1f2937' // text-gray-800
    },
    entryDateText: {
        color: '#6b7280', // text-gray-500
    },
    entryNotesContainer: { 
        marginTop: 8, 
        paddingTop: 8, 
        borderTopWidth: 1, 
        borderTopColor: '#f3f4f6' // border-gray-100
    },
    entryNotesText: { 
        color: '#4b5563', // text-gray-600
        fontStyle: 'italic',
    },
    emptyCard: {
        backgroundColor: 'white', 
        borderRadius: 12, 
        padding: 24, 
        alignItems: 'center', 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 3, 
    },

    // --- Type Color Styles ---
    wetBg: { backgroundColor: '#dbeafe' }, // bg-blue-100
    wetBorder: { borderColor: '#3b82f6' }, // border-blue-500
    wetText: { color: '#2563eb' },
    
    soiledBg: { backgroundColor: '#fffbe5' }, // bg-amber-100
    soiledBorder: { borderColor: '#f59e0b' }, // border-amber-500
    soiledText: { color: '#d97706' },
    
    mixedBg: { backgroundColor: '#f3e8ff' }, // bg-purple-100
    mixedBorder: { borderColor: '#a855f7' }, // border-purple-500
    mixedText: { color: '#7e22ce' },

    // Default Gray/Fallback
    defaultBg: { backgroundColor: '#ffffff' }, 
    defaultBorder: { borderColor: '#d1d5db' }, 
    defaultText: { color: '#6b7280' },
    gray100Bg: { backgroundColor: '#f3f4f6' },
    gray200Border: { borderColor: '#e5e7eb' },
    textGray800: { color: '#1f2937' },
    textGray600: { color: '#4b5563' },
    textGray500: { color: '#6b7280' },
});

export default DiaperTrackerScreen;