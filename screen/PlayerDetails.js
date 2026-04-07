import { useState, useEffect } from "react";
import { View, Text, Image, ActivityIndicator } from "react-native";
import tailwind from "twrnc";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from "react-native-reanimated";
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "./axios_config";
import { BASE_URL } from "../constants/ApiConstants";
import { convertToISOString, formatToDDMMYY } from "../utils/FormattedDateTime";

const getMatchScore = (score, gameName) => {
   if (!score) return "-";

   if (gameName === "football") {
      const goals = score.goals ?? 0;
      if (score.penalty_shootout != null) {
         return `${goals} (${score.penalty_shootout})`;
      }
      return `${goals}`;
   } else if (gameName === "cricket") {
      const runs = score.runs ?? 0;
      const wickets = score.wickets ?? 0;
      const overs = score.overs != null ? ` (${score.overs})` : "";
      return `${runs}/${wickets}${overs}`;
   } else if (gameName === "badminton") {
      if (typeof score === "string" || typeof score === "number") return `${score}`;
      if (score != null) return `${score}`;
      return "-";
   }

   return "-";
}

const PlayerDetails = ({
  player,
  parentScrollY,
  headerHeight,
  collapsedHeader,
  isContentScrollable = true
}) => {
  const game = useSelector((state) => state.sportReducers.game);
  const [currentClub, setCurrentClub] = useState(null);
  const [playerTeam, setPlayerTeam] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({
    global: null,
    fields: {},
  });
  const [recentPerformance, setRecentPerformance] = useState([]);

  const currentScrollY = useSharedValue(0);

  const handlerScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      if (isContentScrollable) {
        if (parentScrollY === collapsedHeader) {
          parentScrollY.value = currentScrollY.value;
        } else {
          parentScrollY.value = event.contentOffset.y;
        }
      }
    },
  });

  // Fetch recent matches by player
  useEffect(() => {
    if (!player?.public_id) return;

    const fetchRecentPerformance = async () => {
      try {
        setLoading(true);
        const authToken = await AsyncStorage.getItem("AccessToken");
        const response = await axiosInstance.get(
          `${BASE_URL}/getMatchesByPlayer/${player.public_id}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        const allMatches = response.data?.data || [];

        // Filter finished matches, sort by most recent, take last 5
        const finishedMatches = allMatches
          .filter(m => m.status_code === 'finished')
          .sort((a, b) => (b.start_timestamp || 0) - (a.start_timestamp || 0))
          .slice(0, 5);

        setRecentPerformance(finishedMatches);
      } catch (err) {
        console.error("Unable to get recent matches: ", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentPerformance();
  }, [player]);

  // Normal scrollable content
  return (
    <View style={[tailwind`flex-1`, { backgroundColor: '#0f172a' }]}>
      <Animated.ScrollView
        onScroll={handlerScroll}
        scrollEventThrottle={16}
        contentContainerStyle={tailwind`pb-28`}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Club - only for team sports */}
        {currentClub?.type === "team" && (
          <View
            style={[tailwind`rounded-2xl mx-3 mt-4 p-4 flex-row items-center`, { backgroundColor: '#1e293b' }]}
          >
            {currentClub?.media_url ? (
              <Image
                source={{ uri: currentClub.media_url }}
                style={tailwind`h-12 w-12 rounded-full mr-3`}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[tailwind`h-12 w-12 rounded-full items-center justify-center mr-3`, { backgroundColor: '#334155' }]}
              >
                <Text style={[tailwind`font-bold text-base`, { color: '#f1f5f9' }]}>
                  {currentClub?.name?.charAt(0).toUpperCase() ?? "?"}
                </Text>
              </View>
            )}
            <View>
              <Text style={[tailwind`text-sm font-semibold`, { color: '#f1f5f9' }]}>
                {currentClub?.name ?? "No Club"}
              </Text>
              <Text style={[tailwind`text-xs`, { color: '#64748b' }]}>Current Club</Text>
            </View>
          </View>
        )}

        {/* Player Info */}
        <View
          style={[tailwind`rounded-2xl mx-3 mt-3 p-4 flex-row justify-between`, { backgroundColor: '#1e293b' }]}
        >
          <View style={tailwind`items-center flex-1`}>
            <Text style={[tailwind`text-xs mb-1`, { color: '#64748b' }]}>Nationality</Text>
            <Text style={[tailwind`text-sm font-semibold`, { color: '#f1f5f9' }]}>
              {player?.country ?? "-"}
            </Text>
          </View>
          {player?.positions && (
            <View style={[tailwind`items-center flex-1`, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#334155' }]}>
              <Text style={[tailwind`text-xs mb-1`, { color: '#64748b' }]}>Position</Text>
              <Text style={[tailwind`text-sm font-semibold`, { color: '#f1f5f9' }]}>
                {player.positions}
              </Text>
            </View>
          )}
          {currentClub?.join_date && (
            <View style={tailwind`items-center flex-1`}>
              <Text style={[tailwind`text-xs mb-1`, { color: '#64748b' }]}>Joined</Text>
              <Text style={[tailwind`text-sm font-semibold`, { color: '#f1f5f9' }]}>
                {formatToDDMMYY(convertToISOString(currentClub.join_date))}
              </Text>
            </View>
          )}
        </View>

        {/* Recent Form - W/L badges */}
        {loading ? (
          <View style={tailwind`items-center justify-center py-8`}>
            <ActivityIndicator size="small" color="#94a3b8" />
          </View>
        ) : recentPerformance.length > 0 ? (
          <View
            style={[tailwind`rounded-2xl mx-3 mt-3 p-4`, { backgroundColor: '#1e293b' }]}
          >
            <Text style={[tailwind`text-xs font-bold mb-3 uppercase tracking-wide`, { color: '#64748b' }]}>
              Recent Form
            </Text>
            <View style={tailwind`flex-row items-center justify-center`}>
              {recentPerformance.map((match, index) => {
                const isWin = match.isWin === true;
                return (
                  <View
                    key={index}
                    style={[
                      tailwind`w-9 h-9 rounded-full items-center justify-center`,
                      {
                        backgroundColor: isWin ? '#16a34a20' : '#dc262620',
                        marginHorizontal: 4,
                      }
                    ]}
                  >
                    <Text style={[tailwind`text-xs font-bold`, { color: isWin ? '#4ade80' : '#f87171' }]}>
                      {isWin ? 'W' : 'L'}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}

        {/* Recent Matches List */}
        {recentPerformance.length > 0 && (
          <View
            style={[tailwind`rounded-2xl mx-3 mt-3 overflow-hidden`, { backgroundColor: '#1e293b' }]}
          >
            <View style={[tailwind`px-4 py-3`, { borderBottomWidth: 1, borderBottomColor: '#334155' }]}>
              <Text style={[tailwind`text-xs font-bold uppercase tracking-wide`, { color: '#64748b' }]}>
                Recent Matches
              </Text>
            </View>

            {recentPerformance.map((match, index) => {
              const isWin = match.isWin === true;
              const isLast = index === recentPerformance.length - 1;
              return (
                <View
                  key={index}
                  style={[
                    tailwind`px-4 py-3 flex-row items-center`,
                    !isLast && { borderBottomWidth: 1, borderBottomColor: '#1a2332' }
                  ]}
                >
                  {/* W/L indicator bar */}
                  <View
                    style={[
                      tailwind`w-1 rounded-full mr-3`,
                      {
                        height: 32,
                        backgroundColor: isWin ? '#4ade80' : '#f87171',
                      }
                    ]}
                  />

                  {/* Match details */}
                  <View style={tailwind`flex-1`}>
                    <View style={tailwind`flex-row items-center`}>
                      {/* Home team */}
                      <View style={tailwind`flex-row items-center flex-1`}>
                        {match?.homeTeam?.media_url ? (
                          <Image
                            source={{ uri: match.homeTeam.media_url }}
                            style={tailwind`w-5 h-5 rounded-full mr-1.5`}
                          />
                        ) : (
                          <View style={[tailwind`w-5 h-5 rounded-full items-center justify-center mr-1.5`, { backgroundColor: '#334155' }]}>
                            <Text style={[tailwind`text-xs font-bold`, { color: '#94a3b8' }]}>
                              {match?.homeTeam?.name?.charAt(0) || '?'}
                            </Text>
                          </View>
                        )}
                        <Text
                          style={[tailwind`text-xs font-medium`, { color: '#f1f5f9' }]}
                          numberOfLines={1}
                        >
                          {match?.homeTeam?.short_name || match?.homeTeam?.name}
                        </Text>
                      </View>

                      {/* Score */}
                      <View style={tailwind`flex-row items-center mx-2`}>
                        <Text style={[tailwind`text-xs font-bold`, { color: '#f1f5f9' }]}>
                          {getMatchScore(match?.homeScore, game.name)}
                        </Text>
                        <Text style={[tailwind`text-xs mx-1`, { color: '#475569' }]}>-</Text>
                        <Text style={[tailwind`text-xs font-bold`, { color: '#f1f5f9' }]}>
                          {getMatchScore(match?.awayScore, game.name)}
                        </Text>
                      </View>

                      {/* Away team */}
                      <View style={tailwind`flex-row items-center flex-1 justify-end`}>
                        <Text
                          style={[tailwind`text-xs font-medium`, { color: '#f1f5f9' }]}
                          numberOfLines={1}
                        >
                          {match.awayTeam.short_name || match?.awayTeam?.name}
                        </Text>
                        {match?.awayTeam?.media_url ? (
                          <Image
                            source={{ uri: match.awayTeam.media_url }}
                            style={tailwind`w-5 h-5 rounded-full ml-1.5`}
                          />
                        ) : (
                          <View style={[tailwind`w-5 h-5 rounded-full items-center justify-center ml-1.5`, { backgroundColor: '#334155' }]}>
                            <Text style={[tailwind`text-xs font-bold`, { color: '#94a3b8' }]}>
                              {match?.awayTeam?.name?.charAt(0) || '?'}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Tournament & date row */}
                    <View style={tailwind`flex-row items-center justify-between mt-1.5`}>
                      <Text style={[tailwind`text-xs`, { color: '#475569' }]} numberOfLines={1}>
                        {match?.tournament?.name}
                        {match?.type === 'individual' ? ' \u00B7 Singles' : match?.type === 'double' ? ' \u00B7 Doubles' : ''}
                      </Text>
                      <Text style={[tailwind`text-xs`, { color: '#475569' }]}>
                        {match?.start_timestamp ? formatToDDMMYY(convertToISOString(match.start_timestamp)) : '-'}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </Animated.ScrollView>
    </View>
  );
};

export default PlayerDetails;
