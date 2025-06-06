import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import tailwind from 'twrnc';
import useAxiosInterceptor from '../screen/axios_config';
import { BASE_URL } from '../constants/ApiConstants';

const statFields = [
  'Matches', 'Innings', 'Wickets', '5w', 'Economy'
];

const StatRow = ({ label, value = "N/A" }) => (
  <View style={tailwind`flex-row justify-between py-2 border-b border-gray-100`}>
    <Text style={tailwind`text-gray-600 font-medium`}>{label}</Text>
    <Text style={tailwind`text-black font-semibold`}>{value}</Text>
  </View>
);

const CricketPlayerBowlingStats = ({playerID}) => {
  const [contentTab, setContentTab] = useState('test');
  const [playerBowlingStats, setPlayerBowlingStats] = useState(null);

  useEffect(() => {
        const fetchPlayerBowlingStats = async () => {
            try {
                const authToken = await AsyncStorage.getItem("AccessToken")
                const response = await axiosInstance.get(`${BASE_URL}/getPlayerBowlingStats/${playerID}`, {
                    headers: {
                        'Authorization': `bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                })
                setPlayerBowlingStats(response.data || null);
            } catch (err) {
                console.error("unable to fetch player stats: ", err);
            }
        }
        fetchPlayerBowlingStats()
    },[])

    const renderStats = () => (
        <View style={tailwind`bg-white p-4 rounded-2xl shadow-md`}>
            {playerBowlingStats && playerBowlingStats[0].match_type === contentTab && 
                    <StatRow key={playerBowlingStats[0]} label={playerBowlingStats[0]} />
            }
            {playerBowlingStats && playerBowlingStats[1].match_type === contentTab && 
                    <StatRow key={playerBowlingStats[1]} label={playerBowlingStats[1]} />
            }
            {playerBowlingStats && playerBowlingStats[2].match_type === contentTab && 
                    <StatRow key={playerBowlingStats[2]} label={playerBowlingStats[2]} />
            }
        </View>
      );

  return (
    <View style={tailwind``}>
      {/* Tab Selector */}
      <View style={tailwind`flex-row justify-between mb-4`}>
        {['test', 'odi', 't20'].map(tab => (
          <Pressable
            key={tab}
            onPress={() => setContentTab(tab)}
            style={tailwind.style(
              'flex-1 mx-1 py-2 rounded-lg items-center border',
              contentTab === tab
                ? 'bg-green-500 border-green-500'
                : 'bg-gray-100 border-gray-300'
            )}
          >
            <Text style={tailwind.style(
              'text-sm',
              contentTab === tab ? 'text-white font-semibold' : 'text-gray-700'
            )}>
              {tab.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Stats View */}
      {renderStats()}
    </View>
  );
};

export default CricketPlayerBowlingStats;
