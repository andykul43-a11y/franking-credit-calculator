console.log('Testing backend imports...');

try {
  console.log('Current directory:', process.cwd());
  console.log('Files in current directory:');
  const fs = require('fs');
  console.log(fs.readdirSync('.'));
  
  console.log('Testing ES modules...');
  // This should work in Node 20
  console.log('Node version:', process.version);
  console.log('Test completed successfully');
} catch (error) {
  console.error('Error:', error.message);
}