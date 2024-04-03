import React from 'react';
import { View, Text } from 'react-native';
import tailwind from 'twrnc';



const PointTable = ({ standingsData, tableHead }) => {
    const standingData = colForm(standingsData);
    return (
        <View style={tailwind`p-4 bg-white rounded-md shadow`}>
            <View style={tailwind`flex-row justify-between items-center py-2 border-gray-300 `}>
                {standingData?.map((colData, colIndex) => (
                    <View style={tailwind``}>
                        <Text style={tailwind`text-black`}>{tableHead[colIndex]}</Text>
                        {colData.map((rowData, rowIndex) => (
                            <Text style={tailwind`items-center justify-center mt-2`} key={rowIndex}>{rowData}</Text>
                        ))}
                    </View>
                ))}
            </View>
        </View>
    );
}

const colForm = (item) => {
    console.log("Item L d ", item[1])
    return item[0]?.map((_, colIndex) => item.map(data => data[colIndex]) )
}

export default PointTable;
