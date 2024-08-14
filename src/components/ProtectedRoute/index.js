import { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router'

import { UserContext } from '../../UserContext'

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(UserContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user || !user.authenticated) {
      navigate('/login')
    } else if (user.authenticated) {
      navigate('/chat')
    }
  }, [user, navigate])

  return children
}

export default ProtectedRoute
