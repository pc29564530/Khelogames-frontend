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

      const parentScrollY = useSharedValue(0);
    
      const bgColor = tailwind.color('bg-red-400')
      const bgColor2 = tailwind.color('bg-red-400')
      const headerHeight = 220;
      const collapsedHeader = 50;
      const offsetValue = headerHeight-collapsedHeader;
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
          [0, 1],
          Extrapolation.CLAMP,
        )
        const translateX = interpolate(
          parentScrollY.value,
          [0, offsetValue],
          [0, -60],
          Extrapolation.CLAMP,
        )
        const translateY = interpolate(
          parentScrollY.value,
          [0, offsetValue],
          [180, 12],
          Extrapolation.CLAMP,
        )
        return { transform: [{ translateX }, { translateY }] }
      })
      const animImage = useAnimatedStyle(() => {
        const translateY = interpolate(
          parentScrollY.value,
          [0, offsetValue],
          [0, -72],
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
          [1, 0.25],
          Extrapolation.CLAMP,
        )
        return {
          transform: [{ translateY }, { translateX }, { scale }]
        }
      });

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
                <View style={tailwind`items-center`}>
                  <Animated.Image source="" style={[tailwind`w-32 h-32 rounded-full absolute z-10 self-center top-9  bg-red-200`, animImage]}/>
                  <Animated.View style={[tailwind`items-center justify-center bg-red-400`, nameAnimatedStyles]}>
                      <Text style={tailwind`text-xl text-white`}>{teamData.name}</Text>
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