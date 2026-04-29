import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Platform, Dimensions, ScrollView, TextInput, Modal, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { TopTabFootball } from '../navigation/TopTabFootball';
import TopTabCricket from '../navigation/TopTabCricket';
import TopTabBadminton from '../navigation/TopTabBadminton';
import Animated, { Extrapolation, interpolate, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './axios_config';
import { BASE_URL } from '../constants/ApiConstants';
import { useDispatch, useSelector } from 'react-redux';
import { setTournamentStatus } from '../redux/actions/actions';
import { logSilentError } from '../utils/errorHandler';
const filePath = require('../assets/status_code.json');

const TournamentPage = ({ route }) => {
      const { tournament, currentRole } = route.params;
      const dispatch = useDispatch();
      const [showRoleModal, setShowRoleModal] = useState(false);
      const [loading, setLoading] = useState(false);
      const [menuVisible, setMenuVisible] = useState(false);
      const [statusCode, setStatusCode] = useState();
      const [statusVisible, setStatusVisible] = useState(false);
      const [searchQuery, setSearchQuery] = useState('');
      const [allStatus, setAllStatus] = useState([]);
      const [permissions, setPermissions] = useState(null);
      const [error, setError] = useState({
        global: null,
        fields: {}
      });
      const game = useSelector(state => state.sportReducers.game);
      const authProfile = useSelector(state => state.profile.authProfile)
      const navigation = useNavigation();
      const { height: sHeight, width: sWidth } = Dimensions.get('screen');

      const parentScrollY = useSharedValue(0);
      const bgColor = '#0f172a';   // dark navy
      const bgColor2 = '#1e293b'; //red-400
      const headerHeight = 160;
      const collapsedHeader = 50;
      const offsetValue = headerHeight-collapsedHeader;
      const headerStyle = useAnimatedStyle(() => {
        const height = interpolate(
          parentScrollY.value,
          [0, offsetValue],
          [headerHeight, collapsedHeader],
          Extrapolation.CLAMP,
        )
        return { height }
      })

      // Content container animation
      const contentContainerStyle = useAnimatedStyle(() => {
        const top = interpolate(
          parentScrollY.value,
          [0, offsetValue],
          [headerHeight, collapsedHeader],
          Extrapolation.CLAMP,
        );
      
        return {
          flex: 1,
          marginTop: top,
        };
      });

      // Trophy icon — fades out and shrinks as header collapses
      const trophyStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
          parentScrollY.value,
          [0, offsetValue * 0.6],
          [1, 0],
          Extrapolation.CLAMP,
        );
        const scale = interpolate(
          parentScrollY.value,
          [0, offsetValue * 0.6],
          [1, 0.3],
          Extrapolation.CLAMP,
        );
        return { opacity, transform: [{ scale }] };
      });

      // Title — left-anchored, font shrinks on collapse
      const titleStyle = useAnimatedStyle(() => {
        const fontSize = interpolate(
          parentScrollY.value,
          [0, offsetValue],
          [18, 18],
          Extrapolation.CLAMP,
        );
        return { fontSize };
      });

      const checkSport = (game) => {
        switch (game.name) {
            case "badminton":
                return <TopTabBadminton tournament={tournament} permissions={permissions} parentScrollY={parentScrollY} headerHeight={headerHeight} collapsedHeader={collapsedHeader} />;
            case "cricket":
                return <TopTabCricket tournament={tournament} permissions={permissions} currentRole={currentRole} parentScrollY={parentScrollY} headerHeight={headerHeight} collapsedHeader={collapsedHeader}/>;
            case "hockey":
                return <TopTabHockey />;
            case "tennis":
                return <TopTabBTennis />;
            default:
                return <TopTabFootball tournament={tournament} permissions={permissions} currentRole={currentRole} parentScrollY={parentScrollY} headerHeight={headerHeight} collapsedHeader={collapsedHeader}/>;
        }
      }
    
    // Check for user permission
    useEffect(() => {
      const checkPermission = async () => {
        setLoading(true);
        try {
          const checkPer = await axiosInstance.get(
            `${BASE_URL}/check-user-permission`,
            {
              params: {
                resource_type: "tournament",
                resource_public_id: tournament.public_id,
              },
            }
          );
          const res = checkPer.data.data;
          setPermissions(res);
        } catch (err) {
          console.log("Unable to check permission:", err);
        } finally {
          setLoading(false);
        }
      };
      checkPermission();
    }, []);

    const handleNavigation = () => {
        if (tournament?.profile?.public_id === authProfile?.public_id) {
          navigation.navigate("MessagePage")
        } else {
          navigation.navigate("Message", {recrecipientProfile: tournament.profile})
        }
    }

    const handleSearch = (text) => setSearchQuery(text);

    useEffect(() => {
        const statusArray = filePath.status_codes;
        const combined = statusArray.reduce((acc, curr) => ({...acc, ...curr}), ({}))
        setAllStatus(combined)
    }, [])

    const filteredStatusCodes = allStatus?.cricket?.filter((item) => {
      const query = searchQuery.toLowerCase();

      return (
        (item?.type || '').toLowerCase().includes(query) ||
        (item?.description || '').toLowerCase().includes(query)
      );
    });

    const handleTournamentStatus = async (item) => {
      setLoading(true);
      try {
          const data = {
            tournament_public_id: tournament.public_id,
            status: item.type
          }
          const authToken = await AsyncStorage.getItem("AccessToken")
          const res = await axiosInstance.put(`${BASE_URL}/${game.name}/updateTournamentStatus`, data,
          {
            headers: {
              'Authorization': `bearer ${authToken}`,
              'Content-Type': 'application/json',
            }
          })
          dispatch(setTournamentStatus(res.data.data))
          setStatusVisible(false);
      } catch (err) {
        const errorCode = err?.response?.data?.error?.code;
        const errorMessage = err?.response?.data?.error?.message;
        const backendFields = err?.response?.data?.error?.fields;
        if (backendFields && Object.keys(backendFields).length > 0) {
            setError({ global: errorMessage || "Invalid input", fields: backendFields });
        } else if (errorCode && errorCode !== "INTERNAL_ERROR") {
            setError({ global: errorMessage, fields: {} });
        } else {
            setError({ global: "Unable to update tournament status", fields: {} });
        }
        console.log("Unable to update tournament status: ", err)
      } finally {
        setLoading(true);
      }
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
          <Animated.View
            style={[
              headerStyle,
              {
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 10,
                overflow: 'hidden',
              },
            ]}
          >
            {/* LinearGradient background */}
            <LinearGradient
              colors={['#1e3a5f', '#1e293b']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />

            {/* Top bar: [Back] [Title] [Icons] — always visible */}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingTop: 8, height: collapsedHeader, zIndex: 10 }}>
              <Pressable
                onPress={() => {navigation.goBack()}}
                style={tailwind`p-1.5`}
                hitSlop={12}
              >
                <MaterialIcons name="arrow-back" size={22} color="#e2e8f0" />
              </Pressable>

              {/* Title — left-anchored, bounded by flex between back & icons */}
              <Animated.Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[
                  titleStyle,
                  { flex: 1, color: '#f1f5f9', fontWeight: 'bold', marginHorizontal: 10 },
                ]}
              >
                {tournament.name}
              </Animated.Text>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Pressable
                  onPress={() => handleNavigation()}
                  style={tailwind`p-1.5 mr-1`}
                  hitSlop={8}
                >
                  <MaterialIcons name="message" size={22} color="#e2e8f0" />
                </Pressable>
                {permissions?.can_edit && (
                  <>
                    <Pressable
                      onPress={() => navigation.navigate('RequestJoinTournament', { tournament })}
                      style={[tailwind`flex-row items-center px-3 py-1.5 rounded-xl mr-2`, { backgroundColor: '#f87171' }]}
                      hitSlop={8}
                    >
                      <MaterialIcons name="group-add" size={16} color="white" />
                      <Text style={{ color: 'white', fontSize: 12, fontWeight: '700', marginLeft: 4 }}>
                        Join
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setMenuVisible(true)}
                      style={tailwind`p-1.5`}
                      hitSlop={8}
                    >
                      <MaterialIcons name="settings" size={22} color="#e2e8f0" />
                    </Pressable>
                  </>
                )}
              </View>
            </View>

            {/* Trophy — centered below top bar, fades away on collapse */}
            <Animated.View style={[trophyStyle, { alignItems: 'center', justifyContent: 'center', flex: 1 }]}>
              <FontAwesome name="trophy" size={52} color="#f87171" />
            </Animated.View>
          </Animated.View>
          <Animated.View style={[contentContainerStyle, { backgroundColor: '#0f172a' }]}>
            {checkSport(game)}
          </Animated.View>
            {/* Status Modal */}
            {statusVisible && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={statusVisible}
                    onRequestClose={() => setStatusVisible(false)}
                >
                    <Pressable 
                        onPress={() => setStatusVisible(false)} 
                        style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}
                    >
                        <View style={[tailwind`rounded-t-lg max-h-[70%]`, {backgroundColor:'#1e293b',borderTopWidth:1,borderColor:'#334155'}]}>
                            <View style={tailwind`p-4 border-b border-gray-200`}>
                                <Text style={{color:'#f1f5f9',fontSize:16}}>
                                    Update Tournament Status
                                </Text>
                            </View>
                            {error?.global && (
                                <View style={[tailwind`mx-4 mb-4 p-3 rounded-lg`, { backgroundColor: '#f8717115', borderWidth: 1, borderColor: '#f8717130' }]}>
                                    <Text style={[tailwind`text-sm`, { color: '#fca5a5' }]}>{error.global}</Text>
                                </View>
                            )}
                            <TextInput
                                style={[tailwind`bg-gray-100 p-3 m-4 rounded-md`, {color:'#f1f5f9'}]}
                                placeholder="Search status..."
                                value={searchQuery}
                                onChangeText={handleSearch}
                                placeholderTextColor="#64748b"
                            />
                            <ScrollView style={{minHeight: 20}}>
                                {filteredStatusCodes.map((item, index) => (
                                    <Pressable
                                        key={index}
                                        onPress={() => {setStatusCode(item.type); handleTournamentStatus(item)}}
                                        style={tailwind`py-4 px-3 border-b border-gray-200 flex-row items-center`}
                                    >
                                        <MaterialIcons name="sports-football" size={22} color="#4b5563" />
                                        <Text style={[tailwind`text-lg ml-3`, {color:'#f1f5f9'}]}>{item.label}</Text>
                                    </Pressable>
                                ))}
                            </ScrollView>
                        </View>
                    </Pressable>
                </Modal>
            )}
          {menuVisible && (
                <Modal
                    transparent={true}
                    animationType="fade"
                    visible={menuVisible}
                    onRequestClose={() => setMenuVisible(false)}
                >
                    <TouchableOpacity onPress={() => setMenuVisible(false)} style={tailwind`flex-1 bg-black/30`}>
                        <View style={tailwind`flex-row justify-end`}>
                            <View style={[tailwind`mt-16 mr-4 rounded-xl overflow-hidden w-56`, { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' }]}>
                                <TouchableOpacity
                                    onPress={() => {
                                        setMenuVisible(false);
                                        setStatusVisible(true);
                                    }}
                                    style={[tailwind`px-4 py-4 flex-row items-center`, { borderBottomWidth: 1, borderBottomColor: '#334155' }]}
                                >
                                    <View style={[tailwind`w-9 h-9 rounded-lg items-center justify-center mr-3`, { backgroundColor: '#3b82f620' }]}>
                                        <MaterialIcons name="edit" size={18} color="#60a5fa" />
                                    </View>
                                    <Text style={[tailwind`text-base font-medium`, { color: '#f1f5f9' }]}>Edit Status</Text>
                                </TouchableOpacity>
                                {/* <TouchableOpacity
                                    onPress={() => {
                                        setMenuVisible(false);
                                    }}
                                    style={[tailwind`px-4 py-4 flex-row items-center`, { borderBottomWidth: 1, borderBottomColor: '#334155' }]}
                                >
                                    <View style={[tailwind`w-9 h-9 rounded-lg items-center justify-center mr-3`, { backgroundColor: '#9333ea20' }]}>
                                        <MaterialIcons name="share" size={18} color="#c084fc" />
                                    </View>
                                    <Text style={[tailwind`text-base font-medium`, { color: '#f1f5f9' }]}>Share</Text>
                                </TouchableOpacity> */}
                                {/* <TouchableOpacity
                                    onPress={() => {
                                        setMenuVisible(false);
                                        // Handle delete
                                    }}
                                    style={tailwind`px-4 py-4 flex-row items-center`}
                                >
                                    <View style={[tailwind`w-9 h-9 rounded-lg items-center justify-center mr-3`, { backgroundColor: '#ef444420' }]}>
                                        <MaterialIcons name="delete" size={18} color="#f87171" />
                                    </View>
                                    <Text style={[tailwind`text-base font-medium`, { color: '#f87171' }]}>Delete Match</Text>
                                </TouchableOpacity> */}
                                <TouchableOpacity
                                    onPress={() => navigation.navigate("ManageRole", {tournament: tournament})}
                                    style={[tailwind`px-4 py-4 flex-row items-center`, { borderBottomWidth: 1, borderBottomColor: '#334155' }]}
                                >
                                    <View style={[tailwind`w-9 h-9 rounded-lg items-center justify-center mr-3`, { backgroundColor: '#9333ea20' }]}>
                                        <AntDesign name="control" size={18} color="#c084fc" />
                                    </View>
                                    <Text style={[tailwind`text-base font-medium`, { color: '#f1f5f9' }]}>Manage Role</Text>
                                </TouchableOpacity>

                            </View>
                        </View>
                    </TouchableOpacity>
                </Modal>
            )}
        </View>
    );
}

export default TournamentPage;
