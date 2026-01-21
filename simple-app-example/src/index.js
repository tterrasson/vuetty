import { Vuetty } from 'vuetty';
import { createPinia } from 'pinia';
import App from '@pages/App.vue';

// Create Pinia store
const pinia = createPinia();

// Create Vuetty instance
const vuetty = new Vuetty({
  debugServer: {
    enabled: true,
  },
});

// Create and configure the app
vuetty.createApp(App);
vuetty.use(pinia);

// Mount the application
vuetty.mount();

// Graceful shutdown
process.on('SIGINT', () => {
  vuetty.unmount();
  process.exit(0);
});
