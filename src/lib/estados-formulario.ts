/**
 * Estados iniciais e tipos dos formulários que usam `useActionState`.
 * Fica fora dos arquivos "use server", que só podem exportar funções async.
 */

export type EstadoFormulario = {
  ok: boolean;
  mensagem?: string;
  erros?: Record<string, string>;
};

export type EstadoLogin = {
  erro?: string;
  erros?: Record<string, string>;
};

export const ESTADO_INICIAL: EstadoFormulario = { ok: false };
export const ESTADO_VEICULO: EstadoFormulario = { ok: false };
export const ESTADO_SIMPLES: EstadoFormulario = { ok: false };
export const ESTADO_LOGIN: EstadoLogin = {};
