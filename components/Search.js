import React, {useState} from 'react';
import { TouchableOpacity, View,TextInput, StyleSheet,Text } from "react-native";
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import useAxiosInterceptor from './axios_config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

function Search(){

    const [data, setData] = useState([]);
    const [input, setInput] = useState('');
    const axiosInstance = useAxiosInterceptor();
    const [communityType, setCommunityType] = useState('');
    const navigation = useNavigation();

    // const handlebackbutton = () => {
    //     navigation.navigate('Home');
    // }
    // const handleSearchButton = async () => {
    //     try {
    //         const authToken = await AsyncStorage.getItem('AccessToken');
    //         console.log("Input:", input);
    //         console.log("hasldkfhlk"+input+"heloo")
    //         const trimData = input.trim();
    //         const searchData = {
    //             community_type:trimData
    //         }
    //         console.log("input: ",input.trim())
    //         console.log("searchData: ",input.trim())
    //         console.log(searchData);
    //         const response = await axiosInstance.post('http://192.168.0.102:8080/searchCommunityType', searchData ,{
    //             headers: {
    //                 'Authorization': `Bearer ${authToken}`,
    //                 'Content-Type': 'application/json',
    //             }
    //         });
    //         console.log(response.data)
    //         setData(response.data);
    //     } catch(err) {
    //         console.error("unable to search ", err)
    //     }
    // }

    const handleInputChange = async (text) => {
        setInput(text)
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            console.log("Input:", input);
            console.log("hasldkfhlk"+input+"heloo")
            const trimData = input.trim();
            const searchData = {
                community_type:trimData
            }
            console.log("input: ",input.trim())
            console.log("searchData: ",input.trim())
            console.log(searchData);
            const response = await axiosInstance.post('http://192.168.0.102:8080/searchCommunityType', searchData ,{
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                }
            });
            console.log(response.data)
            setData(response.data);
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <View styles={styles.Container}>
            <View style={styles.HeaderContainer}>
                <TouchableOpacity>
                    <FontAwesome
                        name="close"
                        style={styles.HeaderBackIcon}
                        size={24}
                        onPress={() => navigation.goBack()}
                      />
                </TouchableOpacity>
                <View style={styles.SearchBox}>
                    <TextInput  style={styles.SearchText} value={input} onChangeText={handleInputChange} placeholder="Search" />
                </View>
                
            </View>

            <View style={styles.BodyContainer}>
            {data?.length>0 ? (
                data.map((item, index) => (
                    <View style={styles.ItemView} key={index}>
                        <Text style={styles.ItemData}>{item}</Text>
                    </View>
                ))
            ) : (
                <Text>No results found</Text>
            )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    BodyContainer: {
        flex:1
    },
    ItemView: {
        width:'100%',
        height:50
    },
    ItemData: {
        fontSize:20
    },
    Container: {
        flex:1
    },
    HeaderContainer: {
        flexDirection: 'row',
        height: 70,
        width: '100%',
        backgroundColor: 'white',
        padding:11,
        gap: 30
    },
    SearchBox: {
        borderRadius: 5,
        width: '75%',
        paddingLeft:14,
        backgroundColor:'#f2f2f2',
        flexDirection:'row',
        justifyContent:'space-between'
    },
    SearchIcon: {
        paddingTop: 15,
        paddingRight:14
    },
    SearchText: {
        fontSize:16
    },
    HeaderBackIcon: {
        paddingTop:12,
        paddingLeft:10
    },
    BodyContainer:{

    }
})

export default Search;