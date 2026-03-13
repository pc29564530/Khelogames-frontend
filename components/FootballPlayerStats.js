import { useState, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import axiosInstance from "../screen/axios_config";
import { BASE_URL } from "../constants/ApiConstants";
import tailwind from "twrnc";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";

const FootballPlayerStats = ({ player, parentScrollY, headerHeight, collapsedHeader }) => {

  const [playerStats, setPlayerStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({
    global: null,
    fields: {},
  });

  const currentScrollY = useSharedValue(0);

  const handlerScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      if (parentScrollY === collapsedHeader) {
        parentScrollY.value = currentScrollY.value;
      } else {
        parentScrollY.value = event.contentOffset.y;
      }
    }
  });

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

        setPlayerStats(response.data.data || []);

      } catch (err) {

        setError({
          global: "Unable to get player stats",
          fields: {},
        });

        console.error("Unable to get player stats: ", err);

      } finally {
        setLoading(false);
      }
    };

    fetchPlayerStats();
  }, []);

  if (loading) {
    return (
      <View style={[tailwind`flex-1 justify-center items-center`, { backgroundColor: '#0f172a' }]}>
        <ActivityIndicator size="large" color="#3b82f6" />
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
    <View style={[tailwind`flex-1`, { backgroundColor: '#0f172a' }]}>

      <Text style={[tailwind`text-xl font-bold mx-4 mt-4 mb-3`, { color: '#f1f5f9' }]}>
        Career Statistics
      </Text>

      {error.global && !playerStats && (
        <View
          style={[
            tailwind`mx-4 mb-3 p-3 rounded-lg`,
            { backgroundColor: '#7f1d1d', borderWidth: 1, borderColor: '#b91c1c' }
          ]}
        >
          <Text style={{ color: '#fecaca', fontSize: 13 }}>
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
        contentContainerStyle={tailwind`pb-24 px-2`}
        renderItem={({ item }) => (

          <View
            style={[
              tailwind`p-5 flex-1 rounded-xl m-2`,
              {
                backgroundColor: '#1e293b',
                borderWidth: 1,
                borderColor: '#334155'
              }
            ]}
          >

            <Text
              style={[
                tailwind`text-xs uppercase mb-2`,
                { color: '#94a3b8' }
              ]}
            >
              {item.label}
            </Text>

            <Text
              style={[
                tailwind`text-3xl font-bold`,
                { color: '#f1f5f9' }
              ]}
            >
              {item.value !== undefined ? item.value : '-'}
            </Text>

          </View>

        )}
      />
    </View>
  );
};

export default FootballPlayerStats;