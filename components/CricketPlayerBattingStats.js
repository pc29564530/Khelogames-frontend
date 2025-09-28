import { useState, useEffect } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../screen/axios_config';
import tailwind from 'twrnc';

const statFields = [
  'Matches', 'Innings', 'Runs', 'Fifties', 'Hundreds', 'Best Score'
];

const StatRow = ({ label, value = "N/A" }) => (
  <View style={tailwind`flex-row justify-between py-2 border-b border-gray-100`}>
    <Text style={tailwind`text-gray-600 font-medium`}>{label}</Text>
    <Text style={tailwind`text-black font-semibold`}>{value}</Text>
  </View>
);

const CricketPlayerBattingStats = ({playerPublicID}) => {
  const [contentTab, setContentTab] = useState('test');
  const [playerBattingStats, setPlayerBattingStats] = useState([]);
  

  useEffect(() => {
    const fetchPlayerBattingStats = async () => {
        try {
            const authToken = await AsyncStorage.getItem("AccessToken")
            const response = await axiosInstance.get(`${BASE_URL}/getPlayerBattingStats/${playerPublicID}`, {
                headers: {
                    'Authorization': `bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            })
            setPlayerBattingStats(response.data || []);
        } catch (err) {
            console.error("unable to fetch player stats: ", err);
        }
    }
    fetchPlayerBattingStats()
},[])



  const renderStats = () => (
    <View style={tailwind`bg-white p-4 rounded-2xl shadow-md`}>
        {playerBattingStats && playerBattingStats[0].match_type === contentTab && 
                <StatRow key={playerBattingStats[0]} label={playerBattingStats[0]} />
        }
        {playerBattingStats && playerBattingStats[1].match_type === contentTab && 
                <StatRow key={playerBattingStats[1]} label={playerBattingStats[1]} />
        }
        {playerBattingStats && playerBattingStats[2].match_type === contentTab && 
                <StatRow key={playerBattingStats[2]} label={playerBattingStats[2]} />
        }
    </View>
  );

  if(playerBattingStats.length === 0){
    return (
      <View style={tailwind`flex-1`}>
        <View style={tailwind`rounded-lg shadow-md items-center justify-center bg-white p-4`}>
            <Text style={tailwind`text-lg`}>No Stats Yet</Text>
        </View>
      </View>
    )
  }

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

export default CricketPlayerBattingStats;
