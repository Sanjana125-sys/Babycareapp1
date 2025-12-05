import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Check, ChevronRight, Award, Smile, Footprints, Speech, Heart } from 'lucide-react-native';

// --- Data Structure for Milestones ---
interface MilestoneItem {
  id: string;
  name: string;
  achieved: boolean;
  dateAchieved: Date | null;
}

interface MilestoneCategory {
  category: string;
  icon: React.ReactNode;
  data: MilestoneItem[];
}

// --- Initial Mock Data ---
const initialMilestones: MilestoneCategory[] = [
  {
    category: 'Gross Motor',
    icon: <Footprints color="#ef4444" size={24} />, // Red
    data: [
      { id: 'm1', name: 'Holds head up (4 weeks)', achieved: true, dateAchieved: new Date(2025, 1, 15) },
      { id: 'm2', name: 'Rolls over (4 months)', achieved: false, dateAchieved: null },
      { id: 'm3', name: 'Sits without support (6 months)', achieved: false, dateAchieved: null },
      { id: 'm4', name: 'Crawls (9 months)', achieved: false, dateAchieved: null },
    ],
  },
  {
    category: 'Fine Motor & Cognitive',
    icon: <Speech color="#f97316" size={24} />, // Orange
    data: [
      { id: 'm5', name: 'Reaches for toys (3 months)', achieved: true, dateAchieved: new Date(2025, 2, 5) },
      { id: 'm6', name: 'Transfers object hand-to-hand (5 months)', achieved: false, dateAchieved: null },
      { id: 'm7', name: 'Pincer grasp (9 months)', achieved: false, dateAchieved: null },
    ],
  },
  {
    category: 'Social & Emotional',
    icon: <Smile color="#10b981" size={24} />, // Green
    data: [
      { id: 'm8', name: 'Smiles socially (6 weeks)', achieved: true, dateAchieved: new Date(2025, 1, 28) },
      { id: 'm9', name: 'Knows stranger danger (9 months)', achieved: false, dateAchieved: null },
      { id: 'm10', name: 'Waves bye-bye (10 months)', achieved: false, dateAchieved: null },
    ],
  },
  {
    category: 'Language',
    icon: <Heart color="#3b82f6" size={24} />, // Blue
    data: [
      { id: 'm11', name: 'Coos (8 weeks)', achieved: true, dateAchieved: new Date(2025, 1, 20) },
      { id: 'm12', name: 'Babbles "mama/dada" (8 months)', achieved: false, dateAchieved: null },
      { id: 'm13', name: 'Understands "No" (10 months)', achieved: false, dateAchieved: null },
    ],
  },
];

export default function MilestoneScreen() {
  const [milestones, setMilestones] = useState(initialMilestones);

  // --- Handler to Log a Milestone ---
  const handleLogMilestone = (categoryId: string, milestoneId: string) => {
    setMilestones(prevMilestones => prevMilestones.map(category => {
      if (category.category === categoryId) {
        return {
          ...category,
          data: category.data.map(item => {
            if (item.id === milestoneId) {
              const newAchievedState = !item.achieved;
              
              if (newAchievedState) {
                Alert.alert(
                  'Milestone Logged! 🎉', 
                  `Congrats! Your baby achieved "${item.name}" today, ${new Date().toLocaleDateString()}.`
                );
              } else {
                 Alert.alert('Reset', `Milestone "${item.name}" has been reset.`);
              }
              
              return {
                ...item,
                achieved: newAchievedState,
                dateAchieved: newAchievedState ? new Date() : null,
              };
            }
            return item;
          }),
        };
      }
      return category;
    }));
  };

  const renderMilestoneItem = (categoryName: string, item: MilestoneItem) => (
    <TouchableOpacity 
      key={item.id} 
      style={styles.milestoneCard}
      onPress={() => handleLogMilestone(categoryName, item.id)}
      activeOpacity={0.8}
    >
      <View style={styles.milestoneTextContent}>
        <Text style={styles.milestoneName}>{item.name}</Text>
        {item.achieved && item.dateAchieved && (
          <Text style={styles.milestoneDate}>
            Achieved: {item.dateAchieved.toLocaleDateString()}
          </Text>
        )}
      </View>
      
      <View style={item.achieved ? styles.achievedIndicator : styles.unachievedIndicator}>
        {item.achieved ? <Check color="white" size={20} /> : null}
      </View>
    </TouchableOpacity>
  );

  const renderCategory = (categoryData: MilestoneCategory) => (
    <View key={categoryData.category} style={styles.categoryContainer}>
      <View style={styles.categoryHeader}>
        {categoryData.icon}
        <Text style={styles.categoryTitle}>{categoryData.category}</Text>
        <TouchableOpacity style={styles.viewDetailsButton}>
          <Text style={styles.viewDetailsText}>Tips</Text>
          <ChevronRight color="#3b82f6" size={16} />
        </TouchableOpacity>
      </View>
      
      {categoryData.data.map(item => renderMilestoneItem(categoryData.category, item))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Award color="white" size={24} />
        <Text style={styles.headerTitle}>Baby Milestones</Text>
        <Text style={styles.headerSubtitle}>Celebrate every developmental step!</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {milestones.map(renderCategory)}
      </ScrollView>
    </View>
  );
}

// --- Stylesheet Definitions ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Light gray background
  },
  header: {
    backgroundColor: '#3B82F6', // Blue-500
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
  },
  headerSubtitle: {
    color: '#DBEAFE', // Blue-100
    fontSize: 14,
    marginTop: 4,
  },
  scrollContent: {
    padding: 16,
  },
  
  // Category Styles
  categoryContainer: {
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 5,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 10,
    flex: 1,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },

  // Milestone Item Styles
  milestoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  milestoneTextContent: {
    flex: 1,
    paddingRight: 10,
  },
  milestoneName: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  milestoneDate: {
    fontSize: 12,
    color: '#10B981', // Green for confirmed
    marginTop: 2,
    fontWeight: '600',
  },
  
  // Indicator Styles
  achievedIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#10B981', // Green
    justifyContent: 'center',
    alignItems: 'center',
  },
  unachievedIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#D1D5DB', // Gray
    backgroundColor: 'transparent',
  },
});