/**
 * heyna-client.js
 * ───────────────
 * Mạch HeyNa — Client-side communication layer for Tâm Luxury apps.
 *
 * SPEC v2.5 Rule: UI chỉ giao tiếp qua SSE /mach/heyna — không /* [HEYNA-MIGRATE] */ fetch() trực tiếp.
 * EventBus là nội tạng hệ sống — KHÔNG BAO GIỜ lộ ra browser.
 *
 * Architecture:
 *   Browser ←──SSE──── /mach/heyna (read-only, server push)
 *   Browser ──POST───→ /mach/heyna/action (write, gateway validates + routes to EventBus)
 *
 * Hacker tấn công client:
 *   - SSE stream: read-only, không inject được
 *   - POST endpoint: gateway verify SiraSign trước khi cho vào EventBus
 *   - EventBus: invisible, không biết cells nào tồn tại
 *
 * Usage in app HTML:
 *   <script src="heyna-client.js"></script>
 *   <script>
 *     const heyna = new HeyNa();
 *
 *     // Nhận data (thay fetch GET)
 *     heyna.on('warehouse.stock_updated', (data) => {
 *       renderStock(data);
 *     });
 *
 *     // Gửi action (thay fetch POST + EventBus.emit)
 *     heyna.send('warehouse.request_stock', { productId: 'NNA232' });
 *
 *     // Connect
 *     heyna.connect();
 *   </script>
 */

(function (root) {
  'use strict';

  // ─── CONFIG ────────────────────────────────────────────────
  var DEFAULT_CONFIG = {
    sseEndpoint:    '/mach/heyna',
    actionEndpoint: '/mach/heyna/action',
    reconnectMs:    3000,
    maxReconnect:   50,
    heartbeatMs:    30000,
    debug:          false,
  };

  // ─── HEYNA CLASS ───────────────────────────────────────────
  function HeyNa(config) {
    this._config = _merge(DEFAULT_CONFIG, config || {});
    this._listeners = {};      // event → [callback]
    this._sse = null;
    this._reconnectCount = 0;
    this._heartbeatTimer = null;
    this._connected = false;
    this._sessionId = _generateId('ses');
    this._queue = [];          // queued actions while disconnected
  }

  // ─── PUBLIC API ────────────────────────────────────────────

  /**
   * Connect to Mạch HeyNa SSE stream.
   * Call once on page load. Auto-reconnects on disconnect.
   */
  HeyNa.prototype.connect = function () {
    var self = this;

    if (self._sse) {
      self._sse.close();
    }

    var url = self._config.sseEndpoint + '?sid=' + self._sessionId;
    self._sse = new EventSource(url);

    self._sse.onopen = function () {
      self._connected = true;
      self._reconnectCount = 0;
      self._log('connected', 'Mạch HeyNa SSE connected');
      self._emit('_heyna.connected', { sessionId: self._sessionId });
      self._startHeartbeat();
      self._flushQueue();
    };

    self._sse.onmessage = function (event) {
      self._handleMessage(event);
    };

    self._sse.onerror = function () {
      self._connected = false;
      self._log('warn', 'SSE disconnected. Reconnecting...');
      self._emit('_heyna.disconnected', {});
      self._stopHeartbeat();

      if (self._sse) {
        self._sse.close();
        self._sse = null;
      }

      if (self._reconnectCount < self._config.maxReconnect) {
        self._reconnectCount++;
        var delay = Math.min(
          self._config.reconnectMs * Math.pow(1.5, self._reconnectCount - 1),
          30000
        );
        setTimeout(function () { self.connect(); }, delay);
      } else {
        self._log('error', 'Max reconnection attempts reached');
        self._emit('_heyna.failed', { attempts: self._reconnectCount });
      }
    };
  };

  /**
   * Disconnect from Mạch HeyNa.
   */
  HeyNa.prototype.disconnect = function () {
    if (this._sse) {
      this._sse.close();
      this._sse = null;
    }
    this._connected = false;
    this._stopHeartbeat();
    this._log('info', 'Disconnected');
  };

  /**
   * Listen for server-pushed events (replaces fetch GET + EventBus.on).
   *
   * @param {string} eventName - Domain event name, e.g. 'warehouse.stock_updated'
   * @param {function} callback - function(data) {}
   * @returns {function} unsubscribe function
   */
  HeyNa.prototype.on = function (eventName, callback) {
    if (!this._listeners[eventName]) {
      this._listeners[eventName] = [];
    }
    this._listeners[eventName].push(callback);

    var self = this;
    // Register named SSE event listener for typed events
    if (this._sse) {
      this._sse.addEventListener(eventName, function (e) {
        self._routeEvent(eventName, e.data);
      });
    }

    return function unsubscribe() {
      self._listeners[eventName] = (self._listeners[eventName] || []).filter(
        function (cb) { return cb !== callback; }
      );
    };
  };

  /**
   * Send an action to the server (replaces fetch POST + EventBus.emit).
   * Action goes to gateway → gateway validates → routes to internal EventBus.
   * Client NEVER touches EventBus directly.
   *
   * @param {string} action - Action name, e.g. 'warehouse.request_stock'
   * @param {object} payload - Action data
   * @param {object} [options] - { priority, signature }
   * @returns {Promise<object>} Server response
   */
  HeyNa.prototype.send = function (action, payload, options) {
    var self = this;
    var opts = options || {};

    var envelope = {
      action: action,
      payload: payload || {},
      sessionId: self._sessionId,
      timestamp: new Date().toISOString(),
      traceId: _generateId('tr'),
      // SiraSign placeholder — gateway will verify
      signature: opts.signature || null,
    };

    if (!self._connected) {
      self._log('warn', 'Offline — queuing action: ' + action);
      return new Promise(function (resolve) {
        self._queue.push({ envelope: envelope, resolve: resolve });
      });
    }

    return self._post(envelope);
  };

  /**
   * One-time data request via action + response event pattern.
   * Replaces fetch GET calls.
   *
   * @param {string} action - Request action name
   * @param {object} payload - Request params
   * @param {string} responseEvent - Expected response event name
   * @param {number} [timeoutMs=10000] - Timeout
   * @returns {Promise<object>}
   */
  HeyNa.prototype.request = function (action, payload, responseEvent, timeoutMs) {
    var self = this;
    var timeout = timeoutMs || 10000;

    return new Promise(function (resolve, reject) {
      var timer = setTimeout(function () {
        unsub();
        reject(new Error('HeyNa request timeout: ' + responseEvent));
      }, timeout);

      var unsub = self.on(responseEvent, function (data) {
        clearTimeout(timer);
        unsub();
        resolve(data);
      });

      self.send(action, payload);
    });
  };

  /**
   * Check connection status.
   */
  HeyNa.prototype.isConnected = function () {
    return this._connected;
  };

  /**
   * Get session ID.
   */
  HeyNa.prototype.getSessionId = function () {
    return this._sessionId;
  };

  // ─── INTERNAL ──────────────────────────────────────────────

  HeyNa.prototype._handleMessage = function (event) {
    try {
      var parsed = JSON.parse(event.data);
      var eventName = parsed.event || parsed.type || '_heyna.message';
      var data = parsed.data || parsed.payload || parsed;
      this._routeEvent(eventName, data);
    } catch (e) {
      // Non-JSON messages (heartbeat pings etc)
      if (event.data === ':ping' || event.data === '') return;
      this._log('warn', 'Unparseable SSE message');
    }
  };

  HeyNa.prototype._routeEvent = function (eventName, rawData) {
    var data = rawData;
    if (typeof rawData === 'string') {
      try { data = JSON.parse(rawData); } catch (e) { data = rawData; }
    }

    var callbacks = this._listeners[eventName] || [];
    for (var i = 0; i < callbacks.length; i++) {
      try {
        callbacks[i](data);
      } catch (err) {
        this._log('error', 'Listener error for ' + eventName + ': ' + err.message);
      }
    }

    // Wildcard listeners
    var wildcardCallbacks = this._listeners['*'] || [];
    for (var j = 0; j < wildcardCallbacks.length; j++) {
      try {
        wildcardCallbacks[j](eventName, data);
      } catch (err) {
        this._log('error', 'Wildcard listener error: ' + err.message);
      }
    }
  };

  HeyNa.prototype._post = function (envelope) {
    var self = this;
    var url = self._config.actionEndpoint;

    return /* [HEYNA-MIGRATE] */ fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(envelope),
    })
      .then(function (res) {
        if (!res.ok) throw new Error('HeyNa POST failed: ' + res.status);
        return res.json();
      })
      .then(function (result) {
        self._log('info', '→ ' + envelope.action + ' OK');
        return result;
      })
      .catch(function (err) {
        self._log('error', '→ ' + envelope.action + ' FAILED: ' + err.message);
        self._emit('_heyna.error', { action: envelope.action, error: err.message });
        throw err;
      });
  };

  HeyNa.prototype._flushQueue = function () {
    var self = this;
    while (self._queue.length > 0) {
      var item = self._queue.shift();
      self._post(item.envelope).then(item.resolve);
    }
  };

  HeyNa.prototype._startHeartbeat = function () {
    var self = this;
    this._stopHeartbeat();
    this._heartbeatTimer = setInterval(function () {
      if (self._connected) {
        self._emit('_heyna.heartbeat', { ts: Date.now() });
      }
    }, this._config.heartbeatMs);
  };

  HeyNa.prototype._stopHeartbeat = function () {
    if (this._heartbeatTimer) {
      clearInterval(this._heartbeatTimer);
      this._heartbeatTimer = null;
    }
  };

  HeyNa.prototype._emit = function (eventName, data) {
    this._routeEvent(eventName, data);
  };

  HeyNa.prototype._log = function (level, msg) {
    if (!this._config.debug && level !== 'error') return;
    var prefix = '[HeyNa]';
    if (level === 'error') console.error(prefix, msg);
    else if (level === 'warn') console.warn(prefix, msg);
    else console.log(prefix, msg);
  };

  // ─── HELPERS ───────────────────────────────────────────────

  function _merge(defaults, overrides) {
    var result = {};
    for (var key in defaults) result[key] = defaults[key];
    for (var key2 in overrides) result[key2] = overrides[key2];
    return result;
  }

  function _generateId(prefix) {
    return prefix + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
  }

  // ─── EXPORT ────────────────────────────────────────────────
  root.HeyNa = HeyNa;

})(typeof window !== 'undefined' ? window : this);
