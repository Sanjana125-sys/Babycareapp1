import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  SafeAreaView,
} from 'react-native';

// --- Type Definitions ---
interface IconProps {
  name: string;
  size?: number;
  style?: object;
}

interface SectionData {
  title: string;
  subtitle: string;
  color: string;
  backgroundColor: string;
  cards: CardData[];
}

interface CardData {
  type: 'image' | 'text';
  title: string;
  tags: string[];
  imageUri: string;
}

interface SizeChartItem {
  age: string;
  weight: string;
  height: string;
  tops: string;
  bottoms: string;
  shoes: string;
  hats: string;
}

// --- Constants & Data ---
const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 72) / 2; // (Screen Width - 24 padding * 2 - 24 margin) / 2

// Placeholder Icon Component (Using Emojis for simplicity)
const Icon: React.FC<IconProps> = ({ name, size = 24, style = {} }) => (
  <Text style={[{ fontSize: size }, style]}>
    {
      {
        SeasonSpring: '🌱',
        SeasonSummer: '☀️',
        SeasonFall: '🍂',
        SeasonWinter: '❄️',
        ArrowLeft: '⬅️',
        Info: 'ℹ️',
      }[name] || name
    }
  </Text>
);

// --- Dummy Data ---
const seasonalData: SectionData[] = [
  {
    title: 'Spring',
    subtitle: 'Cozy recommendations for the season',
    color: '#34D399', // Emerald 500
    backgroundColor: '#D1FAE5', // Emerald 100
    cards: [
      {
        type: 'image',
        title: 'Light Layers',
        tags: ['Cotton dresses', 'Light cardigan', 'Breathable shorts', 'Soft socks'],
        imageUri: 'https://tse2.mm.bing.net/th/id/OIP.stip__ROYpTPaQLJ31zQwAHaHa?pid=Api&P=0&h=180',
      },
      {
        type: 'image',
        title: 'Outdoor Essentials',
        tags: ['Sun hat', 'Light jacket', 'Comfortable shoes', 'Sunglasses'],
        imageUri: 'https://tse1.mm.bing.net/th/id/OIP.m24LqrT5MsKO2tI7_Pj5BAHaHa?pid=Api&P=0&h=180',
      },
    ],
  },
  {
    title: 'Summer',
    subtitle: 'Outdoor outfits for summer days',
    color: '#FBBF24', // Amber 500
    backgroundColor: '#FEF3C7', // Amber 100
    cards: [
      {
        type: 'image',
        title: 'Cool & Comfortable',
        tags: ['Short-sleeve onesies', 'Rompers', 'Light cotton dresses', 'Breathable shorts'],
        imageUri: 'https://i.pinimg.com/originals/2e/3f/66/2e3f66228b47f335819662aaa89671ba.jpg',
      },
      {
        type: 'image',
        title: 'Sun Protection',
        tags: ['Wide-brim hat', 'UV-protective clothing', 'Light beach cover-up', 'Sandals'],
        imageUri: 'https://i.pinimg.com/originals/65/25/f1/6525f1bc786ec1d2e2de6fc295b61e91.jpg',
      },
    ],
  },
  {
    title: 'Fall',
    subtitle: 'Perfect outfits for the season',
    color: '#FB7185', // Rose 500
    backgroundColor: '#FFE4E6', // Rose 100
    cards: [
      {
        type: 'image',
        title: 'Cozy Layers',
        tags: ['Long-sleeve bodysuits', 'Fleece jacket', 'Warm pants', 'Cotton leggings'],
        imageUri: 'https://img.freepik.com/premium-photo/concept-autumn-clothes-autumn-season-wardrobe_185193-89757.jpg',
      },
      {
        type: 'image',
        title: 'Weather Ready',
        tags: ['Knit hat', 'Light raincoat', 'Booties', 'Warm socks'],
        imageUri: 'https://img.freepik.com/premium-photo/autumn-season-clothes-high-quality-ai-generated-image_721440-3852.jpg',
      },
    ],
  },
  {
    title: 'Winter',
    subtitle: 'Perfect outfits for the season',
    color: '#06B6D4', // Cyan 500
    backgroundColor: '#CFFAFE', // Cyan 100
    cards: [
      {
        type: 'image',
        title: 'Warm Essentials',
        tags: ['Thermal bodysuits', 'Fleece-lined jacket', 'Warm pants', 'Winter onesie'],
        imageUri: 'https://tse1.mm.bing.net/th/id/OIP.KiO56TcxhqKoeeoOgR7KJwHaHa?pid=Api&P=0&h=180',
      },
      {
        type: 'image',
        title: 'Cold Weather Gear',
        tags: ['Winter hat with ear flaps', 'Mittens', 'Snow boots', 'Scarf or neck warmer'],
        imageUri: 'https://i.etsystatic.com/39098702/r/il/eb0863/4370529620/il_fullxfull.4370529620_dqij.jpg',
      },
    ],
  },
];

const sizeChartData: SizeChartItem[] = [
  { age: 'Newborn', weight: '5-12 lbs', height: '18-23 inches', tops: 'NB', bottoms: 'NB', shoes: '0-1', hats: 'NB' },
  { age: '3-6 Months', weight: '12-17 lbs', height: '23-26 inches', tops: '3M', bottoms: '3M', shoes: '1-2', hats: '3M' },
  { age: '6-9 Months', weight: '17-21 lbs', height: '26-28 inches', tops: '6M', bottoms: '6M', shoes: '2-3', hats: '6M' },
  { age: '9-12 Months', weight: '21-24 lbs', height: '28-30 inches', tops: '9M', bottoms: '9M', shoes: '3-4', hats: '9M' },
  { age: '12-18 Months', weight: '24-28 lbs', height: '30-32 inches', tops: '12M', bottoms: '12M', shoes: '4-5', hats: '12M' },
  { age: '18-24 Months', weight: '28-30 lbs', height: '32-34 inches', tops: '18M', bottoms: '18M', shoes: '5-6', hats: '18M' },
  { age: '2T', weight: '30-32 lbs', height: '34-36 inches', tops: '2T', bottoms: '2T', shoes: '6-7', hats: '2T' },
  { age: '3T', weight: '32-35 lbs', height: '36-38 inches', tops: '3T', bottoms: '3T', shoes: '7-8', hats: '3T' },
];

const sizingTips: string[] = [
  'Babies grow quickly - consider buying slightly larger sizes for longevity.',
  'Check weight and height more than age for accurate sizing.',
  'Different brands may have slight size variations.',
  'Bodysuits should have room for diaper changes.',
  'Leave room for layering in cooler months.',
  'When in doubt between sizes, size up for comfort.',
];

// --- Helper Components ---

// A single card (e.g., Cool & Comfortable or Cozy Layers)
const SeasonCard: React.FC<{ card: CardData }> = ({ card }) => (
  <View style={guideStyles.cardContainer}>
    <Image source={{ uri: card.imageUri }} style={guideStyles.cardImage} />
    <View style={guideStyles.cardTextContent}>
      <Text style={guideStyles.cardTitle}>{card.title}</Text>
      <View style={guideStyles.tagList}>
        {card.tags.map((tag, index) => (
          <View key={index} style={guideStyles.tagItem}>
            <Text style={guideStyles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
    </View>
  </View>
);

// A single season section (e.g., Spring or Winter)
const SeasonSection: React.FC<{ data: SectionData, index: number }> = ({ data, index }) => {
  let iconName: string;
  // Map index to the appropriate icon name
  switch (index) {
    case 0: iconName = 'SeasonSpring'; break;
    case 1: iconName = 'SeasonSummer'; break;
    case 2: iconName = 'SeasonFall'; break;
    case 3: iconName = 'SeasonWinter'; break;
    default: iconName = 'Info';
  }

  return (
    <View style={[guideStyles.seasonHeader, { backgroundColor: data.backgroundColor }]}>
      <View style={guideStyles.seasonTitleWrapper}>
        <Icon name={iconName} size={28} style={{ color: data.color, marginRight: 8 }} />
        <View>
          <Text style={[guideStyles.seasonTitle, { color: data.color }]}>{data.title}</Text>
          <Text style={guideStyles.seasonSubtitle}>{data.subtitle}</Text>
        </View>
      </View>
      <View style={guideStyles.cardRow}>
        {data.cards.map((card, idx) => (
          <SeasonCard key={idx} card={card} />
        ))}
      </View>
    </View>
  );
};

// --- Main Screen Component ---
const ClothingGuideScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Seasonal' | 'SizeChart'>('Seasonal');

  const renderSeasonalGuide = () => (
    <View style={guideStyles.guideContainer}>
      {seasonalData.map((section, index) => (
        <SeasonSection key={index} data={section} index={index} />
      ))}
    </View>
  );

  const renderSizeChart = () => (
    <View style={sizeChartStyles.container}>
      {/* Table Header */}
      <View style={sizeChartStyles.row}>
        {['Age', 'Weight', 'Height', 'Tops', 'Bottoms', 'Shoes', 'Hats'].map((header) => (
          <View key={header} style={sizeChartStyles.headerCell}>
            <Text style={sizeChartStyles.headerText}>{header}</Text>
          </View>
        ))}
      </View>

      {/* Table Body */}
      {sizeChartData.map((item, index) => (
        <View key={item.age} style={[sizeChartStyles.row, index % 2 === 0 ? sizeChartStyles.evenRow : sizeChartStyles.oddRow]}>
          <View style={sizeChartStyles.cell}><Text style={sizeChartStyles.ageText}>{item.age}</Text></View>
          <View style={sizeChartStyles.cell}><Text style={sizeChartStyles.cellText}>{item.weight}</Text></View>
          <View style={sizeChartStyles.cell}><Text style={sizeChartStyles.cellText}>{item.height}</Text></View>
          <View style={sizeChartStyles.cell}><Text style={[sizeChartStyles.tagChip, {backgroundColor: '#D1FAE5', color: '#065F46'}]}>{item.tops}</Text></View>
          <View style={sizeChartStyles.cell}><Text style={[sizeChartStyles.tagChip, {backgroundColor: '#D1FAE5', color: '#065F46'}]}>{item.bottoms}</Text></View>
          <View style={sizeChartStyles.cell}><Text style={[sizeChartStyles.tagChip, {backgroundColor: '#EFF6FF', color: '#1D4ED8'}]}>{item.shoes}</Text></View>
          <View style={sizeChartStyles.cell}><Text style={[sizeChartStyles.tagChip, {backgroundColor: '#D1FAE5', color: '#065F46'}]}>{item.hats}</Text></View>
        </View>
      ))}

      {/* Sizing Tips */}
      <View style={sizeChartStyles.tipsBox}>
        <View style={sizeChartStyles.tipsHeader}>
          <Icon name="Info" size={20} style={sizeChartStyles.tipsIcon} />
          <Text style={sizeChartStyles.tipsTitle}>Sizing Tips</Text>
        </View>
        {sizingTips.map((tip, index) => (
          <Text key={index} style={sizeChartStyles.tipText}>
            • {tip}
          </Text>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Seasonal' && styles.activeTab]}
          onPress={() => setActiveTab('Seasonal')}
        >
          <Text style={[styles.tabText, activeTab === 'Seasonal' && styles.activeTabText]}>Seasonal Guide</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'SizeChart' && styles.activeTab]}
          onPress={() => setActiveTab('SizeChart')}
        >
          <Text style={[styles.tabText, activeTab === 'SizeChart' && styles.activeTabText]}>Size Chart</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.pageTitle}>{activeTab === 'Seasonal' ? 'Seasonal Clothing Guide' : 'Size Chart Guide'}</Text>
        <Text style={styles.pageSubtitle}>
          {activeTab === 'Seasonal'
            ? 'Curated recommendations for every season'
            : 'Age-based sizing reference for baby clothing'}
        </Text>

        {activeTab === 'Seasonal' ? renderSeasonalGuide() : renderSizeChart()}
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Stylesheets ---

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 8,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#2563EB', // Blue 600
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#2563EB',
    fontWeight: '700',
  },
  scrollViewContent: {
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 24,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
});

const guideStyles = StyleSheet.create({
  guideContainer: {
    paddingHorizontal: 24,
  },
  seasonHeader: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  seasonTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  seasonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seasonSubtitle: {
    fontSize: 12,
    color: '#4B5563',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardContainer: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardImage: {
    width: '100%',
    height: CARD_WIDTH * 0.75, // Aspect ratio
    resizeMode: 'cover',
  },
  cardTextContent: {
    padding: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 6,
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagItem: {
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginRight: 4,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 10,
    color: '#4B5563',
  },
});

const sizeChartStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerCell: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 4,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 11,
    textAlign: 'center',
    color: '#4B5563',
  },
  cell: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  ageText: {
    fontWeight: '600',
    fontSize: 12,
    color: '#1F2937',
    textAlign: 'center',
  },
  cellText: {
    fontSize: 12,
    color: '#4B5563',
    textAlign: 'center',
  },
  evenRow: {
    backgroundColor: '#fff',
  },
  oddRow: {
    backgroundColor: '#F9FAFB',
  },
  tagChip: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  tipsBox: {
    backgroundColor: '#F0F9FF', // Light blue background
    borderRadius: 8,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tipsIcon: {
    color: '#0EA5E9', // Sky 500
    marginRight: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1D4ED8', // Blue 700
  },
  tipText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
    marginLeft: 4,
  },
});

export default ClothingGuideScreen;