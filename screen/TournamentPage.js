import React from 'react';
import { View, Text, Pressable, Platform,Dimensions, ScrollView, TextInput } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { TopTabFootball } from '../navigation/TopTabFootball';
import TopTabCricket from '../navigation/TopTabCricket';
import { useSelector } from 'react-redux';
import Animated, { Extrapolation, interpolate, interpolateColor, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

const TournamentPage = ({ route }) => {
    const { tournament, currentRole } = route.params;
    const game = useSelector(state => state.sportReducers.game);
    console.log("Game: ", game)
    const navigation = useNavigation();
    const { height: sHeight, width: sWidth } = Dimensions.get('screen');

    const checkSport = (game) => {
        console.log("Line no 20: ", game)
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
    
      const bgColor = 'blue'
      const bgColor2 = 'white'
      const offsetValue = 140;
      const animatedHeader = useAnimatedStyle(() => {
        const headerInitialHeight = 50;
        const headerNextHeight = 80;
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
          [0, 0, 1],
          Extrapolation.CLAMP,
        )
        const translateX = interpolate(
          scrollY.value,
          [0, offsetValue],
          [-28, 0],
          Extrapolation.CLAMP,
        )
        const translateY = interpolate(
          scrollY.value,
          [0, offsetValue],
          [28, 0],
          Extrapolation.CLAMP,
        )
        return { opacity, transform: [{ translateX }, { translateY }] }
      })
      const animImage = useAnimatedStyle(() => {
        const yValue = 45;
        const translateY = interpolate(
          scrollY.value,
          [0, offsetValue],
          [0, -yValue],
          Extrapolation.CLAMP,
        )
    
        const xValue = sWidth / 2 - (2 * 16) - 40;
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
        <View style={tailwind``}>
            <Animated.View style={[tailwind`flex-row items-center`, animatedHeader]}>
                <Pressable onPress={() => navigation.goBack()} style={tailwind`p-2`}>
                    <MaterialIcons name="arrow-back" size={22} color="black" />
                </Pressable>
                <Animated.View style={[tailwind`ml-2`, nameAnimatedStyles]}>
                    <FontAwesome name="trophy" size={22} color="gold" />
                </Animated.View>
                <Animated.View style={[tailwind`ml-2`, nameAnimatedStyles]}>
                    <Text style={[tailwind`text-xl font-bold text-red-300`]}>
                        {tournament?.name}
                    </Text>
                </Animated.View>
            </Animated.View>
            <Animated.ScrollView
                onScroll={handleScroll}
                contentContainerStyle={{
                    padding: 4,
                    minHeight: 912,
                }}
                scrollEnabled={true}
            >
                <View style={tailwind`flex-1`}>
                    <View style={tailwind`justify-center items-center p-10`}>
                        <View style={tailwind`border rounded-full h-20 w-20 bg-red-400 items-center justify-center`}>
                            <Text style={tailwind`text-2xl`}>{tournament?.displayText}</Text>
                        </View>
                        <View style={tailwind`mt-2`}>
                            <Text style={tailwind`text-xl`}>{tournament?.name}</Text>
                        </View>
                        <View style={tailwind`flex-row gap-2`}>
                            <Text style={tailwind`text-lg`}>Teams: {tournament?.teams_joined}</Text>
                            <Text style={tailwind`text-lg`}>|</Text>
                            <Text style={tailwind`text-lg`}>{game.name}</Text>
                        </View>
                    </View>
                    <View style={tailwind`flex-1`}>
                        {checkSport(game)}
                    </View>
                </View>
            </Animated.ScrollView>
        </View>
    );
}

export default TournamentPage;
