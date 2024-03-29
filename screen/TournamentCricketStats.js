import React, {useState} from 'react';
import {View, Text} from 'react-native';
import tailwind from 'twrnc';

const TournamentCricketStats = () => {
    const [stats, setStats] = useState([]);
    return (
        <View style={tailwind`flex-1 mt-4`}>
            <View style={tailwind` rounded-lg bg-white shadow-lg h-40 ml-12 mr-12 items-center jusitfy-center`}>
                <Text style={tailwind`text-black pt-16 text-lg`}>
                    Yet no stats is present
                </Text>
            </View>
            
        </View>
    );
}

export default TournamentCricketStats;