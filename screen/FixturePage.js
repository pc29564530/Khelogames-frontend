// import AsyncStorage from '@react-native-async-storage/async-storage';
// import React, { useEffect, useState } from 'react';
// import {View, Text} from 'react-native';
// import { BASE_URL } from '../constants/ApiConstants';
// import useAxiosInterceptor from './axios_config';
// import tailwind from 'twrnc';
// import TopTabCricketMatchPage from '../navigation/TopTabCricketMatchPage';

// const FixturePage = ({matchData}) => {
//     const [teamScoreBatting, setTeamScoreBatting] = useState([]);
//     const [teamBowling, setTeamBowling] = useState([]);
//     const [data, setData] = useState([]);
//     //const matchData = route.params.matchData;
//     const axiosInstance = useAxiosInterceptor();
//     console.log("Line no 15 ", matchData)

//     useEffect(() => {
//         const fetchPlayerScore = async () => {
//             try {
//                 const data = {
//                     match_id:matchData.match_id,
//                     tournament_id:matchData.tournament_id,
//                     team_id:matchData.team1_id
//                 }
//                 console.log("line no 21: ", data)
//                 const authToken = await AsyncStorage.getItem('AccessToken');
//                 const response = await axiosInstance.get(`${BASE_URL}/getCricketTeamPlayerScore`,{
//                     params:{
//                         match_id:matchData.match_id.toString(),
//                         tournament_id:matchData.tournament_id.toString(),
//                         team_id:matchData.team1_id.toString()
//                     },
//                     headers: {
//                         'Authorization': `Bearer ${authToken}`,
//                         'Content-Type': 'application/json'
//                     }
//                 });
//                 const item = response.data;
//                 console.log("Line no 30: , ", item)
//                 if(!item || item === null) {
//                     setData([]);
//                 } else {
//                     const resposneWithPlayerProfile = item.map( async (itm, index) => {
//                         //console.log("Line no 41: ", itm)
//                         const responsePlayerProfile = await axiosInstance.get(`${BASE_URL}/getPlayerProfile`, {
//                             params:{
//                                 player_id:itm.player_id.toString()
//                             },
//                             headers: {
//                                 'Authorization': `Bearer ${authToken}`,
//                                 'Content-Type': 'application/json'
//                             }
//                         })
//                        // console.log("Line no 50 : ", responsePlayerProfile.data)
//                         return {...itm, playerProfile: responsePlayerProfile.data}
//                     })
//                     const data = await Promise.all(resposneWithPlayerProfile);
//                     setData(data);
//                 }

//             } catch(err) {
//                 console.error("unable to fetch the match data", err)
//             }
//         }
//         fetchPlayerScore()
//     }, [])
//     return (
//         <View style={tailwind`flex-1 mt-4`}>
//             <View style={tailwind` h-45 bg-black`}>
//                 <Text style={tailwind`text-white`}>Hello Score</Text>
//             </View>
//             <TopTabCricketMatchPage team1ID ={matchData.team1_id} team2ID={matchData.team2_id}/>
//         </View>
//     );
// }

// export default FixturePage;