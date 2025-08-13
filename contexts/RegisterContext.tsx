"use client"

import { createContext, useContext } from "react"

const RegisterContext = createContext(null)

export const useRegister = () => {
  return useContext(RegisterContext)
}

export const RegisterProvider = ({ children }) => {
  // You can add register logic here if needed
  const register = async (registrationData) => {
    // Placeholder for registration logic
    console.log("Registering user:", registrationData)
  }

  return <RegisterContext.Provider value={{ register }}>{children}</RegisterContext.Provider>
}
