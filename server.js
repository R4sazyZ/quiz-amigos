const express = require("express");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

const quizzes = new Map();

const EVALUATIONS = [
  { id: "brilhante", name: "Brilhante", icon: "‼", color: "#00b8b8", points: 10 },
  { id: "otima", name: "Ótima Jogada", icon: "!", color: "#5ca8d8", points: 9 },
  { id: "melhor", name: "Melhor Jogada", icon: "★", color: "#8bd22e", points: 8 },
  { id: "excelente", name: "Excelente", icon: "👍", color: "#91d63d", points: 7 },
  { id: "boa", name: "Boa", icon: "✓", color: "#8fc29c", points: 6 },
  { id: "livro", name: "Livro", icon: "▣", color: "#c7a27a", points: 5 },
  { id: "imprecisao", name: "Imprecisão", icon: "⁉", color: "#f6bb28", points: 3 },
  { id: "erro", name: "Erro", icon: "?", color: "#f39800", points: 1 },
  { id: "errograve", name: "Erro Grave", icon: "×", color: "#ef675d", points: -2 },
  { id: "gafe", name: "Gafe", icon: "‼", color: "#d91e2e", points: -5 }
];

const QUESTION_BANK = [
  "Qual é a capital do Brasil e por que ela foi escolhida para substituir o Rio de Janeiro como capital?",
  "Explique, com suas palavras, o que é fotossíntese e qual é sua importância para os seres vivos.",
  "Por que a água é considerada essencial para a vida?",
  "Explique a diferença entre tempo atmosférico e clima.",
  "O que é democracia? Dê um exemplo de participação democrática.",
  "Explique por que existem estações do ano na Terra.",
  "O que é um ecossistema? Cite dois elementos que fazem parte dele.",
  "Explique o que acontece com a água durante o ciclo da água.",
  "Por que os oceanos são importantes para o equilíbrio ambiental do planeta?",
  "Explique o que é energia renovável e cite dois exemplos.",
  "Qual é a função do coração no corpo humano?",
  "Explique a diferença entre vírus e bactérias.",
  "Por que uma alimentação variada é importante para o organismo?",
  "O que são vacinas e qual é sua função na prevenção de doenças?",
  "Explique o que é gravidade usando um exemplo do cotidiano.",
  "Por que a Lua parece mudar de formato ao longo do mês?",
  "Explique o que é um eclipse solar.",
  "O que é velocidade? Explique usando uma situação cotidiana.",
  "Por que o céu pode apresentar cores diferentes durante o nascer e o pôr do Sol?",
  "Explique a diferença entre massa e peso.",
  "O que foi a Revolução Industrial e cite uma mudança causada por ela.",
  "Explique uma consequência importante da Revolução Francesa.",
  "Por que a Segunda Guerra Mundial foi um acontecimento de grande impacto histórico?",
  "Explique o que significa colonização.",
  "O que foi a Guerra Fria?",
  "Explique por que as cidades cresceram durante o processo de industrialização.",
  "O que é migração? Cite uma possível causa.",
  "Explique o que são recursos naturais.",
  "Por que o desmatamento pode causar impactos ambientais?",
  "Explique o que é globalização.",
  "O que é inflação e como ela pode afetar o consumidor?",
  "Explique a diferença entre produto e serviço.",
  "Por que uma empresa precisa conhecer seu público-alvo?",
  "O que significa investir em educação?",
  "Explique o que é oferta e demanda.",
  "Por que o planejamento financeiro pode ser importante?",
  "O que é empreendedorismo?",
  "Explique o que significa consumo consciente.",
  "Por que impostos são cobrados pelo Estado?",
  "Explique o que é sustentabilidade.",
  "O que é inteligência artificial? Dê um exemplo de aplicação.",
  "Explique a diferença entre hardware e software.",
  "O que é um algoritmo?",
  "Por que senhas fortes ajudam na segurança digital?",
  "Explique o que é armazenamento em nuvem.",
  "O que significa código aberto?",
  "Por que fazer backup pode evitar perda de dados?",
  "Explique o que é realidade virtual.",
  "O que é uma rede de computadores?",
  "Por que atualizar um aplicativo pode ser importante?",
  "Explique o que é desinformação na internet.",
  "Como você explicaria o conceito de amizade para uma pessoa que nunca teve amigos?",
  "Por que regras podem ser importantes em um jogo?",
  "Explique a diferença entre opinião e fato.",
  "Por que ouvir outra pessoa pode ajudar em uma discussão?",
  "O que significa responsabilidade?",
  "Explique por que consequências fazem parte das escolhas.",
  "Como você explicaria o conceito de criatividade?",
  "Por que trabalhar em equipe pode ser útil para resolver problemas?",
  "O que é pensamento crítico?",
  "Explique por que uma mesma situação pode ser interpretada de maneiras diferentes.",
  "Se você pudesse criar uma regra para melhorar sua escola, qual seria e por quê?",
  "Se pudesse inventar uma tecnologia nova, o que ela faria?",
  "Como você resolveria um conflito entre dois amigos sem escolher um lado imediatamente?",
  "Qual habilidade você considera importante para aprender coisas novas? Explique.",
  "Se você tivesse que ensinar uma coisa para uma criança, como escolheria o que ensinar?",
  "O que torna uma pergunta realmente interessante?",
  "Por que erros podem ajudar alguém a aprender?",
  "Como você explicaria a diferença entre coragem e imprudência?",
  "O que significa ser justo em uma competição?",
  "Se você pudesse viajar para qualquer período histórico, qual escolheria e o que gostaria de observar?",
  "Explique como você tomaria uma decisão quando duas opções parecem igualmente boas.",
  "Por que curiosidade pode ser útil?",
  "Como você explicaria o que é respeito?",
  "O que faz uma história ser memorável?",
  "Por que diferentes pessoas podem ter opiniões diferentes sobre a mesma obra de arte?",
  "Explique o que significa aprender com a experiência.",
  "Como você diferenciaria uma explicação boa de uma explicação confusa?",
  "Por que fazer perguntas pode ser tão importante quanto dar respostas?",
  "Se um amigo estivesse desanimado antes de uma prova, o que você faria para ajudá-lo?",
  "O que significa confiar em alguém?",
  "Por que regras devem ser claras em uma competição?",
  "Como você explicaria o conceito de estratégia?",
  "O que torna um argumento convincente?",
  "Por que é importante verificar uma informação antes de compartilhá-la?",
  "Explique como um mapa ajuda alguém a entender um lugar.",
  "Qual é a função de uma legenda em um gráfico?",
  "Por que gráficos podem facilitar a compreensão de dados?",
  "Explique o que significa comparar duas informações.",
  "Como você explicaria causa e consequência?",
  "Por que exemplos ajudam em uma explicação?",
  "O que é uma hipótese?",
  "Como uma experiência científica pode testar uma hipótese?",
  "Por que resultados precisam ser analisados antes de uma conclusão?",
  "Explique o que significa observar um fenômeno de forma científica.",
  "Por que repetir uma experiência pode ser útil?",
  "O que é biodiversidade e por que ela é importante?",
  "Explique por que a poluição pode afetar diferentes partes de um ecossistema.",
  "Como o lixo produzido pelas pessoas pode chegar aos rios e oceanos?",
  "Por que áreas verdes podem ser importantes nas cidades?",
  "Explique uma atitude que pode reduzir o desperdício de água.",
  "Por que reciclagem e reutilização não são exatamente a mesma coisa?",
  "O que é aquecimento global?",
  "Como as atividades humanas podem alterar o ambiente?",
  "Por que preservar espécies é importante para a biodiversidade?",
  "Explique o que significa desenvolvimento sustentável.",
  "Por que diferentes culturas podem ter costumes diferentes?",
  "Como a língua pode fazer parte da identidade cultural?",
  "Por que museus podem ser importantes para a sociedade?",
  "Explique o que é patrimônio histórico.",
  "Como a música pode representar uma cultura?",
  "Por que estudar história ajuda a compreender o presente?",
  "Explique como esportes podem influenciar a cultura de uma sociedade.",
  "Por que diferentes regiões de um país podem ter costumes diferentes?",
  "Como a tecnologia mudou a maneira como as pessoas se comunicam?",
  "Por que documentos históricos são importantes para pesquisadores?"
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function code() {
  return Math.random().toString(36).slice(2, 7).toUpperCase();
}

function id() {
  return crypto.randomUUID();
}

app.get("/api/evaluations", (req, res) => {
  res.json(EVALUATIONS);
});

app.post("/api/quizzes", (req, res) => {
  const title = String(req.body.title || "Quiz entre amigos").trim().slice(0, 80);
  const questions = shuffle(QUESTION_BANK).slice(0, 50).map((text, i) => ({
    id: `q${i + 1}`,
    text
  }));

  let quizCode;
  do { quizCode = code(); } while ([...quizzes.values()].some(q => q.code === quizCode));

  const quiz = {
    id: id(),
    code: quizCode,
    title,
    questions,
    participants: [],
    createdAt: Date.now()
  };

  quizzes.set(quiz.id, quiz);
  res.json({ id: quiz.id, code: quiz.code, title: quiz.title, questionCount: 50 });
});

app.get("/api/quizzes/code/:code", (req, res) => {
  const quiz = [...quizzes.values()].find(q => q.code === String(req.params.code).toUpperCase());
  if (!quiz) return res.status(404).json({ error: "Quiz não encontrado." });

  res.json({
    id: quiz.id,
    code: quiz.code,
    title: quiz.title,
    questionCount: quiz.questions.length
  });
});

app.get("/api/quizzes/:id/questions", (req, res) => {
  const quiz = quizzes.get(req.params.id);
  if (!quiz) return res.status(404).json({ error: "Quiz não encontrado." });
  res.json({ title: quiz.title, code: quiz.code, questions: quiz.questions });
});

app.post("/api/quizzes/:id/submissions", (req, res) => {
  const quiz = quizzes.get(req.params.id);
  if (!quiz) return res.status(404).json({ error: "Quiz não encontrado." });

  const name = String(req.body.name || "").trim().slice(0, 50);
  const answers = req.body.answers;

  if (!name) return res.status(400).json({ error: "Informe seu nome." });
  if (!Array.isArray(answers) || answers.length !== 50) {
    return res.status(400).json({ error: "O quiz precisa ter 50 respostas." });
  }

  const participant = {
    id: id(),
    name,
    answers: answers.map((a, i) => ({
      questionId: quiz.questions[i].id,
      text: String(a || "").slice(0, 5000),
      evaluation: null
    })),
    submittedAt: Date.now()
  };

  quiz.participants.push(participant);
  res.json({ participantId: participant.id, message: "Respostas enviadas!" });
});

app.get("/api/quizzes/:id/participants", (req, res) => {
  const quiz = quizzes.get(req.params.id);
  if (!quiz) return res.status(404).json({ error: "Quiz não encontrado." });

  res.json(quiz.participants.map(p => ({
    id: p.id,
    name: p.name,
    submittedAt: p.submittedAt,
    evaluated: p.answers.filter(a => a.evaluation).length
  })));
});

app.get("/api/quizzes/:id/participants/:participantId", (req, res) => {
  const quiz = quizzes.get(req.params.id);
  if (!quiz) return res.status(404).json({ error: "Quiz não encontrado." });
  const participant = quiz.participants.find(p => p.id === req.params.participantId);
  if (!participant) return res.status(404).json({ error: "Participante não encontrado." });

  res.json({
    participant: {
      id: participant.id,
      name: participant.name,
      answers: participant.answers.map((a, i) => ({
        index: i + 1,
        question: quiz.questions[i].text,
        answer: a.text,
        evaluation: a.evaluation
      }))
    },
    evaluations: EVALUATIONS
  });
});

app.post("/api/quizzes/:id/participants/:participantId/evaluate", (req, res) => {
  const quiz = quizzes.get(req.params.id);
  if (!quiz) return res.status(404).json({ error: "Quiz não encontrado." });
  const participant = quiz.participants.find(p => p.id === req.params.participantId);
  if (!participant) return res.status(404).json({ error: "Participante não encontrado." });

  const evaluations = req.body.evaluations;
  if (!Array.isArray(evaluations) || evaluations.length !== 50) {
    return res.status(400).json({ error: "São necessárias 50 avaliações." });
  }

  participant.answers.forEach((a, i) => {
    const ev = EVALUATIONS.find(e => e.id === evaluations[i]);
    a.evaluation = ev ? ev.id : null;
  });

  res.json({ message: "Avaliações salvas!" });
});

app.get("/api/quizzes/:id/participants/:participantId/result", (req, res) => {
  const quiz = quizzes.get(req.params.id);
  if (!quiz) return res.status(404).json({ error: "Quiz não encontrado." });
  const participant = quiz.participants.find(p => p.id === req.params.participantId);
  if (!participant) return res.status(404).json({ error: "Participante não encontrado." });

  const counts = {};
  EVALUATIONS.forEach(e => counts[e.id] = 0);

  let points = 0;
  participant.answers.forEach(a => {
    if (a.evaluation && counts[a.evaluation] !== undefined) {
      counts[a.evaluation]++;
      points += EVALUATIONS.find(e => e.id === a.evaluation).points;
    }
  });

  res.json({
    quizTitle: quiz.title,
    participant: participant.name,
    points,
    maxPoints: 500,
    counts,
    evaluated: participant.answers.filter(a => a.evaluation).length,
    total: 50
  });
});

app.listen(PORT, () => {
  console.log(`Quiz Amigos rodando em http://localhost:${PORT}`);
});
