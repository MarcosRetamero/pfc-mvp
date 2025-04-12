import DetalleCamadaClient from '../../../components/detalleCamada'

export default function DetalleCamadaPage({ params }: { params: { id: string } }) {
  return <DetalleCamadaClient id={params.id} />
}