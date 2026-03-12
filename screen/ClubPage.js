import React, {useState} from 'react';
import {View, Text, Pressable, Dimensions, Image} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import Animated, { Extrapolation, interpolate, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import TopTabTeamPage from '../navigation/TopTabTeamPage';
import LinearGradient from 'react-native-linear-gradient';

const ClubPage = ({route}) => {
    const navigation = useNavigation();
    const {teamData, game} = route.params;
    const [nameWidth, setNameWidth] = useState(0);

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

    return (
        <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
            <Animated.View style={[animatedHeader, {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 10,
              overflow: 'hidden',
            }]}>
                {/* LinearGradient background */}
                <LinearGradient
                  colors={['#1e3a5f', '#1e293b']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                />

                <Pressable
                  onPress={() => navigation.goBack()}
                  style={tailwind`absolute left-2 top-4 z-10 p-1`}
                  hitSlop={12}
                >
                  <MaterialIcons name="arrow-back" size={22} color="#e2e8f0" />
                </Pressable>
                <Pressable
                  onPress={() => navigation.navigate('EditClub', { teamData })}
                  style={tailwind`absolute right-2 top-4 z-10 p-1`}
                  hitSlop={12}
                >
                  <MaterialIcons name="edit" size={22} color="#e2e8f0" />
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
                        {teamData.name}
                      </Text>
                  </Animated.View>
                </View>
            </Animated.View>
            <Animated.View style={[{ flex: 1, backgroundColor: '#0f172a' }, contentContainerStyle]}>
                <TopTabTeamPage teamData={teamData} game={game} parentScrollY={parentScrollY} headerHeight={headerHeight} collapsedHeader={collapsedHeader}/>
            </Animated.View>
        </View>
    );
}

export default ClubPage;
