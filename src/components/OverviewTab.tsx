// components/OverviewTab.tsx

import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { Clock, Droplet, Activity } from 'lucide-react-native';
import { LineChart } from "react-native-chart-kit"; 
import { TrackingHistory } from "../../src/types";

// --- Type Definition for Chart Data (Optional but good practice) ---
interface ChartData {
    labels: string[];
    datasets: {
        data: number[];
    }[];
}

interface OverviewTabProps {
  history: TrackingHistory;
  formatDuration: (minutes: number) => string;
}

const { width } = Dimensions.get('window');
const SPACING = 16; 
// Calculate chart width: Screen width - container padding (16*2) - card padding (16*2)
const chartWidth = width - (SPACING * 4); 

// --- Line Chart Configuration ---
const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 1, 
    color: (opacity = 1) => `rgba(6, 182, 212, ${opacity})`, // cyan-500
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`, // gray-500
    style: {
        borderRadius: 8
    },
    propsForDots: {
        r: "5",
        strokeWidth: "2",
        stroke: "#06B6D4" // cyan-500
    }
};

// --- Function to Prepare Dynamic Sleep Data ---
/**
 * Processes sleep history to calculate total sleep duration per day 
 * for the last 7 days and formats it for the LineChart component.
 */
const prepareSleepTrendData = (sleepLogs: TrackingHistory['sleep'], numDays = 7): ChartData => {
    const dailySleep: { [key: string]: number } = {};
    const today = new Date();

    // Initialize dailySleep object for the last numDays, setting sleep to 0
    const dates: Date[] = [];
    for (let i = numDays - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        dates.push(date);
        dailySleep[date.toISOString().split('T')[0]] = 0;
    }

    // Populate dailySleep with actual data
    sleepLogs.forEach(log => {
        const dateKey = log.startTime.toISOString().split('T')[0];
        if (dailySleep.hasOwnProperty(dateKey)) {
            dailySleep[dateKey] += log.durationMinutes;
        }
    });

    // Format for the chart
    const labels: string[] = [];
    const data: number[] = [];

    dates.forEach(date => {
        const dateKey = date.toISOString().split('T')[0];
        // Labels: Use short day name (e.g., Mon, Tue)
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        // Data: Convert minutes to hours (to 1 decimal place)
        data.push(parseFloat((dailySleep[dateKey] / 60).toFixed(1)));
    });

    return {
        labels,
        datasets: [{ data }],
    };
};
// ----------------------------------------------------


// --- StatCard Component (Using defined Styles) ---
const StatCard = ({ icon, title, value, subValue }: { icon: React.JSX.Element, title: string, value: string, subValue: string }) => (
  <View
    style={[styles.statCard, { width: (width - (SPACING * 3)) / 2 }]} // Two columns with 16px padding on left/right and 16px in center
  >
    <View style={styles.statCardHeader}>
      {icon}
      <Text style={styles.statCardTitle}>{title}</Text>
    </View>
    <Text style={styles.statCardValue}>{value}</Text>
    <Text style={styles.statCardSubValue}>{subValue}</Text>
  </View>
);

export default function OverviewTab({ history, formatDuration }: OverviewTabProps) {
  const today = new Date().toISOString().split('T')[0];
  
  // Calculate today's stats (remains the same)
  const todaySleepMinutes = history.sleep
    .filter(log => log.startTime.toISOString().startsWith(today))
    .reduce((sum, log) => sum + log.durationMinutes, 0);

  const todayDiapers = history.diaper.filter(log => log.time.toISOString().startsWith(today)).length;
  const todayWetDiapers = history.diaper.filter(log => log.time.toISOString().startsWith(today) && (log.type === 'Wet' || log.type === 'Both')).length;
  const todayDirtyDiapers = history.diaper.filter(log => log.time.toISOString().startsWith(today) && (log.type === 'Dirty' || log.type === 'Both')).length;

  const todayActivityMinutes = history.activity
    .filter(log => log.time.toISOString().startsWith(today))
    .reduce((sum, log) => sum + log.durationMinutes, 0);

  // --- Generate Dynamic Data ---
  const sleepTrendData = prepareSleepTrendData(history.sleep);

  // --- Get the most recent logs for summary cards ---
  // Ensure history arrays are sorted by time descending (newest first) in the parent component
  const recentSleep = history.sleep[0];
  const recentDiaper = history.diaper[0];
  const recentActivity = history.activity[0];


  return (
    <View style={styles.container}>
      {/* Top Stat Cards */}
      <View style={styles.cardRow}>
        {/* Sleep Card */}
        <StatCard
          icon={<Clock size={20} color="#06B6D4" />}
          title="Sleep (24h)"
          value={formatDuration(todaySleepMinutes)}
          subValue={`${history.sleep.filter(log => log.startTime.toISOString().startsWith(today) && log.type === 'Nap').length} naps`}
        />
        
        {/* Diapers Card */}
        <StatCard
          icon={<Droplet size={20} color="#FBBF24" />}
          title="Diapers (Today)"
          value={`${todayDiapers}`}
          subValue={`${todayWetDiapers} wet, ${todayDirtyDiapers} dirty`}
        />
        
        {/* Activities Card (Placeholder for a third/wrap-around card) */}
        <StatCard
          icon={<Activity size={20} color="#EF4444" />}
          title="Activities (Today)"
          value={`${history.activity.filter(log => log.time.toISOString().startsWith(today)).length}`}
          subValue={formatDuration(todayActivityMinutes)}
        />
      </View>

      {/* Sleep Trend Chart */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Sleep Trend (Last 7 Days)</Text>
        
        {/* Use Dynamic Data */}
        <LineChart
            data={sleepTrendData}
            width={chartWidth}
            height={200}
            chartConfig={{ 
                ...chartConfig,
                decimalPlaces: 1, 
                propsForBackgroundLines: { strokeDasharray: "" }, 
            }}
            bezier
            style={styles.lineChart}
            yAxisSuffix="h"
            yAxisInterval={1}
            // Optional: Add a check for data presence to avoid errors
           hidePointsAtIndex={sleepTrendData.datasets[0].data.map((val, index) => val === 0 ? index : -1).filter(i => i !== -1)}
        />
      </View>
      
      {/* Recent History */}
      <View style={styles.recentHistoryRow}>
        {/* Recent Sleep */}
        <View style={[styles.recentCard, { width: (width - SPACING * 4) / 3 }]}>
          <Text style={styles.recentTitle}>Recent Sleep</Text>
          <Text style={styles.recentSubTextStrong}>{recentSleep?.type || 'N/A'}</Text>
          <Text style={styles.recentSubTextWeak}>
            {recentSleep?.startTime.toLocaleDateString() || ''} • {formatDuration(recentSleep?.durationMinutes || 0)}
          </Text>
        </View>
        
        {/* Recent Diaper */}
        <View style={[styles.recentCard, { width: (width - SPACING * 4) / 3 }]}>
          <Text style={styles.recentTitle}>Recent Diaper</Text>
          <Text style={styles.recentSubTextStrong}>{recentDiaper?.type || 'N/A'}</Text>
          <Text style={styles.recentSubTextWeak}>
            {recentDiaper?.time.toLocaleDateString() || ''}
          </Text>
        </View>
        
        {/* Recent Activity */}
        <View style={[styles.recentCard, { width: (width - SPACING * 4) / 3 }]}>
          <Text style={styles.recentTitle}>Recent Activity</Text>
          <Text style={styles.recentSubTextStrong}>{recentActivity?.type || 'N/A'}</Text>
          <Text style={styles.recentSubTextWeak}>
            {recentActivity?.time.toLocaleDateString() || ''} • {formatDuration(recentActivity?.durationMinutes || 0)}
          </Text>
        </View>
      </View>
    </View>
  );
}


// --- StyleSheet Definitions ---
const styles = StyleSheet.create({
  // Equivalent to: px-4
  container: {
    paddingHorizontal: SPACING,
  },
  
  // Equivalent to: flex-row flex-wrap justify-between
  cardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  // StatCard: bg-white rounded-xl p-4 shadow-md mb-4 border border-gray-100
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12, // rounded-xl
    padding: 16, // p-4
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16, // mb-4
    borderWidth: 1,
    borderColor: '#f3f4f6', // gray-100
  },

  // StatCard Header: flex-row items-center mb-2
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8, // mb-2
  },

  // StatCard Title: text-gray-900 font-bold ml-2
  statCardTitle: {
    color: '#111827', // gray-900
    fontWeight: '700', // font-bold
    marginLeft: 8, // ml-2
  },

  // StatCard Value: text-3xl font-extrabold text-teal-600
  statCardValue: {
    fontSize: 30, // text-3xl
    fontWeight: '800', // font-extrabold
    color: '#0d9488', // teal-600
  },

  // StatCard SubValue: text-xs text-gray-500 mt-1
  statCardSubValue: {
    fontSize: 12, // text-xs
    color: '#6b7280', // gray-500
    marginTop: 4, // mt-1
  },
  
  // Chart Card: bg-white rounded-xl shadow-md p-4 mt-2 mb-6
  chartCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 16, // p-4
    marginTop: 8, // mt-2
    marginBottom: 24, // mb-6
  },
  
  // Chart Title: text-gray-900 font-bold text-lg mb-3
  chartTitle: {
    color: '#111827', // gray-900
    fontWeight: '700', // font-bold
    fontSize: 18, // text-lg
    marginBottom: 12, // mb-3
  },
  
    // Style for the chart component itself
    lineChart: {
        marginVertical: 8,
        borderRadius: 8,
    },
    
  // Recent History Row: flex-row justify-between mb-6
  recentHistoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24, // mb-6
  },

  // Recent Card: bg-white rounded-xl p-3 shadow-sm border border-gray-100
  recentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12, // p-3
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f3f4f6', // gray-100
  },

  // Recent Title: text-gray-800 font-bold text-sm mb-1
  recentTitle: {
    color: '#1f2937', // gray-800
    fontWeight: '700', // font-bold
    fontSize: 14, // text-sm
    marginBottom: 4, // mb-1
  },

  // Recent SubText Strong: text-xs text-gray-600
  recentSubTextStrong: {
    fontSize: 12, // text-xs
    color: '#4b5563', // gray-600
  },

  // Recent SubText Weak: text-xs text-gray-500 mt-1
  recentSubTextWeak: {
    fontSize: 12, // text-xs
    color: '#6b7280', // gray-500
    marginTop: 4, // mt-1
  },
});