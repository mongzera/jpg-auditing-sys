import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Dashboard from './dashboard/Dashboard.tsx'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Login from './auth/login/Login.tsx'
import CreateAccount from './auth/create-account/CreateAccount.tsx'
import PrivateRoute from './auth/PrivateRoute.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
          <Route path='/' element={<Navigate to={'/login'}/>}/>
          <Route path='/login' element={<Login />}/>
          <Route path='/create-account' element={<CreateAccount />}/>
          
          <Route element={<PrivateRoute/>}>
            <Route path='/dashboard' element={<Dashboard />}/>
          </Route>
          
          <Route path="*" element={<h2>Eror 404: Not found</h2>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
