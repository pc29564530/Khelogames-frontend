import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import { View, Text, Pressable, Image, Modal, ScrollView} from 'react-native';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from '../screen/axios_config';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FootballMatchPageContent from '../navigation/FootballMatchPageContent';
import { formattedTime } from '../utils/FormattedDateTime';
import { formattedDate } from '../utils/FormattedDateTime';
import { convertToISOString } from '../utils/FormattedDateTime';

const FootballMatchPage = ({route}) => {
    const matchData = route.params.matchData;
    const [isDropDownVisible, setIsDropDownVisible] = useState(false);
    const [tournamentName, setTournamentName] = useState();
    const axiosInstance = useAxiosInterceptor();
    return (
        <View style={tailwind`flex-1 mt-2`}>
            <View style={tailwind` h-45 bg-black flex-row items-center justify-center gap-10`}>
                <View>
                    <Text style={tailwind`text-white text-2xl`}>{matchData.homeTeam.name}</Text>
                    {(matchData.status !== "not_started") && (
                        <View style={tailwind`flex-row`}>
                            <Text style={tailwind`text-white text-2xl`}>{matchData?.homeScore.score}</Text>
                        </View>
                    )}
                </View>
                <View style={tailwind`border-l-2 border-white h-20`} />
                <View>
                    <Text style={tailwind`text-white text-2xl`}>{matchData.awayTeam.name}</Text>
                    {(matchData.status !== "not_started") && (
                        <View style={tailwind`flex-row`}>
                            <Text style={tailwind`text-white text-2xl`}>{matchData?.awayScore.score}</Text>
                        </View>
                    )}
                </View>
                <View>
                    {matchData.status === "not_started" && (
                        <View>
                            <View style={tailwind``}>
                                <Text style={tailwind`text-white`}>{formattedDate(convertToISOString(matchData.startTimeStamp))}</Text>
                            </View>
                            <View style={tailwind``}>
                                <Text style={tailwind`text-white`}>{formattedTime(convertToISOString(matchData.startTimeStamp))}</Text>
                            </View>
                        </View>
                    )}
                </View>
            </View>
            <FootballMatchPageContent matchData={matchData}/>
        </View>
    );
}

export default FootballMatchPage;