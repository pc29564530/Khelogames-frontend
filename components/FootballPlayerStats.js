import { useState, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import axiosInstance from "../screen/axios_config";
import { BASE_URL } from "../constants/ApiConstants";
import tailwind from "twrnc";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";

const FootballPlayerStats = ({ player, parentScrollY, headerHeight, collapsedHeader }) => {
  const [playerStats, setPlayerStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
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
      setIsLoading(true);
      try {
        const authToken = await AsyncStorage.getItem("AccessToken"); // ✅ fixed key
        const response = await axiosInstance.get(
          `${BASE_URL}/getFootballPlayerStats/${player.public_id}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        setPlayerStats(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlayerStats();
  }, []);

  if (isLoading) {
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
      <Text style={tailwind`text-xl font-bold text-gray-800 m-4`}>
        Player Statistics
      </Text>

      <Animated.FlatList
        onScroll={handlerScroll}
        data={playerStatsData}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tailwind`pb-20`}
        renderItem={({ item }) => (
          <View
            style={tailwind`bg-gray-100 p-4 flex-1 rounded-lg shadow-sm m-2 h-100`}
          >
            <Text style={tailwind`text-sm text-gray-700`}>{item.label}</Text>
            <Text style={tailwind`text-lg font-semibold text-gray-900`}>
              {item.value !== undefined ? item.value : 0}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

export default FootballPlayerStats;
