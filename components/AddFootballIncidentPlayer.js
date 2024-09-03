import {View, Text, Pressable, Image} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Dropdown from 'react-native-modal-dropdown';
import tailwind from 'twrnc';

const AddFootballIncidentlayer = ({matchData, awayPlayer, homePlayer, awayTeam, homeTeam, selectedPlayer, setSelectedPlayer, teamID}) => {
    
    // const handleSelectedPlayer = (item) => {
    //     console.log("Selected Player line no 9: ", item)
    //     setSelectedPlayer(item);
    // }
    // console.log("Selected Player : ", selectedPlayer)
    return (
        <View>
            <View style={tailwind`mb-4 items-start justify-between`}>
                <View style={tailwind``}>
                    <Text style={tailwind`mb-2 text-xl font-bold`}>Player:</Text>
                    {/* {teamID===homeTeam.id?(
                        <View>
                            {homePlayer.map((item,index) => (
                                <Pressable onPress={() => handleSelectedPlayer(item)} key={index}>
                                    <Text>{item.player_name}</Text>
                                </Pressable>
                            ))}
                        </View>
                    ):(
                        <View>
                            {awayPlayer?.map((item,index) => (
                                <Pressable onPress={() => handleSelectedPlayer(item)} key={index}>
                                    <Text>{item.player_name}</Text>
                                </Pressable>
                            ))}
                        </View>
                    )} */}
                    <Dropdown 
                        style={tailwind`p-4 bg-white rounded-lg shadow-md border border-gray-200`}
                        options={teamID === homeTeam.id ? homePlayer : awayPlayer}
                        onSelect={(index, item) => setSelectedPlayer(item)}
                        data={teamID === homeTeam.id ? homePlayer : awayPlayer}
                        renderRow={(item) => (
                            <View style={tailwind`flex-row items-center p-3 border-b border-gray-100`}>
                                <Image
                                    src={item.media_url}
                                    style={tailwind`rounded-full h-12 w-12 mr-3 bg-yellow-300`}
                                    resizeMode="cover"
                                />
                                <Text style={tailwind`text-lg font-semibold text-gray-700`}>{item.player_name}</Text>
                            </View>
                        )}
                    >
                        <View style={tailwind`flex-row items-center justify-between p-3 border rounded-md bg-gray-50`}>
                            <Text style={tailwind`text-lg font-medium text-gray-700`}>
                                {selectedPlayer ? selectedPlayer.player_name : 'Select player'}
                            </Text>
                            <MaterialIcons name="arrow-drop-down" size={24} color="gray" />
                        </View>
                    </Dropdown>
                </View>
            </View>
        </View>
    );
};

export default AddFootballIncidentlayer;