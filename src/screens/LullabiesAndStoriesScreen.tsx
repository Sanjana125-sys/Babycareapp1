import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    ScrollView, 
    StyleSheet, 
    Dimensions, 
    SafeAreaView 
} from 'react-native';

// Import necessary components for media playback
// import YoutubePlayer from 'react-native-youtube-iframe'; 

// --- Constants & Data ---
const windowWidth = Dimensions.get('window').width;

// Placeholder for an Icon component (using emojis for simplicity in this example)
const Icon = ({ name, size = 24, style = {} }: { name: string, size?: number, style?: object }) => (
    <Text style={[{ fontSize: size, marginRight: 8 }, style]}>
        {
            {
                ArrowLeft: "⬅️",
                Music: "🎵",
                BookOpen: "📖",
                Play: "▶️",
                Video: "🎥",
            }[name] || name
        }
    </Text>
);

interface MediaItem {
    id: string;
    title: string;
    subtitle: string;
    type: 'audio' | 'video' | 'read'; // 'read' for parent-led story
    mediaId: string; // YouTube ID or file path
    description?: string;
}

const mediaData: { title: string, icon: string, items: MediaItem[] }[] = [
    {
        title: "Lullabies & Soothing Songs",
        icon: "Music",
        items: [
            {
                id: 'l1',
                title: "Twinkle Twinkle Little Star",
                subtitle: "Traditional Lullaby",
                type: 'audio',
                mediaId: 'qj8BqGgWk-w', // YouTube ID for soft version
            },
            {
                id: 'l2',
                title: "Rock-a-bye Baby",
                subtitle: "Traditional Lullaby",
                type: 'audio',
                mediaId: '809y2m82K8g', // YouTube ID for acoustic version
            },
            {
                id: 'l3',
                title: "Brahms' Lullaby",
                subtitle: "Johannes Brahms (Classical)",
                type: 'audio',
                mediaId: 'u6f1V8zJq1M', // YouTube ID for instrumental version
            },
        ],
    },
    {
        title: "Bedtime Stories (Video)",
        icon: "Video",
        items: [
            {
                id: 's1',
                title: "The Three Little Pigs",
                subtitle: "Animated Story",
                type: 'video',
                mediaId: 'e22eS11B7W8', // YouTube ID for an animated story
            },
            {
                id: 's2',
                title: "Goldilocks and the Three Bears",
                subtitle: "Read-Aloud Video",
                type: 'video',
                mediaId: 'O34E7o3hLgE', // YouTube ID for another read-aloud
            },
        ],
    },
    {
        title: "Parent-Led Stories (Text)",
        icon: "BookOpen",
        items: [
            {
                id: 'r1',
                title: "The Very Hungry Caterpillar",
                subtitle: "Eric Carle (Read to Baby)",
                type: 'read',
                mediaId: '', // No media, just a prompt
                description: 'A simple, rhythmic story perfect for reading out loud before sleep.',
            },
            {
                id: 'r2',
                title: "Goodnight Moon",
                subtitle: "Margaret Wise Brown (Read to Baby)",
                type: 'read',
                mediaId: '', // No media, just a prompt
                description: 'A classic calming book where you say goodnight to everything in the room.',
            },
        ],
    },
];

// --- Sub-Components ---

// Card component for each song/story
const MediaCard: React.FC<{ item: MediaItem, onPlay: (item: MediaItem) => void }> = ({ item, onPlay }) => {
    return (
        <TouchableOpacity 
            style={styles.mediaItem} 
            onPress={() => onPlay(item)}
            disabled={item.type === 'read'} // Disable touch if it's just a text prompt
        >
            <View style={styles.mediaText}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                {item.description && <Text style={styles.itemDescription}>{item.description}</Text>}
            </View>
            
            {item.type !== 'read' ? (
                <View style={styles.playButton}>
                    <Icon name="Play" size={18} style={{ color: '#6366F1' }} />
                </View>
            ) : (
                <View style={[styles.playButton, styles.readIndicator]}>
                    <Text style={styles.readText}>Read</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

// --- Main Component ---
const LullabiesAndStoriesScreen: React.FC = () => {
    const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

    const handlePlay = (item: MediaItem) => {
        setSelectedMedia(item);
        // In a real app, you would initiate background audio/video playback here
        console.log(`Attempting to play: ${item.title} (Media ID: ${item.mediaId})`);
    };

    const renderMediaSections = () => {
        return mediaData.map((section, index) => (
            <View key={index} style={styles.cardSection}>
                <View style={styles.sectionHeader}>
                    <Icon name={section.icon} size={22} style={{ color: '#4F46E5' }} />
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                </View>
                <Text style={styles.sectionSubtitle}>
                    {section.title === "Lullabies & Soothing Songs" 
                        ? "Soothing songs to help baby sleep"
                        : section.title === "Bedtime Stories (Video)"
                        ? "Watch calming narrated stories"
                        : "Stories for parents to read out loud"
                    }
                </Text>

                <View style={styles.itemsContainer}>
                    {section.items.map((item, itemIndex) => (
                        <MediaCard 
                            key={item.id} 
                            item={item} 
                            onPlay={handlePlay} 
                        />
                    ))}
                </View>
            </View>
        ));
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => console.log("Go Back")} style={styles.backButton}>
                    <Icon name="ArrowLeft" size={24} style={{ color: '#4F46E5' }} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Lullabies & Stories</Text>
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                
                {/* Currently Selected Media Player Area */}
                {selectedMedia && selectedMedia.type !== 'read' && (
                    <View style={styles.mediaPlayerContainer}>
                        <Text style={styles.playerTitle}>Now Playing: {selectedMedia.title}</Text>
                        
                        {/* // 🛑 Placeholder for YouTube/Audio Player
                            // You would replace this View with:
                            <YoutubePlayer
                                height={200}
                                play={true}
                                videoId={selectedMedia.mediaId}
                            />
                        */}
                        <View style={styles.videoPlaceholder}>
                            <Text style={styles.videoText}>
                                {selectedMedia.type === 'video' ? '🎥 Video Player Area' : '🎵 Audio Player Area'}
                            </Text>
                            <Text style={styles.videoSubtext}>
                                (Playing from Media ID: {selectedMedia.mediaId})
                            </Text>
                        </View>
                        
                        <TouchableOpacity onPress={() => setSelectedMedia(null)} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>Close Player</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {renderMediaSections()}

                <View style={styles.noteContainer}>
                    <Text style={styles.noteText}>
                        <Icon name="Info" size={14} style={{ color: '#A5B4FC' }} /> Note: Audio/Video files are linked to external services (YouTube in this example). Use a library like 'react-native-youtube-iframe' for direct playback.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// --- Stylesheet ---
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F7F9FC', // Light, calming background
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#EDEFFF',
    },
    backButton: {
        padding: 4,
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    container: {
        padding: 16,
    },
    // Media Player Styles
    mediaPlayerContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 24,
        padding: 16,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        borderLeftWidth: 5,
        borderLeftColor: '#A5B4FC',
    },
    playerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#4F46E5',
        marginBottom: 8,
    },
    videoPlaceholder: {
        width: '100%',
        height: 180,
        backgroundColor: '#E0E7FF',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    videoText: {
        fontSize: 18,
        color: '#4F46E5',
        fontWeight: '600',
    },
    videoSubtext: {
        fontSize: 12,
        color: '#6366F1',
        marginTop: 4,
    },
    closeButton: {
        padding: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 6,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#4B5563',
        fontWeight: '600',
    },
    // Card Section Styles
    cardSection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 24,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1F2937',
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 16,
        marginTop: 4,
    },
    itemsContainer: {
        // Separates the items visually
    },
    mediaItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    mediaText: {
        flex: 1,
        marginRight: 10,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    itemSubtitle: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 2,
    },
    itemDescription: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
        fontStyle: 'italic',
    },
    playButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#C7D2FE', // Indigo-200
        justifyContent: 'center',
        alignItems: 'center',
    },
    readIndicator: {
        backgroundColor: '#FEE2E2', // Red-100 (distinction for reading)
    },
    readText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#EF4444',
    },
    // Note Styles
    noteContainer: {
        padding: 12,
        backgroundColor: '#EFF6FF', // Blue-50
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#93C5FD',
        marginTop: 8,
        marginBottom: 32,
    },
    noteText: {
        fontSize: 12,
        color: '#4B5563',
        lineHeight: 18,
    }
});

export default LullabiesAndStoriesScreen;