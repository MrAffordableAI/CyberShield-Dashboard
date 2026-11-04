(function(){
'use strict';
const $ = id => document.getElementById(id);
const items = [
'Use a strong device passcode and enable biometrics where supported',
'Enable automatic operating system and security updates',
'Enable multifactor authentication for primary email and Apple/Google account',
'Review device and app permissions',
'Confirm you have an account recovery plan and current backup'
];
const checklist = $('checks');
items.forEach((label,i) => {
  const row=document.createElement('label'); row.className='checkrow';
  const box=document.createElement('input');box.type='checkbox';box.dataset.number=String(i);
  box.addEventListener('change',update);
  const span=document.createElement('span');span.textContent=label;
  row.append(box,span);checklist.append(row);
});
function update(){
  const count=checklist.querySelectorAll('input:checked').length;
  $('completion').textContent=count+' of '+items.length+' self-confirmed';
}
$('reset').addEventListener('click',()=>{checklist.querySelectorAll('input').forEach(el=>el.checked=false);update();});
function paragraph(parent,text){
  const p=document.createElement('p');p.textContent=text;parent.append(p);
}
function analyze(){
  const result=window.PhoneShieldSecurity.analyze($('link-input').value);
  const output=$('analysis');
  output.replaceChildren();
  output.className='result '+result.status;
  const heading=document.createElement('strong');heading.textContent=result.title;output.append(heading);
  if(result.host) paragraph(output,'Parsed destination hostname: '+result.host);
  if(result.flags.length){
    const ul=document.createElement('ul');
    result.flags.forEach(flag=>{const li=document.createElement('li');li.textContent=flag;ul.append(li);});
    output.append(ul);
  }
  result.notes.forEach(note=>paragraph(output,note));
}
$('analyze').addEventListener('click',analyze);
$('link-input').addEventListener('keydown',e=>{if(e.key==='Enter')analyze();});
update();
})();