import { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Image,
  PermissionsAndroid,
  Platform
} from 'react-native';
import tailwind from 'twrnc';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import axiosInstance from './axios_config';
import { useSelector, useDispatch } from 'react-redux';
import DateTimePicker from 'react-native-modern-datepicker';
const filePath = require('../assets/knockout.json')
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/ApiConstants';
const matchFormatPath = require('../assets/match_format.json');
import { validateMatchForm } from '../utils/validation/matchValidation';
import { handleInlineError } from '../utils/errorHandler';
import { requestLocationPermission } from '../utils/locationService';

const matchTypes = ['Team', 'Individual', 'Double'];
const Stages = ['Group', 'Knockout', 'League'];

const CreateMatch = ({ route }) => {
    const {tournament, entities} = route.params;
    const [firstEntity, setFirstEntity] = useState(null);
    const [secondEntity, setSecondEntity] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [statusCode, setStatusCode]  = useState('not_started');
    const [endTime, setEndTime] = useState(null);
    const [isModalTeamVisible, setIsModalTeamVisible] = useState(false);
    const [isModalDateVisible, setIsModalDateVisible] = useState(false);
    const [isModalStartTimeVisible, setIsModalStartTimeVisible] = useState(false);
    const [isModalEndTimeVisible, setIsModalEndTimeVisible] = useState(false);
    const [isModalKnockoutLevel, setIsModalKnockoutLevel] = useState(false);
    const [result, setResult] = useState(null);
    const [matchType, setMatchType] = useState('');
    const [stage, setStage] = useState('');
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [error, setError] = useState({
      global: null,
      fields: {},
    })
    
    const game = useSelector(state => state.sportReducers.game);
    const navigation = useNavigation();
    const [knockoutLevel, setKnockoutLevel] = useState(null);
    const [isModalMatchFormat, setIsModalMatchFormat] = useState(false);
    const [matchFormat, setMatchFormat] = useState(null);
    const [loading, setLoading] = useState(false);
  
    const modifyDateTime = (newDateTime) => {
      if (!newDateTime) {
        console.error('new date time is undefined');
        return null;
      }
      const [datePart, timePart] = newDateTime.split(' ');
      const [year, month, day] = datePart.split('/').map(Number);
      const [hour, minute] = timePart.split(':').map(Number);
      const matchDateTime = new Date(Date.UTC(year, month - 1, day, hour, minute));
      return matchDateTime;
    };
  
    const handleSelectTeam = (item) => {
      if (firstEntity === null) {
        setFirstEntity(item);
      } else {
        setSecondEntity(item);
      }
      setIsModalTeamVisible(false);
    };
  
    const handleSetFixture = async () => {
      try {

        const formData = {
          firstEntity,
          secondEntity,
          startOn: startTime,
          matchType,
          stage,
          matchFormat,
          knockoutLevel,
          location: latitude && longitude ? { latitude, longitude } : null,
          latitude,
          longitude,
        }

        const validation = validateMatchForm(formData);
        if (!validation.isValid) {
            setError({
              global: null,
              fields: validation.errors,
            });
            console.log("Validation Errors: ", validation.errors);
            return;
        }
        setLoading(true);
        setError({
          global: null,
          fields: {},
        });

        
        const fixture = {
          tournament_public_id: tournament?.public_id,
          away_team_public_id: secondEntity?.public_id,
          home_team_public_id: firstEntity?.public_id,
          start_timestamp: modifyDateTime(startTime),
          end_timestamp: endTime?modifyDateTime(endTime):'',
          type: matchType.toLowerCase(),
          status_code: "not_started",
          result: result,
          stage: stage.toLowerCase(),
          knockout_level_id:  knockoutLevel,
          match_format: matchFormat,
          latitude: latitude ? latitude.toString() : '',
          longitude: longitude ? longitude.toString() : '',
        };
        
        const authToken = await AsyncStorage.getItem('AccessToken');
        const response = await axiosInstance.post(`${BASE_URL}/${game.name}/createTournamentMatch/${tournament.public_id}`, fixture,{
          headers: {
            'Authorization': `bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });

          console.log("Match created successfully:", response.data);
          navigation.goBack();
        } catch (err) {
          //Extract validation errors from backend response
          const backendErrors = err?.response?.data?.error?.fields || {};
          if(err?.response?.data?.error?.code === "FORBIDDEN"){
                setError({
                    global: err?.response?.data?.error?.message,
                    fields: {},
                })
          } else {
            setError({
              global: "Unable to create match",
              fields: backendErrors,
            })
          }
        } finally {
          setLoading(false);
        }
    };
    useLayoutEffect(() => {
      navigation.setOptions({
        headerTitle: "Create Match",
        headerTitleAlign: "center",
        headerStyle: {
          backgroundColor: '#1e293b',
          height: 60,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#334155',
        },
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: "700",
          color: '#f1f5f9',
        },
        headerLeft: () => (
          <Pressable
            onPress={() => navigation.goBack()}
            style={tailwind`p-3 ml-2`}
          >
            <AntDesign name="arrowleft" size={22} color="#f1f5f9" />
          </Pressable>
        ),
      });
    }, [navigation]);


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

  const today = new Date().toISOString().split("T")[0];

  return (
    <SafeAreaView style={[tailwind`flex-1`, { backgroundColor:"#020617" }]}>
      <ScrollView
        style={[tailwind`flex-1 p-4`, { backgroundColor:"#020617" }]}
        contentContainerStyle={tailwind`pb-6`}
        showsVerticalScrollIndicator={false}
      >
      {tournament.stage !== 'knockout' &&
        (!firstEntity?.group_id ||
        !secondEntity?.group_id ||
        firstEntity.group_id !== secondEntity.group_id) && (
          <View style={[tailwind`flex-row items-center rounded-lg p-3 my-2`, { backgroundColor: '#f59e0b15', borderWidth: 1, borderColor: '#f59e0b30' }]}>
            <AntDesign name="exclamationcircle" size={18} color="#fbbf24" style={tailwind`mr-2`} />
            <Text style={[tailwind`font-semibold flex-1`, { color: '#fbbf24' }]}>
              Add both teams to the groups before match creation or added ignore.
            </Text>
          </View>
      )}
        <View style={tailwind`mb-2`}>
            <Pressable onPress={() => setIsModalTeamVisible(true)} style={[tailwind`flex-row p-4 rounded-lg justify-between`, {backgroundColor:"#0f172a",borderWidth:1, borderColor:"#334155"}]}>
              <Text style={[tailwind`text-black text-md`, {color:"#94a3b8"}]}>{firstEntity ? entities.find((item) => item.entity.public_id === firstEntity.public_id).entity.name : "Select First Entity"}</Text>
              <AntDesign name="down" size={16} color="#94a3b8" />
            </Pressable>
            {(error.fields.firstEntity || error.fields.home_team_public_id) && (
              <Text style={tailwind`text-red-500 mb-2`}>*{error.fields.firstEntity || error.fields.home_team_public_id}</Text>
            )}
        </View>
        <View style={tailwind`mb-2`}>
            <Pressable onPress={() => setIsModalTeamVisible(true)} style={[tailwind`flex-row p-4 rounded-lg justify-between`, {backgroundColor:"#0f172a", borderWidth:1, borderColor:"#334155"}]}>
                <Text style={[tailwind`text-black text-md`, {color:"#94a3b8"}]}>{secondEntity ? entities.find((item) => item.entity.public_id === secondEntity.public_id).entity.name : "Select Second Entity"}</Text>
                <AntDesign name="down" size={16} color="#94a3b8" />
            </Pressable>
            {(error.fields.secondEntity || error.fields.away_team_public_id) && (
              <Text style={tailwind`text-red-500 mb-2`}>*{error.fields.secondEntity || error.fields.away_team_public_id}</Text>
            )}
        </View>
        <View style={tailwind`mb-2`}>
            <Pressable onPress={() => setIsModalStartTimeVisible(true)} 
              style={[tailwind`flex-row p-4 rounded-lg justify-between`,
                    { backgroundColor:"#0f172a", borderWidth:1, borderColor:"#334155" }
              ]}>
              <Text style={[tailwind` text-md text-center`, {color:"#94a3b8"}]}>{startTime?startTime:'Start Time'}</Text>
              <AntDesign name="calendar" size={16} color="#94a3b8" />
            </Pressable>
            {(error.fields.startOn || error.fields.start_timestamp) && (
              <Text style={tailwind`text-red-500 mb-2`}>*{error.fields.startOn || error.fields.start_timestamp}</Text>
            )}
        </View>
        {/* <View style={tailwind`mb-2`}>
            <Pressable onPress={() => setIsModalEndTimeVisible(true)} 
              style={[tailwind`flex-row p-4 rounded-lg justify-between`, { backgroundColor:"#0f172a", borderWidth:1, borderColor:"#334155" }]}>
                <Text style={[tailwind` text-center text-md`, {color:"#94a3b8"}]}>{endTime?endTime:'End Time'}</Text>
                <AntDesign name="calendar" size={16} color="#94a3b8" />
            </Pressable>
        </View> */}

        {/* Match Type Selection */}
        <View style={tailwind`mb-2`}>
          <Text style={{color: '#f1f5f9', fontWeight: '600', marginBottom: 8, fontSize: 14}}>Match Type</Text>
          <View style={[tailwind`flex-row rounded-xl p-1`, {backgroundColor: '#0f172a'}]}>
            {matchTypes.map((item, index) => (
              <Pressable key={index} onPress={() => {setMatchType(item)}} style={[tailwind`flex-1 items-center py-3 rounded-lg mx-1 shadow-md `, matchType===item && tailwind`bg-red-400`]}>
                <Text style={[tailwind`text-sm`, matchType===item?tailwind`text-white font-semibold`:{color: '#94a3b8'}]}>{item}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        {(error.fields.matchType || error.fields.type) && (
          <Text style={tailwind`text-red-500 mb-2`}>*{error.fields.matchType || error.fields.type}</Text>
        )}
        {matchType === 'Team' && game.name === "cricket" && (
          <View style={tailwind`mb-2`}>
            <Pressable onPress={() => setIsModalMatchFormat(true)} style={[tailwind`flex-row p-4 rounded-lg justify-between`, { backgroundColor:"#0f172a", borderWidth:1, borderColor:"#334155" }]}>
              <Text style={[tailwind` text-center text-lg`, {color:"#94a3b8"}]}>{matchFormat?matchFormat:'Select Match Format'}</Text>
              <AntDesign name="down" size={24} color="#94a3b8" />
            </Pressable>
            {(error.fields.matchFormat || error.fields.match_format) && (
              <Text style={tailwind`text-red-500 mb-2`}>*{error.fields.matchFormat || error.fields.match_format}</Text>
            )}
          </View>
        )}

        {/* Stage Selection */}
        <View style={tailwind`mb-5`}>
            <Text style={{color: '#f1f5f9', fontWeight: '600', marginBottom: 8, fontSize: 14}}>Stage</Text>
            <View style={[tailwind`flex-row rounded-xl p-1`, {backgroundColor: '#0f172a'}]}>
                {Stages.map((item, index) => (
                <Pressable key={index} onPress={() => {setStage(item)}} style={[tailwind`flex-1 items-center py-2.5 rounded-lg`, stage===item && tailwind`bg-red-400`]}>
                    <Text style={[tailwind`text-sm`, stage===item?tailwind`text-white font-semibold`:{color: '#94a3b8'}]}>{item}</Text>
                </Pressable>
                ))}
            </View>
            {error?.fields.stage && (
                <Text style={tailwind`text-red-400 text-xs mt-1.5`}>
                    {error.fields.stage}
                </Text>
            )}
        </View>

        {/* Stage is knockout select level */}
        {stage === 'Knockout'  && (
          <>
            <View style={tailwind`mb-2`}>
                <Pressable onPress={() => setIsModalKnockoutLevel(true)} style={[tailwind`flex-row p-4 rounded-lg shadow-md justify-between`, {backgroundColor: "#0f172a"}]}>
                    <Text style={[tailwind`text-center text-md`, {color: "#f1f5f9"}]}>
                      {knockoutLevel
                        ? filePath["knockout"].find(item => item.id === knockoutLevel)?.round_name.toUpperCase() || knockoutLevel
                        : 'Select Knockout Level'
                      }
                    </Text>
                    <AntDesign name="down" size={12} color="#f1f5f9" />
                </Pressable>
            </View>
            {(error.fields.knockoutLevel || error.fields.knockout_level_id) && (
              <Text style={tailwind`text-red-500 mb-2`}>*{error.fields.knockoutLevel || error.fields.knockout_level_id}</Text>
            )}
          </>
        )}

        {/* GPS Location Card */}
        <View style={[tailwind`bg-white p-4 rounded-lg shadow-md mb-4`, {backgroundColor:"#0f172a",borderWidth:1,borderColor:"#334155"}]}>
          <Text style={{color: '#f1f5f9', fontWeight: '600', marginBottom: 8, fontSize: 14}}>Location</Text>
            <View style={tailwind`flex-row items-center justify-between mb-2`}>
                {latitude && longitude && (
                    <MaterialIcons name="check-circle" size={20} color="#10B981" />
                )}
            </View>
            <Text style={[tailwind`text-xs text-gray-500 mb-3`, {color: "#94a3b8"}]}>
                *Add match location
            </Text>

            <Pressable
                onPress={handleLocation}
                disabled={isLoadingLocation}
                style={[
                    tailwind`p-3 rounded-lg flex-row items-center justify-between`,
                    { backgroundColor: '#020617', borderWidth: 1, borderColor: '#334155' }
                ]}
            >
                <View style={tailwind`flex-row items-center flex-1`}>
                    <MaterialIcons
                        name="my-location"
                        size={20}
                        color={latitude && longitude ? "#4ade80" : "#f87171"}
                    />
                    <Text style={[tailwind`ml-2 flex-1 text-sm font-medium`, { color: latitude && longitude ? '#4ade80' : '#f87171' }]}>
                        {isLoadingLocation
                            ? 'Getting location...'
                            : latitude && longitude
                                ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
                                : 'Tap to get location'}
                    </Text>
                </View>
                <MaterialIcons name="chevron-right" size={18} color="#475569" />
            </Pressable>
        </View>
        {error.fields.location && (
          <Text style={tailwind`text-red-500 mb-2`}>{error.fields.location}</Text>
        )}

        {/* Create Match Button */}
        <View style={tailwind`mb-4`}>
            <Pressable
              onPress={handleSetFixture}
              style={{ backgroundColor:"#f87171", paddingVertical:16, borderRadius:12 }}
            >
                <Text style={tailwind`text-white text-center text-lg font-bold`}>
                  Create Match
                </Text>
            </Pressable>
        </View>

      </ScrollView>

      {isModalMatchFormat && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={isModalMatchFormat}
          onRequestClose={() => setIsModalMatchFormat(false)}
        >
          <Pressable
            onPress={() => setIsModalMatchFormat(false)}
            style={tailwind`flex-1 justify-end bg-black/60`}
          >
            <View
              style={[
                tailwind`rounded-t-2xl p-4`,
                { backgroundColor: "#0f172a", borderTopWidth: 1, borderColor: "#334155" }
              ]}
            >
              <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                
                {/* Title */}
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "700",
                    color: "#f1f5f9",
                    marginBottom: 10
                  }}
                >
                  Select Format
                </Text>

                {matchFormatPath["match_format"].map((item, index) => (
                  <Pressable
                    key={index}
                    onPress={() => {
                      setMatchFormat(item.format_type);
                      setIsModalMatchFormat(false);
                    }}
                    style={[
                      tailwind`p-4 flex-row items-center`,
                      { borderBottomWidth: 1, borderColor: "#334155" }
                    ]}
                  >
                    {/* Format ID Circle */}
                    <View
                      style={{
                        height: 40,
                        width: 40,
                        borderRadius: 20,
                        backgroundColor: "#1e293b",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12
                      }}
                    >
                      <Text
                        style={{
                          color: "#f87171",
                          fontSize: 18,
                          fontWeight: "700"
                        }}
                      >
                        {item.id}
                      </Text>
                    </View>

                    {/* Format Name */}
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: "#f1f5f9"
                      }}
                    >
                      {item.format_type.toUpperCase()}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>
      )}

      {isModalStartTimeVisible && (
        <Modal
          transparent
          animationType="slide"
          visible={isModalStartTimeVisible}
          onRequestClose={() => setIsModalStartTimeVisible(false)}
        >
          <View style={tailwind`flex-1 justify-end bg-black/60`}>
            <Pressable
              style={tailwind`flex-1`}
              onPress={() => setIsModalStartTimeVisible(false)}
            />
            <View
              style={[
                tailwind`p-4 rounded-t-3xl`,
                { backgroundColor: "#0f172a", borderTopWidth: 1, borderColor: "#334155" }
              ]}
            >

              {/* Drag indicator */}
              <View
                style={{
                  width: 40,
                  height: 4,
                  backgroundColor: "#475569",
                  borderRadius: 2,
                  alignSelf: "center",
                  marginBottom: 10
                }}
              />

              {/* Header */}
              <View style={tailwind`flex-row items-center justify-between mb-3`}>
                <Text style={{ color: "#f1f5f9", fontSize: 18, fontWeight: "700" }}>
                  Select Date & Time
                </Text>

                <Pressable onPress={() => setIsModalStartTimeVisible(false)}>
                  <MaterialIcons name="close" size={22} color="#94a3b8" />
                </Pressable>
              </View>

              {/* Calendar */}
              <DateTimePicker
                minimumDate={today}
                onSelectedChange={(date) => {
                  setStartTime(date);
                  setIsModalStartTimeVisible(false);
                }}
                options={{
                  backgroundColor: "#0f172a",
                  textHeaderColor: "#f87171",
                  textDefaultColor: "#f1f5f9",
                  selectedTextColor: "#fff",
                  mainColor: "#f87171",
                  textSecondaryColor: "#94a3b8",
                  borderColor: "#334155",
                }}
              />

            </View>
          </View>
        </Modal>
      )}
      {isModalTeamVisible && (
        <Modal
          transparent
          animationType="slide"
          visible={isModalTeamVisible}
          onRequestClose={() => setIsModalTeamVisible(false)}
        >
          <Pressable
            onPress={() => setIsModalTeamVisible(false)}
            style={tailwind`flex-1 justify-end bg-black/60`}
          >
            <Pressable
              style={[
                tailwind`p-4 rounded-t-3xl`,
                { backgroundColor: "#0f172a", borderTopWidth: 1, borderColor: "#334155" }
              ]}
            >

              {/* Drag Indicator */}
              <View
                style={{
                  width: 40,
                  height: 4,
                  backgroundColor: "#334155",
                  borderRadius: 2,
                  alignSelf: "center",
                  marginBottom: 10
                }}
              />

              {/* Header */}
              <View style={tailwind`flex-row items-center justify-between mb-3`}>
                <Text style={{ color: "#f1f5f9", fontSize: 18, fontWeight: "700" }}>
                  Select Team
                </Text>

                <Pressable onPress={() => setIsModalTeamVisible(false)}>
                  <MaterialIcons name="close" size={22} color="#94a3b8" />
                </Pressable>
              </View>

              {/* Team List */}
              <ScrollView
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
              >
                {entities.map((item, index) => (
                  <Pressable
                    key={index}
                    onPress={() => handleSelectTeam(item.entity)}
                    style={[
                      tailwind`p-3 flex-row items-center mb-2 rounded-xl`,
                      { backgroundColor: "#1e293b" }
                    ]}
                  >

                    {/* Team Logo */}
                    {item.entity.media_url ? (
                      <Image
                        source={{ uri: item.entity.media_url }}
                        style={{
                          height: 40,
                          width: 40,
                          borderRadius: 20,
                          marginRight: 12
                        }}
                      />
                    ) : (
                      <View
                        style={{
                          height: 40,
                          width: 40,
                          borderRadius: 20,
                          backgroundColor: "#334155",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12
                        }}
                      >
                        <Text
                          style={{
                            color: "#f87171",
                            fontSize: 16,
                            fontWeight: "700"
                          }}
                        >
                          {item.entity.short_name}
                        </Text>
                      </View>
                    )}

                    {/* Team Name */}
                    <Text
                      style={{
                        color: "#f1f5f9",
                        fontSize: 16,
                        fontWeight: "600",
                        flex: 1
                      }}
                    >
                      {item.entity.name}
                    </Text>

                    <MaterialIcons
                      name="chevron-right"
                      size={20}
                      color="#94a3b8"
                    />
                  </Pressable>
                ))}
              </ScrollView>

            </Pressable>
          </Pressable>
        </Modal>
      )}
      {isModalKnockoutLevel && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={isModalKnockoutLevel}
        >
          <Pressable
            onPress={() => setIsModalKnockoutLevel(false)}
            style={tailwind`flex-1 justify-end bg-black/60`}
          >
            <View
              style={[
                tailwind`rounded-t-2xl p-4`,
                { backgroundColor: "#0f172a", borderTopWidth: 1, borderColor: "#334155" }
              ]}
            >
              <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                
                {/* Title */}
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "700",
                    color: "#f1f5f9",
                    marginBottom: 10
                  }}
                >
                  Select Knockout Level
                </Text>

                {filePath["knockout"].map((item, index) => (
                  <Pressable
                    key={index}
                    onPress={() => {
                      setKnockoutLevel(item.id);
                      setIsModalKnockoutLevel(false);
                    }}
                    style={[
                      tailwind`p-4 flex-row items-center`,
                      { borderBottomWidth: 1, borderColor: "#334155" }
                    ]}
                  >
                    {/* Level Number */}
                    <View
                      style={{
                        height: 40,
                        width: 40,
                        borderRadius: 20,
                        backgroundColor: "#1e293b",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12
                      }}
                    >
                      <Text
                        style={{
                          color: "#f87171",
                          fontSize: 18,
                          fontWeight: "700"
                        }}
                      >
                        {item.id}
                      </Text>
                    </View>

                    {/* Round Name */}
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: "#f1f5f9"
                      }}
                    >
                      {item.round_name.toUpperCase()}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>
      )}
    </SafeAreaView>
  );
};

export default CreateMatch;