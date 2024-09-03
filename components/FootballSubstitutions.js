import React, {useState} from 'react';
import {View, Text, TextInput, Pressable, Modal, Picker, Image} from 'react-native';
import useAxiosInterceptor from "../screen/axios_config";
import tailwind from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/ApiConstants';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Dropdown from 'react-native-modal-dropdown';

const FootballSubstitution = ({matchData, awayPlayer, homePlayer, awayTeam, homeTeam, selectedPlayerIn ,setSelectedPlayerIn, selectedPlayerOut, setSelectedPlayerOut, teamID}) => {
    const [homePlayerModal, setHomePlayerModal] = useState(false);
    const [awayPlayerModal, setAwayPlayerModal] = useState(false);

    const handleSelectPlayerIn = (item) => {
        setSelectedPlayerIn(item);
        //setSubstitutionInPlayer(item.id);
    }

    const handleSelectPlayerOut = (item) => {
        setSelectedPlayerOut(item);
       // setSubstitutionOutPlayer(item.id)
    }


    return (
        <View style={tailwind``}>

            {/* Select Players */}
            <View style={tailwind`mb-4 items-start justify-between`}>
                <View style={tailwind``}>
                    <Text style={tailwind`mb-2 text-xl font-bold`}>Player In:</Text>
                    <Dropdown 
                        style={tailwind`p-4 bg-white rounded-lg shadow-md border border-gray-200`}
                        options={teamID === homeTeam.id ? homePlayer : awayPlayer}
                        onSelect={(index, item) => setSelectedPlayerIn(item)}
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
                                {selectedPlayerIn ? selectedPlayerIn.player_name : 'Select player'}
                            </Text>
                            <MaterialIcons name="arrow-drop-down" size={24} color="gray" />
                        </View>
                    </Dropdown>
                </View>
                <View style={tailwind``}>
                    <Text style={tailwind`mb-2 text-xl font-bold`}>Player Out:</Text>
                    <Dropdown 
                        style={tailwind`p-4 bg-white rounded-lg shadow-md border border-gray-200`}
                        options={teamID === homeTeam.id ? homePlayer : awayPlayer}
                        onSelect={(index, item) => setSelectedPlayerOut(item)}
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
                                {selectedPlayerOut ? selectedPlayerOut.player_name : 'Select player'}
                            </Text>
                            <MaterialIcons name="arrow-drop-down" size={24} color="gray" />
                        </View>
                    </Dropdown>
                </View>
            </View>

            {/* Confirm Button */}
            
            {/* {teamID === homeTeam.id ? homePlayerModal:awayPlayerModal && (
                <Modal
                    transparent={true}
                    animatedType="slide"
                    visible={awayPlayerModal}
                    onRequestClose={() => {teamID===homeTeam.id?setHomePlayerModal(false):setAwayPlayerModal(false)}}
                >
                    <Pressable onPress={() => {teamID===homeTeam.id?setHomePlayerModal(false):setAwayPlayerModal(false)}}style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                        {teamID===homeTeam.id?(
                            <View style={tailwind`bg-white rounded-md p-4`}>
                                {homePlayer.map((item, index) => (
                                    <Pressable onPress={() => handleSubstitution(item)}>
                                        <Text key={index}>{item.player_name}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        ):(
                            <View style={tailwind`bg-white rounded-md p-4`}>
                                {awayPlayer.map((item, index) => (
                                    <Pressable onPress={() => handleSubstitution(item)}>
                                        <Text key={index}>{item.player_name}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        )}
                    </Pressable>
                </Modal>
            )} */}
        </View>
    );
}

export default FootballSubstitution;