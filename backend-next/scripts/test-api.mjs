
const BASE_URL = 'http://localhost:3000/api';

async function runTests() {
  console.log('Running API Integration Tests...');

  // 1. Register
  const email = `test${Date.now()}@example.com`;
  const password = 'password123';
  
  console.log(`\n1. Registering user: ${email}`);
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name: 'Test User' })
  });
  
  const regData = await regRes.json();
  if (!regRes.ok) {
    console.error('Register failed:', regData);
    return;
  }
  console.log('✅ Register success. Token received.');
  const token = regData.token;

  // 2. Login (Verify)
  console.log('\n2. Verifying Login...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (!loginRes.ok) {
    console.error('Login failed');
    return;
  }
  console.log('✅ Login success.');

  // 3. Add Word
  console.log('\n3. Adding a word...');
  const wordRes = await fetch(`${BASE_URL}/words`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      word: 'serendipity',
      meaning: 'happy accident',
      level: 'Advanced'
    })
  });

  const wordData = await wordRes.json();
  if (!wordRes.ok) {
    console.error('Add word failed:', wordData);
  } else {
    console.log('✅ Word added:', wordData.word);
  }

  // 4. List Words
  console.log('\n4. Listing words...');
  const listRes = await fetch(`${BASE_URL}/words`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const listData = await listRes.json();
  console.log(`✅ Retrieved ${listData.length} words.`);

  console.log('\nTests Completed.');
}

runTests().catch(console.error);
