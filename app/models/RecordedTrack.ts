import UserLocation from "./UserLocation";

export default interface RecordedTrack {
    locationHistory: UserLocation[];
    start_timestamp: number;
}