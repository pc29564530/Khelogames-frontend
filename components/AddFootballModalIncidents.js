import React, {useState, useRef} from 'react';
import { Pressable, Text, View, Modal, ScrollView } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import tailwind from 'twrnc';
import AddFootballSubstitution from './AddFootballSubstitutionIncident';
import AddFootballShootout from './AddFootballShootoutIncident';
import AddFootballIncident from './AddFootballIncident';
import AddFootballPeriods from './AddFootballPeriods';

const incidentsTypes = ["goal", "penalty", "foul", "shot_on_target", "penalty_miss", "yellow_card", "red_card", "substitution", "penalty_shootout", "period", "corner_kick", ];

const AddFootballModalIncident = ({matchData, awayPlayer, homePlayer, awayTeam, homeTeam, homeSquad, awaySquad}) => {
    const scrollViewRef = useRef(null);
    const [selectedIncident, setSelectedIncident] = useState("");
    const [substitutionModalVisible, setSubstitutionModalVisible] = useState(false);

    const [shootoutModalVisible, setShootoutModalVisible ] = useState(false);
    const [penaltyModalVisible, setPenaltyModalVisible] = useState(false);
    const [missedPenaltyVisible, setMissedPenaltyVisible] = useState(false);
    const [periodsModalVisible, setPeriodsModalVisible] = useState(false);
    const [commanModalVisible, setCommanModalVisible] = useState(false);
    const handleIncident = (item) => {
        switch (item) {
            case "penalty_shootout":
                setShootoutModalVisible(true);
                break;
            case "penalty":
                setPenaltyModalVisible(true);
                break;
            case "penalty_miss":
                setMissedPenaltyVisible(true);
                break;
            case "substitution":
                setSubstitutionModalVisible(true);
                break;
            case "period":
                setPeriodsModalVisible(true);
                break;
            default:
                setCommanModalVisible(true);
                break;
        }
        setSelectedIncident(item);
    }

    const scrollRight = () => {
        scrollViewRef.current.scrollTo({x:100, animated:true})
    }
    
    return (
        <View style={tailwind``}>
            <View>
            <View style={tailwind`mt-6`}>
            <Text style={tailwind`text-xl font-bold text-gray-800 mb-5`}>Select Incident Type</Text>
            <View style={tailwind`flex-row items-center`}>
                <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                ref={scrollViewRef}
                contentContainerStyle={tailwind`gap-3 px-2`}
                >
                {incidentsTypes.map((item, index) => {
                    const isSelected = selectedIncident === item;
                    return (
                    <Pressable
                        key={index}
                        onPress={() => handleIncident(item)}
                        style={[
                        tailwind`px-5 py-2 rounded-full border shadow-sm`,
                        isSelected
                            ? tailwind`bg-orange-500 border-orange-600`
                            : tailwind`bg-white border-gray-300`,
                        ]}
                    >
                        <Text style={[
                        tailwind`text-sm font-semibold capitalize`,
                        isSelected ? tailwind`text-white` : tailwind`text-gray-800`
                        ]}>
                        {item.replace(/_/g, ' ')}
                        </Text>
                    </Pressable>
                    );
                })}
                </ScrollView>

                <Pressable onPress={scrollRight} style={tailwind`ml-2 p-2`}>
                <MaterialIcons name="keyboard-arrow-right" size={32} color="gray" />
                </Pressable>
            </View>
            </View>
            </View>
            {commanModalVisible && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={commanModalVisible}
                    onRequestClose={() => setCommand(false)}
                >
                    <Pressable onPress={() => setCommanModalVisible(false)} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                        <View style={tailwind`bg-white rounded-md p-4`}>
                            <AddFootballIncident matchData={matchData} 
                                awayPlayer={awayPlayer} 
                                homePlayer={homePlayer} 
                                awayTeam={matchData.awayTeam} 
                                homeTeam={matchData.homeTeam}
                                selectedIncident={selectedIncident}
                                homeSquad={homeSquad}
                                awaySquad={awaySquad}
                            />
                        </View>
                    </Pressable>
                </Modal>
            )}
            {substitutionModalVisible && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={substitutionModalVisible}
                    onRequestClose={() => setSubstitutionModalVisible(false)}
                >
                    <Pressable onPress={() => setSubstitutionModalVisible(false)} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                        <View style={tailwind`bg-white rounded-md p-4`}>
                            <AddFootballSubstitution matchData={matchData} 
                                awayPlayer={awayPlayer} 
                                homePlayer={homePlayer} 
                                awayTeam={matchData.awayTeam} 
                                homeTeam={matchData.homeTeam}
                                selectedIncident={selectedIncident}
                                homeSquad={homeSquad}
                                awaySquad={awaySquad}
                            />
                        </View>
                    </Pressable>
                </Modal>
            )}
            {penaltyModalVisible && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={penaltyModalVisible}
                    onRequestClose={() => setPenaltyModalVisible(false)}
                >
                    <Pressable onPress={() => setPenaltyModalVisible(false)} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                        <View style={tailwind`bg-white rounded-md p-4`}>
                            <AddFootballIncident matchData={matchData} 
                                awayPlayer={awayPlayer} 
                                homePlayer={homePlayer} 
                                awayTeam={matchData.awayTeam} 
                                homeTeam={matchData.homeTeam}
                                selectedIncident={selectedIncident}
                                homeSquad={homeSquad}
                                awaySquad={awaySquad}
                            />
                        </View>
                    </Pressable>
                </Modal>
            )}
            {missedPenaltyVisible && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={missedPenaltyVisible}
                    onRequestClose={() => setMissedPenaltyVisible(false)}
                >
                    <Pressable onPress={() => setMissedPenaltyVisible(false)} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                        <View style={tailwind`bg-white rounded-md p-4`}>
                            <AddFootballIncident matchData={matchData} 
                                awayPlayer={awayPlayer} 
                                homePlayer={homePlayer} 
                                awayTeam={matchData.awayTeam} 
                                homeTeam={matchData.homeTeam}
                                selectedIncident={selectedIncident}
                                homeSquad={homeSquad}
                                awaySquad={awaySquad}
                            />
                        </View>
                    </Pressable>
                </Modal>
            )}
            {shootoutModalVisible && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={shootoutModalVisible}
                    onRequestClose={() => setShootoutModalVisible(false)}
                >
                    <Pressable onPress={() => setShootoutModalVisible(false)} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                        <View style={tailwind`bg-white rounded-md p-4`}>
                            <AddFootballShootout matchData={matchData} 
                                awayPlayer={awayPlayer} 
                                homePlayer={homePlayer} 
                                awayTeam={matchData.awayTeam} 
                                homeTeam={matchData.homeTeam}
                                selectedIncident={selectedIncident}
                                homeSquad={homeSquad}
                                awaySquad={awaySquad}
                            />
                        </View>
                    </Pressable>
                </Modal>
            )}
            {periodsModalVisible && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={periodsModalVisible}
                    onRequestClose={() => setPeriodsModalVisible(false)}
                >
                    <Pressable onPress={() => setPeriodsModalVisible(false)} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                        <View style={tailwind`bg-white rounded-md p-4`}>
                            <AddFootballPeriods matchData={matchData} 
                                awayPlayer={awayPlayer} 
                                homePlayer={homePlayer} 
                                awayTeam={matchData.awayTeam} 
                                homeTeam={matchData.homeTeam}
                                selectedIncident={selectedIncident}
                                homeSquad={homeSquad}
                                awaySquad={awaySquad}
                            />
                        </View>
                    </Pressable>
                </Modal>
            )}
        </View>
    );
};

export default AddFootballModalIncident;