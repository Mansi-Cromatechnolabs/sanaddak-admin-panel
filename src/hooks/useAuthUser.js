'use client';

import store from 'src/redux/store';

export function getUser() {
  const state = store.getState();
  // console.log('state', state);
  return state.auth.user;
}
