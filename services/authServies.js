import axios from "axios";
import { AUTH_URL } from "../constants/ApiConstants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {setAuthenticated, setUser, logout} from '../redux/actions/actions';

export const loginServies = async ({ username, password, dispatch, isAuthenticated }) => {
    try {
        const response = await axios.post(`${AUTH_URL}/login`, {username,password });
        const item = response.data;
        await AsyncStorage.setItem("AccessToken", item.access_token);
        await AsyncStorage.setItem("Role", item.user.role);
        await AsyncStorage.setItem("User", item.user.username);
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

export const logoutServies = async ({dispatch}) => {
    try {
        const username = await AsyncStorage.getItem('User');
        await axios.delete(`${AUTH_URL}/removeSession/${username}`);
        dispatch(logout());
        await AsyncStorage.removeItem('AccessToken');
        await AsyncStorage.removeItem('RefreshToken');
        await AsyncStorage.removeItem('User');
      } catch (err) {
        alert("Failed to logout");
        console.log('Failed to logout', err);
      }
}