import React, { useEffect } from 'react';
import { View, Text, Pressable, Platform,Dimensions, ScrollView, TextInput } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { TopTabFootball } from '../navigation/TopTabFootball';
import TopTabCricket from '../navigation/TopTabCricket';
import { useSelector } from 'react-redux';
import Animated, { Extrapolation, interpolate, interpolateColor, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
const trophyPath = require('../assets/trophy.png')

const TournamentPage = ({ route }) => {
    const { tournament, currentRole } = route.params;
    const game = useSelector(state => state.sportReducers.game);
    const navigation = useNavigation();
    const { height: sHeight, width: sWidth } = Dimensions.get('screen');

    const checkSport = (game) => {
        switch (game.name) {
            case "badminton":
                return <TopTabBadminton />;
            case "cricket":
                return <TopTabCricket tournament={tournament} currentRole={currentRole}/>;
            case "hockey":
                return <TopTabHockey />;
            case "tennis":
                return <TopTabBTennis />;
            default:
                return <TopTabFootball tournament={tournament} currentRole={currentRole}/>;
        }
    }


    const scrollY = useSharedValue(0);

    const handleScroll = useAnimatedScrollHandler((e) => {
        scrollY.value = e.contentOffset.y;
      })
    
      const bgColor = 'white'
      const bgColor2 = 'white'
      const offsetValue = 100;
      const headerInitialHeight = 100;
      const headerNextHeight = 50;
      const animatedHeader = useAnimatedStyle(() => {
        const height = interpolate(
          scrollY.value,
          [0, offsetValue],
          [headerInitialHeight, headerNextHeight],
          Extrapolation.CLAMP,
        )
    
        const backgroundColor = interpolateColor(
          scrollY.value,
          [0, offsetValue],
          [bgColor, bgColor2]
        )
        return {
          backgroundColor, height
        }
      })
      const nameAnimatedStyles = useAnimatedStyle(() => {
        const opacity = interpolate(
          scrollY.value,
          [0, 100, offsetValue],
          [0, 1, 1],
          Extrapolation.CLAMP,
        )
        const translateX = interpolate(
          scrollY.value,
          [0, offsetValue],
          [0,46],
          Extrapolation.CLAMP,
        )
        const translateY = interpolate(
          scrollY.value,
          [0, offsetValue],
          [0, 16],
          Extrapolation.CLAMP,
        )
        return { opacity, transform: [{ translateX }, { translateY }] }
      })
      const animImage = useAnimatedStyle(() => {
        const yValue = 75;
        const translateY = interpolate(
          scrollY.value,
          [0, offsetValue],
          [0, -yValue],
          Extrapolation.CLAMP,
        )
    
        const xValue = sWidth / 2 - (2 * 16) - 20;
        const translateX = interpolate(
          scrollY.value,
          [0, offsetValue],
          [0, -xValue],
          Extrapolation.CLAMP,
        )
    
        const scale = interpolate(
          scrollY.value,
          [0, offsetValue],
          [1, 0.3],
          Extrapolation.CLAMP,
        )
        return {
          transform: [{ translateY }, { translateX }, { scale }]
        }
      })


    return (
        <View style={tailwind`flex-1`}>
            <View style={tailwind`bg-red-400`}>
              <Pressable onPress={() => navigation.goBack()} style={tailwind`p-1 pt-4`}>
                    <MaterialIcons name="arrow-back" size={22} color="white" />
                </Pressable>
                <View style={tailwind`items-center -top-6`}>
                  <FontAwesome name="trophy" size={52} color="gold"/>
                    <Text style={tailwind`text-xl text-white`}>{tournament.name}</Text>
                </View>
            </View>
            <View style={tailwind`flex-1`}>
                {checkSport(game)}
            </View>
        </View>
    );
}

export default TournamentPage;
