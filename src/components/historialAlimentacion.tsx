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
  Paper,
  Stack
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
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Estadísticas de Consumo
            </Typography>
            {/* Reemplazamos Grid container con Stack */}
            <Stack
              direction="row"
              spacing={2} // Mantenemos el espaciado original
              flexWrap="wrap" // Permitimos que los elementos se ajusten
              useFlexGap // Mejoramos la gestión del espaciado
            >
              {/* Reemplazamos Grid item con Box */}
              <Box
                sx={{
                  width: { xs: '100%', md: (theme) => `calc(50% - ${theme.spacing(1)})` }, // theme.spacing(1) es la mitad de spacing={2}
                  mb: { xs: 2, md: 0 } // Añadimos margen inferior en móviles si están apilados
                }}
              >
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Último Período de Consumo Registrado
                  </Typography>
                  {galpon && calcularConsumoEstimado(galpon.galponId) ? (
                    <>
                      <Typography variant="body2">
                        Consumo Diario Estimado: {calcularConsumoEstimado(galpon.galponId)?.consumoDiario.toFixed(2)} kg/día
                      </Typography>
                      <Typography variant="body2">
                        Días Desde Última Reposición: {calcularConsumoEstimado(galpon.galponId)?.diasTranscurridos} días
                      </Typography>
                      <Typography variant="body2">
                        Cantidad en Última Reposición: {calcularConsumoEstimado(galpon.galponId)?.cantidadInicial} kg
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body2">
                      No hay suficientes datos para calcular el consumo del último período.
                    </Typography>
                  )}
                </Paper>
              </Box>
              {/* Reemplazamos Grid item con Box */}
              <Box
                sx={{
                  width: { xs: '100%', md: (theme) => `calc(50% - ${theme.spacing(1)})` }
                }}
              >
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Promedio General de Reposiciones
                  </Typography>
                  {reposicionesGalpon.length > 0 ? (
                    <Typography variant="body2">
                      Cantidad Promedio por Reposición: {
                        (reposicionesGalpon.reduce((acc, curr) => acc + curr.cantidadKg, 0) / reposicionesGalpon.length).toFixed(2)
                      } kg
                    </Typography>
                  ) : (
                     <Typography variant="body2">
                      No hay reposiciones registradas para este galpón.
                    </Typography>
                  )}
                   <Typography variant="body2" sx={{ mt: 1}}>
                      Total de Reposiciones Registradas: {reposicionesGalpon.length}
                    </Typography>
                </Paper>
              </Box>
            </Stack>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  )
}