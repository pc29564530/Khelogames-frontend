import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable,
  SafeAreaView, Image, Animated, RefreshControl,
} from 'react-native';
import tailwind from 'twrnc';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from './axios_config';
import { BASE_URL } from '../constants/ApiConstants';
import { sportsServices } from '../services/sportsServices';
import { getTournamentBySportAndTrending } from '../services/tournamentServices';
import { getMatches, setGames, setGame } from '../redux/actions/actions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SportSelector from '../components/SportSelector';
import { convertToISOString, formatToDDMMYY } from '../utils/FormattedDateTime';

const QUICK_ACTIONS = [
  { id: 'tournament', icon: 'emoji-events', label: 'Create\nTournament', color: '#f87171', screen: 'CreateTournament' },
  { id: 'team',       icon: 'create',       label: 'Create\nTeam',       color: '#38bdf8', screen: 'CreateClub' },
  { id: 'join',       icon: 'group-add',    label: 'Join a\nTeam',       color: '#a78bfa', screen: 'Club' },
];

// Pulsing red live dot
const LiveDot = () => {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.7, duration: 700, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1.0, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <View style={{ width: 14, height: 14, alignItems: 'center', justifyContent: 'center', marginRight: 6 }}>
      <Animated.View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444', transform: [{ scale }] }} />
    </View>
  );
};

// Skeleton shimmer block
const SkeletonBlock = ({ width, height, borderRadius = 12, style }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={[{ width, height, borderRadius, backgroundColor: '#1e293b', opacity }, style]} />
  );
};

const SkeletonHero = () => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, marginTop: 12 }}>
    {[1, 2].map(i => (
      <View key={i} style={{ width: 300, marginHorizontal: 6, backgroundColor: '#1e293b', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#334155' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
          <SkeletonBlock width={60} height={16} borderRadius={8} />
          <SkeletonBlock width={80} height={20} borderRadius={10} />
        </View>
        <SkeletonBlock width={150} height={12} borderRadius={6} style={{ marginBottom: 16 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <SkeletonBlock width={80} height={14} borderRadius={6} style={{ marginBottom: 6 }} />
            <SkeletonBlock width={60} height={32} borderRadius={8} />
          </View>
          <SkeletonBlock width={30} height={20} borderRadius={6} />
          <View style={{ alignItems: 'flex-end' }}>
            <SkeletonBlock width={80} height={14} borderRadius={6} style={{ marginBottom: 6 }} />
            <SkeletonBlock width={60} height={32} borderRadius={8} />
          </View>
        </View>
        <SkeletonBlock width={'100%'} height={40} borderRadius={12} style={{ marginTop: 18 }} />
      </View>
    ))}
  </ScrollView>
);

const SkeletonTournaments = () => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 16, gap: 12, marginTop: 12 }}>
    {[1, 2, 3].map(i => (
      <View key={i} style={{ backgroundColor: '#1e293b', borderRadius: 16, padding: 16, width: 200, borderWidth: 1, borderColor: '#334155' }}>
        <SkeletonBlock width={36} height={36} borderRadius={10} style={{ marginBottom: 10 }} />
        <SkeletonBlock width={140} height={16} borderRadius={6} style={{ marginBottom: 6 }} />
        <SkeletonBlock width={60} height={12} borderRadius={6} style={{ marginBottom: 10 }} />
        <SkeletonBlock width={70} height={18} borderRadius={6} />
      </View>
    ))}
  </ScrollView>
);

const SkeletonPerformers = () => (
  <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
    {[1, 2, 3].map(i => (
      <View key={i} style={{ backgroundColor: '#1e293b', borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#334155' }}>
        <SkeletonBlock width={28} height={20} borderRadius={6} style={{ marginRight: 8 }} />
        <SkeletonBlock width={40} height={40} borderRadius={20} style={{ marginRight: 12 }} />
        <View style={{ flex: 1 }}>
          <SkeletonBlock width={100} height={14} borderRadius={6} style={{ marginBottom: 4 }} />
          <SkeletonBlock width={60} height={10} borderRadius={4} />
        </View>
        <SkeletonBlock width={70} height={24} borderRadius={8} />
      </View>
    ))}
  </View>
);

// Empty State
const EmptyState = ({ icon, title, subtitle, buttonLabel, onPress }) => (
  <View style={{
    backgroundColor: '#1e293b', borderRadius: 16,
    padding: 28, alignItems: 'center',
    borderWidth: 1, borderColor: '#334155'
  }}>
    <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
      <MaterialIcons name={icon} size={28} color="#475569" />
    </View>
    <Text style={{ color: '#94a3b8', fontSize: 15, fontWeight: '700', textAlign: 'center' }}>{title}</Text>
    <Text style={{ color: '#475569', fontSize: 12, textAlign: 'center', marginTop: 6, lineHeight: 18, paddingHorizontal: 10 }}>{subtitle}</Text>
    {buttonLabel && onPress && (
      <Pressable onPress={onPress} style={{ marginTop: 16, backgroundColor: '#f87171', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10 }}>
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>{buttonLabel}</Text>
      </Pressable>
    )}
  </View>
);

// Helpers
const sportColor = (sportName) => sportName === 'cricket' ? '#f97316' : '#22c55e';

const getIconForSport = (name) => {
  switch (name) {
    case 'football': return 'sports-soccer';
    case 'cricket':  return 'sports-cricket';
    default:         return 'sports';
  }
};

const getTeamScore = (match, side) => {
  const score = side === 'home' ? match.homeScore : match.awayScore;
  if (match.sport === 'football') return score?.goals?.toString();
  if (match.sport === 'cricket' && Array.isArray(score) && score.length > 0) {
    const latest = score[score.length - 1];
    return `${latest.score ?? 0}/${latest.wickets ?? 0}`;
  }
  return;
};

const getMatchTime = (match) => {
  if(match.status_code === "not_started"){
    return formatToDDMMYY(convertToISOString(match.start_timestamp))
  } else if(match_status_code === "in_progress") {
    if(game.name === "cricket"){
      if(match.sub_status) return match.sub_status;
    }
  }
};

// Main Component
function Home() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const games = useSelector((state) => state.sportReducers.games);
  const game  = useSelector((state) => state.sportReducers.game);

  const [trendingMatches, setTrendingMatches]      = useState([]);
  const [tournaments, setTournaments]      = useState([]);
  const [topPerformers, setTopPerformers]  = useState({ batting: [], bowling: [], goals: [] });
  const [highlights, setHighlights]        = useState([]);
  const [error, setError] = useState({
    global: null,
    fields: {}
  })
  const [loading, setLoading]              = useState(false);
  const [refreshing, setRefreshing]        = useState(false);

  const fetchTopPerformer = async () => {
    try {
      const authToken = await AsyncStorage.getItem("AccessToken");
      const res = await axiosInstance.get(`${BASE_URL}/${game.name}/getTopPerformer`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      const response = res.data;
      if (response?.success && response?.data) {
        if (game.name === 'football') {
          setTopPerformers({ batting: [], bowling: [], goals: response.data || [] });
        } else if (game.name === 'cricket') {
          setTopPerformers({
            batting: response.data?.batting || [],
            bowling: response.data?.bowling || [],
            goals: [],
          });
        }
      }
    } catch (err) {
      console.log('Unable to get top performer:', err);
    }
  };

  // Fetch all games on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await sportsServices();
        dispatch(setGames(res.data));
      } catch (err) {
        console.log('Unable to get games:', err);
        setLoading(false);
      }
    })();
  }, []);

  // Fetch data when selected game changes
  useEffect(() => {
    if (game?.name) fetchData();
  }, [game?.name]);


  const fetchData = async () => {
    setLoading(true);
    try {
      // Live Matches
      const liveRes = await axiosInstance.get(`${BASE_URL}/${game.name}/get-trending-matches`);
      const liveData = (liveRes.data?.data || []).map(m => ({ ...m, sport: game.name }));
      dispatch(getMatches(liveRes.data));
      setTrendingMatches(liveData.slice(0, 5));
      // Tournaments
      const tournRes = await getTournamentBySportAndTrending({ game });
      const tournamentList = tournRes?.data?.tournament || [];
      setTournaments(Array.isArray(tournamentList) ? tournamentList : []);

      // Top Performers
      await fetchTopPerformer();

    } catch (err) {
      console.log('Failed to fetch home data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [game?.name]);

  const hasPerformers = topPerformers.batting.length > 0
    || topPerformers.bowling.length > 0
    || topPerformers.goals.length > 0;

  const isEverythingEmpty = !loading
    && trendingMatches.length === 0
    && tournaments.length === 0
    && highlights.length === 0
    && !hasPerformers;

  const checkMatchStatus = (item) => {
    if(item.status_code === "not_started") {
      return "Upcoming"
    } else if(item.status_code === "in_progress") {
      return "Live"
    } else {
      return "Finished"
    }
  }

  const checkMatchSport = (item) => {
    if(game.name==="cricket") {
      navigation.navigate("CricketMatchPage", {matchPublicID: item.public_id});
    } else if(game.name === "football") {
      navigation.navigate("FootballMatchPage", {matchPublicID: item.public_id})
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f87171" colors={['#f87171']} />}
      >

        {/* SPORT SELECTOR */}
        <View style={{ marginTop: 0 }}>
          <SportSelector />
        </View>

        {/* QUICK ACTIONS */}
        <View style={{ marginTop: 12, paddingHorizontal: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 14 }}>
            {QUICK_ACTIONS.map(a => (
              <Pressable
                key={a.id}
                onPress={() => { try { navigation.navigate(a.screen); } catch (e) {} }}
                style={{
                  flex: 1, maxWidth: 110, alignItems: 'center', paddingVertical: 14,
                  backgroundColor: '#1e293b', borderRadius: 16, borderWidth: 1, borderColor: '#334155',
                }}
              >
                <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: a.color + '18', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                  <MaterialIcons name={a.icon} size={22} color={a.color} />
                </View>
                <Text style={{ color: '#94a3b8', fontSize: 10, fontWeight: '600', textAlign: 'center', lineHeight: 14 }}>{a.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* WELCOME BANNER — shown when all data is empty */}
        {isEverythingEmpty && (
          <View style={{ marginHorizontal: 16, marginTop: 20 }}>
            <LinearGradient
              colors={['#1e293b', '#0f172a']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={{ borderRadius: 20, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#334155' }}
            >
              <View style={{
                width: 64, height: 64, borderRadius: 32,
                backgroundColor: '#f8717118', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
              }}>
                <Text style={{ fontSize: 32 }}>
                  {game?.name === 'cricket' ? '🏏' : game?.name === 'football' ? '⚽' : '🏆'}
                </Text>
              </View>
              <Text style={{ color: '#f1f5f9', fontSize: 20, fontWeight: '800', marginBottom: 6, textAlign: 'center' }}>
                Welcome to Kridagram
              </Text>
              <Text style={{ color: '#64748b', fontSize: 13, lineHeight: 20, textAlign: 'center', paddingHorizontal: 8 }}>
                Your sports community is just getting started. Create a tournament or build a team to see live scores, stats, and highlights here.
              </Text>
            </LinearGradient>
          </View>
        )}

        {/* TRENDING MATCHES */}
        <View style={{ marginTop: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 10 }}>
            {/* <LiveDot /> */}
            <Text style={{ color: '#ef4444', fontWeight: '700', fontSize: 12, letterSpacing: 1 }}>TRENDING MATCHES</Text>
          </View>

          {loading && <SkeletonHero />}

          {!loading && trendingMatches.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
              {trendingMatches.map((item, index) => (
                <Pressable
                  key={item.public_id || index}
                  style={{ width: 300, marginHorizontal: 6, backgroundColor: '#1e293b', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#334155' }}
                  onPress={() => navigation.navigate("ClubPage")}
                >
                  {console.log("Line no 370: ", item)}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <LiveDot />
                      <Text style={{ color: '#ef4444', fontWeight: '700', fontSize: 12, letterSpacing: 1 }}>{checkMatchStatus(item)}</Text>
                    </View>
                    <View style={{ backgroundColor: sportColor(item.sport) + '22', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 }}>
                      <Text style={{ color: sportColor(item.sport), fontSize: 11, fontWeight: '600' }}>
                        {item.sport === 'cricket' ? '🏏 Cricket' : '⚽ Football'}
                      </Text>
                    </View>
                  </View>

                  <Text style={{ color: '#64748b', fontSize: 12, marginBottom: 14 }} numberOfLines={1}>
                    {item.tournament?.name}
                  </Text>

                  <View style={tailwind`flex-row items-start`}>
                    {/* HOME TEAM */}
                    <View style={tailwind`flex-1`}>
                      <Text numberOfLines={1} style={{ color: '#cbd5e1', fontSize: 14, fontWeight: '500' }}>
                        {item.homeTeam?.name}
                      </Text>
                      {item.homeScore && (
                        <Text style={{ color: '#f1f5f9', fontSize: 28, fontWeight: '800', marginTop: 2 }}>
                          {getTeamScore(item, 'home')}
                        </Text>
                      )}
                    </View>

                    {/* CENTER */}
                    <View style={tailwind`flex-1 items-center`}>
                      <Text style={{ color: '#475569', fontSize: 11, fontWeight: '600' }}>
                        {getMatchTime(item)}
                      </Text>
                    </View>

                    {/* AWAY TEAM */}
                    <View style={tailwind`flex-1 items-end`}>
                      <Text numberOfLines={1} style={{ color: '#cbd5e1', fontSize: 14, fontWeight: '500' }}>
                        {item.awayTeam?.name}
                      </Text>
                      {item.awayScore && (
                        <Text style={{ color: '#f1f5f9', fontSize: 28, fontWeight: '800', marginTop: 2 }}>
                          {getTeamScore(item, 'away')}
                        </Text>
                      )}
                    </View>
                  </View>
                  <Pressable onPress={() => checkMatchSport(item)} style={{ marginTop: 18, backgroundColor: '#f87171', borderRadius: 12, paddingVertical: 10, alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>View Full Scorecard</Text>
                  </Pressable>
                </Pressable>
              ))}
            </ScrollView>
          )}

          {!loading && trendingMatches.length === 0 && (
            <View style={{ paddingHorizontal: 16 }}>
              <EmptyState icon="sports-score" title="No Live Matches Right Now"
                subtitle="Check back later or explore upcoming tournaments and local leagues."
                buttonLabel="Browse Tournaments" onPress={() => navigation.navigate('Tournament')} />
            </View>
          )}
        </View>

        {/* TOURNAMENTS */}
        <View style={{ marginTop: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 }}>
            <Text style={{ color: '#94a3b8', fontWeight: '700', fontSize: 12, letterSpacing: 1 }}>TOURNAMENTS</Text>
            {tournaments.length > 0 && (
              <Pressable onPress={() => navigation.navigate('Tournament')}>
                <Text style={{ color: '#f87171', fontSize: 12 }}>See all</Text>
              </Pressable>
            )}
          </View>

          {loading && <SkeletonTournaments />}

          {!loading && tournaments.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 16, gap: 12 }}>
              {tournaments.map((t, index) => (
                <Pressable
                  key={t.public_id || index}
                  style={{ backgroundColor: '#1e293b', borderRadius: 16, padding: 16, width: 200, borderWidth: 1, borderColor: '#334155' }}
                  onPress={() => navigation.navigate("TournamentPage", {tournament: t})}
                >
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: sportColor(game.name) + '22', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                    <Text style={{ fontSize: 18 }}>{game.name === 'cricket' ? '🏏' : '⚽'}</Text>
                  </View>
                  <Text style={{ color: '#f1f5f9', fontWeight: '700', fontSize: 14 }} numberOfLines={2}>{t.name || 'Tournament'}</Text>
                  <Text style={{ color: '#475569', fontSize: 12, marginTop: 6 }}>{t.country || 'Local'}</Text>
                  {t.status && (
                    <View style={{ marginTop: 10, backgroundColor: t.status === 'ongoing' ? '#22c55e22' : '#f9731622', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start' }}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: t.status === 'ongoing' ? '#22c55e' : '#f97316' }}>
                        {t.status.toUpperCase()}
                      </Text>
                    </View>
                  )}
                </Pressable>
              ))}
            </ScrollView>
          )}

          {!loading && tournaments.length === 0 && (
            <View style={{ paddingHorizontal: 16 }}>
              <EmptyState icon="emoji-events" title="No Tournaments Yet"
                subtitle="Be the first to organize a tournament in your area. Invite teams and get started!"
                buttonLabel="Create Tournament" onPress={() => navigation.navigate('CreateTournament')} />
            </View>
          )}
        </View>

        {/* TOP PERFORMERS */}
        <View style={{ marginTop: 24 }}>
          <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
            <Text style={{ color: '#94a3b8', fontWeight: '700', fontSize: 12, letterSpacing: 1 }}>TOP PERFORMERS</Text>
          </View>

          {/* {loading && <SkeletonPerformers />} */}

          {/* Football — Goals */}
          {!loading && game?.name === 'football' && topPerformers.goals.length > 0 && (
            <View style={{ paddingHorizontal: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Text style={{ fontSize: 16 }}>⚽</Text>
                <Text style={{ color: '#22c55e', fontWeight: '700', fontSize: 13, marginLeft: 6 }}>Top Scorers</Text>
              </View>
              {topPerformers.goals.map((p, i) => (
                <View key={p.player?.public_id || i} style={{ backgroundColor: '#1e293b', borderRadius: 14, padding: 14, marginBottom: 10, borderColor: '#334155', flexDirection: 'row', alignItems: 'center', shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 6, elevation: 4 }}>
                  <Text style={{ color: '#475569', fontWeight: '800', fontSize: 16, width: 28 }}>#{i + 1}</Text>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>{p.player?.name?.charAt(0)?.toUpperCase() || '?'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#e2e8f0', fontWeight: '700' }}>{p.player?.name || 'Unknown'}</Text>
                  </View>
                  <View style={{ backgroundColor: '#22c55e22', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                    <Text style={{ color: '#22c55e', fontWeight: '700', fontSize: 12 }}>{p.goals || 0} Goals</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Cricket — Batting */}
          {!loading && game?.name === 'cricket' && topPerformers.batting.length > 0 && (
            <View style={{ paddingHorizontal: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Text style={{ fontSize: 16 }}>🏏</Text>
                <Text style={{ color: '#f97316', fontWeight: '700', fontSize: 13, marginLeft: 6 }}>Top Batsmen</Text>
              </View>
              {topPerformers.batting.map((p, i) => (
                <View key={p.player?.public_id || i} style={{ backgroundColor: '#1e293b', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#334155', flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ color: '#475569', fontWeight: '800', fontSize: 16, width: 28 }}>#{i + 1}</Text>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#f97316', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>{p.player?.name?.charAt(0)?.toUpperCase() || '?'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#e2e8f0', fontWeight: '700' }}>{p.player?.name || 'Unknown'}</Text>
                  </View>
                  <View style={{ backgroundColor: '#f9731622', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                    <Text style={{ color: '#f97316', fontWeight: '700', fontSize: 12 }}>{p.total_runs || 0} Runs</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Cricket — Bowling */}
          {!loading && game?.name === 'cricket' && topPerformers.bowling.length > 0 && (
            <View style={{ paddingHorizontal: 16, marginTop: topPerformers.batting.length > 0 ? 8 : 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Text style={{ fontSize: 16 }}>🎳</Text>
                <Text style={{ color: '#a78bfa', fontWeight: '700', fontSize: 13, marginLeft: 6 }}>Top Bowlers</Text>
              </View>
              {topPerformers.bowling.map((p, i) => (
                <View key={p.player?.public_id || i} style={{ backgroundColor: '#1e293b', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#334155', flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ color: '#475569', fontWeight: '800', fontSize: 16, width: 28 }}>#{i + 1}</Text>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#a78bfa', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>{p.player?.name?.charAt(0)?.toUpperCase() || '?'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#e2e8f0', fontWeight: '700' }}>{p.player?.name || 'Unknown'}</Text>
                  </View>
                  <View style={{ backgroundColor: '#a78bfa22', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                    <Text style={{ color: '#a78bfa', fontWeight: '700', fontSize: 12 }}>{p.wickets || 0} Wkts</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {!loading && !hasPerformers && (
            <View style={{ paddingHorizontal: 16 }}>
              <EmptyState icon="leaderboard" title="No Stats Available Yet"
                subtitle="Player rankings will appear once tournaments are underway. Create a tournament to get started!"
                buttonLabel="Create Tournament" onPress={() => navigation.navigate('CreateTournament')} />
            </View>
          )}
        </View>

        {/* HIGHLIGHTS */}
        <View style={{ marginTop: 24, paddingHorizontal: 16}}>
          <Text style={{ color: '#94a3b8', fontWeight: '700', fontSize: 12, letterSpacing: 1, marginBottom: 12 }}>
            TRENDING HIGHLIGHTS
          </Text>

          {loading && (
            <View>
              <SkeletonBlock width={'100%'} height={180} borderRadius={14} style={{ marginBottom: 10 }} />
              <SkeletonBlock width={'100%'} height={180} borderRadius={14} />
            </View>
          )}

          {!loading && highlights.length > 0 && highlights.map((h, index) => (
            <Pressable key={h.public_id || index}
              style={{ backgroundColor: '#1e293b', borderRadius: 14, marginBottom: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#334155' }}>
              {h.media_url ? (
                <Image source={{ uri: h.media_url }} style={{ width: '100%', height: 180, backgroundColor: '#0f172a' }} resizeMode="cover" />
              ) : (
                <View style={{ width: '100%', height: 120, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' }}>
                  <MaterialIcons name="play-circle-filled" size={40} color="#475569" />
                </View>
              )}
              <View style={{ padding: 12 }}>
                <Text style={{ color: '#f1f5f9', fontWeight: '600', fontSize: 14 }} numberOfLines={2}>{h.title || 'Match Highlight'}</Text>
              </View>
            </Pressable>
          ))}

          {!loading && highlights.length === 0 && (
            <EmptyState icon="videocam" title="No Highlights Yet"
              subtitle="Match highlights will appear here once live matches start. Stay tuned!" />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default Home;
