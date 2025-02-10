console.log("Bem vindo a Boss Wallet .. A carteira digital do Barbeiro");

self.addEventListener('message', (event) => {
  console.log("Mensagem recebida do worker:", event.data);
  self.postMessage("Mensagem recebida pelo worker");
});
