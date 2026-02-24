import { useEffect, useState } from 'react';
import { Text, View, TextInput, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import tailwind from 'twrnc';
import { AUTH_URL } from '../constants/ApiConstants';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { setAuthenticated, setUser } from '../redux/actions/actions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storeRefreshToken, storeRefreshTokenExpiresAt } from '../utils/SecureStorage';
import { WEB_CLIENT_ID } from '@env';

const SignUp = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({
        global: null,
        fields: {},
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        GoogleSignin.configure({
            webClientId: WEB_CLIENT_ID,
            offlineAccess: false,
        });
    }, []);

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const validatePassword = (password) =>
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/.test(password);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        } else if (formData.fullName.trim().length < 2) {
            newErrors.fullName = 'Full name must be at least 2 characters';
        }
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (!validatePassword(formData.password)) {
            newErrors.password = 'Min 8 chars with uppercase, lowercase and number';
        }
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        setError({});
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (error[field]) {
            setError(prev => ({ ...prev, [field]: '' }));
        }
    };

    const showAlert = (title, message) => Alert.alert(title, message, [{ text: 'OK' }]);

    const handleEmailSignUp = async () => {
        try {
            if (!validateForm()) return;
            setLoading(true);
            const signupData = {
                full_name: formData.fullName.trim(),
                email: formData.email.toLowerCase().trim(),
                password: formData.password
            };
            const response = await axios.post(`${AUTH_URL}/google/createEmailSignUp`, signupData);
            if (response.data.success) {
                const item = response.data;
                await AsyncStorage.setItem("AccessToken", item.accessToken);
                await AsyncStorage.setItem("Role", item.user?.role);
                await AsyncStorage.setItem("UserPublicID", item?.user?.public_id);
                await AsyncStorage.setItem("AccessTokenExpiresAt", item.accessTokenExpiresAt);
                await storeRefreshToken(item.refreshToken);
                await storeRefreshTokenExpiresAt(item.refreshTokenExpiresAt);
                dispatch(setAuthenticated(true));
                dispatch(setUser(item.user));
                navigation.navigate("Home");
            } else {
                showAlert('Error', response.data.message || 'Failed to create account');
            }
        } catch (signUpErr) {
            console.log("Email sign up error:", signUpErr);
            showAlert('Error', signUpErr.response?.data?.message || 'Failed to create account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleRedirect = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            await GoogleSignin.signOut();
            const userData = await GoogleSignin.signIn();
            const { idToken } = await GoogleSignin.getTokens();
            await processGoogleSignUp(userData.data, idToken, navigation);
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
        }
    };

    const processGoogleSignUp = async (userData, idToken, navigation) => {
        try {
            const googleSignupData = {
                google_id: userData.user.id,
                email: userData.user.email,
                full_name: userData.user.name || userData.user.email.split('@')[0],
                avatar_url: userData.user.photo,
                id_token: idToken
            };
            const response = await axios.post(`${AUTH_URL}/google/createGoogleSignUp`, googleSignupData);
            if (response.data.success) {
                const item = response.data;
                dispatch(setUser(item.user));
                dispatch(setAuthenticated(true));
                await AsyncStorage.setItem("Role", item.user.role);
                await AsyncStorage.setItem("UserPublicID", item.user.public_id);
                await AsyncStorage.setItem("AccessToken", item.session.access_token);
                await AsyncStorage.setItem("AccessTokenExpiresAt", item.session.access_token_expires_at);
                await storeRefreshToken(item.session.refresh_token);
                await storeRefreshTokenExpiresAt(item.session.refresh_token_expires_at);
                navigation.navigate('JoinCommunity');
                showAlert('Success', 'Account created successfully with Google!');
            } else {
                showAlert('Error', response.data.message || 'Failed to create account with Google');
            }
        } catch (signUpErr) {
            console.error("Google signup error:", signUpErr);
            showAlert('Error', signUpErr.response?.data?.message || 'Failed to create account with Google. Please try again.');
        }
    };

    const handleNavigateLogin = () => navigation.navigate('SignIn');

    navigation.setOptions({
        title: '',
        headerStyle: { backgroundColor: '#f87171' },
        headerTintColor: 'white',
        headerRight: () => (
            <View style={tailwind`mr-4`}>
                <Pressable onPress={handleNavigateLogin}>
                    <FontAwesome name="close" size={22} color="white" />
                </Pressable>
            </View>
        )
    });

    return (
        <ScrollView
            style={tailwind`flex-1 bg-white`}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            {/* Red header banner */}
            <View style={tailwind`bg-red-400 pt-8 pb-10 px-6 items-center`}>
                <View style={tailwind`bg-white w-14 h-14 rounded-2xl items-center justify-center mb-3`}>
                    <MaterialIcons name="emoji-events" size={30} color="#f87171" />
                </View>
                <Text style={tailwind`text-white text-2xl font-bold`}>Create Account</Text>
                <Text style={tailwind`text-red-100 text-sm mt-1 text-center`}>
                    Join KheloGames and start your journey
                </Text>
            </View>

            {/* Form */}
            <View style={tailwind`bg-white px-6 pt-6 pb-10`}>

                {/* Full Name */}
                <View style={tailwind`mb-4`}>
                    <Text style={tailwind`text-gray-600 text-sm font-medium mb-2`}>Full Name</Text>
                    <View style={[
                        tailwind`flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border`,
                        { borderColor: error.fullName ? '#f87171' : '#e5e7eb' }
                    ]}>
                        <MaterialIcons name="person" size={20} color="#9ca3af" />
                        <TextInput
                            style={tailwind`flex-1 text-gray-900 text-base ml-3`}
                            placeholder="Enter your full name"
                            placeholderTextColor="#9ca3af"
                            value={formData.fullName}
                            onChangeText={text => handleInputChange('fullName', text)}
                            autoCapitalize="words"
                        />
                    </View>
                    {error.fullName && (
                        <Text style={tailwind`text-red-400 text-xs mt-1 ml-1`}>{error.fullName}</Text>
                    )}
                </View>

                {/* Email */}
                <View style={tailwind`mb-4`}>
                    <Text style={tailwind`text-gray-600 text-sm font-medium mb-2`}>Email</Text>
                    <View style={[
                        tailwind`flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border`,
                        { borderColor: error.email ? '#f87171' : '#e5e7eb' }
                    ]}>
                        <MaterialIcons name="email" size={20} color="#9ca3af" />
                        <TextInput
                            style={tailwind`flex-1 text-gray-900 text-base ml-3`}
                            placeholder="Enter your email"
                            placeholderTextColor="#9ca3af"
                            value={formData.email}
                            onChangeText={text => handleInputChange('email', text)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                    {error.email && (
                        <Text style={tailwind`text-red-400 text-xs mt-1 ml-1`}>{error.email}</Text>
                    )}
                </View>

                {/* Password */}
                <View style={tailwind`mb-4`}>
                    <Text style={tailwind`text-gray-600 text-sm font-medium mb-2`}>Password</Text>
                    <View style={[
                        tailwind`flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border`,
                        { borderColor: error.password ? '#f87171' : '#e5e7eb' }
                    ]}>
                        <MaterialIcons name="lock" size={20} color="#9ca3af" />
                        <TextInput
                            style={tailwind`flex-1 text-gray-900 text-base ml-3`}
                            placeholder="Min 8 chars, uppercase & number"
                            placeholderTextColor="#9ca3af"
                            value={formData.password}
                            onChangeText={text => handleInputChange('password', text)}
                            secureTextEntry={!showPassword}
                        />
                        <Pressable onPress={() => setShowPassword(!showPassword)} style={tailwind`p-1`}>
                            <MaterialIcons
                                name={showPassword ? 'visibility' : 'visibility-off'}
                                size={20}
                                color="#9ca3af"
                            />
                        </Pressable>
                    </View>
                    {error.password && (
                        <Text style={tailwind`text-red-400 text-xs mt-1 ml-1`}>{error.password}</Text>
                    )}
                </View>

                {/* Confirm Password */}
                <View style={tailwind`mb-6`}>
                    <Text style={tailwind`text-gray-600 text-sm font-medium mb-2`}>Confirm Password</Text>
                    <View style={[
                        tailwind`flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border`,
                        { borderColor: error.confirmPassword ? '#f87171' : '#e5e7eb' }
                    ]}>
                        <MaterialIcons name="lock" size={20} color="#9ca3af" />
                        <TextInput
                            style={tailwind`flex-1 text-gray-900 text-base ml-3`}
                            placeholder="Re-enter your password"
                            placeholderTextColor="#9ca3af"
                            value={formData.confirmPassword}
                            onChangeText={text => handleInputChange('confirmPassword', text)}
                            secureTextEntry={!showConfirmPassword}
                        />
                        <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={tailwind`p-1`}>
                            <MaterialIcons
                                name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                                size={20}
                                color="#9ca3af"
                            />
                        </Pressable>
                    </View>
                    {error.confirmPassword && (
                        <Text style={tailwind`text-red-400 text-xs mt-1 ml-1`}>{error.confirmPassword}</Text>
                    )}
                </View>

                {/* Create Account button */}
                <Pressable
                    style={[
                        tailwind`py-4 rounded-xl items-center justify-center mb-4`,
                        { backgroundColor: loading ? '#fca5a5' : '#f87171' }
                    ]}
                    onPress={handleEmailSignUp}
                    disabled={loading}
                >
                    {loading
                        ? <ActivityIndicator size="small" color="white" />
                        : <Text style={tailwind`text-white text-base font-bold`}>Create Account</Text>
                    }
                </Pressable>

                {/* Sign In link */}
                <View style={tailwind`flex-row justify-center items-center`}>
                    <Text style={tailwind`text-gray-500 text-sm`}>Already have an account? </Text>
                    <Pressable onPress={handleNavigateLogin}>
                        <Text style={tailwind`text-red-400 text-sm font-semibold`}>Sign In</Text>
                    </Pressable>
                </View>

            </View>
        </ScrollView>
    );
};

export default SignUp;
