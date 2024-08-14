import { Box, Button, Modal, TextField } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import { useState } from 'react'
import axios from 'axios'
import { useFormik } from 'formik'
import * as Yup from 'yup'

import styles from './CreateRoomModal.module.css'
import { BACKEND_URL } from '../../constants/appDefaults'

const CreateRoomModal = (props) => {
  const [errorMessage, setErrorMessage] = useState('')
  const formik = useFormik({
    initialValues: { name: '' },
    validationSchema: Yup.object({
      name: Yup.string()
        .required('Name is a required field!')
        .min(5, 'Name is too short!')
        .max(35, 'Name is too long!'),
    }),
    onSubmit: async (values, actions) => {
      try {
        const data = { ...values }
        const response = await axios.post(BACKEND_URL + '/create-room', data)
        if (response.data && Object.keys(response.data).length > 0) {
          if (response.data.message) {
            setErrorMessage(response.data.message)
          } else if (response.data.success) {
            props.onClose()
            window.location.reload()
          }
        }
      } catch (error) {
        console.error('There was a problem with the request:', error)
      } finally {
        actions.resetForm()
      }
    },
  })

  function onModalClose() {
    props.onClose()
  }

  return (
    <Modal open={props.openModal} onClose={onModalClose}>
      <Box className={styles.modal}>
        <Box className={styles.modalHeader}>
          <Box>Create new chat room</Box>

          <ClearIcon className={styles.closeIcon} onClick={onModalClose} />
        </Box>
        <Box className={styles.modalBody}>
          <Box className={styles.modalContent}>
            <Box className={styles.inputBox}>
              <TextField
                variant='standard'
                color='success'
                label='Chat room name'
                name='name'
                fullWidth
                className={styles.input}
                helperText={
                  formik.errors.name && formik.touched.name
                    ? formik.errors.name
                    : ''
                }
                error={formik.errors.name && formik.touched.name}
                {...formik.getFieldProps('name')}
              />
            </Box>
            {errorMessage !== '' ? (
              <Box className={styles.errorMessage} sx={{ textAlign: 'center' }}>
                {errorMessage}
              </Box>
            ) : (
              <Box className={styles.errorMessageEmpty}></Box>
            )}
            <Button
              variant='contained'
              className={styles.button}
              onClick={formik.handleSubmit}
            >
              Create room
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}

export default CreateRoomModal
