import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

async function run() {
  const form = new FormData();
  form.append('jobId', '1');
  
  // create dummy pdf
  const pdfData = Buffer.from(
      "%PDF-1.4\n" +
      "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n" +
      "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n" +
      "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n" +
      "4 0 obj\n<< /Length 21 >>\nstream\nBT\n/F1 24 Tf\n100 100 Td\n(Hello World) Tj\nET\nendstream\nendobj\n" +
      "xref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000219 00000 n \n" +
      "trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n291\n%%EOF\n"
  );
  
  form.append('resume', pdfData, {
    filename: 'dummy.pdf',
    contentType: 'application/pdf',
  });

  console.log("Sending request to localhost:3000/api/jobs/match-resume...");
  try {
    const res = await fetch('http://localhost:3000/api/jobs/match-resume', {
      method: 'POST',
      body: form
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Body:", text);
  } catch (err) {
    console.error("Fetch error:", err);
  }
}
run();
