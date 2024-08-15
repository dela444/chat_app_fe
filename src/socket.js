import { io } from 'socket.io-client'

import { BACKEND_URL } from './constants/appDefaults'

const socket = new io(BACKEND_URL, {
  autoConnect: false,
  withCredentials: true,
  auth: {
    token: localStorage.getItem('token'),
  },
})

export default socket
