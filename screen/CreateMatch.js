import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Image
} from 'react-native';
import tailwind from 'twrnc';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import axiosInstance from './axios_config';
import { useSelector, useDispatch } from 'react-redux';
import DateTimePicker from 'react-native-modern-datepicker';
const filePath = require('../assets/knockout.json')
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/ApiConstants';
const matchFormatPath = require('../assets/match_format.json');


const matchTypes = ['Team', 'Individual', 'Double'];
const Stages = ['Group', 'Knockout', 'League'];

const CreateMatch = ({ route }) => {
    const {tournament, teams, handleCloseFixtureModal} = route.params;
    const [homeTeamPublicID, setHomeTeamPublicID] = useState(null);
    const [awayTeamPublicID, setAwayTeamPublicID] = useState(null);
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
    
    const game = useSelector(state => state.sportReducers.game);
    const navigation = useNavigation();
    const [knockoutLevel, setKnockoutLevel] = useState(null);
    const [isModalMatchFormat, setIsModalMatchFormat] = useState(false);
    const [matchFormat, setMatchFormat] = useState();
  
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
      if (team1 === null) {
        setTeam1(item.public_id);
      } else {
        setTeam2(item.public_id);
      }
      setIsModalTeamVisible(false);
    };
  
    const handleSetFixture = async () => {
      try {
        const fixture = {
          tournament_public_id: tournament.public_id,
          away_team_public_id: awayTeamPublicID,
          home_team_public_id: homeTeamPublicID,
          start_timestamp: modifyDateTime(startTime),
          end_timestamp: endTime?modifyDateTime(endTime):'',
          type: matchType.toLowerCase(),
          status_code: "not_started",
          result: result,
          stage: stage,
          knockout_level_id:  knockoutLevel,
          match_format: matchFormat
        };
        const authToken = await AsyncStorage.getItem('AccessToken');
        const response = await axiosInstance.post(`${BASE_URL}/${game.name}/createTournamentMatch`, fixture,{
          headers: {
            'Authorization': `bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });
        } catch (error) {
          console.error("Failed to create match: ", err);
        }
    };

    navigation.setOptions({
        headerTitle:'',
      headerStyle:tailwind`bg-red-400 shadow-lg`,
      headerTintColor:'white',
      headerLeft: ()=> (
        <View style={tailwind`flex-row items-center gap-30 p-2`}>
            <AntDesign name="arrowleft" onPress={()=>navigation.goBack()} size={24} color="white" />
            
            <View style={tailwind`items-center`}>
                <Text style={tailwind`text-xl text-white`}>Create Match</Text>
            </View>
        </View>
      ),
    })

    useEffect(() => {
      console.log("stage: ", stage)
    })

  return (
    <SafeAreaView style={tailwind`flex-1 bg-gray-100`}>
      <ScrollView style={tailwind` p-4`}>
        <View style={tailwind`mb-2`}>
          <Pressable onPress={() => setIsModalTeamVisible(true)} style={tailwind`flex-row p-4 bg-white rounded-lg shadow-md justify-between`}>
            <Text style={tailwind`text-black text-lg`}>{homeTeamPublicID ? teams.find((item) => item.public_id === homeTeamPublicID).name : "Select Team 1"}</Text>
            <AntDesign name="down" size={24} color="black" />
          </Pressable>
        </View>
        <View style={tailwind`mb-2`}>
            <Pressable onPress={() => setIsModalTeamVisible(true)} style={tailwind`flex-row p-4 bg-white rounded-lg shadow-md justify-between`}>
                <Text style={tailwind`text-black text-lg`}>{awayTeamPublicID ? teams.find((item) => item.public_id === awayTeamPublicID).name : "Select Team 2"}</Text>
                <AntDesign name="down" size={24} color="black" />
            </Pressable>
        </View>

        <View style={tailwind`mb-2`}>
            <Pressable onPress={() => setIsModalStartTimeVisible(true)} style={tailwind`flex-row p-4 bg-white rounded-lg shadow-md justify-between`}>
              <Text style={tailwind`text-black text-lg text-center`}>{startTime?startTime:'Start Time'}</Text>
              <AntDesign name="calendar" size={24} color="black" />
            </Pressable>
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

        {matchType === 'Team' && game.name === "cricket" && (
          <View style={tailwind`mb-2`}>
            <Pressable onPress={() => setIsModalMatchFormat(true)} style={tailwind`flex-row p-4 bg-white rounded-lg shadow-md justify-between`}>
              <Text style={tailwind`text-black text-center text-lg`}>{matchFormat?matchFormat:'Select Match Format'}</Text>
              <AntDesign name="down" size={24} color="black" />
            </Pressable>
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
        </View>

        {/* Stage is knockout select level */}
        {stage === 'Knockout'  && (
          <View style={tailwind`mb-2`}>
              <Pressable onPress={() => setIsModalKnockoutLevel(true)} style={tailwind`flex-row p-4 bg-white rounded-lg shadow-md justify-between`}>
                  <Text style={tailwind`text-black text-center text-lg`}>{knockoutLevel?knockoutLevel:'Select Knockout Level'}</Text>
                  <AntDesign name="down" size={24} color="black" />
              </Pressable>
          </View>
        )}
        <View  style={tailwind`mb-2`}>
            <Pressable onPress={handleSetFixture} style={tailwind`flex-row p-4 bg-white rounded-lg shadow-md justify-center items-center`}>
                <Text style={tailwind`text-black text-center text-lg`}>Create Match</Text>
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
                {teams.map((item, index) => (
                  <Pressable key={index} onPress={() => handleSelectTeam(item)} style={tailwind`p-4 border-b border-gray-200 flex-row items-start gap-4`}>
                    {item.media_url !== "" ? (
                      <Image source="" style={tailwind`rounded-full h-10 w-10 bg-orange-200`}/>
                    ):(
                      <View style={tailwind`rounded-full h-10 w-10 bg-gray-200 items-center justify-center`}>
                        <Text style={tailwind` text-black text-xl`}>{item.short_name}</Text>
                      </View>
                    )}
                    <View style={tailwind`py-1`}>
                        <Text style={tailwind`text-lg text-black`}>{item.name}</Text>
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