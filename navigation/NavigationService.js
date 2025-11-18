import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export const navigate = (name, params) => {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
};

export const reset = (state) => {
  if (navigationRef.isReady()) {
    navigationRef.reset(state);
  }
};


