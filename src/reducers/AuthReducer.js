import { AUTH_USER, UPDATE_CURRENT_USER, LOGOUT_USER, AUTH_ERROR, VERIFY_MESSAGE } from '../constants/Auth';

const defaultState = {
  isAuthenticated: false,
  errorMessage: null,
  currentUser: {}
};

export default function AuthReducer(state = defaultState, { type, currentUser, errorMessage, verifyMessage }) {
  switch (type) {
    case AUTH_USER:
      return { ...state, isAuthenticated: true, currentUser };
    case UPDATE_CURRENT_USER:
      return { ...state, currentUser };
    case LOGOUT_USER:
      return { ...state, isAuthenticated: false, errorMessage: null, currentUser: {} };
    case AUTH_ERROR:
      return { ...state, errorMessage, currentUser: {} };
    case VERIFY_MESSAGE:
          return { ...state, verifyMessage, currentUser: {} };
    default:
      return state;
  }
}
