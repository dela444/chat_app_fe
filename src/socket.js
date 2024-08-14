import { io } from 'socket.io-client'

import { BACKEND_URL } from './constants/appDefaults'

const socket = (user) => {
  return new io(BACKEND_URL, {
    autoConnect: false,
    withCredentials: true,
    auth: {
      token: user.token,
    },
  })
}

export default socket
