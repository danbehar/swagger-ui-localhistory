// Redux Flux Actions
const STORE_RESPONSE_ACTION_KEY = 'LOCALHISTORY_STORE_RESPONSE';
const CLEAR_RESPONSE_ACTION_KEY = 'LOCALHISTORY_CLEAR_RESPONSE';
const CLEARALL_RESPONSE_ACTION_KEY = 'LOCALHISTORY_CLEARALL_RESPONSE';
// Key that is used in localStorage for persistence
const LOCALSTORE_KEY = 'swagger-local-state';
// State namespace for this plugin
const STORE_STATE_KEY = 'localHistory';
// Key used in state within this namespace
const STORE_RESPONSE_KEY = 'previousResponses';

const StoreDataPlugin = system => ({
  statePlugins: {
    spec: {
      wrapActions: {
        // Override the setResponse to also store it using by calling the storeResponse action
        setResponse: (oriAction, system) => (path, method, res) => {
          system[`${STORE_STATE_KEY}Actions`].storeResponse(system.Im.Map({
            path, method, body: res.body, status: res.status, err: res.err, time: Date.now(),
          }));
          return oriAction(path, method, res);
        },
      },
    },
    [STORE_STATE_KEY]: {
      // Actions return Flux Standard Actions that will be trigger Reducers.
      actions: {
        storeResponse: payload => ({
          type: STORE_RESPONSE_ACTION_KEY,
          payload,
        }),
        clearResponse: payload => ({
          type: CLEAR_RESPONSE_ACTION_KEY,
          payload,
        }),
        clearAllResponses: payload => ({
          type: CLEARALL_RESPONSE_ACTION_KEY,
          payload,
        }),
      },
      // Reducers take care of returning updated state in response to actions.
      // Note that states are Immutable Maps, so the input state is not actually mutated.
      reducers: {
        [STORE_RESPONSE_ACTION_KEY]: (state, action) => {
          const oldStateVal = state.get(STORE_RESPONSE_KEY);
          const newStateVal = system.Im.List([action.payload]).concat(oldStateVal);
          return state.set(STORE_RESPONSE_KEY, newStateVal);
        },
        [CLEARALL_RESPONSE_ACTION_KEY]: state => state.set(STORE_RESPONSE_KEY, system.Im.List()),
        [CLEAR_RESPONSE_ACTION_KEY]: (state, action) => {
          const oldState = state.get(STORE_RESPONSE_KEY);
          const newState = oldState.filter(e => e.get('time') !== action.payload.get('time'));
          return state.set(STORE_RESPONSE_KEY, newState);
        },
      },
      // Selectors return the values from the state.
      selectors: {
        previousResponses: state => state.get(STORE_RESPONSE_KEY),
      },
    },
  },
  afterLoad(system) {
    // Subscribe to any store changes, saving the responses into local storage.
    system.getStore().subscribe(() => {
      try {
        localStorage.setItem(LOCALSTORE_KEY, JSON.stringify(system.getStore().getState().get(STORE_STATE_KEY)));
      } catch (err) {
        // Ignore if any issue storing in local storage. It will be persisted (until page reloaded) within react state only.
      }
    });
  },
});

/**
 * Returns the initial state that is passed into the Redux store.
 * Loads from local storage, returning empty state on error case.
 */
const getInitialStateForSwaggerUI = () => {
  try {
    const localStorageValue = localStorage.getItem(LOCALSTORE_KEY);
    if (localStorageValue) {
      const stateVal = JSON.parse(localStorageValue);
      if (stateVal[STORE_RESPONSE_KEY]) {
        return { [STORE_STATE_KEY]: stateVal };
      }
    }
  } catch (err) {
    // Ignore any error loading or parsing from local storage. Will start off with empty object below.
  }
  return { [STORE_STATE_KEY]: { [STORE_RESPONSE_KEY]: [] } };
};
