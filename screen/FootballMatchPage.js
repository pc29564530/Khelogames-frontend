import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import { View, Text, Pressable, Image, Modal, ScrollView} from 'react-native';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from '../screen/axios_config';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FootballMatchPageContent from '../navigation/FootballMatchPageContent';

const FootballMatchPage = ({route}) => {
    const {matchData, determineMatchStatus, formattedDate, formattedTime} = route.params;
    const [match, setMatch] = useState([]);
    // if(matchData) {
    //     setMatch(matchData);
    // }
    const [isDropDownVisible, setIsDropDownVisible] = useState(false);
    const [tournamentName, setTournamentName] = useState();
    const axiosInstance = useAxiosInterceptor();
    const navigation = useNavigation();
    console.log("Line no 20: ", matchData)
   
    return (
        <View style={tailwind`flex-1 mt-2`}>
            <View style={tailwind` h-45 bg-black flex-row items-center justify-center gap-10`}>
                <View>
                    <Text style={tailwind`text-white text-2xl`}>{matchData.team1_name}</Text>
                    {(determineMatchStatus(matchData) === "Live" || determineMatchStatus(matchData) === "End") && (
                        <View style={tailwind`flex-row`}>
                            <Text style={tailwind`text-white text-2xl`}>{matchData?.team1_score}</Text>
                        </View>
                    )}
                </View>
                <View style={tailwind`border-l-2 border-white h-20`} />
                <View>
                    <Text style={tailwind`text-white text-2xl`}>{matchData.team2_name}</Text>
                    {(determineMatchStatus(matchData) === "Live" || determineMatchStatus(matchData) === "End") && (
                        <View style={tailwind`flex-row`}>
                            <Text style={tailwind`text-white text-2xl`}>{matchData?.team2_score}</Text>
                        </View>
                    )}
                </View>
                <View>
                    {determineMatchStatus(matchData) === "Not Started" && (
                        <View style={tailwind`flex-1`}>
                            <Text style={tailwind`text-black text-2xl`}>{formattedDate(matchData?.date_on)}</Text>
                            <Text style={tailwind`text-black`}>{formattedTime(matchData.start_time)}</Text>
                        </View>
                    )}
                </View>
            </View>
            <FootballMatchPageContent matchData={matchData}/>
        </View>
    );
}

export default FootballMatchPage;