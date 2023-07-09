import React from 'react'
import './app.css'
import { Admin, Bids, Landing, Login, Projects, Signup } from './containers'
import { Route, Routes } from 'react-router-dom'
const App = () => {
  return (
    <>



      <Routes>
        <Route>
          <Route path='/' element={<Landing />} />
          <Route path='/projects' element={<Projects />} />
          <Route path='/bids' element={<Bids />} />
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/admin' element={<Admin />} />

        </Route>
      </Routes>



      {/* <Landing /> */}
      {/* <Projects /> */}
      {/* <Bids /> */}

      {/* <Login /> */}
      {/* <Signup /> */}



    </>
  )
}

export default App