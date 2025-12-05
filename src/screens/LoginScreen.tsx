// src/screens/LoginScreen.tsx

import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    Button, 
    StyleSheet, 
    Alert,
    TouchableOpacity 
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { ParamListBase } from '@react-navigation/native';

// 1. Define the props, including the custom prop
interface LoginScreenCustomProps {
    onAuthenticationSuccess: () => void;
}

// 2. Combine Navigation props with custom props
type LoginScreenProps = StackScreenProps<ParamListBase, 'Login'> & LoginScreenCustomProps;

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation, onAuthenticationSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = () => {
        setIsLoading(true);

        // --- NEW Simulated Login Logic ---
        // 1. Check if both fields are non-empty
        if (email.trim() === '' || password.trim() === '') {
            setIsLoading(false);
            Alert.alert("Input Error", "Please enter both an email and a password.");
            return;
        }

        // 2. Simulate successful API call delay (regardless of actual text entered)
        //    In a real app, the API call would go here before calling onAuthenticationSuccess()
        setTimeout(() => {
            setIsLoading(false);
            // SUCCESS: Call the function passed from App.tsx
            // This redirects to the Dashboard.
            onAuthenticationSuccess(); 
        }, 1500);
        
        // --- END NEW Simulated Login Logic ---
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome Back! 👶</Text>

            <TextInput
                style={styles.input}
                // Placeholder now reflects that any text will work
                placeholder="Email Address" 
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            
            <TextInput
                style={styles.input}
                placeholder="Password" 
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <View style={styles.buttonContainer}>
                <Button 
                    title={isLoading ? "Logging In..." : "Log In"} 
                    onPress={handleLogin} 
                    disabled={isLoading}
                    color="#4CAF50"
                />
            </View>

            <TouchableOpacity 
                style={styles.link}
                onPress={() => navigation.navigate('Signup')}
                disabled={isLoading}
            >
                <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
        color: '#333',
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 15,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
    },
    buttonContainer: {
        marginTop: 10,
        borderRadius: 8,
        overflow: 'hidden',
    },
    link: {
        marginTop: 20,
        alignSelf: 'center',
    },
    linkText: {
        color: '#1E90FF',
        fontSize: 16,
    }
});

export default LoginScreen;