import React, {useState} from 'react';
import {View, Text, Pressable, ScrollView, Image, Dimensions} from 'react-native';
import tailwind from 'twrnc';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { getCricketMatchScore, getMatches } from '../redux/actions/actions';
import { formatToDDMMYY, formattedDate, formattedTime } from '../utils/FormattedDateTime';
import { convertToISOString } from '../utils/FormattedDateTime';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
const filePath = require('../assets/status_code.json');
import { convertBallToOvers } from '../utils/ConvertBallToOvers';
import Animated, {useSharedValue, useAnimatedScrollHandler, useAnimatedStyle, interpolate, Extrapolation} from 'react-native-reanimated';

export const renderInningScore = (scores) => {
    return scores?.map((score, index) => (
      <View key={index} style={tailwind`flex-row`}>
        <Text style={tailwind`ml-2 text-lg text-gray-800`}>
          {score.score}/{score.wickets}
        </Text>
        {score.is_inning_completed === false && (
            <Text style={tailwind`ml-2 text-lg text-gray-800`}>({convertBallToOvers(score.overs)})</Text>
        )}
      </View>
    ));
};
  

const TournamentCricketMatch = ({tournament, AsyncStorage, axiosInstance, BASE_URL, parentScrollY, collapsedHeader}) => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const matches = useSelector((state) => state.matches.matches);
    const game = useSelector(state => state.sportReducers.game);
    const cricketToss = useSelector(state => state.cricketToss.cricketToss)
    const [loading, setLoading] = useState(false);
    console.log("Matches: ", matches)
    const {height: sHeight, width: sWidth} = Dimensions.get("window")

    const currentScrollY = useSharedValue(0);
    const handlerScroll = useAnimatedScrollHandler({
        onScroll:(event) => {
            if(parentScrollY.value === collapsedHeader){
                parentScrollY.value = currentScrollY.value
            } else {
                parentScrollY.value = event.contentOffset.y
            }
        }
    });

    // Content animation style
    const contentStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            parentScrollY.value,
            [0, 50],
            [1, 1],
            Extrapolation.CLAMP
        );

        return {
            opacity
        };
    });

    useFocusEffect(
        React.useCallback(() => {
                fetchTournamentMatchs();
        }, [dispatch])
    );

    const fetchTournamentMatchs = async () => {
        
        try {
            setLoading(true);
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getAllTournamentMatch/${tournament.public_id}`, {
                headers: {
                    'Authorization': `bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            const item = response.data;
            console.log("Item: ", item)
            dispatch(getMatches(item || []))
        } catch (err) {
            console.error("Unable to fetch tournament matches: ", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Animated.ScrollView
            onScroll={handlerScroll}
            scrollEventThrottle={16}
            style={tailwind`flex-1`}
            contentContainerStyle={{paddintTop: 20, paddingBottom:100, minHeight: sHeight+100}}
            showsVerticalScrollIndicator={false}
        >
                <Animated.View style={[tailwind`p-1 bg-white`, contentStyle]}>
                    {matches?.length > 0 ? (
                        matches.map((stage, index) => (
                            <View key={index} style={tailwind`bg-white`}>
                                {Object.keys(stage?.group_stage).length > 0 && 
                                    Object.entries(stage.group_stage).map(([stageName, matchs]) => (
                                        matchesData(matchs, stageName, navigation)
                                    ))
                                }
                                {Object.keys(stage.league_stage).length > 0 && 
                                    Object.entries(stage.league_stage).map(([stageName, matchs]) => (
                                        matchesData(matchs, stageName, navigation)
                                    ))
                                }
                                {Object.keys(stage?.knockout_stage).length > 0 &&
                                    Object.entries(stage.knockout_stage).map(([stageName, matchs]) => (
                                        matches.length > 0 && (
                                            <View key={stageName}>
                                                {matchs.length>0 && (
                                                    <Text style={tailwind`text-lg mb-2`}>{stageName.replace('_', ' ').toLowerCase().split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('')}</Text>
                                                )}
                                                {matchs.map((item, ind) => (
                                                    matchesData(item, ind, navigation)
                                                ))}
                                            </View>
                                        )
                                    ))
                                }
                            </View>
                        ))
                    ) : (
                        <Text style={tailwind`text-center mt-4 text-gray-600`}>Loading matches...</Text>
                    )}
                </Animated.View>
            </Animated.ScrollView>
    );
}

const matchesData = (item, ind, navigation) => {
    const handleCricketMatchPage = (item) => {
        navigation.navigate("CricketMatchPage", {matchPublicID: item.public_id})
    }
    return (
        <Pressable key={ind} 
            style={tailwind`mb-1 p-1 bg-white rounded-lg shadow-md`} 
            onPress={() => handleCricketMatchPage(item)}
        >   
            <View style={tailwind`flex-row items-center justify-between `}>
                <View style={tailwind`flex-row`}>
                    <View style={tailwind``}>
                        <Image 
                            source={{ uri: item.teams.home_team?.media_url }} 
                            style={tailwind`w-6 h-6 bg-violet-200 rounded-full mb-2`} 
                        />
                        <Image 
                            source={{ uri: item.teams.away_team?.media_url }} 
                            style={tailwind`w-6 h-6 bg-violet-200 rounded-full mb-2`} 
                        />
                    </View>
                    <View style={tailwind``}>
                        <Text style={tailwind`ml-2 text-lg text-gray-800`}>
                            {item.teams.home_team?.name}
                        </Text>
                        <Text style={tailwind`ml-2 text-lg text-gray-800`}>
                            {item.teams.away_team?.name}
                        </Text>
                    </View>
                </View>
                <View style={tailwind`items-center justify-center flex-row right-4`}>
                    <View style={tailwind`mb-2 flex-row`}>
                        
                        {item.status !== "not_started" && (
                            <View>
                            <View style={tailwind``}>
                                {item.scores.home_score  && (
                                    <View style={tailwind``}>
                                        <Text>{renderInningScore(item.scores.home_score)}</Text>
                                    </View>
                                )}
                                {item.scores.away_score && (
                                    <View style={tailwind``}>
                                        <Text>{renderInningScore(item.scores.away_score)}</Text>
                                    </View>
                                )}
                            </View>
                            </View>
                        )}
                        <View style={tailwind`w-0.4 h-10 bg-gray-200 left-2`}/>
                        <View style={tailwind`mb-2 ml-4 items-center justify-evenly`}>
                            <Text style={tailwind`text-md text-gray-800`}>
                                {formatToDDMMYY(convertToISOString(item.start_timestamp))}
                            </Text>
                            {item.status !== "not_started" ? (
                                <Text style={tailwind`text-md text-gray-800`}>{item.status}</Text>
                            ) : (
                                <Text style={tailwind`text-md text-gray-800`}>
                                    {formattedTime(convertToISOString(item.start_timestamp))}
                                </Text>
                            )}
                        </View>
                    </View>
                </View>
            </View>
        </Pressable>
    )
}

export default TournamentCricketMatch;