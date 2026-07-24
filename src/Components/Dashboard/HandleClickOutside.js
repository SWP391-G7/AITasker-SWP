import { useEffect, useRef, useState } from 'react'

const useHandleClickOutside = (initialOpen = false) => {
  const [isProfileOpen, setIsProfileOpen] = useState(initialOpen)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return { isProfileOpen, setIsProfileOpen, dropdownRef }
}

export default useHandleClickOutside
