// src/screens/GrowthTrackerScreen.tsx

import React, { useState, useCallback, useMemo } from 'react';
import { LineChart } from 'react-native-chart-kit';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    Dimensions,
} from 'react-native';
import { format, parseISO } from 'date-fns';

// --- ICON IMPORTS ---
// You MUST run 'npm install react-native-vector-icons' for these imports to work.
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// --- 1. TYPE DEFINITIONS ---
interface GrowthTrackerScreenProps {
    navigation: any; // Use a specific navigation type if you have one
}

interface Measurement {
    id: number;
    date: string; // YYYY-MM-DD
    weight: number; // kg
    height: number; // cm
    headCircumference: number; // cm
    notes: string;
}

interface Milestone {
    id: number;
    title: string;
    description: string;
    achieved: boolean;
    date: string | null;
}

interface LogFormData {
    date: string;
    weight: string;
    height: string;
    headCircumference: string;
    notes: string;
}

// Updated TabKey to include 'records'
type TabKey = 'overview' | 'charts' | 'milestones' | 'logEntry' | 'records';

const screenWidth = Dimensions.get('window').width;

// --- 2. ICON DEFINITIONS (Using imported libraries) ---
const Icon = Feather;

const ChevronLeft = (props: any) => <Icon name="chevron-left" {...props} />;
const TrendingUp = (props: any) => <Icon name="trending-up" {...props} />;
const Plus = (props: any) => <Icon name="plus" {...props} />;
const CheckCircle = (props: any) => <Icon name="check-circle" {...props} />;
const Minus = (props: any) => <Icon name="minus" {...props} />;
const Scale = (props: any) => <MaterialCommunityIcons name="scale-balance" {...props} />;
const Ruler = (props: any) => <Icon name="maximize" {...props} />;
const Target = (props: any) => <MaterialCommunityIcons name="head-snowflake" {...props} />; // Used for Head Circumference
const GitBranch = (props: any) => <Icon name="git-branch" {...props} />;
const TrendingDown = (props: any) => <Icon name="alert-triangle" {...props} />;
const Calendar = (props: any) => <Icon name="calendar" {...props} />;
const ChartIcon = (props: any) => <Icon name="bar-chart-2" {...props} />;
const Expand = (props: any) => <Icon name="maximize-2" {...props} />;
const Activity = (props: any) => <Icon name="activity" {...props} />;
// New Icon for Records/List
const ListIcon = (props: any) => <Icon name="list" {...props} />;


const initialMeasurements: Measurement[] = [
    // Added a few more for better monthly grouping example
    { id: 1672531200000, date: '2025-01-01', weight: 3.5, height: 50.0, headCircumference: 35.0, notes: 'Birth measurement' },
    { id: 1708886400000, date: '2025-02-01', weight: 4.5, height: 55.0, headCircumference: 37.0, notes: '1-month checkup' },
    { id: 1711564800000, date: '2025-03-15', weight: 5.8, height: 60.5, headCircumference: 39.5, notes: '2.5-month checkup' },
    { id: 1714243200000, date: '2025-03-30', weight: 6.0, height: 61.2, headCircumference: 39.8, notes: 'Private check in' },
    { id: 1717180800000, date: '2025-06-05', weight: 7.5, height: 68.0, headCircumference: 42.0, notes: '6-month checkup' },
];

const initialMilestoneTemplates: Milestone[] = [
    { id: 1, title: "First Smile", description: "First non-gas-related social smile.", achieved: true, date: '2025-02-15' },
    { id: 2, title: "Holds Head Up", description: "Holds head up steadily when lying on tummy.", achieved: false, date: null },
    { id: 3, title: "Rolls Over", description: "Rolls from tummy to back or back to tummy.", achieved: false, date: null },
    { id: 4, title: "Sits Without Support", description: "Sits alone for short periods.", achieved: false, date: null },
    { id: 5, title: "First Words", description: "Says 'Mama' or 'Dada' clearly.", achieved: false, date: null },
];
// Static WHO reference data for comparison purposes (independent of baby's measurements)
const WHO_WEIGHT_STANDARD = [3.3, 4.5, 5.4, 6.2, 7.0, 7.7]; // for months 0-5
const WHO_HEIGHT_STANDARD = [50, 55, 59, 62, 64, 66]; // for months 0-5

// Reusable Chart Configuration for clean rendering
const commonChartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`, // Gray label
    style: {
        borderRadius: 16,
    },
};


// --- 3. UTILITY COMPONENTS ---

const TabButton: React.FC<{ tab: TabKey; current: TabKey; setTab: (key: TabKey) => void; label: string; }> = ({ tab, current, setTab, label }) => (
    <TouchableOpacity
        style={[
            styles.tabButton,
            current === tab ? styles.tabButtonActive : styles.tabButtonInactive,
        ]}
        onPress={() => setTab(tab)}
    >
        <Text style={current === tab ? styles.tabTextActive : styles.tabTextInactive}>
            {label}
        </Text>
    </TouchableOpacity>
);

const GrowthMetric: React.FC<{
    icon: React.FC<any>;
    label: string;
    value: string;
    date: string | null;
    color: string;
}> = ({ icon: IconComponent, label, value, date, color }) => (
    <View style={styles.metricCard}>
        <View style={[styles.metricIconContainer, { borderColor: color }]}>
            <IconComponent size={24} color={color} />
        </View>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricValue}>{value}</Text>
        <View style={styles.metricBadgeDate}>
            <Text style={styles.metricBadgeTextDate}>{date ? format(new Date(date), 'yyyy-MM-dd') : 'N/A'}</Text>
        </View>
    </View>
);

// We remove ChartPlaceholder as it is no longer needed


// --- 4. MAIN COMPONENT ---

const GrowthTrackerScreen: React.FC<GrowthTrackerScreenProps> = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState<TabKey>('overview');
    const [milestones, setMilestones] = useState<Milestone[]>(initialMilestoneTemplates);
    const [measurements, setMeasurements] = useState<Measurement[]>(initialMeasurements);
    const [loading, setLoading] = useState<boolean>(false);
    const [logFormData, setLogFormData] = useState<LogFormData>({
        date: format(new Date(), 'yyyy-MM-dd'),
        weight: '',
        height: '',
        headCircumference: '',
        notes: '',
    });

    // --- Data Processing ---
    const latestMeasurement = useMemo<Measurement | null>(() => {
        // Sorts by date descending to get the newest entry
        const sorted = [...measurements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return sorted.length > 0 ? sorted[0] : null;
    }, [measurements]);

    // ** Data Preparation for Charts (Optimized with useMemo) **
    const chartData = useMemo(() => {
        // Must sort ascending for charts to display correctly chronologically
        const sortedMeasurements = [...measurements].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Use dates (or months if there are many points) as labels for the X-axis
        const labels = sortedMeasurements.map(m => format(parseISO(m.date), 'MM/dd'));

        return {
            labels,
            weights: sortedMeasurements.map(m => m.weight),
            heights: sortedMeasurements.map(m => m.height),
            heads: sortedMeasurements.map(m => m.headCircumference),
        };
    }, [measurements]);


    // ** New: Group measurements by Month and Year **
    const measurementsByMonth = useMemo<Record<string, Measurement[]>>(() => {
        const grouped: Record<string, Measurement[]> = {};

        // Sort measurements by date descending (newest first)
        const sortedMeasurements = [...measurements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        sortedMeasurements.forEach(m => {
            const dateObj = parseISO(m.date);
            const monthYearKey = format(dateObj, 'MMM yyyy'); // e.g., 'Feb 2025'

            if (!grouped[monthYearKey]) {
                grouped[monthYearKey] = [];
            }
            grouped[monthYearKey].push(m);
        });

        return grouped;
    }, [measurements]);


    // --- Milestone Handlers (Omitted for brevity, kept logic intact) ---
    const toggleMilestone = useCallback((id: number) => {
        setMilestones(prev =>
            prev.map(m =>
                m.id === id
                    ? { ...m, achieved: !m.achieved, date: !m.achieved ? format(new Date(), 'yyyy-MM-dd') : null }
                    : m
            )
        );
    }, []);


    // --- Log Entry Handler (Omitted for brevity, kept logic intact) ---
    const handleLogMeasurement = useCallback(() => {
        setLoading(true);

        const weightValue = parseFloat(logFormData.weight);
        const heightValue = parseFloat(logFormData.height);
        const headCircumferenceValue = parseFloat(logFormData.headCircumference);

        if (isNaN(weightValue) || isNaN(heightValue) || isNaN(headCircumferenceValue) || !logFormData.date) {
            Alert.alert("Error", "Please enter valid numerical values and a date (YYYY-MM-DD) for all required fields.");
            setLoading(false);
            return;
        }

        const newEntry: Measurement = {
            id: Date.now(),
            date: logFormData.date,
            weight: weightValue,
            height: heightValue,
            headCircumference: headCircumferenceValue,
            notes: logFormData.notes,
        };

        // Add new entry and re-sort ascending by date
        setMeasurements(prev => [...prev, newEntry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));

        // Reset form after successful log
        setLogFormData({
            date: format(new Date(), 'yyyy-MM-dd'),
            weight: '',
            height: '',
            headCircumference: '',
            notes: '',
        });

        setLoading(false);
        // Navigate back to overview after logging
        Alert.alert("Success", "Measurement logged successfully!");
        setActiveTab('overview');
    }, [logFormData]);

    const handleFormChange = (key: keyof LogFormData, value: string) => {
        setLogFormData(prev => ({ ...prev, [key]: value }));
    };


    // --- Render Functions ---

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <View style={styles.headerContent}>
                <View style={styles.headerTitleGroup}>
                    <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
                        <ChevronLeft size={24} color="#FFF" />
                    </TouchableOpacity>
                    <View style={styles.headerText}>
                        <Text style={styles.headerTitle}>Growth Tracker</Text>
                        <Text style={styles.headerSubtitle}>Monitor your baby's development</Text>
                    </View>
                </View>
                <View style={styles.headerIconRight}>
                    <Expand size={20} color="#FFF" />
                </View>
            </View>

            {/* Tab Navigation - Updated with 'records' tab */}
            <View style={styles.tabNavContainer}>
                <TabButton tab="overview" current={activeTab} setTab={setActiveTab} label="Overview" />
                <TabButton tab="charts" current={activeTab} setTab={setActiveTab} label="Charts" />
                <TabButton tab="milestones" current={activeTab} setTab={setActiveTab} label="Milestones" />
                <TabButton tab="records" current={activeTab} setTab={setActiveTab} label="Records" />
                <TabButton tab="logEntry" current={activeTab} setTab={setActiveTab} label="Log Entry" />
            </View>
        </View>
    );

    const renderOverview = () => (
        <View style={styles.tabSection}>
            <View style={styles.card}>
                <View style={[styles.cardHeader, { borderBottomWidth: 1, paddingBottom: 15 }]}>
                    <View style={styles.cardTitleGroup}>
                        <TrendingUp size={22} color="#3CB8C2" />
                        <Text style={styles.cardTitle}>Growth Summary</Text>
                    </View>
                </View>

                {latestMeasurement ? (
                    <View style={styles.metricsRow}>
                        <GrowthMetric 
                            icon={Scale} 
                            label="Current Weight" 
                            value={`${latestMeasurement.weight.toFixed(1)} kg`} 
                            date={latestMeasurement.date} 
                            color="#EF4444" 
                        />
                        <GrowthMetric 
                            icon={Ruler} 
                            label="Current Height" 
                            value={`${latestMeasurement.height.toFixed(1)} cm`} 
                            date={latestMeasurement.date} 
                            color="#F59E0B" 
                        />
                        <GrowthMetric 
                            icon={Target} 
                            label="Head Circumference" 
                            value={`${latestMeasurement.headCircumference.toFixed(1)} cm`} 
                            date={latestMeasurement.date} 
                            color="#10B981" 
                        />
                    </View>
                ) : (
                    <View style={styles.noDataBox}>
                        <TrendingDown size={32} color="#9CA3AF" style={{ marginBottom: 10 }} />
                        <Text style={styles.noDataText}>No growth measurements logged yet.</Text>
                        <TouchableOpacity onPress={() => setActiveTab('logEntry')} style={styles.logFirstButton}>
                            <Text style={styles.logFirstButtonText}>Log First Entry</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <View style={styles.card}>
                <View style={[styles.cardHeader, { borderBottomWidth: 1, paddingBottom: 15 }]}>
                    <View style={styles.cardTitleGroup}>
                        <GitBranch size={22} color="#3CB8C2" />
                        <Text style={styles.cardTitle}>Developmental Milestones</Text>
                    </View>
                    <TouchableOpacity onPress={() => setActiveTab('milestones')} style={styles.seeAllButton}>
                        <Text style={styles.seeAllButtonText}>See All</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ paddingTop: 10 }}>
                    {milestones.filter(m => m.achieved).slice(0, 3).map((m) => (
                        <View key={m.id} style={styles.milestonePreviewItem}>
                            <View style={styles.milestoneInfo}>
                                <View style={styles.milestoneIconAchieved}>
                                    <CheckCircle size={20} color="#10B981" />
                                </View>
                                <View>
                                    <Text style={styles.milestoneTitle}>{m.title}</Text>
                                    <Text style={styles.milestoneDate}>Achieved on {m.date ? format(new Date(m.date), 'yyyy-MM-dd') : 'N/A'}</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={() => toggleMilestone(m.id)}
                                style={styles.milestoneUnmarkButton}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Minus size={18} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    ))}
                    {milestones.filter(m => m.achieved).length === 0 && (
                        <Text style={styles.noMilestonesText}>No milestones achieved yet.</Text>
                    )}
                </View>
            </View>
        </View>
    );

    // ** IMPLEMENTED LINE CHARTS **
    const renderCharts = () => (
        <View style={styles.tabSection}>
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.cardTitleGroup}>
                        <ChartIcon size={22} color="#3CB8C2" />
                        <Text style={styles.cardTitle}>Growth Trend Charts</Text>
                    </View>
                </View>

                {measurements.length < 2 ? (
                    <View style={styles.noDataBox}>
                        <TrendingDown size={32} color="#9CA3AF" style={{ marginBottom: 10 }} />
                        <Text style={styles.noDataText}>Log at least **two measurements** to view charts.</Text>
                        <TouchableOpacity onPress={() => setActiveTab('logEntry')} style={styles.logFirstButton}>
                            <Text style={styles.logFirstButtonText}>Log Entry</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        {/* --- 1. WEIGHT CHART --- */}
                        <View style={styles.chartWrapper}>
                            <Text style={styles.chartTitle}>Weight Over Time (kg)</Text>
                            <LineChart
                                data={{
                                    labels: chartData.labels,
                                    datasets: [{
                                        data: chartData.weights,
                                        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, // Red color
                                    }],
                                }}
                                width={screenWidth - 50} 
                                height={220}
                                chartConfig={{
                                    ...commonChartConfig,
                                    propsForDots: { r: '6', strokeWidth: '2', stroke: '#EF4444' },
                                    // Set y-axis label count to prevent clutter
                                    count: 5, 
                                }}
                                bezier
                                style={styles.chartStyle}
                            />
                        </View>

                        {/* --- 2. HEIGHT CHART --- */}
                        <View style={styles.chartWrapper}>
                            <Text style={styles.chartTitle}>Height Over Time (cm)</Text>
                            <LineChart
                                data={{
                                    labels: chartData.labels,
                                    datasets: [{
                                        data: chartData.heights,
                                        color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`, // Orange color
                                    }],
                                }}
                                width={screenWidth - 50}
                                height={220}
                                chartConfig={{
                                    ...commonChartConfig,
                                    propsForDots: { r: '6', strokeWidth: '2', stroke: '#F59E0B' },
                                    count: 5,
                                }}
                                bezier
                                style={styles.chartStyle}
                            />
                        </View>

                        {/* --- 3. HEAD CIRCUMFERENCE CHART --- */}
                        <View style={styles.chartWrapper}>
                            <Text style={styles.chartTitle}>Head Circumference Over Time (cm)</Text>
                            <LineChart
                                data={{
                                    labels: chartData.labels,
                                    datasets: [{
                                        data: chartData.heads,
                                        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Green color
                                    }],
                                }}
                                width={screenWidth - 50}
                                height={220}
                                chartConfig={{
                                    ...commonChartConfig,
                                    propsForDots: { r: '6', strokeWidth: '2', stroke: '#10B981' },
                                    count: 5,
                                }}
                                bezier
                                style={styles.chartStyle}
                            />
                        </View>
                    </>
                )}
            </View>
        </View>
    );

    // ** Fixed Function to Render All Records/Details **
    const renderRecords = () => (
        <View style={styles.tabSection}>
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.cardTitleGroup}>
                        <ListIcon size={22} color="#3CB8C2" />
                        <Text style={styles.cardTitle}>All Growth Records</Text>
                    </View>
                </View>

                {Object.keys(measurementsByMonth).length === 0 ? (
                    <View style={styles.noDataBox}>
                        <ListIcon size={32} color="#9CA3AF" style={{ marginBottom: 10 }} />
                        <Text style={styles.noDataText}>No records available. Log your first entry!</Text>
                        <TouchableOpacity onPress={() => setActiveTab('logEntry')} style={styles.logFirstButton}>
                            <Text style={styles.logFirstButtonText}>Log Entry</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View>
                        {Object.keys(measurementsByMonth).map(monthYear => (
                            <View key={monthYear} style={styles.monthlyGroup}>
                                <Text style={styles.monthlyTitle}>{monthYear}</Text>
                                {measurementsByMonth[monthYear].map(record => (
                                    <View key={record.id} style={styles.recordItem}>
                                        <View style={styles.recordHeader}>
                                            <Text style={styles.recordDate}>{format(parseISO(record.date), 'MMMM dd, yyyy')}</Text>
                                            <TouchableOpacity style={styles.recordEditButton}>
                                                <Icon name="edit" size={16} color="#3CB8C2" />
                                            </TouchableOpacity>
                                        </View>

                                        {/* --- FIX APPLIED HERE --- */}
                                        <View style={styles.recordDetailsRow}>
                                            {/* Weight Detail */}
                                            <View style={styles.detailItem}>
                                                <Scale size={14} color="#EF4444" style={styles.detailIcon} />
                                                <Text style={styles.recordDetail}>
                                                    <Text style={styles.boldText}>Weight:</Text> {record.weight.toFixed(1)} kg
                                                </Text>
                                            </View>
                                            {/* Height Detail */}
                                            <View style={styles.detailItem}>
                                                <Ruler size={14} color="#F59E0B" style={styles.detailIcon} />
                                                <Text style={styles.recordDetail}>
                                                    <Text style={styles.boldText}>Height:</Text> {record.height.toFixed(1)} cm
                                                </Text>
                                            </View>
                                            {/* Head Circumference Detail */}
                                            <View style={styles.detailItem}>
                                                <Target size={14} color="#10B981" style={styles.detailIcon} />
                                                <Text style={styles.recordDetail}>
                                                    <Text style={styles.boldText}>Head:</Text> {record.headCircumference.toFixed(1)} cm
                                                </Text>
                                            </View>
                                        </View>
                                        {/* --- END FIX --- */}

                                        {record.notes ? (
                                            <Text style={styles.recordNotes} numberOfLines={2}>
                                                <Text style={styles.boldText}>*Notes:*</Text> {record.notes}
                                            </Text>
                                        ) : null}
                                    </View>
                                ))}
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </View>
    );

    const renderMilestones = () => (
        <View style={styles.tabSection}>
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.cardTitleGroup}>
                        <GitBranch size={22} color="#3CB8C2" />
                        <Text style={styles.cardTitle}>Developmental Milestones</Text>
                    </View>
                </View>

                <View style={{ paddingTop: 10 }}>
                    {milestones.map((m) => (
                        <View key={m.id} style={styles.milestoneFullItem}>
                            <View style={styles.milestoneInfo}>
                                <View style={[styles.milestoneIcon, m.achieved ? styles.milestoneIconAchieved : styles.milestoneIconPending]}>
                                    {m.achieved ? (
                                        <CheckCircle size={22} color="#10B981" />
                                    ) : (
                                        <Activity size={22} color="#6B7280" />
                                    )}
                                </View>
                                <View style={{ flex: 1, marginRight: 10 }}>
                                    <Text style={[styles.milestoneTitle, m.achieved && { color: '#333' }]}>{m.title}</Text>
                                    <Text style={styles.milestoneDescription}>
                                        {m.achieved ? `Achieved on ${m.date ? format(new Date(m.date), 'yyyy-MM-dd') : 'N/A'}` : m.description}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={() => toggleMilestone(m.id)}
                                style={[
                                    styles.milestoneToggleButton,
                                    m.achieved ? styles.milestoneToggleUnmark : styles.milestoneToggleMark,
                                ]}
                            >
                                <Text style={[
                                    styles.milestoneToggleText,
                                    m.achieved && { color: '#EF4444' } // Make unmark text red for contrast
                                ]}>
                                    {m.achieved ? "Unmark" : "Mark as Achieved"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );


    const renderLogEntry = () => (
        <View style={styles.tabSection}>
            <View style={[styles.card, { marginBottom: 20 }]}>
                <View style={styles.cardHeader}>
                    <View style={styles.cardTitleGroup}>
                        <Plus size={22} color="#3CB8C2" />
                        <Text style={styles.cardTitle}>Add New Measurement</Text>
                    </View>
                </View>

                <View style={styles.formSpace}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Measurement Date *</Text>
                        <View style={styles.inputWithIcon}>
                            <TextInput
                                style={styles.input}
                                value={logFormData.date}
                                onChangeText={(text) => handleFormChange('date', text)}
                                placeholder="YYYY-MM-DD"
                            />
                            <Calendar size={20} color="#6B7280" style={styles.inputIcon} />
                        </View>

                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Weight (kg) *</Text>
                        <TextInput
                            style={styles.input}
                            value={logFormData.weight}
                            onChangeText={(text) => handleFormChange('weight', text.replace(/[^0-9.]/g, ''))} // Filter non-numeric
                            placeholder="e.g., 4.5"
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Height (cm) *</Text>
                        <TextInput
                            style={styles.input}
                            value={logFormData.height}
                            onChangeText={(text) => handleFormChange('height', text.replace(/[^0-9.]/g, ''))} // Filter non-numeric
                            placeholder="e.g., 55.0"
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Head Circumference (cm) *</Text>
                        <TextInput
                            style={styles.input}
                            value={logFormData.headCircumference}
                            onChangeText={(text) => handleFormChange('headCircumference', text.replace(/[^0-9.]/g, ''))} // Filter non-numeric
                            placeholder="e.g., 37.0"
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Notes (Optional)</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={logFormData.notes}
                            onChangeText={(text) => handleFormChange('notes', text)}
                            placeholder="Add any specific notes or context..."
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    <TouchableOpacity 
                        style={styles.submitButton} 
                        onPress={handleLogMeasurement} 
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitButtonText}>Log Measurement</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );


    // --- Main Screen Return ---
    return (
        <View style={styles.mainContainer}>
            {renderHeader()}
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'charts' && renderCharts()}
                {activeTab === 'milestones' && renderMilestones()}
                {activeTab === 'records' && renderRecords()} {/* Render the new Records tab */}
                {activeTab === 'logEntry' && renderLogEntry()}
                <View style={{ height: 50 }} />
            </ScrollView>
        </View>
    );
};

// --- 5. STYLESHEET ---

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    headerContainer: {
        backgroundColor: '#3CB8C2', // Teal background for header
        paddingTop: 40,
        paddingBottom: 15,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        marginBottom: 10,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitleGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 10,
    },
    headerText: {
        // marginLeft: 10,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFF',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#E0F7FA',
    },
    headerIconRight: {
        // For future icons like settings
    },
    // Tab Navigation Styles
    tabNavContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#4ECAE6', // Lighter teal
        borderRadius: 10,
        padding: 4,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    tabButtonActive: {
        backgroundColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 4,
    },
    tabButtonInactive: {
        backgroundColor: 'transparent',
    },
    tabTextActive: {
        color: '#3CB8C2',
        fontWeight: 'bold',
    },
    tabTextInactive: {
        color: '#E0F7FA',
        fontWeight: '600',
    },
    // General Section Styles
    tabSection: {
        paddingHorizontal: 15,
        marginTop: 10,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    cardTitleGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginLeft: 8,
    },

    // Overview Metrics Styles
    metricsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    metricCard: {
        width: '32%',
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        // borderWidth: 1, // Uncomment if you want border
        // borderColor: '#E5E7EB',
    },
    metricIconContainer: {
        borderWidth: 2,
        borderRadius: 50,
        padding: 8,
        marginBottom: 5,
    },
    metricLabel: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
    },
    metricValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginTop: 2,
    },
    metricBadgeDate: {
        marginTop: 5,
        paddingHorizontal: 8,
        paddingVertical: 2,
        backgroundColor: '#F3F4F6',
        borderRadius: 4,
    },
    metricBadgeTextDate: {
        fontSize: 10,
        color: '#6B7280',
    },

    // Milestone Preview/Full Styles
    seeAllButton: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: '#E0F7FA',
        borderRadius: 6,
    },
    seeAllButtonText: {
        color: '#3CB8C2',
        fontWeight: '600',
        fontSize: 12,
    },
    milestonePreviewItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    milestoneFullItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    milestoneInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    milestoneIcon: {
        borderRadius: 50,
        padding: 4,
        marginRight: 10,
    },
    milestoneIconAchieved: {
        // backgroundColor: '#D1FAE5', // Light green background
    },
    milestoneIconPending: {
        // backgroundColor: '#FEE2E2', // Light red background
    },
    milestoneTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    milestoneDescription: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 2,
    },
    milestoneDate: {
        fontSize: 12,
        color: '#10B981',
        fontWeight: '600',
        marginTop: 2,
    },
    milestoneUnmarkButton: {
        padding: 5,
    },
    noMilestonesText: {
        paddingVertical: 15,
        textAlign: 'center',
        color: '#6B7280',
    },
    milestoneToggleButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    milestoneToggleMark: {
        backgroundColor: '#3CB8C2',
    },
    milestoneToggleUnmark: {
        backgroundColor: '#FEE2E2', // Light Red
        borderWidth: 1,
        borderColor: '#EF4444',
    },
    milestoneToggleText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 12,
    },
    // Log Entry Form Styles
    formSpace: {
        marginTop: 10,
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        color: '#1F2937',
        marginBottom: 5,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 10,
        fontSize: 16,
        color: '#1F2937',
        backgroundColor: '#F9FAFB',
    },
    inputWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        backgroundColor: '#F9FAFB',
    },
    inputIcon: {
        position: 'absolute',
        right: 15,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: '#3CB8C2',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    // Chart Styles (New)
    noDataBox: {
        alignItems: 'center',
        paddingVertical: 30,
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginTop: 10,
    },
    noDataText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 15,
    },
    logFirstButton: {
        backgroundColor: '#3CB8C2',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    logFirstButtonText: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    chartWrapper: {
        marginBottom: 20,
        paddingTop: 10,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        paddingBottom: 20,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4B5563',
        marginBottom: 10,
        alignSelf: 'flex-start',
        paddingLeft: 10,
    },
    chartStyle: {
        marginVertical: 8,
        borderRadius: 16,
        // The LineChart component handles padding internally based on the provided width.
        marginHorizontal: 0,
    },
    // Records Tab Styles (New)
    monthlyGroup: {
        marginBottom: 20,
        borderLeftWidth: 3,
        borderLeftColor: '#3CB8C2',
        paddingLeft: 10,
    },
    monthlyTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 10,
    },
    recordItem: {
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    recordHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        paddingBottom: 8,
        marginBottom: 8,
    },
    recordDate: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#374151',
    },
    recordEditButton: {
        padding: 5,
    },
    recordDetailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '33%', // Distribute space equally
        paddingRight: 5,
    },
    detailIcon: {
        marginRight: 4,
    },
    recordDetail: {
        fontSize: 13,
        color: '#4B5563',
    },
    recordNotes: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 5,
        paddingTop: 5,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    boldText: {
        fontWeight: '600',
    },
});

export default GrowthTrackerScreen;