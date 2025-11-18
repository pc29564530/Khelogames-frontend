import axios from "axios";
import { AUTH_URL } from "../constants/ApiConstants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {setAuthenticated, setUser, logout} from '../redux/actions/actions';
import {persistor} from '../redux/store';

export const loginServies = async ({ username, password, dispatch, isAuthenticated }) => {
    try {
        const response = await axios.post(`${AUTH_URL}/login`, {username,password });
        const item = response.data;
        await AsyncStorage.setItem("AccessToken", item.access_token);
        await AsyncStorage.setItem("Role", item.user.role);
        await AsyncStorage.setItem("User", item.user);
        await AsyncStorage.setItem("RefreshToken", item.refresh_token);
        await AsyncStorage.setItem("AccessTokenExpiresAt", item.access_token_expires_at);
        await AsyncStorage.setItem("RefreshTokenExpiresAt", item.refresh_token_expires_at);
        dispatch(setAuthenticated(!isAuthenticated));
        dispatch(setUser(item.user));
    } catch (err) {
        alert("Check username or password which is incorrect");
        console.error("Unable to login:", err);
        throw err; 
    }
};

export const logoutServies = async ({dispatch, navigation}) => {
    try {
        const userPublicID = await AsyncStorage.getItem('UserPublicID');
        await axios.delete(`${AUTH_URL}/removeSession/${userPublicID}`);
        dispatch(logout());
        await AsyncStorage.removeItem('AccessToken');
        await AsyncStorage.removeItem('RefreshToken');
        await AsyncStorage.removeItem('UserPulbicID');
        await AsyncStorage.removeItem("Role");
        await persistor.purge()
        console.log("Sign Out")
        navigation.navigate("SignIn");
      } catch (err) {
        alert("Failed to logout");
        console.log('Failed to logout', err);
      }
}