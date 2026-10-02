import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ProvedorToast } from '@/components/Toast';
import { LimiteErro } from '@/components/LimiteErro';
import { AvisoAtualizacao } from '@/components/AvisoAtualizacao';
import { TelaSemConfig } from '@/components/TelaSemConfig';
import { aplicarTema, observarTemaDoSistema } from '@/lib/theme';
import { obterTema } from '@/lib/armazenamentoLocal';
import { firebaseConfigurado } from '@/lib/env';
import './styles/index.css';

aplicarTema(obterTema());
observarTemaDoSistema();

const raiz = document.getElementById('root');
if (!raiz) throw new Error('Elemento #root não encontrado no index.html.');

createRoot(raiz).render(
  <StrictMode>
    <LimiteErro>
      <ProvedorToast>
        <AvisoAtualizacao />
        {firebaseConfigurado ? <App /> : <TelaSemConfig />}
      </ProvedorToast>
    </LimiteErro>
  </StrictMode>,
);
