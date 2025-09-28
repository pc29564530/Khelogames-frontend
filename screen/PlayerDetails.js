import { useState, useEffect } from "react";
import { View, Text, Image } from "react-native";
import tailwind from "twrnc";
import Animated, { 
  useSharedValue, 
  useAnimatedScrollHandler,
  runOnJS 
} from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "./axios_config";
import { BASE_URL } from "../constants/ApiConstants";
import { convertToISOString, formatToDDMMYY } from "../utils/FormattedDateTime";

const PlayerDetails = ({ 
  player, 
  parentScrollY, 
  headerHeight, 
  collapsedHeader, 
  isContentScrollable = true 
}) => {
  const [playerTeam, setPlayerTeam] = useState([]);
  const [currentClub, setCurrentClub] = useState(null);

  const currentScrollY = useSharedValue(0);

  const handlerScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      // Only update scroll if content is actually scrollable
      if (isContentScrollable) {
        if (parentScrollY === collapsedHeader) {
          parentScrollY.value = currentScrollY.value;
        } else {
          parentScrollY.value = event.contentOffset.y;
        }
      }
    },
  });

  useEffect(() => {
    const fetchTeamByPlayer = async () => {
      try {
        const authToken = await AsyncStorage.getItem("AccessToken");
        const response = await axiosInstance.get(
          `${BASE_URL}/getTeamByPlayer/${player.public_id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data) {
          setPlayerTeam(response.data);
          setCurrentClub(response.data.find((item) => item.leave_date === null));
        } else {
          setPlayerTeam([]);
        }
      } catch (err) {
        console.log("Error fetching team:", err);
      }
    };
    fetchTeamByPlayer();
  }, []);

  // If content is not scrollable, render without ScrollView
  if (!isContentScrollable) {
    return (
      <View style={tailwind`flex-1 bg-gray-50 pb-28`}>
        {/* Current Club */}
        <View
          style={tailwind`bg-white rounded-2xl shadow-md mx-3 mt-4 p-4 flex-row items-center`}
        >
          {currentClub?.media_url ? (
            <Image
              source={{ uri: currentClub.media_url }}
              style={tailwind`h-14 w-14 rounded-full mr-4`}
              resizeMode="cover"
            />
          ) : (
            <View
              style={tailwind`h-14 w-14 rounded-full bg-indigo-500 items-center justify-center mr-4`}
            >
              <Text style={tailwind`text-white font-bold text-lg`}>
                {currentClub?.name?.charAt(0).toUpperCase() ?? "?"}
              </Text>
            </View>
          )}

          <View>
            <Text style={tailwind`text-base font-semibold text-gray-900`}>
              {currentClub?.name ?? "No Club"}
            </Text>
            <Text style={tailwind`text-xs text-gray-500`}>
              Current Club
            </Text>
          </View>
        </View>

        {/* Player Info Row */}
        <View
          style={tailwind`bg-white rounded-2xl shadow-md mx-3 mt-4 p-4 flex-row justify-between`}
        >
          <View>
            <Text style={tailwind`text-xs text-gray-500 mb-1`}>Nationality</Text>
            <Text style={tailwind`text-sm font-semibold text-gray-900`}>
              {player.country ?? "-"}
            </Text>
          </View>

          <View>
            <Text style={tailwind`text-xs text-gray-500 mb-1`}>Position</Text>
            <Text style={tailwind`text-sm font-semibold text-gray-900`}>
              {player.positions ?? "-"}
            </Text>
          </View>

          <View>
            <Text style={tailwind`text-xs text-gray-500 mb-1`}>Joined</Text>
            <Text style={tailwind`text-sm font-semibold text-gray-900`}>
              {currentClub?.join_date
                ? formatToDDMMYY(convertToISOString(currentClub.join_date))
                : "-"}
            </Text>
          </View>
        </View>

        {/* Player Profile Card */}
        <View
          style={tailwind`bg-white rounded-2xl shadow-md mx-3 mt-4 p-5`}
        >
          <Text style={tailwind`text-lg font-bold text-gray-900 mb-3`}>
            Player Profile
          </Text>

          <View style={tailwind`mb-3`}>
            <Text style={tailwind`text-xs text-gray-500 mb-1`}>Name</Text>
            <Text style={tailwind`text-base font-semibold text-gray-900`}>
              {player?.name ?? "-"}
            </Text>
          </View>

          <View>
            <Text style={tailwind`text-xs text-gray-500 mb-1`}>Country</Text>
            <Text style={tailwind`text-base font-semibold text-gray-900`}>
              {player?.country ?? "-"}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // Normal scrollable content
  return (
    <View style={tailwind`flex-1 bg-gray-50`}>
      <Animated.ScrollView
        onScroll={handlerScroll}
        scrollEventThrottle={16}
        contentContainerStyle={tailwind`pb-28`}
        showsVerticalScrollIndicator={true}
      >
        {/* Current Club */}
        <View
          style={tailwind`bg-white rounded-2xl shadow-md mx-3 mt-4 p-4 flex-row items-center`}
        >
          {currentClub?.media_url ? (
            <Image
              source={{ uri: currentClub.media_url }}
              style={tailwind`h-14 w-14 rounded-full mr-4`}
              resizeMode="cover"
            />
          ) : (
            <View
              style={tailwind`h-14 w-14 rounded-full bg-indigo-500 items-center justify-center mr-4`}
            >
              <Text style={tailwind`text-white font-bold text-lg`}>
                {currentClub?.name?.charAt(0).toUpperCase() ?? "?"}
              </Text>
            </View>
          )}

          <View>
            <Text style={tailwind`text-base font-semibold text-gray-900`}>
              {currentClub?.name ?? "No Club"}
            </Text>
            <Text style={tailwind`text-xs text-gray-500`}>
              Current Club
            </Text>
          </View>
        </View>

        {/* Player Info Row */}
        <View
          style={tailwind`bg-white rounded-2xl shadow-md mx-3 mt-4 p-4 flex-row justify-between`}
        >
          <View>
            <Text style={tailwind`text-xs text-gray-500 mb-1`}>Nationality</Text>
            <Text style={tailwind`text-sm font-semibold text-gray-900`}>
              {player.country ?? "-"}
            </Text>
          </View>

          <View>
            <Text style={tailwind`text-xs text-gray-500 mb-1`}>Position</Text>
            <Text style={tailwind`text-sm font-semibold text-gray-900`}>
              {player.positions ?? "-"}
            </Text>
          </View>

          <View>
            <Text style={tailwind`text-xs text-gray-500 mb-1`}>Joined</Text>
            <Text style={tailwind`text-sm font-semibold text-gray-900`}>
              {currentClub?.join_date
                ? formatToDDMMYY(convertToISOString(currentClub.join_date))
                : "-"}
            </Text>
          </View>
        </View>

        {/* Player Profile Card */}
        <View
          style={tailwind`bg-white rounded-2xl shadow-md mx-3 mt-4 p-5`}
        >
          <Text style={tailwind`text-lg font-bold text-gray-900 mb-3`}>
            Player Profile
          </Text>

          <View style={tailwind`mb-3`}>
            <Text style={tailwind`text-xs text-gray-500 mb-1`}>Name</Text>
            <Text style={tailwind`text-base font-semibold text-gray-900`}>
              {player?.name ?? "-"}
            </Text>
          </View>

          <View>
            <Text style={tailwind`text-xs text-gray-500 mb-1`}>Country</Text>
            <Text style={tailwind`text-base font-semibold text-gray-900`}>
              {player?.country ?? "-"}
            </Text>
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

export default PlayerDetails;