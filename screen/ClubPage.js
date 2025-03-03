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
import TopTabTeamPage from '../navigation/TopTabTeamPage';


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
    
      const bgColor = tailwind.color('bg-red-400')
      const bgColor2 = tailwind.color('bg-red-400')
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
            <Animated.View style={[tailwind`safe-center shadow-lg bg-red-400`, animatedHeader]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={tailwind`items-start justify-center top-4 px-2`}>
                    <MaterialIcons name="arrow-back" size={22} color="white" />
                </TouchableOpacity>
                <Animated.View style={[tailwind`items-start justify-center bg-red-400`, nameAnimatedStyles]}>
                    <Text style={tailwind`text-xl text-white`}>{teamData.name}</Text>
                </Animated.View>
            </Animated.View>
            <Animated.Image source="" style={[tailwind`w-32 h-32 rounded-full absolute z-10 self-center top-9  bg-red-200`, animImage]}/>
            <Animated.ScrollView 
                onScroll={handleScroll}
                contentContainerStyle={{height: 760}}
                scrollEnabled={true}
                style={tailwind`bg-red-400`}
            >
                <View style={tailwind`bg-white items-center justify-center pt-16 bg-red-400`}>
                    <View >
                        <Text style={tailwind`text-2xl text-white `}>{teamData.name}</Text>
                        <Text style={tailwind`text-xl text-white `}>{teamData.game}</Text>
                    </View>
                </View>
                <View style={tailwind`flex-1`}>
                    <TopTabTeamPage teamData={teamData} game={game}/>
                </View>
            </Animated.ScrollView>                   
        </View>
    );
}

export default ClubPage;