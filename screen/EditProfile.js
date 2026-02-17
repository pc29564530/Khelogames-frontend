import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect, useLayoutEffect} from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert,
  PermissionsAndroid
} from 'react-native';
import axiosInstance from './axios_config';
import {launchImageLibrary} from 'react-native-image-picker';
import RFNS from 'react-native-fs';
import tailwind from 'twrnc';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {BASE_URL, AUTH_URL} from '../constants/ApiConstants';
import {setEditFullName, setEditDescription, setProfileAvatar} from '../redux/actions/actions';
import {useDispatch} from 'react-redux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { validateProfileForm } from '../utils/validation/profileValidation';
import ToastManager from '../utils/ToastManager';
import { handleInlineError, logSilentError } from '../utils/errorHandler';
import { requestLocationPermission } from '../utils/locationService';


function getMediaTypeFromURL(url) {
  const fileExtensionMatch = url.match(/\.([0-9a-z]+)$/i);
  if (fileExtensionMatch) {
    const fileExtension = fileExtensionMatch[1].toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];

    if (imageExtensions.includes(fileExtension)) {
      return 'image';
    }
  }
}

const fileToBase64 = async filePath => {
  try {
    const fileContent = await RFNS.readFile(filePath, 'base64');
    return fileContent;
  } catch (error) {
    console.error('Error converting image to Base64:', error);
    return null;
  }
};

export default function EditProfile() {
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [profile, setProfile] = useState();
  const [coverUrl, setCoverUrl] = useState('');
  const [avatarType, setAvatarType] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [getCurrentLocation, setGetCurrentLocation] = useState(null);
  const [error, setError] = useState({
    global: null,
    fields: {},
  });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const navigation = useNavigation();
  const [isRolesModalVisible, setIsRolesModalVisible] = useState(false);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);

  // Get location based on IP when screen is focused
  useFocusEffect(
          React.useCallback(() => {
              let isActive = true;
  
              const fetchIPLocation = async () => {
                  const location = await getIPBasedLocation();
                  if (isActive && location) {
                      setCity(location.city);
                      setState(location.state);
                      setCountry(location.country);
                  }
              };
  
              fetchIPLocation();
  
              // Cleanup when screen loses focus
              return () => {
                  isActive = false;
              };
          }, [])
      );
  
    const handleLocation = async () => {
          await requestLocationPermission(
              (coords) => {
                  setLatitude(coords.latitude);
                  setLongitude(coords.longitude);
              },
              null,
              setIsLoadingLocation
          );
    };

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const authToken = await AsyncStorage.getItem('AccessToken');
        const response = await axiosInstance.get(`${BASE_URL}/getRoles`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });
        console.log('Roles: ', response.data.data);
        setRoles(response.data.data || []);
      } catch (err) {
        logSilentError(err);
        console.error('Failed to fetch roles: ', err);
      }
    };
    fetchRoles();
  }, []);

  const uploadAvatarimage = async () => {
    try {
      let options = {
        noData: true,
        mediaType: 'photo',
        quality: 0.8,
      };

      const res = await launchImageLibrary(options);

      if (res.didCancel) {
        console.log('User cancelled photo picker');
      } else if (res.error) {
        console.log('ImagePicker Error: ', res.error);
        Alert.alert('Error', 'Failed to select image');
      } else {
        const type = getMediaTypeFromURL(res.assets[0].uri);
        if (type === 'image') {
          const base64File = await fileToBase64(res.assets[0].uri);
          setAvatarUrl(base64File);
          setAvatarType(type);
        } else {
          Alert.alert('Error', 'Unsupported media type');
        }
      }
    } catch (e) {
      console.error('unable to load avatar image', e);
      Alert.alert('Error', 'Failed to upload image');
    }
  };

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const authToken = await AsyncStorage.getItem('AccessToken');
      const userPublicID = await AsyncStorage.getItem('UserPublicID');

      const response = await axiosInstance.get(
        `${AUTH_URL}/getProfile/${userPublicID}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
      const item = response.data;

      setProfile(item.data);
      setFullName(item.data.full_name || '');
      setBio(item.data.bio || '');
      setAvatarUrl(item.data.avatar_url || '');
      setCity(item.data.city || '');
      setState(item.data.state || '');
      setCountry(item.data.country || '');
      setLatitude(item.data.latitude || null);
      setLongitude(item.data.longitude || null);
    } catch (err) {
      console.error('Unable to fetch user profile: ', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Edit Profile',
      headerLeft: () => (
        <Pressable onPress={() => navigation.goBack()}>
          <AntDesign
            name="arrowleft"
            size={24}
            color="white"
            style={tailwind`ml-4`}
          />
        </Pressable>
      ),
      headerStyle: tailwind`bg-red-500`,
      headerTintColor: 'white',
      headerTitleStyle: tailwind`font-bold`,
    });
  }, [navigation]);

  const handleEditProfile = async () => {
    try {
      const formData = {
        full_name: fullName,
        bio,
        city,
        state,
        country,
      }
      const validation = validateProfileForm(formData);
      if (!validation.isValid) {
          setError({
            global: null,
            fields: validation.errors
          });
          console.error("Validation Errors: ", validation.errors);
          return;
      }

      setLoading(true);
      setError({
        global: null,
        fields: {},
      });
      const authToken = await AsyncStorage.getItem('AccessToken');
      const data = {
        full_name: fullName,
        bio: bio,
        avatar_url: avatarUrl,
        city: city,
        state: state,
        country: country,
        latitude: latitude?.toString(),
        longitude: longitude?.toString(),
      };

      console.log("Data: ", data)

      const response = await axiosInstance.put(
        `${BASE_URL}/editProfile`,
        data,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const item = response.data;
      dispatch(setEditFullName(item.data.full_name));
      dispatch(setProfileAvatar(item.data.avatar_url));
      dispatch(setEditDescription(item.data.bio));

      ToastManager.success('Profile updated successfully!');
      navigation.goBack();
    } catch (err) {
      const backendErrors = err?.response?.data?.error?.fields || {};
      if (backendErrors.global) {
        setError({
          global: backendErrors.global,
          fields: {},
        });
      } else {
        setError({
          global: err?.response?.data?.error?.message || "Unable to edit profile",
          fields: backendErrors,
        });
      }
      console.error('unable to update edit the profile ', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewRole = async item => {
    try {
      const authToken = await AsyncStorage.getItem('AccessToken');
      const data = {
        role_id: item.id,
      };
      const response = await axiosInstance.post(
        `${BASE_URL}/addUserRole`,
        data,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
      setSelectedRole(item);
      setIsRolesModalVisible(false);
    } catch (err) {
      console.error('unable to add the new role: ', err);
    }
  };

  return (
    <KeyboardAvoidingView
      style={tailwind`flex-1 bg-gray-50`}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tailwind`pb-6`}>
        {/* Global Error Display */}
        {error?.global && (
          <View style={tailwind`mx-5 mt-4 mb-2 p-3 bg-red-50 border border-red-300 rounded-lg`}>
            <Text style={tailwind`text-red-700 text-sm`}>
              *{error?.global}
            </Text>
          </View>
        )}

        {/* Profile Avatar Section */}
        <View style={tailwind`bg-white shadow-sm`}>
          {/* Cover Background */}
          <View style={tailwind`h-32 bg-gradient-to-r from-red-400 to-red-600`}>
            <View
              style={[
                tailwind`h-full w-full`,
                {backgroundColor: 'rgba(239, 68, 68, 0.9)'},
              ]}
            />
          </View>

          {/* Avatar Container */}
          <View style={tailwind`items-center -mt-16 px-6 pb-6`}>
            <View style={tailwind`relative`}>
              <Image
                style={tailwind`h-32 w-32 rounded-full border-4 border-white shadow-lg bg-gray-200`}
                source={{
                  uri:
                    avatarUrl ||
                    'https://via.placeholder.com/150/CCCCCC/808080?text=Avatar',
                }}
              />
              <Pressable
                style={tailwind`absolute bottom-0 right-0 bg-red-500 rounded-full p-3 shadow-lg border-3 border-white`}
                onPress={uploadAvatarimage}>
                <FontAwesome name="camera" size={18} color="white" />
              </Pressable>
            </View>

            <Text style={tailwind`mt-4 text-gray-500 text-sm text-center`}>
              Tap camera icon to update photo
            </Text>
          </View>
        </View>

        {/* Form Section */}
        <View style={tailwind`px-5 mt-6`}>
          {/* Personal Information Card */}
          <View style={tailwind`bg-white rounded-xl shadow-sm p-5 mb-4`}>
            <View style={tailwind`flex-row items-center mb-4`}>
              <Ionicons name="person-outline" size={22} color="#EF4444" />
              <Text style={tailwind`ml-2 text-lg font-bold text-gray-800`}>
                Personal Information
              </Text>
            </View>

            <View style={tailwind`mb-4`}>
              <Text style={tailwind`text-gray-700 font-semibold mb-2 text-sm`}>
                Full Name *
              </Text>
              <TextInput
                style={tailwind`p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-800 text-base`}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
              />
              {error?.fields?.full_name && (
                <Text style={tailwind`text-red-500 text-sm mt-1`}>
                  *{error?.fields?.full_name}
                </Text>
              )}
            </View>
            <View>
              <Text style={tailwind`text-gray-700 font-semibold mb-2 text-sm`}>
                Bio
              </Text>
              <TextInput
                style={tailwind`p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-800 text-base min-h-24`}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us about yourself..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <Text style={tailwind`text-gray-400 text-xs mt-1 text-right`}>
                {bio.length}/100 characters
              </Text>
              {error?.fields?.bio && (
                <Text style={tailwind`text-red-500 text-sm mt-1`}>
                  *{error.fields.bio}
                </Text>
              )}
            </View>
          </View>

          {/* Role Selection Card */}
          <View style={tailwind`bg-white rounded-xl shadow-sm p-5 mb-4`}>
            <View style={tailwind`flex-row items-center mb-3`}>
              <Ionicons name="briefcase-outline" size={22} color="#EF4444" />
              <Text style={tailwind`ml-2 text-lg font-bold text-gray-800`}>
                Role
              </Text>
            </View>

            <Pressable
              onPress={() => setIsRolesModalVisible(true)}
              style={tailwind`p-4 bg-gray-50 rounded-lg border border-gray-200 flex-row justify-between items-center`}>
              <Text
                style={tailwind`${
                  selectedRole ? 'text-gray-800' : 'text-gray-400'
                } text-base`}>
                {selectedRole ? selectedRole.name : 'Select your role'}
              </Text>
              <AntDesign name="right" size={16} color="#9CA3AF" />
            </Pressable>
          </View>

          {/* Location Card */}
          <View style={tailwind`bg-white rounded-xl shadow-sm p-5 mb-4`}>
            <View style={tailwind`flex-row items-center mb-4`}>
              <MaterialIcons name="location-on" size={22} color="#EF4444" />
              <Text style={tailwind`ml-2 text-lg font-bold text-gray-800`}>
                Location
              </Text>
            </View>

            <Pressable
              onPress={() => {
                handleLocation()
              }}
              style={tailwind`flex-row items-center justify-center p-4 rounded-lg bg-blue-500 mb-4 shadow-sm`}
              disabled={isLoadingLocation}>
              {isLoadingLocation ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <MaterialIcons name="my-location" size={20} color="white" />
                  <Text style={tailwind`text-white text-base font-semibold ml-2`}>
                    Use Current Location
                  </Text>
                </>
              )}
            </Pressable>

            <View style={tailwind`items-center mb-4`}>
              <View style={tailwind`flex-row items-center w-full`}>
                <View style={tailwind`flex-1 h-px bg-gray-300`} />
                <Text style={tailwind`mx-3 text-gray-400 text-sm`}>
                  or enter manually
                </Text>
                <View style={tailwind`flex-1 h-px bg-gray-300`} />
              </View>
            </View>

            <View style={tailwind`mb-3`}>
              <Text style={tailwind`text-gray-700 font-semibold mb-2 text-sm`}>
                City
              </Text>
              <TextInput
                style={tailwind`p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-800 text-base`}
                value={city}
                onChangeText={setCity}
                placeholder="Enter city"
                placeholderTextColor="#9CA3AF"
              />
              {error?.fields?.city && (
                <Text style={tailwind`text-red-500 text-sm mt-1`}>
                  *{error.fields.city}
                </Text>
              )}
            </View>

            <View style={tailwind`mb-3`}>
              <Text style={tailwind`text-gray-700 font-semibold mb-2 text-sm`}>
                State/Province
              </Text>
              <TextInput
                style={tailwind`p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-800 text-base`}
                value={state}
                onChangeText={setState}
                placeholder="Enter state or province"
                placeholderTextColor="#9CA3AF"
              />
              {error?.fields?.state && (
                <Text style={tailwind`text-red-500 text-sm mt-1`}>
                  *{error.fields.state}
                </Text>
              )}
            </View>
            <View>
              <Text style={tailwind`text-gray-700 font-semibold mb-2 text-sm`}>
                Country
              </Text>
              <TextInput
                style={tailwind`p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-800 text-base`}
                value={country}
                onChangeText={setCountry}
                placeholder="Enter country"
                placeholderTextColor="#9CA3AF"
              />
              {error?.fields?.country && (
                <Text style={tailwind`text-red-500 text-sm mt-1`}>
                  *{error.fields.country}
                </Text>
              )}
            </View>
            {latitude && longitude && (
              <View
                style={tailwind`mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200`}>
                <View style={tailwind`flex-row items-center`}>
                  <MaterialIcons name="place" size={16} color="#3B82F6" />
                  <Text style={tailwind`ml-2 text-blue-700 text-xs font-medium`}>
                    Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Role Selection Modal */}
        <Modal
          visible={isRolesModalVisible}
          animationType="slide"
          onRequestClose={() => setIsRolesModalVisible(false)}
          transparent={true}>
          <View
            style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}
            onTouchEnd={() => setIsRolesModalVisible(false)}>
            <View
              style={tailwind`bg-white rounded-t-3xl shadow-2xl max-h-2/3`}
              onTouchEnd={e => e.stopPropagation()}>
              <View style={tailwind`p-5 border-b border-gray-200`}>
                <View style={tailwind`flex-row justify-between items-center`}>
                  <Text style={tailwind`text-xl font-bold text-gray-800`}>
                    Select Your Role
                  </Text>
                  <Pressable onPress={() => setIsRolesModalVisible(false)}>
                    <AntDesign name="close" size={24} color="#6B7280" />
                  </Pressable>
                </View>
              </View>

              <ScrollView style={tailwind`p-5`}>
                {roles?.map((item, i) => (
                  <Pressable
                    key={i}
                    onPress={() => handleNewRole(item)}
                    style={[
                      tailwind`p-4 rounded-xl mb-3 shadow-sm border-2`,
                      selectedRole?.id === item.id
                        ? tailwind`bg-red-50 border-red-500`
                        : tailwind`bg-white border-gray-200`,
                    ]}>
                    <View style={tailwind`flex-row justify-between items-center`}>
                      <Text
                        style={[
                          tailwind`text-base font-semibold`,
                          selectedRole?.id === item.id
                            ? tailwind`text-red-600`
                            : tailwind`text-gray-800`,
                        ]}>
                        {item.name}
                      </Text>
                      {selectedRole?.id === item.id && (
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color="#EF4444"
                        />
                      )}
                    </View>
                    {item.description && (
                      <Text style={tailwind`text-gray-600 text-sm mt-1`}>
                        {item.description}
                      </Text>
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Save Button */}
        <View style={tailwind`px-5 mt-2`}>
          <Pressable
            onPress={handleEditProfile}
            disabled={isSaving}
            style={tailwind`items-center p-4 rounded-xl bg-red-500 shadow-lg ${
              isSaving ? 'opacity-50' : ''
            }`}>
            {isSaving ? (
              <ActivityIndicator color="white" />
            ) : (
              <View style={tailwind`flex-row items-center`}>
                <Ionicons name="checkmark-circle" size={22} color="white" />
                <Text style={tailwind`text-white text-lg font-bold ml-2`}>
                  Save Changes
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}