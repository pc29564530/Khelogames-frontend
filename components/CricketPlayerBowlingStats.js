import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import tailwind from 'twrnc';
import axiosInstance from '../screen/axios_config';
import { BASE_URL } from '../constants/ApiConstants';

const StatRow = ({ label, value = "N/A" }) => (
  <View
    style={[
      tailwind`flex-row justify-between py-2`,
      { borderBottomWidth: 1, borderColor: '#334155' }
    ]}
  >
    <Text style={[tailwind`font-medium`, { color: '#94a3b8' }]}>
      {label}
    </Text>
    <Text style={[tailwind`font-semibold`, { color: '#f1f5f9' }]}>
      {value}
    </Text>
  </View>
);

const CricketPlayerBowlingStats = ({ playerPublicID }) => {

  const [contentTab, setContentTab] = useState('test');
  const [playerBowlingStats, setPlayerBowlingStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({
    global: null,
    fields: {},
  })

  useEffect(() => {
    const fetchPlayerBowlingStats = async () => {
      setLoading(true);
      try {
        const authToken = await AsyncStorage.getItem("AccessToken");
        const response = await axiosInstance.get(
          `${BASE_URL}/getPlayerBowlingStats/${playerPublicID}`,
          {
            headers: {
              Authorization: `bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        setPlayerBowlingStats(response.data.data || []);
      } catch (err) {
        setError({
          global: "Unable to get player stats",
          fields: {},
        })
        console.error("unable to get player stats: ", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayerBowlingStats();
  }, []);

  const renderStats = () => (
    <View
      style={[
        tailwind`p-4 rounded-2xl`,
        {
          backgroundColor: '#1e293b',
          borderWidth: 1,
          borderColor: '#334155'
        }
      ]}
    >
      {playerBowlingStats &&
        playerBowlingStats.map((stat, index) => {

          if (stat.match_type !== contentTab) return null;
          return (
            <StatRow
              key={index}
              label={stat.label || "Stat"}
              value={stat.value || "N/A"}
            />
          );
        })}
    </View>
  );

  if (playerBowlingStats.length === 0) {
    return (
      <View style={tailwind`flex-1`}>
        <View
          style={[
            tailwind`rounded-lg items-center justify-center p-4`,
            {
              backgroundColor: '#1e293b',
              borderWidth: 1,
              borderColor: '#334155'
            }
          ]}
        >
          <Text style={[tailwind`text-lg`, { color: '#94a3b8' }]}>
            No Stats Yet
          </Text>
        </View>

      </View>
    );
  }

  return (
    <View>
      {/* Tab Selector */}
      <View style={tailwind`flex-row justify-between mb-4`}>
        {['test', 'odi', 't20'].map(tab => (
          <Pressable
            key={tab}
            onPress={() => setContentTab(tab)}
            style={[
              tailwind`flex-1 mx-1 py-2 rounded-lg items-center`,
              contentTab === tab
                ? { backgroundColor: '#3b82f6' }
                : {
                    backgroundColor: '#1e293b',
                    borderWidth: 1,
                    borderColor: '#334155'
                  }
            ]}
          >
            <Text
              style={[
                tailwind`text-sm`,
                contentTab === tab
                  ? { color: '#f1f5f9', fontWeight: '600' }
                  : { color: '#94a3b8' }
              ]}
            >
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