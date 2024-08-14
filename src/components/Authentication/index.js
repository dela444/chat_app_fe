import { Box, Button } from '@mui/material'
import { useContext, useState } from 'react'
import axios from 'axios'
import { useFormik } from 'formik'
import * as Yup from 'yup'

import styles from './Authentication.module.css'
import { UserContext } from '../../UserContext'
import { BACKEND_URL, FRONTEND_URL } from '../../constants/appDefaults'

const Authentication = ({ isLogin }) => {
  const [errorMessage, setErrorMessage] = useState(null)
  const { setUser } = useContext(UserContext)

  const formik = useFormik({
    initialValues: { username: '', password: '' },
    validationSchema: Yup.object({
      username: Yup.string()
        .required('Username is a required field!')
        .min(5, 'Username is too short!')
        .max(35, 'Username is too long!'),
      password: Yup.string()
        .required('Password is a required field!')
        .min(8, 'Password is too short!')
        .max(35, 'Password is too long!'),
    }),
    onSubmit: async (values, actions) => {
      try {
        const data = { ...values }
        const endpoint = isLogin
          ? BACKEND_URL + '/auth/login'
          : BACKEND_URL + '/auth/register'
        const response = await axios.post(endpoint, data)
        if (response.data && Object.keys(response.data).length > 0) {
          setUser({ ...response.data })
          if (response.data.message) {
            setErrorMessage(response.data.message)
          } else if (response.data.authenticated) {
            localStorage.setItem('token', response.data.token)
            window.location.href = FRONTEND_URL + '/chat'
          }
        }
      } catch (error) {
        console.error('There was a problem with the request:', error)
      } finally {
        actions.resetForm()
      }
    },
  })

  //<a href="https://www.freepik.com/free-vector/messages-concept-illustration_5911277.htm#fromView=search&page=1&position=7&uuid=d2401977-c279-4b64-b0de-dace887d7fde">Image by storyset on Freepik</a>

  return (
    <Box className={styles.wrapper}>
      <Box className={styles.formWrapper}>
        <img src='/images/auth-img.jpg' alt='' className={styles.authImg} />
        <Box className={styles.authSection}>
          <Box className={styles.title}>
            <Box className='w-100'>{isLogin ? 'Login' : 'Register'}</Box>
          </Box>
          <Box className='form-wrapper'>
            <Box className={styles.inputWrapper}>
              <label className='label' htmlFor='username'>
                USERNAME
              </label>
              <input
                id='username'
                name='username'
                type='text'
                className={styles.input}
                placeholder='Enter username'
                {...formik.getFieldProps('username')}
              />
              {formik.errors.username && formik.touched.username ? (
                <Box className={styles.errorMessage}>
                  {formik.errors.username}
                </Box>
              ) : (
                <Box className={styles.errorMessageEmpty}></Box>
              )}
            </Box>
            <Box className={styles.inputWrapper}>
              <label className='label' htmlFor='password'>
                PASSWORD
              </label>
              <input
                id='password'
                name='password'
                type='password'
                className={styles.input}
                placeholder='Enter password'
                {...formik.getFieldProps('password')}
              />
              {formik.errors.password && formik.touched.password ? (
                <Box className={styles.errorMessage}>
                  {formik.errors.password}
                </Box>
              ) : (
                <Box className={styles.errorMessageEmpty}></Box>
              )}
              {errorMessage !== '' && (
                <Box
                  className={styles.errorMessage}
                  sx={{ textAlign: 'center' }}
                >
                  {errorMessage}
                </Box>
              )}
            </Box>

            <Button className={styles.button} onClick={formik.handleSubmit}>
              {isLogin ? 'Log in' : 'Register'}
            </Button>
            <Box
              className={styles.authSectionTwo}
              sx={{ display: isLogin ? 'none !important' : '' }}
            ></Box>
            {isLogin ? (
              <Box className={styles.isMember}>
                Not a member? <a href={FRONTEND_URL + '/register'}> Register</a>
              </Box>
            ) : (
              <Box className={styles.isMember}>
                Already have an account?{' '}
                <a href={FRONTEND_URL + '/login'}> Login</a>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Authentication
