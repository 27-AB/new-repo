const http = require('http');

function postData(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: urlObj.pathname,
      method: 'POST',
      headers: { 'Con
        tent-Type': 'application/json' }
    };
    
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function seedAll() {
  console.log('Seeding data...');
  
  // Seed Research Projects
  try {
    const researchResult = await postData('http://localhost:4001/projects/seed');
    console.log('Research Projects:', researchResult.statusCode, researchResult.body);
  } catch (e) {
    console.log('Research Projects error:', e.message);
  }
  
  // Seed Community Projects
  try {
    const communityResult = await postData('http://localhost:4002/community-projects/seed');
    console.log('Community Projects:', communityResult.statusCode, communityResult.body);
  } catch (e) {
    console.log('Community Projects error:', e.message);
  }
  
  // Seed Colleges
  try {
    const collegeResult = await postData('http://localhost:4003/seed');
    console.log('Colleges:', collegeResult.statusCode, collegeResult.body);
  } catch (e) {
    console.log('Colleges error:', e.message);
  }
  
  // Seed Auth Users
  try {
    const authResult = await postData('http://localhost:4004/auth/seed');
    console.log('Auth Users:', authResult.statusCode, authResult.body);
  } catch (e) {
    console.log('Auth Users error:', e.message);
  }
  
  console.log('Seeding complete!');
}

seedAll();