# Debug Server

The Debug Server provides a web interface to inspect TUI events, layout, and console output. It is useful for debugging and monitoring your Vuetty application during development.

## Enabling the Debug Server

To enable the Debug Server, pass the `debugServer` option when creating your Vuetty application:

```javascript
import { vuetty } from 'vuetty';
import MyComponent from './MyComponent.vue';

const app = vuetty(MyComponent, {
  debugServer: { enabled: true }
});
```

## Configuration Options

The Debug Server can be configured with the following options:

- **enabled**: `boolean` (default: `false`)
  Enable or disable the Debug Server.

- **port**: `number` (default: `3000`)
  The port on which the Debug Server will listen.

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

Once enabled, the Debug Server will start automatically when your application runs. You can access it by opening your web browser and navigating to:

```
http://localhost:3000
```

Replace `localhost` and `3000` with your configured host and port if you customized them.

## Features

The Debug Server provides the following features:

- **Event Monitoring**: View real-time events from your Vuetty application.
- **Layout Inspection**: Inspect the current layout and structure of your TUI.
- **Console Output**: Capture and view console logs, warnings, and errors.
- **Interactive Controls**: Clear events and interact with the debug interface.

## Disabling the Debug Server

To disable the Debug Server, either set `enabled` to `false` or omit the `debugServer` option entirely:

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