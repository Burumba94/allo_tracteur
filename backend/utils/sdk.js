import pkg from 'sharetribe-flex-integration-sdk';

const { createInstance, tokenStore } = pkg;

const sdk = createInstance({
  clientId: process.env.FLEX_INTEGRATION_CLIENT_ID,
  clientSecret: process.env.FLEX_INTEGRATION_CLIENT_SECRET,
  tokenStore: tokenStore.memoryStore(),
});

export default sdk;
