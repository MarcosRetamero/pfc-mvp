'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Typography, Box } from '@mui/material'
import ListaCamadas from '../../components/listaCamadas'

export default function CamadasPage() {
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
        <Typography variant="h4" component="h1" color="black">
          Gestión de Camadas
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Consulta y administra las camadas de aves registradas
        </Typography>
      </Box>

      <ListaCamadas />
    </div>
  )
}