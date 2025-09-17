import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  Alert,
  ScrollView,
} from 'react-native';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import axiosInstance from './axios_config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { BASE_URL } from '../constants/ApiConstants';
import { useSelector, useDispatch } from 'react-redux';
import { sportsServices } from '../services/sportsServices';
import { setGames } from '../redux/actions/actions';
import { CricketPlayerStats } from '../components/PlayerStats';
import FootballPlayerStats from '../components/FootballPlayerStats';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  Extrapolation,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import TopTabPlayer from '../navigation/TopTabPlayer';

const PlayerProfile = ({ route }) => {
  const dispatch = useDispatch();
  const { publicID, from } = route.params;
  const [loading, setLoading] = useState(false);
  const [player, setPlayer] = useState(null);
  const navigation = useNavigation();
  const games = useSelector(state => state.sportReducers.games);
  const game = useSelector(state => state.sportReducers.game);
  const [isOwner, setIsOwner] = useState(false);
  const authProfilePublicID = useSelector(state => state.profile.authProfilePublicID);

  const parentScrollY = useSharedValue(0);
      const bgColor = '#ffffff';   // white
      const bgColor2 = '#f87171'; //red-400
      const headerHeight = 160;
      const collapsedHeader = 50;
      const offsetValue = headerHeight-collapsedHeader;
      const headerStyle = useAnimatedStyle(() => {
        const height = interpolate(
          parentScrollY.value,
          [0, offsetValue],
          [headerHeight, collapsedHeader],
          Extrapolation.CLAMP,
        )
    
        const backgroundColor = interpolateColor(
          parentScrollY.value,
          [0, offsetValue],
          [bgColor2, bgColor2]
        )
        return {
          backgroundColor, height
        }
      })

      // Content container animation
      const contentContainerStyle = useAnimatedStyle(() => {
        const top = interpolate(
          parentScrollY.value,
          [0, offsetValue],
          [headerHeight, collapsedHeader],
          Extrapolation.CLAMP,
        );
      
        return {
          flex: 1,
          marginTop: top,
        };
      });

      // Trophy animation
      const avatarAnimatedStyle = useAnimatedStyle(() => {
        const scale = interpolate(
          parentScrollY.value,
          [0, offsetValue],
          [1, 0.5], // big → small
          Extrapolation.CLAMP,
        );

        const translateY = interpolate(
          parentScrollY.value,
          [0, offsetValue],
          [40, -20], // move up a bit
          Extrapolation.CLAMP,
        );

        const translateX = interpolate(
          parentScrollY.value,
          [0, offsetValue],
          [0, -250],
          Extrapolation.CLAMP,
        );

        return {
          transform: [{ scale }, { translateX }, { translateY }],
        };
      });

      // Text animation
      const nameAnimatedStyles = useAnimatedStyle(() => {
        const scale = interpolate(
          parentScrollY.value,
          [0, offsetValue],
          [1, 0.8],
          Extrapolation.CLAMP,
        );

        const translateY = interpolate(
          parentScrollY.value,
          [0, offsetValue],
          [46, -96],
          Extrapolation.CLAMP,
        );

        const translateX = interpolate(
          parentScrollY.value,
          [0, offsetValue],
          [0, -80], 
          Extrapolation.CLAMP,
        );

        return {
          transform: [{ scale }, { translateX }, { translateY }],
        };
      });
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await sportsServices({ axiosInstance });
        dispatch(setGames(data));
      } catch (error) {
        console.error('Unable to fetch games data: ', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        setLoading(true);
        const authToken = await AsyncStorage.getItem('AccessToken');

        let url =
          from === 'team'
            ? `${BASE_URL}/getPlayer/${publicID}`
            : `${BASE_URL}/getPlayerByProfile/${publicID}`;

        const playerResponse = await axiosInstance.get(url, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (playerResponse.data) {
          setPlayer(playerResponse.data);
        } else {
          setPlayer(null);
        }
      } catch (err) {
        console.error('Failed to get player profile: ', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayer();
  }, []);

  useEffect(() => {
    if (authProfilePublicID === publicID) {
      setIsOwner(true);
    }
  }, []);

  const handleAddActivity = () => {
    if (isOwner) {
      navigation.navigate('CreatePlayerProfile');
    } else {
      Alert.alert('Not allowed to edit');
    }
  };

  if (loading) {
    return (
      <View style={tailwind`flex-1 items-center justify-center`}>
        <ActivityIndicator size="large" color="#ef4444" />
      </View>
    );
  }

  return (
    <View style={tailwind`flex-1 bg-gray-50`}>
      {player ? (
        <>
          {/* Header */}
          <Animated.View
            style={[
              headerStyle,
              {
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 10,
              },
            ]}
          >
            <Pressable
              onPress={() => navigation.goBack()}
              style={tailwind`absolute left-2 top-4`}
            >
              <MaterialIcons name="arrow-back" size={22} color="white" />
            </Pressable>
            <View style={tailwind`items-center`}>
            {player?.media_url ? (
              <Animated.Image
                style={[tailwind`h-20 w-20 rounded-full`, avatarAnimatedStyle]}
                source={{ uri: player.media_url }}
              />
            ) : (
              <Animated.View
                style={[tailwind`h-20 w-20 rounded-full bg-white items-center justify-center shadow-lg`, avatarAnimatedStyle]}
              >
                <Text style={tailwind`text-3xl font-bold text-black`}>
                  {player?.name?.charAt(0).toUpperCase()}
                </Text>
              </Animated.View>
            )}
                <Animated.View style={[tailwind`ml-4`, nameAnimatedStyles]}>
                    <Text
                        style={tailwind`text-xl font-bold text-white`}
                        numberOfLines={1}
                    >
                        {player?.name}
                    </Text>
                    <Text style={tailwind`text-sm text-white`}>
                        {player?.country}
                    </Text>
                </Animated.View>
            </View>
          </Animated.View>
          <Animated.View style={[contentContainerStyle, tailwind`bg-white`]}>
              <TopTabPlayer player={player} parentScrollY={parentScrollY} headerHeight={headerHeight} collapsedHeader={collapsedHeader}/>
          </Animated.View>
        </>
      ) : (
        <View style={tailwind`mx-4 mt-16`}>
          <View
            style={tailwind`bg-white rounded-2xl p-10 shadow-lg items-center justify-center`}
          >
            <TouchableOpacity
              onPress={handleAddActivity}
              activeOpacity={0.8}
              style={tailwind`bg-red-100 p-4 rounded-full mb-4`}
            >
              <AntDesign name="adduser" size={40} color="#ef4444" />
            </TouchableOpacity>
            <Text style={tailwind`text-lg font-semibold text-gray-800`}>
              Add Player Activity
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default PlayerProfile;
