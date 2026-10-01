const app = document.getElementById("app");
const api = (url, options={}) => fetch(url,{headers:{"Content-Type":"application/json"},...options}).then(async r=>{const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||"Ocorreu um erro.");return d;});

const state = { quiz:null, questions:[], current:0, answers:[], participantId:null, evaluations:[], evals:[] };

function shell(content){
  app.innerHTML=`<div class="container"><div class="nav"><div class="logo">Quiz<span>Amigos</span></div><button class="secondary" onclick="home()">Início</button></div>${content}</div>`;
}
function home(){
 shell(`<section class="hero"><h1>Quiz entre amigos</h1><p>Crie um quiz com 50 perguntas, envie o código para seus amigos e avalie as respostas.</p></section>
 <div class="grid">
  <button class="action" onclick="createPage()"><h2>🎯 Criar quiz</h2><p>Gere 50 perguntas aleatórias e receba um código para compartilhar.</p></button>
  <button class="action" onclick="joinPage()"><h2>🚀 Participar</h2><p>Entre usando o código que o criador do quiz enviou.</p></button>
  <button class="action" onclick="evaluatePage()"><h2>📝 Avaliar respostas</h2><p>Escolha um participante e avalie cada resposta.</p></button>
  <button class="action" onclick="resultPage()"><h2>🏆 Resultado</h2><p>Veja a pontuação e a distribuição das avaliações.</p></button>
 </div>
 <div class="card"><h2>Como funciona?</h2><p class="muted">1. Crie o quiz → 2. Compartilhe o código → 3. Seus amigos respondem → 4. Você avalia as 50 respostas → 5. Veja o resultado.</p></div>`);
}
function createPage(){
 shell(`<div class="card"><h1>Criar quiz</h1><p class="muted">O site vai sortear automaticamente 50 perguntas dissertativas.</p><label>Nome do quiz</label><input id="title" value="Quiz entre amigos" maxlength="80"><button class="primary" onclick="createQuiz()">Gerar 50 perguntas</button><div id="msg"></div></div>`);
}
async function createQuiz(){
 const msg=document.getElementById("msg");msg.textContent="Gerando...";
 try{
  const q=await api("/api/quizzes",{method:"POST",body:JSON.stringify({title:document.getElementById("title").value})});
  state.quiz=q;
  shell(`<div class="card" style="text-align:center"><h1>Quiz criado!</h1><p class="muted">${escapeHtml(q.title)}</p><div style="font-size:56px;font-weight:900;letter-spacing:8px">${q.code}</div><p>Envie este código para seus amigos.</p><button class="primary" onclick="copyText('${q.code}')">📋 Copiar código</button><button class="secondary" onclick="evaluatePage()">Avaliar respostas</button><p class="small muted">O quiz fica armazenado enquanto o servidor estiver ligado.</p></div>`);
 }catch(e){msg.className="error";msg.textContent=e.message}
}
function joinPage(){
 shell(`<div class="card"><h1>Participar do quiz</h1><label>Código</label><input id="code" placeholder="Ex.: A7K2P" maxlength="5"><label>Seu nome</label><input id="name" placeholder="Digite seu nome" maxlength="50"><button class="primary" onclick="startQuiz()">Entrar no quiz</button><div id="msg"></div></div>`);
}
async function startQuiz(){
 const msg=document.getElementById("msg");msg.textContent="Carregando...";
 try{
  const info=await api("/api/quizzes/code/"+encodeURIComponent(document.getElementById("code").value.trim().toUpperCase()));
  const data=await api("/api/quizzes/"+info.id+"/questions");
  state.quiz=info;state.quiz.id=info.id;state.questions=data.questions;state.current=0;state.answers=Array(50).fill("");state.playerName=document.getElementById("name").value.trim();
  if(!state.playerName) throw new Error("Digite seu nome.");
  answerPage();
 }catch(e){msg.className="error";msg.textContent=e.message}
}
function answerPage(){
 const i=state.current,q=state.questions[i];
 shell(`<div class="card"><div class="quiz-top"><div><b>${escapeHtml(state.quiz.title)}</b><div class="question-number">Pergunta ${i+1} de 50</div></div><b>${Math.round((i/50)*100)}%</b></div><div class="progress"><div style="width:${((i+1)/50)*100}%"></div></div><div class="question">${escapeHtml(q.text)}</div><textarea id="answer" placeholder="Escreva sua resposta...">${escapeHtml(state.answers[i])}</textarea><div class="nav-buttons">${i?'<button class="secondary" onclick="prevQ()">← Anterior</button>':'<span></span>'}<button class="primary" onclick="${i===49?'submitQuiz()':'nextQ()'}">${i===49?'Enviar quiz':'Próxima →'}</button></div><div id="msg"></div></div>`);
}
function saveCurrent(){state.answers[state.current]=document.getElementById("answer").value}
function nextQ(){saveCurrent();state.current++;answerPage()}
function prevQ(){saveCurrent();state.current--;answerPage()}
async function submitQuiz(){
 saveCurrent();
 if(state.answers.some(a=>!a.trim())){document.getElementById("msg").className="error";document.getElementById("msg").textContent="Responda todas as 50 perguntas antes de enviar.";return}
 try{
  const r=await api("/api/quizzes/"+state.quiz.id+"/submissions",{method:"POST",body:JSON.stringify({name:state.playerName,answers:state.answers})});
  state.participantId=r.participantId;
  shell(`<div class="card result"><h1>Quiz enviado!</h1><p>Suas respostas foram enviadas para o criador.</p><button class="primary" onclick="home()">Voltar ao início</button></div>`);
 }catch(e){document.getElementById("msg").className="error";document.getElementById("msg").textContent=e.message}
}
function evaluatePage(){
 shell(`<div class="card"><h1>Avaliar respostas</h1><p class="muted">Digite o código do quiz para ver os participantes.</p><label>Código do quiz</label><input id="code" maxlength="5" placeholder="Ex.: A7K2P"><button class="primary" onclick="loadParticipants()">Ver participantes</button><div id="participants"></div></div>`);
}
async function loadParticipants(){
 const box=document.getElementById("participants");box.innerHTML="Carregando...";
 try{
  const info=await api("/api/quizzes/code/"+encodeURIComponent(document.getElementById("code").value.trim().toUpperCase()));
  state.quiz=info;state.quiz.id=info.id;
  const ps=await api("/api/quizzes/"+info.id+"/participants");
  box.innerHTML=ps.length?ps.map(p=>`<div class="participant"><div><b>${escapeHtml(p.name)}</b><div class="small muted">${p.evaluated}/50 avaliadas</div></div><button class="primary" onclick="openEvaluation('${p.id}')">Avaliar</button></div>`).join(""):"<p class='muted'>Ainda não há participantes.</p>";
 }catch(e){box.innerHTML=`<p class="error">${e.message}</p>`}
}
async function openEvaluation(pid){
 try{
  const d=await api("/api/quizzes/"+state.quiz.id+"/participants/"+pid);
  state.participantId=pid;state.evalData=d;state.evaluations=d.participant.answers.map(a=>a.evaluation||null);state.evals=d.evaluations;
  renderEvaluation();
 }catch(e){alert(e.message)}
}
function renderEvaluation(){
 const i=state.evaluations.findIndex(x=>!x);
 const index=i<0?49:i;
 const a=state.evalData.participant.answers[index];
 const evs=state.evals.map(e=>`<button class="eval ${state.evaluations[index]===e.id?'selected':''}" onclick="chooseEval('${e.id}')"><span class="ico" style="background:${e.color}">${e.icon}</span><span><b>${e.name}</b><br><span class="small">${e.points>0?'+':''}${e.points} pontos</span></span></button>`).join("");
 shell(`<div class="card"><div class="quiz-top"><div><b>${escapeHtml(state.evalData.participant.name)}</b><div class="question-number">Resposta ${index+1} de 50</div></div><button class="secondary" onclick="evaluatePage()">Trocar participante</button></div><div class="answer-card"><h3>${escapeHtml(a.question)}</h3><div class="answer-text">${escapeHtml(a.answer)}</div></div><h3>Escolha a avaliação</h3><div class="eval-list">${evs}</div><div class="nav-buttons"><button class="secondary" onclick="prevEval()">← Anterior</button><button class="primary" onclick="nextEval()">${index===49?'Salvar avaliações':'Próxima →'}</button></div></div>`);
 state.evalIndex=index;
}
function chooseEval(id){state.evaluations[state.evalIndex]=id;renderEvaluation()}
function prevEval(){state.evalIndex=Math.max(0,state.evalIndex-1);renderEvaluationAt()}
function nextEval(){
 if(!state.evaluations[state.evalIndex]){alert("Escolha uma avaliação primeiro.");return}
 if(state.evalIndex===49)saveEvaluations();else{state.evalIndex++;renderEvaluationAt()}
}
function renderEvaluationAt(){
 const i=state.evalIndex,a=state.evalData.participant.answers[i];
 const evs=state.evals.map(e=>`<button class="eval ${state.evaluations[i]===e.id?'selected':''}" onclick="state.evaluations[${i}]='${e.id}';renderEvaluationAt()"><span class="ico" style="background:${e.color}">${e.icon}</span><span><b>${e.name}</b><br><span class="small">${e.points>0?'+':''}${e.points} pontos</span></span></button>`).join("");
 shell(`<div class="card"><div class="quiz-top"><div><b>${escapeHtml(state.evalData.participant.name)}</b><div class="question-number">Resposta ${i+1} de 50</div></div><button class="secondary" onclick="evaluatePage()">Trocar participante</button></div><div class="answer-card"><h3>${escapeHtml(a.question)}</h3><div class="answer-text">${escapeHtml(a.answer)}</div></div><h3>Escolha a avaliação</h3><div class="eval-list">${evs}</div><div class="nav-buttons"><button class="secondary" onclick="state.evalIndex=Math.max(0,state.evalIndex-1);renderEvaluationAt()">← Anterior</button><button class="primary" onclick="${i===49?'saveEvaluations()':'state.evalIndex++;renderEvaluationAt()'}">${i===49?'Salvar avaliações':'Próxima →'}</button></div></div>`);
}
async function saveEvaluations(){
 try{
  await api("/api/quizzes/"+state.quiz.id+"/participants/"+state.participantId+"/evaluate",{method:"POST",body:JSON.stringify({evaluations:state.evaluations})});
  shell(`<div class="card result"><h1>✅ Avaliações salvas!</h1><p>As 50 respostas de ${escapeHtml(state.evalData.participant.name)} foram avaliadas.</p><button class="primary" onclick="resultPage('${state.participantId}')">Ver resultado</button></div>`);
 }catch(e){alert(e.message)}
}
async function resultPage(pid){
 shell(`<div class="card"><h1>Resultado</h1><p class="muted">Digite o código do quiz e escolha o participante.</p><label>Código</label><input id="code" maxlength="5" placeholder="Ex.: A7K2P"><button class="primary" onclick="loadResults()">Continuar</button><div id="results"></div></div>`);
 if(pid) {}
}
async function loadResults(){
 const box=document.getElementById("results");box.innerHTML="Carregando...";
 try{
  const info=await api("/api/quizzes/code/"+encodeURIComponent(document.getElementById("code").value.trim().toUpperCase()));
  const ps=await api("/api/quizzes/"+info.id+"/participants");
  box.innerHTML=ps.map(p=>`<div class="participant"><div><b>${escapeHtml(p.name)}</b><div class="small muted">${p.evaluated}/50 avaliadas</div></div><button class="primary" onclick="showResult('${info.id}','${p.id}')">Ver</button></div>`).join("");
 }catch(e){box.innerHTML=`<p class="error">${e.message}</p>`}
}
async function showResult(qid,pid){
 try{
  const r=await api("/api/quizzes/"+qid+"/participants/"+pid+"/result");
  const labels=state.evals.length?state.evals:await api("/api/evaluations");
  const counts=labels.map(e=>`<div class="count"><span>${e.icon} ${e.name}</span><b>${r.counts[e.id]||0}</b></div>`).join("");
  shell(`<div class="card result"><h1>${escapeHtml(r.quizTitle)}</h1><p>${escapeHtml(r.participant)}</p><div class="score">${r.points}</div><p class="muted">pontos de ${r.maxPoints} possíveis · ${r.evaluated}/50 avaliadas</p><div class="count-grid">${counts}</div><button class="primary" onclick="home()">Voltar ao início</button></div>`);
 }catch(e){alert(e.message)}
}
function copyText(t){navigator.clipboard?.writeText(t);alert("Código copiado!")}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
home();
