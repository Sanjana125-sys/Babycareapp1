import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Dimensions,
    SafeAreaView,
    StatusBar
} from 'react-native';
import { format, differenceInDays } from 'date-fns';
// --- REAL ICON LIBRARY IMPORT ---
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// --- CHART LIBRARY IMPORT ---
// Ensure you have 'react-native-chart-kit' installed: npm install react-native-chart-kit
import { BarChart } from 'react-native-chart-kit'; 

// --- TYPE DEFINITIONS & STATIC DATA ---
interface Vaccination {
    id: number;
    name: string;
    dueDate: string; // YYYY-MM-DD
    administeredDate: string | null; // YYYY-MM-DD
    completed: boolean;
    notes: string;
}

interface LogFormData {
    name: string;
    dueDate: string;
    notes: string;
}

type TabKey = 'overview' | 'reports' | 'schedule' | 'addNew';

const initialVaccinations: Vaccination[] = [
    { 
        id: 1, 
        name: 'MMR Dose 1', 
        dueDate: '2025-11-26', 
        administeredDate: '2025-11-23', 
        completed: true, 
        notes: 'First dose of MMR' 
    },
    { 
        id: 2, 
        name: 'Dtap Dose 2', 
        dueDate: '2025-12-25', 
        administeredDate: null, 
        completed: false, 
        notes: 'Dtap vaccine' 
    },
    { 
        id: 3, 
        name: 'Polio Dose 3', 
        dueDate: '2026-01-20', 
        administeredDate: null, 
        completed: false, 
        notes: 'Polio vaccine scheduled' 
    },
    { 
        id: 4, 
        name: 'Rotavirus', 
        dueDate: '2025-10-15', 
        administeredDate: '2025-10-15', 
        completed: true, 
        notes: 'Rotavirus first shot' 
    },
];

const screenWidth = Dimensions.get('window').width;
// CRITICAL FIX: Define the chart width based on the screen, subtracting card padding (40) 
// and an extra safe buffer (20) to prevent Expo Go overflow.
const CHART_WIDTH = screenWidth - 80; 

// --- CHART DATA GENERATION ---
const generateChartData = (vaccines: Vaccination[]) => {
    // Data points simulating cumulative progress over 6 periods
    const completedCount = vaccines.filter(v => v.completed).length;
    
    return {
        labels: ["M 1", "M 2", "M 3", "M 4", "M 5", "Now"],
        datasets: [
            {
                data: [0, 0, 1, 2, 2, completedCount], 
                color: (opacity = 1) => `rgba(6, 182, 212, ${opacity})`, // Cyan color for bars
            }
        ]
    };
};

const chartConfig = {
    backgroundColor: "#FFFFFF",
    backgroundGradientFrom: "#FFFFFF",
    backgroundGradientTo: "#FFFFFF",
    decimalPlaces: 0, // Show whole numbers on Y-axis
    color: (opacity = 1) => `rgba(6, 182, 212, ${opacity})`, // Bar color (Cyan)
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`, 
    style: {
      borderRadius: 10,
    },
    propsForBackgroundLines: {
        strokeDasharray: '0' 
    }
};

// --- UTILITY COMPONENTS (UNCHANGED) ---

const TabButton: React.FC<{ tab: TabKey; current: TabKey; setTab: (key: TabKey) => void; label: string; }> = ({ tab, current, setTab, label }) => (
    <TouchableOpacity
        style={[
            styles.tabButton,
            current === tab ? styles.tabButtonActive : styles.tabButtonInactive,
        ]}
        onPress={() => setTab(tab)}
        activeOpacity={0.8}
    >
        <Text style={current === tab ? styles.tabTextActive : styles.tabTextInactive}>
            {label}
        </Text>
    </TouchableOpacity>
);

const MetricCard: React.FC<{ iconName: string, label: string, value: string | number, color: string }> = ({ iconName, label, value, color }) => (
    <View style={styles.metricCard}>
        <View style={[styles.metricIconContainer, { borderColor: color }]}>
            <Icon name={iconName} size={24} color={color} />
        </View>
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricLabel}>{label}</Text>
    </View>
);


// --- MAIN COMPONENT ---

const VaccinationTrackerScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabKey>('overview');
    const [vaccinations, setVaccinations] = useState<Vaccination[]>(initialVaccinations);
    const [logFormData, setLogFormData] = useState<LogFormData>({
        name: '',
        dueDate: format(new Date(), 'dd-MM-yyyy'),
        notes: '',
    });

    // --- Data Processing ---
    const totalCount = vaccinations.length;
    const completedCount = vaccinations.filter(v => v.completed).length;
    const pendingCount = totalCount - completedCount;
    const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
    const sortedVaccines = vaccinations.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    const upcomingVaccine = sortedVaccines.find(v => !v.completed);
    const chartData = generateChartData(vaccinations);
    
    // --- Action Handlers ---
    const markAsCompleted = useCallback((id: number) => {
        setVaccinations(prev =>
            prev.map(v =>
                v.id === id && !v.completed
                    ? { ...v, completed: true, administeredDate: format(new Date(), 'yyyy-MM-dd') }
                    : v
            )
        );
    }, []);

    const handleFormChange = (key: keyof LogFormData, value: string) => {
        setLogFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleAddVaccination = useCallback(() => {
        if (!logFormData.name || !logFormData.dueDate) {
            Alert.alert("Error", "Vaccine Name and Scheduled Date are required.");
            return;
        }

        const dateParts = logFormData.dueDate.split('-');
        if (dateParts.length !== 3 || dateParts[2].length !== 4) {
            Alert.alert("Error", "Please use the date format: dd-mm-yyyy");
            return;
        }
        
        const isoDueDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

        const newVaccine: Vaccination = {
            id: Date.now(),
            name: logFormData.name,
            dueDate: isoDueDate, 
            administeredDate: null,
            completed: false,
            notes: logFormData.notes,
        };

        setVaccinations(prev => [...prev, newVaccine]);
        setLogFormData({ name: '', dueDate: format(new Date(), 'dd-MM-yyyy'), notes: '' });
        setActiveTab('schedule');
    }, [logFormData]);

    // --- Render Sections ---

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            
            {/* Tab Navigation View */}
            <View style={styles.tabNavContainer}>
                <TabButton tab="overview" current={activeTab} setTab={setActiveTab} label="Overview" />
                <TabButton tab="reports" current={activeTab} setTab={setActiveTab} label="Reports" />
                <TabButton tab="schedule" current={activeTab} setTab={setActiveTab} label="Schedule" />
                <TabButton tab="addNew" current={activeTab} setTab={setActiveTab} label="Add New" />
            </View>
        </View>
    );

    const renderOverview = () => (
        <View style={styles.tabSection}>
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Vaccination Summary</Text>
                <View style={styles.metricsRow}>
                    <MetricCard iconName="shield-half-full" label="Total Vaccines" value={totalCount} color="#3B82F6" />
                    <MetricCard iconName="check-circle" label="Completed" value={completedCount} color="#10B981" />
                    <MetricCard iconName="clock-time-three-outline" label="Pending" value={pendingCount} color="#F59E0B" />
                    <MetricCard iconName="chart-line" label="Progress" value={`${progressPercent}%`} color="#06B6D4" />
                </View>

                {/* Progress Bar View */}
                <View style={styles.progressBarContainer}>
                    <Text style={styles.progressText}>Progress</Text>
                    <Text style={styles.progressValue}>{progressPercent}%</Text>
                </View>
                <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
                </View>
            </View>

            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Upcoming Vaccinations</Text>
                    <TouchableOpacity onPress={() => setActiveTab('schedule')} activeOpacity={0.7}>
                        <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                </View>
                {upcomingVaccine ? (
                    <View style={styles.vaccineItem}>
                        <Icon name="clock-alert-outline" size={20} color="#F59E0B" style={styles.iconMargin} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.vaccineName}>{upcomingVaccine.name}</Text>
                            <Text style={styles.vaccineDate}>Due: {format(new Date(upcomingVaccine.dueDate), 'MMM dd, yyyy')}</Text>
                            <Text style={styles.vaccineDaysLeft}>
                                ({differenceInDays(new Date(upcomingVaccine.dueDate), new Date())} days left)
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.bellButton} onPress={() => alert('Reminder set!')} activeOpacity={0.7}>
                            <Icon name="bell-outline" size={18} color="#06B6D4" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <Text style={styles.noDataText}>No upcoming vaccines.</Text>
                )}
            </View>
        </View>
    );

    const renderSchedule = () => (
        <View style={styles.tabSection}>
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Vaccination Schedule</Text>
                <Text style={styles.cardSubtitle}>All scheduled and completed vaccinations</Text>

                {sortedVaccines.map((v) => (
                    <View key={v.id} style={styles.scheduleItem}>
                        <View style={styles.scheduleDetails}>
                            <Icon name="needle" size={20} color={v.completed ? '#10B981' : '#F59E0B'} style={styles.iconMargin} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.scheduleName}>{v.name}</Text>
                                <Text style={styles.scheduleDate}>Due: {format(new Date(v.dueDate), 'MMM dd, yyyy')}</Text>
                                {v.administeredDate && (
                                    <Text style={styles.scheduleAdministered}>Administered: {format(new Date(v.administeredDate), 'MMM dd, yyyy')}</Text>
                                )}
                                {!v.completed && v.notes && (
                                    <Text style={styles.scheduleNotes}>{v.notes}</Text>
                                )}
                            </View>
                        </View>

                        {v.completed ? (
                            <View style={styles.badgeCompleted}>
                                <Text style={styles.badgeTextCompleted}>Completed</Text>
                            </View>
                        ) : (
                            <View style={styles.actionButtons}>
                                <TouchableOpacity style={styles.bellButtonSmall} onPress={() => alert('Reminder set!')} activeOpacity={0.7}>
                                    <Icon name="bell-outline" size={16} color="#06B6D4" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.completeButton}
                                    onPress={() => markAsCompleted(v.id)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.completeButtonText}>Complete</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                ))}
            </View>
        </View>
    );

    const renderAddNew = () => (
        <View style={styles.tabSection}>
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Add Vaccination</Text>
                <Text style={styles.cardSubtitle}>Schedule a new vaccination</Text>

                <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Vaccine Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., DTaP, MMR, Hepatitis B"
                        value={logFormData.name}
                        onChangeText={(text) => handleFormChange('name', text)}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Scheduled Date</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="dd-mm-yyyy"
                        value={logFormData.dueDate}
                        onChangeText={(text) => handleFormChange('dueDate', text)}
                        keyboardType="numbers-and-punctuation"
                    />
                    <Icon name="calendar-range-outline" color="#6B7280" style={styles.inputIcon} />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Notes (Optional)</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Additional information about the vaccination..."
                        multiline
                        numberOfLines={4}
                        value={logFormData.notes}
                        onChangeText={(text) => handleFormChange('notes', text)}
                    />
                </View>

                {/* Main Action Button */}
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddVaccination}
                    activeOpacity={0.8}
                >
                    <Icon name="plus" size={20} color="#FFF" />
                    <Text style={styles.addButtonText}>Add Vaccination</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderReports = () => (
        <View style={styles.tabSection}>
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Vaccination Progress</Text>
                <Text style={styles.cardSubtitle}>Vaccination completion over time</Text>
                
                {/* --- BAR CHART INTEGRATION --- */}
                <BarChart
                    data={chartData}
                    // FIX: Using the predefined, buffered CHART_WIDTH to prevent overflow
                    width={CHART_WIDTH} 
                    height={200}
                    chartConfig={chartConfig}
                    style={styles.chart}
                    fromZero={true}
                    yAxisLabel={''}
                    yAxisSuffix={' V'}
                />
                {/* --- END BAR CHART --- */}

            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Monthly Vaccination Report</Text>

                {/* Report Item 1 (Nov 25: 100%) - Mock Data */}
                <View style={styles.reportItem}>
                    <Text style={styles.reportMonth}>Nov 25</Text>
                    <View style={styles.reportBarContainer}>
                        <View style={[styles.reportBarFill, { width: '100%' }]} />
                    </View>
                    <Text style={styles.reportPercentage}>100%</Text>
                </View>
                <View style={styles.reportStats}>
                    <Text style={styles.reportStatText}>Completed: 1</Text>
                    <Text style={styles.reportStatText}>Pending: 0</Text>
                </View>

                {/* Report Item 2 (Dec 25: 0%) - Mock Data */}
                <View style={styles.reportItem}>
                    <Text style={styles.reportMonth}>Dec 25</Text>
                    <View style={styles.reportBarContainer}>
                        <View style={[styles.reportBarFill, { width: '0%', backgroundColor: '#F59E0B' }]} />
                    </View>
                    <Text style={styles.reportPercentage}>0%</Text>
                </View>
                <View style={styles.reportStats}>
                    <Text style={styles.reportStatText}>Completed: 0</Text>
                    <Text style={styles.reportStatText}>Pending: 1</Text>
                </View>
            </View>
        </View>
    );

    // --- Main Screen Return ---
    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#1E293B" />
            
            {renderHeader()}
            
            <ScrollView contentContainerStyle={styles.scrollContent} style={styles.scrollView}>
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'schedule' && renderSchedule()}
                {activeTab === 'addNew' && renderAddNew()}
                {activeTab === 'reports' && renderReports()}
                <View style={{ height: 50 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

// --- STYLESHEET ---

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    // FIX FOR SCROLLVIEW ERRORS
    scrollView: {
        flex: 1, 
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    // END FIX

    // --- Header & Tabs View ---
    headerContainer: {
        backgroundColor: '#1E293B', // Dark slate background
        paddingTop: 10, 
        paddingBottom: 15,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 8,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: 20,
    },
    backButton: {
        padding: 5,
        marginRight: 10,
    },
    headerTitleGroup: {
        flex: 1,
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    headerSubtitle: {
        fontSize: 13,
        color: '#A1A1AA', // Light gray
    },
    shieldIcon: {
        opacity: 0.7,
    },
    // Tab Navigation View
    tabNavContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        padding: 3,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabButtonActive: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    tabButtonInactive: {
        backgroundColor: 'transparent',
    },
    tabTextActive: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
    },
    tabTextInactive: {
        fontSize: 14,
        fontWeight: '500',
        color: '#E0F2F1', // Very light aqua
    },
    tabSection: {
        marginTop: 15,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 15,
    },
    seeAllText: {
        color: '#06B6D4',
        fontWeight: '600',
        fontSize: 13,
    },
    noDataText: {
        textAlign: 'center',
        fontStyle: 'italic',
        color: '#9CA3AF',
        paddingVertical: 10,
    },
    metricsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        marginBottom: 15,
    },
    metricCard: {
        width: '23%', 
        alignItems: 'center',
        paddingVertical: 10,
    },
    metricIconContainer: {
        padding: 8,
        borderRadius: 50,
        marginBottom: 5,
        backgroundColor: '#F3F4F6',
        borderWidth: 2,
    },
    metricValue: {
        fontSize: 20,
        fontWeight: '800',
        color: '#333',
    },
    metricLabel: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
    },
    progressBarContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        marginBottom: 5,
    },
    progressText: {
        fontSize: 13,
        color: '#6B7280',
    },
    progressValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
    },
    progressBarBackground: {
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: 8,
        backgroundColor: '#06B6D4', 
        borderRadius: 4,
    },
    vaccineItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    iconMargin: {
        marginRight: 10,
    },
    vaccineName: {
        fontWeight: '600',
        fontSize: 15,
        color: '#333',
    },
    vaccineDate: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 2,
    },
    vaccineDaysLeft: {
        fontSize: 12,
        color: '#F59E0B',
        fontWeight: '500',
    },
    bellButton: {
        backgroundColor: '#E0F7FA', // Light cyan
        padding: 8,
        borderRadius: 20,
        marginLeft: 15,
    },
    scheduleItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    scheduleDetails: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
    },
    scheduleName: {
        fontWeight: '600',
        fontSize: 16,
        color: '#333',
    },
    scheduleDate: {
        fontSize: 13,
        color: '#6B7280',
    },
    scheduleAdministered: {
        fontSize: 13,
        color: '#10B981',
        fontWeight: '500',
    },
    scheduleNotes: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 3,
        fontStyle: 'italic',
    },
    badgeCompleted: {
        backgroundColor: '#D1FAE5', // Light green
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 15,
    },
    badgeTextCompleted: {
        color: '#065F46',
        fontWeight: '600',
        fontSize: 12,
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bellButtonSmall: {
        backgroundColor: '#E0F7FA',
        padding: 5,
        borderRadius: 50,
        marginRight: 8,
    },
    completeButton: {
        backgroundColor: '#06B6D4', // Cyan
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 10,
    },
    completeButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    formGroup: {
        marginBottom: 20,
    },
    formLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#FAFAFA',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    inputIcon: {
        position: 'absolute',
        right: 15,
        top: 40,
        padding: 5,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4CB7B1', // Teal from the design
        paddingVertical: 15,
        borderRadius: 12,
        marginTop: 10,
        shadowColor: '#4CB7B1',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 5,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    chart: {
        marginVertical: 8,
        // Small negative margin to correct possible default padding issues
        marginHorizontal: -5, 
        borderRadius: 10,
        backgroundColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    reportItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    reportMonth: {
        width: 60,
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    reportBarContainer: {
        flex: 1,
        height: 10,
        backgroundColor: '#E5E7EB',
        borderRadius: 5,
        overflow: 'hidden',
        marginHorizontal: 10,
    },
    reportBarFill: {
        height: 10,
        backgroundColor: '#06B6D4',
        borderRadius: 5,
    },
    reportPercentage: {
        width: 40,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#06B6D4',
        textAlign: 'right',
    },
    reportStats: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginLeft: 70,
        marginBottom: 10,
        gap: 20,
    },
    reportStatText: {
        fontSize: 12,
        color: '#6B7280',
    }
});

export default VaccinationTrackerScreen;