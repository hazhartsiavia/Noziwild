// Photo Google de l'utilisateur, ou sa première lettre sur fond doré
import React from 'react'

function Avatar({ user, className = 'w-10 h-10 text-base' }) {
  if (user.avatarUrl) {
    return <img src={user.avatarUrl} alt="" referrerPolicy="no-referrer" className={`${className} shrink-0 rounded-full object-cover`} />
  }
  return (
    <span aria-hidden="true" className={`${className} shrink-0 rounded-full bg-[#C49849] text-white font-medium flex items-center justify-center`}>
      {user.name.charAt(0).toUpperCase()}
    </span>
  )
}

export default Avatar
