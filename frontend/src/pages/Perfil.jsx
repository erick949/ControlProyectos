import { useState } from 'react'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { IconUser } from '../components/ui/Icons'

const ROLE_LABEL = {
  jefe: 'Jefe de Departamento de Investigación',
  investigador: 'Investigador',
}

export default function Perfil({ session }) {
  const [nombre, setNombre] = useState(session?.nombre || '')
  const [savedMsg, setSavedMsg] = useState('')

  function handleSave(e) {
    e.preventDefault()
    // Nota: sin backend real; esto solo refleja el cambio en esta sesión.
    setSavedMsg('Cambios guardados correctamente.')
    setTimeout(() => setSavedMsg(''), 2500)
  }

  return (
    <div className="max-w-[700px] mx-auto px-4 sm:px-8 py-10">
      <h1 className="text-[22px] font-bold text-textprimary mb-1">Mi Perfil</h1>
      <p className="text-[13px] text-neutral mb-6">Consulta y actualiza tu información</p>

      <div className="bg-surface rounded-card shadow-panel p-6 sm:p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <IconUser className="w-9 h-9 text-primary" />
          </div>
          <div>
            <p className="text-[16px] font-bold text-textprimary">{session?.nombre}</p>
            <p className="text-[12px] text-neutral">{ROLE_LABEL[session?.role]}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4 max-w-sm">
          <Input
            label="Nombre para mostrar"
            onDark={false}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <Input label="Rol" onDark={false} value={ROLE_LABEL[session?.role] || ''} disabled />

          {savedMsg && <p className="text-[12px] text-emerald-600">{savedMsg}</p>}

          <Button type="submit" variant="primary" className="mt-2 w-fit">
            Guardar Cambios
          </Button>
        </form>
      </div>
    </div>
  )
}