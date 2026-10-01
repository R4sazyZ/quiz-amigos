# Quiz Amigos

Site privado para criar quizzes dissertativos e jogar com amigos.

## O que já funciona

- Criação de quiz com 50 perguntas aleatórias.
- Código de 5 caracteres para compartilhar.
- Participante entra com código + nome.
- 50 perguntas dissertativas.
- Envio das respostas.
- Tela do criador para escolher o participante.
- Avaliação individual das 50 respostas.
- As 10 avaliações:
  - Brilhante
  - Ótima Jogada
  - Melhor Jogada
  - Excelente
  - Boa
  - Livro
  - Imprecisão
  - Erro
  - Erro Grave
  - Gafe
- Pontuação automática.
- Tela de resultado.

## Como abrir

Você precisa ter Node.js instalado.

1. Abra um terminal dentro desta pasta.
2. Execute:
   npm install
3. Depois:
   npm start
4. Abra no navegador:
   http://localhost:3000

## Importante

Esta primeira versão guarda os quizzes na memória do servidor. Se o servidor for desligado/reiniciado, os quizzes e respostas são apagados.

Para usar com amigos pela internet, o próximo passo é colocar o projeto em um serviço de hospedagem e adicionar um banco de dados.