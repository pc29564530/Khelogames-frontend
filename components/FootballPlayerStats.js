import { useState, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import axiosInstance from "../screen/axios_config";
import { BASE_URL } from "../constants/ApiConstants";
import tailwind from "twrnc";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";


//TODO: Implementation of redux for proper state handling
const FootballPlayerStats = ({ player, parentScrollY, headerHeight, collapsedHeader }) => {
  const [playerStats, setPlayerStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({
    global: null,
    fields: {},
  })
  const currentScrollY = useSharedValue(0);
  const handlerScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
        if(parentScrollY === collapsedHeader){
            parentScrollY.value = currentScrollY;
        } else {
            parentScrollY.value = event.contentOffset.y;
        }
    }
    })

  useEffect(() => {
    const fetchPlayerStats = async () => {
      setLoading(true);
      try {
        const authToken = await AsyncStorage.getItem("AccessToken");
        const response = await axiosInstance.get(
          `${BASE_URL}/getFootballPlayerStats/${player.public_id}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log("Player Stats: ",  response.data)
        setPlayerStats(response.data.data || []);
      } catch (err) {
        setError({
          global: "Unable to get player stats",
          fields: {},
        })
        console.error("Unable to get player stats: ", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayerStats();
  }, []);

  if (loading) {
    return (
      <View style={tailwind`flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" color="#1D4ED8" />
      </View>
    );
  }

  const playerStatsData = [
    { id: "matches", label: "Matches", value: playerStats?.matches },
    { id: "minutes", label: "Minutes", value: playerStats?.minutes_played },
    { id: "goals", label: "Goals", value: playerStats?.goals_scored },
    { id: "conceded", label: "Goals Conceded", value: playerStats?.goals_conceded },
    { id: "assists", label: "Assists", value: playerStats?.assists },
    { id: "clean", label: "Clean Sheets", value: playerStats?.clean_sheet },
    { id: "yellow", label: "Yellow Cards", value: playerStats?.yellow_cards },
    { id: "red", label: "Red Cards", value: playerStats?.red_cards },
  ];

  return (
    <View style={tailwind`flex-1`}>
      <Text style={tailwind`text-xl font-bold text-gray-800 mx-4 mt-4 mb-2`}>
        Career Statistics
      </Text>
      {error.global && !playerStats && (
          <View style={tailwind`mx-4 mb-3 p-3 bg-red-50 border border-red-300 rounded-lg`}>
              <Text style={tailwind`text-red-700 text-sm`}>
                  {error.global}
              </Text>
          </View>
      )}

      <Animated.FlatList
        onScroll={handlerScroll}
        data={playerStatsData}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tailwind`pb-20 px-2`}
        renderItem={({ item }) => (
          <View
            style={tailwind`bg-white p-5 flex-1 rounded-xl shadow-lg m-2 border border-gray-200`}
          >
            <Text style={tailwind`text-xs text-gray-500 uppercase tracking-wide mb-2`}>
              {item.label}
            </Text>
            <Text style={tailwind`text-3xl font-bold text-gray-900`}>
              {item.value !== undefined ? item.value : '-'}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

export default FootballPlayerStats;
