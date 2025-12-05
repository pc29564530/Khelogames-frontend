import React, { useEffect, useState } from 'react';
import { Text, Image, View, TextInput, Pressable, Modal, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useSelector, useDispatch } from 'react-redux';
import { sendOTP, setUser, verifyOTP } from '../redux/actions/actions';
import tailwind from 'twrnc';
import { AUTH_URL } from '../constants/ApiConstants';
import AsyncStorage from '@react-native-async-storage/async-storage';
const logoPath = require('/Users/pawan/project/clone/Khelogames-frontend/assets/images/Khelogames.png');
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import {setAuthenticated} from '../redux/actions/actions';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { storeRefreshToken, storeRefreshTokenExpiresAt } from '../utils/SecureStorage';

function SignIn() {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState()
    const navigation = useNavigation();
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const [formData, setFormData] = useState({
      email: '',
      password:''
    })
    useEffect(() => {

      GoogleSignin.configure({
        webClientId:process.env.WEB_CLIENT_ID,
        offlineAccess: false,
      });
    }, []);

    console.log("Web Client ID: ", process.env.WEB_CLIENT_ID)

    const handleGoogleRedirect = async () => {
      try {
        await GoogleSignin.hasPlayServices();
        await GoogleSignin.signOut()
        const userData = await GoogleSignin.signIn();
        const { idToken } = await GoogleSignin.getTokens();
        setUserInfo(userData.data);
        await axios.get(`${AUTH_URL}/google/handleGoogleRedirect`)
        handleGoogleSignIn(userData.data.idToken);

      } catch (error) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
          console.log('User   cancelled sign-in');
        } else if (error.code === statusCodes.IN_PROGRESS) {
          console.log('Sign-in is in progress');
        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          console.log('Play services are not available');
        } else {
          console.error(error);
        }
      }
    }

    const handleEmailSignIn = async () => {
        try {
            if (!validateForm()) {
                return;
            }

            setLoading(true);
            
            const signinData = {
                email: formData.email.toLowerCase().trim(),
                password: formData.password
            };

            const response = await axios.post(`${AUTH_URL}/google/createEmailSignIn`, signinData);
            const item = response.data;
            if(!item.Success){
              Alert.alert(response.data.message)
              return
            }

            console.log("User Line: ", response.data)
            
            // Store tokens
            await AsyncStorage.setItem("AccessToken", item.AccessToken);
            await AsyncStorage.setItem("Role", item.User?.role);
            await AsyncStorage.setItem("UserPublicID", item?.User?.public_id);
            await AsyncStorage.setItem("AccessTokenExpiresAt", item.AccessTokenExpiresAt);
            await AsyncStorage.setItem("User", JSON.stringify(item.User));
            await storeRefreshToken(item.RefreshToken);
            await storeRefreshTokenExpiresAt(item.RefreshTokenExpiresAt);
            dispatch(setAuthenticated(true));
            dispatch(setUser(item.User));
            
            showAlert('Success', 'Signed in successfully!');
        } catch (err) {
            console.error('Email sign in error:', err);
        
        // Handle different error scenarios
        if (err.response) {
            // Server responded with error status
            const errorData = err.response.data;
            if (errorData && errorData.message) {
                showAlert('Error', errorData.message);
            } else {
                showAlert('Error', 'Sign in failed. Please try again.');
            }
        } else if (err.request) {
            // Network error
            showAlert('Error', 'Network error. Please check your connection.');
        } else {
            // Other error
            showAlert('Error', 'An unexpected error occurred. Please try again.');
        }
        } finally {
            setLoading(false);
        }
    };


    const handleGoogleSignIn = async (idToken) => {
        try {
            const response = await axios.post(`${AUTH_URL}/google/createGoogleSignIn`,{
                code: idToken,
            });
            const item = response.data;
            setUserInfo(item)
            if(!item.Success){
              Alert.alert(response.data.message)
              return
            }
            await AsyncStorage.setItem("AccessToken", item.AccessToken);
            await AsyncStorage.setItem("Role", item.User.role);
            await AsyncStorage.setItem("UserPublicID", item.User.public_id);
            await AsyncStorage.setItem("AccessTokenExpiresAt", item.AccessTokenExpiresAt);
            await AsyncStorage.setItem("User", JSON.stringify(item.User));
            await storeRefreshToken(item.refresh_token);
            await storeRefreshTokenExpiresAt(item.refresh_token_expires_at);
            dispatch(setAuthenticated(!isAuthenticated));
            dispatch(setUser(item.user));
            navigation.navigate("Home")
        } catch(err) {
          if (err.message === "Gmail does not exists, Please Sign Up"){
            console.error(err.message); 
          } else {
            console.error("unable to signin using gmail: ", err)
          }
        }
    }

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

    const validateForm = () => {
        const newErrors = {};
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
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    };
    
    return (
      <View style={tailwind`flex-1 bg-black p-6`}>
        {/* <View style={tailwind`items-center`}>
          <Image src="" style={tailwind`rounded-full h-30 w-30 bg-white`}/>
        </View> */}
        <View style={tailwind`items-center mb-10`}>
          <Text style={tailwind`text-4xl font-extrabold text-white`}>Sign In</Text>
        </View>

        {/* Login using a Gmail account */}
        <View style={tailwind`mb-4`}>
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
              {errors?.email && (
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
              {errors?.password && (
                  <Text style={tailwind`text-red-400 text-sm mt-1 ml-1`}>
                      {errors?.password}
                  </Text>
              )}
          </View>

          {/* Email Signup Button */}
          <Pressable 
              style={tailwind`bg-red-500 py-4 rounded-lg shadow-md ${loading ? 'opacity-50' : ''}`}
              onPress={() => handleEmailSignIn()}
              disabled={loading}
          >
              {loading ? (
                  <ActivityIndicator size="small" color="white" />
              ) : (
                  <Text style={tailwind`text-white text-lg font-bold text-center`}>
                      Sign In
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
  
        <View style={tailwind`mb-6`}>
          <Pressable onPress={handleGoogleRedirect} style={tailwind`bg-white py-4 px-6 rounded-lg shadow-md flex-row items-center justify-center`}>
            <AntDesign name="google" size={24} color="black" />
            <Text style={tailwind`text-lg font-semibold text-gray-800 ml-2`}>Sign In using Gmail</Text>
          </Pressable>
        </View>
        {/* Remove Sign Up  */}
        <View style={tailwind`mb-6`}>
          <Pressable onPress={() => navigation.navigate("SignUp")} style={tailwind`bg-white py-4 px-6 rounded-lg shadow-md flex-row items-center justify-center`}>
            <Text style={tailwind`text-lg font-semibold text-gray-800 ml-2`}>Add New Account</Text>
          </Pressable>
        </View>
      </View>
    );
}

export default SignIn;