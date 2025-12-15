import React, { useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    StyleSheet,
    Alert,
    TextInput,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
    Play,
    Plus,
    Calendar,
    Clock,
    Baby,
    CheckCircle,
    Activity,
    ChevronLeft,
    Edit3, // Pencil icon for notes
    Check, // Simple check icon for completion
    Clock4, // For time/duration
    Milk, // For feeding
} from "lucide-react-native";
import { StackNavigationProp } from '@react-navigation/stack';

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// --- Define Navigation Types ---
type RootStackParamList = {
    Dashboard: undefined;
    Profile: undefined;
    FeedingTracker: undefined;
    GrowthTracker: undefined;
    VaccinationTracker: undefined;
    CryAnalyzer: undefined;
    ClothingGuide: undefined;
    MedicationTracker: undefined;
    PediatricianMap: undefined;
    'Parental Guide': undefined;
    'Lullabies & Stories': undefined;
    'My Appointments': undefined;
    
};
type FeedingTrackerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'FeedingTracker'>;
interface Props {
    navigation: FeedingTrackerScreenNavigationProp;
}

// --- Interfaces for State and Data ---

interface LogFormState {
    feedingType: string;
    amount: string; // Stored as string from TextInput
    duration: string; // Stored as string from TextInput
    notes: string;
}

interface FeedingLog extends LogFormState {
    id: string; // Unique ID for keys
    timestamp: Date; // Time of the log
}

// --- Mock Data ---
const feedingSteps = [
    { id: 1, title: "Prepare Bottle", description: "Wash hands thoroughly and sterilize bottle and nipple.", image: "https://picsum.photos/600/330?random=1", duration: "5 mins" },
    { id: 2, title: "Check Temperature", description: "Test milk temperature on inner wrist—should feel lukewarm.", image: "https://picsum.photos/600/330?random=2", duration: "1 min" },
    { id: 3, title: "Position Baby", description: "Hold baby upright against your chest at a 45-degree angle.", image: "https://picsum.photos/600/330?random=3", duration: "2 mins" },
    { id: 4, title: "Begin Feeding", description: "Gently place nipple in baby's mouth and tilt bottle slightly.", image: "https://picsum.photos/600/330?random=4", duration: "15-20 mins" },
    { id: 5, title: "Burp Baby", description: "Hold baby upright and gently pat their back to release gas.", image: "https://picsum.photos/600/330?random=5", duration: "3-5 mins" },
];

// ------------------------------------
// --- Log Feeding Tab Components ---
// ------------------------------------

// Helper component for single log item display
const RecentLogItem: React.FC<{ log: FeedingLog }> = ({ log }) => {
    // Format time (e.g., 6:24 PM) and date (e.g., Nov 30)
    const time = log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = log.timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' });
    
    // Determine the main metric and its unit
    let metricText = 'N/A';
    if (log.amount) {
        metricText = `${log.amount} ml`;
    } else if (log.duration) {
        metricText = `${log.duration} min`;
    }

    return (
        <View style={recentStyles.logItem}>
            <View style={recentStyles.logDetails}>
                <Milk size={18} color="#455A64" style={recentStyles.logIcon} />
                <View>
                    <Text style={recentStyles.logType}>{log.feedingType}</Text>
                    <Text style={recentStyles.logTime}>{date} at {time}</Text>
                </View>
            </View>
            <Text style={recentStyles.logAmount}>{metricText}</Text>
        </View>
    );
};

// Component to render the list of recent feedings
const RecentFeedingsList: React.FC<{ history: FeedingLog[] }> = ({ history }) => {
    const recentLogs = history.slice(0, 5); // Show only the last 5 logs

    if (recentLogs.length === 0) {
        return (
            <View style={styles.emptyHistory}>
                <Text style={styles.emptyHistoryText}>No feedings logged yet</Text>
            </View>
        );
    }

    return (
        <View style={recentStyles.logList}>
            {recentLogs.map(log => (
                <RecentLogItem key={log.id} log={log} />
            ))}
        </View>
    );
};


// Props for the LogFeedingTab
interface LogFeedingTabProps {
    addLog: (log: LogFormState) => void;
    history: FeedingLog[];
}

// --- Log Feeding Tab Component (Updated) ---
const LogFeedingTab: React.FC<LogFeedingTabProps> = ({ addLog, history }) => {
    const [form, setForm] = useState<LogFormState>({
        feedingType: 'Breastmilk',
        amount: '',
        duration: '',
        notes: '',
    });

    const handleLogFeeding = () => {
        if (!form.amount && !form.duration) {
            Alert.alert("Missing Data", "Please enter either an Amount or a Duration to log the feeding.");
            return;
        }

        // 1. Call the log handler function passed from the parent
        addLog(form);

        // 2. Reset form after submission
        setForm({
            feedingType: 'Breastmilk',
            amount: '',
            duration: '',
            notes: '',
        });
    };

    return (
        <View style={styles.logContainer}>
            {/* Log New Feeding Card */}
            <View style={styles.logCard}>
                <Text style={styles.logSectionTitle}>+ Log New Feeding</Text>
                <Text style={styles.logSubtitle}>Track your baby's feeding time</Text>

                {/* Feeding Type */}
                <Text style={styles.fieldLabel}>Feeding Type</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={form.feedingType}
                        onValueChange={(itemValue: string) => setForm({ ...form, feedingType: itemValue })}
                        style={styles.picker}
                        itemStyle={styles.pickerItem}
                    >
                        <Picker.Item label="Breastmilk" value="Breastmilk" />
                        <Picker.Item label="Formula" value="Formula" />
                        <Picker.Item label="Solid Food" value="Solid Food" />
                    </Picker>
                </View>
                
                {/* Amount */}
                <Text style={styles.fieldLabel}>Amount (ml)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Optional"
                    keyboardType="numeric"
                    value={form.amount}
                    onChangeText={(text) => setForm({ ...form, amount: text })}
                />

                {/* Duration */}
                <Text style={styles.fieldLabel}>Duration (minutes)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Optional"
                    keyboardType="numeric"
                    value={form.duration}
                    onChangeText={(text) => setForm({ ...form, duration: text })}
                />

                {/* Notes */}
                <Text style={styles.fieldLabel}>Notes</Text>
                <View style={styles.notesContainer}>
                    <TextInput
                        style={styles.notesInput}
                        placeholder="Any additional notes..."
                        multiline={true}
                        numberOfLines={3}
                        value={form.notes}
                        onChangeText={(text) => setForm({ ...form, notes: text })}
                    />
                    <Edit3 size={18} color="#9ca3af" style={styles.editIcon} />
                </View>

                {/* Log Feeding Button */}
                <TouchableOpacity
                    onPress={handleLogFeeding}
                    style={styles.logButton}
                >
                    <Text style={styles.logButtonText}>Log Feeding</Text>
                </TouchableOpacity>
            </View>

            {/* Recent Feedings Card (Now Dynamic) */}
            <View style={styles.recentLogCard}>
                <Text style={styles.logSectionTitle}>Recent Feedings</Text>
                <Text style={styles.logSubtitle}>Last 5 feeding logs</Text>
                <RecentFeedingsList history={history} />
            </View>
        </View>
    );
};

// ------------------------------------
// --- History Tab Component ---
// ------------------------------------

const HistoryTab: React.FC<{ history: FeedingLog[] }> = ({ history }) => (
    <View style={styles.historyTabContent}>
        <Text style={styles.sectionTitle}>Full Feeding History</Text>
        {history.length > 0 ? (
            <ScrollView style={recentStyles.historyScrollView}>
                {history.map(log => (
                    // Use the same log item display component for consistency
                    <RecentLogItem key={log.id} log={log} />
                ))}
                <Text style={[styles.emptyHistoryText, { textAlign: 'center', marginTop: 20, marginBottom: 40 }]}>--- End of History ---</Text>
            </ScrollView>
        ) : (
            <View style={[styles.emptyHistory, { marginTop: 50 }]}>
                <Text style={styles.emptyHistoryText}>No detailed history to display yet.</Text>
                <Text style={styles.logSubtitle}>Log a feeding using the 'Log Feeding' tab!</Text>
            </View>
        )}
    </View>
);

// ------------------------------------
// --- Instructions Tab Component ---
// ------------------------------------

// Kept InstructionsTab logic the same as provided by the user

const InstructionsTab: React.FC<{
    completedSteps: number[];
    toggleStepCompletion: (id: number) => void;
}> = ({ completedSteps, toggleStepCompletion }) => (
    <>
        <View style={styles.card}>
            <Text style={styles.cardTitle}>Video Tutorial</Text>
            <Text style={styles.cardDescription}>Watch our expert demonstrate proper feeding techniques</Text>
            <TouchableOpacity
                style={styles.videoPlaceholder}
                onPress={() => Alert.alert("Navigate", "Navigating to video player")}
            >
                <Image
                    source={{
                        uri: "https://placehold.co/600x330/EEEEEE/888888?text=Video+Tutorial", 
                    }}
                    style={styles.videoImage}
                />
                <View style={styles.videoOverlay}>
                    <Text style={styles.videoOverlayText}>Video unavailable</Text>
                    <Play size={32} color="white" fill="white" style={{ marginTop: 10 }} />
                </View>
            </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Feeding Steps</Text>

        {feedingSteps.map((step, index) => (
            <View
                key={step.id}
                style={[styles.stepCard, completedSteps.includes(step.id) && styles.completedStepCard]}
            >
                <View style={styles.stepHeaderWrapper}>
                    <View style={styles.stepTitleWrapper}>
                        <View style={styles.stepIndexCircle}>
                            <Text style={styles.stepIndexText}>
                                {index + 1}
                            </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.stepTitle}>
                                {step.title}
                            </Text>
                            <Text style={styles.stepDescriptionText}>
                                {step.description}
                            </Text>
                        </View>
                    </View>
                    
                    <TouchableOpacity
                        style={styles.checkButton}
                        onPress={() => toggleStepCompletion(step.id)}
                    >
                        {completedSteps.includes(step.id) ? (
                            <Check size={18} color="#10b981" />
                        ) : (
                            <Text style={styles.durationButtonText}>{step.duration}</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <Image
                    source={{ uri: step.image }}
                    style={styles.stepImage}
                    resizeMode="cover"
                />
            </View>
        ))}
    </>
);


// ------------------------------------
// --- Main Screen Component (Updated) ---
// ------------------------------------

const FeedingTrackerScreen: React.FC<Props> = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState("instructions");
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);
    
    // NEW STATE: To hold the feeding history
    const [feedingHistory, setFeedingHistory] = useState<FeedingLog[]>([]);

    const toggleStepCompletion = (stepId: number) => {
        if (completedSteps.includes(stepId)) {
            setCompletedSteps(completedSteps.filter((id) => id !== stepId));
        } else {
            setCompletedSteps([...completedSteps, stepId]);
        }
    };

    // NEW FUNCTION: To receive the log data and update the history
    const addFeedingLog = (newLog: LogFormState) => {
        const logEntry: FeedingLog = {
            ...newLog,
            id: Date.now().toString(), // Simple unique ID
            timestamp: new Date(),
        };
        // Add the new log to the beginning of the array (most recent first)
        setFeedingHistory(prevHistory => [logEntry, ...prevHistory]);
        Alert.alert("Success", `Feeding (${logEntry.feedingType}) logged successfully!`);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            
            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === "instructions" && styles.activeTabButton]}
                    onPress={() => setActiveTab("instructions")}
                >
                    <Text style={[styles.tabButtonText, activeTab === "instructions" && styles.activeTabButtonText]}>
                        Instructions
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === "log" && styles.activeTabButton]}
                    onPress={() => setActiveTab("log")}
                >
                    <Text style={[styles.tabButtonText, activeTab === "log" && styles.activeTabButtonText]}>
                        Log Feeding
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === "history" && styles.activeTabButton]}
                    onPress={() => setActiveTab("history")}
                >
                    <Text style={[styles.tabButtonText, activeTab === "history" && styles.activeTabButtonText]}>
                        History
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollViewContent} contentContainerStyle={{ paddingBottom: 100 }}>
                {activeTab === "instructions" && (
                    <InstructionsTab 
                        completedSteps={completedSteps} 
                        toggleStepCompletion={toggleStepCompletion} 
                    />
                )}
                
                {/* PASSING addFeedingLog and feedingHistory as props */}
                {activeTab === "log" && (
                    <LogFeedingTab 
                        addLog={addFeedingLog} 
                        history={feedingHistory} 
                    />
                )}
                
                {/* PASSING feedingHistory to the History Tab */}
                {activeTab === "history" && (
                    <HistoryTab 
                        history={feedingHistory} 
                    />
                )}
            </ScrollView>
        </View>
    );
};

// ------------------------------------
// --- Stylesheet ---
// ------------------------------------

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb', // gray-50
    },
    // Header Styles
    header: {
        backgroundColor: '#455A64', // Darker gray/blue for the header
        paddingTop: 48, 
        paddingBottom: 24, 
        paddingHorizontal: 16,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 4,
    },
    headerTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        position: 'absolute',
        width: '100%',
        left: 0,
        right: 0,
    },
    // Tabs Styles
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        overflow: 'hidden',
    },
    tabButton: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
    },
    activeTabButton: {
        backgroundColor: '#6495ED', // Cornflower Blue for active tab
    },
    tabButtonText: {
        fontWeight: '600',
        color: '#4b5563', // gray-600
    },
    activeTabButtonText: {
        color: 'white',
    },
    scrollViewContent: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    cardDescription: {
        color: '#4b5563',
        marginBottom: 12,
        fontSize: 14,
    },
    // Video Placeholder Styles
    videoPlaceholder: {
        position: 'relative',
        borderRadius: 8,
        overflow: 'hidden',
        width: '100%',
        height: SCREEN_WIDTH * 0.55, // Fixed height for video container
        backgroundColor: '#f3f4f6',
    },
    videoImage: {
        width: '100%',
        height: '100%',
        opacity: 0.1, 
    },
    videoOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoOverlayText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    // Step-by-step Styles
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 16,
    },
    stepCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    completedStepCard: {
        borderWidth: 2,
        borderColor: '#10b981', // green-500
    },
    stepHeaderWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 16,
        paddingBottom: 8, 
    },
    stepTitleWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
        paddingRight: 10,
    },
    stepIndexCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        marginTop: 4, 
        backgroundColor: '#d1d5db', 
    },
    stepIndexText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    stepTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    stepDescriptionText: {
        color: '#6b7280',
        fontSize: 14,
        marginTop: 2,
    },
    checkButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 9999,
        borderWidth: 1,
        borderColor: '#e5e7eb', 
        marginLeft: 10,
        alignSelf: 'center',
    },
    durationButtonText: {
        color: '#4b5563',
        fontSize: 12,
    },
    stepImage: {
        width: '100%',
        height: 120, 
        marginTop: 8,
    },
    // Log Feeding Tab Styles
    logContainer: {
        flex: 1,
        flexDirection: SCREEN_WIDTH > 600 ? 'row' : 'column', 
        justifyContent: 'space-between',
    },
    logCard: {
        flex: SCREEN_WIDTH > 600 ? 2 : 1,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        marginRight: SCREEN_WIDTH > 600 ? 12 : 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    recentLogCard: {
        flex: SCREEN_WIDTH > 600 ? 1 : 1,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        marginLeft: SCREEN_WIDTH > 600 ? 12 : 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        minHeight: 200,
    },
    logSectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    logSubtitle: {
        color: '#6b7280',
        marginBottom: 24,
        fontSize: 14,
    },
    fieldLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
        marginTop: 12,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        backgroundColor: '#f9fafb',
        overflow: 'hidden',
        height: 50,
        justifyContent: 'center',
    },
    picker: {
        height: 50,
        width: '100%',
    },
    pickerItem: {
        height: 50,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f9fafb',
    },
    notesContainer: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        backgroundColor: '#f9fafb',
        position: 'relative',
    },
    notesInput: {
        padding: 12,
        fontSize: 16,
        minHeight: 80,
        textAlignVertical: 'top',
        paddingRight: 40, 
    },
    editIcon: {
        position: 'absolute',
        right: 12,
        bottom: 12,
    },
    logButton: {
        backgroundColor: '#4CB7B1', 
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 24,
    },
    logButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    emptyHistory: {
        alignItems: 'center',
        paddingVertical: 48,
        marginTop: 20,
    },
    emptyHistoryText: {
        color: '#9ca3af',
        fontSize: 16,
    },
    historyTabContent: {
        flex: 1,
        width: '100%',
    }
});

// --- Styles for Recent Logs ---
const recentStyles = StyleSheet.create({
    logList: {
        marginTop: 10,
    },
    logItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6', 
    },
    logDetails: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logIcon: {
        marginRight: 10,
    },
    logTime: {
        fontSize: 12,
        fontWeight: '400',
        color: '#9ca3af',
        marginTop: 2,
    },
    logType: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
    },
    logAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CB7B1', 
    },
    historyScrollView: {
        width: '100%',
        paddingHorizontal: 0,
        marginBottom: 20,
    }
});

export default FeedingTrackerScreen;