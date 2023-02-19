import React, { useEffect, useState } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import BottomTabNavigator from './views/navigator/BottomTabNavigator';
import LocationTracking from './service/LocationTracking';
import { Provider } from 'react-redux';
import { store } from './redux/Store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingScreen from './views/LoadingScreen';
import { loadPreviousTracks } from './redux/slices/location/TrackingSlice';

function App(): JSX.Element {

  const [loadingStore, setLoadingStore] = useState(true)

  useEffect(() => {
    const locationTracking = new LocationTracking(store)
    locationTracking.startTrackingIfNotAlreadyStarted()
    return () => {
      locationTracking.stopTracking()
    }
  }, []);

  useEffect( () => {
    AsyncStorage.getItem('past_tracks').then((past_tracks) => {
      if (past_tracks != null) {
        const parsed_past_tracks = JSON.parse(past_tracks)
        store.dispatch(loadPreviousTracks(parsed_past_tracks))
      }
      setLoadingStore(false)
    })
  }, [])

  if (loadingStore) {
    return (<PaperProvider><LoadingScreen/></PaperProvider>)
  } else {
    return (
      <PaperProvider>
        <Provider store={store}>
          <BottomTabNavigator/>
        </Provider>
      </PaperProvider>
    )
  }
}

export default App;