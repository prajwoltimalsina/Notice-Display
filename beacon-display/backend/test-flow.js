const API_URL = 'http://localhost:5000/api/auth';

async function testFlow() {
  const testEmail = 'prajwoltimalsina110@gmail.com';
  const testPassword = 'testpassword123';
  const testName = 'Test User';

  console.log('1. Attempting to register a test user...');
  try {
    const registerRes = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword, name: testName })
    });
    const registerData = await registerRes.json();
    console.log('Register Response:', registerRes.status, registerData);
  } catch (err) {
    console.error('Failed to register (might already exist):', err.message);
  }

  console.log('\n2. Attempting to request forgot password...');
  try {
    const forgotRes = await fetch(`${API_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });
    const forgotData = await forgotRes.json();
    console.log('Forgot Password Response:', forgotRes.status, forgotData);
  } catch (err) {
    console.error('Failed to request forgot password:', err.message);
  }
}

testFlow();
