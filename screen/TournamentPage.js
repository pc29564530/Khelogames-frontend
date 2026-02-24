import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Platform,Dimensions, ScrollView, TextInput } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { TopTabFootball } from '../navigation/TopTabFootball';
import TopTabCricket from '../navigation/TopTabCricket';
import { useSelector } from 'react-redux';
import Animated, { Extrapolation, interpolate, interpolateColor, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { current } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './axios_config';
import { BASE_URL } from '../constants/ApiConstants';

const TournamentPage = ({ route }) => {
      const { tournament } = route.params;
      const [showRoleModal, setShowRoleModal] = useState(false);
      const game = useSelector(state => state.sportReducers.game);
      const authProfile = useSelector(state => state.profile.authProfile)
      const navigation = useNavigation();
      const { height: sHeight, width: sWidth } = Dimensions.get('screen');

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
      const trophyStyle = useAnimatedStyle(() => {
        const scale = interpolate(
          parentScrollY.value,
          [0, offsetValue],
          [1, 0.5], // big → small
          Extrapolation.CLAMP,
        );

        const translateY = interpolate(
          parentScrollY.value,
          [0, offsetValue],
          [50, -3], // move up a bit
          Extrapolation.CLAMP,
        );

        const translateX = interpolate(
          parentScrollY.value,
          [0, offsetValue],
          [0, -260],
          Extrapolation.CLAMP,
        );

        return {
          transform: [{ scale }, { translateX }, { translateY }],
        };
      });

      // Text animation
      const titleStyle = useAnimatedStyle(() => {
        const scale = interpolate(
          parentScrollY.value,
          [0, offsetValue],
          [1, 0.8],
          Extrapolation.CLAMP,
        );

        const translateY = interpolate(
          parentScrollY.value,
          [0, offsetValue],
          [60, -56],
          Extrapolation.CLAMP,
        );

        const translateX = interpolate(
          parentScrollY.value,
          [0, offsetValue],
          [0, -100], 
          Extrapolation.CLAMP,
        );

        return {
          transform: [{ scale }, { translateX }, { translateY }],
        };
      });

      const checkSport = (game) => {
        console.log("Game: ", game)
        switch (game.name) {
            case "badminton":
                return <TopTabBadminton />;
            case "cricket":
                return <TopTabCricket tournament={tournament} currentRole={currentRole} parentScrollY={parentScrollY} headerHeight={headerHeight} collapsedHeader={collapsedHeader}/>;
            case "hockey":
                return <TopTabHockey />;
            case "tennis":
                return <TopTabBTennis />;
            default:
                return <TopTabFootball tournament={tournament} currentRole={currentRole} parentScrollY={parentScrollY} headerHeight={headerHeight} collapsedHeader={collapsedHeader}/>;
        }
    }

    const handleNavigation = () => {
        if (tournament?.profile?.public_id === authProfile?.public_id) {
          navigation.navigate("MessagePage")
        } else {
          navigation.navigate("Message", {recrecipientProfile: tournament.profile})
        }
    }

    return (
        <View style={tailwind`flex-1`}>
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
              style={tailwind`absolute left-3 top-2 p-1.5`}
              hitSlop={12}
            >
              <MaterialIcons name="arrow-back" size={22} color="white" />
            </Pressable>

            {/* Trophy + Title animated separately */}
            <View style={tailwind`items-center`}>
              <Animated.View style={trophyStyle}>
                <FontAwesome name="trophy" size={56} color="white" />
              </Animated.View>
              <Animated.View style={titleStyle}>
                <Text style={tailwind`text-xl text-white`}>
                  {tournament.name}
                </Text>
              </Animated.View>
            </View>
            <View style={tailwind`absolute right-2 top-2 flex-row items-center`}>
              <Pressable
                onPress={() => handleNavigation()}
                style={tailwind`p-1.5 mr-1`}
                hitSlop={8}
              >
                <MaterialIcons name="message" size={22} color="white" />
              </Pressable>
              {(authProfile.public_id === tournament.profile.public_id) && (
                <Pressable
                  onPress={() => navigation.navigate("ManageRole", {tournament: tournament})}
                  style={tailwind`p-1.5`}
                  hitSlop={8}
                >
                  <MaterialIcons name="settings" size={22} color="white" />
                </Pressable>
              )}
            </View>
          </Animated.View>
          <Animated.View style={[contentContainerStyle, tailwind`bg-white`]}>
            {checkSport(game)}
          </Animated.View>
        </View>
    );
}

export default TournamentPage;
