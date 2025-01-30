import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom';

if (typeof Worker !== 'undefined') {
  const worker = new Worker(new URL('./workers/appWorker.ts', import.meta.url), { type: 'module' });

  worker.postMessage('Olá do main thread!');

  worker.onmessage = (event) => {
    console.log('Mensagem recebida do worker:', event.data);
  };
} else {
  console.log('Web Workers não são suportados neste browser.');
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
