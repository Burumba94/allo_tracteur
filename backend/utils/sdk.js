import { createInstance } from 'sharetribe-flex-integration-sdk';

const sdk = createInstance({
  clientId: process.env.FLEX_INTEGRATION_CLIENT_ID,
  clientSecret: process.env.FLEX_INTEGRATION_CLIENT_SECRET,
  tokenStore: sdk.tokenStore.fileStore(),
});

async function authenticate() {
  try {
    const authInfo = await sdk.authInfo();
    if (authInfo.grantType === 'client_credentials') {
      console.log('Authentification réussie');
    } else {
      console.log('Authentification échouée');
    }
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
  }
}

authenticate();
