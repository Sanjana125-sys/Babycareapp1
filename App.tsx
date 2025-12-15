// App.tsx
import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { View, Text, ActivityIndicator } from 'react-native';

/* ---------------- Screens ---------------- */
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


/* ---------------- Types ---------------- */
export type RootStackParamList = {
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
  'My Appointments': undefined;
  'Memory Book': undefined;
  'Baby Tracker': undefined;
  'Telehealth Consultation': undefined;
  'Smart Reminders': undefined;
  MilestoneScreen: undefined;
  DiaperTrackerScreen: undefined;
  SleepingTrackerScreen: undefined;
  SettingsScreen: undefined;
  
};

type LoginProps = NativeStackScreenProps<
  RootStackParamList,
  'Login'
> & {
  onAuthenticationSuccess: () => void;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/* ---------------- Auth Wrapper ---------------- */
interface AuthScreenProps {
  isAuthenticated: boolean;
  isLoading: boolean;
  handleAuthSuccess: () => void;
}

const AuthScreen = ({
  isAuthenticated,
  isLoading,
  handleAuthSuccess,
}: AuthScreenProps) => {
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading App Data...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Baby Care Dashboard' }}/>
          <Stack.Screen name="BabyProfile" component={BabyProfileScreen} options={{headerShown: false }} />
          <Stack.Screen name="FeedingTracker" component={FeedingTrackerScreen} options={{ title: 'Feeding Tracker' }}  />
          <Stack.Screen name="GrowthTracker" component={GrowthTrackerScreen} options={{ title: 'Growth Tracker' }} />
          <Stack.Screen name="VaccinationTracker" component={VaccinationTrackerScreen} options={{ title: 'Vaccination Tracker' }} />
          <Stack.Screen name="CryAnalyzer" component={CryAnalyzerScreen} options={{ title: 'Cry Analyzer' }} />
          <Stack.Screen name="ClothingGuide" component={ClothingGuideScreen} options={{ title: 'Clothing Guide' }}  />
          <Stack.Screen name="MedicationTracker" component={MedicationTrackerScreen} options={{ title: 'Medication Tracker' }}/>
          <Stack.Screen name="PediatricianMap" component={PediatricianMapScreen} options={{ title: 'Pediatricians' }}/>
          <Stack.Screen name="Parental Guide" component={ParentalGuideScreen} options={{ title: 'Parental Guide' }}/>
          <Stack.Screen name="Lullabies & Stories" component={LullabiesAndStoriesScreen} options={{ title: 'Lullabies & Stories' }}/>
          <Stack.Screen name="My Appointments" component={AppointmentScreen} options={{ title: 'My Appointments' }} />
          <Stack.Screen name="Memory Book" component={MemoryBookScreen} options={{ title:'Memory Book' }}/>
          <Stack.Screen name="Baby Tracker" component={BabyTrackerScreen} options={{ title:'Baby Tracker' }}/>
          <Stack.Screen name="Telehealth Consultation" component={TelehealthConsultationScreen} options={{ title:'Telehealth Consultation' }}/>
          <Stack.Screen name="Smart Reminders" component={AddReminderScreen} options={{ title: 'Add Reminder' }}/>
          <Stack.Screen name="MilestoneScreen" component={MilestoneScreen} options={{ title: 'Baby Milestones' }}/>
          <Stack.Screen name="DiaperTrackerScreen" component={DiaperTrackerScreen} options={{ title: 'Diaper Tracker' }}/>
          <Stack.Screen name="SleepingTrackerScreen" component={SleepingTrackerScreen} options={{ title: 'Sleeping Tracker' }}/>
          <Stack.Screen name="SettingsScreen" component={SettingsScreen} options={{ title: 'Settings' }}/>
          
        </>
      ) : (
        <>
          <Stack.Screen name="Login">
            {(props) => (
              <LoginScreen
                {...props}
                onAuthenticationSuccess={handleAuthSuccess}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="Signup" component={SignupScreen} options={{ title: 'Sign Up' }}/>
        </>
      )}
    </Stack.Navigator>
  );
};

/* ---------------- App Root ---------------- */
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  return (
    <NavigationContainer>
      <AuthScreen
        isAuthenticated={isAuthenticated}
        isLoading={isLoading}
        handleAuthSuccess={() => setIsAuthenticated(true)}
      />
    </NavigationContainer>
  );
}
