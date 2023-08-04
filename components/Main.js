import {Text, View, StyleSheet, Button, SafeAreaView, Touchable} from 'react-native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import Constants from 'expo-constants';
import { TouchableOpacity } from 'react-native-gesture-handler';


const Drawer = createDrawerNavigator();

const styles = StyleSheet.create({
    container: {
        marginTop: Constants.statusBarHeight,
        flexGrow: 1,
        flexShrink:1,
    }
})


const Main = ({navigation}) => {
    return (
        <View>
            <View>
                <Button 
                    title="Sign Up"
                    onPress={() => navigation.navigate('SignUp')} 
                />
                {/* <Button 
                    title="Create Account"
                    onPress={() => navigation.navigate('Account')}
                /> */}
                <Button 
                    title="Sign In"
                    onPress={() => navigation.navigate('SignIn')}
                />
            </View> 
        </View>
    )
}

export default Main;
