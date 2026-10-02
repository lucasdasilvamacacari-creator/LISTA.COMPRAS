/**
 * "Minhas listas" + "Entrar em uma lista" + criação de nova lista.
 *
 * Múltiplas listas por família (Mercado, Feira, Farmácia) e uma rede de
 * segurança: a lista só vive no link, então repetimos aqui o aviso de guardar
 * o link em outro lugar.
 */
import { useState } from 'react';
import { ListPlus, LogIn, Plus, Trash2 } from 'lucide-react';
import { extrairIdLista } from '@/lib/links';
import { t } from '@/i18n';
import type { ListaSalva } from '@/types';

interface Props {
  listaAtual: string | null;
  salvas: ListaSalva[];
  online: boolean;
  onAbrir: (listId: string) => void;
  onEsquecer: (listId: string) => void;
  onCriar: (nome: string) => void | Promise<void>;
  onEntrar: (listId: string) => void | Promise<void>;
}

export function MinhasListas({
  listaAtual,
  salvas,
  online,
  onAbrir,
  onEsquecer,
  onCriar,
  onEntrar,
}: Props): JSX.Element {
  const [nomeNova, setNomeNova] = useState('');
  const [textoEntrar, setTextoEntrar] = useState('');
  const [erroEntrar, setErroEntrar] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  async function criar(): Promise<void> {
    const nome = nomeNova.trim() || 'Mercado';
    if (!online) {
      setErroEntrar(t.erro.semConexaoPrimeiraVez);
      return;
    }
    setOcupado(true);
    try {
      await onCriar(nome);
      setNomeNova('');
      setErroEntrar(null);
    } finally {
      setOcupado(false);
    }
  }

  async function entrar(): Promise<void> {
    const id = extrairIdLista(textoEntrar);
    if (!id) {
      setErroEntrar(t.entrar.invalido);
      return;
    }
    if (!online) {
      setErroEntrar(t.entrar.precisaInternet);
      return;
    }
    setOcupado(true);
    try {
      setErroEntrar(null);
      await onEntrar(id);
      setTextoEntrar('');
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="space-y-8 pb-4">
      {/* Listas salvas neste aparelho */}
      <section>
        <h3 className="mb-2 text-sm font-medium text-base-700">{t.minhasListas.titulo}</h3>
        <p className="mb-3 text-xs leading-relaxed text-base-500">
          {t.minhasListas.explicacao}
        </p>

        {salvas.length === 0 ? (
          <p className="card p-4 text-sm text-base-500">{t.minhasListas.vazio}</p>
        ) : (
          <ul className="card divide-y divide-base-200 overflow-hidden">
            {salvas.map((lista) => {
              const atual = lista.id === listaAtual;
              return (
                <li key={lista.id} className="flex items-stretch">
                  <button
                    type="button"
                    onClick={() => onAbrir(lista.id)}
                    disabled={atual}
                    className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left
                               hover:bg-base-50 disabled:cursor-default"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{lista.nome}</span>
                      <span className="mt-0.5 block truncate font-mono text-xs text-base-500">
                        {lista.id}
                      </span>
                    </span>
                    {atual && (
                      <span className="shrink-0 rounded-full bg-accent-100 px-2 py-0.5 text-xs font-medium text-accent-700">
                        ●
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(t.minhasListas.esquecerConfirma)) onEsquecer(lista.id);
                    }}
                    aria-label={`${t.minhasListas.esquecer}: ${lista.nome}`}
                    className="tap shrink-0 border-l border-base-200 px-3 text-base-500 hover:bg-base-100 hover:text-danger"
                  >
                    <Trash2 size={17} aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Criar nova lista */}
      <section>
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-base-700">
          <ListPlus size={15} aria-hidden="true" />
          {t.minhasListas.criar}
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={nomeNova}
            onChange={(e) => setNomeNova(e.target.value.slice(0, 60))}
            placeholder={t.minhasListas.criarNomePlaceholder}
            aria-label={t.minhasListas.criarNome}
            className="field min-w-0 flex-1"
          />
          <button
            type="button"
            onClick={() => void criar()}
            disabled={ocupado || !online}
            className="btn-primary shrink-0 gap-1.5"
          >
            <Plus size={17} aria-hidden="true" />
            {t.minhasListas.criar}
          </button>
        </div>
        {!online && (
          <p className="mt-1.5 text-xs text-warn">{t.erro.semConexaoPrimeiraVez}</p>
        )}
      </section>

      {/* Entrar em uma lista existente */}
      <section>
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-base-700">
          <LogIn size={15} aria-hidden="true" />
          {t.entrar.titulo}
        </h3>
        <p className="mb-3 text-xs leading-relaxed text-base-500">{t.entrar.explicacao}</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={textoEntrar}
            onChange={(e) => {
              setTextoEntrar(e.target.value);
              setErroEntrar(null);
            }}
            placeholder={t.entrar.campoPlaceholder}
            aria-label={t.entrar.campo}
            autoComplete="off"
            spellCheck={false}
            className="field min-w-0 flex-1 font-mono text-sm"
          />
          <button
            type="button"
            onClick={() => void entrar()}
            disabled={ocupado || textoEntrar.trim().length === 0}
            className="btn-outline shrink-0"
          >
            {t.entrar.acao}
          </button>
        </div>
        {erroEntrar && (
          <p className="mt-1.5 text-xs text-danger" role="alert">
            {erroEntrar}
          </p>
        )}
      </section>
    </div>
  );
}
