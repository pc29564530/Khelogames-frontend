import React, {useState, useEffect} from 'react';
import {View, Text, Pressable, ScrollView, TouchableOpacity, Dimensions} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import Members from '../components/Members';
import ClubFootballMatch from '../components/ClubFootballMatch';
import ClubCricketMatch from '../components/ClubCricketMatch';
import Stats from '../components/Stats';
import Animated, { Extrapolation, interpolate, interpolateColor, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';                                                                                      


const subCategorys = [ "Members", "Fixture", "Message", "Media"];

const sportPage = (teamData, game) => {
    switch (game) {
        case "cricket":
            return <ClubCricketMatch  teamData={teamData}/>;
        default:
            return <ClubFootballMatch  teamData={teamData}/>;
    }
}

const ClubPage = ({route}) => {
    const navigation = useNavigation();
    const {teamData, game} = route.params;
    const [subCategory, setSubCategory] = useState('');

    const  handleSubCategory = async (item) => {
        setSubCategory(item)
    }
    const rerenderSubCategory = () => {
        switch (subCategory) {
            case "Fixture":
                return sportPage(teamData, game);
            case "Stats":
                return <Stats />;
            default:
                return <Members teamData={teamData} />;
        }
    }

    const { height: sHeight, width: sWidth } = Dimensions.get('screen');

    const scrollY = useSharedValue(0);

    const handleScroll = useAnimatedScrollHandler((e) => {
        scrollY.value = e.contentOffset.y;
      })
    
      const bgColor = 'white'
      const bgColor2 = 'white'
      const headerInitialHeight = 100;
      const headerNextHeight = 50;
      const offsetValue = 100;
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
          [0, 76],
          Extrapolation.CLAMP,
        )
        const translateY = interpolate(
          scrollY.value,
          [0, offsetValue],
          [0, -10],
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
      });

    return (
        <View style={tailwind`flex-1`}>
            <Animated.View style={[tailwind`safe-center shadow-lg`, animatedHeader]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={tailwind`items-start justify-center top-4 px-2`}>
                    <MaterialIcons name="arrow-back" size={22} color="black" />
                </TouchableOpacity>
                <Animated.View style={[tailwind`items-start justify-center `, nameAnimatedStyles]}>
                    <Text style={tailwind`text-xl text-black`}>{teamData.name}</Text>
                </Animated.View>
            </Animated.View>
            <Animated.Image source="" style={[tailwind`w-32 h-32 rounded-full absolute z-10 self-center top-9  bg-red-200`, animImage]}/>
            <Animated.ScrollView 
                onScroll={handleScroll}
                contentContainerStyle={{height: 760}}
                scrollEnabled={true}
                nestedScrollEnabled={true}
            >
                <View style={tailwind`bg-white items-center justify-center pt-16`}>
                    <View >
                        <Text style={tailwind`text-2xl text-black `}>{teamData.name}</Text>
                        <Text style={tailwind`text-xl text-black `}>{teamData.game}</Text>
                    </View>
                </View>
                <View style={tailwind`flex-row mt-1 items-start justify-evenly bg-white `}>
                    {subCategorys.map((item, index) => (
                        <TouchableOpacity key={index} style={[tailwind` rounded-md shadow-lg w-20 h-20 bg-white text-center items-center justify-center `, subCategory === item?tailwind`bg-green-200`:null]} onPress={() => handleSubCategory(item)}>
                            <Text style={tailwind`text-black`}>{item}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <ScrollView>{rerenderSubCategory()}</ScrollView>
            </Animated.ScrollView>                   
        </View>
    );
}

export default ClubPage;