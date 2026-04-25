import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
  Image,
  Pressable,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import axiosInstance from './axios_config';
import { launchImageLibrary } from 'react-native-image-picker';
import RFNS from 'react-native-fs';
import tailwind from 'twrnc';
import { useSelector } from 'react-redux';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { BASE_URL, AUTH_URL } from '../constants/ApiConstants';
import { setEditFullName, setEditDescription, setProfileAvatar } from '../redux/actions/actions';
import { useDispatch } from 'react-redux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { validateProfileForm } from '../utils/validation/profileValidation';
import ToastManager from '../utils/ToastManager';
import { logSilentError } from '../utils/errorHandler';
import { requestLocationPermission, getIPBasedLocation } from '../utils/locationService';

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

const fileToBase64 = async (filePath) => {
  try {
    const fileContent = await RFNS.readFile(filePath, 'base64');
    return fileContent;
  } catch (error) {
    logSilentError(error);
    return null;
  }
};

export default function EditProfile() {
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarType, setAvatarType] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [error, setError] = useState({ global: null, fields: {} });
  const [loading, setLoading] = useState(false);
  const [isRolesModalVisible, setIsRolesModalVisible] = useState(false);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const authUserPublicID = useSelector(state => state.profile.authUserPublicID);

  const dispatch = useDispatch();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Text style={tailwind`text-xl font-bold text-white`}>Edit Profile</Text>
      ),
      headerStyle: {
        backgroundColor: '#1e293b',
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTintColor: '#e2e8f0',
      headerTitleAlign: 'center',
      headerLeft: () => (
        <Pressable onPress={() => navigation.goBack()} style={tailwind`ml-4`}>
          <AntDesign name="arrowleft" size={22} color="white" />
        </Pressable>
      ),
    });
  }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const fetchIPLocation = async () => {
        try {
          const authToken = await AsyncStorage.getItem("AccessToken")
          const locationRes = await axiosInstance.get(`${BASE_URL}/geo/suggest`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
          })
          const location = locationRes.data.data;
          console.log("Location: ", location)
          if (isActive && location) {
            setCity((prev) => prev || location.city || '');
            setState((prev) => prev || location.state || '');
            setCountry((prev) => prev || location.country || '');
          }
        } catch (err) {
          logSilentError(err);
        }
      };
      fetchIPLocation();
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

  const uploadAvatarimage = async () => {
    try {
      const options = { noData: true, mediaType: 'photo', quality: 0.8 };
      const res = await launchImageLibrary(options);
      if (res.didCancel) return;
      if (res.error) {
        setError({ global: 'Failed to select image. Please try again.', fields: {} });
        return;
      }
      const type = getMediaTypeFromURL(res.assets[0].uri);
      if (type === 'image') {
        const base64File = await fileToBase64(res.assets[0].uri);
        setAvatarUrl(base64File);
        setAvatarType(type);
      } else {
        setError({ global: 'Please select a valid image (JPG, PNG, GIF).', fields: {} });
      }
    } catch (err) {
      setError({
        global: "Unable to upload image",
        fields: {},
      })
      console.log("Unable to upload image: ", err);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const authToken = await AsyncStorage.getItem('AccessToken');
      const response = await axiosInstance.get(`${AUTH_URL}/getProfile/${authUserPublicID}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      const item = response.data;
      setFullName(item.data.full_name || '');
      setBio(item.data.bio || '');
      setAvatarUrl(item.data.avatar_url || '');
    } catch (err) {
      logSilentError(err);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleEditProfile = async () => {
    try {
      const formData = { full_name: fullName, bio, city, state, country };
      const validation = validateProfileForm(formData);
      if (!validation.isValid) {
        setError({ global: null, fields: validation.errors });
        return;
      }

      setLoading(true);
      setError({ global: null, fields: {} });
      const authToken = await AsyncStorage.getItem('AccessToken');
      const data = {
        full_name: fullName,
        bio,
        avatar_url: avatarUrl,
        city,
        state,
        country,
        latitude: latitude?.toString(),
        longitude: longitude?.toString(),
      };
      const response = await axiosInstance.put(`${BASE_URL}/editProfile`, data, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const item = response.data;
      dispatch(setEditFullName(item.data.full_name));
      dispatch(setProfileAvatar(item.data.avatar_url));
      dispatch(setEditDescription(item.data.bio));

      ToastManager.success('Profile updated successfully!');
      navigation.goBack();
    } catch (err) {
      const backendErrors = err?.response?.data?.error?.fields || {};
      setError({
        global: err?.response?.data?.error?.message || 'Unable to edit profile',
        fields: backendErrors,
      });
      logSilentError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewRole = async (item) => {
    try {
      const authToken = await AsyncStorage.getItem('AccessToken');
      await axiosInstance.post(
        `${BASE_URL}/addUserRole`,
        { role_id: item.id },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setSelectedRole(item);
      setIsRolesModalVisible(false);
    } catch (err) {
      logSilentError(err);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0f172a' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: '#0f172a' }}
        contentContainerStyle={tailwind`px-5 py-5 pb-12`}
        showsVerticalScrollIndicator={false}
      >
        {/* Global Error */}
        {error?.global && (
          <View
            style={[
              tailwind`mb-4 p-3.5 rounded-xl`,
              { backgroundColor: '#1e293b', borderColor: '#334155', borderWidth: 1 },
            ]}
          >
            <View style={tailwind`flex-row items-center`}>
              <MaterialIcons name="error-outline" size={18} color="#f87171" />
              <Text style={tailwind`text-red-400 text-sm ml-2 flex-1`}>{error.global}</Text>
            </View>
          </View>
        )}

        {/* Avatar */}
        <View
          style={[
            tailwind`items-center rounded-2xl p-5 mb-4`,
            { backgroundColor: '#1e293b', borderColor: '#334155', borderWidth: 1 },
          ]}
        >
          <Pressable onPress={uploadAvatarimage} style={tailwind`relative`}>
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={[
                  tailwind`w-24 h-24 rounded-full`,
                  { backgroundColor: '#334155', borderWidth: 2, borderColor: '#334155' },
                ]}
              />
            ) : (
              <View
                style={[
                  tailwind`w-24 h-24 rounded-full items-center justify-center`,
                  { backgroundColor: '#0f172a', borderWidth: 2, borderColor: '#334155' },
                ]}
              >
                <FontAwesome name="user" size={40} color="#475569" />
              </View>
            )}
            <View
              style={[
                tailwind`absolute bottom-0 right-0 rounded-full p-2`,
                { backgroundColor: '#f87171', borderWidth: 2, borderColor: '#1e293b' },
              ]}
            >
              <FontAwesome name="camera" size={12} color="white" />
            </View>
          </Pressable>
          <Text style={{ color: '#94a3b8', fontSize: 13, marginTop: 10 }}>
            Tap photo to change
          </Text>
        </View>

        {/* Form card */}
        <View
          style={[
            tailwind`rounded-2xl p-5 mb-4`,
            { backgroundColor: '#1e293b', borderColor: '#334155', borderWidth: 1 },
          ]}
        >
          {/* Full Name */}
          <View style={tailwind`mb-5`}>
            <Text style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: 8, fontSize: 14 }}>
              Full Name
            </Text>
            <TextInput
              style={[
                tailwind`py-3 px-4 rounded-xl text-sm`,
                { backgroundColor: '#0f172a', color: '#f1f5f9', borderColor: '#334155', borderWidth: 1 },
              ]}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              placeholderTextColor="#475569"
            />
            {error?.fields?.full_name && (
              <Text style={tailwind`text-red-400 text-xs mt-1.5`}>{error.fields.full_name}</Text>
            )}
          </View>

          {/* Bio */}
          <View style={tailwind`mb-5`}>
            <Text style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: 8, fontSize: 14 }}>
              Bio
            </Text>
            <TextInput
              style={[
                tailwind`py-3 px-4 rounded-xl text-sm`,
                {
                  backgroundColor: '#0f172a',
                  color: '#f1f5f9',
                  borderColor: '#334155',
                  borderWidth: 1,
                  minHeight: 96,
                  textAlignVertical: 'top',
                },
              ]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself..."
              placeholderTextColor="#475569"
              multiline
              numberOfLines={4}
              maxLength={100}
            />
            <Text style={{ color: '#64748b', fontSize: 11, textAlign: 'right', marginTop: 4 }}>
              {bio.length}/100
            </Text>
            {error?.fields?.bio && (
              <Text style={tailwind`text-red-400 text-xs mt-1.5`}>{error.fields.bio}</Text>
            )}
          </View>

          {/* Role */}
          <View style={tailwind`mb-5`}>
            <Text style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: 8, fontSize: 14 }}>
              Role
            </Text>
            <Pressable
              onPress={() => setIsRolesModalVisible(true)}
              style={[
                tailwind`flex-row justify-between items-center py-3 px-4 rounded-xl`,
                { backgroundColor: '#0f172a', borderColor: '#334155', borderWidth: 1 },
              ]}
            >
              <Text style={{ color: selectedRole ? '#f1f5f9' : '#475569', fontSize: 14 }}>
                {selectedRole ? selectedRole.name : 'Select your role'}
              </Text>
              <MaterialIcons name="keyboard-arrow-down" size={20} color="#94a3b8" />
            </Pressable>
          </View>

          {/* Location label */}
          <Text style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: 8, fontSize: 14 }}>
            Location
          </Text>

          {/* Use Current Location */}
          <Pressable
            onPress={handleLocation}
            disabled={isLoadingLocation}
            style={[
              tailwind`flex-row items-center justify-center py-3 rounded-xl mb-4`,
              { backgroundColor: isLoadingLocation ? '#475569' : '#0f172a', borderColor: '#334155', borderWidth: 1 },
            ]}
          >
            {isLoadingLocation ? (
              <ActivityIndicator color="#f87171" />
            ) : (
              <>
                <MaterialIcons name="my-location" size={16} color="#f87171" />
                <Text style={{ color: '#f1f5f9', fontSize: 14, fontWeight: '600', marginLeft: 8 }}>
                  Use Current Location
                </Text>
              </>
            )}
          </Pressable>

          {/* City + State row */}
          <View style={tailwind`flex-row mb-5`}>
            <View style={tailwind`flex-1 mr-2`}>
              <TextInput
                style={[
                  tailwind`py-3 px-4 rounded-xl text-sm`,
                  { backgroundColor: '#0f172a', color: '#f1f5f9', borderColor: '#334155', borderWidth: 1 },
                ]}
                value={city}
                onChangeText={setCity}
                placeholder="City"
                placeholderTextColor="#475569"
              />
              {error?.fields?.city && (
                <Text style={tailwind`text-red-400 text-xs mt-1`}>{error.fields.city}</Text>
              )}
            </View>
            <View style={tailwind`flex-1`}>
              <TextInput
                style={[
                  tailwind`py-3 px-4 rounded-xl text-sm`,
                  { backgroundColor: '#0f172a', color: '#f1f5f9', borderColor: '#334155', borderWidth: 1 },
                ]}
                value={state}
                onChangeText={setState}
                placeholder="State"
                placeholderTextColor="#475569"
              />
              {error?.fields?.state && (
                <Text style={tailwind`text-red-400 text-xs mt-1`}>{error.fields.state}</Text>
              )}
            </View>
          </View>

          {/* Country */}
          <View style={tailwind`mb-2`}>
            <TextInput
              style={[
                tailwind`py-3 px-4 rounded-xl text-sm`,
                { backgroundColor: '#0f172a', color: '#f1f5f9', borderColor: '#334155', borderWidth: 1 },
              ]}
              value={country}
              onChangeText={setCountry}
              placeholder="Country"
              placeholderTextColor="#475569"
            />
            {error?.fields?.country && (
              <Text style={tailwind`text-red-400 text-xs mt-1`}>{error.fields.country}</Text>
            )}
          </View>

          {/* Coordinates */}
          {latitude && longitude && (
            <View
              style={[
                tailwind`mt-3 p-3 rounded-xl flex-row items-center`,
                { backgroundColor: '#0f172a', borderColor: '#334155', borderWidth: 1 },
              ]}
            >
              <MaterialIcons name="place" size={14} color="#f87171" />
              <Text style={{ color: '#94a3b8', fontSize: 12, marginLeft: 6 }}>
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </Text>
            </View>
          )}
        </View>

        {/* Submit */}
        <Pressable
          onPress={handleEditProfile}
          disabled={loading}
          style={[
            tailwind`py-4 rounded-2xl items-center bg-red-400`,
            {
              shadowColor: '#f87171',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 4,
              opacity: loading ? 0.6 : 1,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={tailwind`text-white text-base font-semibold`}>Save Changes</Text>
          )}
        </Pressable>

        {/* Role Modal */}
        {isRolesModalVisible && (
          <Modal
            visible={isRolesModalVisible}
            animationType="slide"
            transparent
            onRequestClose={() => setIsRolesModalVisible(false)}
          >
            <Pressable
              style={tailwind`flex-1 justify-end bg-black/60`}
              onPress={() => setIsRolesModalVisible(false)}
            >
              <View
                style={[
                  tailwind`rounded-t-3xl max-h-2/3`,
                  { backgroundColor: '#1e293b', borderTopWidth: 1, borderColor: '#334155' },
                ]}
                onStartShouldSetResponder={() => true}
              >
                <View
                  style={[
                    tailwind`w-10 h-1 rounded-full self-center mt-2 mb-3`,
                    { backgroundColor: '#475569' },
                  ]}
                />
                <View
                  style={[
                    tailwind`px-5 pb-4 flex-row justify-between items-center`,
                    { borderBottomWidth: 1, borderBottomColor: '#334155' },
                  ]}
                >
                  <Text style={{ color: '#f1f5f9', fontSize: 18, fontWeight: '700' }}>
                    Select Your Role
                  </Text>
                  <Pressable onPress={() => setIsRolesModalVisible(false)}>
                    <AntDesign name="close" size={22} color="#94a3b8" />
                  </Pressable>
                </View>

                <ScrollView style={tailwind`px-5 py-4`}>
                  {roles?.map((item) => {
                    const isSelected = selectedRole?.id === item.id;
                    return (
                      <Pressable
                        key={item.id}
                        onPress={() => handleNewRole(item)}
                        style={[
                          tailwind`p-4 rounded-2xl mb-3`,
                          {
                            backgroundColor: isSelected ? '#f8717120' : '#0f172a',
                            borderColor: isSelected ? '#f87171' : '#334155',
                            borderWidth: 1,
                          },
                        ]}
                      >
                        <View style={tailwind`flex-row justify-between items-center`}>
                          <Text
                            style={{
                              color: isSelected ? '#f87171' : '#f1f5f9',
                              fontSize: 15,
                              fontWeight: '600',
                            }}
                          >
                            {item.name}
                          </Text>
                          {isSelected && (
                            <Ionicons name="checkmark-circle" size={22} color="#f87171" />
                          )}
                        </View>
                        {item.description && (
                          <Text style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>
                            {item.description}
                          </Text>
                        )}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            </Pressable>
          </Modal>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
