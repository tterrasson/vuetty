# Debug Server

The Debug Server provides a web UI to inspect TUI events, layout, and console output. Use it to debug and monitor your Vuetty app during development.

## Enabling the Debug Server

To enable the Debug Server, pass the `debugServer` option when creating your Vuetty app:

```javascript
import { vuetty } from 'vuetty';
import MyComponent from './MyComponent.vue';

const app = vuetty(MyComponent, {
  debugServer: { enabled: true }
});
```

## Configuration Options

The Debug Server supports these options:

- **enabled**: `boolean` (default: `false`)
  Enable or disable the Debug Server.

- **port**: `number` (default: `3000`)
  The port the Debug Server listens on.

- **host**: `string` (default: `'localhost'`)
  The host address for the Debug Server.

- **captureConsole**: `boolean` (default: `true`)
  Enable or disable console output capture.

### Example with Custom Configuration

```javascript
const app = vuetty(MyComponent, {
  debugServer: {
    enabled: true,
    port: 4000,
    host: '0.0.0.0',
    captureConsole: true
  }
});
```

## Accessing the Debug Server

Once enabled, the Debug Server starts automatically when your app runs. Open it in your browser at:

```
http://localhost:3000
```

Replace `localhost` and `3000` with your configured host and port if needed.

## Features

The Debug Server includes:

- **Event Monitoring**: View real-time events from your Vuetty app.
- **Layout Inspection**: Inspect the current layout and structure of your TUI.
- **Console Output**: Capture and view console logs, warnings, and errors.
- **Interactive Controls**: Clear events and interact with the debug interface.

## Disabling the Debug Server

To disable the Debug Server, set `enabled` to `false` or omit `debugServer` entirely:

```javascript
const app = vuetty(MyComponent, {
  debugServer: { enabled: false }
});
```

Or simply:

```javascript
const app = vuetty(MyComponent);
```

## Notes

- The Debug Server is intended for development use only. Disable it in production environments.
- Ensure the configured port is available and not blocked by a firewall.
- The Debug Server runs independently of your main application and does not interfere with its operation.
