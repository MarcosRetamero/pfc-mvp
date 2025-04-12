'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Typography, Box } from '@mui/material'
import FormularioCamada from '../../../components/formularioCamada'

export default function NuevaCamadaPage() {
  const router = useRouter()

  // Verificar si el usuario está autenticado
  useEffect(() => {
    const usuario = localStorage.getItem('usuario')
    if (!usuario) {
      router.push('/login')
    }
  }, [router])

  return (
    <div className="p-6">
      <Box className="mb-6">
        <Typography variant="h4" component="h1">
          Nueva Camada
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Completa el formulario para registrar una nueva camada de aves
        </Typography>
      </Box>

      <FormularioCamada />
    </div>
  )
}