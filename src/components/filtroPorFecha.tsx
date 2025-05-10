// components/FiltrarPorFecha.tsx
"use client";

import { useState, useEffect } from "react";
import dayjs from "dayjs";

interface Props {
  tabla: string;
  campoFecha: string;
  startDate: string;
  endDate: string;
}

export default function FiltrarPorFecha({ tabla, campoFecha, startDate, endDate }: Props) {
  const [resultados, setResultados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/backend_final_actualizado.json");
      const db = await res.json();
      const tablaDatos = db[tabla];

      if (!Array.isArray(tablaDatos)) {
        console.error(`Tabla "${tabla}" no encontrada o inválida`);
        return;
      }

      const filtrados = tablaDatos.filter((item: any) => {
        const fechaItem = dayjs(item[campoFecha]);
        return fechaItem.isAfter(dayjs(startDate).subtract(1, 'day')) &&
               fechaItem.isBefore(dayjs(endDate).add(1, 'day'));
      });

      setResultados(filtrados);
      setLoading(false);
    }

    fetchData();
  }, [tabla, campoFecha, startDate, endDate]);

  if (loading) return <p>Cargando...</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Resultados ({resultados.length})</h2>
      <pre className="text-sm bg-gray-100 p-3 rounded max-h-[400px] overflow-y-auto">
        {JSON.stringify(resultados, null, 2)}
      </pre>
    </div>
  );
}
