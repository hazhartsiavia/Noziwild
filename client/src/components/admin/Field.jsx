// Libellé + champ + aide ou erreur, pour les formulaires de l'admin
import React, { useId } from 'react'

function Field({ label, error, hint, className = '', children }) {
  const id = useId()
  const describedBy = error || hint ? `${id}-help` : undefined
  return (
    <div className={className}>
      <label htmlFor={id} className="block mb-1.5 text-sm text-slate-700">{label}</label>
      {/* Le champ reçoit l'id, l'état d'erreur et la description */}
      {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy })}
      {error ? (
        <p id={`${id}-help`} className="mt-1 text-sm text-red-700">{error}</p>
      ) : hint ? (
        <p id={`${id}-help`} className="mt-1 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  )
}

export default Field
