const form=document.getElementById('chatForm');
const input=document.getElementById('userInput');
const historyBox=document.getElementById('chatHistory');
const solution=document.getElementById('solutionContent');
const welcome=document.getElementById('welcome');
const sendBtn=document.getElementById('sendBtn');
const statusText=document.getElementById('status');
let messages=[],busy=false;

function addMessage(role,text){
 const el=document.createElement('div');
 el.className='message '+role;
 el.textContent=text;
 historyBox.appendChild(el);
 document.getElementById('chatScroll').scrollTop=999999;
}
function showAnswer(text){
 solution.replaceChildren();
 const el=document.createElement('div');
 el.className='answer';
 el.textContent=text;
 solution.appendChild(el);
 if(window.MathJax?.typesetPromise) window.MathJax.typesetPromise([el]).catch(()=>{});
}
async function ask(value){
 const question=value.trim();
 if(!question||busy)return;
 busy=true;welcome.hidden=true;
 addMessage('user',question);messages.push({role:'user',content:question});
 input.value='';sendBtn.disabled=true;sendBtn.textContent='…';
 statusText.textContent='● Thinking';solution.textContent='Preparing your solution…';
 try{
  const response=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages})});
  const data=await response.json();
  if(!response.ok)throw new Error(data.error||'Request failed');
  messages.push({role:'assistant',content:data.answer});
  addMessage('assistant',data.answer);showAnswer(data.answer);
  statusText.textContent='● Solution ready';
 }catch(err){
  messages.pop();addMessage('assistant',err.message);
  solution.textContent=err.message;statusText.textContent='● Error';
 }finally{busy=false;sendBtn.disabled=false;sendBtn.textContent='↑';input.focus();}
}
form.addEventListener('submit',e=>{e.preventDefault();ask(input.value)});
input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();form.requestSubmit()}});
document.querySelectorAll('.suggestion').forEach(b=>b.addEventListener('click',()=>ask(b.dataset.question)));
document.getElementById('newChat').addEventListener('click',()=>{
 if(busy)return;messages=[];historyBox.replaceChildren();welcome.hidden=false;
 solution.innerHTML='<div class="empty"><div>📘</div><h3>Your explanation appears here</h3><p>Ask a question in the chat. The complete solution will appear here.</p></div>';
 statusText.textContent='● Ready';input.value='';
});
