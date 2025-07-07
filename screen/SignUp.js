import React, { useEffect, useState } from 'react';
import { Text, View, TextInput, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../redux/actions/actions';
import tailwind, { style } from 'twrnc';
import { AUTH_URL } from '../constants/ApiConstants';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { background } from 'native-base/lib/typescript/theme/styled-system';

function SignUp() {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    
    // Form state
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    
    // UI state
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        GoogleSignin.configure({
            webClientId: process.env.WEB_CLIENT_ID,
            offlineAccess: false,
        });
    }, []);

    // Input validation functions
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    };

    const validateForm = () => {
        const newErrors = {};

        // Full Name validation
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        } else if (formData.fullName.trim().length < 2) {
            newErrors.fullName = 'Full name must be at least 2 characters';
        }

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (!validatePassword(formData.password)) {
            newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number';
        }

        // Confirm Password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const showAlert = (title, message) => {
        Alert.alert(title, message, [{ text: 'OK' }]);
    };

    const handleEmailSignUp = async () => {
        try {
            if (!validateForm()) {
                return;
            }

            setLoading(true);

            // Check if email already exists
            const emailCheckResponse = await axios.get(`${AUTH_URL}/getUserByEmail`, {
                params: { email: formData.email }
            });

            if (emailCheckResponse.data && emailCheckResponse.data.email === formData.email) {
                setErrors({ email: 'Email already registered. Please sign in instead.' });
                return;
            }
        } catch (err) {
            // If user doesn't exist (404), proceed with registration
            if (err.response?.status === 404) {
                try {
                    const signupData = {
                        full_name: formData.fullName.trim(),
                        email: formData.email.toLowerCase().trim(),
                        password: formData.password
                    };

                    const response = await axios.post(`${AUTH_URL}/createEmailSignUp`, signupData);

                    if (response.data.success) {
                        const newUser = response.data.user;
                        dispatch(setUser(newUser));
                        
                        showAlert(
                            'Account Created!', 
                            'Please check your email to verify your account.',
                            [
                                {
                                    text: 'OK',
                                    onPress: () => navigation.navigate('User', { userId: newUser.id })
                                }
                            ]
                        );
                    } else {
                        showAlert('Error', response.data.message || 'Failed to create account');
                    }

                } catch (signUpErr) {
                    console.error("Email signup error:", signUpErr);
                    const errorMessage = signUpErr.response?.data?.message || 'Failed to create account. Please try again.';
                    showAlert('Error', errorMessage);
                }
            } else {
                console.error("Error checking email:", err);
                showAlert('Error', 'Failed to verify email. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        try {
            setLoading(true);
            await GoogleSignin.hasPlayServices();
            await GoogleSignin.signOut(); // Clear previous sessions
            
            const userData = await GoogleSignin.signIn();
            
            if (userData?.data?.user) {
                await processGoogleSignUp(userData.data);
            }
        } catch (error) {
            console.error('Google Sign-Up Error:', error);
            
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                console.log('User cancelled sign-in');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                console.log('Sign-in is in progress');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                showAlert('Error', 'Google Play Services are not available');
            } else {
                showAlert('Error', 'Google sign-up failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const processGoogleSignUp = async (userData) => {
        try {
            // Check if email already exists
            const emailCheckResponse = await axios.get(`${AUTH_URL}/getUserByEmail`, {
                params: { email: userData.user.email }
            });

            if (emailCheckResponse.data && emailCheckResponse.data.email === userData.user.email) {
                showAlert('Account Exists', 'This email is already registered. Please sign in instead.');
                return;
            }
        } catch (err) {
            // If user doesn't exist (404), proceed with registration
            if (err.response?.status === 404) {
                try {
                    const googleSignupData = {
                        google_id: userData.user.id,
                        email: userData.user.email,
                        full_name: userData.user.name || userData.user.email.split('@')[0],
                        avatar_url: userData.user.photo,
                        id_token: userData.idToken
                    };

                    const response = await axios.post(`${AUTH_URL}/google/createGoogleSignUp`, googleSignupData);

                    if (response.data.success) {
                        const newUser = response.data.user;
                        dispatch(setUser(newUser));
                        navigation.navigate('User', { userId: newUser.id });
                        showAlert('Success', 'Account created successfully with Google!');
                    } else {
                        showAlert('Error', response.data.message || 'Failed to create account with Google');
                    }
                } catch (signUpErr) {
                    console.error("Google signup error:", signUpErr);
                    const errorMessage = signUpErr.response?.data?.message || 'Failed to create account with Google. Please try again.';
                    showAlert('Error', errorMessage);
                }
            } else {
                console.error("Error checking email:", err);
                showAlert('Error', 'Failed to verify email. Please try again.');
            }
        }
    };

    const handleNavigateLogin = () => {
        navigation.navigate('SignIn');
    };

    navigation.setOptions({
      title: '',
      headerStyle: {
        backgroundColor: "black"
      },
      headerRight: () => (
        <View style={tailwind`mr-4`}>
            <Pressable onPress={handleNavigateLogin}>
                <FontAwesome name="close" size={24} color="white" />
            </Pressable>
        </View>
      )
    })

    return (
        <ScrollView style={tailwind`flex-1 bg-black`} showsVerticalScrollIndicator={false}>
            <View style={tailwind`flex-1 justify-center p-6 pt-6`}>
                <View style={tailwind`items-center mb-4`}>
                    <Text style={tailwind`text-4xl font-extrabold text-white mb-2`}>
                        Create Account
                    </Text>
                    <Text style={tailwind`text-gray-400 text-center`}>
                        Join KheloGames and start your gaming journey
                    </Text>
                </View>

                {/* Email Signup Form */}
                <View style={tailwind`mb-4`}>
                    {/* Full Name Input */}
                    <View style={tailwind`mb-4`}>
                        <View style={tailwind`flex-row items-center bg-gray-800 rounded-lg px-2.5 py-2.5`}>
                            <MaterialIcons name="person" size={24} color="#9CA3AF" />
                            <TextInput
                                style={tailwind`flex-1 text-white text-lg pl-3`}
                                placeholder="Full Name"
                                placeholderTextColor="#9CA3AF"
                                value={formData.fullName}
                                onChangeText={(text) => handleInputChange('fullName', text)}
                                autoCapitalize="words"
                            />
                        </View>
                        {errors.fullName && (
                            <Text style={tailwind`text-red-400 text-sm mt-1 ml-1`}>
                                {errors.fullName}
                            </Text>
                        )}
                    </View>

                    {/* Email Input */}
                    <View style={tailwind`mb-4`}>
                        <View style={tailwind`flex-row items-center bg-gray-800 rounded-lg px-2.5 py-2.5`}>
                            <MaterialIcons name="email" size={24} color="#9CA3AF" />
                            <TextInput
                                style={tailwind`flex-1 text-white text-lg pl-3`}
                                placeholder="Email Address"
                                placeholderTextColor="#9CA3AF"
                                value={formData.email}
                                onChangeText={(text) => handleInputChange('email', text)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                        {errors.email && (
                            <Text style={tailwind`text-red-400 text-sm mt-1 ml-1`}>
                                {errors.email}
                            </Text>
                        )}
                    </View>

                    {/* Password Input */}
                    <View style={tailwind`mb-4`}>
                        <View style={tailwind`flex-row items-center bg-gray-800 rounded-lg px-2.5 py-2.5`}>
                            <MaterialIcons name="lock" size={24} color="#9CA3AF" />
                            <TextInput
                                style={tailwind`flex-1 text-white text-lg pl-3`}
                                placeholder="Password"
                                placeholderTextColor="#9CA3AF"
                                value={formData.password}
                                onChangeText={(text) => handleInputChange('password', text)}
                                secureTextEntry={!showPassword}
                            />
                            <Pressable onPress={() => setShowPassword(!showPassword)}>
                                <MaterialIcons 
                                    name={showPassword ? "visibility" : "visibility-off"} 
                                    size={24} 
                                    color="#9CA3AF" 
                                />
                            </Pressable>
                        </View>
                        {errors.password && (
                            <Text style={tailwind`text-red-400 text-sm mt-1 ml-1`}>
                                {errors.password}
                            </Text>
                        )}
                    </View>

                    {/* Confirm Password Input */}
                    <View style={tailwind`mb-4`}>
                        <View style={tailwind`flex-row items-center bg-gray-800 rounded-lg px-2.5 py-2.5`}>
                            <MaterialIcons name="lock" size={24} color="#9CA3AF" />
                            <TextInput
                                style={tailwind`flex-1 text-white text-lg pl-3`}
                                placeholder="Confirm Password"
                                placeholderTextColor="#9CA3AF"
                                value={formData.confirmPassword}
                                onChangeText={(text) => handleInputChange('confirmPassword', text)}
                                secureTextEntry={!showConfirmPassword}
                            />
                            <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                <MaterialIcons 
                                    name={showConfirmPassword ? "visibility" : "visibility-off"} 
                                    size={24} 
                                    color="#9CA3AF" 
                                />
                            </Pressable>
                        </View>
                        {errors.confirmPassword && (
                            <Text style={tailwind`text-red-400 text-sm mt-1 ml-1`}>
                                {errors.confirmPassword}
                            </Text>
                        )}
                    </View>

                    {/* Email Signup Button */}
                    <Pressable 
                        style={tailwind`bg-red-500 py-4 rounded-lg shadow-md ${loading ? 'opacity-50' : ''}`}
                        onPress={handleEmailSignUp}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Text style={tailwind`text-white text-lg font-bold text-center`}>
                                Create Account
                            </Text>
                        )}
                    </Pressable>
                </View>

                {/* Divider */}
                <View style={tailwind`flex-row items-center mb-4`}>
                    <View style={tailwind`flex-1 h-px bg-gray-600`} />
                    <Text style={tailwind`text-gray-400 px-4`}>or</Text>
                    <View style={tailwind`flex-1 h-px bg-gray-600`} />
                </View>

                {/* Google Signup Button */}
                <View style={tailwind`mb-4`}>
                    <Pressable 
                        style={tailwind`bg-white py-4 rounded-lg shadow-md flex-row items-center justify-center ${loading ? 'opacity-50' : ''}`}
                        onPress={handleGoogleSignUp}
                        disabled={loading}
                    >
                        <AntDesign name="google" size={24} color="black" />
                        <Text style={tailwind`text-black text-lg font-semibold ml-3`}>
                            Continue with Google
                        </Text>
                    </Pressable>
                </View>

                {/* Sign In Link */}
                <View style={tailwind`flex-row justify-center items-center`}>
                    <Text style={tailwind`text-gray-400`}>Already have an account? </Text>
                    <Pressable onPress={handleNavigateLogin}>
                        <Text style={tailwind`text-red-500 font-semibold`}>Sign In</Text>
                    </Pressable>
                </View>
            </View>
        </ScrollView>
    );
}

export default SignUp;