'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Paper
} from '@mui/material'
import { Close } from '@mui/icons-material'

interface HistorialAlimentacionProps {
  open: boolean;
  onClose: () => void;
  galpon: any;
  reposiciones: any[];
  calcularConsumoEstimado: (galponId: number) => {
    cantidadInicial: number;
    diasTranscurridos: number;
    consumoDiario: number;
  } | null;
}

export default function HistorialAlimentacion({
  open,
  onClose,
  galpon,
  reposiciones,
  calcularConsumoEstimado
}: HistorialAlimentacionProps) {
  const [tabValue, setTabValue] = useState(0)

  const reposicionesGalpon = reposiciones
    .filter(r => r.galponId === galpon?.galponId)
    .sort((a, b) => new Date(b.fechaReposicion).getTime() - new Date(a.fechaReposicion).getTime())

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Historial de Alimentación - {galpon?.nombre}
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Tabs 
          value={tabValue} 
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          <Tab label="Reposiciones" />
          <Tab label="Consumo Estimado" />
        </Tabs>

        {tabValue === 0 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Cantidad (kg)</TableCell>
                  <TableCell>Tipo Alimento</TableCell>
                  <TableCell>Observaciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reposicionesGalpon.map((reposicion) => (
                  <TableRow key={reposicion.reposicionId}>
                    <TableCell>
                      {new Date(reposicion.fechaReposicion).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{reposicion.cantidadKg}</TableCell>
                    <TableCell>{reposicion.tipoAlimento}</TableCell>
                    <TableCell>{reposicion.observaciones || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tabValue === 1 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Estadísticas de Consumo
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Último Período
                  </Typography>
                  {calcularConsumoEstimado(galpon?.galponId) && (
                    <>
                      <Typography variant="body2">
                        Consumo Diario: {calcularConsumoEstimado(galpon?.galponId)?.consumoDiario.toFixed(2)} kg/día
                      </Typography>
                      <Typography variant="body2">
                        Días Transcurridos: {calcularConsumoEstimado(galpon?.galponId)?.diasTranscurridos} días
                      </Typography>
                    </>
                  )}
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Promedio General
                  </Typography>
                  <Typography variant="body2">
                    Consumo Promedio: {
                      (reposicionesGalpon.reduce((acc, curr) => acc + curr.cantidadKg, 0) / reposicionesGalpon.length).toFixed(2)
                    } kg/reposición
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  )
}