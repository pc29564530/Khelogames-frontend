import {View, Text, Pressable, Image} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Dropdown from 'react-native-modal-dropdown';
import tailwind from 'twrnc';

const AddFootballIncidentlayer = ({matchData, awayPlayer, homePlayer, awayTeam, homeTeam, selectedPlayer, setSelectedPlayer, teamPublicID}) => {

    return (
        <View>
            <View style={tailwind`mb-4 items-start justify-between`}>
                <View style={tailwind``}>
                    <Text style={[tailwind`mb-2 text-xl font-bold`, {color: '#f1f5f9'}]}>Player:</Text>
                    <Dropdown
                        style={[tailwind`p-4 rounded-lg`, {backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155'}]}
                        options={teamPublicID === homeTeam.public_id ? homePlayer : awayPlayer}
                        onSelect={(index, item) => setSelectedPlayer(item)}
                        data={teamPublicID === homeTeam.public_id ? homePlayer : awayPlayer}
                        renderRow={(item) => (
                            <View style={[tailwind`flex-row items-center p-3`, {borderBottomWidth: 1, borderColor: '#334155'}]}>
                                <Image
                                    src={{uri: item.media_url}}
                                    style={[tailwind`rounded-full h-12 w-12 mr-3`, {backgroundColor: '#334155'}]}
                                    resizeMode="cover"
                                />
                                <Text style={[tailwind`text-lg font-semibold`, {color: '#f1f5f9'}]}>{item.player_name}</Text>
                            </View>
                        )}
                    >
                        <View style={[tailwind`flex-row items-center justify-between p-3 rounded-md`, {backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155'}]}>
                            <Text style={[tailwind`text-lg font-medium`, {color: selectedPlayer ? '#f1f5f9' : '#64748b'}]}>
                                {selectedPlayer ? selectedPlayer.player_name : 'Select player'}
                            </Text>
                            <MaterialIcons name="arrow-drop-down" size={24} color="#64748b" />
                        </View>
                    </Dropdown>
                </View>
            </View>
        </View>
    );
};

export default AddFootballIncidentlayer;