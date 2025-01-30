console.log("Worker carregado");

self.addEventListener('message', (event) => {
  console.log("Mensagem recebida do worker:", event.data);
  self.postMessage("Mensagem recebida pelo worker");
});
