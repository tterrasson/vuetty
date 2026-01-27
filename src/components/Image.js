// src/components/Image.js
import { h, ref, watch, onMounted } from 'vue';
import terminalImage from 'terminal-image';
import Box from './Box.js';
import TextBox from './TextBox.js';
import Newline from './Newline.js';
import { boxProps } from '@core/layoutProps.js';
import { RenderHandler, renderHandlerRegistry } from '@core/renderHandlers.js';
import { getCacheConfig } from '@core/cacheConfig.js';

function getImageCacheSize() {
  return getCacheConfig().components.image.rendered;
}

// Cache rendered images to avoid re-processing identical images
// Key: src + width + height + preserveAspectRatio
const imageCache = new Map();

/**
 * Generate cache key for image
 */
function getCacheKey(src, width, height, preserveAspectRatio) {
  const srcKey = Buffer.isBuffer(src)
    ? `buffer:${src.length}:${src.slice(0, 16).toString('hex')}`
    : `file:${src}`;
  return `${srcKey}|${width}|${height}|${preserveAspectRatio}`;
}

/**
 * Image component - Display images in terminal using ANSI block rendering
 */
export default {
  name: 'Image',
  props: {
    src: { type: [String, Object], required: true },
    width: { type: [Number, String], default: null },
    height: { type: [Number, String], default: null },
    preserveAspectRatio: { type: Boolean, default: true },
    alt: { type: String, default: '' },
    errorColor: { type: String, default: 'red' },
    errorBorderStyle: { type: String, default: 'rounded' },
    // Include common layout props (padding, margin, dimensions)
    ...boxProps
  },

  setup(props) {
    const imageData = ref(null);
    const loading = ref(true);
    const error = ref(null);
    const isBuffer = ref(false);
    const imageLines = ref(1);

    /**
     * Calculate target width in columns
     */
    function calculateTargetColumns() {
      const terminalWidth = process.stdout.columns || 80;

      if (!props.width && !props.height) {
        const maxWidth = props.maxWidth || terminalWidth;
        return Math.min(maxWidth, terminalWidth);
      }

      if (props.width) {
        if (typeof props.width === 'number') {
          return props.width;
        }
        if (typeof props.width === 'string' && props.width.endsWith('%')) {
          return Math.floor(terminalWidth * parseFloat(props.width) / 100);
        }
      }

      return terminalWidth;
    }

    /**
     * Load and render image from source
     */
    async function loadImage() {
      loading.value = true;
      error.value = null;

      try {
        isBuffer.value = Buffer.isBuffer(props.src);
        const displayColumns = calculateTargetColumns();

        // Check cache first
        const cacheKey = getCacheKey(props.src, displayColumns, props.height, props.preserveAspectRatio);
        const cached = imageCache.get(cacheKey);

        if (cached) {
          imageData.value = cached.data;
          imageLines.value = cached.lines;
          loading.value = false;
          return;
        }

        // Get raw buffer
        let buffer;
        if (isBuffer.value) {
          buffer = props.src;
        } else {
          const file = Bun.file(props.src);
          if (!(await file.exists())) {
            throw new Error('File not found');
          }
          buffer = Buffer.from(await file.arrayBuffer());
        }

        // Render image
        const options = {
          width: displayColumns,
          height: props.height ?? undefined,
          preserveAspectRatio: props.preserveAspectRatio
        };

        const rendered = await terminalImage.buffer(buffer, {
          ...options,
          preferNativeRender: false
        });

        const lines = rendered.split('\n').length;

        // Store in cache
        if (imageCache.size >= getImageCacheSize()) {
          const firstKey = imageCache.keys().next().value;
          imageCache.delete(firstKey);
        }
        imageCache.set(cacheKey, { data: rendered, lines });

        imageLines.value = lines;
        imageData.value = rendered;
        loading.value = false;
      } catch (err) {
        error.value = {
          message: err.message || 'Failed to load image',
          path: isBuffer.value ? '[Buffer]' : props.src,
          code: err.code
        };
        loading.value = false;
      }
    }

    /**
     * Render error state
     */
    function renderError() {
      return h(Box, {
        border: true,
        borderStyle: props.errorBorderStyle,
        padding: 1,
        color: props.errorColor,
        width: props.width,
        minWidth: props.minWidth,
        maxWidth: props.maxWidth
      }, {
        default: () => [
          h(TextBox, { color: props.errorColor, bold: true }, {
            default: () => '✗ Image Load Error'
          }),
          h(Newline),
          h(Newline),
          h(TextBox, { dim: true }, {
            default: () => `Path: ${error.value.path}`
          }),
          h(Newline),
          h(TextBox, {}, {
            default: () => `Error: ${error.value.message}`
          }),
          ...(props.alt ? [
            h(Newline),
            h(Newline),
            h(TextBox, { italic: true }, {
              default: () => `Alt text: ${props.alt}`
            })
          ] : [])
        ]
      });
    }

    /**
     * Render loading state
     */
    function renderLoading() {
      return h(TextBox, { dim: true }, {
        default: () => 'Loading image...'
      });
    }

    onMounted(() => {
      loadImage();
    });

    watch(() => props.src, () => {
      loadImage();
    });

    watch(() => [props.width, props.height, props.maxWidth], () => {
      if (imageData.value && !loading.value) {
        loadImage();
      }
    });

    return () => {
      if (error.value) return renderError();
      if (loading.value) return renderLoading();

      return h('image', {
        imageData: imageData.value,
        imageLines: imageLines.value,
        width: props.width,
        minWidth: props.minWidth,
        maxWidth: props.maxWidth
      });
    };
  }
};

/**
 * Render an image to string output
 */
export function renderImage(props) {
  const { imageData = '' } = props;
  return imageData || '';
}

/**
 * Render handler for image
 */
class ImageRenderHandler extends RenderHandler {
  render(ctx) {
    return renderImage(ctx.props);
  }
}

renderHandlerRegistry.register('image', new ImageRenderHandler());

/**
 * Clear image cache (for memory management)
 */
export function clearImageCache() {
  imageCache.clear();
}
