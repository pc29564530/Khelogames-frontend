import React, {useState, useRef} from 'react';
import { Pressable, Text, View, Modal, ScrollView } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import tailwind from 'twrnc';
import AddFootballSubstitution from './AddFootballSubstitutionIncident';
import AddFootballShootout from './AddFootballShootoutIncident';
import AddFootballIncident from './AddFootballIncident';
import AddFootballPeriods from './AddFootballPeriods';

const incidentsTypes = ["goal", "penalty", "foul", "shot_on_target", "penalty_miss", "yellow_card", "red_card", "substitution", "penalty_shootout", "period"];

const AddFootballModalIncident = ({matchData, awayPlayer, homePlayer, awayTeam, homeTeam}) => {
    const scrollViewRef = useRef(null);
    const [selectedIncident, setSelectedIncident] = useState("");
    const [substitutionModalVisible, setSubstitutionModalVisible] = useState(false);

    const [shootoutModalVisible, setShootoutModalVisible ] = useState(false);
    const [penaltyModalVisible, setPenaltyModalVisible] = useState(false);
    const [missedPenaltyVisible, setMissedPenaltyVisible] = useState(false);
    const [periodsModalVisible, setPeriodsModalVisible] = useState(false);

    const handleIncident = (item) => {
        if (item === "penalty_shootout") {
            setShootoutModalVisible(true);
        } else if (item === "penalty") {
            setPenaltyModalVisible(true);
        } else if(item === "penalty_miss"){
            setMissedPenaltyVisible(true);
        } else if (item === "substitution"){
            setSubstitutionModalVisible(true);
        } else if(item === "period") {
            setPeriodsModalVisible(true);
        } 
        setSelectedIncident(item);
    }

    const scrollRight = () => {
        scrollViewRef.current.scrollTo({x:100, animated:true})
    }
    
    return (
        <View style={tailwind``}>
            <View>
                <View>
                    <View style={tailwind`flex-row mt-5`}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        ref={scrollViewRef}
                        contentContainerStyle={tailwind`flex-row flex-wrap justify-center`}
                    >
                        {incidentsTypes.map((item, index) => (
                            <Pressable key={index} style={[tailwind`border rounded-lg bg-blue-500 h-30 w-30 p-2 mr-2 ml-2`, selectedIncident===item?tailwind`bg-orange-400`:tailwind`bg-orange-200`]} onPress={() => handleIncident(item)}>
                                <Text style={tailwind`text-black text-2xl`}>{item}</Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                    <Pressable onPress={scrollRight} style={tailwind`justify-center ml-2`}>
                        <MaterialIcons name="keyboard-arrow-right" size={30} color="black" />
                    </Pressable>
                </View>
                </View>
            </View>
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
                            />
                        </View>
                    </Pressable>
                </Modal>
            )}
        </View>
    );
};

export default AddFootballModalIncident;