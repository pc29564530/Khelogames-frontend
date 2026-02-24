import React, { useEffect, useState } from 'react';
import { Text, View, TextInput, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { authAxiosInstance } from './axios_config';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tailwind from 'twrnc';

import { setAuthenticated, setAuthProfilePublicID, setUser, setAuthUserPublicID, setAuthProfile, setCurrentProfile, setAuthUser } from '../redux/actions/actions';
import { AUTH_URL } from '../constants/ApiConstants';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { storeRefreshToken, storeRefreshTokenExpiresAt } from '../utils/SecureStorage';
import { validateAuthForm } from '../utils/validation/authValidation';
import { WEB_CLIENT_ID } from '@env';

function SignIn() {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState({
    global: null,
    fields: {},
  });

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
      offlineAccess: false,
    });
  }, []);

  //Input Handler
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error.fields[field]) {
      setError(prev => ({ ...prev, fields: { ...prev.fields, [field]: '' } }));
    }
    if (error.global) {
      setError(prev => ({ ...prev, global: null }));
    }
  };

  /* ---------------- EMAIL SIGN IN ---------------- */
  const handleEmailSignIn = async () => {
    const validation = validateAuthForm(formData);
    if (!validation.isValid) {
      setError({ global: null, fields: validation.errors });
      return;
    }

    try {
      setLoading(true);
      const res = await authAxiosInstance.post(`${AUTH_URL}/google/createEmailSignIn`, {
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
      });

      const { accessToken, refreshToken, user, accessTokenExpiresAt, refreshTokenExpiresAt } = res.data;

      await AsyncStorage.multiSet([
        ['AccessToken', accessToken],
        ['AccessTokenExpiresAt', accessTokenExpiresAt],
        ['UserPublicID', user.public_id],
        ['Role', user.role],
        ['User', JSON.stringify(user)],
      ]);

      const profileResponse = await authAxiosInstance.get(`${AUTH_URL}/getProfile/${user.public_id}`);
      await storeRefreshToken(refreshToken);
      await storeRefreshTokenExpiresAt(refreshTokenExpiresAt);
      dispatch(setAuthProfile(profileResponse.data.data));
      dispatch(setCurrentProfile(profileResponse.data.data));
      dispatch(setAuthProfilePublicID(profileResponse.data.data.public_id));
      dispatch(setAuthUser(user));
      dispatch(setAuthUserPublicID(user.public_id));
      dispatch(setAuthenticated(true));
      navigation.reset({ index: 0, routes: [{ name: 'DrawerNavigation' }] });

    } catch (err) {
      const backendError = err?.response?.data?.error?.fields || {};
      setError({ global: 'Invalid email or password. Please try again.', fields: backendError });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- GOOGLE SIGN IN ---------------- */
  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signOut();
      await GoogleSignin.signIn();
      const { idToken } = await GoogleSignin.getTokens();
      setLoading(true);

      const res = await authAxiosInstance.post(`${AUTH_URL}/google`, { id_token: idToken });

      const { accessToken, refreshToken, user, accessTokenExpiresAt, refreshTokenExpiresAt } = res.data;

      await AsyncStorage.multiSet([
        ['AccessToken', accessToken],
        ['AccessTokenExpiresAt', accessTokenExpiresAt],
        ['UserPublicID', user.public_id],
        ['Role', user.role],
        ['User', JSON.stringify(user)],
      ]);

      const profileResponse = await authAxiosInstance.get(`${AUTH_URL}/getProfile/${user.public_id}`);
      await storeRefreshToken(refreshToken);
      await storeRefreshTokenExpiresAt(refreshTokenExpiresAt);
      dispatch(setAuthProfile(profileResponse.data.data));
      dispatch(setCurrentProfile(profileResponse.data.data));
      dispatch(setAuthProfilePublicID(profileResponse.data.data.public_id));
      dispatch(setAuthUser(user));
      dispatch(setAuthUserPublicID(user.public_id));
      dispatch(setAuthenticated(true));
      navigation.reset({ index: 0, routes: [{ name: 'DrawerNavigation' }] });

    } catch (err) {
      setError({ global: err?.response.data?.error?.message || 'Google sign in failed. Please try again.', fields: {} });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={tailwind`flex-1 bg-white`}
      contentContainerStyle={tailwind`flex-grow`}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Red header banner */}
      <View style={tailwind`bg-red-400 pt-14 pb-10 px-6 items-center`}>
        <View style={tailwind`bg-white w-14 h-14 rounded-2xl items-center justify-center mb-3`}>
          <MaterialIcons name="emoji-events" size={30} color="#f87171" />
        </View>
        <Text style={tailwind`text-white text-2xl font-bold`}>KheloGames</Text>
        <Text style={tailwind`text-red-100 text-sm mt-1`}>Welcome back! Sign in to continue</Text>
      </View>

      {/* Form card */}
      <View style={tailwind`bg-white px-6 pt-6 pb-10`}>

        {/* Global error */}
        {error.global && (
          <View style={tailwind`mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl`}>
            <Text style={tailwind`text-red-500 text-sm text-center`}>{error.global}</Text>
          </View>
        )}
        {/* Email */}
        <View style={tailwind`mb-4`}>
          <Text style={tailwind`text-gray-600 text-sm font-medium mb-2`}>Email</Text>
          <View style={[
            tailwind`flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border`,
            { borderColor: error.fields.email ? '#f87171' : '#e5e7eb' }
          ]}>
            <MaterialIcons name="email" size={20} color="#9ca3af" />
            <TextInput
              style={tailwind`flex-1 text-gray-900 text-base ml-3`}
              placeholder="Enter your email"
              placeholderTextColor="#9ca3af"
              value={formData.email}
              onChangeText={t => handleInputChange('email', t)}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          {error.fields.email && (
            <Text style={tailwind`text-red-400 text-xs mt-1 ml-1`}>{error.fields.email}</Text>
          )}
        </View>

        {/* Password */}
        <View style={tailwind`mb-6`}>
          <Text style={tailwind`text-gray-600 text-sm font-medium mb-2`}>Password</Text>
          <View style={[
            tailwind`flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border`,
            { borderColor: error.fields.password ? '#f87171' : '#e5e7eb' }
          ]}>
            <MaterialIcons name="lock" size={20} color="#9ca3af" />
            <TextInput
              style={tailwind`flex-1 text-gray-900 text-base ml-3`}
              placeholder="Enter your password"
              placeholderTextColor="#9ca3af"
              secureTextEntry={!showPassword}
              value={formData.password}
              onChangeText={t => handleInputChange('password', t)}
            />
            <Pressable onPress={() => setShowPassword(p => !p)} style={tailwind`p-1`}>
              <MaterialIcons name={showPassword ? 'visibility' : 'visibility-off'} size={20} color="#9ca3af" />
            </Pressable>
          </View>
          {error.fields.password && (
            <Text style={tailwind`text-red-400 text-xs mt-1 ml-1`}>{error.fields.password}</Text>
          )}
        </View>

        {/* Sign In button */}
        <Pressable
          onPress={handleEmailSignIn}
          disabled={loading}
          style={[tailwind`py-4 rounded-xl items-center justify-center mb-4`, { backgroundColor: loading ? '#fca5a5' : '#f87171' }]}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={tailwind`text-white text-base font-bold`}>Sign In</Text>
          }
        </Pressable>

        {/* Divider */}
        <View style={tailwind`flex-row items-center my-2`}>
          <View style={tailwind`flex-1 h-px bg-gray-100`} />
          <Text style={tailwind`text-gray-400 text-xs px-3`}>or continue with</Text>
          <View style={tailwind`flex-1 h-px bg-gray-100`} />
        </View>

        {/* Google button */}
        <Pressable
          onPress={handleGoogleSignIn}
          disabled={loading}
          style={[tailwind`flex-row items-center justify-center bg-white border border-gray-200 py-4 rounded-xl mt-4 mb-8`, loading && { opacity: 0.6 }]}
        >
          <AntDesign name="google" size={20} color="#EA4335" />
          <Text style={tailwind`text-gray-700 text-base font-semibold ml-3`}>Sign in with Google</Text>
        </Pressable>

        {/* Sign Up link */}
          <View style={tailwind`flex-row justify-center items-center`}>
          <Text style={tailwind`text-gray-500 text-sm`}>Don't have an account? </Text>
          <Pressable onPress={() => navigation.navigate('SignUp')}>
            <Text style={tailwind`text-red-400 text-sm font-semibold`}>Create Account</Text>
          </Pressable>
        </View>

      </View>
    </ScrollView>
  );
}

export default SignIn;
