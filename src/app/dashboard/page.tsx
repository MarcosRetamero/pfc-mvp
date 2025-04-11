"use client";

import { useEffect, useState } from "react";
import { Tabs, Tab, Box, Grid, Typography } from "@mui/material";
import EstadisticasGenerales from "./../../components/estadisticasGenerales";
import GalponCard from "./../../components/galponCard";
import AlertasList from "./../../components/alertasList";

type Galpon = {
  id: string;
  nombre: string;
  temperatura: number;
  humedad: number;
  estado: "normal" | "precaucion" | "critico";
  pollosVivos: number;
  pollosFallecidos: number;
  alertas: Alerta[];
};

type Alerta = {
  tipo: "normal" | "precaucion" | "critico";
  mensaje: string;
};

export default function DashboardPage() {
  const [galpones, setGalpones] = useState<Galpon[]>([]);
  const [tab, setTab] = useState(0);
  const [galponSeleccionado, setGalponSeleccionado] = useState<string | null>(
    null
  );

  useEffect(() => {
    fetch("/backend.json")
      .then((res) => res.json())
      .then((data) => setGalpones(data.galpones));
  }, []);

  return (
    <Box className="p-6">
      {!galponSeleccionado ? (
        <>
          <EstadisticasGenerales galpones={galpones} />

          <Box className="mt-6 border-b border-gray-300">
            <Tabs
              value={tab}
              onChange={(_, newTab) => setTab(newTab)}
              aria-label="tabs"
            >
              <Tab label="Galpones" />
              <Tab label="Alertas" />
            </Tabs>
          </Box>

          {tab === 0 && (
            <div className="py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galpones.map((galpon) => (
                <div key={galpon.id}>
                  <GalponCard
                    galpon={galpon}
                    onSelect={() => setGalponSeleccionado(galpon.id)}
                  />
                </div>
              ))}
            </div>
          )}

          {tab === 1 && (
            <Box className="mt-4">
              <AlertasList galpones={galpones} />
            </Box>
          )}
        </>
      ) : (
        <Box>
          <Typography variant="h5">
            Vista de detalles del galpón {galponSeleccionado}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
