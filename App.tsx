// App.tsx

import 'react-native-gesture-handler';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { NavigationContainer, ParamListBase } from '@react-navigation/native';
import { createStackNavigator, StackScreenProps } from '@react-navigation/stack';
import { View, Text, ActivityIndicator } from 'react-native';

// --- Import All Your Screens ---
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import SignupScreen from './src/screens/SignUpScreen';
import BabyProfileScreen from './src/screens/BabyProfileScreen';
import FeedingTrackerScreen from './src/screens/FeedingTrackerScreen';
import GrowthTrackerScreen from './src/screens/GrowthTrackerScreen';
import VaccinationTrackerScreen from './src/screens/VaccinationTrackerScreen';
import CryAnalyzerScreen from './src/screens/CryAnalyzerScreen';
import ClothingGuideScreen from './src/screens/ClothingGuideScreen';
import MedicationTrackerScreen from './src/screens/MedicationTrackerScreen';
import PediatricianMapScreen from './src/screens/PediatricianMapScreen'; 
import ParentalGuideScreen from './src/screens/ParentalGuideScreen'; 
import LullabiesAndStoriesScreen from './src/screens/LullabiesAndStoriesScreen';
import AppointmentScreen from './src/screens/AppointmentScreen';
import MemoryBookScreen from './src/screens/MemoryBookScreen';
import BabyTrackerScreen from './src/screens/BabyTrackingScreen';
import TelehealthConsultationScreen from './src/screens/TelehealthConsultationScreen';
import AddReminderScreen from './src/screens/AddReminderScreen';
import MilestoneScreen from './src/screens/MilestoneScreen';
import DiaperTrackerScreen from './src/screens/DiaperTrackerScreen';
import SleepingTrackerScreen from './src/screens/SleepingTrackerScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ParentingTipsScreen from './src/screens/ParentingTipsScreen';
const Stack = createStackNavigator();

// ------------------------------------------------------------------
// Type Definitions
// ------------------------------------------------------------------

// Define the parameter list for all screens
type RootStackParamList = {
    Login: undefined;
    Signup: undefined;
    Dashboard: undefined;
    BabyProfile: undefined;
    FeedingTracker: undefined;
    GrowthTracker: undefined;
    VaccinationTracker: undefined;
    CryAnalyzer: undefined;
    ClothingGuide: undefined;
    MedicationTracker: undefined;
    PediatricianMap: undefined;
    'Parental Guide': undefined; 
    'Lullabies & Stories': undefined;
    AppointmentScreen: undefined;
    MemoryBookScreen: undefined;
    BabyTrackerScreen: undefined;
    TelehealthConsultationScreen: undefined;
    AddReminderScreen: undefined;
    MilestoneScreen: undefined;
    DiaperTrackerScreen: undefined;
    SleepingTrackerScreen: undefined;
    SettingsScreen: undefined;
};

// Define the required props for LoginScreen (The function to call on success)
// We define a new type for clarity when using the render prop
type LoginScreenProps = StackScreenProps<RootStackParamList, 'Login'> & {
    onAuthenticationSuccess: () => void;
};


// ------------------------------------------------------------------
// Auth Wrapper Component (The Core Navigator)
// ------------------------------------------------------------------

// AuthScreen now receives its state and handlers as props from the App component.
interface AuthScreenProps {
    isAuthenticated: boolean;
    isLoading: boolean;
    handleAuthSuccess: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ isAuthenticated, isLoading, handleAuthSuccess }) => {
    
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={{ marginTop: 10 }}>Loading App Data...</Text>
            </View>
        );
    }
    
    // --- Render Navigator Based on Authentication Status ---
    return (
        <Stack.Navigator>
            {isAuthenticated ? (
                // --- Authenticated Screens (Private Routes) ---
                <>
                    <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Baby Care Dashboard' }} />
                    <Stack.Screen name="BabyProfile" component={BabyProfileScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="FeedingTracker" component={FeedingTrackerScreen} options={{ title: 'Feeding Tracker' }} />
                    <Stack.Screen name="GrowthTracker" component={GrowthTrackerScreen} options={{ title: 'Growth Tracker' }} />
                    <Stack.Screen name="VaccinationTracker" component={VaccinationTrackerScreen} options={{ title: 'Vaccination Tracker' }} />
                    <Stack.Screen name="CryAnalyzer" component={CryAnalyzerScreen} options={{ title: 'Cry Analyzer' }} />
                    <Stack.Screen name="ClothingGuide" component={ClothingGuideScreen} options={{ title: 'Clothing Guide' }} />
                    <Stack.Screen name="MedicationTracker" component={MedicationTrackerScreen} options={{ title: 'Medication Tracker' }} />
                    <Stack.Screen name="PediatricianMap" component={PediatricianMapScreen} options={{ title: 'Pediatricians' }} />
                    <Stack.Screen name="Parental Guide" component={ParentalGuideScreen} options={{ title: 'Parental Guide' }} />
                    <Stack.Screen name="Lullabies & Stories" component={LullabiesAndStoriesScreen} options={{ title: 'Lullabies & Stories' }} />
                    <Stack.Screen name="AppointmentScreen" component={AppointmentScreen} options={{ title: 'My Appointments' }} />
                    <Stack.Screen name="Signup" component={SignupScreen} options={{ title: 'Sign Up' }} />
                    <Stack.Screen name="Memory Book" component={MemoryBookScreen} options={{ title:'Memory Book' }} />
                    <Stack.Screen name="Baby Tracker" component={BabyTrackerScreen} options={{ title:'Baby Tracker' }} />
                    <Stack.Screen name="Telehealth Consultation" component={TelehealthConsultationScreen} options={{ title:'Telehealth Consultation' }} />
                    <Stack.Screen name="Smart Reminders" component={AddReminderScreen} options={{ title: 'Add Reminder' }} />
                    <Stack.Screen name="MilestoneScreen" component={MilestoneScreen} options={{ title: 'Baby Milestones' }} />
                    <Stack.Screen name="DiaperTrackerScreen" component={DiaperTrackerScreen} options={{ title: 'Diaper Tracker' }} />
                    <Stack.Screen name="SleepingTrackerScreen" component={SleepingTrackerScreen} options={{ title: 'Sleeping Tracker' }} />
                    <Stack.Screen name="SettingsScreen" component={SettingsScreen} options={{ title: 'Settings' }} />
                    <Stack.Screen name="ParentingTipsScreen" component={ParentingTipsScreen} options={{ title: 'Parenting Tips' }} />


                </>
            ) : (
                // --- Unauthenticated Screens (Public Routes) ---
                <>
                    {/* FIX APPLIED: Using the render prop to pass the custom handler */}
                    <Stack.Screen name="Login" options={{ headerShown: false }}>
                        {/* We use the render prop (child function) to pass the required custom prop */}
                        {props => (
                            <LoginScreen 
                                {...props as LoginScreenProps} 
                                onAuthenticationSuccess={handleAuthSuccess} 
                            />
                        )}
                    </Stack.Screen>

                    <Stack.Screen name="Signup" component={SignupScreen} options={{ title: 'Sign Up' }} />
                </>
            )}
        </Stack.Navigator>
    );
};


// ------------------------------------------------------------------
// APP ROOT
// ------------------------------------------------------------------

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Simulate initial authentication check
    useEffect(() => {
        setTimeout(() => {
            setIsAuthenticated(false); // Start unauthenticated
            setIsLoading(false); 
        }, 1000);
    }, []);

    const handleAuthSuccess = () => {
        setIsAuthenticated(true);
    };

    return (
        <NavigationContainer>
            <AuthScreen 
                isAuthenticated={isAuthenticated}
                isLoading={isLoading}
                handleAuthSuccess={handleAuthSuccess}
            />
        </NavigationContainer>
    );
}

// ------------------------------------------------------------------
// EXPORT
// ------------------------------------------------------------------

export default App;