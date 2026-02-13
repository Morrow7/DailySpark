
const BASE_URL = 'http://localhost:3000/api';

async function runPaymentTest() {
  console.log('Running Payment API Test...');

  // 1. Auth
  const email = `paytest_${Date.now()}@example.com`;
  const password = 'password123';
  
  // Register/Login logic simplified (reuse from previous test logic if needed)
  // Assuming user exists or creating one
  let token = '';
  
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name: 'Pay User' })
  });
  
  if (regRes.ok) {
    const data = await regRes.json();
    token = data.token;
  } else {
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await loginRes.json();
    token = data.token;
  }
  
  console.log('✅ Auth Token Acquired');

  // 1.5 Seed Plans
  console.log('\n1.5 Seeding Plans...');
  await fetch(`${BASE_URL}/admin/seed-plans`, { method: 'POST' });

  // 2. Get Plans
  console.log('\n2. Fetching Plans...');
  const plansRes = await fetch(`${BASE_URL}/plans`);
  const plans = await plansRes.json();
  if (plans.length === 0) {
    console.error('No plans found. Please seed plans.');
    return;
  }
  console.log(`✅ Found ${plans.length} plans.`);
  const plan = plans[0];

  // 3. Create Order (WeChat)
  console.log(`\n3. Creating Order for ${plan.name} (${plan.price} CNY)...`);
  const orderRes = await fetch(`${BASE_URL}/payment/create`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      planId: plan.id,
      method: 'wechat'
    })
  });

  const orderData = await orderRes.json();
  if (!orderRes.ok) {
    console.error('Order creation failed:', orderData);
    return;
  }
  console.log('✅ Order Created:', orderData.orderId);
  console.log('   Pay URL:', orderData.code_url);

  // 4. Simulate Payment Notify
  console.log('\n4. Simulating Payment Callback...');
  const notifyRes = await fetch(`${BASE_URL}/payment/notify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: orderData.orderId,
      status: 'success'
    })
  });
  
  const notifyData = await notifyRes.json();
  console.log('✅ Notify Result:', notifyData);

  console.log('\nTest Completed.');
}

runPaymentTest().catch(console.error);
