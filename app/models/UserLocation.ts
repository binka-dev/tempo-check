import { LatLng } from "react-native-maps";

export default interface UserLocation extends LatLng {
    latitude: number;
    longitude: number;
    speed: number | null;
    timestamp: number;
}

