import React, {useState, useEffect} from 'react';
import {View, Text, Pressable, ScrollView, TouchableOpacity, Dimensions, Image} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import Animated, { Extrapolation, interpolate, interpolateColor, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import TopTabTeamPage from '../navigation/TopTabTeamPage';

const ClubPage = ({route}) => {
    const navigation = useNavigation();
    const {teamData, game} = route.params;
    const [nameWidth, setNameWidth] = useState(0);

    const { height: sHeight, width: sWidth } = Dimensions.get('screen');

    const parentScrollY = useSharedValue(0);

    const bgColor = tailwind.color('bg-red-400')
    const bgColor2 = tailwind.color('bg-red-400')
    const headerHeight = 180;
    const collapsedHeader = 50;
    const offsetValue = headerHeight-collapsedHeader;

    // Calculate available space for text in collapsed state
    const avatarCollapsedSize = 32;
    const backButtonSpace = 38;
    const rightPadding = 12;
    const availableTextSpace = sWidth - backButtonSpace - avatarCollapsedSize - rightPadding

    const animatedHeader = useAnimatedStyle(() => {
      const height = interpolate(
        parentScrollY.value,
        [0, offsetValue],
        [headerHeight, collapsedHeader],
        Extrapolation.CLAMP,
      )

      const backgroundColor = interpolateColor(
        parentScrollY.value,
        [0, offsetValue],
        [bgColor, bgColor2]
      )
      return {
        backgroundColor, height
      }
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

      const color = interpolateColor(
        parentScrollY.value,
        [0, offsetValue],
        ['red', 'red'],
      );

      return {
        flex: 1,
        marginTop: top,
        color: color,
      };
    });

    return (
        <View style={tailwind`flex-1`}>
            <Animated.View style={[animatedHeader, {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 10,
            }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={tailwind`absolute left-2 top-4`}>
                  <MaterialIcons name="arrow-back" size={22} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate('EditClub', { teamData })}
                  style={tailwind`absolute right-2 top-4`}
                >
                  <MaterialIcons name="edit" size={22} color="white" />
                </TouchableOpacity>
                <View style={tailwind`items-center`}>
                  <Animated.View
                    style={[tailwind`w-22 h-22 rounded-full absolute z-10 self-center top-9 bg-white items-center justify-center overflow-hidden`, animImage]}
                  >
                    {teamData.media_url ? (
                      <Image
                        source={{ uri: teamData.media_url }}
                        style={tailwind`w-full h-full`}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={tailwind`text-red-400 text-3xl font-bold`}>
                        {teamData?.name?.charAt(0).toUpperCase()}
                      </Text>
                    )}
                  </Animated.View>
                  <Animated.View
                    onLayout={(e) => {
                      setNameWidth(e.nativeEvent.layout.width)
                    }}
                  style={[tailwind`items-center justify-center bg-red-400`, nameAnimatedStyles]}>
                      <Text
                        style={tailwind`text-xl text-white`}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {teamData.name}
                      </Text>
                  </Animated.View>
                </View>
            </Animated.View>
            <Animated.View style={[tailwind`flex-1`, contentContainerStyle]}>
                <TopTabTeamPage teamData={teamData} game={game} parentScrollY={parentScrollY} headerHeight={headerHeight} collapsedHeader={collapsedHeader}/>
            </Animated.View>
        </View>
    );
}

export default ClubPage;
