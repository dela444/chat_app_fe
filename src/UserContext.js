import React, { createContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import axios from 'axios'

import { BACKEND_URL } from './constants/appDefaults'

export const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    authenticated: false,
    token: localStorage.getItem('token'),
  })
  const navigate = useNavigate()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/auth/check-auth`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        })

        if (response.status === 200 && response.data) {
          setUser({
            ...response.data,
          })
          if (response.data.authenticated) {
            navigate('/chat')
          }
        } else {
          setUser({ authenticated: false })
        }
      } catch (err) {
        setUser({ authenticated: false })
      }
    }

    checkAuth()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  )
}
