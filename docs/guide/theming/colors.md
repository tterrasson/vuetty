# Color Management

Vuetty provides a comprehensive color management system that handles how colors are defined, resolved, and applied in terminal applications. This system is built on top of [chalk](https://github.com/chalk/chalk), a popular terminal string styling library.

## Color System Overview

### Supported Color Formats

Vuetty supports multiple color formats through its chalk integration:

- **Named colors**: All standard chalk color names (`red`, `green`, `blue`, `yellow`, `cyan`, `magenta`, `white`, `black`, `gray`, `blackBright`, `redBright`, `greenBright`, etc.)
- **Hex colors**: 3-digit (`#F00`) or 6-digit hexadecimal codes (`#FF5733`, `#4a4a4a`)
- **RGB colors**: CSS-style RGB notation (`rgb(255, 87, 51)`) with values from 0-255

### How Colors Work in Vuetty

When you specify a color in Vuetty:

1. **Color Parsing**: The `colorUtils.js` module parses your color value using optimized regex patterns
2. **Format Detection**: Automatically detects if the color is named, hex, or RGB format
3. **Chalk Chain Creation**: Creates the appropriate chalk color chain based on the format
4. **Terminal Detection**: Chalk detects the terminal's color capabilities
5. **ANSI Code Generation**: Appropriate ANSI escape codes are generated
6. **Terminal Rendering**: The codes are applied to the terminal output

This process ensures maximum compatibility and performance across different terminal emulators.

### Color Resolution Process

Vuetty uses a sophisticated color resolution algorithm:

**For Foreground Colors:**
1. Check if it's a named color (e.g., `red`, `blue`)
2. Check if it's a hex color matching `#RGB` or `#RRGGBB` pattern
3. Check if it's an RGB color matching `rgb(r, g, b)` pattern
4. Validate RGB values are within 0-255 range

**For Background Colors:**
1. Try named background colors (e.g., `bgRed`, `bgBlue`)
2. Use `bgHex()` for hex colors
3. Use `bgRgb()` for RGB colors with validation

All invalid colors return `null` and fall back to defaults.

### Color Usage

Colors can be applied to components through the theme configuration. Mix and match different formats based on your needs:

```javascript
// In your theme configuration
const theme = {
  // Named colors - fast and readable
  background: 'black',
  foreground: 'white',

  // Hex colors - precise color control
  primary: '#569cd6',
  secondary: '#4ec9b0',

  // RGB colors - programmatic color generation
  success: 'rgb(106, 153, 85)',

  components: {
    button: {
      variants: {
        primary: {
          bg: '#569cd6',        // Hex background
          color: 'white'        // Named foreground
        },
        danger: {
          bg: 'rgb(244, 71, 71)', // RGB background
          color: '#ffffff'        // Hex foreground
        }
      }
    }
  }
};
```

## Theme Color Structure

### Global Colors

The theme provides global color settings that apply across your application:

- `background`: Global screen background color
- `foreground`: Default text color
- `primary`: Primary accent color
- `secondary`: Secondary accent color
- `success`: Success state color (typically green)
- `warning`: Warning state color (typically yellow)
- `danger`: Danger/error state color (typically red)
- `info`: Informational color (typically cyan or blue)

### Component-Specific Colors

Each component can have its own color configuration:

```javascript
components: {
  box: {
    color: 'cyan',  // Border color
    bg: 'black'     // Background color
  },
  textInput: {
    color: 'white',        // Text color
    bg: 'black',          // Background color
    focusColor: 'magenta', // Focus indicator color
    errorColor: 'red'      // Error state color
  }
}
```

## How Colors Work

### Chalk Integration

Vuetty uses chalk under the hood for all color operations via the `colorUtils.js` module. Chalk provides:

- **Cross-platform support**: Works across different terminal emulators
- **Color detection**: Automatically detects terminal color support (16, 256, or 16M colors)
- **Fallback handling**: Gracefully degrades when colors aren't supported
- **Performance**: Optimized for terminal rendering with pre-compiled regex patterns

### Color Resolution Pipeline

When a color is specified in the theme:

1. **Pre-validation**: Check if color value exists and is a string
2. **Format Detection**: Use pre-compiled regex patterns for fast format detection
   - `HEX_COLOR_REGEX`: Matches `#RGB` or `#RRGGBB` patterns
   - `RGB_COLOR_REGEX`: Matches `rgb(r, g, b)` patterns (case-insensitive)
3. **Chalk Chain Creation**: Create appropriate chalk method chain:
   - Named colors: Direct property access (e.g., `chalk.red`)
   - Hex colors: `chalk.hex()` or `chalk.bgHex()`
   - RGB colors: `chalk.rgb()` or `chalk.bgRgb()` with validation
4. **Terminal Rendering**: Chalk generates ANSI escape codes based on terminal capabilities

### Performance Optimizations

Vuetty's color system includes several optimizations:

- **Pre-compiled Regex**: Color patterns are compiled once at module load
- **Fast Path for Named Colors**: Direct property access without regex
- **Lazy Validation**: RGB validation only happens after format match
- **Cache Normalization**: `normalizeColorForCache()` ensures consistent cache keys
  - Hex colors: Converted to lowercase (`#FF5733` → `#ff5733`)
  - RGB colors: Spaces removed (`rgb(255, 87, 51)` → `rgb(255,87,51)`)
  - Named colors: Used as-is

### Color Inheritance

Vuetty's theming system supports color inheritance:

- If a component doesn't specify a color, it falls back to parent component colors
- If no parent color is available, it uses the global `foreground` color
- If `foreground` is not set, it uses the terminal's default text color

## Best Practices

### Choosing Color Formats

**Use Named Colors When:**
- You need standard terminal colors
- Readability is important in your theme file
- You want the fastest color resolution
- Example: `'red'`, `'blue'`, `'cyan'`

**Use Hex Colors When:**
- You need precise color matching
- You're matching a brand color palette
- You have existing hex values from design systems
- Example: `'#569cd6'`, `'#f00'`

**Use RGB Colors When:**
- You're generating colors programmatically
- You need to calculate color values dynamically
- You're working with color manipulation libraries
- Example: `'rgb(106, 153, 85)'`

### Color Accessibility

Consider terminal accessibility when choosing colors:

- Ensure sufficient contrast between text and background
- Avoid relying solely on color to convey information
- Test your color scheme in different terminal emulators
- Consider users with color vision deficiencies
- Remember: Not all terminals support 16M colors (some only support 256 or 16)

### Performance Considerations

- **Prefer named colors** for the fastest resolution (no regex needed)
- **Normalize colors**: Use `normalizeColorForCache()` for consistent cache keys
- **Reuse color definitions** across components to benefit from caching
- **Limit unique colors** to reduce memory footprint
- **Test with actual terminals** to ensure colors display correctly
- **Avoid dynamic color generation** in hot render paths

## Examples

### Basic Color Usage (Named Colors)

```javascript
import { vuetty } from 'vuetty';
import MyComponent from './MyComponent.vue';

const app = vuetty(MyComponent, {
  theme: {
    background: 'black',
    foreground: 'white',
    primary: 'cyan',
    secondary: 'magenta',
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
  }
});
```

### Advanced Color Configuration (Mixed Formats)

```javascript
const theme = {
  // Global colors using hex for precision
  background: '#1e1e1e',
  foreground: '#d4d4d4',

  // Semantic colors (mix of hex and named)
  primary: '#569cd6',
  secondary: '#4ec9b0',
  success: '#6a9955',
  warning: 'yellow',
  danger: '#f44747',
  info: '#9cdcfe',

  // Component colors with mixed formats
  components: {
    textInput: {
      color: '#d4d4d4',
      bg: 'black',
      focusColor: 'rgb(86, 156, 214)',
      errorColor: '#f44747'
    },
    box: {
      color: '#569cd6',
      bg: '#1e1e1e'
    },
    button: {
      variants: {
        primary: {
          bg: '#569cd6',
          color: '#ffffff',
          bold: true
        },
        success: {
          bg: 'rgb(106, 153, 85)',
          color: 'white',
          bold: true
        }
      }
    }
  }
};
```

### Programmatic Color Generation

```javascript
// Generate shades programmatically using RGB
function generateShades(baseR, baseG, baseB, count) {
  return Array.from({ length: count }, (_, i) => {
    const factor = (i + 1) / count;
    return `rgb(${Math.round(baseR * factor)}, ${Math.round(baseG * factor)}, ${Math.round(baseB * factor)})`;
  });
}

const shades = generateShades(86, 156, 214, 5);

const theme = {
  primary: shades[4],        // Brightest
  primaryDark: shades[2],    // Darker
  primaryDarker: shades[0],  // Darkest
};
```

### Short Hex Colors

```javascript
// Use 3-digit hex for common colors (more concise)
const theme = {
  background: '#000',  // Black
  foreground: '#fff',  // White
  primary: '#08f',     // Bright blue
  danger: '#f00',      // Pure red
  success: '#0f0',     // Pure green
};
```

## Troubleshooting

### Colors Not Displaying

If colors aren't displaying correctly:

1. **Check terminal color support**: Run `echo $COLORTERM` or test with `chalk` directly
2. **Verify color format**: Ensure your color strings match one of the supported formats
   - Named: `'red'` (not `'Red'` or `'RED'`)
   - Hex: `'#FF5733'` or `'#f57'` (must start with `#`)
   - RGB: `'rgb(255, 87, 51)'` (must match exact format, spaces optional)
3. **Check for invalid values**:
   - RGB values must be 0-255
   - Hex must be 3 or 6 digits
   - Named colors must be valid chalk color names
4. **Test color resolution**: Invalid colors return `null` and fall back to defaults

### Color Format Errors

Common mistakes and fixes:

```javascript
// ❌ Wrong
color: 'RGB(255, 0, 0)'  // Uppercase not supported by regex
color: '#12345'           // Invalid hex length (must be 3 or 6)
color: 'rgb(300, 0, 0)'  // RGB values > 255
color: 'rgb(255,0,0,0.5)' // RGBA not supported

// ✅ Correct
color: 'rgb(255, 0, 0)'  // Lowercase, proper format
color: '#123456'          // 6-digit hex
color: 'rgb(255, 0, 0)'  // Valid range
color: 'red'              // Use named color instead
```

### Color Performance Issues

If you experience performance issues with colors:

1. **Profile color usage**: Check if colors are being resolved repeatedly
2. **Use named colors**: Fastest path (no regex matching)
3. **Normalize for caching**: Use `normalizeColorForCache()` for cache keys
4. **Reduce unique colors**: Fewer unique colors = better caching
5. **Avoid hot path generation**: Don't generate RGB strings in render loops

### Debugging Color Resolution

To debug color issues, check the resolution chain:

```javascript
import { getChalkColorChain, getChalkBgChain } from './utils/colorUtils.js';

// Test foreground color
const fgChain = getChalkColorChain('#569cd6');
console.log(fgChain ? 'Color resolved' : 'Color failed');

// Test background color
const bgChain = getChalkBgChain('rgb(255, 87, 51)');
console.log(bgChain ? 'Background resolved' : 'Background failed');
```

## Technical Implementation

### Color Utilities Module

Vuetty's color system is implemented in [src/utils/colorUtils.js](../../src/utils/colorUtils.js). The module provides three main functions:

#### `getChalkColorChain(color, chalkChain)`

Resolves foreground colors and returns a chalk chain:

```javascript
// Named color - fastest path
getChalkColorChain('red', chalk) // → chalk.red

// Hex color
getChalkColorChain('#569cd6', chalk) // → chalk.hex('#569cd6')

// RGB color
getChalkColorChain('rgb(86, 156, 214)', chalk) // → chalk.rgb(86, 156, 214)

// Invalid color
getChalkColorChain('invalid', chalk) // → null
```

#### `getChalkBgChain(bg, chalkChain)`

Resolves background colors and returns a chalk chain:

```javascript
// Named background - uses bgXxx convention
getChalkBgChain('red', chalk) // → chalk.bgRed

// Hex background
getChalkBgChain('#1e1e1e', chalk) // → chalk.bgHex('#1e1e1e')

// RGB background
getChalkBgChain('rgb(30, 30, 30)', chalk) // → chalk.bgRgb(30, 30, 30)
```

#### `normalizeColorForCache(color)`

Normalizes color strings for consistent cache keys:

```javascript
// Hex normalization
normalizeColorForCache('#FF5733') // → '#ff5733' (lowercase)

// RGB normalization
normalizeColorForCache('rgb(255, 87, 51)') // → 'rgb(255,87,51)' (no spaces)

// Named colors unchanged
normalizeColorForCache('red') // → 'red'
```

### Performance Characteristics

- **Named colors**: O(1) - Direct property access
- **Hex colors**: O(1) - Single regex test + chalk call
- **RGB colors**: O(1) - Single regex test + validation + chalk call
- **Pre-compiled regex**: Patterns compiled once at module load time

### Validation Rules

**Hex Colors:**
- Must match `/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/`
- Case-insensitive
- Accepts 3-digit (`#RGB`) or 6-digit (`#RRGGBB`) format

**RGB Colors:**
- Must match `/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i`
- Case-insensitive for `rgb` keyword
- Each component must be 0-255 (inclusive)
- Spaces around values are optional

**Named Colors:**
- Must be valid chalk color names
- Case-sensitive (use lowercase: `'red'`, not `'Red'`)
- Checked via direct property access on chalk object