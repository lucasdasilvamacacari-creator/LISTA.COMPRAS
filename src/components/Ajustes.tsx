/**
 * Ajustes: nome do usuário (local), tema, preços, nome da lista, ordem dos
 * corredores, instalação e privacidade.
 */
import { useState } from 'react';
import { HardDrive, Info, Moon, Shield, Smartphone, Sun, SunMoon, Tag } from 'lucide-react';
import { OrdemCorredores } from './OrdemCorredores';
import { TutorialIos } from './Instalar';
import { salvarEAplicarTema } from '@/lib/theme';
import { versaoApp } from '@/lib/env';
import { obterModoCache } from '@/lib/firebase';
import { t } from '@/i18n';
import type { PreferenciaTema } from '@/lib/armazenamentoLocal';
import type { CategoriaId } from '@/types';

interface Props {
  nome: string;
  onNome: (nome: string) => void;
  tema: PreferenciaTema;
  onTema: (tema: PreferenciaTema) => void;
  mostrarPrecos: boolean;
  onMostrarPrecos: (ativo: boolean) => void;
  nomeLista: string;
  onNomeLista: (nome: string) => void;
  ordemCorredores: CategoriaId[];
  onOrdemCorredores: (ordem: CategoriaId[]) => void;
  armazenamentoPersistente: boolean;
  onAbrirPrivacidade: () => void;
}

const TEMAS: { valor: PreferenciaTema; rotulo: string; Icone: typeof Sun }[] = [
  { valor: 'auto', rotulo: t.ajustes.temaAuto, Icone: SunMoon },
  { valor: 'claro', rotulo: t.ajustes.temaClaro, Icone: Sun },
  { valor: 'escuro', rotulo: t.ajustes.temaEscuro, Icone: Moon },
];

export function Ajustes({
  nome,
  onNome,
  tema,
  onTema,
  mostrarPrecos,
  onMostrarPrecos,
  nomeLista,
  onNomeLista,
  ordemCorredores,
  onOrdemCorredores,
  armazenamentoPersistente,
  onAbrirPrivacidade,
}: Props): JSX.Element {
  const [nomeLocal, setNomeLocal] = useState(nome);
  const [nomeListaLocal, setNomeListaLocal] = useState(nomeLista);

  return (
    <div className="space-y-8 pb-4">
      {/* Nome do usuário */}
      <section>
        <label htmlFor="campo-nome" className="mb-2 block text-sm font-medium text-base-700">
          {t.ajustes.seuNome}
        </label>
        <input
          id="campo-nome"
          type="text"
          value={nomeLocal}
          onChange={(e) => setNomeLocal(e.target.value.slice(0, 40))}
          onBlur={() => onNome(nomeLocal.trim())}
          placeholder={t.ajustes.seuNomePlaceholder}
          autoComplete="given-name"
          className="field"
        />
        <p className="mt-1.5 text-xs text-base-500">{t.ajustes.seuNomeAjuda}</p>
      </section>

      {/* Nome da lista */}
      <section>
        <label htmlFor="campo-nome-lista" className="mb-2 block text-sm font-medium text-base-700">
          {t.ajustes.renomearLista}
        </label>
        <div className="flex items-center gap-2">
          <Tag size={16} className="shrink-0 text-base-500" aria-hidden="true" />
          <input
            id="campo-nome-lista"
            type="text"
            value={nomeListaLocal}
            onChange={(e) => setNomeListaLocal(e.target.value.slice(0, 60))}
            onBlur={() => {
              const limpo = nomeListaLocal.trim();
              if (limpo && limpo !== nomeLista) onNomeLista(limpo);
              else setNomeListaLocal(nomeLista);
            }}
            className="field"
          />
        </div>
      </section>

      {/* Tema */}
      <section>
        <span className="mb-2 block text-sm font-medium text-base-700">{t.ajustes.tema}</span>
        <div className="flex gap-2" role="radiogroup" aria-label={t.ajustes.tema}>
          {TEMAS.map(({ valor, rotulo, Icone }) => (
            <button
              key={valor}
              type="button"
              role="radio"
              aria-checked={tema === valor}
              onClick={() => {
                salvarEAplicarTema(valor);
                onTema(valor);
              }}
              className={`chip flex-1 justify-center ${tema === valor ? 'chip-active' : ''}`}
            >
              <Icone size={15} aria-hidden="true" />
              {rotulo}
            </button>
          ))}
        </div>
      </section>

      {/* Preços (opcional) */}
      <section>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={mostrarPrecos}
            onChange={(e) => onMostrarPrecos(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-[rgb(var(--c-accent-500))]"
          />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-base-700">{t.ajustes.precos}</span>
            <span className="mt-0.5 block text-xs text-base-500">{t.ajustes.precosAjuda}</span>
          </span>
        </label>
      </section>

      {/* Ordem dos corredores */}
      <section>
        <h3 className="mb-2 text-sm font-medium text-base-700">{t.compras.ordemCorredores}</h3>
        <OrdemCorredores ordem={ordemCorredores} onMudar={onOrdemCorredores} />
      </section>

      {/* Instalação no iOS (sempre visível aqui, mesmo se dispensada no início) */}
      <section>
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-base-700">
          <Smartphone size={15} aria-hidden="true" />
          {t.ajustes.instalar}
        </h3>
        <TutorialIos forcar />
      </section>

      {/* Privacidade e sobre */}
      <section className="space-y-2">
        <button
          type="button"
          onClick={onAbrirPrivacidade}
          className="card flex w-full items-center gap-3 p-4 text-left hover:bg-base-50"
        >
          <Shield size={18} className="shrink-0 text-base-500" aria-hidden="true" />
          <span className="min-w-0 flex-1 text-sm font-medium">{t.ajustes.privacidade}</span>
        </button>

        <div className="card space-y-2 p-4 text-xs text-base-500">
          <p className="flex items-center gap-2">
            <Info size={14} className="shrink-0" aria-hidden="true" />
            {t.ajustes.versao} {versaoApp}
          </p>
          <p className="flex items-center gap-2">
            <HardDrive size={14} className="shrink-0" aria-hidden="true" />
            {armazenamentoPersistente
              ? t.ajustes.armazenamentoPersistente
              : t.ajustes.armazenamentoNormal}
            {obterModoCache() === 'memoria' && ' · cache em memória'}
          </p>
        </div>
      </section>
    </div>
  );
}
