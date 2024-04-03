import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {View} from 'react-native';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from './axios_config';
import tailwind from 'twrnc';
import PointTable from '../components/PointTable';

const TournamentStanding = ({route}) => {
    const tournament = route.params.tournament;
    console.log("Tournament : ", tournament)
    const axiosInstance = useAxiosInterceptor();
    const [group, setGroup] = useState([]);
    const [standings, setStandings] = useState([]);

    const fetchGroup = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`${BASE_URL}/getTournamentGroups`, {
                params:{
                    tournament_id: tournament.tournament_id
                },
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            })
            setGroup(response.data);
        } catch (err) {
            console.error("unable to fetch the group using sport: ", err);
        }
    }

    useEffect(() => {
        fetchGroup();
    }, [])
    
    useEffect(() => {
        const fetchStanding = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AccessToken');
                let standingData = [];

                if (group.length > 0 && group[0] !== undefined) {
                    for (const item of group) {
                        if (item !== undefined) {
                            const response = await axiosInstance.get(`${BASE_URL}/getTournamentStanding`, {
                                params: {
                                    tournament_id: tournament.tournament_id.toString(),
                                    group_id: item.group_id,
                                    sport_type: tournament.sport_type
                                },
                                headers: {
                                    'Authorization': `Bearer ${authToken}`,
                                    'Content-Type': 'application/json'
                                }
                            });
                            standingData.push(...response.data);
                        } else {
                            console.error("Item is undefined");
                        }
                    }
                    setStandings(standingData);
                } else {
                    console.error("Group array is empty or contains undefined elements");
                }
            } catch (err) {
                console.error("unable to fetch the standing using sport: ", err);
            }
        };

        if (group.length > 0) {
            fetchStanding();
        }
    }, [group, tournament]);

    let tableHead;
    let standingsData;
    if(standings[0]?.sport_type === "Football") {
        tableHead = ["Team", "W", "L", "D", "GD", "Pts"];
        standingsData = standings.map((item) => [
            item.club_name, item.wins,item.loss, item.draw,item.goal_difference=item.goal_for-item.goal_against, item.points
        ])
    } else {
        tableHead = ["Team", "M", "W", "L", "D", "Points"];
        standingsData = standings.map((item) => [
            item.club_name, item.wins,item.loss, item.draw, item.points
        ])
    }
    
  return (
    <View style={tailwind`mt-4`}>
        <PointTable standingsData={standingsData} tableHead={tableHead}/>
    </View>
       
  )
}

export default TournamentStanding