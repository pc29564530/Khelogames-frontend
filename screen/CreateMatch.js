import { useState, useEffect } from 'react';
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
          setError({
            global: "Unable to create match",
            fields: backendErrors,
          })
        } finally {
          setLoading(false);
        }
    };

    navigation.setOptions({
      headerTitle: "Create Match",
      headerTitleAlign: "center",
      headerStyle: {
        backgroundColor: tailwind.color('red-400'),
        height: 60,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 5,
      },
      headerTitleStyle: {
        fontSize: 20,
        fontWeight: "700",
        color: tailwind.color('bg-white'), // dark gray
      },
      headerLeft: () => (
        <Pressable
          onPress={() => navigation.goBack()}
          style={tailwind`p-3 ml-2`}
        >
          <AntDesign name="arrowleft" size={22} color={tailwind.color('bg-white')} />
        </Pressable>
      ),
    });
    
    

    useEffect(() => {
      console.log("stage: ", stage)
    })


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

  return (
    <SafeAreaView style={tailwind`flex-1 bg-gray-100`}>
      <ScrollView
        style={tailwind`flex-1 p-4`}
        contentContainerStyle={tailwind`pb-6`}
        showsVerticalScrollIndicator={false}
      >
      {tournament.stage !== 'knockout' &&
        (!firstEntity?.group_id ||
        !secondEntity?.group_id ||
        firstEntity.group_id !== secondEntity.group_id) && (
          <View style={tailwind`flex-row items-center bg-yellow-100 border border-yellow-400 rounded-lg p-3 my-2`}>
            <AntDesign name="exclamationcircle" size={18} color="orange" style={tailwind`mr-2`} />
            <Text style={tailwind`text-yellow-800 font-semibold`}>
              Add both teams to the groups before match creation or added ignore.
            </Text>
          </View>
      )}
        <View style={tailwind`mb-2`}>
            <Pressable onPress={() => setIsModalTeamVisible(true)} style={tailwind`flex-row p-4 bg-white rounded-lg shadow-md justify-between`}>
              <Text style={tailwind`text-black text-lg`}>{firstEntity ? entities.find((item) => item.entity.public_id === firstEntity.public_id).entity.name : "Select First Entity"}</Text>
              <AntDesign name="down" size={24} color="black" />
            </Pressable>
            {(error.fields.firstEntity || error.fields.home_team_public_id) && (
              <Text style={tailwind`text-red-500 mb-2`}>*{error.fields.firstEntity || error.fields.home_team_public_id}</Text>
            )}
        </View>
        <View style={tailwind`mb-2`}>
            <Pressable onPress={() => setIsModalTeamVisible(true)} style={tailwind`flex-row p-4 bg-white rounded-lg shadow-md justify-between`}>
                <Text style={tailwind`text-black text-lg`}>{secondEntity ? entities.find((item) => item.entity.public_id === secondEntity.public_id).entity.name : "Select Second Entity"}</Text>
                <AntDesign name="down" size={24} color="black" />
            </Pressable>
            {(error.fields.secondEntity || error.fields.away_team_public_id) && (
              <Text style={tailwind`text-red-500 mb-2`}>*{error.fields.secondEntity || error.fields.away_team_public_id}</Text>
            )}
        </View>
        <View style={tailwind`mb-2`}>
            <Pressable onPress={() => setIsModalStartTimeVisible(true)} style={tailwind`flex-row p-4 bg-white rounded-lg shadow-md justify-between`}>
              <Text style={tailwind`text-black text-lg text-center`}>{startTime?startTime:'Start Time'}</Text>
              <AntDesign name="calendar" size={24} color="black" />
            </Pressable>
            {(error.fields.startOn || error.fields.start_timestamp) && (
              <Text style={tailwind`text-red-500 mb-2`}>*{error.fields.startOn || error.fields.start_timestamp}</Text>
            )}
        </View>
        <View style={tailwind`mb-2`}>
            <Pressable onPress={() => setIsModalEndTimeVisible(true)} style={tailwind`flex-row p-4 bg-white rounded-lg shadow-md justify-between`}>
                <Text style={tailwind`text-black text-center text-lg`}>{endTime?endTime:'End Time'}</Text>
                <AntDesign name="calendar" size={24} color="black" />
            </Pressable>
        </View>

        {/* Match Type Selection */}
        <View style={tailwind`mb-2`}>
          <Text style={tailwind`text-lg text-gray-700 mb-2`}>Match Type</Text>
          <View style={tailwind`flex-row justify-between`}>
            {matchTypes.map((item, index) => (
              <Pressable key={index} onPress={() => {setMatchType(item)}} style={[tailwind`flex-1 items-center py-3 rounded-lg mx-1 shadow-md bg-white `, matchType===item?tailwind`bg-red-400`:tailwind`bg-white`]}>
                <Text style={tailwind`text-black text-center`}>{item}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        {(error.fields.matchType || error.fields.type) && (
          <Text style={tailwind`text-red-500 mb-2`}>*{error.fields.matchType || error.fields.type}</Text>
        )}
        {matchType === 'Team' && game.name === "cricket" && (
          <View style={tailwind`mb-2`}>
            <Pressable onPress={() => setIsModalMatchFormat(true)} style={tailwind`flex-row p-4 bg-white rounded-lg shadow-md justify-between`}>
              <Text style={tailwind`text-black text-center text-lg`}>{matchFormat?matchFormat:'Select Match Format'}</Text>
              <AntDesign name="down" size={24} color="black" />
            </Pressable>
            {(error.fields.matchFormat || error.fields.match_format) && (
              <Text style={tailwind`text-red-500 mb-2`}>*{error.fields.matchFormat || error.fields.match_format}</Text>
            )}
          </View>
        )}

        {/* Stage Selection */}
        <View style={tailwind`mb-2`}>
          <Text style={tailwind`text-lg text-gray-700 mb-2`}>Stage</Text>
          <View style={tailwind`flex-row justify-between`}>
            {Stages.map((item, index) => (
              <Pressable key={index} onPress={() => {setStage(item)}} style={[tailwind`flex-1 items-center py-3 rounded-lg mx-1 shadow-md bg-white`, stage===item?tailwind`bg-red-400`:tailwind`bg-white`]}>
                <Text style={tailwind`text-black text-center`}>{item}</Text>
              </Pressable>
            ))}
          </View>
          {error.fields.stage && (
              <Text style={tailwind`text-red-500 mb-2`}>*{error.fields.stage}</Text>
          )}
        </View>

        {/* Stage is knockout select level */}
        {stage === 'Knockout'  && (
          <>
            <View style={tailwind`mb-2`}>
                <Pressable onPress={() => setIsModalKnockoutLevel(true)} style={tailwind`flex-row p-4 bg-white rounded-lg shadow-md justify-between`}>
                    <Text style={tailwind`text-black text-center text-lg`}>
                      {knockoutLevel
                        ? filePath["knockout"].find(item => item.id === knockoutLevel)?.round_name.toUpperCase() || knockoutLevel
                        : 'Select Knockout Level'
                      }
                    </Text>
                    <AntDesign name="down" size={24} color="black" />
                </Pressable>
            </View>
            {(error.fields.knockoutLevel || error.fields.knockout_level_id) && (
              <Text style={tailwind`text-red-500 mb-2`}>*{error.fields.knockoutLevel || error.fields.knockout_level_id}</Text>
            )}
          </>
        )}

        {/* GPS Location Card */}
        <View style={tailwind`bg-white p-4 rounded-lg shadow-md mb-4`}>
            <View style={tailwind`flex-row items-center justify-between mb-2`}>
                <Text style={tailwind`text-lg font-semibold text-gray-800`}>GPS Coordinates</Text>
                {latitude && longitude && (
                    <MaterialIcons name="check-circle" size={20} color="#10B981" />
                )}
            </View>
            <Text style={tailwind`text-xs text-gray-500 mb-3`}>
                Optional - Add match location
            </Text>

            <Pressable
                onPress={handleLocation}
                disabled={isLoadingLocation}
                style={[
                    tailwind`p-3 rounded-lg flex-row items-center justify-between`,
                    isLoadingLocation ? tailwind`bg-gray-100` : tailwind`bg-red-50`,
                ]}
            >
                <View style={tailwind`flex-row items-center flex-1`}>
                    <MaterialIcons
                        name="my-location"
                        size={20}
                        color={latitude && longitude ? "#10B981" : "#EF4444"}
                    />
                    <Text style={[tailwind`ml-2 flex-1 text-sm`, latitude && longitude ? tailwind`text-green-600 font-semibold` : tailwind`text-red-500 font-medium`]}>
                        {isLoadingLocation
                            ? 'Getting location...'
                            : latitude && longitude
                                ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
                                : 'Tap to get location'}
                    </Text>
                </View>
                <MaterialIcons name="chevron-right" size={18} color="#9CA3AF" />
            </Pressable>
        </View>
        {error.fields.location && (
          <Text style={tailwind`text-red-500 mb-2`}>{error.fields.location}</Text>
        )}

        {/* Create Match Button */}
        <View style={tailwind`mb-4`}>
            <Pressable
              onPress={handleSetFixture}
              style={tailwind`bg-red-400 py-4 rounded-xl shadow-lg`}
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
          <Pressable onPress={() => setIsModalMatchFormat(false)} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
            <View style={tailwind`bg-white rounded-md p-4`}>
              <ScrollView nestedScrollEnabled={true}>
                <Text style={tailwind`text-2xl`}>Select Format</Text>
                {matchFormatPath["match_format"].map((item, index) => (
                  <Pressable key={index} onPress={() => { setMatchFormat(item.format_type); setIsModalMatchFormat(false)}} style={tailwind`p-4 border-b border-gray-200 flex-row items-start gap-4`}>
                      <View style={tailwind`rounded-full h-10 w-10 bg-gray-200 items-center justify-center`}>
                        <Text style={tailwind` text-black text-xl`}>{item.id}</Text>
                      </View>
                      <View style={tailwind`py-1`}>                                                  
                          <Text style={tailwind`text-lg text-black`}>{item.format_type.toUpperCase()}</Text>
                      </View>
                  </Pressable> 
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>
      )}


      {isModalEndTimeVisible && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={isModalEndTimeVisible}
        >
          <View style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
            <View style={tailwind`bg-white rounded-md p-4`}>
              <DateTimePicker
                onSelectedChange={(endTime) => {
                  setEndTime(endTime);
                  setIsModalEndTimeVisible(false);
                }}
              />
            </View>
          </View>
        </Modal>
      )}
      {isModalStartTimeVisible && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={isModalStartTimeVisible}
        >
          <View style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
            <View style={tailwind`bg-white rounded-md p-4`}>
              <DateTimePicker
                onSelectedChange={(startTime) => {
                  setStartTime(startTime);
                  setIsModalStartTimeVisible(false);
                }}
              />
            </View>
          </View>
        </Modal>
      )}
      {isModalTeamVisible && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={isModalTeamVisible}
        >
          <Pressable onPress={() => setIsModalTeamVisible(false)} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
            <View style={tailwind`bg-white rounded-md p-4`}>
              <ScrollView nestedScrollEnabled={true}>
                {entities.map((item, index) => (
                  <Pressable key={index} onPress={() => handleSelectTeam(item.entity)} style={tailwind`p-4 border-b border-gray-200 flex-row items-start gap-4`}>
                    {item.entity.media_url !== "" ? (
                      <Image source="" style={tailwind`rounded-full h-10 w-10 bg-orange-200`}/>
                    ):(
                      <View style={tailwind`rounded-full h-10 w-10 bg-gray-200 items-center justify-center`}>
                        <Text style={tailwind` text-black text-xl`}>{item.entity.short_name}</Text>
                      </View>
                    )}
                    <View style={tailwind`py-1`}>
                        <Text style={tailwind`text-lg text-black`}>{item.entity.name}</Text>
                    </View>
                  </Pressable> 
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>
      )}
      {isModalKnockoutLevel && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={isModalKnockoutLevel}
        >
          <Pressable onPress={() => setIsModalKnockoutLevel(false)} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
            <View style={tailwind`bg-white rounded-md p-4`}>
              <ScrollView nestedScrollEnabled={true}>
                <Text style={tailwind`text-2xl`}>Select Knockout Level</Text>
                {filePath["knockout"].map((item, index) => (
                  <Pressable key={index} onPress={() => {setKnockoutLevel(item.id); setIsModalKnockoutLevel(false)}} style={tailwind`p-4 border-b border-gray-200 flex-row items-start gap-4`}>
                      <View style={tailwind`rounded-full h-10 w-10 bg-gray-200 items-center justify-center`}>
                        <Text style={tailwind` text-black text-xl`}>{item.id}</Text>
                      </View>
                      <View style={tailwind`py-1`}>
                          <Text style={tailwind`text-lg text-black`}>{item.round_name.toUpperCase()}</Text>
                      </View>
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