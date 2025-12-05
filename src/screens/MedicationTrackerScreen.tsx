import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
} from 'react-native';

// --- Type Definitions ---
type TabName = 'Overview' | 'Schedule' | 'AddNew';

interface IconProps {
  name: string;
  size?: number;
  style?: object;
}

interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  timesPerDay: number;
  startDate: string;
  endDate?: string;
  dosesCompleted: number; // New field to track completion
}

// --- Constants & Data ---
const { width } = Dimensions.get('window');

// Placeholder Icon Component (Using Emojis)
const Icon: React.FC<IconProps> = ({ name, size = 24, style = {} }) => (
  <Text style={[{ fontSize: size }, style]}>
    {
      {
        Total: '💊',
        Active: '✅',
        Completed: '🟠',
        Progress: '📈',
        Link: '🔗',
        Bell: '🔔',
        ArrowLeft: '⬅️',
        Dropdown: '🔽',
        Edit: '✏️',
        Download: '⬇️',
        CheckCircle: '🟢',
      }[name] || name
    }
  </Text>
);

// Dummy Medication Data
const initialMedications: Medication[] = [
  {
    id: 1,
    name: 'Axomillin',
    dosage: '250mg',
    frequency: '3x daily',
    timesPerDay: 3,
    startDate: 'Nov 24, 2025',
    endDate: 'Dec 24, 2025',
    dosesCompleted: 1, // Start with one dose completed
  },
];

// --- Sub-Components ---

// Component for the Medication Adherence graph
const AdherenceGraph: React.FC<{ medication: Medication }> = ({ medication }) => {
  // Mock data for a 7-day adherence chart (0 to 100%)
  const mockAdherence = [80, 75, 90, 100, 85, 95, 100];
  const chartHeight = 100;
  const barWidth = 30;

  const totalDoses = medication.timesPerDay;
  const adherence = Math.min(100, Math.floor((medication.dosesCompleted / totalDoses) * 100));

  return (
    <View style={styles.listSection}>
      <Text style={styles.sectionTitle}>Medication Adherence</Text>
      <View style={trackerStyles.chartContainer}>
        <View style={trackerStyles.chartLabels}>
          <Text style={trackerStyles.chartYLabel}>100%</Text>
          <Text style={trackerStyles.chartYLabel}>0%</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={trackerStyles.chartContent}>
          {/* Mock 7-day bar chart */}
          {mockAdherence.map((adherence, index) => (
            <View key={index} style={{ alignItems: 'center', marginRight: 10 }}>
              <View style={[trackerStyles.chartBar, { height: (adherence / 100) * chartHeight }]}>
                <Text style={trackerStyles.adherenceValue}>{adherence}%</Text>
              </View>
              <Text style={trackerStyles.chartLabel}>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}</Text>
            </View>
          ))}
          {/* Current progress for the active medication */}
          <View style={{ alignItems: 'center', marginLeft: 20 }}>
            <Text style={trackerStyles.currentProgressTitle}>Today's Progress</Text>
            <View style={[trackerStyles.chartBarCurrent, { height: (adherence / 100) * chartHeight }]}>
              <Text style={trackerStyles.adherenceValueCurrent}>{adherence}%</Text>
            </View>
            <Text style={trackerStyles.chartLabelCurrent}>{medication.name}</Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};


// Component for the data summary cards (Total, Active, Completed, Progress)
const MedicationSummary: React.FC<{ meds: Medication[] }> = ({ meds }) => {
  const totalMeds = meds.length;
  const activeMeds = meds.filter(m => m.dosesCompleted < m.timesPerDay).length; // Check if today's doses are complete
  const totalPossibleDosesToday = meds.reduce((sum, m) => sum + m.timesPerDay, 0);
  const totalCompletedDosesToday = meds.reduce((sum, m) => sum + m.dosesCompleted, 0);
  
  const overallProgress = totalPossibleDosesToday > 0 
    ? Math.floor((totalCompletedDosesToday / totalPossibleDosesToday) * 100) 
    : 0;

  return (
    <View style={styles.summaryContainer}>
      <Text style={styles.sectionTitle}>Medication Summary</Text>
      <View style={styles.summaryCards}>
        {/* Total Card */}
        <View style={styles.summaryCard}>
          <Icon name="Total" size={24} style={trackerStyles.totalIcon} />
          <Text style={styles.summaryValue}>{totalMeds}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
        {/* Active Card (Incomplete Doses) */}
        <View style={styles.summaryCard}>
          <Icon name="Active" size={24} style={trackerStyles.activeIcon} />
          <Text style={styles.summaryValue}>{activeMeds}</Text>
          <Text style={styles.summaryLabel}>Incomplete</Text>
        </View>
        {/* Completed Doses Today */}
        <View style={styles.summaryCard}>
          <Icon name="Completed" size={24} style={trackerStyles.completedIcon} />
          <Text style={styles.summaryValue}>{totalCompletedDosesToday}</Text>
          <Text style={styles.summaryLabel}>Doses Done</Text>
        </View>
        {/* Progress Card */}
        <View style={styles.summaryCard}>
          <Icon name="Progress" size={24} style={trackerStyles.progressIcon} />
          <Text style={styles.summaryValue}>{overallProgress}%</Text>
          <Text style={styles.summaryLabel}>Adherence</Text>
        </View>
      </View>
      <Text style={styles.progressFooter}>Today's Adherence</Text>
    </View>
  );
};

// Component for the list of active medications in Overview
const ActiveMedicationsList: React.FC<{ meds: Medication[] }> = ({ meds }) => {
    const incompleteMeds = meds.filter(m => m.dosesCompleted < m.timesPerDay);

    return (
        <View style={styles.listSection}>
            <View style={styles.listHeader}>
                <Text style={styles.sectionTitle}>Upcoming Doses</Text>
                <TouchableOpacity onPress={() => console.log('See All')}>
                    <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
            </View>
            {incompleteMeds.length > 0 ? (
                incompleteMeds.map((med, index) => (
                    <View key={index} style={trackerStyles.medicationItem}>
                        <View style={trackerStyles.medicationDetails}>
                            <Icon name="Active" size={20} style={trackerStyles.medicationIcon} />
                            <View>
                                <Text style={trackerStyles.medicationName}>{med.name}</Text>
                                <Text style={trackerStyles.medicationInfo}>{`${med.dosage} · ${med.frequency}`}</Text>
                            </View>
                        </View>
                        {/* Placeholder for Next Dose Time */}
                        <Text style={trackerStyles.nextDoseTime}>8:00 AM</Text>
                    </View>
                ))
            ) : (
                <Text style={trackerStyles.noDosesText}>All today's doses are completed! 🎉</Text>
            )}
        </View>
    );
};


// --- Tab Content Renderers ---

const OverviewTab: React.FC<{ medications: Medication[] }> = ({ medications }) => {
  const primaryMed = medications[0]; // Display graph for the first medication
  
  return (
    <View>
      <MedicationSummary meds={medications} />
      <ActiveMedicationsList meds={medications} />
      {primaryMed && <AdherenceGraph medication={primaryMed} />}
    </View>
  );
};

const ScheduleTab: React.FC<{ medications: Medication[], onComplete: (id: number) => void }> = ({ medications, onComplete }) => (
  <View style={styles.listSection}>
    <View style={styles.listHeader}>
      <Text style={styles.sectionTitle}>All Medications</Text>
      <TouchableOpacity style={trackerStyles.exportButton} onPress={() => console.log('Exporting PDF...')}>
        <Icon name="Download" size={16} style={{ color: '#6B7280' }} />
        <Text style={trackerStyles.exportText}>Export (PDF)</Text>
      </TouchableOpacity>
    </View>
    {medications.map((med) => {
      const isCompleted = med.dosesCompleted >= med.timesPerDay;
      return (
        <View key={med.id} style={trackerStyles.scheduleItem}>
          <View style={trackerStyles.scheduleDetails}>
            <Icon name={isCompleted ? "CheckCircle" : "Active"} size={20} style={{marginRight: 12, color: isCompleted ? '#34D399' : '#10B981'}} />
            <View style={{flexShrink: 1}}>
              <Text style={trackerStyles.medicationName}>{med.name}</Text>
              <Text style={trackerStyles.medicationInfo}>{`${med.dosage} · ${med.frequency}`}</Text>
              <Text style={trackerStyles.dateRangeText}>
                {`Doses Today: ${med.dosesCompleted}/${med.timesPerDay}`}
              </Text>
            </View>
          </View>
          <View style={trackerStyles.scheduleActions}>
            <TouchableOpacity style={trackerStyles.bellButton}>
              <Icon name="Bell" size={20} style={{ color: '#6B7280' }} />
            </TouchableOpacity>
            {isCompleted ? (
              <View style={[trackerStyles.completeButton, trackerStyles.completedStatus]}>
                <Text style={trackerStyles.completeButtonText}>DONE</Text>
              </View>
            ) : (
              <TouchableOpacity style={trackerStyles.completeButton} onPress={() => onComplete(med.id)}>
                <Text style={trackerStyles.completeButtonText}>Complete Dose</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    })}
  </View>
);

const AddNewTab: React.FC<{ onAddMedication: (med: Omit<Medication, 'id' | 'dosesCompleted'>) => void }> = ({ onAddMedication }) => {
  const [form, setForm] = useState({
    name: '',
    dosage: '',
    frequency: 'Daily',
    timesPerDay: '1',
    startDate: '27-11-2025',
    endDate: '',
    notes: '',
  });

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSave = () => {
      // Basic validation
      if (!form.name || !form.dosage || !form.timesPerDay) {
          alert("Please fill out Name, Dosage, and Times Per Day.");
          return;
      }

      onAddMedication({
          name: form.name,
          dosage: form.dosage,
          frequency: form.frequency,
          timesPerDay: parseInt(form.timesPerDay, 10),
          startDate: form.startDate,
          endDate: form.endDate || undefined,
      });

      // Reset form
      setForm({ name: '', dosage: '', frequency: 'Daily', timesPerDay: '1', startDate: '27-11-2025', endDate: '', notes: '' });
  };

  return (
    <View style={styles.listSection}>
      <Text style={trackerStyles.formHeaderTitle}>Add New Medication</Text>
      <Text style={trackerStyles.formHeaderSubtitle}>Enter medication details and schedule</Text>

      {/* Form Fields */}
      <Text style={trackerStyles.inputLabel}>Medication Name *</Text>
      <TextInput
        style={trackerStyles.input}
        placeholder="e.g. ibuprofen, Amoxicillin"
        value={form.name}
        onChangeText={v => handleChange('name', v)}
      />

      <View style={trackerStyles.rowContainer}>
        <View style={trackerStyles.halfInput}>
          <Text style={trackerStyles.inputLabel}>Dosage *</Text>
          <TextInput
            style={trackerStyles.input}
            placeholder="e.g. 5ml, 250mg"
            value={form.dosage}
            onChangeText={v => handleChange('dosage', v)}
          />
        </View>
        <View style={trackerStyles.halfInput}>
          <Text style={trackerStyles.inputLabel}>Frequency *</Text>
          <View style={trackerStyles.dropdown}>
            <TextInput
              style={trackerStyles.formDropdownInputText} // Used the unique name
              value={form.frequency}
              editable={false}
            />
            <Icon name="Dropdown" size={16} style={{ color: '#6B7280' }} />
          </View>
        </View>
      </View>

      <View style={trackerStyles.rowContainer}>
        <View style={trackerStyles.halfInput}>
          <Text style={trackerStyles.inputLabel}>Times Per Day *</Text>
          <TextInput
            style={trackerStyles.input}
            keyboardType="numeric"
            value={form.timesPerDay}
            onChangeText={v => handleChange('timesPerDay', v)}
          />
        </View>
        <View style={trackerStyles.halfInput}>
          <Text style={trackerStyles.inputLabel}>Start Date *</Text>
          <TextInput
            style={trackerStyles.input}
            placeholder="27-11-2025"
            value={form.startDate}
            onChangeText={v => handleChange('startDate', v)}
          />
        </View>
      </View>

      <Text style={trackerStyles.inputLabel}>End Date (Optional)</Text>
      <TextInput
        style={trackerStyles.input}
        placeholder="dd-mm-yyyy"
        value={form.endDate}
        onChangeText={v => handleChange('endDate', v)}
      />

      <Text style={trackerStyles.inputLabel}>Notes (Optional)</Text>
      <TextInput
        style={[trackerStyles.input, trackerStyles.notesInput]}
        placeholder="Any special instructions or notes"
        multiline
        value={form.notes}
        onChangeText={v => handleChange('notes', v)}
      />

      <TouchableOpacity
        style={trackerStyles.addButton}
        onPress={handleSave} // Call the save handler
      >
        <Icon name="Edit" size={18} style={{ color: '#fff' }} />
        <Text style={trackerStyles.addButtonText}>Add Medication</Text>
      </TouchableOpacity>
    </View>
  );
};

// --- Main Screen Component ---
const MedicationTrackerScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabName>('Overview');
  const [medications, setMedications] = useState<Medication[]>(initialMedications);
  
  // Handlers for features
  const handleEnableNotifications = () => {
      // MOCK: This is where you'd integrate react-native-push-notification
      console.log('Reminder/Notification integration triggered!');
      alert('Reminder functionality enabled (mocked)!');
  };

  const handleAddMedication = (newMedData: Omit<Medication, 'id' | 'dosesCompleted'>) => {
      const newMed: Medication = {
          ...newMedData,
          id: Date.now(), // Use timestamp for unique ID
          dosesCompleted: 0,
      };
      setMedications(prev => [...prev, newMed]);
      setActiveTab('Overview');
  };

  const handleCompleteDose = (id: number) => {
      setMedications(prevMeds => prevMeds.map(med => {
          if (med.id === id && med.dosesCompleted < med.timesPerDay) {
              return { ...med, dosesCompleted: med.dosesCompleted + 1 };
          }
          return med;
      }));
  };


  const renderContent = () => {
    switch (activeTab) {
      case 'Overview':
        return <OverviewTab medications={medications} />;
      case 'Schedule':
        return <ScheduleTab medications={medications} onComplete={handleCompleteDose} />;
      case 'AddNew':
        return <AddNewTab onAddMedication={handleAddMedication} />;
      default:
        return <OverviewTab medications={medications} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header Bar */}
      <View style={trackerStyles.headerBar}>
        <TouchableOpacity onPress={() => console.log('Go Back')}>
          <Icon name="ArrowLeft" size={24} style={trackerStyles.headerIcon} />
        </TouchableOpacity>
        <View>
          <Text style={trackerStyles.headerTitle}>Medication Tracker</Text>
          <Text style={trackerStyles.headerSubtitle}>Manage your baby's medications</Text>
        </View>
        <TouchableOpacity>
          <Icon name="Link" size={24} style={trackerStyles.headerIcon} />
        </TouchableOpacity>
      </View>

      {/* Baby Dropdown & Tabs */}
      <View style={trackerStyles.tabContainerWrapper}>
        <View style={trackerStyles.babyDropdown}>
          <Text style={trackerStyles.dropdownText}>ABC</Text>
          <Icon name="Dropdown" size={20} style={{ color: '#fff' }} />
        </View>
        <View style={trackerStyles.tabBar}>
          {['Overview', 'Schedule', 'AddNew'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[
                trackerStyles.tabButton,
                activeTab === tab && trackerStyles.activeTab,
              ]}
              onPress={() => setActiveTab(tab as TabName)}
            >
              <Text style={[
                trackerStyles.tabText,
                activeTab === tab && trackerStyles.activeTabText,
              ]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Notifications Bar */}
      <View style={trackerStyles.notificationBar}>
        <Icon name="Bell" size={16} style={{ color: '#6B7280' }} />
        <Text style={trackerStyles.notificationText}>
          Enable notifications to get medication reminders
        </Text>
        <TouchableOpacity 
          style={trackerStyles.enableButton} 
          onPress={handleEnableNotifications} // Linked to handler
        >
          <Text style={trackerStyles.enableButtonText}>Enable Notifications</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

// --- General Styles ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  listSection: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  seeAllText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
  summaryContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 16,
  },
  summaryCard: {
    alignItems: 'center',
    width: '24%', // ~4 cards
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  progressFooter: {
    fontSize: 10,
    color: '#D1D5DB',
    textAlign: 'right',
  },
});

// --- Tracker-Specific Styles ---
const trackerStyles = StyleSheet.create({
  // Header and Tabs
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#98c6d4', // Teal/Aqua Header Background
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#374151',
  },
  headerIcon: {
    color: '#1F2937',
  },
  tabContainerWrapper: {
    backgroundColor: '#98c6d4',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  babyDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.5)',
  },
  dropdownText: { // Used for the white text in the header
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tabText: {
    fontSize: 14,
    color: '#fff',
  },
  activeTabText: {
    color: '#1F2937',
    fontWeight: '600',
  },
  // Notification Bar
  notificationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB', // Light gray background
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  notificationText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#4B5563',
  },
  enableButton: {
    backgroundColor: '#3B82F6', // Blue 500
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  enableButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  // Summary Icons
  totalIcon: { color: '#06B6D4' },
  activeIcon: { color: '#10B981' },
  completedIcon: { color: '#F59E0B' },
  progressIcon: { color: '#8B5CF6' },

  // Overview Active Medications
  medicationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  medicationDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medicationIcon: {
    marginRight: 12,
    color: '#10B981', // Green for active
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  medicationInfo: {
    fontSize: 12,
    color: '#6B7280',
  },
  nextDoseTime: {
      fontSize: 14,
      fontWeight: '600',
      color: '#374151',
  },
  noDosesText: {
      fontSize: 14,
      color: '#6B7280',
      textAlign: 'center',
      paddingVertical: 20,
      fontStyle: 'italic',
  },
  medicationAction: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
  },
  bellIcon: {
    color: '#6B7280',
  },
  
  // Adherence Chart Styles
  chartContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 10,
    backgroundColor: '#F9FAFB',
  },
  chartLabels: {
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingRight: 10,
  },
  chartYLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 5,
  },
  chartContent: {
      alignItems: 'flex-end',
      paddingHorizontal: 10,
  },
  chartBar: {
    width: 25,
    backgroundColor: '#BAE6FD', // Light Blue
    borderRadius: 4,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 5,
  },
  chartBarCurrent: {
      width: 40,
      backgroundColor: '#3B82F6', // Darker Blue for current
      borderRadius: 4,
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingTop: 5,
  },
  adherenceValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0369A1',
    marginBottom: 2,
  },
  adherenceValueCurrent: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: 2,
  },
  currentProgressTitle: {
      fontSize: 12,
      color: '#4B5563',
      marginBottom: 5,
  },
  chartLabel: {
    marginTop: 5,
    fontSize: 10,
    color: '#4B5563',
  },
  chartLabelCurrent: {
      marginTop: 5,
      fontSize: 12,
      fontWeight: '600',
      color: '#1F2937',
  },
  
  // Schedule Tab
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  scheduleDetails: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  dateRangeText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  scheduleActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bellButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  completeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  completedStatus: {
      backgroundColor: '#D1FAE5', // Light green background for DONE
  },
  completeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  exportText: {
    marginLeft: 4,
    fontSize: 13,
    color: '#4B5563',
  },
  // Add New Tab (Form)
  formHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  formHeaderSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1F2937',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  formDropdownInputText: { // Unique name for dark text in form
    fontSize: 16,
    color: '#1F2937',
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  addButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#06B6D4',
    paddingVertical: 12,
    borderRadius: 4,
    marginTop: 30,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default MedicationTrackerScreen;