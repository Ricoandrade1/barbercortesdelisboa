(function(){"use strict";console.log("Worker carregado"),self.addEventListener("message",e=>{console.log("Mensagem recebida do worker:",e.data),self.postMessage("Mensagem recebida pelo worker")})})();
