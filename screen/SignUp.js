import { useState } from 'react';
import { Text, View, TextInput, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDispatch } from 'react-redux';
import tailwind from 'twrnc';
import { AUTH_URL } from '../constants/ApiConstants';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { setAuthenticated, setUser } from '../redux/actions/actions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storeRefreshToken, storeRefreshTokenExpiresAt } from '../utils/SecureStorage';
import { validateAuthForm } from '../utils/validation/authValidation';
import { WEB_CLIENT_ID } from '@env';

const SignUp = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        confirm_password: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({
        global: null,
        fields: {},
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (error[field]) {
            setError(prev => { const e = { ...prev }; delete e[field]; return e; });
        }
        if (error.global) {
            setError(prev => ({ ...prev, global: null }));
        }
    };

    const handleEmailSignUp = async () => {
        try {
            const validation = validateAuthForm(formData);
            if (!validation.isValid) {
                setError(validation.errors);
                return;
            }
            setLoading(true);
            const signupData = {
                full_name: formData.full_name.trim(),
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
            }
        } catch (err) {
            setError({ 
                global: err.response?.data?.error?.message || 'Unable to create account. Please try again.',
                fields: {}
             });
            console.log("Unable to create account:", err);
        } finally {
            setLoading(false);
        }
    };
    
    const handleNavigateLogin = () => navigation.navigate('SignIn');

    navigation.setOptions({
        title: '',
        headerStyle: { backgroundColor: '#0f172a' },
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
            style={tailwind`flex-1`}
            contentContainerStyle={{ backgroundColor: '#0f172a' }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >

            {/* Header */}
            <View style={tailwind`pt-14 pb-12 px-6 items-center`}>
                
                <View style={tailwind`bg-slate-800 w-16 h-16 rounded-2xl items-center justify-center mb-4`}>
                <MaterialIcons name="emoji-events" size={32} color="#ef4444" />
                </View>

                <Text style={tailwind`text-slate-100 text-2xl font-bold`}>
                Create Account
                </Text>

                <Text style={tailwind`text-slate-400 text-sm mt-2 text-center`}>
                Join Kridagram and start your journey
                </Text>

            </View>

            {/* Form Card */}
            <View style={tailwind`mx-5 bg-slate-800 px-6 pt-6 pb-10 rounded-2xl border border-slate-700`}>

                {/* Global Error */}
                {error.global && (
                <View style={tailwind`mb-4 px-4 py-3 bg-red-900/30 border border-red-500/40 rounded-xl`}>
                    <Text style={tailwind`text-red-400 text-sm text-center`}>
                    {error.global}
                    </Text>
                </View>
                )}

                {/* Full Name */}
                <View style={tailwind`mb-4`}>
                <Text style={tailwind`text-slate-300 text-sm font-medium mb-2`}>
                    Full Name
                </Text>

                <View
                    style={[
                    tailwind`flex-row items-center rounded-xl px-4 py-3 border`,
                    {
                        backgroundColor: '#020617',
                        borderColor: error.full_name ? '#ef4444' : '#334155'
                    }
                    ]}
                >
                    <MaterialIcons name="person" size={20} color="#64748b" />

                    <TextInput
                    style={tailwind`flex-1 text-slate-100 text-base ml-3`}
                    placeholder="Enter your full name"
                    placeholderTextColor="#64748b"
                    value={formData.full_name}
                    onChangeText={text => handleInputChange('full_name', text)}
                    autoCapitalize="words"
                    />
                </View>

                {error.full_name && (
                    <Text style={tailwind`text-red-400 text-xs mt-1 ml-1`}>
                    {error.full_name}
                    </Text>
                )}
                </View>

                {/* Email */}
                <View style={tailwind`mb-4`}>
                <Text style={tailwind`text-slate-300 text-sm font-medium mb-2`}>
                    Email
                </Text>

                <View
                    style={[
                    tailwind`flex-row items-center rounded-xl px-4 py-3 border`,
                    {
                        backgroundColor: '#020617',
                        borderColor: error.email ? '#ef4444' : '#334155'
                    }
                    ]}
                >
                    <MaterialIcons name="email" size={20} color="#64748b" />

                    <TextInput
                    style={tailwind`flex-1 text-slate-100 text-base ml-3`}
                    placeholder="Enter your email"
                    placeholderTextColor="#64748b"
                    value={formData.email}
                    onChangeText={text => handleInputChange('email', text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    />
                </View>

                {error.email && (
                    <Text style={tailwind`text-red-400 text-xs mt-1 ml-1`}>
                    {error.email}
                    </Text>
                )}
                </View>

                {/* Password */}
                <View style={tailwind`mb-4`}>
                <Text style={tailwind`text-slate-300 text-sm font-medium mb-2`}>
                    Password
                </Text>

                <View
                    style={[
                    tailwind`flex-row items-center rounded-xl px-4 py-3 border`,
                    {
                        backgroundColor: '#020617',
                        borderColor: error.password ? '#ef4444' : '#334155'
                    }
                    ]}
                >
                    <MaterialIcons name="lock" size={20} color="#64748b" />

                    <TextInput
                    style={tailwind`flex-1 text-slate-100 text-base ml-3`}
                    placeholder="Min 8 chars, uppercase & number"
                    placeholderTextColor="#64748b"
                    value={formData.password}
                    onChangeText={text => handleInputChange('password', text)}
                    secureTextEntry={!showPassword}
                    />

                    <Pressable onPress={() => setShowPassword(!showPassword)}>
                    <MaterialIcons
                        name={showPassword ? 'visibility' : 'visibility-off'}
                        size={20}
                        color="#64748b"
                    />
                    </Pressable>
                </View>

                {error.password && (
                    <Text style={tailwind`text-red-400 text-xs mt-1 ml-1`}>
                    {error.password}
                    </Text>
                )}
                </View>

                {/* Confirm Password */}
                <View style={tailwind`mb-6`}>
                <Text style={tailwind`text-slate-300 text-sm font-medium mb-2`}>
                    Confirm Password
                </Text>

                <View
                    style={[
                    tailwind`flex-row items-center rounded-xl px-4 py-3 border`,
                    {
                        backgroundColor: '#020617',
                        borderColor: error.confirm_password ? '#ef4444' : '#334155'
                    }
                    ]}
                >
                    <MaterialIcons name="lock" size={20} color="#64748b" />

                    <TextInput
                    style={tailwind`flex-1 text-slate-100 text-base ml-3`}
                    placeholder="Re-enter your password"
                    placeholderTextColor="#64748b"
                    value={formData.confirm_password}
                    onChangeText={text => handleInputChange('confirm_password', text)}
                    secureTextEntry={!showConfirmPassword}
                    />

                    <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <MaterialIcons
                        name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                        size={20}
                        color="#64748b"
                    />
                    </Pressable>
                </View>

                {error.confirm_password && (
                    <Text style={tailwind`text-red-400 text-xs mt-1 ml-1`}>
                    {error.confirm_password}
                    </Text>
                )}
                </View>

                {/* Create Account Button */}
                <Pressable
                style={[
                    tailwind`py-4 rounded-xl items-center justify-center mb-4`,
                    { backgroundColor: loading ? '#f87171aa' : '#ef4444' }
                ]}
                onPress={handleEmailSignUp}
                disabled={loading}
                >
                {loading ? (
                    <ActivityIndicator size="small" color="white" />
                ) : (
                    <Text style={tailwind`text-white text-base font-bold`}>
                    Create Account
                    </Text>
                )}
                </Pressable>

                {/* Login Link */}
                <View style={tailwind`flex-row justify-center items-center`}>
                <Text style={tailwind`text-slate-400 text-sm`}>
                    Already have an account?
                </Text>

                <Pressable onPress={handleNavigateLogin}>
                    <Text style={tailwind`text-red-400 text-sm font-semibold ml-1`}>
                    Sign In
                    </Text>
                </Pressable>
                </View>

            </View>

        </ScrollView>
    );
};

export default SignUp;
