import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity,
    Alert,
    Switch // For the toggle setting
} from 'react-native';
import { 
    Shield, 
    Bell, 
    Info, 
    Globe, 
    Palette,
    Moon, 
    Share2, 
    LogOut,
    ChevronRight 
} from 'lucide-react-native';
import { useRouter } from 'expo-router'; // Assuming you are using Expo Router for navigation

// Define a structure for a settings item
interface SettingsItemProps {
    icon: React.ReactNode;
    label: string;
    onPress: () => void;
    value?: string;
    type?: 'link' | 'toggle' | 'button';
    isLast?: boolean;
}

// --- Sub-Component: Settings Row ---
const SettingsRow: React.FC<SettingsItemProps> = ({ 
    icon, 
    label, 
    onPress, 
    value, 
    type = 'link', 
    isLast = false 
}) => {
    const [isEnabled, setIsEnabled] = useState(false); // Used only for toggle type

    const renderAccessory = () => {
        if (type === 'toggle') {
            return (
                <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={isEnabled ? "#3b82f6" : "#f4f3f4"}
                    onValueChange={() => setIsEnabled(previousState => !previousState)}
                    value={isEnabled}
                />
            );
        }
        
        if (type === 'link') {
            return (
                <View style={styles.rowAccessory}>
                    {value && <Text style={styles.rowValue}>{value}</Text>}
                    <ChevronRight size={18} color="#9ca3af" />
                </View>
            );
        }
        
        return null;
    };

    return (
        <TouchableOpacity 
            style={[styles.row, !isLast && styles.rowBorder]} 
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.rowContent}>
                <View style={styles.iconContainer}>{icon}</View>
                <Text style={styles.rowLabel}>{label}</Text>
            </View>
            {renderAccessory()}
        </TouchableOpacity>
    );
};

// --- Main Component: Settings Screen ---
const SettingsScreen: React.FC = () => {
    // Replace with actual navigation logic (e.g., router.push('privacy-safety'))
    const handleNavigation = (destination: string) => {
        // In a real app, you would use navigation.navigate or router.push here
        Alert.alert("Navigating", `Going to ${destination}...`);
        // if (router) router.push(`/${destination}`); 
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                
                {/* 1. Account Section */}
                <Text style={styles.sectionHeader}>Account</Text>
                <View style={styles.section}>
                    <SettingsRow
                        icon={<Shield size={22} color="#4f46e5" />} // Indigo
                        label="Privacy & Safety"
                        onPress={() => handleNavigation('privacy-safety')}
                    />
                    <SettingsRow
                        icon={<Bell size={22} color="#f59e0b" />} // Amber
                        label="Notifications"
                        onPress={() => handleNavigation('notifications')}
                    />
                    <SettingsRow
                        icon={<Globe size={22} color="#22c55e" />} // Emerald
                        label="Language"
                        value="English (US)"
                        onPress={() => handleNavigation('language')}
                        isLast={true}
                    />
                </View>

                {/* 2. App Preferences Section (Ideas) */}
                <Text style={styles.sectionHeader}>App Preferences</Text>
                <View style={styles.section}>
                    {/* Idea 1: Theme Switch */}
                    <SettingsRow
                        icon={<Moon size={22} color="#6366f1" />} // Indigo
                        label="Dark Mode"
                        onPress={() => { /* Toggle theme logic */ }}
                        type="toggle"
                    />
                    {/* Idea 2: Custom Tones */}
                    <SettingsRow
                        icon={<Palette size={22} color="#ef4444" />} // Red
                        label="App Theme Color"
                        value="Blue"
                        onPress={() => handleNavigation('theme-color')}
                        isLast={true}
                    />
                </View>
                
                {/* 3. Support & About Section */}
                <Text style={styles.sectionHeader}>Support & Info</Text>
                <View style={styles.section}>
                    <SettingsRow
                        icon={<Info size={22} color="#06b6d4" />} // Cyan
                        label="About App"
                        onPress={() => handleNavigation('about')}
                    />
                    {/* Idea 3: Share/Invite */}
                    <SettingsRow
                        icon={<Share2 size={22} color="#3b82f6" />} // Blue
                        label="Share App"
                        onPress={() => Alert.alert("Share", "Opening share dialog...")}
                        isLast={true}
                    />
                </View>
                
                {/* 4. Log Out Button (Standalone) */}
                <View style={styles.logoutSection}>
                    <TouchableOpacity 
                        onPress={() => Alert.alert("Logout", "Are you sure you want to log out?")} 
                        style={styles.logoutButton}
                    >
                        <LogOut size={20} color="#dc2626" /> 
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6', // Light gray background
    },
    scrollViewContent: {
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    sectionHeader: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4b5563', // Darker gray text
        marginTop: 16,
        marginBottom: 8,
        paddingHorizontal: 4,
        textTransform: 'uppercase',
    },
    section: {
        backgroundColor: 'white',
        borderRadius: 12,
        overflow: 'hidden', // Ensures borders are clean
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
        elevation: 1,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: 'white',
    },
    rowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6', // Lighter divider
    },
    rowContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 30, // Fixed width for alignment
        alignItems: 'center',
        marginRight: 12,
    },
    rowLabel: {
        fontSize: 16,
        color: '#1f2937', // Nearly black text
    },
    rowAccessory: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowValue: {
        fontSize: 16,
        color: '#9ca3af', // Gray text for value
        marginRight: 5,
    },
    logoutSection: {
        marginTop: 30,
        marginBottom: 40,
        alignItems: 'center',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fee2e2', // Red-100 background
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
    },
    logoutText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
        color: '#dc2626', // Red-600 text
    },
});

export default SettingsScreen;