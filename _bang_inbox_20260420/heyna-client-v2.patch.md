# heyna-client-v2.patch.md

PATCH cho `heyna-client.js` — add persona_signature vào envelope v2.

Non-destructive: chỉ extend, không remove field cũ. Backward compat: persona_signature null nếu chưa configure.

Ref: SPEC_ONG_MAU_v0.1.md § 3.1

---

## PATCH 1 — DEFAULT_CONFIG bổ sung personaSignatureProvider

Trong `heyna-client.js`, thay:

```js
var DEFAULT_CONFIG = {
  sseEndpoint:    '/mach/heyna',
  actionEndpoint: '/mach/heyna/action',
  reconnectMs:    3000,
  maxReconnect:   50,
  heartbeatMs:    30000,
  debug:          false,
};
```

thành:

```js
var DEFAULT_CONFIG = {
  sseEndpoint:    '/mach/heyna',
  actionEndpoint: '/mach/heyna/action',
  reconnectMs:    3000,
  maxReconnect:   50,
  heartbeatMs:    30000,
  debug:          false,
  // NEW v2 — Ống Màu
  personaSignatureProvider: null,
};
```

## PATCH 2 — send() đính persona_signature vào envelope

Trong `HeyNa.prototype.send`, thay:

```js
var envelope = {
  action: action,
  payload: payload || {},
  sessionId: self._sessionId,
  timestamp: new Date().toISOString(),
  traceId: _generateId('tr'),
  signature: opts.signature || null,
};
```

thành:

```js
var envelope = {
  action: action,
  payload: payload || {},
  sessionId: self._sessionId,
  timestamp: new Date().toISOString(),
  traceId: _generateId('tr'),
  signature: opts.signature || null,
  persona_signature: (function () {
    if (opts.persona_signature) return opts.persona_signature;
    if (typeof self._config.personaSignatureProvider === 'function') {
      try {
        return self._config.personaSignatureProvider(action, payload);
      } catch (e) {
        self._log('warn', 'personaSignatureProvider threw: ' + e.message);
        return null;
      }
    }
    return null;
  })(),
};
```

## PATCH 3 — _handleMessage() expose persona_origin

Trong `HeyNa.prototype._handleMessage`, sau dòng parse, add:

```js
if (parsed.persona_origin && typeof data === 'object' && data !== null) {
  data._persona_origin = parsed.persona_origin;
}
```

## USAGE

```js
const heyna = new HeyNa({
  personaSignatureProvider: function (action, payload) {
    return {
      persona: 'bang',
      identity_shape_hash: '<sha256-hex-from-bang.anc>',
      orbital: { qneu: 313.5, shell: 'N', anchor: 'bang.anc#N-shell' },
      wavelength: { primary: '#AFA9EC', secondary: '#F7C313' },
      ts_emit: new Date().toISOString(),
    };
  },
});
heyna.connect();
heyna.send('warehouse.request_stock', { id: 'NNA232' });
heyna.on('warehouse.stock_updated', function (data) {
  if (data._persona_origin) console.log('from:', data._persona_origin.persona);
});
```

Không pass provider → envelope.persona_signature = null → gateway permissive WARN, strict REJECT.
