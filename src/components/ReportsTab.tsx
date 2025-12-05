// components/ReportsTab.tsx

import React, { useMemo } from 'react'; // 💡 ADDED useMemo
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Download, TrendingUp, Droplet } from 'lucide-react-native';
import { TrackingHistory, SleepLog, ActivityLog } from "../../src/types"; // 💡 ADDED SleepLog, ActivityLog
import { PieChart, BarChart } from "react-native-chart-kit";

// Get screen width for responsive chart sizing
const screenWidth = Dimensions.get("window").width;
const chartWidth = screenWidth - 32 - 32; // Screen width - container padding - card padding (16*2)

interface ReportsTabProps {
    history: TrackingHistory;
    formatDuration: (minutes: number) => string;
}

// --- Helper Functions for Data Calculation ---

// Helper function to get the start of the current week (Sunday/Monday)
const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    // 0 = Sunday, 1 = Monday. We'll use Monday (1) as the start of the week.
    const day = d.getDay(); 
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
};

// --- Data Processing Function ---
const processHistoryForReport = (history: TrackingHistory, formatDuration: (minutes: number) => string) => {
    const today = new Date();
    const weekStart = getWeekStart(today);

    // Filter logs for the current week (from Monday 00:00:00 to now)
    const currentWeekSleep = history.sleep.filter(log => log.startTime.getTime() >= weekStart.getTime());
    const currentWeekDiaper = history.diaper.filter(log => log.time.getTime() >= weekStart.getTime());
    const currentWeekActivity = history.activity.filter(log => log.time.getTime() >= weekStart.getTime());

    // --- 1. Weekly Stats ---
    const totalSleepMinutes = currentWeekSleep.reduce((sum, log) => sum + log.durationMinutes, 0);
    const totalDiapers = currentWeekDiaper.length;
    const totalActivityMinutes = currentWeekActivity.reduce((sum, log) => sum + log.durationMinutes, 0);
    const totalDaysLogged = Array.from(new Set(
        currentWeekSleep.map(log => log.startTime.toISOString().substring(0, 10))
    )).length || 1; // Prevent division by zero

    const weeklyStats = {
        sleepHours: (totalSleepMinutes / 60).toFixed(1),
        diapers: totalDiapers,
        activities: currentWeekActivity.length,
        avgSleepHoursPerDay: (totalSleepMinutes / 60 / totalDaysLogged).toFixed(1),
    };

    // --- 2. Sleep Quality Distribution (Pie Chart Data) ---
    const qualityCounts = currentWeekSleep.reduce((acc, log) => {
        const quality = log.quality || 'Unknown';
        acc[quality] = (acc[quality] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const sleepQualityData = [
        { name: "Excellent", population: qualityCounts['Excellent'] || 0, color: "#10b981", legendFontColor: "#7f7f7f", legendFontSize: 14 }, // emerald-500
        { name: "Good", population: qualityCounts['Good'] || 0, color: "#3b82f6", legendFontColor: "#7f7f7f", legendFontSize: 14 }, // blue-500
        { name: "Fair", population: qualityCounts['Fair'] || 0, color: "#f59e0b", legendFontColor: "#7f7f7f", legendFontSize: 14 }, // amber-500
        { name: "Poor", population: qualityCounts['Poor'] || 0, color: "#ef4444", legendFontColor: "#7f7f7f", legendFontSize: 14 }, // red-500
        { name: "Unknown", population: qualityCounts['Unknown'] || 0, color: "#9ca3af", legendFontColor: "#7f7f7f", legendFontSize: 14 } // gray-400
    ].filter(d => d.population > 0); // Only show categories with data

    // --- 3. Daily Breakdown (Bar Chart Data) ---
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dailyData: Record<string, { sleep: number, diaper: number, activity: number }> = {};
    
    // Initialize dailyData for the week
    for (let i = 0; i < 7; i++) {
        const dayDate = new Date(weekStart);
        dayDate.setDate(weekStart.getDate() + i);
        const dayKey = dayNames[i];
        if (dayDate.getTime() <= today.getTime() || i === 0) { // Only show days that have passed or today
             dailyData[dayKey] = { sleep: 0, diaper: 0, activity: 0 };
        }
    }

    // Populate daily data
    const getDayKey = (date: Date): string => dayNames[(date.getDay() - 1 + 7) % 7];

    currentWeekSleep.forEach(log => {
        const key = getDayKey(log.startTime);
        if (dailyData[key]) dailyData[key].sleep += log.durationMinutes / 60; // Convert to hours
    });
    currentWeekDiaper.forEach(log => {
        const key = getDayKey(log.time);
        if (dailyData[key]) dailyData[key].diaper += 1;
    });
    currentWeekActivity.forEach(log => {
        const key = getDayKey(log.time);
        if (dailyData[key]) dailyData[key].activity += log.durationMinutes / 60; // Convert to hours
    });

    const dailyBreakdownData = {
        labels: Object.keys(dailyData),
        datasets: [
            {
                data: Object.values(dailyData).map(d => parseFloat(d.sleep.toFixed(1))), // Sleep Hours
                color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`, // blue-600
                label: "Sleep (h)",
            },
            {
                data: Object.values(dailyData).map(d => d.diaper), // Diapers
                color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`, // amber-500
                label: "Diapers",
            },
            {
                data: Object.values(dailyData).map(d => parseFloat(d.activity.toFixed(1))), // Activities Hours
                color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, // red-500
                label: "Activity (h)",
            }
        ],
    };

    // --- 4. Activity Time Breakdown (Horizontal Bar Chart Data) ---
    const activityTotals = currentWeekActivity.reduce((acc, log) => {
        acc[log.type] = (acc[log.type] || 0) + log.durationMinutes;
        return acc;
    }, {} as Record<string, number>);

    const activityLabels = Object.keys(activityTotals);
    const activityTimeData = {
        labels: activityLabels,
        datasets: [{
            data: Object.values(activityTotals), // Duration in minutes
            color: (opacity = 1) => `rgba(20, 184, 166, ${opacity})`, // teal-500 for bars
        }]
    };
    
    // --- 5. Key Insights ---
    const sleepInsight = `Sleep Pattern: Average ${weeklyStats.avgSleepHoursPerDay} hours of sleep per day this week.`;
    const diaperInsight = `Diaper Changes: ${weeklyStats.diapers} diapers logged this week.`;

    return {
        weeklyStats,
        sleepQualityData,
        dailyBreakdownData,
        activityTimeData,
        sleepInsight,
        diaperInsight,
    };
};
// --- END Data Processing Function ---


// --- Chart Configuration ---
const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(1, 1, 1, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`, // gray-500
    style: {
        borderRadius: 16
    },
    propsForDots: {
        r: "6",
        strokeWidth: "2",
        stroke: "#ffa726"
    }
};

export default function ReportsTab({ history, formatDuration }: ReportsTabProps) {
    // 💡 Use useMemo to run the complex data processing only when 'history' changes
    const reportData = useMemo(() => {
        return processHistoryForReport(history, formatDuration);
    }, [history, formatDuration]);


    return (
        <View style={styles.container}>
            {/* Header: Title and Export Button */}
            <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>Weekly Reports</Text>
                <TouchableOpacity style={styles.exportButton}>
                    <Download size={16} color="white" />
                    <Text style={styles.exportButtonText}>Export Report</Text>
                </TouchableOpacity>
            </View>
            
            {/* 1. This Week Summary */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>This Week Summary</Text>
                <View style={styles.summaryRow}>
                    <View style={styles.summaryItem}>
                        {/* 💡 Use LIVE data */}
                        <Text style={[styles.summaryValue, styles.summarySleep]}>{reportData.weeklyStats.sleepHours}h</Text>
                        <Text style={styles.summaryLabel}>Sleep</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        {/* 💡 Use LIVE data */}
                        <Text style={[styles.summaryValue, styles.summaryDiaper]}>{reportData.weeklyStats.diapers}</Text>
                        <Text style={styles.summaryLabel}>Diapers</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        {/* 💡 Use LIVE data (Activities is count of logs, not duration) */}
                        <Text style={[styles.summaryValue, styles.summaryActivity]}>{reportData.weeklyStats.activities}</Text>
                        <Text style={styles.summaryLabel}>Activities</Text>
                    </View>
                </View>
            </View>

            {/* 2. Sleep Quality Distribution Chart (Pie Chart) */}
            {reportData.sleepQualityData.length > 0 && (
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Sleep Quality Distribution</Text>
                <PieChart
                    // 💡 Use LIVE data
                    data={reportData.sleepQualityData}
                    width={chartWidth}
                    height={180}
                    chartConfig={chartConfig}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                    style={styles.chart}
                />
            </View>
            )}

            {/* 3. Daily Breakdown Chart (Grouped Bar Chart) */}
            {reportData.dailyBreakdownData.labels.length > 0 && (
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Daily Breakdown (Hours/Count)</Text>
                <BarChart
                    style={styles.chart}
                    // 💡 Use LIVE data
                    data={reportData.dailyBreakdownData}
                    width={chartWidth}
                    height={220}
                    yAxisLabel=""
                    yAxisSuffix=""
                    chartConfig={{
                        ...chartConfig,
                        barPercentage: 0.5,
                        propsForLabels: { fontSize: 10 },
                        decimalPlaces: 0, // Show integer values for count and hours (rounded)
                    }}
                    verticalLabelRotation={0}
                    showValuesOnTopOfBars={true}
                    fromZero={true}
                />
            </View>
            )}
            
            {/* 4. Activity Time Breakdown Chart (Horizontal Bar Chart) */}
            {reportData.activityTimeData.labels.length > 0 && (
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Activity Time Breakdown (Minutes)</Text>
                <BarChart
                    style={styles.chart}
                    // 💡 Use LIVE data
                    data={reportData.activityTimeData}
                    width={chartWidth}
                    height={250}
                    yAxisLabel=""
                    yAxisSuffix="m"
                    chartConfig={{
                        ...chartConfig,
                        barPercentage: 0.5,
                        propsForLabels: { fontSize: 10 },
                        // Horizontal bar chart needs its own color logic
                        color: (opacity = 1) => `rgba(20, 184, 166, ${opacity})`,
                    }}
                    horizontalLabelRotation={-30}
                    fromZero={true}
                    withHorizontalLabels={true}
                    withVerticalLabels={false}
                    flatColor={true} 
                    showValuesOnTopOfBars={true}
                />
            </View>
            )}

            {/* 5. Key Insights */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Key Insights</Text>
                <View style={styles.insightItem}>
                    <TrendingUp size={16} color="#06B6D4" />
                    {/* 💡 Use LIVE insight */}
                    <Text style={styles.insightText}>{reportData.sleepInsight}</Text>
                </View>
                <View style={styles.insightItem}>
                    <Droplet size={16} color="#FBBF24" />
                    {/* 💡 Use LIVE insight */}
                    <Text style={styles.insightText}>{reportData.diaperInsight}</Text>
                </View>
            </View>
        </View>
    );
}

// --- StyleSheet Definitions ---
// (Styles remain unchanged, but are included here for completeness)
const styles = StyleSheet.create({
    // Equivalent to: px-4
    container: {
        paddingHorizontal: 16,
    },

    // Header: flex-row justify-between items-center mb-6
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24, // mb-6
    },
    
    // Header Title: text-2xl font-bold text-gray-900
    headerTitle: {
        fontSize: 24, // text-2xl
        fontWeight: '700', // font-bold
        color: '#111827', // gray-900
    },
    
    // Export Button: flex-row items-center bg-teal-500 px-3 py-2 rounded-lg
    exportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#14b8a6', // teal-500
        paddingHorizontal: 12, // px-3
        paddingVertical: 8, // py-2
        borderRadius: 8, // rounded-lg
    },

    // Export Button Text: text-white ml-2 text-sm font-medium
    exportButtonText: {
        color: 'white',
        marginLeft: 8, // ml-2
        fontSize: 14, // text-sm
        fontWeight: '500', // font-medium
    },

    // Card: bg-white rounded-xl shadow-md p-4 mb-6
    card: {
        backgroundColor: 'white',
        borderRadius: 12, // rounded-xl
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        padding: 16, // p-4
        marginBottom: 24, // mb-6
    },
    
    // Section Title: text-lg font-bold mb-3/mb-1 text-gray-800
    sectionTitle: {
        fontSize: 18, // text-lg
        fontWeight: '700', // font-bold
        color: '#1f2937', // gray-800
        marginBottom: 12, // mb-3 (adjusted for consistency)
    },

    // Summary Row: flex-row justify-around border-t border-gray-100 pt-3
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6', // gray-100
        paddingTop: 12, // pt-3
    },

    // Summary Item: items-center
    summaryItem: {
        alignItems: 'center',
    },

    // Summary Value: text-xl font-extrabold 
    summaryValue: {
        fontSize: 20, // text-xl
        fontWeight: '800', // font-extrabold
    },

    // Sleep Value: text-blue-600
    summarySleep: {
        color: '#2563eb', // blue-600
    },

    // Diaper Value: text-amber-500
    summaryDiaper: {
        color: '#f59e0b', // amber-500
    },

    // Activity Value: text-red-500
    summaryActivity: {
        color: '#ef4444', // red-500
    },

    // Summary Label: text-xs text-gray-500
    summaryLabel: {
        fontSize: 12, // text-xs
        color: '#6b7280', // gray-500
        marginTop: 2,
    },

    // Style for the chart component wrapper
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
    
    // Insight Item: flex-row items-center mb-2
    insightItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8, // mb-2
    },

    // Insight Text: text-gray-700 ml-2
    insightText: {
        color: '#374151', // gray-700
        marginLeft: 8, // ml-2
        flex: 1, // Allows text to wrap nicely
    },
});