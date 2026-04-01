import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Platform, Dimensions, ScrollView, TextInput } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { TopTabFootball } from '../navigation/TopTabFootball';
import TopTabCricket from '../navigation/TopTabCricket';
import TopTabBadminton from '../navigation/TopTabBadminton';
import { useSelector } from 'react-redux';
import Animated, { Extrapolation, interpolate, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';

const TournamentPage = ({ route }) => {
      const { tournament, currentRole } = route.params;
      const [showRoleModal, setShowRoleModal] = useState(false);
      const [error, setError] = useState({
        global: null,
        fields: {}
      });
      const game = useSelector(state => state.sportReducers.game);
      const authProfile = useSelector(state => state.profile.authProfile)
      const navigation = useNavigation();
      const { height: sHeight, width: sWidth } = Dimensions.get('screen');

      const parentScrollY = useSharedValue(0);
      const bgColor = '#0f172a';   // dark navy
      const bgColor2 = '#1e293b'; //red-400
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
        return { height }
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

      // Trophy icon — fades out and shrinks as header collapses
      const trophyStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
          parentScrollY.value,
          [0, offsetValue * 0.6],
          [1, 0],
          Extrapolation.CLAMP,
        );
        const scale = interpolate(
          parentScrollY.value,
          [0, offsetValue * 0.6],
          [1, 0.3],
          Extrapolation.CLAMP,
        );
        return { opacity, transform: [{ scale }] };
      });

      // Title — left-anchored, font shrinks on collapse
      const titleStyle = useAnimatedStyle(() => {
        const fontSize = interpolate(
          parentScrollY.value,
          [0, offsetValue],
          [18, 18],
          Extrapolation.CLAMP,
        );
        return { fontSize };
      });

      const checkSport = (game) => {
        switch (game.name) {
            case "badminton":
                return <TopTabBadminton tournament={tournament} parentScrollY={parentScrollY} headerHeight={headerHeight} collapsedHeader={collapsedHeader} />;
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

    console.log("AuthProfile: ", authProfile)
    console.log("TournamentProfile: ", tournament)

    return (
        <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
          <Animated.View
            style={[
              headerStyle,
              {
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 10,
                overflow: 'hidden',
              },
            ]}
          >
            {/* LinearGradient background */}
            <LinearGradient
              colors={['#1e3a5f', '#1e293b']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />

            {/* Top bar: [Back] [Title] [Icons] — always visible */}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingTop: 8, height: collapsedHeader, zIndex: 10 }}>
              <Pressable
                onPress={() => navigation.goBack()}
                style={tailwind`p-1.5`}
                hitSlop={12}
              >
                <MaterialIcons name="arrow-back" size={22} color="#e2e8f0" />
              </Pressable>

              {/* Title — left-anchored, bounded by flex between back & icons */}
              <Animated.Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[
                  titleStyle,
                  { flex: 1, color: '#f1f5f9', fontWeight: 'bold', marginHorizontal: 10 },
                ]}
              >
                {tournament.name}
              </Animated.Text>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Pressable
                  onPress={() => handleNavigation()}
                  style={tailwind`p-1.5 mr-1`}
                  hitSlop={8}
                >
                  <MaterialIcons name="message" size={22} color="#e2e8f0" />
                </Pressable>
                {(authProfile?.public_id === tournament?.profile?.public_id) && (
                  <Pressable
                    onPress={() => navigation.navigate("ManageRole", {tournament: tournament})}
                    style={tailwind`p-1.5`}
                    hitSlop={8}
                  >
                    <MaterialIcons name="settings" size={22} color="#e2e8f0" />
                  </Pressable>
                )}
              </View>
            </View>

            {/* Trophy — centered below top bar, fades away on collapse */}
            <Animated.View style={[trophyStyle, { alignItems: 'center', justifyContent: 'center', flex: 1 }]}>
              <FontAwesome name="trophy" size={52} color="#f87171" />
            </Animated.View>
          </Animated.View>
          <Animated.View style={[contentContainerStyle, { backgroundColor: '#0f172a' }]}>
            {checkSport(game)}
          </Animated.View>
        </View>
    );
}

export default TournamentPage;
