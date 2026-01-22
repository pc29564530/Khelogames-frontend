import React, {useState, useEffect} from 'react';
import {View, Text, Pressable, TouchableOpacity, Alert, Dimensions, Modal, TextInput, Image, KeyboardAvoidingView} from 'react-native';
import { CurrentRenderContext, useFocusEffect, useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {useSelector,useDispatch} from 'react-redux';
import { setFollowUser, setUnFollowUser, getFollowingUser, getProfile, checkIsFollowing} from '../redux/actions/actions';
import axiosInstance from './axios_config';
import tailwind from 'twrnc';
import { AUTH_URL, BASE_URL } from '../constants/ApiConstants';
import TopTabProfile from '../navigation/TopTabProfile';
import { launchImageLibrary } from 'react-native-image-picker';
import CountryPicker from 'react-native-country-picker-modal';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Animated, { Extrapolation, interpolate, interpolateColor, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, useAnimatedProps } from 'react-native-reanimated';
import { handleInlineError } from '../utils/errorHandler';
import ToastManager from '../utils/ToastManager';

function Profile({route}) {
    const {profilePublicID} = route.params;
    console.log("Profile: ", profilePublicID)
    const dispatch = useDispatch();
    const isFollowing = useSelector((state) => state.user.isFollowing)
    const navigation = useNavigation();
    const following = useSelector((state) => state.user.following);
    const [showEditProfileButton,setShowEditProfileButton] = useState(false);
    const [moreTabVisible, setMoreTabVisible] = useState(false);
    const [currentUser, setCurrentUser] = useState('');
    const [displayText, setDisplayText] = useState('');
    const [player, setPlayer] = useState(null);
    const [loading, setLoading] = useState(false);
    const profile = useSelector(state => state.profile.profile)
    const authProfilePublicID = useSelector(state => state.profile.authProfilePublicID)
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [isModalOrganizerVerified, setIsModalOrganizerVerified] = useState(false);
    const [organizationName, setOrganizationName] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState(null);
    const [documentURL, setDocumentURL] = useState(null);
    const [isModalUploadDocumentVisible, setIsModalUploadDocumentVisible] = useState(false);
    const [documentUploaded, setDocumentUploaded] = useState(null);
    const [isCountryPicker, setIsCountryPicker] = useState(false);
    const [profileData, setProfileData] = useState([]);
    const [email, setEmail] = useState(null);
    const [country, setCountry] = useState(null);

     useEffect(() => {
      const fetchProfile = async () => {
        const authToken = await AsyncStorage.getItem("AccessToken");
        const response = await axiosInstance.get(`${AUTH_URL}/getProfileByPublicID/${profilePublicID}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        })
        const item = response.data;
        dispatch(getProfile(response.data.data))
      }
      if(profilePublicID !== profile.public_id){
        fetchProfile();
      }
    },[profilePublicID])

    useFocusEffect(
      React.useCallback(() => {
        fetchFollowing();
        verifyUser();
        fetchData();
        fetchFollowerCount();
        fetchFollowingCount();
        if(profilePublicID !== authProfilePublicID){
          checkIsFollowingFunc();
        }
      }, [profilePublicID])
    );

    const checkIsFollowingFunc = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`${BASE_URL}/isFollowing/${profilePublicID}`, {
              headers: {
                  'Authorization': `Bearer ${authToken}`,
                  'Content-Type': 'application/json'
              }
            });
            dispatch(checkIsFollowing(response.data.data));
        } catch (err) {
            const message = handleInlineError(err);
            ToastManager.show('Failed to update. Please try again.', 'err'); 
            console.error("Unable to check is_following: ", err);
        }
    };

const handleReduxFollow = async () => {
  setLoading(true);
  try {
    const authToken = await AsyncStorage.getItem('AccessToken');

    const response = await axiosInstance.post(
      `${BASE_URL}/create_follow/${profilePublicID}`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Update Redux state
    if (response?.data) {
      dispatch(setFollowUser(response.data.data));
    } else {
      dispatch(setFollowUser([]));
    }

    // Update follower count & isFollowing status
    try { await checkIsFollowingFunc(); } catch {}
    try { await fetchFollowerCount(); } catch {}
    ToastManager.show('User followed successfully!', 'success');
  } catch (err) {
    console.error('Follow user failed:', err);
    ToastManager.show('Failed to follow user. Please try again.', 'error');
  } finally {
    setLoading(false);
  }
};

const handleReduxUnFollow = async () => {
  setLoading(true);
  try {
    const authToken = await AsyncStorage.getItem('AccessToken');

    const response = await axiosInstance.delete(
      `${BASE_URL}/unFollow/${profilePublicID}`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Update Redux state
    if (response?.data) {
      dispatch(setUnFollowUser(response.data.data));
    } else {
      dispatch(setUnFollowUser([]));
    }

    // Update follower count & isFollowing status
    try { await checkIsFollowingFunc(); } catch {}
    try { await fetchFollowerCount(); } catch {}

    ToastManager.show('User unfollowed successfully!', 'info');
  } catch (err) {
    console.error('Unfollow user failed:', err);
    ToastManager.show('Failed to unfollow user. Please try again.');
  } finally {
    setLoading(false);
  }
};


  const handleFollowButton = async () => {
    if(isFollowing?.is_following) {
       handleReduxUnFollow();
    } else {
       handleReduxFollow();
    } 
  }

    const fetchFollowing = async () => {
      try {
        const authToken = await AsyncStorage.getItem('AccessToken');
        const response = await axiosInstance.get(`${BASE_URL}/getFollowing`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            }
        })
        const item = response.data;
        if(item === null) {
           dispatch(getFollowingUser([]));
        } else {
            dispatch(getFollowingUser(item));
        }
    } catch (e) {
        console.error(e);
    }
  }

  const fetchData = async () => {
    try {
      const userPublicID = await AsyncStorage.getItem('UserPublicID');
      if (!userPublicID) {
        console.log("User not found in AsyncStorage.");
        return;
      }
      
      if(authProfilePublicID !== profilePublicID){
        const response = await axios.get(`${AUTH_URL}/getProfileByPublicID/${profilePublicID}`);
        if (response.data === null) {
          setProfileData([]);
        } else {
          const item = response.data
          dispatch(getProfile(item.data))
          setProfileData(item.data)

          if(!item.data.avatar_url || response.item.avatar_url === '') {
            const usernameInitial = response.data.username ? response.data.username.charAt(0) : '';
            setDisplayText(usernameInitial.toUpperCase());
          } else {
            setDisplayText('');
          }
        }
      } else {
        const response = await axios.get(`${AUTH_URL}/getProfile/${userPublicID}`)
       if( response.data == null ){
          setProfileData([])
        } else {
          const item =  response.data
          setProfileData(item.data);
          dispatch(getProfile(item.data))
          if(!item.data.avatar_url || item.data.avatar_url === '') {
            const usernameInitial = item.data.username ? item.data.username.charAt(0) : '';
            setDisplayText(usernameInitial.toUpperCase());
          } else {
            setDisplayText('');
          }
        }
      }
    } catch(e) {
      console.error("unable to fetch the profile details", e)
    }
  }

  const verifyUser = async () => {
    const userPublicID = await AsyncStorage.getItem("UserPublicID");
    if(profilePublicID === authProfilePublicID) {
      setShowEditProfileButton(true);
      setCurrentUser(authProfilePublicID);
    } else {
      setCurrentUser(profilePublicID);
    }
  }

  const fetchFollowerCount = async () => {
    try {
        const authToken = await AsyncStorage.getItem('AccessToken');
        const response = await axiosInstance.get(`${BASE_URL}/getFollower`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          }
        });

        const item = response.data;
        if(item.data !== null && Array.isArray(item.data)) {
          setFollowerCount(item.data.length);
        }
    } catch(err) {
        console.error("Error fetching follower count:", err);
    }
  }

  const fetchFollowingCount = async () => {
    try {
      const authToken = await AsyncStorage.getItem('AccessToken');
      const response = await axiosInstance.get(`${BASE_URL}/getFollowing`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        }
      });
      const item = response.data;
      if(item.data !== null && Array.isArray(item.data)) {
        setFollowingCount(item.data.length);
      }
    } catch(err) {
        console.error("Error fetching following count:", err);
    }
  }


  // handle message used to open the message box
  const handleMessage = () => {
    navigation.navigate("Message", {profileData: profile})
  }

  const handleEditProfile = () => {
    navigation.navigate('EditProfile')
  };

const addPlayerProfile = () => {
  navigation.navigate("CreatePlayerProfile");
}

const isFollowingConditionCheck = () => {
  console.log("Is Following: ", isFollowing)
  if(isFollowing?.is_following) {
    return 'Following'
  } else {
    return 'Follow'
  }
}

useEffect(() => {
  console.log("isFollowing state changed: ", isFollowing);
}, [isFollowing]);

    const AnimatedMaterialIcons = Animated.createAnimatedComponent(MaterialIcons);
    const AnimatedAntDesign = Animated.createAnimatedComponent(AntDesign)

    const { height: sHeight, width: sWidth } = Dimensions.get('screen');

    const scrollY = useSharedValue(0);

    const handleScroll = useAnimatedScrollHandler((e) => {
        scrollY.value = e.contentOffset.y;
      })
    
      const bgColor = 'white'
      const bgColor2 =  'rgb(248, 113, 113)'
      const headerInitialHeight = 100;
      const headerNextHeight = 50;
      const offsetValue = 100;
      
      const animatedIconProps = useAnimatedProps(() => {
        return {
          color: interpolateColor(
            scrollY.value,
            [0, offsetValue],
            ['black', 'white']
          ),
        }
      })


      const animatedHeader = useAnimatedStyle(() => {
        const height = interpolate(
          scrollY.value,
          [0, offsetValue],
          [headerInitialHeight, headerNextHeight],
          Extrapolation.CLAMP,
        )
    
        const backgroundColor = interpolateColor(
          scrollY.value,
          [0, offsetValue],
          [bgColor, bgColor2]
        )
        return {
          backgroundColor, height
        }
      })

      const nameAnimatedStyles = useAnimatedStyle(() => {
        const opacity = interpolate(
          scrollY.value,
          [0, 100, offsetValue],
          [0, 1, 1],
          Extrapolation.CLAMP,
        )
        const translateX = interpolate(
          scrollY.value,
          [0, offsetValue],
          [0, 40],
          Extrapolation.CLAMP,
        )
        const translateY = interpolate(
          scrollY.value,
          [0, offsetValue],
          [0, -5],
          Extrapolation.CLAMP,
        )
        return { opacity, transform: [{ translateX }, { translateY }] }
      })
      const animImage = useAnimatedStyle(() => {
        const yValue = 75;
        const translateY = interpolate(
          scrollY.value,
          [0, offsetValue],
          [0, -80],
          Extrapolation.CLAMP,
        )
    
        const xValue = sWidth / 2 - (2 * 16) - 20;
        const translateX = interpolate(
          scrollY.value,
          [0, offsetValue],
          [0, -xValue],
          Extrapolation.CLAMP,
        )
    
        const scale = interpolate(
          scrollY.value,
          [0, offsetValue],
          [1, 0.3],
          Extrapolation.CLAMP,
        )
        return {
          transform: [{ translateY }, { translateX }, { scale }]
        }
      })

      const handleUploadDocument = async () => {
        try {
            let options = { 
                noData: true,
                mediaType: 'image',
            };
    
            const res = await launchImageLibrary(options);
    
            if (res.didCancel) {
                console.log('User cancelled photo picker');
            } else if (res.error) {
                console.log('ImagePicker Error: ', res.error);
            } else {
                // Handle document upload logic here
                setDocumentUploaded(true);
            }
        } catch (e) {
            console.error("unable to load avatar image", e);
        }
      }

      const handleVerificationDetails = async () => {
        try {
          const authToken = await AsyncStorage.getItem('AccessToken');
          const data = {
            profile_id: profile.id,
            organization_name: organizationName,
            email: email,
            phone_number: country ? `+${country.callingCode}` : '+91' + '-' + phoneNumber,
            document_type: 'Verification',
            file_path: documentURL
          }
          const response = await axiosInstance.post(`${BASE_URL}/applyForVerification`, data, {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json',
          }
          })
          if(response.data){
            setIsModalOrganizerVerified(false)
          }
        } catch (err) {
          console.error("Failed to verified the details and documents: ", err)
        }
      }
    return(
      <View style={tailwind`flex-1`}>
            <Animated.View style={[tailwind`flex-row items-center justify-between`, animatedHeader]}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={tailwind`items-start top-0 px-2`}>
                  <AnimatedMaterialIcons name="arrow-back" size={22} animatedProps={animatedIconProps} />
              </TouchableOpacity>              
              <Animated.View style={[tailwind`flex-1 justify-center`, nameAnimatedStyles]}>
                <Text style={[tailwind`text-xl text-white`]}>{profile?.full_name}</Text>
              </Animated.View>
              <View style={tailwind`flex-row items-end top-0 right-0 px-2  rounded-lg`}>
                <TouchableOpacity onPress={handleMessage} style={tailwind`mx-2`}>
                    <AnimatedAntDesign name="message1" size={22} animatedProps={animatedIconProps} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setMoreTabVisible(true)} style={tailwind`mx-2`}>
                    <AnimatedMaterialIcons name="more-vert" size={22} animatedProps={animatedIconProps}/>
                </TouchableOpacity>
              </View>
            </Animated.View>
            <Animated.Image source={profile?.avatar_url ? {uri: profile.avatar_url} : null} style={[tailwind`w-32 h-32 rounded-full absolute z-20 self-center bg-red-200 top-10`, animImage]}/>
            <Animated.ScrollView
                onScroll={handleScroll}
                contentContainerStyle={{height:880}}
                scrollEnabled={true}
            >
                <View style={tailwind`flex-1 bg-white`}>
                  <View style={tailwind`items-center`}>
                    <View style={tailwind`mt-18`}>
                      <Text style={tailwind`text-2xl font-semibold text-black`}>{profile?.full_name}</Text>
                      <Text style={tailwind`text-gray-400 text-base`}>@{profile?.username}</Text>
                    </View>
                  </View>
                  <View style={tailwind`mt-2 items-center`}>
                    <View style={tailwind`flex-row items-center mb-4`}>
                      <Text style={tailwind`text-lg font-medium text-black`}>
                        {followerCount} Followers
                      </Text>
                      <Text style={tailwind`text-lg mx-2 text-gray-400`}>|</Text>
                      <Text style={tailwind`text-lg font-medium text-black`}>
                        {followingCount} Following
                      </Text>
                    </View>
                  </View>

                  {/* Follow/Edit Profile Button */}
                  <View style={tailwind`px-4`}>
                    <View style={tailwind`flex-row items-center justify-center`}>
                      {profilePublicID !== authProfilePublicID ? (
                        <>
                          {/* Follow Button */}
                          <Pressable 
                            style={[
                              tailwind`flex-1 py-3 rounded-2xl items-center shadow-sm mr-3`,
                              isFollowing?.is_following 
                                ? tailwind`bg-white border border-red-500` 
                                : tailwind`bg-red-500`
                            ]}
                            onPress={handleFollowButton}
                            disabled={loading}
                          >
                            <Text style={[
                              tailwind`text-lg font-semibold`,
                              isFollowing?.is_following ? tailwind`text-red-500` : tailwind`text-white`
                            ]}>
                              {loading ? 'Loading...' : isFollowingConditionCheck()}
                            </Text>
                          </Pressable>

                          {/* Player Button */}
                          <Pressable 
                            style={tailwind`flex-1 py-3 rounded-2xl items-center shadow-sm bg-gray-100`}
                            onPress={() => navigation.navigate("PlayerProfile", {publicID: profile?.public_id, from: "profile"})}
                          >
                            <Text style={tailwind`text-lg font-semibold text-gray-700`}>Player</Text>
                          </Pressable>
                        </>
                      ) : (
                        /* Only Player button (full width if own profile) */
                        <Pressable 
                          style={tailwind`flex-1 py-3 rounded-2xl items-center shadow-sm bg-gray-100`}
                          onPress={() => navigation.navigate("PlayerProfile", {publicID: authProfilePublicID, from: "profile"})}
                        >
                          <Text style={tailwind`text-lg font-semibold text-gray-700`}>Player</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>

                  <View style={tailwind`flex-1 mt-6 bg-white rounded-t-2xl shadow-lg`}>
                    <TopTabProfile profile={profile} />
                  </View>
                </View>
            </Animated.ScrollView>
            
            {moreTabVisible && (
              <Modal
                transparent
                visible={moreTabVisible}
                animationType="fade"
                onRequestClose={() => setMoreTabVisible(false)}
              >
                <Pressable
                  style={tailwind`flex-1 bg-black bg-opacity-30`}
                  onPress={() => setMoreTabVisible(false)}
                />
                <View
                  style={tailwind`absolute right-2 top-12 w-48 bg-white rounded-md shadow-lg p-4`}
                >
                  <TouchableOpacity
                    style={tailwind`py-2 border-b border-gray-200`}
                    onPress={() => {
                      setMoreTabVisible(false);
                      handleEditProfile();
                    }}
                  >
                    <Text style={tailwind`text-black text-lg`}>Edit Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={tailwind`py-2 border-b border-gray-200`}
                    onPress={() => {
                      setMoreTabVisible(false);
                      handleFollowButton();
                    }}
                  >
                    <Text style={tailwind`text-black text-lg`}>
                      {isFollowing?.is_following ? 'Unfollow' : 'Follow'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={tailwind`py-2`}
                    onPress={() => {
                      setMoreTabVisible(false);
                      // Add share functionality here
                    }}
                  >
                    <Text style={tailwind`text-black text-lg`}>Share Profile</Text>
                  </TouchableOpacity>
                </View>
            </Modal>
            )}
            
            {/* Rest of your modals remain the same */}
            {isModalOrganizerVerified && (
              <Modal
                transparent
                visible={isModalOrganizerVerified}
                animationType="slide"
                onRequestClose={() => setIsModalOrganizerVerified(false)}
              >
                <View style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                  <View style={tailwind`w-full bg-white rounded-t-3xl p-6 shadow-2xl`}>
                    
                    {/* Header */}
                    <View style={tailwind`flex-row justify-between items-center mb-4`}>
                      <Text style={tailwind`text-xl font-bold text-black`}>Organizer Verification</Text>
                      <Pressable onPress={() => setIsModalOrganizerVerified(false)}>
                        <MaterialIcons name="close" size={24} color="black" />
                      </Pressable>
                    </View>

                    {/* Input Fields */}
                    <KeyboardAvoidingView style={tailwind` gap-4`}>
                      <TextInput
                        style={tailwind`p-4 rounded-lg border border-gray-400  text-lg text-black`}
                        value={organizationName}
                        onChangeText={setOrganizationName}
                        placeholder="Organization Name"
                        placeholderTextColor="gray"
                      />
                      <View style={tailwind`flex-row items-center space-x-3`}>
                        <Pressable
                          onPress={() => setIsCountryPicker(true)}
                          style={tailwind`flex-row items-center px-4 py-3 rounded-lg bg-white border border-gray-400 shadow-md`}
                        >
                          {country?.flag ? (
                            <Image
                              source={{ uri: `https://flagcdn.com/w40/${country.cca2.toLowerCase()}.png` }}
                              style={{ width: 28, height: 20, marginRight: 8 }}
                              resizeMode="contain"
                            />
                          ): (
                            <Image
                              source={{ uri: `https://flagcdn.com/w40/in.png` }}
                              style={{ width: 28, height: 20, marginRight: 8 }}
                              resizeMode="contain"
                            />
                          )}
                          <Text style={tailwind`text-base text-gray-800 font-medium`}>
                            {country ? `+${country.callingCode}` : '+91'}
                          </Text>
                          <FontAwesome name="chevron-down" size={16} color="gray" style={tailwind`ml-2`} />
                        </Pressable>

                        <TextInput
                          style={tailwind`flex-1 px-4 py-3 rounded-lg bg-white border border-gray-400 text-base text-gray-900 shadow-md`}
                          value={phoneNumber}
                          onChangeText={setPhoneNumber}
                          placeholder="Phone Number"
                          placeholderTextColor="gray"
                          keyboardType='phone-pad'
                        />
                      </View>
                      <TextInput
                        style={tailwind`p-4 rounded-lg border border-gray-400 text-lg text-black`}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Email"
                        placeholderTextColor="gray"
                        keyboardType='email-address'
                      />
                    </KeyboardAvoidingView>

                    {/* Upload Button */}
                    <View style={tailwind`mt-6 bg-gray-100`}>
                        <View style={tailwind`p-2`}>
                          <Text style={tailwind`text-lg`}>Required Document</Text>
                        </View>
                        <View style={tailwind`p-10 items-center justify-between`}>
                        <MaterialIcons name="upload-file" size={46} color='black' />
                        <Pressable
                          onPress={handleUploadDocument}
                          style={tailwind`items-center justify-center p-4  bg-red-400 rounded-xl border-white`}
                        >
                          <Text style={tailwind`text-white text-base font-semibold`}>
                            {documentUploaded ? "Document Uploaded" : "Upload Document"}
                          </Text>
                        </Pressable>
                      </View>
                    </View>

                    {/* Submit Button */}
                    <View style={tailwind`mt-6 mb-2`}>
                      <Pressable
                        onPress={handleVerificationDetails}
                        style={tailwind`bg-red-400 rounded-xl p-4 items-center shadow-lg`}
                      >
                        <Text style={tailwind`text-white font-semibold text-base`}>Submit for Verification</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </Modal>
            )}
            {isCountryPicker && (
                <CountryPicker
                    withFilter
                    withFlag
                    withCountryNameButton
                    withAlphaFilter
                    withCallingCode
                    withEmoji
                    countryCode={country?.cca2}
                    onSelect={(selectedCountry) => {
                      console.log("Selected Country: ", selectedCountry); // Debugging
                      if (selectedCountry) {
                          setCountry(selectedCountry);
                      } else {
                          console.error("No country selected");
                      }
                      setIsCountryPicker(false);
                    }}
                    visible={isCountryPicker}
                    onClose={() => setIsCountryPicker(false)}
                />
            )}
        </View>
    );
}

export default Profile;