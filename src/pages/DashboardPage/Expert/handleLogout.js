import { logout } from '../../../Services/authService'

export const handleLogout = (navigate) => {
  logout()
  navigate('/')
}

export const createHandleLogout = (navigate) => () => handleLogout(navigate)
