import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import tailwind from 'twrnc';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import useAxiosInterceptor from './axios_config';
import { useSelector, useDispatch } from 'react-redux';
import DateTimePicker from 'react-native-modern-datepicker';

const matchTypes = ['Team', 'Individual', 'Double'];
const Stages = ['Group', 'Knockout', 'League'];

const CreateMatch = ({ route }) => {
    const {tournament, teams} = route.params;
    const [team1, setTeam1] = useState(null);
    const [team2, setTeam2] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [statusCode, setStatusCode]  = useState('not_started');
    const [endTime, setEndTime] = useState(null);
    const [isModalTeamVisible, setIsModalTeamVisible] = useState(false);
    const [isModalDateVisible, setIsModalDateVisible] = useState(false);
    const [isModalStartTimeVisible, setIsModalStartTimeVisible] = useState(false);
    const [isModalEndTimeVisible, setIsModalEndTimeVisible] = useState(false);
    const [result, setResult] = useState(null);
    const [matchType, setMatchType] = useState('');
    const [stage, setStage] = useState('');
    const axiosInstance = useAxiosInterceptor();
    const game = useSelector(state => state.sportReducers.game);
    const navigation = useNavigation();
  
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
        setTeam1(item.id);
      } else {
        setTeam2(item.id);
      }
      setIsModalTeamVisible(false);
    };
  
    const handleSetFixture = async () => {
      try {
        const fixture = {
          tournament_id: tournament.id,
          away_team_id: team1,
          home_team_id: team2,
          start_timestamp: modifyDateTime(startTime),
          end_timestamp: endTime?modifyDateTime(endTime):'',
          type: matchType,
          status_code: "not_started",
          result: result,
          stage: stage
        };
  
        console.log("Fixture: ", fixture)
        const authToken = await AsyncStorage.getItem('AccessToken');
        const response = await axiosInstance.post(`${BASE_URL}/${game.name}/createTournamentMatch`, fixture,{
          headers: {
            'Authorization': `bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });
        console.log("Response; ", response.data)
      } catch (err) {
        console.error("Unable to set the fixture: ", err);
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

  return (
    <SafeAreaView style={tailwind`flex-1 bg-gray-100`}>
      <View style={tailwind`mt-4 p-4`}>
        <View style={tailwind`mb-2`}>
          <Pressable onPress={() => setIsModalTeamVisible(true)} style={tailwind`flex-row p-4 bg-white rounded-lg shadow-md justify-between`}>
            <Text style={tailwind`text-black text-lg`}>{team1 ? teams.find((item) => item.id === team1).name : "Select Team 1"}</Text>
            <AntDesign name="down" size={24} color="black" />
          </Pressable>
        </View>
        <View style={tailwind`mb-2`}>
            <Pressable onPress={() => setIsModalTeamVisible(true)} style={tailwind`flex-row p-4 bg-white rounded-lg shadow-md justify-between`}>
                <Text style={tailwind`text-black text-lg`}>{team2 ? teams.find((item) => item.id === team2).name : "Select Team 2"}</Text>
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
      </View>
      <View  style={tailwind`mb-2 justify-between p-4`}>
            <Pressable onPress={handleSetFixture} style={tailwind`flex-row p-4 bg-white rounded-lg shadow-md justify-center`}>
                <Text style={tailwind`text-black text-center text-lg`}>Create Match</Text>
            </Pressable>
      </View>

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
    </SafeAreaView>
  );
};

export default CreateMatch;