async function run() {
  const sessionId = 'user-chat-tab-' + Date.now();
  
  console.log('Testing Live Chat with Multi-turn Context...');
  
  // Turn 1
  const r1 = await fetch('http://localhost:3001/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Unsa akong kinahanglanon para sa business permit?', sessionId })
  });
  const d1 = await r1.json();
  console.log('[Turn 1] User: "Unsa akong kinahanglanon para sa business permit?"');
  console.log('[Turn 1] Bot Reply:', d1.reply);
  console.log('[Turn 1] Intent:', d1.intent);
  
  // Turn 2: Exact query from screenshot
  const r2 = await fetch('http://localhost:3001/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'tag pila sab?', sessionId })
  });
  const d2 = await r2.json();
  console.log('\n[Turn 2] User: "tag pila sab?"');
  console.log('[Turn 2] Bot Reply:', d2.reply);
  console.log('[Turn 2] Intent:', d2.intent);
  
  // Turn 3: Follow-up duration
  const r3 = await fetch('http://localhost:3001/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'unsa kadugay sab?', sessionId })
  });
  const d3 = await r3.json();
  console.log('\n[Turn 3] User: "unsa kadugay sab?"');
  console.log('[Turn 3] Bot Reply:', d3.reply);
  console.log('[Turn 3] Intent:', d3.intent);
}

run().catch(console.error);
