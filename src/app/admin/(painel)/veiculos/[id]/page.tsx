import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { FormularioVeiculo } from "@/components/admin/formulario-veiculo";
import { carregarOpcoesVeiculo, centavosParaCampo } from "@/lib/admin-veiculos";
import { prisma } from "@/lib/prisma";
import { dataHora, numero } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PaginaEditarVeiculo(
  props: PageProps<"/admin/veiculos/[id]">,
) {
  const { id } = await props.params;

  const [veiculo, opcoes] = await Promise.all([
    prisma.veiculo.findUnique({
      where: { id },
      include: {
        imagens: { orderBy: { ordem: "asc" } },
        opcionais: { select: { opcionalId: true } },
      },
    }),
    carregarOpcoesVeiculo(),
  ]);

  if (!veiculo) notFound();

  return (
    <>
      <Link
        href="/admin/veiculos"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-text-muted hover:text-brand"
      >
        <ChevronLeft size={16} />
        Voltar para a lista
      </Link>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-text">
            Editar veículo
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            {numero(veiculo.visitas)} visitas · atualizado em{" "}
            {dataHora(veiculo.atualizadoEm)}
          </p>
        </div>
        <Link
          href={`/veiculo/${veiculo.slug}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
        >
          Ver no site
          <ExternalLink size={14} />
        </Link>
      </div>

      <FormularioVeiculo
        inicial={{
          id: veiculo.id,
          marcaId: veiculo.marcaId,
          modeloId: veiculo.modeloId,
          versao: veiculo.versao,
          anoFabricacao: veiculo.anoFabricacao,
          anoModelo: veiculo.anoModelo,
          preco: centavosParaCampo(veiculo.precoCentavos),
          precoDe: centavosParaCampo(veiculo.precoDeCentavos),
          precoFipe: centavosParaCampo(veiculo.precoFipeCentavos),
          precoMedio: centavosParaCampo(veiculo.precoMedioCentavos),
          quilometragem: veiculo.quilometragem,
          cambio: veiculo.cambio,
          combustivel: veiculo.combustivel,
          carroceria: veiculo.carroceria,
          condicao: veiculo.condicao,
          status: veiculo.status,
          cor: veiculo.cor,
          portas: veiculo.portas,
          finalPlaca: veiculo.finalPlaca ?? "",
          placa: veiculo.placa ?? "",
          renavam: veiculo.renavam ?? "",
          blindado: veiculo.blindado,
          aceitaTroca: veiculo.aceitaTroca,
          unicoDono: veiculo.unicoDono,
          ipvaPago: veiculo.ipvaPago,
          licenciado: veiculo.licenciado,
          garantiaFabrica: veiculo.garantiaFabrica,
          revisoesEmDia: veiculo.revisoesEmDia,
          destaque: veiculo.destaque,
          descricao: veiculo.descricao,
          videoUrl: veiculo.videoUrl ?? "",
          tour360Url: veiculo.tour360Url ?? "",
          cidade: veiculo.cidade,
          estado: veiculo.estado,
          ordem: veiculo.ordem,
          imagens: veiculo.imagens.map((i) => ({ url: i.url, alt: i.alt })),
          opcionais: veiculo.opcionais.map((o) => o.opcionalId),
        }}
        marcas={opcoes.marcas}
        modelos={opcoes.modelos}
        opcionaisDisponiveis={opcoes.opcionais}
      />
    </>
  );
}
