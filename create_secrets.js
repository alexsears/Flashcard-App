const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const secrets = [
  { name: 'node-env', value: 'production' },
  { name: 'cors-origin', value: 'https://server-696840761999.us-south1.run.app' },
  { name: 'log-level', value: 'info' },
  { name: 'firebase-project-id', value: 'pootcuppeelek' },
  { name: 'firebase-client-email', value: 'firebase-adminsdk-ph4el@pootcuppeelek.iam.gserviceaccount.com' },
  { name: 'firebase-config', value: '{"projectId":"pootcuppeelek","privateKey":"AIzaSyDLapizLTn_LCbx_dUHIMcwbDDtKd8PVrE","clientEmail":"firebase-adminsdk-ph4el@pootcuppeelek.iam.gserviceaccount.com"}' },
  { name: 'server-url', value: 'https://server-696840761999.us-south1.run.app' },
  { name: 'react-app-firebase-api-key', value: 'AIzaSyDLapizLTn_LCbx_dUHIMcwbDDtKd8PVrE' },
  { name: 'react-app-firebase-messaging-sender-id', value: '696840761999' },
  { name: 'react-app-firebase-app-id', value: '1:696840761999:web:74a12cc8b34977650df6fa' },
  { name: 'react-app-firebase-measurement-id', value: 'G-B4E9X1V3S5' },
  { name: 'react-app-api-url', value: 'https://server-696840761999.us-south1.run.app' },
  { name: 'FIREBASE_PRIVATE_KEY_BASE64', value: 'LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tCk1JSUV2UUlCQURBTkJna3Foa2lHOXcwQkFRRUZBQVNDQktjd2dnU2pBZ0VBQW9JQkFRRG9KaWhsZUZmc0hmbU0KNmhVaU50cGJQYmcvengwQ2gyMThhSFJlMTVlQzROSXhrd2VPRm8vcmEweHJGQXp6end4V2tmck0yZDZ2NGtxNwplWjlVQ2svSjRXRFlNZVdJLzM5WGFMQUV2Z2Z6cTRxRHZqNWR0bWxJU2F6ZllHZ2dYTldsQzBMcTYrUFFtNjR2CnFDSmthK2JkTXRKeUZrOWlqbys4SFJoOXJmOEtWOWdUd1JJdW05UWpJZkpaR3FMcVhBcjlPcFZUOFJYRFkzK1YKbERHVmd0SW0vM2Nzc0lrQVNHcjhRWGhqdWo0RktBdi9LZ1JoYnF1aVVmQTZZN3A1S0xZbXZRaWw1eStvME55NApyZHhMVnhGcmJmS1lJVFlmSnVCSGhtKy9EcEp6MmV3YU9SZC9jNndOUDZRaVBhNVNSOVdzTnBRbEExL2sxQjJNCkxLMmI3TGI3QWdNQkFBRUNnZ0VBRkRrR3VkZ2k2Sm12M0h1anZhaERtMEVrSk1MWkJ4aGZERUJaS3MzakQrNmYKd052TEE3Q3BkdHVRKzU3eWhlYWFiNHdsNmVSc3hxdVMwUVFHUWg3bjFuRkFxM1NsUnlyaW4rMnByN0FTSjBMaApQUnE4ZWhOaTFuNDhoZlR5L1NhNUliaDZhdGFEc085dTNBM3NlUTBCUG5HbjdYSk9GZ3JQTUpia1JFWjgraHlFCllaNE11N1J1ZFh3YnRBdC9hSWV6SGdGMlU2M2QzR0VqMjU4UXlEQnduMytscXk0bXZEa1d3ZFBLSHJ0aVM2Q0EKNCs1dHRpVHBxWWxOTWdxUllaWHJGdHlTUTV4dUNFWGVGZUxHQ1JKTmRzc3NxRklHL214TjMzaDNINTBlUDE4bAo4dmpYeWJ0OXBwaDVISGJscmlLOWVsaVJXMFRHM281TzUwMmRMTTlaNlFLQmdRRDhVN2J5bVVIeDhWbklDQ3JyCnFnZnNkeGFXcVBqb2tCb0lwTG53a0dDdGNVUzhyVWZOOXd1K1FzZitYR3ZENndMQTMyMlVVLzJicys3MDZ2T3AKckdLdmFXcEJaWWRndE5NUkpRclRXdzhNY1dyTlE2QWhRL29BZ0Z1ZlBNT20vWDVSMTYwWHdXUlZ1OXpkelZKUAo5RExTZGxnOGpSTk9mckh6Zy80Si9oWjNod0tCZ1FEcmgwQTdOMzJSN3BWOGFmNW5URFRzNWM1c0hwdGdGWm9VCk5lbHY2YTR4RnNFV3A1aGJKZkdGY25kSUpEVHFoT3dZN1VadVVxWWVUaC8wcUl4aThVNVFiSWpEQnpjUVFXL20KbFJQK2YxcjJuMzVabDlOT2dJbU1WbzRjbWZWSFhZcncxK3hVU2FPUTRJT29ISUlwL2I1bGFNNXYwTE43SHNoZQo5bHRlbGlVNTdRS0JnQ2g2QVdIL1JiM2ErbzBGQ21XTmZBSHB4SnpjZERsU1RHclFpZWRXTWJ3QTdJYmJ3U1lBCkdFa29DMDc1WW13bU9lWFlzWXBXd3RzRVRUUEtzTldxQ3BhYThXbVdNTlpKaTRZM2kvb0ZwRzlaamtscExMbkoKWHNSUDB1TERhNXRSRkw5cU9xRVI2OWQ0OEdCQVBKRUkybEk2bThMeTJvTC8vZW5UWmFBU3UyWG5Bb0dCQUprRApvRzRZU2VNUi9sbjZ2b1c3azdMSVJjZ21Sa2t4SDQyN3pMR2hQa0swQnJQQ0pCQXJZWEtSLy82RlR6K0JKYVc0CkdRYTVlU1M5R3JPbkFMV1RFWTdjUkNsNE9ZUzlEb2JlR1VSQTF3YmNiWWlsUTJsL3hseS9Lc3BZRjJySzBlWlEKVVVBZEt6K0hMT0Y5eSs2ZDVDRWI2dW5ueTRMVVo5YVI5S0JKcVZ1dEFvR0FDWktSeENSaHR1ZlNDajF1U01tRAo4Q0V0MVBDakhHR2RuVWp3NUhYNVhOUjRhckFsNXV2V2JVTFpWamswNVcyTE9ESXhSRXE3WkhxSlh5bkZva3FlCnIyN1Btb0VhbzFFdjNkUUJLTHJ6RUtZcC95aFJTTHE5Tms1T0VpWEhKWDNtT3lmRXpzejl2VWdRWnNFTjlnNlQKby9jcEVlODdlTVdYSW0rNXN1TWVHQ2M9Ci0tLS0tRU5EIFBSSVZBVEUgS0VZLS0tLS0K' }

];

async function createSecret(name, value) {
    const command = `echo -n "${value}" | gcloud secrets create ${name} --data-file=-`;
    try {
      const { stdout, stderr } = await execPromise(command);
      console.log(`Secret '${name}' created successfully.`);
      if (stderr) console.error(`Warning for '${name}':`, stderr);
    } catch (error) {
      console.error(`Failed to create secret '${name}':`, error.message);
    }
  }
  
  async function createAllSecrets() {
    for (const secret of secrets) {
      await createSecret(secret.name, secret.value);
    }
    console.log('All secrets have been created.');
  
    const deployCommand = `gcloud run deploy server --image gcr.io/pootcuppeelek/server --platform managed --region us-south1 --allow-unauthenticated --set-secrets=NODE_ENV=node-env:latest,CORS_ORIGIN=cors-origin:latest,LOG_LEVEL=log-level:latest,FIREBASE_PROJECT_ID=firebase-project-id:latest,FIREBASE_CLIENT_EMAIL=firebase-client-email:latest,FIREBASE_CONFIG=firebase-config:latest,SERVER_URL=server-url:latest,REACT_APP_FIREBASE_API_KEY=react-app-firebase-api-key:latest,REACT_APP_FIREBASE_MESSAGING_SENDER_ID=react-app-firebase-messaging-sender-id:latest,REACT_APP_FIREBASE_APP_ID=react-app-firebase-app-id:latest,REACT_APP_FIREBASE_MEASUREMENT_ID=react-app-firebase-measurement-id:latest,REACT_APP_API_URL=react-app-api-url:latest --set-env-vars=PORT=8080 --command="node" --args="functions/index.js"`;
  
    console.log('\nUse the following command to deploy your Cloud Run service:');
    console.log(deployCommand);
  }
  
  createAllSecrets();