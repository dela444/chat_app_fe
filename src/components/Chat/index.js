import { Box } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import SendIcon from '@mui/icons-material/Send'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import axios from 'axios'

import mySocket from '../../socket'
import { UserContext } from '../../UserContext'
import Sidebar from '../Sidebar'
import styles from './Chat.module.css'
import { BACKEND_URL, FRONTEND_URL } from '../../constants/appDefaults'

const Chat = () => {
  const { setUser, user } = useContext(UserContext)
  const [selectedChat, setSelectedChat] = useState(null)
  const [socket, setSocket] = useState(() => mySocket(user))
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
        const data = { ...values, userid: user?.userid }
        const response = await axios.post(BACKEND_URL + '/message', data)
        if (response.data && Object.keys(response.data).length > 0) {
          if (response.data.success) {
            const isRoomMessage = Boolean(selectedChat.roomid)

            const sendTo = isRoomMessage
              ? selectedChat.roomid
              : selectedChat.userid

            const message = {
              to: sendTo,
              from: user?.userid,
              content: response.data.message,
              isRoomMessage,
            }

            socket.emit('sendMessage', message)

            if (selectedChat.userid) {
              setMessages((prevMessages) => [...prevMessages, message])
            } else {
              setRoomMessages((prevMessages) => [...prevMessages, message])
            }
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
    setSocket(() => mySocket(user))
  }, [user])

  useEffect(() => {
    socket.connect()
    socket.on('users', (usersList) => {
      setUsers(usersList)
    })
    socket.on('rooms', (roomsList) => {
      setChatRooms(roomsList)
    })
    socket.on('sendMessage', (message) => {
      const isRoomMessage = selectedChat.roomid ? true : false
      if (isRoomMessage) {
        setRoomMessages((prevMessages) => [...prevMessages, message])
      } else {
        setMessages((prevMessages) => [...prevMessages, message])
      }
    })
    socket.on('messages', (data) => {
      setMessages(data.reverse())
    })
    socket.on('roomMessages', (data) => {
      setRoomMessages(data.reverse())
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
      socket.off('connected')
    }
  }, [setUser, socket, setUsers])

  useEffect(() => {
    const myUser = users.find((item) => item.username === user.username)
    if (myUser?.userid) {
      setUser({ ...user, userid: myUser.userid })
    }
  }, [users])

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
            {selectedChat.roomid
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
                  </Box>
                ))
              : messages
                  .filter(
                    (msg) =>
                      msg.to === selectedChat.userid ||
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
                      </Box>
                    </Box>
                  ))}
          </Box>
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
        <Box>Join in some chat</Box>
      )}
    </Box>
  )
}
export default Chat
