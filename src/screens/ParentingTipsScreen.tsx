import React, { useState, ReactNode } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    TouchableOpacity, 
    Image, 
    Dimensions, 
    StyleSheet, 
    SafeAreaView, 
    Platform 
} from 'react-native';
import { 
    BookOpen, 
    Video, 
    Shield, 
    Apple, 
    Baby, 
    ChevronRight, 
    Play, 
    Clock, 
    User 
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// =========================================================
// 💡 1. TYPE DEFINITIONS
// =========================================================

interface Category {
    id: 'all' | 'guidance' | 'safety' | 'nutrition' | 'video';
    name: string;
    icon: ReactNode; 
}

interface IconProps {
    size: number;
    color: string;
}

// Define the shape of a single tip item
interface Tip {
    id: string;
    category: Category['id'];
    title: string;
    age: string;
    description: string;
    image: string;
    readTime?: string;
    author?: string;
    duration?: string;
    views?: string;
    questions?: number;
}

// =========================================================
// 💡 2. REUSABLE SEGMENTED TAB BAR COMPONENT (NEW)
// =========================================================

interface SegmentedCategoryTabsProps {
    categories: Category[];
    activeCategory: Category['id'];
    setActiveCategory: (id: Category['id']) => void;
}

const SegmentedCategoryTabs: React.FC<SegmentedCategoryTabsProps> = ({ categories, activeCategory, setActiveCategory }) => {
    // Calculate equal width for each segment
    const segmentWidth = (width - 32) / categories.length; 

    return (
        <View style={styles.segmentedTabsContainerWrapper}>
            <View style={styles.segmentedTabsContainer}>
                {categories.map((category) => {
                    const isActive = category.id === activeCategory;
                    
                    // Note: We remove icons for the segmented bar style as it's usually text-only.
                    // If icons are required, they'd be placed next to the text here.

                    return (
                        <TouchableOpacity
                            key={category.id}
                            style={[
                                styles.segmentedTabButton,
                                { width: segmentWidth },
                                // Apply white background only to the active tab
                                isActive ? styles.segmentedTabActive : styles.segmentedTabInactive
                            ]}
                            onPress={() => setActiveCategory(category.id)}
                        >
                            <Text 
                                style={[
                                    styles.segmentedTabText,
                                    // Active text is dark, inactive text is light/gray
                                    isActive ? styles.segmentedTextActive : styles.segmentedTextInactive
                                ]}
                            >
                                {category.name}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

// =========================================================
// 💡 3. MAIN COMPONENT (ParentingTipsScreen)
// =========================================================

const ParentingTipsScreen = () => {
    // 1. STATE DEFINITION
    const [activeCategory, setActiveCategory] = useState<Category['id']>('all');

    // 2. DATA DEFINITION
    const tipsData: Tip[] = [
      {
        id: '1',
        category: 'guidance',
        title: 'Newborn Care Basics',
        age: '0-3 months',
        description: 'Essential skills for caring for your newborn',
        image: 'https://images.unsplash.com/photo-1517340073101-289191978ae8?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzR8fDMlMjBncmFwaGljc3xlbnwwfHwwfHx8MA%3D%3D',
        readTime: '5 min read',
        author: 'Dr. Sarah Johnson'
      },
      {
        id: '2',
        category: 'safety',
        title: 'Babyproofing Your Home',
        age: '6-12 months',
        description: 'Creating a safe environment as your baby becomes more mobile',
        image: 'https://images.unsplash.com/photo-1605627079912-97c3810a11a4?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjd8fEtpZHMlMjBwbGF5aW5nfGVufDB8fDB8fHww',
        readTime: '8 min read',
        author: 'Safety Experts'
      },
      {
        id: '3',
        category: 'nutrition',
        title: 'Starting Solid Foods',
        age: '4-6 months',
        description: 'A guide to introducing your baby to solid foods',
        image: 'https://images.unsplash.com/photo-1562918005-50afb98e5d32?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8SGVhbHRoeSUyMGJyZWFrZmFzdCUyMG1lYWx8ZW58MHx8MHx8fDA%3D',
        readTime: '6 min read',
        author: 'Nutritionist Team'
      },
      {
        id: '4',
        category: 'video',
        title: 'Soothing Techniques',
        age: '0-12 months',
        description: 'Effective ways to calm a fussy baby',
        image: 'https://images.unsplash.com/photo-1727189899461-b888a5890287?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8MyUyMGdyYXBoaWNzfGVufDB8fHwwfHx8MA%3D%3D',
        duration: '4:30',
        views: '12.4K'
      },
      {
        id: '5',
        category: 'guidance',
        title: 'Sleep Training Methods',
        age: '4-18 months',
        description: 'Comparing popular approaches to helping babies sleep through the night',
        image: 'https://images.unsplash.com/photo-1600675608140-991fcf38cc6e?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDd8fDMlMjBncmFwaGljc3xlbnwwfHwwfHx8MA%3D%3D',
        readTime: '10 min read',
        author: 'Sleep Specialist'
      },
      {
        id: '6',
        category: 'guidance',
        title: 'Common Health Questions',
        age: '0-2 years',
        description: 'Answers to frequently asked questions about baby health',
        image: 'https://images.unsplash.com/photo-1635099404457-91c3d0dade3b?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8MyUyMGdyYXBoaWNzfGVufDB8fDB8fHww',
        questions: 15
      }
    ];

    const categories: Category[] = [
      { id: 'all', name: 'All', icon: <Baby size={20} color="#4A90E2" /> },
      { id: 'guidance', name: 'Guidance', icon: <BookOpen size={20} color="#4A90E2" /> },
      { id: 'safety', name: 'Safety', icon: <Shield size={20} color="#4A90E2" /> },
      { id: 'nutrition', name: 'Nutrition', icon: <Apple size={20} color="#4A90E2" /> },
      { id: 'video', name: 'Videos', icon: <Video size={20} color="#4A90E2" /> }
    ];

    // 3. CALCULATED DATA (filteredTips)
    const filteredTips = activeCategory === 'all' 
      ? tipsData 
      : tipsData.filter(tip => tip.category === activeCategory);

    // 4. HELPER FUNCTION (renderTipCard) - remains the same
    const renderTipCard = (tip: Tip) => { 
        // ... (Your existing renderTipCard implementation remains here) ...
        switch (tip.category) {
            case 'video':
              return (
                <View key={tip.id} style={styles.cardContainer}>
                  <View style={styles.relative}>
                    <Image 
                      source={{ uri: tip.image }} 
                      style={[styles.imageFullWidth, { width: width - 32, height: 180 }]} 
                      resizeMode="cover"
                    />
                    <View style={styles.videoOverlay}>
                      <View style={styles.playButton}>
                        <Play size={20} color="#4A90E2" fill="#4A90E2" />
                      </View>
                    </View>
                    <View style={styles.durationTag}>
                      <Text style={styles.durationText}>{tip.duration}</Text>
                    </View>
                  </View>
                  <View style={styles.cardPadding}>
                    <View style={styles.titleRow}>
                      <Text style={styles.titleText}>{tip.title}</Text>
                      <ChevronRight size={20} color="#9CA3AF" />
                    </View>
                    <Text style={styles.descriptionText}>{tip.description}</Text>
                    <View style={styles.metadataRow}>
                      <Text style={styles.metadataText}>{tip.views} views</Text>
                      <Text style={styles.metadataText}>{tip.age}</Text>
                    </View>
                  </View>
                </View>
              );
            
            default:
              return (
                <View key={tip.id} style={styles.cardContainer}>
                  <View style={styles.row}>
                    <Image 
                      source={{ uri: tip.image }} 
                      style={styles.smallImage}
                      resizeMode="cover"
                    />
                    <View style={styles.cardContent}>
                      <View style={styles.titleRow}>
                        <Text style={styles.titleText}>{tip.title}</Text>
                        <ChevronRight size={20} color="#9CA3AF" />
                      </View>
                      <Text style={styles.descriptionText}>{tip.description}</Text>
                      <View style={styles.metadataRowSpace}>
                        <View style={styles.rowItemsCenter}>
                          <Clock size={14} color="#9CA3AF" />
                          <Text style={[styles.metadataText, styles.metadataReadTime]}>{tip.readTime}</Text>
                          <User size={14} color="#9CA3AF" />
                          <Text style={styles.metadataText}>{tip.author}</Text>
                        </View>
                        <Text style={styles.metadataText}>{tip.age}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
        }
    };

    // 5. THE RETURN STATEMENT 
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header (Kept original parenting style) */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View>
                <Text style={styles.headerTitle}>Parenting Tips</Text>
                <Text style={styles.headerSubtitle}>Articles, videos & expert advice</Text>
              </View>
              <Baby size={32} color="white" />
            </View>
            
            <Text style={styles.headerDescription}>
              Age-based guidance, safety tips, and nutrition suggestions
            </Text>
          </View>

          {/* Segmented Category Tabs: Replaced the ScrollView with the new component */}
          <SegmentedCategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />
          
          {/* Tips Content */}
          <ScrollView style={styles.tipsContentScroll} showsVerticalScrollIndicator={false}>
            {filteredTips.map(renderTipCard)}
            
            {/* Featured Section */}
            <View style={styles.featuredSection}>
              <Text style={styles.featuredTitle}>Expert Advice</Text>
              <Text style={styles.featuredSubtitle}>
                Get personalized parenting recommendations based on your baby's age and development stage
              </Text>
              <TouchableOpacity style={styles.featuredButton}>
                <Text style={styles.featuredButtonText}>Ask an Expert</Text>
              </TouchableOpacity>
            </View>
            
            {/* FAQ Section */}
            <View style={styles.faqSection}>
              <View style={styles.faqHeader}>
                <BookOpen size={24} color="#4A90E2" />
                <Text style={styles.faqTitle}>Popular Questions</Text>
              </View>
              
              <View style={styles.faqList}>
                {[
                  "How much should my baby sleep?",
                  "When should I start solids?",
                  "What vaccines does my baby need?",
                  "How can I soothe a colicky baby?"
                ].map((question, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.faqItem}
                  >
                    <Text style={styles.faqItemText}>{question}</Text>
                    <ChevronRight size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
};

// 6. MODIFIED STYLESHEET DEFINITION
const styles = StyleSheet.create({
    // --- Existing Styles (Kept) ---
    safeArea: {
      flex: 1,
      backgroundColor: '#3B82F6', 
    },
    container: {
      flex: 1, 
      backgroundColor: '#F9FAFB', 
    },
    header: {
      backgroundColor: '#3B82F6', 
      paddingTop: Platform.OS === 'android' ? 10 : 0, 
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
    headerTitle: {
      color: 'white',
      fontSize: 24,
      fontWeight: '700', 
    },
    headerSubtitle: {
      color: '#DBEAFE', 
      marginTop: 4, 
    },
    headerDescription: {
      color: 'white',
      textAlign: 'center',
      paddingHorizontal: 16,
    },
    // Note: categoryScroll, categoryContainer, categoryButton (old tabs) are removed 
    // to avoid conflict, as they are no longer used.
    
    // --- NEW SEGMENTED TAB BAR STYLES ---
    segmentedTabsContainerWrapper: {
        paddingHorizontal: 16, // Matches screen padding
        paddingVertical: 10,
        backgroundColor: '#F9FAFB', // Background below the header
        // Move the border/shadow from the old header/tabs here for visual separation
        borderTopLeftRadius: 0, 
        borderTopRightRadius: 0,
    },
    segmentedTabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#374151', // Dark blue/gray background for the tab bar itself
        borderRadius: 8,
        overflow: 'hidden',
        height: 44,
        alignSelf: 'stretch', // Ensure it takes up the full width minus padding
    },
    segmentedTabButton: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    segmentedTabActive: {
        backgroundColor: 'white', // White background for the active segment
        borderRadius: 8, // Rounded corners inside the container
        margin: 4, // Creates a 4px border (the dark background showing through)
        flex: 1,
    },
    segmentedTabInactive: {
        backgroundColor: 'transparent',
        flex: 1,
    },
    segmentedTabText: {
        fontSize: 14,
        fontWeight: '600',
    },
    segmentedTextActive: {
        color: '#1F2937', // Dark text for active tab
    },
    segmentedTextInactive: {
        color: '#9CA3AF', // Light/Gray text for inactive tab
    },
    // --- Rest of your existing styles (Tips Cards, Featured, FAQ) ---
    tipsContentScroll: {
      flex: 1,
      paddingHorizontal: 16, 
      paddingVertical: 24, 
    },
    cardContainer: {
      backgroundColor: 'white',
      borderRadius: 16, 
      shadowColor: '#000', 
      shadowOffset: { width: 0, height: 2 }, 
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2, 
      marginBottom: 16, 
      overflow: 'hidden',
    },
    cardPadding: {
      padding: 16, 
    },
    row: {
      flexDirection: 'row',
    },
    smallImage: {
      width: 96, 
      height: 96, 
      borderTopLeftRadius: 16,
      borderBottomLeftRadius: 16,
    },
    cardContent: {
      flex: 1,
      padding: 16, 
    },
    titleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8, 
    },
    titleText: {
      fontSize: 18, 
      fontWeight: '700', 
      color: '#1F2937', 
      flexShrink: 1, 
    },
    descriptionText: {
      color: '#4B5563', 
      marginBottom: 12, 
    },
    metadataRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    metadataRowSpace: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    metadataText: {
      color: '#6B7280', 
      fontSize: 12, 
      marginLeft: 4, 
    },
    metadataReadTime: {
      marginRight: 12, 
      marginLeft: 4,
    },
    rowItemsCenter: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    relative: {
      position: 'relative',
    },
    imageFullWidth: {
      height: 180,
    },
    videoOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.3)', 
      justifyContent: 'center',
      alignItems: 'center',
    },
    playButton: {
      backgroundColor: 'white',
      borderRadius: 9999, 
      padding: 12, 
    },
    durationTag: {
      position: 'absolute',
      bottom: 12, 
      right: 12, 
      backgroundColor: 'rgba(0, 0, 0, 0.7)', 
      paddingHorizontal: 8, 
      paddingVertical: 4, 
      borderRadius: 4, 
    },
    durationText: {
      color: 'white',
      fontSize: 14, 
    },
    featuredSection: {
      backgroundColor: '#3B82F6', 
      borderRadius: 16, 
      padding: 20, 
      marginBottom: 24, 
    },
    featuredTitle: {
      color: 'white',
      fontSize: 20, 
      fontWeight: '700', 
      marginBottom: 8, 
    },
    featuredSubtitle: {
      color: '#DBEAFE', 
      marginBottom: 16, 
    },
    featuredButton: {
      backgroundColor: 'white',
      paddingVertical: 12, 
      paddingHorizontal: 24, 
      borderRadius: 9999, 
      alignSelf: 'flex-start', 
    },
    featuredButtonText: {
      color: '#2563EB', 
      fontWeight: '700', 
    },
    faqSection: {
      backgroundColor: 'white',
      borderRadius: 16, 
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
      padding: 20, 
      marginBottom: 24, 
    },
    faqHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16, 
    },
    faqTitle: {
      fontSize: 18, 
      fontWeight: '700', 
      color: '#1F2937', 
      marginLeft: 8, 
    },
    faqList: {
      rowGap: 12, 
    },
    faqItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12, 
      backgroundColor: '#F9FAFB', 
      borderRadius: 8, 
    },
    faqItemText: {
      color: '#374151', 
      flexShrink: 1, 
      paddingRight: 10,
    },
});

export default ParentingTipsScreen;