import { useLocation } from 'react-router-dom'

import chatCSS from '../Chat/Chat.module.css'
import { useEffect, useState } from 'react'
import { Box } from '@mui/material'

const errors = [
  {
    id: 1,
    status: 401,
    path: '/images/error-401.jpg',
    message: 'Unauthorized access. Please login or register',
  },
  { id: 2, status: 404, path: '/images/error-404.jpg', message: '' },
  {
    id: 3,
    status: 500,
    path: '/images/error-500.jpg',
    message: 'Something went wrong! Please try again later',
  },
]

const ErrorPage = () => {
  const [initialValues, setInitialValues] = useState(null)
  const location = useLocation()

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    const status = Number(queryParams.get('status')) || 404

    if (status) {
      const err = errors.find((item) => item.status === status)
      setInitialValues({
        status,
        path: err.path,
        message: err.message,
      })
    }
  }, [location.search])

  return (
    <Box className={chatCSS.landingContent}>
      {initialValues?.path && (
        <>
          <Box className={chatCSS.landingTitle}>{initialValues?.message}</Box>
          <img
            src={initialValues?.path}
            alt=''
            className={chatCSS.landingImg}
          />
        </>
      )}
    </Box>
  )
}

export default ErrorPage
