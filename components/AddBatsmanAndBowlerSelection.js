import { useState } from 'react';
import { View, Text, ScrollView } from "react-native";
import tailwind from "twrnc";
import { AddCricketBatsman } from "./AddCricketBatsman";
import { useSelector, useDispatch } from 'react-redux';
import { ScreenHeight } from '@rneui/base';
import SetCurrentBowler from './SetCurrentBowler';
import { selectCurrentBowler } from '../redux/reducers/cricketMatchPlayerScoreReducers';

const AddBatsmanAndBowlerSelection = ({ match, setAddBatsmanAndBowlerModalVisible }) => {
    const dispatch = useDispatch();

    const game = useSelector((state) => state.sportReducers.game);
    const homePlayer = useSelector(state => state.teams.homePlayer);
    const awayPlayer = useSelector(state => state.teams.awayPlayer);
    const batTeam = useSelector(state => state.cricketMatchScore.batTeam);
    const currentInningNumber = useSelector(state => state.cricketMatchInning.currentInningNumber);
    const bowling = useSelector((state) => state.cricketPlayerScore.bowlingScore);
    const currentBowler = useSelector(state => selectCurrentBowler(state, currentInningNumber));

    // Step-based flow: "BATSMAN" first, then "BOWLER"
    const [step, setStep] = useState("BATSMAN");

    const [selectedBatsman, setSelectedBatsman] = useState([]);
    const [error, setError] = useState({ global: null, fields: {} });

    // Called when batsman is successfully added via API
    const handleBatsmanSuccess = (batsman) => {
        if (batsman) {
            setSelectedBatsman((prev) => {
                if (prev.find(p => p.id === batsman.id)) return prev;
                return [...prev, batsman];
            });
        }
        // Move to bowler step
        setStep("BOWLER");
    };

    // SetCurrentBowler handles closing the modal and clearing
    // actionRequired internally after successful bowler change.

    return (
        <View>
            {/* Step indicator */}
            <View style={tailwind`flex-row items-center justify-center mb-4`}>
                <View style={[
                    tailwind`w-8 h-8 rounded-full items-center justify-center mr-2`,
                    { backgroundColor: step === "BATSMAN" ? '#f87171' : '#22c55e' }
                ]}>
                    <Text style={[tailwind`text-sm font-bold`, { color: '#fff' }]}>
                        {step === "BATSMAN" ? "1" : "\u2713"}
                    </Text>
                </View>
                <View style={[tailwind`w-8 h-0.5 mr-2`, { backgroundColor: step === "BOWLER" ? '#f87171' : '#334155' }]} />
                <View style={[
                    tailwind`w-8 h-8 rounded-full items-center justify-center`,
                    { backgroundColor: step === "BOWLER" ? '#f87171' : '#334155' }
                ]}>
                    <Text style={[tailwind`text-sm font-bold`, { color: step === "BOWLER" ? '#fff' : '#94a3b8' }]}>2</Text>
                </View>
            </View>

            {step === "BATSMAN" && (
                <View>
                    <Text style={[tailwind`text-lg font-semibold mb-3`, { color: '#f1f5f9' }]}>
                        Step 1: Select New Batsman
                    </Text>
                    <ScrollView style={{ maxHeight: ScreenHeight * 0.5 }}>
                        <AddCricketBatsman
                            match={match}
                            batTeam={batTeam}
                            homePlayer={homePlayer}
                            awayPlayer={awayPlayer}
                            game={game}
                            selectedBatsman={selectedBatsman}
                            setSelectedBatsman={setSelectedBatsman}
                            error={error}
                            setError={setError}
                            onSuccess={handleBatsmanSuccess}
                        />
                    </ScrollView>
                </View>
            )}

            {step === "BOWLER" && (
                <View>
                    <Text style={[tailwind`text-lg font-semibold mb-3`, { color: '#f1f5f9' }]}>
                        Step 2: Select New Bowler
                    </Text>
                    <ScrollView style={{ maxHeight: ScreenHeight * 0.5 }}>
                        <SetCurrentBowler
                            match={match}
                            batTeam={batTeam}
                            game={game}
                            dispatch={dispatch}
                            currentBowler={currentBowler}
                            error={error}
                            setError={setError}
                            setIsModalBowlingVisible={setAddBatsmanAndBowlerModalVisible}
                        />
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

export default AddBatsmanAndBowlerSelection;
