import React, { useEffect, useState } from 'react';
import { Text, Image, View, TextInput, Pressable, Modal } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useSelector, useDispatch } from 'react-redux';
import { sendOTP, setUser, verifyOTP } from '../redux/actions/actions';
import { setMobileNumber, setMobileNumberVerified } from '../redux/actions/actions';
import tailwind from 'twrnc';
import { AUTH_URL } from '../constants/ApiConstants';
import AsyncStorage from '@react-native-async-storage/async-storage';
const logoPath = require('/Users/pawan/project/clone/Khelogames-frontend/assets/images/Khelogames.png');
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import {setAuthenticated} from '../redux/actions/actions';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

function SignIn() {
    const dispatch = useDispatch();
    const [mobileNumber, setMobileNumber] = useState('');
    const [userInfo, setUserInfo] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [otp, setOTP] = useState('');
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

    const handleVerify = async () => {
        try {
            const verifyMobileNumber = {mobile_number: mobileNumber, otp: otp}
            const response = await axios.post(`${AUTH_URL}/createMobileSignin`, verifyMobileNumber);
            const item = response.data;
            dispatch(verifyOTP(item))
            dispatch(setMobileNumberVerified(true))
            await AsyncStorage.setItem("AccessToken", item.access_token);
            await AsyncStorage.setItem("Role", item.user.role);
            await AsyncStorage.setItem("User", item.user.username);
            await AsyncStorage.setItem("RefreshToken", item.refresh_token);
            await AsyncStorage.setItem("AccessTokenExpiresAt", item.access_token_expires_at);
            await AsyncStorage.setItem("RefreshTokenExpiresAt", item.refresh_token_expires_at);
            dispatch(setAuthenticated(!isAuthenticated));
            dispatch(setUser(item.user));
        } catch (err) {
            console.error('Failed to verify OTP:', err);
        }
    }

    const handleSendOTP = async () => {
      try {
        const verifyMobileNumber = await axios.get(`${AUTH_URL}/getUserByMobileNumber`, {
          params: {mobile_number: mobileNumber}
        })
        if (verifyMobileNumber.data.mobile_number !== mobileNumber ){
            throw new Error("Mobile number does not exists, please sign up");
        } else {
          const response = await axios.post(`${AUTH_URL}/send_otp`, {mobile_number: mobileNumber})
          dispatch({type: 'SEND_OTP', payload:response.data})
        }
        
      } catch (err) {
        if (err.message === "Mobile number does not exists, please sign up"){
          console.error(err.message);
        } else {
          console.error("Unable to send the otp from ui: ", err);
        }
      }
    }

    const handleGoogleRedirect = async () => {
      try {
        await GoogleSignin.hasPlayServices();
        await GoogleSignin.signOut()
        const userData = await GoogleSignin.signIn();
        console.log("User data: ", userData)
        setUserInfo(userData.data);
        await axios.get(`${AUTH_URL}/google/handleGoogleRedirect`)
        handleRedirect(userData.data.idToken);

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

            const emailCheckResponse = await axios.get(`${AUTH_URL}/getUserByEmail`, {
                params: { email: formData.email.toLowerCase().trim() }
            });

            if (emailCheckResponse.data && emailCheckResponse.data.email === formData.email) {
                setErrors({ email: 'Email already registered. Please sign in instead.' });
                return;
            }
            
            const signinData = {
                email: formData.email.toLowerCase().trim(),
                password: formData.password
            };

            const response = await axios.post(`${AUTH_URL}/createEmailSignIn`, signinData);
            const item = response.data;

            // Store tokens
            await AsyncStorage.setItem("AccessToken", item.access_token);
            await AsyncStorage.setItem("Role", item.user.role);
            await AsyncStorage.setItem("User", item.user.username);
            await AsyncStorage.setItem("RefreshToken", item.refresh_token);
            await AsyncStorage.setItem("AccessTokenExpiresAt", item.access_token_expires_at);
            await AsyncStorage.setItem("RefreshTokenExpiresAt", item.refresh_token_expires_at);

            dispatch(setAuthenticated(!isAuthenticated));
            dispatch(setUser(item.user));
            
            showAlert('Success', 'Signed in successfully!');
        } catch (err) {
            console.error('Email sign in error:', err);
            const errorMessage = err.response?.data?.message || 'Invalid credentials. Please try again.';
            showAlert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };


    const handleRedirect = async (idToken) => {
        try {
          const verifyGmail = await axios.get(`${AUTH_URL}/getUserByGmail`, {
            params: {
              gmail: userInfo.user.email
            }
          });
          if (verifyGmail.data.gmail === userInfo.user.email) {
            const response = await axios.post(`${AUTH_URL}/google/createGoogleSignIn`,{
              code: idToken
            }); 
            const item = response.data;
            setUserInfo(item)
            await AsyncStorage.setItem("AccessToken", item.access_token);
            await AsyncStorage.setItem("Role", item.user.role);
            await AsyncStorage.setItem("User", item.user.username);
            await AsyncStorage.setItem("RefreshToken", item.refresh_token);
            await AsyncStorage.setItem("AccessTokenExpiresAt", item.access_token_expires_at);
            await AsyncStorage.setItem("RefreshTokenExpiresAt", item.refresh_token_expires_at);
            dispatch(setAuthenticated(!isAuthenticated));
            dispatch(setUser(item.user));
          } else {
            const response = await axios.post(`${AUTH_URL}/google/createGoogleSignUp`,{
              code: idToken
            }); 
            const item = response.data;
            setUserInfo(item)
            navigation.navigate('User',{gmail: item})
          }
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
              onPress={handleEmailSignIn}
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
  
        <View style={tailwind`mb-6`}>
          <Pressable onPress={() => handleGoogleRedirect()} style={tailwind`bg-white py-4 px-6 rounded-lg shadow-md flex-row items-center justify-center`}>
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
        {modalVisible && (
            <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
              <View onPress={() => setModalVisible(false)} style={tailwind`flex-1 justify-center items-center bg-white`}>
                <View style={tailwind`w-11/12 mt-10 items-center`}>
                  <Text style={tailwind`text-3xl font-bold text-gray-800`}>Sign In</Text>
                </View>
                <View style={tailwind`ml-15 mr-10 mt-10`}>
                  <View style={tailwind`flex-row items-center border-b border-gray-300 pb-4`}>
                    <AntDesign name="mobile1" size={24} color="#333" />
                    <TextInput
                      style={tailwind`w-full text-lg text-gray-800 pl-4`}
                      keyboardType="numeric"
                      value={mobileNumber}
                      onChangeText={(text) => setMobileNumber(text)}
                      placeholder="Enter Mobile Number"
                    />
                  </View>
                </View>
                <View style={tailwind`mt-10 mr-20 ml-20 gap-10`}>
                  <Pressable style={tailwind`bg-red-400 py-4 rounded-md shadow-md flex-row items-center justify-center p-3 w-40 h-14 `} onPress={() => handleSendOTP()}>
                    <AntDesign name="arrowright" size={24} color="white" />
                    <Text style={tailwind`text-white text-center text-lg font-bold ml-2`}>Send OTP</Text>
                  </Pressable>
                </View>
                <View style={tailwind`ml-15 mr-10 mt-10`}>
                  <View style={tailwind`flex-row items-center border-b border-gray-300 pb-4`}>
                    <AntDesign name="lock" size={24} color="#333" />
                    <TextInput
                      style={tailwind`w-full text-lg text-gray-800 pl-4`}
                      value={otp}
                      onChangeText={(text) => setOTP(text)}
                      placeholder="Enter OTP"
                    />
                  </View>
                </View>
                <View style={tailwind`mt-10 mr-20 ml-20`}>
                  <Pressable onPress={() => handleVerify()} style={tailwind`bg-red-400 py-4 rounded-md shadow-md p-3 w-40 h-14 items-center justify-between`}>
                    <Text style={tailwind`text-white text-center text-lg font-bold`}>Verify</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>
          )}
      </View>
    );
}

export default SignIn;