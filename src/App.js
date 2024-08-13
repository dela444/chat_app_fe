import { BrowserRouter, Route, Routes } from 'react-router-dom'

import './App.css'
import Authentication from './components/Authentication'
import Chat from './components/Chat'
import { UserProvider } from './UserContext'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <Routes>
          <Route
            path={'/login'}
            element={<Authentication isLogin={true} />}
          ></Route>
          <Route
            path={'/register'}
            element={<Authentication isLogin={false} />}
          ></Route>
          <Route
            path={'/chat'}
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          ></Route>
          <Route path={'*'} element={<Authentication isLogin={true} />}></Route>
        </Routes>
      </UserProvider>
    </BrowserRouter>
  )
}

export default App
