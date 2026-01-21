// src/debug/static/debug.js
// Client-side WebSocket handler for Vuetty Debug Server

class DebugClient {
  constructor() {
    this.ws = null;
    this.events = [];
    this.filters = new Set(['render', 'input', 'console', 'layout', 'viewport', 'vue', 'vuetty']);
    this.eventCounts = {
      render: 0,
      input: 0,
      console: 0,
      layout: 0,
      viewport: 0,
      vue: 0,
      vuetty: 0
    };
    this.searchQuery = '';
    this.reconnectTimeout = null;

    // Load persisted state
    this.loadPersistedState();

    this.connect();
    this.setupUI();
    this.startTimestampUpdater();
  }

  loadPersistedState() {
    // Load theme preference
    try {
      const savedTheme = localStorage.getItem('debugTheme') || 'dark';
      document.documentElement.setAttribute('data-theme', savedTheme);
      const themeToggle = document.getElementById('theme-toggle');
      if (themeToggle) {
        themeToggle.checked = savedTheme === 'dark';
      }
    } catch (e) {
      // localStorage not available, use defaults
    }

    // Load filter preferences
    try {
      const savedFilters = localStorage.getItem('debugFilters');
      if (savedFilters) {
        const filters = JSON.parse(savedFilters);
        this.filters = new Set(filters);

        // Update checkbox states
        document.querySelectorAll('[data-filter]').forEach(cb => {
          cb.checked = this.filters.has(cb.dataset.filter);
        });
      }
    } catch (e) {
      // Invalid JSON or localStorage not available, use defaults
    }
  }

  saveFilterState() {
    try {
      localStorage.setItem('debugFilters', JSON.stringify([...this.filters]));
    } catch (e) {
      // localStorage not available
    }
  }

  saveThemeState(theme) {
    try {
      localStorage.setItem('debugTheme', theme);
    } catch (e) {
      // localStorage not available
    }
  }

  connect() {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.ws = new WebSocket(`${protocol}//${location.host}`);

    this.ws.onopen = () => {
      this.updateStatus('Connected', 'connected');
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
    };

    this.ws.onclose = () => {
      this.updateStatus('Disconnected', 'disconnected');
      // Try to reconnect after 1 second
      this.reconnectTimeout = setTimeout(() => this.connect(), 1000);
    };

    this.ws.onerror = () => {
      this.updateStatus('Error', 'error');
    };

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        this.handleMessage(msg);
      } catch (error) {
        console.error('Failed to parse message:', error);
      }
    };
  }

  handleMessage(msg) {
    if (msg.type === 'init') {
      // Initial state from server
      this.events = msg.data.buffer || [];
      this.updateEventCounts();
      this.renderEventLog();
      if (msg.data.viewport) {
        this.updateViewport(msg.data.viewport);
      }
      if (msg.data.layoutTree) {
        this.updateLayoutTree(msg.data.layoutTree);
      }
      if (msg.data.memory) {
        this.updateMemoryStats(msg.data.memory);
      }
      return;
    }

    if (msg.type === 'cleared') {
      // Server cleared the buffer
      this.events = [];
      this.resetEventCounts();
      document.getElementById('event-log').innerHTML = '';
      return;
    }

    if (msg.type === 'layout.tree' && msg.data?.tree) {
      this.updateLayoutTree(msg.data.tree);
      return;
    }

    if (msg.type === 'vuetty.memory') {
      this.updateMemoryStats(msg.data);
      return;
    }

    // Regular event
    this.events.push(msg);
    if (this.events.length > 1000) {
      this.events.shift();
    }

    // Update counter for this category
    const category = msg.type.split('.')[0];
    if (this.eventCounts.hasOwnProperty(category)) {
      this.eventCounts[category]++;
      this.updateCounterDisplay(category);
    }

    this.addEvent(msg);

    // Update specific panels based on event type
    if (msg.type === 'render.complete' && msg.data.tree) {
      this.updateLayoutTree(msg.data.tree);
    }
    if (msg.type.startsWith('viewport.') || msg.type === 'vuetty.mount') {
      if (msg.data.viewport) {
        this.updateViewport(msg.data.viewport);
      }
    }
  }

  updateEventCounts() {
    // Recalculate all counts from events array
    this.resetEventCounts();
    this.events.forEach(event => {
      const category = event.type.split('.')[0];
      if (this.eventCounts.hasOwnProperty(category)) {
        this.eventCounts[category]++;
      }
    });
    this.updateAllCounterDisplays();
  }

  resetEventCounts() {
    Object.keys(this.eventCounts).forEach(key => {
      this.eventCounts[key] = 0;
    });
    this.updateAllCounterDisplays();
  }

  updateCounterDisplay(category) {
    const counter = document.querySelector(`[data-counter="${category}"]`);
    if (counter) {
      counter.textContent = this.eventCounts[category];
    }
  }

  updateAllCounterDisplays() {
    Object.keys(this.eventCounts).forEach(category => {
      this.updateCounterDisplay(category);
    });
  }

  addEvent(event) {
    const category = event.type.split('.')[0];

    // Check category filter
    if (!this.filters.has(category)) {
      return;
    }

    // Check search filter
    if (this.searchQuery) {
      const searchable = [
        event.type,
        this.formatEventData(event).text,
        JSON.stringify(event.data)
      ].join(' ').toLowerCase();

      if (!searchable.includes(this.searchQuery.toLowerCase())) {
        return;
      }
    }

    const log = document.getElementById('event-log');
    const entry = document.createElement('div');
    entry.className = `event event-${category}`;
    entry.dataset.timestamp = event.timestamp;

    const timeSpan = document.createElement('span');
    timeSpan.className = 'time';
    timeSpan.textContent = this.formatRelativeTime(event.timestamp);
    timeSpan.title = new Date(event.timestamp).toLocaleString();

    const typeSpan = document.createElement('span');
    typeSpan.className = 'type';
    typeSpan.textContent = event.type;

    const dataSpan = document.createElement('span');
    dataSpan.className = 'data';
    const eventData = this.formatEventData(event);

    // Store both compact and formatted JSON if this is JSON data
    if (eventData.isJSON) {
      try {
        const formatted = JSON.stringify(event.data, null, 2);
        dataSpan.dataset.compact = eventData.text;
        dataSpan.dataset.formatted = formatted;
        // Add expand indicator
        dataSpan.textContent = '▶ ' + eventData.text;
      } catch {
        // Fallback if formatting fails
        dataSpan.textContent = eventData.text;
      }
    } else {
      dataSpan.textContent = eventData.text;
    }

    entry.appendChild(timeSpan);
    entry.appendChild(typeSpan);
    entry.appendChild(dataSpan);

    log.appendChild(entry);

    // Auto-scroll to bottom
    log.scrollTop = log.scrollHeight;
  }

  formatRelativeTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 1000) return 'just now';
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  }

  startTimestampUpdater() {
    // Update relative timestamps every 10 seconds
    setInterval(() => {
      document.querySelectorAll('.event').forEach(entry => {
        const timestamp = parseInt(entry.dataset.timestamp);
        if (timestamp) {
          const timeSpan = entry.querySelector('.time');
          if (timeSpan) {
            timeSpan.textContent = this.formatRelativeTime(timestamp);
          }
        }
      });
    }, 10000); // Update every 10 seconds
  }

  formatEventData(event) {
    switch (event.type) {
      case 'render.complete':
        if (event.data.duration !== undefined) {
          return { text: `${event.data.duration.toFixed(2)}ms`, isJSON: false };
        }
        return { text: '', isJSON: false };
      case 'input.key':
        return { text: event.data.char || event.data.key || '', isJSON: false };
      case 'console.log':
      case 'console.error':
      case 'console.warn':
        return { text: (event.data.args || []).join(' '), isJSON: false };
      case 'vue.warn':
      case 'vue.error':
        return { text: `[${event.data.component}] ${event.data.message}`, isJSON: false };
      case 'vuetty.resize':
        return { text: `${event.data.width}x${event.data.height}`, isJSON: false };
      default:
        try {
          return { text: JSON.stringify(event.data), isJSON: true };
        } catch {
          return { text: '', isJSON: false };
        }
    }
  }

  updateLayoutTree(tree) {
    const el = document.getElementById('layout-tree');
    if (tree) {
      el.textContent = JSON.stringify(tree, null, 2);
    }
  }

  updateViewport(viewport) {
    const el = document.getElementById('viewport-state');
    if (viewport) {
      el.textContent = JSON.stringify(viewport, null, 2);
    }
  }

  updateMemoryStats(memory) {
    const el = document.getElementById('memory-stats');
    if (el && memory) {
      el.textContent = JSON.stringify(memory, null, 2);
    }
  }

  updateStatus(text, status) {
    const statusEl = document.getElementById('connection-status');
    statusEl.textContent = text;

    // Remove all status classes
    statusEl.classList.remove('is-success', 'is-danger', 'is-warning', 'is-info');

    // Add appropriate Bulma tag class
    switch(status) {
      case 'connected':
        statusEl.classList.add('is-success');
        break;
      case 'disconnected':
        statusEl.classList.add('is-warning');
        break;
      case 'error':
        statusEl.classList.add('is-danger');
        break;
      default:
        statusEl.classList.add('is-info');
    }
  }

  renderEventLog() {
    const log = document.getElementById('event-log');
    log.innerHTML = '';
    this.events.forEach(event => this.addEvent(event));
  }

  setupUI() {
    // Click-to-expand event data
    const eventLog = document.getElementById('event-log');

    eventLog.addEventListener('click', (e) => {
      // Find the event element (either clicked directly or parent)
      const eventEl = e.target.closest('.event');
      if (!eventEl) return;

      // Find the data span within this event
      const dataSpan = eventEl.querySelector('.data');
      if (!dataSpan) return;

      const isExpanded = dataSpan.classList.toggle('expanded');

      // Toggle between compact and formatted JSON
      if (dataSpan.dataset.compact && dataSpan.dataset.formatted) {
        if (isExpanded) {
          dataSpan.textContent = '▼ ' + dataSpan.dataset.formatted;
        } else {
          dataSpan.textContent = '▶ ' + dataSpan.dataset.compact;
        }
      } else {
        // For non-JSON data, just toggle the icon
        const currentText = dataSpan.textContent;
        if (isExpanded) {
          dataSpan.textContent = currentText.replace('▶ ', '▼ ');
        } else {
          dataSpan.textContent = currentText.replace('▼ ', '▶ ');
        }
      }
    });

    // Filter checkboxes
    document.querySelectorAll('[data-filter]').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const filter = e.target.dataset.filter;
        if (e.target.checked) {
          this.filters.add(filter);
        } else {
          this.filters.delete(filter);
        }
        this.saveFilterState();
        this.renderEventLog();
      });
    });

    // Search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.renderEventLog();
      });
    }

    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('change', (e) => {
        const theme = e.target.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        this.saveThemeState(theme);
      });
    }

    // Clear button
    document.getElementById('clear-btn').addEventListener('click', () => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'clear' }));
      }
      this.events = [];
      this.resetEventCounts();
      document.getElementById('event-log').innerHTML = '';
    });

    // Tab switching (updated for Bulma tabs)
    document.querySelectorAll('.tabs li').forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const tabName = tab.dataset.tab;

        // Update tab active state
        document.querySelectorAll('.tabs li').forEach(t => {
          t.classList.remove('is-active');
          const link = t.querySelector('a');
          if (link) link.style.color = 'var(--text-secondary)';
        });
        tab.classList.add('is-active');
        const activeLink = tab.querySelector('a');
        if (activeLink) activeLink.style.color = 'var(--text-primary)';

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(c => {
          c.style.display = 'none';
          c.classList.remove('is-active');
        });
        const content = document.getElementById(`${tabName}-tab`);
        if (content) {
          content.style.display = 'block';
          content.classList.add('is-active');
        }
      });
    });
  }
}

// Initialize debug client when page loads
new DebugClient();
