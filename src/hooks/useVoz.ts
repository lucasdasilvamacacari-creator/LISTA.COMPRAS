/**
 * Entrada por voz com a Web Speech API (pt-BR).
 *
 * Suporte é irregular: funciona bem no Chrome/Android, parcialmente no Safari
 * e não existe no Firefox. Por isso `suportado` é exposto — a UI ESCONDE o
 * botão do microfone quando não dá, em vez de mostrar algo que não funciona.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { suportaVoz } from '@/lib/dispositivo';

interface ReconhecimentoFala extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((evento: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((evento: { error: string }) => void) | null;
  onend: (() => void) | null;
}

type ConstrutorReconhecimento = new () => ReconhecimentoFala;

function obterConstrutor(): ConstrutorReconhecimento | null {
  const w = window as unknown as Record<string, unknown>;
  const ctor = w['SpeechRecognition'] ?? w['webkitSpeechRecognition'];
  return typeof ctor === 'function' ? (ctor as ConstrutorReconhecimento) : null;
}

export interface UseVoz {
  suportado: boolean;
  ouvindo: boolean;
  /** Texto parcial, mostrado enquanto a pessoa fala. */
  parcial: string;
  erro: string | null;
  iniciar: () => void;
  parar: () => void;
}

export function useVoz(onTexto: (texto: string) => void): UseVoz {
  const [ouvindo, setOuvindo] = useState(false);
  const [parcial, setParcial] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const refReconhecimento = useRef<ReconhecimentoFala | null>(null);
  // Guarda o callback em ref para não reiniciar o reconhecimento a cada render.
  const refCallback = useRef(onTexto);
  refCallback.current = onTexto;

  const suportado = suportaVoz();

  const parar = useCallback(() => {
    try {
      refReconhecimento.current?.stop();
    } catch {
      /* já parado */
    }
    setOuvindo(false);
    setParcial('');
  }, []);

  const iniciar = useCallback(() => {
    const Construtor = obterConstrutor();
    if (!Construtor) return;

    // Se já estava ouvindo, o toque no botão encerra.
    if (refReconhecimento.current) {
      parar();
      return;
    }

    setErro(null);
    setParcial('');

    try {
      const reconhecimento = new Construtor();
      reconhecimento.lang = 'pt-BR';
      reconhecimento.continuous = false;
      reconhecimento.interimResults = true;
      reconhecimento.maxAlternatives = 1;

      reconhecimento.onresult = (evento) => {
        let texto = '';
        for (let i = 0; i < evento.results.length; i++) {
          const alternativa = evento.results[i]?.[0];
          if (alternativa) texto += alternativa.transcript;
        }
        setParcial(texto);
        refCallback.current(texto);
      };

      reconhecimento.onerror = (evento) => {
        // "aborted" e "no-speech" são normais (o usuário cancelou ou ficou quieto).
        if (evento.error !== 'aborted' && evento.error !== 'no-speech') {
          setErro(evento.error);
        }
        refReconhecimento.current = null;
        setOuvindo(false);
      };

      reconhecimento.onend = () => {
        refReconhecimento.current = null;
        setOuvindo(false);
        setParcial('');
      };

      refReconhecimento.current = reconhecimento;
      reconhecimento.start();
      setOuvindo(true);
    } catch {
      setErro('inicio');
      refReconhecimento.current = null;
      setOuvindo(false);
    }
  }, [parar]);

  // Encerra o microfone se o componente sair da tela.
  useEffect(
    () => () => {
      try {
        refReconhecimento.current?.abort();
      } catch {
        /* ignora */
      }
      refReconhecimento.current = null;
    },
    [],
  );

  return { suportado, ouvindo, parcial, erro, iniciar, parar };
}
