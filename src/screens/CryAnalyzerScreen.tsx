import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Image,
    Dimensions,
    SafeAreaView,
    Platform,
    StyleProp,
    ViewStyle, // Used Platform for more robust interval handling, if needed
} from "react-native";

// --- Icon Placeholders ---
// NOTE: Removed 'currentColor' as it is invalid in React Native styles.
const Icon = ({ name, size = 24, style = {} }: { name: string, size?: number, style?: object }) => (
    <Text style={[{ fontSize: size }, style]}>
        {
            {
                Mic: "🎤",
                Volume2: "🔊",
                RotateCcw: "🔄",
                HelpCircle: "❓",
                CheckCircle: "✅",
                ArrowLeft: "⬅️",
                Info: "ℹ️",
            }[name] || name
        }
    </Text>
);

// --- Type Definitions (TypeScript) ---
type CryType = 'unknown' | 'hungry' | 'tired';

// Use NodeJS.Timeout for React Native intervals/timers
interface TimerRefContent {
    interval: NodeJS.Timeout | null;
    mockResult: CryType | null;
}

interface CryAnalysisData {
    type: CryType;
    description: string;
    tips: string[];
    color: string;
    bgColor: string;
}

const CryAnalyzerScreen: React.FC = () => {
    // --- Dataset (Typed for safety) ---
    const cryDataset: CryAnalysisData[] = [
        {
            type: "unknown",
            description:
                "I cannot analyze the baby's cry from real-time sound input. Please ensure your microphone is working and try again.",
            tips: [
                "Check app permissions for microphone access.",
                "Ensure a clear recording (no background noise).",
                "Try recording for a full 5 seconds.",
                "Ensure the microphone is close to the baby (within 1 meter).",
            ],
            color: "#F43F5E", // pink-600
            bgColor: "#FB7185", // pink-500
        },
        {
            type: "hungry",
            description:
                "The cry pattern suggests a 'Hunger' cry. These are often rhythmic and repetitive, building in intensity. Please check feeding time.",
            tips: [
                "Check the time since the last feeding.",
                "Try offering a bottle or breast.",
                "Comfort and soothe the baby while preparing food.",
            ],
            color: "#16A34A", // green-600
            bgColor: "#22C55E", // green-500
        },
        {
            type: "tired",
            description:
                "The cry pattern suggests a 'Tired' or 'Overstimulated' cry. These are often whiny, low-pitch, and may be accompanied by fussing. Time for a nap!",
            tips: [
                "Check for sleepy cues (yawning, rubbing eyes).",
                "Move to a quiet, dark environment.",
                "Try swaddling or gentle rocking.",
            ],
            color: "#4F46E5", // indigo-600
            bgColor: "#6366F1", // indigo-500
        },
    ];

    // --- State Variables ---
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [analysisResult, setAnalysisResult] = useState<CryType | null>(null);
    const [confidence, setConfidence] = useState<number | null>(null);
    const [recordingTime, setRecordingTime] = useState<number>(0);
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
    const [isPulsing, setIsPulsing] = useState<boolean>(false);

    // --- Ref Initialization ---
    const timerRef = useRef<TimerRefContent>({ interval: null, mockResult: null });

    // Use a simplified pulse state for the button effect
    const [buttonScale, setButtonScale] = useState<number>(1);
    const [pulseOpacity, setPulseOpacity] = useState<number>(0);

    // --- Core Logic ---
    const startRecording = () => {
        const resultTypes: CryType[] = ['unknown', 'hungry', 'tired'];
        const mockResult = resultTypes[Math.floor(Math.random() * resultTypes.length)];

        timerRef.current.mockResult = mockResult;

        setIsRecording(true);
        setAnalysisResult(null);
        setConfidence(null);
        setRecordingTime(0);
        setIsPulsing(true);

        // Visual pulse effect start
        setButtonScale(1.05);
        setPulseOpacity(0.8);

        // Clear previous interval if any
        if (timerRef.current.interval !== null) clearInterval(timerRef.current.interval);

        // FIX: Using standard 'setInterval'
        timerRef.current.interval = setInterval(() => {
            setRecordingTime((prev) => prev + 1);
        }, 1000);
    };

    const stopRecording = () => {
        setIsRecording(false);
        setIsAnalyzing(true);
        setIsPulsing(false);

        // Visual pulse effect stop
        setButtonScale(1);
        setPulseOpacity(0);

        // Clear the interval
        if (timerRef.current.interval !== null) {
            clearInterval(timerRef.current.interval);
            timerRef.current.interval = null;
        }

        // Simulate analysis delay
        setTimeout(() => {
            const resultToAnalyze = timerRef.current.mockResult || 'unknown';
            analyzeCry(resultToAnalyze);
        }, 2500);
    };

    const analyzeCry = (mockResultType: CryType) => {
        const resultDetails: CryAnalysisData = cryDataset.find(item => item.type === mockResultType) || cryDataset[0];

        let finalConfidence: number;
        if (recordingTime < 3) {
            finalConfidence = 30 + Math.floor(Math.random() * 20);
        } else {
            finalConfidence = 60 + Math.floor(Math.random() * 35);
        }

        finalConfidence = finalConfidence > 95 ? 95 : finalConfidence;

        setAnalysisResult(resultDetails.type);
        setConfidence(finalConfidence);
        setIsAnalyzing(false);
    };

    const resetAnalysis = () => {
        setAnalysisResult(null);
        setConfidence(null);
        setRecordingTime(0);
    };

    const getResultDetails = (): CryAnalysisData | null => {
        if (!analysisResult) return null;
        return cryDataset.find((item) => item.type === analysisResult) || null;
    };

    // --- Helper Components ---
    const MicrophoneButton = () => {
        const isStop = isRecording;
        const action = isStop ? stopRecording : startRecording;
        const IconComponent = isStop ? 'RotateCcw' : 'Mic';

        return (
            <View style={styles.microphoneContainer}>
                <View style={styles.microphoneWrapper}>
                    {isPulsing && (
                        <View
                            style={[
                                styles.pulseCircle,
                                { opacity: pulseOpacity, transform: [{ scale: 1.5 }] },
                            ]}
                        />
                    )}

                    <TouchableOpacity
                        onPress={action}
                        disabled={isAnalyzing}
                        style={[
                            styles.microphoneButton,
                            isStop ? styles.microphoneButtonRecording : null,
                            { transform: [{ scale: buttonScale }] },
                        ]}
                        activeOpacity={0.7}
                    >
                        {isAnalyzing ? (
                            <ActivityIndicator size="large" color="#fff" />
                        ) : (
                            // FIX: Ensures style is a valid object.
                            <Icon name={IconComponent} size={40} style={{ color: "#fff" }} />
                        )}
                    </TouchableOpacity>
                </View>

                {isRecording && (
                    <Text style={styles.recordingText}>
                        Recording... {recordingTime}s
                    </Text>
                )}
            </View>
        );
    };

    const AnalysisResultCard = () => {
        const result = getResultDetails();
        if (!result || isAnalyzing) return null;

        // FIX: Explicitly cast the dynamic style object to StyleProp<ViewStyle>
        const confidenceStyle: StyleProp<ViewStyle> = {
            width: `${confidence || 0}%`,
            backgroundColor: result.bgColor,
        };

        const resultColor = { color: result.color };
        const resultIcon = result.type === 'unknown' ? 'HelpCircle' : 'CheckCircle';

        return (
            <View style={styles.analysisCard}>
                <Text style={styles.cardTitle}>
                    Analysis Results
                </Text>

                <View style={styles.resultHeader}>
                    <Icon
                        name={resultIcon}
                        size={40}
                        style={{ marginRight: 12, color: result.type === 'unknown' ? '#F43F5E' : '#16A34A' }}
                    />
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.resultType, resultColor]}>
                            {analysisResult && analysisResult.charAt(0).toUpperCase() + analysisResult.slice(1)}
                        </Text>
                        <Text style={styles.confidenceText}>
                            Confidence: {confidence}%
                        </Text>
                    </View>

                    <View style={styles.confidenceBarWrapper}>
                        <View
                            // No changes needed here, as the style array handles the merge correctly
                            style={[styles.confidenceBar, confidenceStyle]}
                        />
                    </View>
                </View>

                <Text style={styles.descriptionText}>
                    {result.description}
                </Text>

                <View style={styles.tipsHeader}>
                    <Icon name="HelpCircle" size={18} style={styles.tipsIcon} />
                    <Text style={styles.tipsTitle}>
                        What to try:
                    </Text>
                </View>
                <View style={styles.tipsList}>
                    {result.tips.map((tip, index) => (
                        <View key={index} style={styles.tipItem}>
                            <Text style={styles.tipBullet}>&bull;</Text>
                            <Text style={styles.tipText}>{tip}</Text>
                        </View>
                    ))}
                </View>

                <TouchableOpacity
                    onPress={resetAnalysis}
                    style={styles.analyzeAgainButton}
                    activeOpacity={0.8}
                >
                    <Text style={styles.analyzeAgainButtonText}>
                        Analyze Another Cry
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    // --- Main Render ---
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container} style={styles.scrollView}>
                

                <View style={styles.contentWrapper}>

                    <View style={styles.mainCard}>

                        <View style={styles.cardHeader}>
                            <View style={styles.iconBackground}>
                                {/* FIX: Ensures style is a valid object. */}
                                <Icon name="Volume2" size={24} style={{ color: "#3B82F6" }} />
                            </View>
                            
                            {/* 🔥 FIX APPLIED HERE: Removed excess whitespace between Text components */}
                            <View style={{ flex: 1 }}>
                                <Text style={styles.mainCardTitle}>
                                    AI-Powered Cry Analysis
                                </Text><Text style={styles.mainCardSubtitle}>
                                    Record your baby's cry and let AI identify what they need
                                </Text>
                            </View>
                            {/* 🔥 END FIX */}
                            
                        </View>

                        {/* Crying Baby Image */}
                        {!isRecording && !isAnalyzing && !analysisResult && (
                            <View style={styles.imageWrapper}>
                                <Image
                                    source={{ uri: "https://i.pinimg.com/originals/0a/8d/ab/0a8dabfc276e8ac396e97ebd9c833a42.gif" }}
                                    style={styles.babyImage}
                                    accessibilityLabel="Crying Baby Placeholder"
                                />
                            </View>
                        )}

                        {/* Microphone Component */}
                        <View style={styles.microphoneWrapperCenter}>
                            <MicrophoneButton />
                        </View>

                        {isAnalyzing && (
                            <Text style={styles.analyzingText}>
                                Analyzing cry patterns...
                            </Text>
                        )}

                        {!isRecording && !isAnalyzing && !analysisResult && (
                            <View style={styles.infoBox}>
                                <View style={styles.infoBoxHeader}>
                                    <Icon name="Info" size={18} style={styles.infoIcon} />
                                    <Text style={styles.infoTitle}>
                                        How to use:
                                    </Text>
                                </View>
                                <View style={styles.infoList}>
                                    <Text style={styles.infoListItem}>1. Press the record button when your baby starts crying.</Text>
                                    <Text style={styles.infoListItem}>2. Record for at least 3-5 seconds for better accuracy.</Text>
                                    <Text style={styles.infoListItem}>3. Press stop and wait for AI analysis.</Text>
                                    <Text style={styles.infoListItem}>4. Review the results and suggested actions.</Text>
                                </View>
                            </View>
                        )}
                    </View>

                    {analysisResult && !isAnalyzing && (
                        <AnalysisResultCard />
                    )}
                </View>
            </ScrollView>

            {/* Floating Status Notification */}
            {analysisResult && !isAnalyzing && (
                <View style={styles.floatingStatus}>
                    <Icon name="CheckCircle" size={16} style={{ color: "#4ADE80", marginRight: 8 }} />
                    <Text style={styles.floatingStatusText}>
                        Analysis complete! Detected: {analysisResult.charAt(0).toUpperCase() + analysisResult.slice(1)}
                    </Text>
                </View>
            )}
        </SafeAreaView>
    );
};

// --- Stylesheet ---
const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff', // Base background color
    },
    scrollView: {
        flex: 1,
    },
    container: {
        flexGrow: 1,
        backgroundColor: '#F7F8FC', // light gradient simulation
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    backButton: {
        padding: 8,
        borderRadius: 9999,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
        marginLeft: 16,
    },
    contentWrapper: {
        padding: 24,
        alignItems: 'center',
    },
    // Main Card Styles
    mainCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 8,
        padding: 24,
        width: '100%',
        maxWidth: 512,
        marginBottom: 24,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    iconBackground: {
        padding: 12,
        marginRight: 12,
        backgroundColor: '#EFF6FF',
        borderRadius: 9999,
    },
    mainCardTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1F2937',
    },
    mainCardSubtitle: {
        color: '#6B7280',
        fontSize: 12,
    },
    imageWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 32,
    },
    babyImage: {
        width: 160,
        height: 160,
        resizeMode: 'contain',
    },
    // Microphone Styles
    microphoneWrapperCenter: {
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 40,
    },
    microphoneContainer: {
        alignItems: 'center',
    },
    microphoneWrapper: {
        width: 160,
        height: 160,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pulseCircle: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: 9999,
        backgroundColor: '#93C5FD', // blue-300
    },
    microphoneButton: {
        width: 128,
        height: 128,
        borderRadius: 9999,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 10,
        backgroundColor: '#3B82F6', // Simulating gradient with primary color
    },
    microphoneButtonRecording: {
        shadowColor: '#EF4444', // shadow-red-500/50
    },
    recordingText: {
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '600',
        color: '#2563EB',
        marginTop: 16,
    },
    // Analyzing Text
    analyzingText: {
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '600',
        color: '#4B5563',
        marginTop: 16,
        marginBottom: 24,
    },
    // Info Box
    infoBox: {
        padding: 16,
        marginTop: 24,
        borderRadius: 8,
        backgroundColor: '#FEFCE8', // yellow-50
        borderWidth: 1,
        borderColor: '#FEF9C3', // yellow-200
    },
    infoBoxHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoIcon: {
        color: '#F59E0B',
        marginRight: 8,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151',
    },
    infoList: {
        marginLeft: 10,
    },
    infoListItem: {
        color: '#4B5563',
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 4,
    },
    // Analysis Result Card
    analysisCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 4,
        width: '100%',
        maxWidth: 512,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        paddingBottom: 8,
    },
    resultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        backgroundColor: '#F9FAFB', // gray-50
        borderWidth: 1,
        borderColor: '#E5E7EB', // gray-200
    },
    resultType: {
        fontSize: 24,
        fontWeight: 'bold',
        textTransform: 'capitalize',
    },
    confidenceText: {
        color: '#4B5563',
        fontSize: 12,
        marginTop: 4,
    },
    confidenceBarWrapper: {
        width: '33.33%',
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 9999,
        overflow: 'hidden',
        marginLeft: 16,
    },
    confidenceBar: {
        height: '100%',
        borderRadius: 9999,
    },
    descriptionText: {
        color: '#374151',
        marginBottom: 24,
        lineHeight: 22,
    },
    tipsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    tipsIcon: {
        marginRight: 8,
        color: '#3B82F6',
    },
    tipsTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#1F2937',
    },
    tipsList: {
        marginLeft: 16,
        // FIX: listStyleType removed.
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    tipBullet: {
        color: '#3B82F6',
        marginRight: 8,
        fontSize: 18,
        lineHeight: 20,
    },
    tipText: {
        color: '#374151',
        flex: 1,
        lineHeight: 20,
    },
    analyzeAgainButton: {
        marginTop: 32,
        width: '100%',
        backgroundColor: '#2563EB',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    analyzeAgainButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    // Floating Status Bar
    floatingStatus: {
        position: 'absolute',
        bottom: 32,
        right: 16,
        backgroundColor: '#1F2937',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 12,
    },
    floatingStatusText: {
        marginLeft: 8,
        color: '#fff',
        fontSize: 14,
    },
});

export default CryAnalyzerScreen;