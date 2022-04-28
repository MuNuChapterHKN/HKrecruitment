import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect } from 'react';
import MyNavbar from './MyNavbar.js';
import SignupForm from './SignupForm.js'
import { Route } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { Routes } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import AvaiabilitiesTable from './AvaiabilitiesTable';






function App() {
  const {
    isLoading,
    isAuthenticated,
    error,
    user,
    loginWithRedirect,
    logout,
  } = useAuth0();









  return <Routes>
    <Route path="/" element={<AfterLogin isAuthenticated={isAuthenticated} user={user}/>}/>
    <Route path="/*" element={<Navigate to="/"/>}/>
    </Routes>
}
export default App;

function AfterLogin(props){
  return <div> <MyNavbar/>

           {props.isAuthenticated && !props.user.email.endsWith("@hknpolito.org") && <SignupForm/>}
           {props.isAuthenticated && props.user.email.endsWith("@hknpolito.org") && <AvaiabilitiesTable/>}

  
    </div> 
}