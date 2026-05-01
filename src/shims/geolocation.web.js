const Geolocation = {
  getCurrentPosition: (success, error, options) => navigator.geolocation.getCurrentPosition(success, error, options),
  watchPosition: (success, error, options) => navigator.geolocation.watchPosition(success, error, options),
  clearWatch: (id) => navigator.geolocation.clearWatch(id),
  requestAuthorization: () => {},
};

export default Geolocation;
