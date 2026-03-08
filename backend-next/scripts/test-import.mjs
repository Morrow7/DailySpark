
import path from 'path';
import fs from 'fs';
import * as XLSX from 'xlsx';

const BASE_URL = 'http://localhost:3000/api';

// Create a dummy excel file for testing
function createTestFile() {
  const data = [
    { word: 'apple', meaning: '苹果', phonetic: '/ˈæpl/', partOfSpeech: 'n.', level: 'CET4' },
    { word: 'banana', meaning: '香蕉', phonetic: '/bəˈnɑːnə/', partOfSpeech: 'n.', level: 'CET4' },
    { word: 'cherry', meaning: '樱桃', phonetic: '/ˈtʃeri/', partOfSpeech: 'n.', level: 'CET6' },
    // Duplicate for testing
    { word: 'apple', meaning: '苹果(Duplicate)', phonetic: '', partOfSpeech: '', level: '' },
    // Invalid
    { word: '', meaning: 'Empty Word', phonetic: '', partOfSpeech: '', level: '' }
  ];

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Words");
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  
  const filePath = path.join(__dirname, 'test_import.xlsx');
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

async function runImportTest() {
  console.log('Running Import API Test...');

  // 1. Login to get token
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test_import@example.com', password: 'password123' })
  });

  let token = '';
  if (loginRes.ok) {
    const data = await loginRes.json();
    token = data.token;
  } else {
    // Register if login fails
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test_import@example.com', password: 'password123', name: 'Importer' })
    });
    const data = await regRes.json();
    token = data.token;
  }
  console.log('✅ Auth Token:', token.substring(0, 10) + '...');

  // 2. Prepare File
  const filePath = createTestFile();
  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  const formData = new FormData();
  formData.append('file', blob, 'test_import.xlsx');

  // 3. Upload
  console.log('Uploading file...');
  const start = Date.now();
  const res = await fetch(`${BASE_URL}/words/import`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const result = await res.json();
  const duration = (Date.now() - start) / 1000;
  
  console.log(`⏱️ Import took ${duration}s`);
  console.log('Result:', JSON.stringify(result, null, 2));

  // Cleanup
  fs.unlinkSync(filePath);
}

runImportTest().catch(console.error);
