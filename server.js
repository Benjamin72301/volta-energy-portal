const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let readings = [];
let registrations = [];
let readingCounter = 7700;
let regCounter = 100;

// === METER READING API ===
app.post('/api/readings', (req, res) => {
  const { account_id, reading, submitted_by } = req.body;
  if (!account_id || reading === undefined) return res.status(400).json({ status: 'error', message: 'account_id and reading required' });
  readingCounter++;
  const ref = `MR-${readingCounter}`;
  const bill = (Math.random() * 120 + 40).toFixed(2);
  const r = { id: readings.length + 1, account_id: String(account_id), reading: Number(reading), reference: ref, estimated_bill: parseFloat(bill), submitted_by: submitted_by || 'AI Agent', timestamp: new Date().toISOString() };
  readings.unshift(r);
  console.log(`[READING] ${account_id} | ${reading} | ${ref}`);
  res.json({ status: 'success', reference: ref, reading: Number(reading), estimated_bill: parseFloat(bill), message: 'Meter reading submitted successfully' });
});
app.get('/api/readings', (req, res) => res.json({ readings }));
app.get('/api/readings/:id', (req, res) => res.json({ readings: readings.filter(r => r.account_id === req.params.id) }));
app.delete('/api/readings', (req, res) => { readings = []; readingCounter = 7700; res.json({ status: 'cleared' }); });

// === REGISTRATION API ===
app.post('/api/register', (req, res) => {
  const { first_name, last_name, email, phone, address, postcode } = req.body;
  if (!first_name || !last_name || !email) return res.status(400).json({ status: 'error', message: 'first_name, last_name, email required' });
  regCounter++;
  const ref = `VE-${regCounter}`;
  const r = { id: registrations.length + 1, reference: ref, first_name, last_name, email, phone: phone || '', address: address || '', postcode: postcode || '', status: 'pending', timestamp: new Date().toISOString() };
  registrations.unshift(r);
  console.log(`[REG] ${first_name} ${last_name} | ${email} | ${ref}`);
  res.json({ status: 'success', reference: ref, first_name, last_name, email, phone: r.phone, address: r.address, postcode: r.postcode, message: `Registration received for ${first_name} ${last_name}` });
});
app.get('/api/register', (req, res) => {
  if (req.query.email) { const f = registrations.filter(r => r.email.toLowerCase() === req.query.email.toLowerCase()); return res.json({ registrations: f, found: f.length > 0 }); }
  res.json({ registrations });
});
app.get('/api/register/:ref', (req, res) => {
  const f = registrations.find(r => r.reference === req.params.ref);
  res.json(f ? { registration: f, found: true } : { registration: null, found: false });
});
app.delete('/api/register', (req, res) => { registrations = []; regCounter = 100; res.json({ status: 'cleared' }); });

// === CUSTOMER WEBSITE ===
app.get('/', (req, res) => { res.send(CUSTOMER_HTML); });

// === OPERATIONS PORTAL ===
app.get('/portal', (req, res) => { res.send(PORTAL_HTML); });

app.listen(PORT, () => {
  console.log(`\n  ⚡ Volta Energy Demo Portal\n  ===========================\n  Customer site:  http://localhost:${PORT}\n  Ops portal:     http://localhost:${PORT}/portal\n  API readings:   POST http://localhost:${PORT}/api/readings\n  API register:   POST http://localhost:${PORT}/api/register\n  Check reg:      GET  http://localhost:${PORT}/api/register?email=x\n`);
});

// === HTML TEMPLATES ===
const CUSTOMER_HTML = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Volta Energy</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}:root{--g:#00D26A;--d:#0A1628;--c:#111D32;--b:#1E2D47;--t:#E2E8F0;--m:#8896AB}body{font-family:'DM Sans',sans-serif;background:var(--d);color:var(--t);min-height:100vh}
.nav{padding:20px 40px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--b)}.nav-logo{display:flex;align-items:center;gap:10px}.nav-icon{width:32px;height:32px;background:var(--g);border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:var(--d)}.nav-t{font-size:18px;font-weight:700}.nav-t span{color:var(--g)}.nav-links{display:flex;gap:32px}.nav-links a{color:var(--m);text-decoration:none;font-size:14px;font-weight:500;transition:color .2s;cursor:pointer}.nav-links a:hover,.nav-links a.active{color:var(--g)}
.hero{max-width:800px;margin:80px auto 0;text-align:center;padding:0 40px}.hero h1{font-size:48px;font-weight:700;line-height:1.1;letter-spacing:-1.5px;margin-bottom:20px}.hero h1 span{color:var(--g)}.hero p{font-size:18px;color:var(--m);line-height:1.6;margin-bottom:40px}.hero-btn{display:inline-block;padding:16px 40px;background:var(--g);color:var(--d);font-size:16px;font-weight:700;border:none;border-radius:10px;cursor:pointer;text-decoration:none;transition:all .2s}.hero-btn:hover{background:#00FF85;transform:translateY(-1px)}
.form-page{display:none}.form-container{max-width:520px;margin:60px auto;padding:0 40px}.form-header{text-align:center;margin-bottom:40px}.form-header h2{font-size:28px;font-weight:700;margin-bottom:8px}.form-header p{color:var(--m);font-size:15px}
.fg{margin-bottom:20px}.fg label{display:block;font-size:13px;font-weight:600;color:var(--m);text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px}.fg input{width:100%;padding:14px 16px;background:var(--c);border:1px solid var(--b);border-radius:8px;color:var(--t);font-size:15px;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .2s}.fg input:focus{border-color:var(--g)}.fg input::placeholder{color:#4A5568}.fr{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.sbtn{width:100%;padding:16px;background:var(--g);color:var(--d);font-size:16px;font-weight:700;border:none;border-radius:10px;cursor:pointer;margin-top:12px;transition:all .2s;font-family:'DM Sans',sans-serif}.sbtn:hover{background:#00FF85}.sbtn:disabled{background:var(--b);color:var(--m);cursor:not-allowed}
.sp{display:none;text-align:center;max-width:500px;margin:80px auto;padding:0 40px}.sp-icon{width:72px;height:72px;background:rgba(0,210,106,.15);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;font-size:36px}.sp h2{font-size:28px;font-weight:700;margin-bottom:12px}.sp p{color:var(--m);font-size:15px;line-height:1.6}.sp-ref{display:inline-block;margin-top:20px;padding:10px 24px;background:rgba(0,210,106,.1);border:1px solid rgba(0,210,106,.25);border-radius:8px;font-size:18px;font-weight:600;color:var(--g);font-family:'JetBrains Mono','DM Sans',monospace}
.bl{display:inline-block;margin-top:32px;color:var(--m);font-size:14px;text-decoration:none;cursor:pointer}.bl:hover{color:var(--g)}</style></head>
<body>
<div class="nav"><div class="nav-logo"><div class="nav-icon">V</div><div class="nav-t"><span>Volta</span> Energy</div></div><div class="nav-links"><a class="active" onclick="showHome()">Home</a><a onclick="showForm()">Get Started</a><a>Tariffs</a><a>Help</a></div></div>
<div id="homePage" class="hero"><h1>Smart energy for a <span>brighter</span> future</h1><p>Join thousands of households already saving with Volta Energy. Transparent pricing, 100% renewable sources, and AI-powered support whenever you need it.</p><a class="hero-btn" onclick="showForm()">Get Started</a></div>
<div id="formPage" class="form-page"><div class="form-container"><div class="form-header"><h2>Create Your Account</h2><p>Fill in your details below and we will get you set up.</p></div>
<form id="regForm" onsubmit="sf(event)"><div class="fr"><div class="fg"><label>First Name</label><input type="text" name="first_name" placeholder="e.g. Sarah" required></div><div class="fg"><label>Last Name</label><input type="text" name="last_name" placeholder="e.g. Johnson" required></div></div>
<div class="fg"><label>Email Address</label><input type="email" name="email" placeholder="e.g. sarah@example.com" required></div>
<div class="fg"><label>Phone Number</label><input type="tel" name="phone" placeholder="e.g. 07700 900123"></div>
<div class="fg"><label>Home Address</label><input type="text" name="address" placeholder="e.g. 14 Maple Street, London"></div>
<div class="fg"><label>Postcode</label><input type="text" name="postcode" placeholder="e.g. SW1A 1AA"></div>
<button type="submit" class="sbtn" id="sb">Create Account</button></form><a class="bl" onclick="showHome()">Back to home</a></div></div>
<div id="successPage" class="sp"><div class="sp-icon">&#10003;</div><h2>Welcome to Volta Energy!</h2><p>Your account has been created. Our team will be in touch shortly.</p><div class="sp-ref" id="sRef">VE-101</div><p style="margin-top:20px;font-size:13px">If you are on the phone with us, let our agent know you have submitted the form.</p><br><a class="bl" onclick="showHome()">Back to home</a></div>
<script>
function showHome(){document.getElementById('homePage').style.display='block';document.getElementById('formPage').style.display='none';document.getElementById('successPage').style.display='none'}
function showForm(){document.getElementById('homePage').style.display='none';document.getElementById('formPage').style.display='block';document.getElementById('successPage').style.display='none'}
function showSuccess(r){document.getElementById('homePage').style.display='none';document.getElementById('formPage').style.display='none';document.getElementById('successPage').style.display='block';document.getElementById('sRef').textContent=r}
async function sf(e){e.preventDefault();const b=document.getElementById('sb');b.disabled=true;b.textContent='Creating account...';const d=Object.fromEntries(new FormData(document.getElementById('regForm')));try{const r=await fetch('/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});const j=await r.json();if(j.status==='success')showSuccess(j.reference);else alert('Something went wrong.');}catch(err){alert('Connection error.');}b.disabled=false;b.textContent='Create Account';}
</script></body></html>`;

const PORTAL_HTML = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Volta Energy — Operations</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}:root{--g:#00D26A;--d:#0A1628;--c:#111D32;--b:#1E2D47;--t:#E2E8F0;--m:#8896AB;--bl:#4DA8FF}body{font-family:'DM Sans',sans-serif;background:var(--d);color:var(--t);min-height:100vh}
.hd{padding:20px 40px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--b);background:linear-gradient(180deg,#0E1E36 0%,var(--d) 100%)}.logo{display:flex;align-items:center;gap:10px}.li{width:32px;height:32px;background:var(--g);border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:var(--d)}.lt{font-size:18px;font-weight:700}.lt span{color:var(--g)}.hb{display:flex;align-items:center;gap:8px;padding:6px 14px;background:rgba(0,210,106,.1);border:1px solid rgba(0,210,106,.25);border-radius:20px;font-size:13px;color:var(--g);font-weight:500}.pu{width:8px;height:8px;background:var(--g);border-radius:50%;animation:pu 2s ease-in-out infinite}@keyframes pu{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(0,210,106,.4)}50%{opacity:.7;box-shadow:0 0 0 8px rgba(0,210,106,0)}}
.tabs{display:flex;gap:0;padding:0 40px;border-bottom:1px solid var(--b)}.tab{padding:14px 24px;font-size:14px;font-weight:500;color:var(--m);cursor:pointer;border-bottom:2px solid transparent;transition:all .2s}.tab:hover{color:var(--t)}.tab.active{color:var(--g);border-bottom-color:var(--g)}
.ct{max-width:1100px;margin:0 auto;padding:28px 40px}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:28px}.sc{background:var(--c);border:1px solid var(--b);border-radius:10px;padding:18px 20px}.sl{font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--m);margin-bottom:6px;font-weight:600}.sv{font-size:28px;font-weight:700;font-family:'JetBrains Mono',monospace}.sv.gr{color:var(--g)}.sv.bl{color:var(--bl)}
.st{font-size:13px;text-transform:uppercase;letter-spacing:1.5px;color:var(--m);margin-bottom:14px;font-weight:600}.tw{background:var(--c);border:1px solid var(--b);border-radius:10px;overflow:hidden;margin-bottom:28px}table{width:100%;border-collapse:collapse}th{text-align:left;padding:12px 18px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--m);font-weight:600;border-bottom:1px solid var(--b);background:rgba(0,0,0,.2)}td{padding:14px 18px;font-size:13px;border-bottom:1px solid rgba(30,45,71,.5);font-family:'JetBrains Mono',monospace}tr:last-child td{border-bottom:none}tr.nr{animation:fi 2s ease-out}@keyframes fi{0%{background:rgba(0,210,106,.25)}100%{background:transparent}}
.bd{display:inline-block;padding:3px 10px;border-radius:6px;font-size:12px;font-weight:500}.bg{background:rgba(0,210,106,.12);border:1px solid rgba(0,210,106,.2);color:var(--g)}.bb{background:rgba(0,140,255,.12);border:1px solid rgba(0,140,255,.2);color:var(--bl)}.ba{background:rgba(255,184,0,.12);border:1px solid rgba(255,184,0,.2);color:#FFB800}
.es{text-align:center;padding:50px 20px;color:var(--m)}.es .ic{font-size:40px;margin-bottom:12px;opacity:.3}.tc{display:none}.tc.active{display:block}
.rb{position:fixed;bottom:20px;right:20px;padding:8px 16px;background:rgba(255,255,255,.05);border:1px solid var(--b);border-radius:8px;color:var(--m);font-size:12px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s}.rb:hover{background:rgba(255,50,50,.15);border-color:rgba(255,50,50,.3);color:#FF6B6B}</style></head>
<body>
<div class="hd"><div class="logo"><div class="li">V</div><div class="lt"><span>Volta</span> Energy — Operations</div></div><div class="hb"><div class="pu"></div>Live</div></div>
<div class="tabs"><div class="tab active" onclick="st('r')">Meter Readings</div><div class="tab" onclick="st('g')">New Registrations</div></div>
<div class="ct">
<div class="stats"><div class="sc"><div class="sl">Readings Today</div><div class="sv gr" id="rc">0</div></div><div class="sc"><div class="sl">Latest Reading</div><div class="sv" id="lr">—</div></div><div class="sc"><div class="sl">Registrations</div><div class="sv bl" id="gc">0</div></div><div class="sc"><div class="sl">Last Activity</div><div class="sv" id="la" style="font-size:18px;padding-top:4px">—</div></div></div>
<div id="tr" class="tc active"><div class="st">Recent Meter Readings</div><div class="tw"><table><thead><tr><th>Time</th><th>Account</th><th>Reading</th><th>Reference</th><th>Est. Bill</th><th>Source</th></tr></thead><tbody id="rb"></tbody></table><div class="es" id="re"><div class="ic">&#9889;</div><p>Waiting for meter readings...</p></div></div></div>
<div id="tg" class="tc"><div class="st">New Customer Registrations</div><div class="tw"><table><thead><tr><th>Time</th><th>Reference</th><th>Name</th><th>Email</th><th>Postcode</th><th>Status</th></tr></thead><tbody id="gb"></tbody></table><div class="es" id="ge"><div class="ic">&#128100;</div><p>Waiting for registrations...</p></div></div></div>
</div>
<button class="rb" onclick="ra()">Reset All Demo Data</button>
<script>
let lrc=0,lgc=0;
function st(t){document.querySelectorAll('.tab').forEach((e,i)=>{e.classList.toggle('active',(t==='r'&&i===0)||(t==='g'&&i===1))});document.querySelectorAll('.tc').forEach(e=>e.classList.remove('active'));document.getElementById(t==='r'?'tr':'tg').classList.add('active')}
async function fa(){try{const[rr,gr]=await Promise.all([fetch('/api/readings').then(r=>r.json()),fetch('/api/register').then(r=>r.json())]);const rd=rr.readings||[],rg=gr.registrations||[];
document.getElementById('rc').textContent=rd.length;document.getElementById('gc').textContent=rg.length;document.getElementById('lr').textContent=rd.length?rd[0].reading.toLocaleString():'—';
const all=[...rd,...rg].sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp));if(all.length)document.getElementById('la').textContent=new Date(all[0].timestamp).toLocaleTimeString('en-GB');
document.getElementById('re').style.display=rd.length?'none':'block';document.getElementById('rb').innerHTML=rd.map((r,i)=>'<tr class="'+(rd.length>lrc&&i===0?'nr':'')+'"><td>'+new Date(r.timestamp).toLocaleTimeString('en-GB')+'</td><td>'+r.account_id+'</td><td>'+r.reading.toLocaleString()+'</td><td><span class="bd bg">'+r.reference+'</span></td><td>\\u00a3'+r.estimated_bill.toFixed(2)+'</td><td><span class="bd bb">'+(r.submitted_by||'AI Agent')+'</span></td></tr>').join('');
document.getElementById('ge').style.display=rg.length?'none':'block';document.getElementById('gb').innerHTML=rg.map((r,i)=>'<tr class="'+(rg.length>lgc&&i===0?'nr':'')+'"><td>'+new Date(r.timestamp).toLocaleTimeString('en-GB')+'</td><td><span class="bd bg">'+r.reference+'</span></td><td>'+r.first_name+' '+r.last_name+'</td><td>'+r.email+'</td><td>'+r.postcode+'</td><td><span class="bd ba">'+r.status+'</span></td></tr>').join('');
if(rg.length>lgc&&lgc>0)st('g');lrc=rd.length;lgc=rg.length;}catch(e){console.error(e)}}
async function ra(){if(confirm('Clear all?')){await Promise.all([fetch('/api/readings',{method:'DELETE'}),fetch('/api/register',{method:'DELETE'})]);fa()}}
fa();setInterval(fa,2000);
</script></body></html>`;
