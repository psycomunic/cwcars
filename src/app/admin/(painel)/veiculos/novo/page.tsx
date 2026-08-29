import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { FormularioVeiculo } from "@/components/admin/formulario-veiculo";
import { VEICULO_EM_BRANCO } from "@/lib/veiculo-formulario";
import { carregarOpcoesVeiculo } from "@/lib/admin-veiculos";
import { obterConfiguracao } from "@/lib/configuracao";

export const dynamic = "force-dynamic";

export default async function PaginaNovoVeiculo() {
  const [opcoes, config] = await Promise.all([
    carregarOpcoesVeiculo(),
    obterConfiguracao(),
  ]);

  return (
    <>
      <Link
        href="/admin/veiculos"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-text-muted hover:text-brand"
      >
        <ChevronLeft size={16} />
        Voltar para a lista
      </Link>

      <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-text">
        Cadastrar veículo
      </h1>

      <FormularioVeiculo
        inicial={{
          ...VEICULO_EM_BRANCO,
          cidade: config.cidade,
          estado: config.estado,
        }}
        marcas={opcoes.marcas}
        modelos={opcoes.modelos}
        opcionaisDisponiveis={opcoes.opcionais}
      />
    </>
  );
}
