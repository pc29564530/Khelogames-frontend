import React, {useState, useEffect} from 'react';
import {View, Text, Pressable, ScrollView} from 'react-native';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import Members from '../components/Members';
import ClubFootballMatch from '../components/ClubFootballMatch';
import ClubCricketMatch from '../components/ClubCricketMatch';
import Stats from '../components/Stats';


const subCategorys = [ "Members", "Fixture"];

const sportPage = (teamData, sport) => {
    console.log("Sports: ", sport)
    switch (sport) {
        case "Cricket":
            return <ClubCricketMatch  teamData={teamData}/>;
        default:
            return <ClubFootballMatch  teamData={teamData}/>;
    }
}

const ClubPage = ({route}) => {
    const navigation = useNavigation();
    const {teamData, sport} = route.params;
    const [subCategory, setSubCategory] = useState('');

    const  handleSubCategory = async (item) => {
        setSubCategory(item)
    }
    const rerenderSubCategory = () => {
        switch (subCategory) {
            case "Fixture":
                return sportPage(teamData, sport);
            case "Stats":
                return <Stats />;
            default:
                return <Members teamData={teamData} />;
        }
    }
    return (
        <View style={tailwind`m-4`}>
            <View style={tailwind`flex-row items-center justify-start gap-5`}>
                <View style={tailwind`border rounded-md w-20 h-20 bg-orange-400 items-center justify-center`}>
                    <Text style={tailwind`text-black text-5xl items-center justify-center`}>{teamData.short_name}</Text>
                </View>
                <View >
                    <Text style={tailwind`text-2xl text-black `}>{teamData.name}</Text>
                    <Text style={tailwind`text-xl text-black `}>{teamData.sports}</Text>
                </View>
            </View>
            <View style={tailwind`flex-row  mt-2`}>
                <Text style={tailwind`text-black text-lg`}>Follower: </Text>
                <Text style={tailwind`text-black text-lg`} > | </Text>
                <Text style={tailwind`text-black text-lg`} >Team Size: </Text>
            </View>
            <View style={tailwind`flex-row mt-2 `}>
                {subCategorys.map((item, index) => (
                    <Pressable key={index} style={[tailwind`border rounded-md bg-orange-200 p-1.5 mr-2`, subCategory === item?tailwind`bg-green-200`:null]} onPress={() => handleSubCategory(item)}>
                        <Text style={tailwind`text-black`}>{item}</Text>
                    </Pressable>
                ))}
            </View>
            <View>{rerenderSubCategory()}</View>
        </View>
    );
}

export default ClubPage;