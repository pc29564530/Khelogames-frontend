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
import { Dimensions } from 'react-native';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import axiosInstance from './axios_config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/ApiConstants';
import { useSelector, useDispatch } from 'react-redux';
import { sportsServices } from '../services/sportsServices';
import { setGames } from '../redux/actions/actions';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
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
  const [nameWidth, setNameWidth] = useState(0);
  const navigation = useNavigation();
  const games = useSelector(state => state.sportReducers.games);
  const game = useSelector(state => state.sportReducers.game);
  const [isOwner, setIsOwner] = useState(false);
  const [error, setError] = useState({
    global: null,
    fields: {}
  });

  const authProfilePublicID = useSelector(state => state.profile.authProfilePublicID);

  const { height: sHeight, width: sWidth } = Dimensions.get('screen');
  
  const parentScrollY = useSharedValue(0);

  const headerHeight = 180;
  const collapsedHeader = 50;
  const offsetValue = headerHeight - collapsedHeader;

  // Calculate available space for text in collapsed state
  const avatarCollapsedSize = 32;
  const backButtonSpace = 38;
  const rightPadding = 12;
  const availableTextSpace = sWidth - backButtonSpace - avatarCollapsedSize - rightPadding;

  const animatedHeader = useAnimatedStyle(() => {
    const height = interpolate(
      parentScrollY.value,
      [0, offsetValue],
      [headerHeight, collapsedHeader],
      Extrapolation.CLAMP,
    )
    return { height }
  })

  const nameAnimatedStyles = useAnimatedStyle(() => {
    const opacity = interpolate(
      parentScrollY.value,
      [0, offsetValue],
      [1, 1],
      Extrapolation.CLAMP,
    )

    const fontSize = interpolate(
      parentScrollY.value,
      [0, offsetValue],
      [20, 16],
      Extrapolation.CLAMP
    );

    const avatarCollapsedWidth = 32;
    const safeMargin = 8;
    const leftOffset = backButtonSpace + avatarCollapsedWidth + safeMargin;

    const translateX = interpolate(
      parentScrollY.value,
      [0, offsetValue],
      [0, -(sWidth / 2) + leftOffset + (nameWidth > availableTextSpace ? availableTextSpace / 2 : nameWidth / 2)],
      Extrapolation.CLAMP,
    )

    const translateY = interpolate(
      parentScrollY.value,
      [0, offsetValue],
      [140, 12],
      Extrapolation.CLAMP,
    )

    const maxWidth = interpolate(
      parentScrollY.value,
      [0, offsetValue],
      [sWidth - 32, availableTextSpace],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ translateX }, { translateY }],
      fontSize,
      opacity,
      maxWidth
    }
  })

  const animImage = useAnimatedStyle(() => {
    const translateY = interpolate(
      parentScrollY.value,
      [0, offsetValue],
      [0, -56],
      Extrapolation.CLAMP,
    )

    const xValue = sWidth / 2 - (2 * 16) - 20;
    const translateX = interpolate(
      parentScrollY.value,
      [0, offsetValue],
      [0, -xValue],
      Extrapolation.CLAMP,
    )

    const scale = interpolate(
      parentScrollY.value,
      [0, offsetValue],
      [1, 0.40],
      Extrapolation.CLAMP,
    )
    return {
      transform: [{ translateY }, { translateX }, { scale }]
    }
  });

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

        const response = await axiosInstance.get(url, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.data.success && response.data.data) {
          setPlayer(response.data.data);
        } else if(response.data.success && response.data.data === null) {
          if(authProfilePublicID === publicID) {
            navigation.navigate("CreatePlayerProfile")
          }
        }
      } catch (err) {
        setError({
          global: "Unable to get player profile",
          fields: {},
        })
        console.error('Failed to get player profile: ', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayer();
  }, []);

  if (loading) {
    return (
      <View style={tailwind`flex-1 items-center justify-center`}>
        <ActivityIndicator size="large" color="#ef4444" />
      </View>
    );
  }

  return (
    <View style={[tailwind`flex-1`, {backgroundColor: '#0f172a'}]}>
          {/* Header */}
          <Animated.View
            style={[
              animatedHeader,
              {
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 10,
              },
            ]}
          >
            <LinearGradient
              colors={['#1e3a5f', '#1e293b']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />
            <Pressable
              onPress={() => navigation.goBack()}
              style={tailwind`absolute left-2 top-4`}
            >
              <MaterialIcons name="arrow-back" size={22} color="white" />
            </Pressable>
            <View style={tailwind`items-center`}>
                  <Animated.View
                    style={[
                      {
                        width: 88,
                        height: 88,
                        borderRadius: 44,
                        position: 'absolute',
                        zIndex: 10,
                        alignSelf: 'center',
                        top: 36,
                        backgroundColor: '#334155',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        borderWidth: 2,
                        borderColor: '#475569',
                      },
                      animImage,
                    ]}
                  >
                    {player?.media_url ? (
                      <Image
                        source={{ uri: player?.media_url }}
                        style={tailwind`w-full h-full`}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={{ color: '#f87171', fontSize: 30, fontWeight: 'bold' }}>
                        {player?.name?.charAt(0).toUpperCase()}
                      </Text>
                    )}
                  </Animated.View>
                  <Animated.View
                    onLayout={(e) => {
                      setNameWidth(e.nativeEvent.layout.width)
                    }}
                    style={[{ alignItems: 'center', justifyContent: 'center' }, nameAnimatedStyles]}
                  >
                      <Text
                        style={[tailwind`text-xl font-bold`, { color: '#f1f5f9' }]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {player?.name}
                      </Text>
                  </Animated.View>
                </View>
          </Animated.View>
          <Animated.View style={[{ flex: 1, backgroundColor: '#0f172a' }, contentContainerStyle]}>
              <TopTabPlayer player={player} parentScrollY={parentScrollY} headerHeight={headerHeight} collapsedHeader={collapsedHeader}/>
          </Animated.View>
    </View>
  );
};

export default PlayerProfile;
