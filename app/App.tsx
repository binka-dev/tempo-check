import React, { useEffect, useState } from 'react';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import LocationTracking from './service/LocationTracking';
import { Provider } from 'react-redux';
import { store } from './redux/Store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingScreen from './views/LoadingScreen';
import { loadPreviousTracks } from './redux/slices/location/TrackingSlice';
import MainStackNavigator from './views/navigator/MainStackNavigator';
import { AppState } from 'react-native';

function App(): JSX.Element {

  // Controls wether a loading screen is shown or not
  const [loadingStore, setLoadingStore] = useState(true)

  // Handle location tracking
  useEffect(() => {
    const locationTracking = new LocationTracking(store)
    if (AppState.currentState === 'active') {
      locationTracking.startTrackingIfNotAlreadyStarted()
    }

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        locationTracking.startTrackingIfNotAlreadyStarted()
      } else {
        locationTracking.stopTracking()
      }
    })
    return () => {
      locationTracking.stopTracking()
      subscription.remove()
    }
  }, []);

  // Load previous tracks from storage
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
      <PaperProvider theme={MD3LightTheme}>
        <Provider store={store}>
          <MainStackNavigator/>
        </Provider>
      </PaperProvider>
    )
  }
}

export default App;