import React, { useState } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    TouchableOpacity, 
    Image, 
    StyleSheet, 
    Dimensions,
    SafeAreaView // Added for safe area support
} from 'react-native';

// Assuming 'lucide-react-native' is installed for icons
import { Baby, Bath, BabyIcon, Utensils, Activity, Play, ArrowLeft } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

// Get screen width for responsive sizing
const { width } = Dimensions.get('window');

// --- 1. Define TypeScript Interfaces ---

/**
 * Interface for a single baby care guide object.
 */
interface Guide {
  id: string;
  title: string;
  icon: React.ReactElement<LucideIcon>;
  image: string; // URL for the image
  steps: string[];
  tips: string;
}

/**
 * Type for the currently active tab state.
 */
type ActiveTab = 'all' | '1' | '3'; // '1' for Bathing, '3' for Diapers

const ParentalGuideScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');

  // Placeholder for video preview images.
  const mockImage = 'https://picsum.photos/900/400?random=';

  // --- 2. Mock Data ---
  const careGuides: Guide[] = [
    {
      id: '1',
      title: 'How to Bathe a Baby',
      icon: <Bath size={24} color="#4A90E2" />,
      image: mockImage + '1',
      steps: [
        'Gather all supplies beforehand (towels, baby wash, clean diaper, clothes)',
        'Fill the tub with 2-3 inches of warm water (test temperature with elbow)',
        'Undress baby and gently lower them into the water feet first',
        'Support the head and neck with one hand while washing with the other',
        'Clean face with a damp cloth, then hair with gentle baby shampoo',
        'Wash body from top to bottom, paying attention to creases',
        'Lift baby out carefully and wrap in a soft towel immediately',
        'Apply lotion if skin feels dry and dress in clean clothes'
      ],
      tips: 'Never leave baby unattended in water, even for a moment.'
    },
    {
      id: '2',
      title: 'How to Hold a Baby',
      icon: <Baby size={24} color="#4A90E2" />,
      image: mockImage + '2',
      steps: [
        'Support the head and neck when holding newborns (under 3 months)',
        "Place one hand under the baby's head and neck, the other under their bottom",
        'Bring baby close to your chest to make them feel secure',
        // ... steps
      ],
      tips: 'Maintain eye contact and speak softly to help baby feel secure.'
    },
    {
      id: '3',
      title: 'How to Change a Diaper',
      icon: <BabyIcon size={24} color="#4A90E2" />,
      image: mockImage + '3',
       steps: [
        'Lay baby on a safe, flat surface with a changing pad',
        'Remove dirty diaper by lifting baby\'s legs gently by ankles',
        'Clean the area thoroughly with wipes (front to back for girls)',
        'Slide the dirty diaper out from under the baby',
        'Place new diaper under baby, adjusting for proper fit',
        'Fasten the tabs snugly but not too tight (2 fingers should fit)',
        'Check that leg cuffs aren\'t tucked in to prevent leaks',
        'Dispose of diaper properly and wash hands thoroughly'
      ],
      tips: 'Keep one hand on baby at all times during changing.'
    },
    {
      id: '4',
      title: 'How to Feed a Baby',
      icon: <Utensils size={24} color="#4A90E2" />,
      image: mockImage + '4',
      steps: [
        'Wash hands thoroughly before preparing formula or handling breast pump',
        'For breastfeeding: Find a comfortable position with baby facing you',
        'For bottle feeding: Hold baby upright at 45-degree angle',
        'Ensure milk/formula is at body temperature (test on wrist)',
        'Burp baby halfway through and after feeding',
        'Watch for hunger cues (rooting, sucking on hands, fussiness)',
        'Feed on demand - typically every 2-3 hours for newborns',
        'Keep baby awake during feeding by gentle touching'
      ],
      tips: 'Watch for signs of fullness like turning away or falling asleep.'
    },
    {
      id: '5',
      title: 'Active Baby Care',
      icon: <Activity size={24} color="#4A90E2" />,
      image: mockImage + '5',
      steps: [
        'Provide supervised tummy time to strengthen neck muscles',
        'Engage with age-appropriate toys and activities',
        'Talk, sing, and read to baby regularly',
        'Take baby for walks in a stroller for fresh air and stimulation',
        'Maintain a consistent daily routine for naps and meals',
        'Respond quickly to cries to build trust and security',
        'Create a safe sleep environment on their back in crib',
        'Monitor developmental milestones and consult pediatrician with concerns'
      ],
      tips: 'Babies thrive on routine and responsive caregiving.'
    }
  ];

  // --- 3. Filtering Logic ---
  const getGuidesForTab = (tab: ActiveTab): Guide[] => {
    switch (tab) {
      case 'all':
        return careGuides;
      case '1':
        return careGuides.filter(guide => guide.id === '1');
      case '3':
        return careGuides.filter(guide => guide.id === '3');
      default:
        return [];
    }
  };

  const guidesToShow = getGuidesForTab(activeTab);

  // --- 4. Component Render ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        
        {/* Header */}
        <View style={styles.headerBackground}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => console.log('Go Back')} style={styles.backButton}>
                <ArrowLeft size={24} color="white" />
            </TouchableOpacity>

            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Parental Guide</Text>
              <Text style={styles.headerSubtitle}>Essential baby care techniques</Text>
            </View>
            <Baby size={32} color="white" />
          </View>

          <Text style={styles.headerInstructionText}>
            Step-by-step instructions for caring for your little one
          </Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'all' && styles.tabActive]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
              All Guides
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === '1' && styles.tabActive]}
            onPress={() => setActiveTab('1')}
          >
            <Text style={[styles.tabText, activeTab === '1' && styles.tabTextActive]}>
              Bathing
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === '3' && styles.tabActive]}
            onPress={() => setActiveTab('3')}
          >
            <Text style={[styles.tabText, activeTab === '3' && styles.tabTextActive]}>
              Diapers
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
          {guidesToShow.map((guide) => (
            <View key={guide.id} style={styles.guideCard}>
              {/* Guide Header */}
              <View style={styles.guideHeader}>
                <View style={styles.iconWrapper}>
                  {guide.icon}
                </View>
                <Text style={styles.guideTitle}>{guide.title}</Text>
              </View>

              {/* Preview Image/Video Placeholder */}
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: guide.image }}
                  style={styles.guideImage}
                  resizeMode="cover"
                />
                {/* Play Button Overlay */}
                <TouchableOpacity 
                    style={styles.playButtonOverlay} 
                    onPress={() => console.log(`Play video for: ${guide.title}`)}
                >
                  <View style={styles.playButtonCircle}>
                    <Play size={24} color="#4A90E2" fill="#4A90E2" />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Steps */}
              <View style={styles.stepsContainer}>
                <Text style={styles.stepsTitle}>Step-by-step instructions:</Text>
                {guide.steps.map((step, index) => (
                  <View key={index} style={styles.stepItem}>
                    <View style={styles.stepNumberCircle}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}

                {/* Tips */}
                <View style={styles.tipBox}>
                  <Text style={styles.tipTitle}>Pro Tip:</Text>
                  <Text style={styles.tipText}>{guide.tips}</Text>
                </View>
              </View>
            </View>
          ))}
          {/* Add padding at the bottom for ScrollView content */}
          <View style={{ height: 30 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

// --- 5. Stylesheet Creation (Tailwind Class Conversion) ---
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#4A90E2', // Blue header color extending into safe area
    },
    mainContainer: {
        flex: 1,
        backgroundColor: '#F7F8FC', // Corresponds to Tailwind 'bg-gray-50'
    },
    // Header Styles
    headerBackground: {
        backgroundColor: '#4A90E2', // Tailwind 'bg-blue-500'
        paddingTop: 48, 
        paddingBottom: 24, 
        paddingHorizontal: 16, 
        borderBottomLeftRadius: 24, 
        borderBottomRightRadius: 24,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16, 
    },
    backButton: {
        position: 'absolute',
        top: 48,
        left: 16,
        paddingRight: 10,
    },
    headerTextContainer: {
        flex: 1,
        marginLeft: 40, // Adjust margin to accommodate back button
        marginRight: 16,
    },
    headerTitle: {
        color: 'white',
        fontSize: 24, 
        fontWeight: 'bold', 
    },
    headerSubtitle: {
        color: '#E0F2FF', // Tailwind 'text-blue-100'
        marginTop: 4, 
        fontSize: 14,
    },
    headerInstructionText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 14,
    },
    // Tabs Styles
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 16, 
        marginTop: -16, // Pull tabs up into the header curve slightly
        padding: 4, 
        backgroundColor: 'white',
        borderRadius: 12, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 12, 
        borderRadius: 8, 
        alignItems: 'center',
    },
    tabActive: {
        backgroundColor: '#DBEAFE', // Tailwind 'bg-blue-100'
    },
    tabText: {
        textAlign: 'center',
        fontWeight: '500', 
        color: '#6B7280', // Tailwind 'text-gray-500'
    },
    tabTextActive: {
        color: '#2563EB', // Tailwind 'text-blue-600'
        fontWeight: 'bold',
    },
    // Content Styles
    scrollViewContent: {
        flex: 1,
        paddingHorizontal: 16, 
        paddingVertical: 24, 
    },
    guideCard: {
        backgroundColor: 'white',
        borderRadius: 16, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 5,
        marginBottom: 24, 
        overflow: 'hidden',
    },
    // Guide Header
    guideHeader: {
        padding: 16, 
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6', // Tailwind 'border-gray-100'
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconWrapper: {
        padding: 8, 
        backgroundColor: '#EFF6FF', // Tailwind 'bg-blue-50'
        borderRadius: 8, 
        marginRight: 12, 
    },
    guideTitle: {
        fontSize: 18, 
        fontWeight: 'bold', 
        color: '#1F2937', // Tailwind 'text-gray-800'
        flexShrink: 1,
    },
    // Preview Image/Video
    imageWrapper: {
        position: 'relative',
    },
    guideImage: {
        height: 192, 
        width: '100%',
    },
    playButtonOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.3)', 
        alignItems: 'center',
        justifyContent: 'center',
    },
    playButtonCircle: {
        backgroundColor: 'white',
        borderRadius: 9999, 
        padding: 16, 
    },
    // Steps
    stepsContainer: {
        padding: 16, 
    },
    stepsTitle: {
        fontWeight: 'bold', 
        color: '#4B5563', 
        marginBottom: 12, 
        fontSize: 15,
    },
    stepItem: {
        flexDirection: 'row',
        marginBottom: 12, 
        alignItems: 'flex-start',
    },
    stepNumberCircle: {
        width: 24, 
        height: 24, 
        borderRadius: 12, 
        backgroundColor: '#DBEAFE', // Tailwind 'bg-blue-100'
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12, 
        marginTop: 2, 
        flexShrink: 0,
    },
    stepNumberText: {
        color: '#2563EB', // Tailwind 'text-blue-600'
        fontSize: 12, 
        fontWeight: 'bold', 
    },
    stepText: {
        flex: 1,
        color: '#4B5563', 
        fontSize: 15,
        lineHeight: 22,
    },
    // Tips
    tipBox: {
        marginTop: 16, 
        padding: 12, 
        backgroundColor: '#FFFBEB', // Tailwind 'bg-yellow-50'
        borderRadius: 8, 
        borderWidth: 1,
        borderColor: '#FEF3C7', // Tailwind 'border-yellow-100'
    },
    tipTitle: {
        fontWeight: 'bold', 
        color: '#92400E', // Tailwind 'text-yellow-800'
        marginBottom: 4, 
    },
    tipText: {
        color: '#B45309', // Tailwind 'text-yellow-700'
        fontSize: 14,
        lineHeight: 20,
    },
});

export default ParentalGuideScreen;