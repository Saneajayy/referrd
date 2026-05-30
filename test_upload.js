import jwt from 'jsonwebtoken';

const token = jwt.sign({ id: 1, email: 'test@example.com', role: 'seeker' }, process.env.JWT_SECRET || 'fallback');

async function testUpload() {
  const formData = new FormData();
  // Using Blob since we don't have node-fetch FormData
  const blob = new Blob(['test pdf content'], { type: 'application/pdf' });
  formData.append('resume', blob, 'test.pdf');
  
  const res = await fetch('http://localhost:3000/api/auth/resume', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });
  const text = await res.text();
  console.log(res.status, text);
}
testUpload();
