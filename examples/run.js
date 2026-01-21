import { createVuetty } from 'vuetty';
import { examples } from './examples.js';

const arg = process.argv[2];
const shouldList = !arg || arg === '--list' || arg === '-l';

const listExamples = () => {
  console.log('Available examples:');
  for (const example of examples) {
    console.log(`- ${example.id} (${example.title})`);
  }
  console.log('\nUsage: bun run exs/run.js <example-id>');
};

if (shouldList) {
  listExamples();
  process.exit(0);
}

const example = examples.find((item) => item.id === arg);

if (!example) {
  console.error(`Unknown example: ${arg}`);
  listExamples();
  process.exit(1);
}

const module = await import(example.url);
const Component = module.default;

if (!Component) {
  console.error(`Example did not export a component: ${example.id}`);
  process.exit(1);
}

const app = createVuetty();
app.createApp(Component);
app.mount();

const cleanup = () => {
  app.unmount();
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
