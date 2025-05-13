'use client'

import React from 'react'
import { Box } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'

interface Registro {
  id: string
  fecha: string
  avesVivas: number
  avesFallecidas: number
  alimento: number
  pesoProm: number
  tasaCrec: number
  tasaEngorde: number
  temp: number
  humedad: number
}

interface Galpon {
  galponId: number
  nombre: string
}

interface GalponReportTableProps {
  galpon: Galpon
  registros: Registro[]
}

export default function GalponReportTable({
  galpon,
  registros
}: GalponReportTableProps) {
  const columns: GridColDef[] = [
    {
      field: 'fecha',
      headerName: 'Fecha',
      flex: 1,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'avesVivas',
      headerName: 'Aves Vivas',
      type: 'number',
      flex: 1,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'avesFallecidas',
      headerName: 'Aves Fallecidas',
      type: 'number',
      flex: 1,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'alimento',
      headerName: 'Alimento (kg)',
      type: 'number',
      flex: 1,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'pesoProm',
      headerName: 'Peso Prom. (kg)',
      type: 'number',
      flex: 1,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'tasaCrec',
      headerName: 'Crec. kg/día',
      type: 'number',
      flex: 1,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'tasaEngorde',
      headerName: 'ICA',
      type: 'number',
      flex: 1,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'temp',
      headerName: 'Temp. (°C)',
      type: 'number',
      flex: 1,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'humedad',
      headerName: 'Hum. (%)',
      type: 'number',
      flex: 1,
      headerAlign: 'center',
      align: 'center'
    }
  ]

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
<DataGrid
          autoHeight
          rows={registros}
          columns={columns}
          getRowId={(row) => row.registroId || row.id} // Ensure a unique ID
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 25]} // Changed from rowsPerPageOptions
          density="compact"
          sx={{
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'background.default'
          },
          '& .MuiDataGrid-cell': {
            justifyContent: 'center'
          }
        }}
      />
    </Box>
  )
}
