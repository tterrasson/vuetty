# Theming

Vuetty provides a comprehensive theming system that allows you to customize the appearance of your terminal applications. The theming system is designed to be flexible, powerful, and easy to use.

## Overview

Vuetty's theming system enables you to:

- Define global color schemes with multiple color formats (named, hex, RGB)
- Customize individual component appearances
- Create consistent UI experiences across your application
- Support light and dark themes
- Easily switch between different themes
- Mix and match color formats based on your needs

## How Theming Works

### Theme Structure

A Vuetty theme is a JavaScript object that defines the visual appearance of your application. Themes are structured hierarchically and support multiple color formats:

```javascript
const theme = {
  // Global settings - mix color formats as needed
  background: 'black',        // Named color
  foreground: '#d4d4d4',     // Hex color

  // Semantic colors - choose format based on use case
  primary: '#569cd6',         // Hex for brand colors
  secondary: 'gray',          // Named for standard colors
  success: 'rgb(106, 153, 85)', // RGB for programmatic colors
  warning: 'yellow',
  danger: '#f44747',
  info: 'cyan',

  // Component-specific settings
  components: {
    box: {
      color: '#569cd6',        // Component border color
      bg: 'black'              // Component background
    },
    textInput: {
      color: 'white',
      bg: '#1e1e1e',
      focusColor: 'rgb(86, 156, 214)',
      errorColor: 'red'
    },
    button: {
      variants: {
        primary: { bg: 'blue', color: 'white', bold: true }
      }
    }
    // ... other components
  }
};
```

### Supported Color Formats

Vuetty supports three color formats through its `colorUtils.js` module:

1. **Named Colors**: `'red'`, `'blue'`, `'cyan'`, `'magenta'`, `'blackBright'`, etc.
   - Best for standard terminal colors

2. **Hex Colors**: `'#FF5733'`, `'#f57'` (3 or 6 digits)
   - Best for precise brand colors
   - Supports shorthand notation

3. **RGB Colors**: `'rgb(255, 87, 51)'` (values 0-255)
   - Best for programmatic color generation
   - Spaces are optional

### Theme Application

Themes are applied when creating your Vuetty application:

```javascript
import { vuetty } from 'vuetty';
import MyApp from './MyApp.vue';

const app = vuetty(MyApp, {
  theme: myCustomTheme
});
```

### Theme Inheritance

Vuetty's theming system uses a deep merge strategy:

1. Start with the default theme
2. Merge in your custom theme
3. Component-specific settings override global settings
4. More specific settings override less specific ones

This allows you to customize only what you need while keeping the rest of the default styling.

## Theme Components

### Global Settings

Global settings apply to the entire application:

- `background`: The background color for the entire terminal screen
- `foreground`: The default text color for all components

### Semantic Colors

Semantic colors provide meaning to your UI elements:

- `primary`: Main accent color for primary actions
- `secondary`: Secondary accent color for less important actions
- `success`: Indicates successful operations
- `warning`: Indicates warnings or cautionary states
- `danger`: Indicates errors or dangerous actions
- `info`: Provides informational context

### Component-Specific Settings

Each component can have its own theme settings. For example:

```javascript
components: {
  button: {
    variants: {
      primary: { bg: 'blue', color: 'white', bold: true },
      secondary: { bg: 'gray', color: 'white', bold: false }
    }
  },
  textInput: {
    color: 'white',
    bg: 'black',
    focusColor: 'cyan',
    errorColor: 'red'
  }
}
```

## Advanced Theming

### Dynamic Themes

You can change themes dynamically at runtime:

```javascript
import { useTheme } from 'vuetty';

const { setTheme } = useTheme();

// Switch to dark theme
setTheme(darkTheme);

// Switch to light theme
setTheme(lightTheme);
```

### Theme Extensions

Extend existing themes rather than creating new ones from scratch:

```javascript
const myTheme = {
  ...baseTheme,
  primary: 'purple',
  components: {
    ...baseTheme.components,
    button: {
      ...baseTheme.components.button,
      variants: {
        ...baseTheme.components.button.variants,
        primary: { bg: 'purple', color: 'white' }
      }
    }
  }
};
```

### Conditional Theming

Apply themes conditionally based on environment or user preferences:

```javascript
const theme = isDarkMode
  ? darkTheme
  : lightTheme;

const app = vuetty(MyApp, { theme });
```

## Theme Examples

### Basic Theme (Named Colors)

```javascript
const basicTheme = {
  background: 'black',
  foreground: 'white',
  primary: 'blue',
  secondary: 'cyan',
  success: 'green',
  warning: 'yellow',
  danger: 'red',
  components: {
    button: {
      variants: {
        primary: { bg: 'blue', color: 'white' },
        danger: { bg: 'red', color: 'white' }
      }
    }
  }
};
```

### Modern Theme (Mixed Formats)

```javascript
const modernTheme = {
  // Global: Hex for precise branding
  background: '#1e1e1e',
  foreground: '#d4d4d4',

  // Semantic: Mix of hex and named
  primary: '#569cd6',
  secondary: '#4ec9b0',
  success: '#6a9955',
  warning: 'yellow',        // Named for compatibility
  danger: '#f44747',
  info: '#9cdcfe',

  components: {
    box: {
      color: '#569cd6',
      bg: '#1e1e1e'
    },
    textInput: {
      color: '#d4d4d4',
      bg: 'black',            // Named when precise value not needed
      focusColor: 'rgb(86, 156, 214)', // RGB for potential programmatic use
      errorColor: '#f44747'
    },
    button: {
      variants: {
        primary: {
          bg: '#569cd6',
          color: '#ffffff',
          bold: true
        },
        secondary: {
          bg: '#4ec9b0',
          color: '#1e1e1e',
          bold: false
        },
        danger: {
          bg: 'rgb(244, 71, 71)', // RGB for dynamic theming
          color: 'white',          // Named for simplicity
          bold: true
        }
      }
    }
  }
};
```

### Programmatic Theme (RGB Focus)

```javascript
// Generate a theme programmatically
function createTheme(primaryR, primaryG, primaryB) {
  return {
    background: '#000',
    foreground: '#fff',
    primary: `rgb(${primaryR}, ${primaryG}, ${primaryB})`,

    // Generate lighter variant
    primaryLight: `rgb(${Math.min(primaryR + 50, 255)}, ${Math.min(primaryG + 50, 255)}, ${Math.min(primaryB + 50, 255)})`,

    // Generate darker variant
    primaryDark: `rgb(${Math.max(primaryR - 50, 0)}, ${Math.max(primaryG - 50, 0)}, ${Math.max(primaryB - 50, 0)})`,

    components: {
      button: {
        variants: {
          primary: {
            bg: `rgb(${primaryR}, ${primaryG}, ${primaryB})`,
            color: 'white'
          }
        }
      }
    }
  };
}

const blueTheme = createTheme(86, 156, 214);
const greenTheme = createTheme(106, 153, 85);
```

## Troubleshooting

### Theme Not Applying

If your theme isn't applying correctly:

1. **Verify theme structure**: Ensure your theme object follows the correct format
2. **Check property names**: Component names must match exactly (case-sensitive)
3. **Validate color formats**:
   - Named: Must be valid chalk color names (lowercase)
   - Hex: Must be `#RGB` or `#RRGGBB` format
   - RGB: Must be `rgb(r, g, b)` format with values 0-255
4. **Check passing**: Ensure you're passing the theme to the `vuetty()` function correctly
5. **Component support**: Verify your component implements theme support

### Color Not Displaying

If colors aren't showing correctly:

```javascript
// ❌ Common mistakes
color: 'RGB(255, 0, 0)'      // Uppercase not supported
color: '#12345'              // Invalid hex length
color: 'rgb(300, 0, 0)'      // RGB > 255
color: 'rgba(255,0,0,0.5)' // RGBA not supported

// ✅ Correct formats
color: 'rgb(255, 0, 0)'  // Lowercase, valid range
color: '#FF0000'         // Valid hex
color: 'red'               // Valid named color
```

### Theme Conflicts

If you experience theme conflicts:

1. **Check merge order**: Later definitions override earlier ones
2. **Component specificity**: Component settings override global settings
3. **Duplicate definitions**: Ensure no accidental duplicate theme objects
4. **Test incrementally**: Start with a minimal theme and add gradually
5. **Debug color resolution**: Use `getChalkColorChain()` to test color parsing

### Performance Issues

If your theme is slow:

1. **Profile color usage**: Check if colors are resolved repeatedly
2. **Use named colors**: Fastest resolution (no regex)
3. **Avoid dynamic generation**: Don't create color strings in render loops
4. **Reduce unique colors**: Better caching with fewer colors
5. **Check terminal support**: Some terminals are slower with true color

## Further Reading

### Color System Deep Dive

For detailed information about how colors work in Vuetty, including:
- Color format specifications
- Performance optimizations
- Color resolution pipeline
- Technical implementation details

See the [Color Management Guide](./colors.md).

### Color Utilities API

Vuetty's color system is implemented in [src/utils/colorUtils.js](../../src/utils/colorUtils.js), which provides:

- `getChalkColorChain(color, chalkChain)` - Resolve foreground colors
- `getChalkBgChain(bg, chalkChain)` - Resolve background colors
- `normalizeColorForCache(color)` - Normalize colors for caching

All three formats (named, hex, RGB) are supported with optimized regex patterns for fast resolution.