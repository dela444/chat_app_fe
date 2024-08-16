import { Box } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import SendIcon from '@mui/icons-material/Send'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import axios from 'axios'

import socket from '../../socket'
import { UserContext } from '../../UserContext'
import Sidebar from '../Sidebar'
import styles from './Chat.module.css'
import createRoomCSS from '../CreateRoomModal/CreateRoomModal.module.css'
import { BACKEND_URL, FRONTEND_URL } from '../../constants/appDefaults'

const Chat = () => {
  const { setUser, user } = useContext(UserContext)
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedChat, setSelectedChat] = useState(null)
  const [users, setUsers] = useState([])
  const [chatRooms, setChatRooms] = useState([])
  const [messages, setMessages] = useState([])
  const [roomMessages, setRoomMessages] = useState([])

  const formik = useFormik({
    initialValues: { message: '' },
    validationSchema: Yup.object({
      message: Yup.string().min(1).max(255),
    }),
    onSubmit: async (values, actions) => {
      try {
        const isRoomMessage = selectedChat?.roomid ? true : false

        const sendTo = isRoomMessage ? selectedChat.roomid : selectedChat.userid

        const recipientType = isRoomMessage ? 'room' : 'user'

        const data = {
          ...values,
          from: user?.userid,
          recipient_id: sendTo,
          recipient_type: recipientType,
        }

        const response = await axios.post(BACKEND_URL + '/message', data)
        if (response.data && Object.keys(response.data).length > 0) {
          if (response.data.success) {
            const message = {
              from: user.userid,
              recipient_id: sendTo,
              recipient_type: recipientType,
              content: response.data.message,
              creation_time: response.data.creation_time,
              message_id: response.data.message_id,
              status: 'sent',
            }
            if (selectedChat.userid) {
              setMessages((prevMessages) => [...prevMessages, message])
            } else {
              setRoomMessages((prevMessages) => [...prevMessages, message])
            }

            socket.emit('sendMessage', message)
          } else {
            setErrorMessage(response.data.message)
          }
        }
      } catch (error) {
        console.error('There was a problem with the request:', error)
      } finally {
        actions.resetForm()
      }
    },
  })

  useEffect(() => {
    socket.connect()

    return () => {
      socket.disconnect()
    }
  }, [])

  useEffect(() => {
    socket.on('users', (usersList) => {
      setUsers(usersList)
    })

    socket.on('rooms', (roomsList) => {
      setChatRooms(roomsList)
    })

    socket.on('sendMessage', (message) => {
      if (message.recipient_type === 'room') {
        setRoomMessages((prevMessages) => [...prevMessages, message])
      } else {
        setMessages((prevMessages) => [...prevMessages, message])
        if (selectedChat && selectedChat.userid) {
          const data = {
            userid: selectedChat.userid,
            messageid: message.message_id,
          }
          socket.emit('messageSeen', data)
        } else {
          socket.emit('messageDelivered', message)
        }
      }
    })

    socket.on('messageSeen', (isSeen) => {
      if (isSeen) {
        const updatedMessages = messages.map((item) => ({
          ...item,
          status: 'seen',
        }))
        setMessages(updatedMessages)
      }
    })

    socket.on('messageDelivered', (message) => {
      if (message.recipient_type === 'room') {
        const updatedMessages = roomMessages.map((item) =>
          item.message_id === message.message_id
            ? { ...item, status: 'delivered' }
            : item
        )
        setRoomMessages(updatedMessages)
      } else {
        const updatedMessages = messages.map((item) =>
          item.message_id === message.message_id
            ? { ...item, status: 'delivered' }
            : item
        )
        setMessages(updatedMessages)
      }
    })

    socket.on('seen', (id) => {
      if (selectedChat?.userid === id) {
        const updatedMessages = messages.map((item) => ({
          ...item,
          status: 'seen',
        }))
        setMessages(updatedMessages)
      }
    })

    socket.on('messages', (data) => {
      let reversedMessages = [...data].reverse()
      setMessages(reversedMessages)
    })

    socket.on('roomMessages', (data) => {
      let reversedMessages = [...data].reverse()
      setRoomMessages(reversedMessages)
    })

    socket.on('messagesRead', (messageId) => {
      if (messageId === '0') {
        const updatedMessages = messages.map((item) => ({
          ...item,
          status: 'seen',
        }))
        setMessages(updatedMessages)
      } else {
        const messageIndex = messages.findIndex(
          (item) => item.message_id === messageId
        )

        if (messageIndex !== -1) {
          const updatedMessages = messages.map((item, index) => ({
            ...item,
            status: index <= messageIndex ? 'seen' : item.status,
          }))
          setMessages(updatedMessages)
        }
      }
    })

    socket.on('connect_error', () => {
      setUser({ authenticated: false })
    })

    socket.on('connected', (status, userid) => {
      setUsers((prevUsers) => {
        return [...prevUsers].map((user) => {
          if (user.userid === userid) {
            user.connected = status
          }
          return user
        })
      })
    })

    return () => {
      socket.off('connect_error')
      socket.off('users')
      socket.off('rooms')
      socket.off('sendMessage')
      socket.off('messages')
      socket.off('roomMessages')
      socket.off('messageDelivered')
      socket.off('messagesRead')
      socket.off('messageSeen')
      socket.off('seen')
      socket.off('connected')
    }
  }, [setUser, setUsers, selectedChat, messages])

  useEffect(() => {
    const myUser = users.find((item) => item.username === user.username)
    if (myUser?.userid) {
      setUser({ ...user, userid: myUser.userid })
    }
  }, [users])

  useEffect(() => {
    if (selectedChat?.userid) {
      const filteredMessages = messages.filter(
        (item) => item.from === selectedChat.userid && item.status === 'seen'
      )
      const lastSeenMessage =
        filteredMessages.length > 0
          ? filteredMessages[filteredMessages.length - 1]
          : null
      const data = {
        userid: selectedChat.userid,
        lastSeenMessage: lastSeenMessage?.message_id || '0',
      }
      socket.emit('messagesRead', data)
    }
  }, [selectedChat])

  const handleChatSelect = (chat) => {
    const data = {
      previousRoom: selectedChat?.roomid ? selectedChat.roomid : null,
      newRoom: chat.roomid ? chat.roomid : null,
    }
    socket.emit('joinRoom', data)

    setSelectedChat(chat)
  }

  const logout = async () => {
    localStorage.removeItem('token')
    socket.disconnect()
    window.location.href = FRONTEND_URL
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar
        handleChatSelect={handleChatSelect}
        selectedChat={selectedChat}
        users={users}
        chatRooms={chatRooms}
        logout={logout}
      />

      {selectedChat ? (
        <Box className={styles.content}>
          <Box className={styles.chatWrapper}>
            {selectedChat?.roomid
              ? roomMessages.map((item, index) => (
                  <Box key={index} className={styles.messageFromWrapper}>
                    <Box className={styles.username}>
                      {item.from !== user?.userid
                        ? users.find((i) => i.userid === item.from)?.username
                        : null}
                    </Box>
                    <Box
                      className={
                        item.from === user?.userid
                          ? styles.messageTo
                          : styles.messageFrom
                      }
                    >
                      {item.content}
                    </Box>
                    {item.from === user?.userid && <>status: {item.status}</>}
                  </Box>
                ))
              : messages
                  .filter(
                    (msg) =>
                      msg.recipient_id === selectedChat.userid ||
                      msg.from === selectedChat.userid
                  )
                  .map((item, index) => (
                    <Box key={index} className={styles.messageFromWrapper}>
                      <Box className={styles.username}>
                        {item.from !== user?.userid
                          ? users.find(
                              (currentUser) => currentUser.userid === item.from
                            )?.username
                          : null}
                      </Box>

                      <Box
                        className={
                          item.from === user?.userid
                            ? styles.messageTo
                            : styles.messageFrom
                        }
                      >
                        {item.content}
                        <Box className={styles.timeWrapper}>
                          {item.creation_time}
                        </Box>
                      </Box>
                      {item.from === user?.userid && <>status: {item.status}</>}
                    </Box>
                  ))}
          </Box>
          {errorMessage !== '' ? (
            <Box
              className={createRoomCSS.errorMessage}
              sx={{ textAlign: 'center', width: '65%' }}
            >
              {errorMessage}
            </Box>
          ) : (
            <Box
              className={createRoomCSS.errorMessageEmpty}
              sx={{ textAlign: 'center', width: '65%' }}
            ></Box>
          )}
          <Box className={styles.textInputWrapper}>
            <textarea
              className={styles.textarea}
              placeholder='Type a message...'
              name='message'
              {...formik.getFieldProps('message')}
            />

            <Box className={styles.sendIconWrapper}>
              <SendIcon
                className={styles.sendIcon}
                fontSize='large'
                onClick={formik.handleSubmit}
              />
            </Box>
          </Box>
        </Box>
      ) : (
        <Box className={styles.landingContent}>
          <Box className={styles.landingTitle}>
            <span className={styles.emphasize}>Welcome</span> to Your Chat Hub!
          </Box>
          <Box className={styles.landingSubtitle}>
            <span className={styles.emphasize}>Start</span> a conversation by{' '}
            <span className={styles.emphasize}>selecting</span> a chat room or a
            user from the sidebar.
          </Box>

          <img
            src='/images/landing-img.jpg'
            alt=''
            className={styles.landingImg}
          />
        </Box>
      )}
    </Box>
  )
}
export default Chat
