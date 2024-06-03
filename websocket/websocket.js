import {WebSocket} from 'react-native';

let ws = new WebSocket('wss://192.168.1.4:8080/ws');
const wsRef = useRef(ws);
