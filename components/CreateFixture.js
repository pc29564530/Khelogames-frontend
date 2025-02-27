import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from '../screen/axios_config';
import tailwind from 'twrnc';
import DateTimePicker from 'react-native-modern-datepicker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { addFootballScoreServices } from '../services/footballMatchServices';
import { addCricketScoreServices } from '../services/cricketMatchServices';
import { useDispatch, useSelector } from 'react-redux';
const matchTypes = ['Team', 'Individual', 'Double'];
const filePath = require('../assets/status_code.json');

const CreateFixture = ({ tournament, teams, organizerID, handleCloseFixtureModal }) => {
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
  const axiosInstance = useAxiosInterceptor();
  const [errorMessage, setErrorMessage] = useState("");
  const game = useSelector(state => state.sportReducers.game);

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
            end_timestamp: endTime ? modifyDateTime(endTime) : '',
            type: matchType,
            status_code: "not_started",
            result: result
        };

        const authToken = await AsyncStorage.getItem('AccessToken');
        const response = await axiosInstance.post(`${BASE_URL}/${game.name}/createTournamentMatch`, fixture, {
            headers: {
                'Authorization': `bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
        });
        setErrorMessage('');
      } catch (err) {
          console.error("Unable to set the fixture: ", err);
          if (err.response && err.response.data && err.response.data.error) {
              setErrorMessage(err.response.data.error);
          } else {
              setErrorMessage("An unexpected error occurred.");
          }
      } finally {
          handleCloseFixtureModal();
      }

  };
  return (
    <View style={tailwind`justify-center items-center bg-gray-100`}>
      <View style={tailwind`bg-white rounded-lg shadow-lg p-6 w-11/12`}>
        {/* close button */}
        <View style={tailwind`flex-row justify-between items-center mb-4`}>
          <Text style={tailwind`text-2xl font-bold text-gray-800`}>Create Fixture</Text>
          <Pressable onPress={handleCloseFixtureModal}>
            <MaterialIcons name="close" size={24} color="gray" />
          </Pressable>
        </View>
         {/* Team modal button */}
        <View style={tailwind`flex-row justify-between mb-4`}>
          <View style={tailwind`flex-1 mr-2`}>
            <Text style={tailwind`text-lg text-gray-700`}>Team 1</Text>
            <Pressable onPress={() => setIsModalTeamVisible(true)} style={tailwind`p-4 bg-yellow-500 rounded-lg`}>
              <Text style={tailwind`text-white text-center`}>{team1 ? teams.find((item) => item.id === team1).name : "Select Team"}</Text>
            </Pressable>
          </View>
          <View style={tailwind`flex-1 ml-2`}>
            <Text style={tailwind`text-lg text-gray-700`}>Team 2</Text>
            <Pressable onPress={() => setIsModalTeamVisible(true)} style={tailwind`p-4 bg-yellow-500 rounded-lg`}>
              <Text style={tailwind`text-white text-center`}>{team2? teams.find((item) => item.id === team2).name : "Select Team"}</Text>
            </Pressable>
          </View>
        </View>
        {/* Time button for start time and end time */}
        <View style={tailwind`flex-row justify-between mb-4`}>
          <View style={tailwind`flex-1 ml-2`}>
            <Text style={tailwind`text-lg text-gray-700`}>Start Time</Text>
            <Pressable onPress={() => setIsModalStartTimeVisible(true)} style={tailwind`p-4 bg-green-500 rounded-lg`}>
              <Text style={tailwind`text-white text-center`}>Start Time</Text>
            </Pressable>
          </View>
          <View style={tailwind`flex-1 ml-2`}>
            <Text style={tailwind`text-lg text-gray-700`}>End Time</Text>
            <Pressable onPress={() => setIsModalEndTimeVisible(true)} style={tailwind`p-4 bg-green-500 rounded-lg`}>
              <Text style={tailwind`text-white text-center`}>End Time</Text>
            </Pressable>
          </View>
        </View>

        {/* type match like team, Individual, double */}
        <View style={tailwind`justify-between mb-4`}>
          <Text style={tailwind`text-lg text-gray-700`}>Types</Text>
          <View style={tailwind`flex-row  justify-evenly mr-2`}>
            {matchTypes.map((item, index) => (
              <Pressable key={index} onPress={() => setMatchType(item.toLowerCase())} style={tailwind`p-2 bg-red-200 rounded-md`}>
                <Text style={tailwind`text-white text-center`}>{item}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <Pressable onPress={handleSetFixture} style={tailwind`p-4 bg-purple-500 rounded-lg`}>
          <Text style={tailwind`text-white text-center text-lg`}>Submit</Text>
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
    </View>
  );
};

export default CreateFixture;
