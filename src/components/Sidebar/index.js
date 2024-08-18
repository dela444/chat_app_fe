import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import CircleIcon from '@mui/icons-material/Circle'
import ClearIcon from '@mui/icons-material/Clear'
import AddIcon from '@mui/icons-material/Add'
import MenuIcon from '@mui/icons-material/Menu'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import PersonIcon from '@mui/icons-material/Person'
import { useContext, useEffect, useState } from 'react'
import GroupIcon from '@mui/icons-material/Group'

import styles from './Sidebar.module.css'
import { UserContext } from '../../UserContext'
import CreateRoomModal from '../CreateRoomModal'

const drawerWidth = 270

const Sidebar = ({
  handleChatSelect,
  selectedChat,
  users,
  chatRooms,
  logout,
}) => {
  const { user } = useContext(UserContext)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [openModal, setOpenModal] = useState(false)

  const handleDrawerClose = () => {
    setIsClosing(true)
    setMobileOpen(false)
  }

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false)
  }

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen)
    }
  }

  useEffect(() => {
    setMobileOpen(false)
  }, [selectedChat])

  const drawer = (
    <Box className={styles.sidebarContent}>
      <Box className={styles.accountIconWrapper}>
        <PersonIcon className={styles.accountIcon} />

        <Typography>{user?.username}</Typography>
        {mobileOpen ? (
          <ClearIcon
            onClick={handleDrawerToggle}
            sx={{ cursor: 'pointer', marginRight: '5px' }}
          />
        ) : null}
      </Box>
      <Divider />
      <Typography className={styles.subtitle}>Chat rooms</Typography>
      <List className={styles.list}>
        {chatRooms.map((item) => (
          <Box
            onClick={() => {
              handleChatSelect(item)
            }}
            className={styles.sidebarItem}
            key={item.name}
          >
            <ListItem disablePadding className={styles.itemBox}>
              <ListItemButton
                className={`${
                  item.name === selectedChat?.name ? styles.activePage : ''
                }`}
              >
                <ListItemIcon sx={{ color: '#00a9a2' }}>
                  <GroupIcon />
                </ListItemIcon>
                <ListItemText primary={item.name} />
              </ListItemButton>
            </ListItem>
          </Box>
        ))}
      </List>
      <Box className={styles.sidebarItem} sx={{ padding: '0 0 10px 0' }}>
        <Button
          className={styles.addButton}
          onClick={() => {
            setOpenModal(true)
          }}
        >
          <AddIcon className={styles.itemIcon} />
          Create new room
        </Button>
      </Box>
      <Divider />
      <Typography className={styles.subtitle}>Users</Typography>
      <List className={styles.list}>
        {users
          .filter((currentUser) => currentUser.username !== user.username)
          .map((item) => (
            <Box
              onClick={() => {
                handleChatSelect(item)
              }}
              className={styles.sidebarItem}
              key={item.username}
            >
              <ListItem disablePadding className={styles.itemBox}>
                <ListItemButton
                  className={`${
                    item.username === selectedChat?.username
                      ? styles.activePage
                      : ''
                  }`}
                >
                  <ListItemIcon sx={{ color: '#00a9a2' }}>
                    <AccountCircleIcon />
                  </ListItemIcon>
                  <ListItemText primary={item.username} />
                  <ListItemIcon sx={{ color: '#00a9a2' }}>
                    <CircleIcon
                      sx={
                        item.connected === true || item.connected === 'true'
                          ? { color: 'green' }
                          : { color: 'red' }
                      }
                    />
                  </ListItemIcon>
                </ListItemButton>
              </ListItem>
            </Box>
          ))}
      </List>
      <Box className={styles.navbarBottomWrapper}>
        <Divider />
        <Box className={styles.itemBox} sx={{ width: 'auto !important' }}>
          <ListItemButton onClick={logout}>
            <ListItemIcon sx={{ color: '#00a9a2' }}>
              <LogoutIcon className={styles.itemIcon} />
            </ListItemIcon>
            <ListItemText primary='Logout' />
          </ListItemButton>
        </Box>
      </Box>
    </Box>
  )

  return (
    <Box>
      <CreateRoomModal
        openModal={openModal}
        onClose={() => {
          setOpenModal(false)
        }}
      />
      <AppBar
        position='fixed'
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          display: { sm: 'none' },
        }}
        className={styles.appBar}
      >
        <Toolbar>
          <IconButton
            color='inherit'
            edge='start'
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant='h6' noWrap component='div'>
            {selectedChat
              ? selectedChat?.name
                ? selectedChat.name
                : selectedChat.username
              : null}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        component='nav'
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant='temporary'
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant='permanent'
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
    </Box>
  )
}

export default Sidebar
