
const zones = [
  {id:'laptops',name:'Laptops y tablets',code:'TEC-01',stock:12,icon:'▰'},
  {id:'audio',name:'Audio',code:'TEC-02',stock:18,icon:'●'},
  {id:'celulares',name:'Celulares',code:'TEC-03',stock:24,icon:'▯'},
  {id:'gaming',name:'Gaming',code:'TEC-04',stock:15,icon:'◆'},
  {id:'tv',name:'TV y video',code:'TEC-05',stock:9,icon:'▰'},
  {id:'hogar',name:'Electrohogar',code:'TEC-06',stock:21,icon:'◒'},
  {id:'accesorios',name:'Accesorios',code:'TEC-07',stock:32,icon:'⌁'},
  {id:'almacen',name:'Almacén',code:'ALM-01',stock:27,icon:'▣'}
];
const zonePositions={laptops:[2,1],audio:[4,1],celulares:[2,3],gaming:[4,3],tv:[1,5],hogar:[3,5],accesorios:[5,5],almacen:[6,2]};
const state={x:0,y:4,counts:{},sound:true};
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const player=$('#player'), dialog=$('#countDialog'), input=$('#countInput'); let activeZone=null;

function renderList(){
  $('#zoneList').innerHTML=zones.map((z,i)=>{const done=state.counts[z.id]!==undefined,diff=done&&state.counts[z.id]!==z.stock;return `<div class="zone-row ${done?'done':''} ${diff?'diff':''}"><span class="num">${done?'✓':String(i+1).padStart(2,'0')}</span><div><strong>${z.name}</strong><small>${z.code}${done?` · ${state.counts[z.id]} unidades`:''}</small></div><span class="status">${done?(diff?'DIFERENCIA':'CORRECTO'):'PENDIENTE'}</span></div>`}).join('');
  const completed=Object.keys(state.counts).length,total=Object.values(state.counts).reduce((a,b)=>a+b,0),diffs=zones.filter(z=>state.counts[z.id]!==undefined&&state.counts[z.id]!==z.stock).length;
  $('#zoneCount').textContent=`${completed}/8`; $('#progressText').textContent=`${completed} / 8 zonas`; $('#progressBar').style.width=`${completed/8*100}%`; $('#scanned').textContent=total; $('#differences').textContent=diffs;
  $('#accuracy').textContent=completed?`${Math.round((completed-diffs)/completed*100)}%`:'—'; $('#finishBtn').disabled=completed<8;
  $$('.zone').forEach(el=>el.classList.toggle('done',state.counts[el.dataset.zone]!==undefined));
}
function nearby(){
  let nearest=null,dist=99; for(const [id,[x,y]] of Object.entries(zonePositions)){const d=Math.abs(x-state.x)+Math.abs(y-state.y);if(d<dist){dist=d;nearest=id}}
  $$('.zone').forEach(el=>el.classList.toggle('near',el.dataset.zone===nearest&&dist<=1&&!el.classList.contains('done'))); return dist<=1?nearest:null;
}
function move(dx,dy){state.x=Math.max(0,Math.min(6,state.x+dx));state.y=Math.max(0,Math.min(6,state.y+dy));player.style.setProperty('--x',state.x);player.style.setProperty('--y',state.y);nearby()}
function interact(){const id=nearby();if(!id){toast('Acércate a una zona pendiente');return} openCount(id)}
function openCount(id){activeZone=zones.find(z=>z.id===id);$('#dialogTitle').textContent=activeZone.name;$('#dialogCode').textContent=activeZone.code;$('#systemStock').textContent=`${activeZone.stock} und.`;$('#productIcons').textContent=activeZone.icon.repeat(4);input.value='';dialog.showModal();setTimeout(()=>input.focus(),100)}
function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),1800)}
document.addEventListener('keydown',e=>{if(dialog.open)return; const k=e.key.toLowerCase();if(['w','arrowup'].includes(k))move(0,-1);if(['s','arrowdown'].includes(k))move(0,1);if(['a','arrowleft'].includes(k))move(-1,0);if(['d','arrowright'].includes(k))move(1,0);if(k==='e'||k===' ')interact()});
$$('.zone').forEach(el=>el.addEventListener('click',()=>{if(el.classList.contains('near'))openCount(el.dataset.zone)}));
$('#countForm').addEventListener('submit',e=>{if(e.submitter?.value==='cancel')return; e.preventDefault();if(input.value==='')return;state.counts[activeZone.id]=Number(input.value);dialog.close();renderList();nearby();toast(state.counts[activeZone.id]===activeZone.stock?'Conteo correcto registrado':'Diferencia registrada para revisión')});
$('#finishBtn').addEventListener('click',()=>{const diffs=zones.filter(z=>state.counts[z.id]!==z.stock),total=Object.values(state.counts).reduce((a,b)=>a+b,0),acc=Math.round((8-diffs.length)/8*100);$('#resultContent').innerHTML=`<small>INVENTARIO COMPLETADO</small><h2>Buen trabajo, auditor</h2><div class="big">${acc}%</div><p>${total} unidades contadas · ${diffs.length} diferencias detectadas</p><p>${diffs.length?'Las diferencias quedaron marcadas para un segundo conteo.':'El inventario coincide completamente con el sistema.'}</p><button onclick="location.reload()">NUEVA JORNADA</button>`;$('#resultDialog').showModal()});
$('#soundBtn').addEventListener('click',e=>{state.sound=!state.sound;e.currentTarget.textContent=state.sound?'♪':'×'});
setInterval(()=>{const d=new Date();$('#clock').textContent=d.toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit'})},1000);
renderList();nearby();setTimeout(()=>$('#toast').classList.add('show'),500);setTimeout(()=>$('#toast').classList.remove('show'),3500);
