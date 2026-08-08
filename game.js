const AREAS=[
  {id:'audio',name:'Audio',icon:'♫',color:'#ff7548',items:86,tasks:['Audífonos y TWS','Parlantes portátiles','Audio profesional','Cables de audio']},
  {id:'computo',name:'Cómputo',icon:'▰',color:'#72a7ff',items:104,tasks:['Laptops exhibición','Monitores','Periféricos','Componentes']},
  {id:'soho',name:'SOHO',icon:'⌂',color:'#b18cff',items:72,tasks:['Impresoras','Suministros','Redes y routers','Oficina en casa']},
  {id:'baterias',name:'Baterías',icon:'▣',color:'#d2f238',items:128,tasks:['Pilas alcalinas','Recargables','Power banks','Cargadores']},
  {id:'celulares',name:'Celulares',icon:'▯',color:'#4ed6af',items:94,tasks:['Smartphones','Fundas','Protectores','Cargadores móviles']},
  {id:'gaming',name:'Gaming',icon:'◆',color:'#ff5e8a',items:78,tasks:['Consolas','Mandos','Accesorios gamer','Videojuegos']}
];
const SKILLS=[
  {id:'speed',name:'Velocidad',icon:'⚡',desc:'Menos tiempo por producto'},
  {id:'accuracy',name:'Precisión',icon:'◎',desc:'Reduce errores de conteo'},
  {id:'focus',name:'Concentración',icon:'◉',desc:'Detecta más diferencias'}
];
const state={area:null,skills:{speed:0,accuracy:0,focus:0},points:5,running:false,progress:0,counted:0,findings:0,task:0,boost:false,timer:null};
const $=s=>document.querySelector(s);

function renderAreas(){
  $('#areas').innerHTML=AREAS.map(a=>`<button class="area ${state.area?.id===a.id?'selected':''}" data-id="${a.id}" style="--area:${a.color}"><div class="area-icon"><i>${a.icon}</i></div><span>${a.name}<small>${a.items} SKUs</small></span><b>✓</b></button>`).join('');
  document.querySelectorAll('.area').forEach(btn=>btn.onclick=()=>{state.area=AREAS.find(a=>a.id===btn.dataset.id);renderAreas();updateStart()});
}
function renderSkills(){
  $('#skills').innerHTML=SKILLS.map(s=>`<div class="skill"><i>${s.icon}</i><div><b>${s.name}</b><small>${s.desc}</small></div><button data-id="${s.id}" data-delta="-1" ${state.skills[s.id]===0?'disabled':''}>−</button><strong>${state.skills[s.id]}</strong><button data-id="${s.id}" data-delta="1" ${state.points===0?'disabled':''}>+</button></div>`).join('');
  $('#points').textContent=state.points;
  document.querySelectorAll('.skill button').forEach(btn=>btn.onclick=()=>{const d=Number(btn.dataset.delta),id=btn.dataset.id;if(d>0&&state.points>0){state.skills[id]++;state.points--}if(d<0&&state.skills[id]>0){state.skills[id]--;state.points++}renderSkills();updateStart()});
}
function updateStart(){const ready=state.area&&state.points===0;$('#startBtn').disabled=!ready;$('#startBtn').textContent=ready?'INICIAR INVENTARIO  →':state.area?'DISTRIBUYE LOS 5 PUNTOS':'SELECCIONA UN ÁREA'}
function renderTasks(){
  $('#tasks').innerHTML=state.area.tasks.map((t,i)=>`<div class="task ${i<state.task?'done':i===state.task?'active':''}"><span>${i<state.task?'✓':String(i+1).padStart(2,'0')}</span><div><b>${t}</b><small>${i<state.task?'Conteo completado':i===state.task?'Contando productos…':'Pendiente'}</small></div>${i===state.task?'<i></i>':''}</div>`).join('');
}
function start(){
  state.running=true;$('#setupPanel').classList.add('hidden');$('#runPanel').classList.remove('hidden');$('#areaBadge').innerHTML=`<i>${state.area.icon}</i>${state.area.name.toUpperCase()}`;$('#areaBadge').style.setProperty('--badge',state.area.color);$('#world').style.setProperty('--accent',state.area.color);$('#routeTitle').textContent=state.area.name;$('#statusLabel').textContent='AUDITOR TRABAJANDO';$('#statusDot').classList.add('on');$('#workerTag').textContent='CONTANDO';updateETA();renderTasks();tick();
}
function tick(){
  clearTimeout(state.timer);if(!state.running)return;
  const speed=(.32+state.skills.speed*.085)*(state.boost?2.2:1),previous=state.progress;state.progress=Math.min(100,state.progress+speed);
  state.counted=Math.min(state.area.items,Math.floor(state.area.items*state.progress/100));
  const nextTask=Math.min(3,Math.floor(state.progress/25));if(nextTask!==state.task){state.task=nextTask;renderTasks()}
  const findChance=(.004+state.skills.focus*.003)*(state.boost?.75:1);if(Math.random()<findChance&&state.findings<5)state.findings++;
  const names=state.area.tasks;$('#currentTask').textContent=`${names[state.task]} · ${state.counted}/${state.area.items}`;$('#progressText').textContent=`${Math.floor(state.progress)}%`;$('#progressBar').style.width=`${state.progress}%`;$('#counted').textContent=state.counted;$('#findings').textContent=state.findings;
  const worker=$('#worker'),phase=(state.progress%25)/25;worker.style.setProperty('--walk',`${12+phase*65}%`);worker.style.setProperty('--lane',`${20+(state.task%2)*30}%`);$('#scanWave').style.left=`${22+phase*55}%`;
  if(state.progress>=100){finish();return}state.timer=setTimeout(tick,110);
}
function updateETA(){const secs=Math.ceil((100-state.progress)/(.32+state.skills.speed*.085)*.11);$('#eta').textContent=`${Math.max(1,Math.ceil(secs/60))} MIN`}
function finish(){state.running=false;$('#workerTag').textContent='LISTO';$('#statusLabel').textContent='INVENTARIO COMPLETADO';$('#currentTask').textContent='Área verificada';state.task=4;renderTasks();const accuracy=Math.min(100,90+state.skills.accuracy*2-Math.floor(Math.random()*3));$('#score').textContent=`${accuracy}%`;$('#resultTitle').textContent=`${state.area.name} completado`;$('#resultCopy').textContent=`${state.counted} unidades verificadas y ${state.findings} diferencias enviadas a revisión.`;setTimeout(()=>$('#resultDialog').showModal(),500)}
$('#startBtn').onclick=start;
$('#stopBtn').onclick=()=>{if(confirm('¿Cancelar esta jornada de inventario?'))location.reload()};
$('#boostBtn').onclick=()=>{if(state.boost)return;state.boost=true;$('#boostBtn').classList.add('used');$('#boostText').textContent='Impulso activo';setTimeout(()=>{state.boost=false;$('#boostText').textContent='Impulso utilizado'},8000)};
setInterval(()=>{$('#clock').textContent=new Date().toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit'})},1000);
renderAreas();renderSkills();updateStart();
