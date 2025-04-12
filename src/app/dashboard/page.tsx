"use client";

import { useEffect, useState } from "react";
import { Tabs, Tab, Box, Typography } from "@mui/material";
import EstadisticasGenerales from "@/components/estadisticasGenerales";
import GalponCard from "@/components/galponCard";
import AlertasList from "@/components/alertasList";
  

// Tipos locales
type Alerta = {
  alertaId: number;
  seccionId: number;
  tipo: "normal" | "precaucion" | "critico";
  descripcion: string;
  fechaHora: string;
  resuelta: boolean;
  resolucion: string;
};

type Galpon = {
  galponId: number;
  nombre: string;
  temperatura: number;
  humedad: number;
  estado: "normal" | "precaucion" | "critico";
  pollosVivos: number;
  pollosFallecidos: number;
  alertas: Alerta[];
};

type secciones = {
  seccionId: number;
  galponId: number;
  nombre: string;
  temperatura: number;
  humedad: number;
  fechaHora: string;
};

type camadaGalpon = {
  registroId: number;
  galponId: number;
  camadaId: number;
  cantidadInicial: number;
};

type registroCamadaGalpon = {
  registroId: number;
  galponId: number;
  fecha: string;
  pesoPromedio: number;
  cantidadMuestra: number;
  cantidadMuertes: number;
  motivoMuerte: string;
};

export default function DashboardPage() {
  const [galpones, setGalpones] = useState<Galpon[]>([]);
  const [tab, setTab] = useState(0);
  const [galponSeleccionado, setGalponSeleccionado] = useState<number | null>(null);

  useEffect(() => { // esto ejecuta la funcion seteoDeGalpones(); la primera vez que la pagina se renderice
    seteoDeGalpones();
  }, []);

  const seteoDeGalpones = () => {
    fetch("/backend.json") // Te traes los datos
      .then((res) => res.json())
      .then((data) => {
        const { galpones, secciones, registroCamadaGalpon, alertas, camadaGalpon } = data;

        const galponesEnriquecidos: Galpon[] = galpones.map((g: Galpon) => {
          const seccionesGalpon = secciones.filter((s: secciones) => s.galponId === g.galponId);
          const alertasGalpon = alertas.filter((a: Alerta) =>
            seccionesGalpon.some((s: secciones) => s.seccionId === a.seccionId)
          );

          const temperaturas = seccionesGalpon.map((s: secciones) => s.temperatura);
          const humedades = seccionesGalpon.map((s: secciones) => s.humedad);

          const promedio = (arr: number[]) =>
            arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

          const tempProm = promedio(temperaturas);
          const humProm = promedio(humedades);

          // Calcular estado según alertas
          const tipos = alertasGalpon.map((a: Alerta) => a.tipo);
          const estado = tipos.includes("critico")
            ? "critico"
            : tipos.includes("precaucion")
            ? "precaucion"
            : "normal";

          // Datos de población
          const camadaRel = camadaGalpon.find((cg: camadaGalpon) => cg.galponId === g.galponId);
          const muertes = registroCamadaGalpon
            .filter((r: registroCamadaGalpon) => r.galponId === g.galponId)
            .reduce((acc: number, r: registroCamadaGalpon) => acc + r.cantidadMuertes, 0);

          const vivos = camadaRel ? camadaRel.cantidadInicial - muertes : 0;

          return {
            galponId: g.galponId,
            nombre: g.nombre,
            temperatura: parseFloat(tempProm.toFixed(1)),
            humedad: parseFloat(humProm.toFixed(1)),
            estado,
            pollosVivos: vivos,
            pollosFallecidos: muertes,
            alertas: alertasGalpon,
          };
        });

        setGalpones(galponesEnriquecidos);
      });
  };

  return (
    <Box className="p-6">
      {!galponSeleccionado ? (
        <>
          <EstadisticasGenerales galpones={galpones} />

          <Box className="mt-6 border-b border-black">
            <Tabs value={tab} onChange={(_, newTab) => setTab(newTab)} aria-label="tabs">
              <Tab label="Galpones" />
              <Tab label="Alertas" />
            </Tabs>
          </Box>

          {tab === 0 && (
            <div className="py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galpones.map((galpon) => (
                <div key={galpon.galponId}>
                  <GalponCard
                    galpon={galpon}
                    onSelect={() => setGalponSeleccionado(galpon.galponId)}
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
          <Typography variant="h5" color="black">
            Vista de detalles del galpón {galponSeleccionado}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
