import React, { useState, useEffect } from 'react';
import {
  View, Text, Pressable, Image,
  useWindowDimensions, Modal, TouchableOpacity,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  Extrapolation, interpolate,
  useAnimatedStyle, useSharedValue,
} from 'react-native-reanimated';
import TopTabTeamPage from '../navigation/TopTabTeamPage';
import LinearGradient from 'react-native-linear-gradient';
import axiosInstance from './axios_config';
import { BASE_URL } from '../constants/ApiConstants';

const ClubPage = ({ route }) => {
  const navigation = useNavigation();
  const { teamData, game } = route.params;
  const [nameWidth, setNameWidth] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);
  const [permissions, setPermissions] = useState({can_edit: false});
  const [loading, setLoading] = useState(false);
  const isIndividual = teamData?.type === 'individual';

  const { width: sWidth } = useWindowDimensions();

  const parentScrollY = useSharedValue(0);

  const headerHeight = 200;
  const collapsedHeader = 50;
  const offsetValue = headerHeight - collapsedHeader;

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
    );
    return { height };
  });

  const nameAnimatedStyles = useAnimatedStyle(() => {
    const fontSize = interpolate(
      parentScrollY.value,
      [0, offsetValue],
      [20, 16],
      Extrapolation.CLAMP,
    );

    const avatarCollapsedWidth = 30;
    const safeMargin = 20;
    const leftOffset = backButtonSpace + avatarCollapsedWidth + safeMargin;

    const translateX = interpolate(
      parentScrollY.value,
      [0, offsetValue],
      [
        0,
        -(sWidth / 2) + leftOffset +
          (nameWidth > availableTextSpace ? availableTextSpace / 2 : nameWidth / 2),
      ],
      Extrapolation.CLAMP,
    );

    const translateY = interpolate(
      parentScrollY.value,
      [0, offsetValue],
      [140, 16],
      Extrapolation.CLAMP,
    );

    const maxWidth = interpolate(
      parentScrollY.value,
      [0, offsetValue],
      [sWidth - 32, availableTextSpace],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ translateX }, { translateY }],
      fontSize,
      opacity: 1,
      maxWidth,
    };
  });

  const animImage = useAnimatedStyle(() => {
    const translateY = interpolate(
      parentScrollY.value,
      [0, offsetValue],
      [0, -50],
      Extrapolation.CLAMP,
    );

    const xValue = sWidth / 2 - 2 * 16 - 30;
    const translateX = interpolate(
      parentScrollY.value,
      [0, offsetValue],
      [0, -xValue],
      Extrapolation.CLAMP,
    );

    const scale = interpolate(
      parentScrollY.value,
      [0, offsetValue],
      [1, 0.4],
      Extrapolation.CLAMP,
    );

    return { transform: [{ translateY }, { translateX }, { scale }] };
  });

  const contentContainerStyle = useAnimatedStyle(() => {
    const top = interpolate(
      parentScrollY.value,
      [0, offsetValue],
      [headerHeight, collapsedHeader],
      Extrapolation.CLAMP,
    );
    return { flex: 1, marginTop: top };
  });

    // Check for user permission
    useEffect(() => {
      const checkPermission = async () => {
        setLoading(true);
        try {
          const checkPer = await axiosInstance.get(
            `${BASE_URL}/check-user-permission`,
            {
              params: {
                resource_type: "team",
                resource_public_id: teamData.public_id,
              },
            }
          );
          const res = checkPer.data.data;
          setPermissions(res);
        } catch (err) {
          console.log("Unable to check permission:", err);
        } finally {
          setLoading(false);
        }
      };
      checkPermission();
    }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a' }}>

      {/* ── Collapsing Header ── */}
      <Animated.View style={[animatedHeader, {
        position: 'absolute', top: 0, left: 0, right: 0,
        zIndex: 10, overflow: 'hidden',
      }]}>
        {/* Gradient background */}
        <LinearGradient
          colors={['#1e3a5f', '#1e293b']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />

        {/* Top bar: back ← | → edit + join + gear */}
        <View style={[tailwind`absolute top-4 left-0 right-0 z-10 px-4 flex-row items-center justify-between`]}>
          {/* Back button */}
          <Pressable
            onPress={() => navigation.goBack()}
            style={tailwind`p-1`}
            hitSlop={12}
          >
            <MaterialIcons name="arrow-back" size={22} color="#e2e8f0" />
          </Pressable>

          {/* Right-side actions */}
          <View style={tailwind`flex-row items-center gap-x-2`}>

            {/* Join — for non-members */}
            <Pressable
              onPress={() => navigation.navigate('RequestJoinTeam', { team: teamData })}
              style={[tailwind`flex-row items-center px-3 py-1.5 rounded-xl`,
                { backgroundColor: '#f87171' }]}
              hitSlop={8}
            >
              <MaterialIcons name="group-add" size={16} color="white" />
              <Text style={{ color: 'white', fontSize: 12, fontWeight: '700', marginLeft: 4 }}>
                Join
              </Text>
            </Pressable>
            
            {/* Edit Team */}
            {permissions?.can_edit && (
              <Pressable
                onPress={() => navigation.navigate('EditClub', { teamData })}
                style={tailwind`p-1.5`}
                hitSlop={12}
              >
                <MaterialIcons name="edit" size={22} color="#e2e8f0" />
              </Pressable>
            )}
          </View>
        </View>

        {/* Avatar + name */}
        <View style={tailwind`items-center`}>
          <Animated.View
            style={[{
              width: 88, height: 88, borderRadius: 44,
              position: 'absolute', zIndex: 10,
              alignSelf: 'center', top: 36,
              backgroundColor: '#334155',
              alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
              borderWidth: 2, borderColor: '#475569',
            }, animImage]}
          >
            {teamData.media_url ? (
              <Image
                source={{ uri: teamData.media_url }}
                style={tailwind`w-full h-full`}
                resizeMode="cover"
              />
            ) : (
              <Text style={{ color: '#f87171', fontSize: 30, fontWeight: 'bold' }}>
                {teamData?.name?.charAt(0).toUpperCase()}
              </Text>
            )}
          </Animated.View>

          <Animated.View
            onLayout={(e) => setNameWidth(e.nativeEvent.layout.width)}
            style={[{ alignItems: 'center', justifyContent: 'center' }, nameAnimatedStyles]}
          >
            <Text
              style={[tailwind`text-xl font-bold`, { color: '#f1f5f9' }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {teamData.name}
            </Text>
            {isIndividual && teamData?.country ? (
              <Text style={[tailwind`text-xs mt-1`, { color: '#94a3b8' }]}>
                {teamData.country}
              </Text>
            ) : null}
          </Animated.View>
        </View>
      </Animated.View>
      <Animated.View style={[{ flex: 1, backgroundColor: '#0f172a' }, contentContainerStyle]}>
        <TopTabTeamPage
          teamData={teamData}
          game={game}
          parentScrollY={parentScrollY}
          headerHeight={headerHeight}
          collapsedHeader={collapsedHeader}
        />
      </Animated.View>

    </View>
  );
};

export default ClubPage;
