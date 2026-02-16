import React, { useEffect, useState } from 'react';
import { Text, View, TextInput, Pressable, ActivityIndicator } from 'react-native';
import axiosInstance, { authAxiosInstance } from './axios_config';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tailwind from 'twrnc';

import { setAuthenticated, setAuthProfilePublicID, setUser, setAuthUserPublicID, setAuthProfile, setCurrentProfile, setAuthUser } from '../redux/actions/actions';
import { AUTH_URL } from '../constants/ApiConstants';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { storeRefreshToken, storeRefreshTokenExpiresAt } from '../utils/SecureStorage';
import { validateAuthForm } from '../utils/validation/authValidation';

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
      webClientId: process.env.WEB_CLIENT_ID,
      offlineAccess: false,
    });
  }, []);

  /* ---------------- INPUT HANDLER ---------------- */
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error.fields[field]) {
      setError(prev => ({
        ...prev,
        fields: { ...prev.fields, [field]: '' },
      }));
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
      const res = await authAxiosInstance.post(
        `${AUTH_URL}/google/createEmailSignIn`,
        {
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
        }
      );

      const { accessToken, refreshToken, user, accessTokenExpiresAt, refreshTokenExpiresAt } = res.data;

      await AsyncStorage.multiSet([
        ['AccessToken', accessToken],
        ['AccessTokenExpiresAt', accessTokenExpiresAt],
        ['UserPublicID', user.public_id],
        ['Role', user.role],
        ['User', JSON.stringify(user)],
      ]);

      const profileResponse = await authAxiosInstance.get(`${AUTH_URL}/getProfile/${user.public_id}`);
      console.log("Profile Response: ", profileResponse.data);
      await storeRefreshToken(refreshToken);
      await storeRefreshTokenExpiresAt(refreshTokenExpiresAt);
      dispatch(setAuthProfile(profileResponse.data.data));
      dispatch(setCurrentProfile(profileResponse.data.data));
      dispatch(setAuthProfilePublicID(profileResponse.data.data.public_id));
      dispatch(setAuthUser(user));
      dispatch(setAuthUserPublicID(user.public_id));
      dispatch(setAuthenticated(true));

      navigation.reset({
        index: 0,
        routes: [{ name: 'DrawerNavigation' }],
      });

    } catch (err) {
      const backendError = err?.response?.data?.error?.fields || {};
      setError({
        global: "Unable to sign in",
        fields: backendError,
      });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- GOOGLE SIGN IN ---------------- */
  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();

      setLoading(true);

      const res = await authAxiosInstance.post(
        `${AUTH_URL}/google/createGoogleSignIn`,
        { code: idToken }
      );

      const { accessToken, refreshToken, user, accessTokenExpiresAt, refreshTokenExpiresAt } = res.data;

      await AsyncStorage.multiSet([
        ['AccessToken', accessToken],
        ['AccessTokenExpiresAt', accessTokenExpiresAt],
        ['UserPublicID', user.public_id],
        ['Role', user.role],
        ['User', JSON.stringify(user)],
      ]);

      await storeRefreshToken(refreshToken);
      await storeRefreshTokenExpiresAt(refreshTokenExpiresAt);
      
      dispatch(setAuthUserPublicID(user.public_id));
      dispatch(setAuthenticated(true));

      navigation.reset({
        index: 0,
        routes: [{ name: 'DrawerNavigation' }],
      });

    } catch (err) {
      const backendError = err?.response?.data?.error?.fields || {};
      setError({
        global: "Unable to sign in",
        fields: backendError,
      })
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <View style={tailwind`flex-1 bg-black p-6`}>

      <Text style={tailwind`text-4xl font-extrabold text-white mb-8 text-center`}>
        Sign In
      </Text>

      {error.global && (
        <View style={tailwind`mb-4 p-3 bg-red-900/20 border border-red-500 rounded`}>
          <Text style={tailwind`text-red-400 text-sm`}>{error.global}</Text>
        </View>
      )}

      {/* EMAIL */}
      <View style={tailwind`mb-4`}>
        <View style={tailwind`flex-row items-center bg-gray-800 rounded px-3 py-3`}>
          <MaterialIcons name="email" size={22} color="#9CA3AF" />
          <TextInput
            style={tailwind`flex-1 text-white ml-3`}
            placeholder="Email"
            placeholderTextColor="#9CA3AF"
            value={formData.email}
            onChangeText={(t) => handleInputChange('email', t)}
            autoCapitalize="none"
          />
        </View>
        {error.fields.email && (
          <Text style={tailwind`text-red-400 text-sm mt-1`}>{error.fields.email}</Text>
        )}
      </View>

      {/* PASSWORD */}
      <View style={tailwind`mb-6`}>
        <View style={tailwind`flex-row items-center bg-gray-800 rounded px-3 py-3`}>
          <MaterialIcons name="lock" size={22} color="#9CA3AF" />
          <TextInput
            style={tailwind`flex-1 text-white ml-3`}
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showPassword}
            value={formData.password}
            onChangeText={(t) => handleInputChange('password', t)}
          />
          <Pressable onPress={() => setShowPassword(p => !p)}>
            <MaterialIcons name={showPassword ? 'visibility' : 'visibility-off'} size={22} color="#9CA3AF" />
          </Pressable>
        </View>
        {error.fields.password && (
          <Text style={tailwind`text-red-400 text-sm mt-1`}>{error.fields.password}</Text>
        )}
      </View>

      {/* SIGN IN */}
      <Pressable
        onPress={handleEmailSignIn}
        disabled={loading}
        style={tailwind`bg-red-500 py-4 rounded ${loading && 'opacity-50'}`}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={tailwind`text-white text-lg font-bold text-center`}>Sign In</Text>
        )}
      </Pressable>

      <Text style={tailwind`text-gray-400 text-center my-4`}>or</Text>

      <Pressable
        onPress={handleGoogleSignIn}
        style={tailwind`bg-white py-4 rounded flex-row justify-center items-center`}
      >
        <AntDesign name="google" size={22} color="black" />
        <Text style={tailwind`ml-3 text-lg font-semibold`}>Sign in with Google</Text>
      </Pressable>

    </View>
  );
}

export default SignIn;
