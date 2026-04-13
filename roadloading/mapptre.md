#Client App Tâm Luxury
natt-os_ver2goldmaster 
├── database
│   └── ctytam
│       ├── BCTC mẫu
│       │   └── BCTCTH_C03_TCT.XSD
│       ├── bank
│       │   └── saoketk1112.xlsx
│       ├── data kinh doanh
│       ├── data sản xuất
│       │   └── nấu-bụi-vàng.json
│       ├── dieutra
│       │   ├── BAO_CAO_DIEU_TRA_SX_TAM_LUXURY (1).pdf
│       │   └── BAO_CAO_DIEU_TRA_SX_TAM_LUXURY.docx
│       └── khoivanhanh
│           └── soluong
│               ├── bomaycty.csv
│               ├── danhsach_maudon_tacvu.csv
│               ├── danhsach_nhansu_danghi.csv
│               ├── danhsachnhansu.csv
│               ├── dulieuchamcong.csv
│               ├── phongluong.csv
│               ├── quychuan_thangluong.csv
│               ├── quytaccty.csv
│               └── thangluong.csv
└── nattos-server
    ├── app Tâm luxury
    │   ├── analytics-ingestion-service
    │   │   ├── application
    │   │   │   └── ingest-sales-event.ts
    │   │   └── domain
    │   │       └── projections
    │   │           └── daily-revenue.projection.ts
    │   ├── app.tsx
    │   ├── component-contracts.json
    │   ├── components
    │   │   ├── adminconfighub.tsx
    │   │   ├── advancedanalytics.tsx
    │   │   ├── aiavatar.tsx
    │   │   ├── apiportal.tsx
    │   │   ├── app.tsx
    │   │   ├── approval
    │   │   │   └── approvaldashboard.tsx
    │   │   ├── appshell.tsx
    │   │   ├── audittrailmodule.tsx
    │   │   ├── bankingprocessor.tsx
    │   │   ├── blueprintwizard.tsx
    │   │   ├── calibration
    │   │   │   └── calibrationwizard.tsx
    │   │   ├── chatconsultant.tsx
    │   │   ├── collaborationrooms.tsx
    │   │   ├── common
    │   │   │   ├── ButterflyProtocol.tsx
    │   │   │   ├── NattMedal.tsx
    │   │   │   ├── errorboundary.tsx
    │   │   │   └── loadingspinner.tsx
    │   │   ├── complianceportal.tsx
    │   │   ├── customizationrequest.tsx
    │   │   ├── customsintelligence.tsx
    │   │   ├── dailyreportmodule.tsx
    │   │   ├── dashboard.tsx
    │   │   ├── dataanalytics.tsx
    │   │   ├── dataarchivevault.tsx
    │   │   ├── datasyncengine.tsx
    │   │   ├── devportal.tsx
    │   │   ├── dynamicmodulerenderer.tsx
    │   │   ├── enterprisearchitecture.tsx
    │   │   ├── errorboundary.tsx
    │   │   ├── filterpanel.tsx
    │   │   ├── financeaudit.tsx
    │   │   ├── financial
    │   │   │   └── financialdashboard.tsx
    │   │   ├── governancemodule.tsx
    │   │   ├── governanceworkspace.tsx
    │   │   ├── hrcompliance.tsx
    │   │   ├── hrmanagement.tsx
    │   │   ├── krisemailhub.tsx
    │   │   ├── layout.tsx
    │   │   ├── learninghub.tsx
    │   │   ├── livevoice.tsx
    │   │   ├── masterdashboard.tsx
    │   │   ├── notificationhub.tsx
    │   │   ├── notificationportal.tsx
    │   │   ├── omegaprocessor.tsx
    │   │   ├── operationsterminal.tsx
    │   │   ├── paymenthub.tsx
    │   │   ├── personalsphere.tsx
    │   │   ├── productcard.tsx
    │   │   ├── productcatalog.tsx
    │   │   ├── productdetailmodal.tsx
    │   │   ├── productionmanager.tsx
    │   │   ├── productionsalesflowview.tsx
    │   │   ├── productionwallboard.tsx
    │   │   ├── quantumfloworchestrator.tsx
    │   │   ├── quantumpulse.tsx
    │   │   ├── quickhelp.tsx
    │   │   ├── rbacmanager.tsx
    │   │   ├── rfmanalysis.tsx
    │   │   ├── salesarchitectureview.tsx
    │   │   ├── salescrm.tsx
    │   │   ├── salestaxmodule.tsx
    │   │   ├── salesterminal.tsx
    │   │   ├── securityoverlay.tsx
    │   │   ├── sellerterminal.tsx
    │   │   ├── sidebar.tsx
    │   │   ├── smartlinkmapper.tsx
    │   │   ├── supplierclassificationpanel.tsx
    │   │   ├── systemmonitor.tsx
    │   │   ├── systemnavigator.tsx
    │   │   ├── systemticker.tsx
    │   │   ├── taxreportinghub.tsx
    │   │   ├── technicaldocs.tsx
    │   │   ├── thiencommandcenter.tsx
    │   │   ├── unifiedreportinghub.tsx
    │   │   └── warehousemanagement.tsx
    │   ├── constants.ts
    │   ├── contexts
    │   │   ├── accountingcontext.tsx
    │   │   └── mappingcontext.tsx
    │   ├── core
    │   │   ├── dictionary
    │   │   │   └── services
    │   │   │       └── dictionaryservice.ts
    │   │   ├── ingestion
    │   │   │   └── ingestionservice.ts
    │   │   ├── nauion
    │   │   │   └── nauion-engine.ts
    │   │   ├── processing
    │   │   │   └── ai
    │   │   │       └── aicoreprocessor.ts
    │   │   ├── signals
    │   │   │   └── types.ts
    │   │   └── smartlinkengine.ts
    │   ├── css
    │   │   ├── nattos-fx-advanced.css
    │   │   └── nattos-glass.css
    │   ├── finance-service
    │   │   ├── application
    │   │   │   └── handlers
    │   │   │       └── invoice-handler.ts
    │   │   └── infrastructure
    │   │       └── messaging
    │   │           ├── dead-letter.handler.ts
    │   │           └── retry.policy.ts
    │   ├── hooks
    │   │   ├── useauthority.ts
    │   │   ├── userealtimesync.ts
    │   │   ├── usesmartmapping.ts
    │   │   └── usesupplierclassification.ts
    │   ├── index.css
    │   ├── index.html
    │   ├── index.tsx
    │   ├── layerold
    │   │   ├── attendance.html
    │   │   ├── chat-rooms.html
    │   │   ├── daily-work-app.html
    │   │   ├── hr-admin.html
    │   │   ├── hr-manager.html
    │   │   ├── kris-email-hub.html
    │   │   ├── ktt-approval.html
    │   │   ├── loss-thresholds.html
    │   │   ├── master-dashboard.html
    │   │   ├── operations-terminal.html
    │   │   ├── order-flow.html
    │   │   ├── personal-profile-v2.html
    │   │   ├── personal-profile.html
    │   │   ├── pricing-engine.html
    │   │   ├── production-wallboard.html
    │   │   ├── showroom-sales.html
    │   │   ├── surveillance.html
    │   │   ├── tamluxury-v2.html
    │   │   ├── tamluxury-v3.html
    │   │   ├── tamluxury-v4.html
    │   │   ├── warehouse-full.html
    │   │   └── warehouse-ops.html
    │   ├── manifestations
    │   │   └── overlays
    │   │       └── quantumcontainer.tsx
    │   ├── nattos-chromatic.js
    │   ├── nattos-contract.json
    │   ├── nattos-data.js
    │   ├── nattos-doc-engine.js
    │   ├── nattos-eod-engine.js
    │   ├── nattos-fx-advanced.css
    │   ├── nattos-fx.js
    │   ├── nattos-glass.css
    │   ├── nattos-loss-thresholds.js
    │   ├── nattos-payment.js
    │   ├── nattos-responsive.css
    │   ├── nattos-sandbox.css
    │   ├── nattos-sandbox.js
    │   ├── nattos-server.cjs
    │   ├── nattos-smart-get-data.js
    │   ├── nattos-tokens.css
    │   ├── nattos-ui-theme.css
    │   ├── nauion
    │   │   └── ui-runtime.tsx
    │   ├── neuro-link
    │   │   └── context
    │   │       └── quantumuicontext.tsx
    │   ├── node_modules
    │   │   ├── @oxc-project
    │   │   │   └── types
    │   │   │       ├── LICENSE
    │   │   │       ├── README.md
    │   │   │       ├── package.json
    │   │   │       └── types.d.ts
    │   │   ├── @rolldown
    │   │   │   ├── binding-darwin-x64
    │   │   │   │   ├── README.md
    │   │   │   │   ├── package.json
    │   │   │   │   └── rolldown-binding.darwin-x64.node
    │   │   │   └── pluginutils
    │   │   │       ├── LICENSE
    │   │   │       ├── README.md
    │   │   │       ├── dist
    │   │   │       │   ├── filter
    │   │   │       │   │   ├── composable-filters.d.ts
    │   │   │       │   │   ├── composable-filters.js
    │   │   │       │   │   ├── filter-vite-plugins.d.ts
    │   │   │       │   │   ├── filter-vite-plugins.js
    │   │   │       │   │   ├── index.d.ts
    │   │   │       │   │   ├── index.js
    │   │   │       │   │   ├── simple-filters.d.ts
    │   │   │       │   │   └── simple-filters.js
    │   │   │       │   ├── index.d.ts
    │   │   │       │   ├── index.js
    │   │   │       │   ├── utils.d.ts
    │   │   │       │   └── utils.js
    │   │   │       └── package.json
    │   │   ├── @types
    │   │   │   ├── react
    │   │   │   │   ├── LICENSE
    │   │   │   │   ├── README.md
    │   │   │   │   ├── canary.d.ts
    │   │   │   │   ├── compiler-runtime.d.ts
    │   │   │   │   ├── experimental.d.ts
    │   │   │   │   ├── global.d.ts
    │   │   │   │   ├── index.d.ts
    │   │   │   │   ├── jsx-dev-runtime.d.ts
    │   │   │   │   ├── jsx-runtime.d.ts
    │   │   │   │   ├── package.json
    │   │   │   │   └── ts5.0
    │   │   │   │       ├── canary.d.ts
    │   │   │   │       ├── experimental.d.ts
    │   │   │   │       ├── global.d.ts
    │   │   │   │       ├── index.d.ts
    │   │   │   │       ├── jsx-dev-runtime.d.ts
    │   │   │   │       └── jsx-runtime.d.ts
    │   │   │   └── react-dom
    │   │   │       ├── LICENSE
    │   │   │       ├── README.md
    │   │   │       ├── canary.d.ts
    │   │   │       ├── client.d.ts
    │   │   │       ├── experimental.d.ts
    │   │   │       ├── index.d.ts
    │   │   │       ├── package.json
    │   │   │       ├── server.browser.d.ts
    │   │   │       ├── server.bun.d.ts
    │   │   │       ├── server.d.ts
    │   │   │       ├── server.edge.d.ts
    │   │   │       ├── server.node.d.ts
    │   │   │       ├── static.browser.d.ts
    │   │   │       ├── static.d.ts
    │   │   │       ├── static.edge.d.ts
    │   │   │       ├── static.node.d.ts
    │   │   │       └── test-utils
    │   │   │           └── index.d.ts
    │   │   ├── @vitejs
    │   │   │   └── plugin-react
    │   │   │       ├── LICENSE
    │   │   │       ├── README.md
    │   │   │       ├── dist
    │   │   │       │   ├── index.d.ts
    │   │   │       │   ├── index.js
    │   │   │       │   └── refresh-runtime.js
    │   │   │       ├── package.json
    │   │   │       └── types
    │   │   │           ├── optionalTypes.d.ts
    │   │   │           └── preamble.d.ts
    │   │   ├── csstype
    │   │   │   ├── LICENSE
    │   │   │   ├── README.md
    │   │   │   ├── index.d.ts
    │   │   │   ├── index.js.flow
    │   │   │   └── package.json
    │   │   ├── detect-libc
    │   │   │   ├── LICENSE
    │   │   │   ├── README.md
    │   │   │   ├── index.d.ts
    │   │   │   ├── lib
    │   │   │   │   ├── detect-libc.js
    │   │   │   │   ├── elf.js
    │   │   │   │   ├── filesystem.js
    │   │   │   │   └── process.js
    │   │   │   └── package.json
    │   │   ├── fdir
    │   │   │   ├── LICENSE
    │   │   │   ├── README.md
    │   │   │   ├── dist
    │   │   │   │   ├── index.cjs
    │   │   │   │   ├── index.d.cts
    │   │   │   │   ├── index.d.mts
    │   │   │   │   └── index.mjs
    │   │   │   └── package.json
    │   │   ├── fsevents
    │   │   │   ├── LICENSE
    │   │   │   ├── README.md
    │   │   │   ├── fsevents.d.ts
    │   │   │   ├── fsevents.js
    │   │   │   ├── fsevents.node
    │   │   │   └── package.json
    │   │   ├── lightningcss
    │   │   │   ├── LICENSE
    │   │   │   ├── README.md
    │   │   │   ├── node
    │   │   │   │   ├── ast.d.ts
    │   │   │   │   ├── ast.js.flow
    │   │   │   │   ├── browserslistToTargets.js
    │   │   │   │   ├── composeVisitors.js
    │   │   │   │   ├── flags.js
    │   │   │   │   ├── index.d.ts
    │   │   │   │   ├── index.js
    │   │   │   │   ├── index.js.flow
    │   │   │   │   ├── index.mjs
    │   │   │   │   ├── targets.d.ts
    │   │   │   │   └── targets.js.flow
    │   │   │   └── package.json
    │   │   ├── lightningcss-darwin-x64
    │   │   │   ├── LICENSE
    │   │   │   ├── README.md
    │   │   │   ├── lightningcss.darwin-x64.node
    │   │   │   └── package.json
    │   │   ├── nanoid
    │   │   │   ├── LICENSE
    │   │   │   ├── README.md
    │   │   │   ├── async
    │   │   │   │   ├── index.browser.cjs
    │   │   │   │   ├── index.browser.js
    │   │   │   │   ├── index.cjs
    │   │   │   │   ├── index.d.ts
    │   │   │   │   ├── index.js
    │   │   │   │   ├── index.native.js
    │   │   │   │   └── package.json
    │   │   │   ├── bin
    │   │   │   │   └── nanoid.cjs
    │   │   │   ├── index.browser.cjs
    │   │   │   ├── index.browser.js
    │   │   │   ├── index.cjs
    │   │   │   ├── index.d.cts
    │   │   │   ├── index.d.ts
    │   │   │   ├── index.js
    │   │   │   ├── nanoid.js
    │   │   │   ├── non-secure
    │   │   │   │   ├── index.cjs
    │   │   │   │   ├── index.d.ts
    │   │   │   │   ├── index.js
    │   │   │   │   └── package.json
    │   │   │   ├── package.json
    │   │   │   └── url-alphabet
    │   │   │       ├── index.cjs
    │   │   │       ├── index.js
    │   │   │       └── package.json
    │   │   ├── picocolors
    │   │   │   ├── LICENSE
    │   │   │   ├── README.md
    │   │   │   ├── package.json
    │   │   │   ├── picocolors.browser.js
    │   │   │   ├── picocolors.d.ts
    │   │   │   ├── picocolors.js
    │   │   │   └── types.d.ts
    │   │   ├── picomatch
    │   │   │   ├── LICENSE
    │   │   │   ├── README.md
    │   │   │   ├── index.js
    │   │   │   ├── lib
    │   │   │   │   ├── constants.js
    │   │   │   │   ├── parse.js
    │   │   │   │   ├── picomatch.js
    │   │   │   │   ├── scan.js
    │   │   │   │   └── utils.js
    │   │   │   ├── package.json
    │   │   │   └── posix.js
    │   │   ├── postcss
    │   │   │   ├── LICENSE
    │   │   │   ├── README.md
    │   │   │   ├── lib
    │   │   │   │   ├── at-rule.d.ts
    │   │   │   │   ├── at-rule.js
    │   │   │   │   ├── comment.d.ts
    │   │   │   │   ├── comment.js
    │   │   │   │   ├── container.d.ts
    │   │   │   │   ├── container.js
    │   │   │   │   ├── css-syntax-error.d.ts
    │   │   │   │   ├── css-syntax-error.js
    │   │   │   │   ├── declaration.d.ts
    │   │   │   │   ├── declaration.js
    │   │   │   │   ├── document.d.ts
    │   │   │   │   ├── document.js
    │   │   │   │   ├── fromJSON.d.ts
    │   │   │   │   ├── fromJSON.js
    │   │   │   │   ├── input.d.ts
    │   │   │   │   ├── input.js
    │   │   │   │   ├── lazy-result.d.ts
    │   │   │   │   ├── lazy-result.js
    │   │   │   │   ├── list.d.ts
    │   │   │   │   ├── list.js
    │   │   │   │   ├── map-generator.js
    │   │   │   │   ├── no-work-result.d.ts
    │   │   │   │   ├── no-work-result.js
    │   │   │   │   ├── node.d.ts
    │   │   │   │   ├── node.js
    │   │   │   │   ├── parse.d.ts
    │   │   │   │   ├── parse.js
    │   │   │   │   ├── parser.js
    │   │   │   │   ├── postcss.d.mts
    │   │   │   │   ├── postcss.d.ts
    │   │   │   │   ├── postcss.js
    │   │   │   │   ├── postcss.mjs
    │   │   │   │   ├── previous-map.d.ts
    │   │   │   │   ├── previous-map.js
    │   │   │   │   ├── processor.d.ts
    │   │   │   │   ├── processor.js
    │   │   │   │   ├── result.d.ts
    │   │   │   │   ├── result.js
    │   │   │   │   ├── root.d.ts
    │   │   │   │   ├── root.js
    │   │   │   │   ├── rule.d.ts
    │   │   │   │   ├── rule.js
    │   │   │   │   ├── stringifier.d.ts
    │   │   │   │   ├── stringifier.js
    │   │   │   │   ├── stringify.d.ts
    │   │   │   │   ├── stringify.js
    │   │   │   │   ├── symbols.js
    │   │   │   │   ├── terminal-highlight.js
    │   │   │   │   ├── tokenize.js
    │   │   │   │   ├── warn-once.js
    │   │   │   │   ├── warning.d.ts
    │   │   │   │   └── warning.js
    │   │   │   └── package.json
    │   │   ├── react
    │   │   │   ├── LICENSE
    │   │   │   ├── README.md
    │   │   │   ├── cjs
    │   │   │   │   ├── react-compiler-runtime.development.js
    │   │   │   │   ├── react-compiler-runtime.production.js
    │   │   │   │   ├── react-compiler-runtime.profiling.js
    │   │   │   │   ├── react-jsx-dev-runtime.development.js
    │   │   │   │   ├── react-jsx-dev-runtime.production.js
    │   │   │   │   ├── react-jsx-dev-runtime.profiling.js
    │   │   │   │   ├── react-jsx-dev-runtime.react-server.development.js
    │   │   │   │   ├── react-jsx-dev-runtime.react-server.production.js
    │   │   │   │   ├── react-jsx-runtime.development.js
    │   │   │   │   ├── react-jsx-runtime.production.js
    │   │   │   │   ├── react-jsx-runtime.profiling.js
    │   │   │   │   ├── react-jsx-runtime.react-server.development.js
    │   │   │   │   ├── react-jsx-runtime.react-server.production.js
    │   │   │   │   ├── react.development.js
    │   │   │   │   ├── react.production.js
    │   │   │   │   ├── react.react-server.development.js
    │   │   │   │   └── react.react-server.production.js
    │   │   │   ├── compiler-runtime.js
    │   │   │   ├── index.js
    │   │   │   ├── jsx-dev-runtime.js
    │   │   │   ├── jsx-dev-runtime.react-server.js
    │   │   │   ├── jsx-runtime.js
    │   │   │   ├── jsx-runtime.react-server.js
    │   │   │   ├── package.json
    │   │   │   └── react.react-server.js
    │   │   ├── react-dom
    │   │   │   ├── LICENSE
    │   │   │   ├── README.md
    │   │   │   ├── cjs
    │   │   │   │   ├── react-dom-client.development.js
    │   │   │   │   ├── react-dom-client.production.js
    │   │   │   │   ├── react-dom-profiling.development.js
    │   │   │   │   ├── react-dom-profiling.profiling.js
    │   │   │   │   ├── react-dom-server-legacy.browser.development.js
    │   │   │   │   ├── react-dom-server-legacy.browser.production.js
    │   │   │   │   ├── react-dom-server-legacy.node.development.js
    │   │   │   │   ├── react-dom-server-legacy.node.production.js
    │   │   │   │   ├── react-dom-server.browser.development.js
    │   │   │   │   ├── react-dom-server.browser.production.js
    │   │   │   │   ├── react-dom-server.bun.development.js
    │   │   │   │   ├── react-dom-server.bun.production.js
    │   │   │   │   ├── react-dom-server.edge.development.js
    │   │   │   │   ├── react-dom-server.edge.production.js
    │   │   │   │   ├── react-dom-server.node.development.js
    │   │   │   │   ├── react-dom-server.node.production.js
    │   │   │   │   ├── react-dom-test-utils.development.js
    │   │   │   │   ├── react-dom-test-utils.production.js
    │   │   │   │   ├── react-dom.development.js
    │   │   │   │   ├── react-dom.production.js
    │   │   │   │   ├── react-dom.react-server.development.js
    │   │   │   │   └── react-dom.react-server.production.js
    │   │   │   ├── client.js
    │   │   │   ├── client.react-server.js
    │   │   │   ├── index.js
    │   │   │   ├── package.json
    │   │   │   ├── profiling.js
    │   │   │   ├── profiling.react-server.js
    │   │   │   ├── react-dom.react-server.js
    │   │   │   ├── server.browser.js
    │   │   │   ├── server.bun.js
    │   │   │   ├── server.edge.js
    │   │   │   ├── server.js
    │   │   │   ├── server.node.js
    │   │   │   ├── server.react-server.js
    │   │   │   ├── static.browser.js
    │   │   │   ├── static.edge.js
    │   │   │   ├── static.js
    │   │   │   ├── static.node.js
    │   │   │   ├── static.react-server.js
    │   │   │   └── test-utils.js
    │   │   ├── rolldown
    │   │   │   ├── LICENSE
    │   │   │   ├── README.md
    │   │   │   ├── bin
    │   │   │   │   └── cli.mjs
    │   │   │   ├── dist
    │   │   │   │   ├── cli.d.mts
    │   │   │   │   ├── cli.mjs
    │   │   │   │   ├── config.d.mts
    │   │   │   │   ├── config.mjs
    │   │   │   │   ├── experimental-index.d.mts
    │   │   │   │   ├── experimental-index.mjs
    │   │   │   │   ├── experimental-runtime-types.d.ts
    │   │   │   │   ├── filter-index.d.mts
    │   │   │   │   ├── filter-index.mjs
    │   │   │   │   ├── get-log-filter.d.mts
    │   │   │   │   ├── get-log-filter.mjs
    │   │   │   │   ├── index.d.mts
    │   │   │   │   ├── index.mjs
    │   │   │   │   ├── parallel-plugin-worker.d.mts
    │   │   │   │   ├── parallel-plugin-worker.mjs
    │   │   │   │   ├── parallel-plugin.d.mts
    │   │   │   │   ├── parallel-plugin.mjs
    │   │   │   │   ├── parse-ast-index.d.mts
    │   │   │   │   ├── parse-ast-index.mjs
    │   │   │   │   ├── plugins-index.d.mts
    │   │   │   │   ├── plugins-index.mjs
    │   │   │   │   ├── shared
    │   │   │   │   │   ├── binding-DUEnSb0A.d.mts
    │   │   │   │   │   ├── binding-Rc5vBspi.mjs
    │   │   │   │   │   ├── bindingify-input-options-4E8MEYg4.mjs
    │   │   │   │   │   ├── constructors-ChVDbP6o.mjs
    │   │   │   │   │   ├── constructors-DYemMpPL.d.mts
    │   │   │   │   │   ├── define-config-DJOr6Iwt.mjs
    │   │   │   │   │   ├── define-config-DhJZwTRw.d.mts
    │   │   │   │   │   ├── error-DBGOT6sf.mjs
    │   │   │   │   │   ├── get-log-filter-semyr3Lj.d.mts
    │   │   │   │   │   ├── load-config-C9BtnuRk.mjs
    │   │   │   │   │   ├── logging-C6h4g8dA.d.mts
    │   │   │   │   │   ├── logs-D80CXhvg.mjs
    │   │   │   │   │   ├── misc-DJYbNKZX.mjs
    │   │   │   │   │   ├── normalize-string-or-regex-BzTP-qJS.mjs
    │   │   │   │   │   ├── parse-B30xMDQc.mjs
    │   │   │   │   │   ├── prompt-BYQIwEjg.mjs
    │   │   │   │   │   ├── resolve-tsconfig-BD5XUCWz.mjs
    │   │   │   │   │   ├── rolldown-CIfBsrjA.mjs
    │   │   │   │   │   ├── rolldown-build-hRnqgxyz.mjs
    │   │   │   │   │   ├── transform-Kz3D2LbX.d.mts
    │   │   │   │   │   └── watch-BDnUMWmc.mjs
    │   │   │   │   ├── utils-index.d.mts
    │   │   │   │   └── utils-index.mjs
    │   │   │   ├── node_modules
    │   │   │   │   └── @rolldown
    │   │   │   │       └── pluginutils
    │   │   │   │           ├── LICENSE
    │   │   │   │           ├── README.md
    │   │   │   │           ├── dist
    │   │   │   │           │   ├── filter
    │   │   │   │           │   │   ├── composable-filters.d.ts
    │   │   │   │           │   │   ├── composable-filters.js
    │   │   │   │           │   │   ├── filter-vite-plugins.d.ts
    │   │   │   │           │   │   ├── filter-vite-plugins.js
    │   │   │   │           │   │   ├── index.d.ts
    │   │   │   │           │   │   ├── index.js
    │   │   │   │           │   │   ├── simple-filters.d.ts
    │   │   │   │           │   │   └── simple-filters.js
    │   │   │   │           │   ├── index.d.ts
    │   │   │   │           │   ├── index.js
    │   │   │   │           │   ├── utils.d.ts
    │   │   │   │           │   └── utils.js
    │   │   │   │           └── package.json
    │   │   │   └── package.json
    │   │   ├── scheduler
    │   │   │   ├── LICENSE
    │   │   │   ├── README.md
    │   │   │   ├── cjs
    │   │   │   │   ├── scheduler-unstable_mock.development.js
    │   │   │   │   ├── scheduler-unstable_mock.production.js
    │   │   │   │   ├── scheduler-unstable_post_task.development.js
    │   │   │   │   ├── scheduler-unstable_post_task.production.js
    │   │   │   │   ├── scheduler.development.js
    │   │   │   │   ├── scheduler.native.development.js
    │   │   │   │   ├── scheduler.native.production.js
    │   │   │   │   └── scheduler.production.js
    │   │   │   ├── index.js
    │   │   │   ├── index.native.js
    │   │   │   ├── package.json
    │   │   │   ├── unstable_mock.js
    │   │   │   └── unstable_post_task.js
    │   │   ├── source-map-js
    │   │   │   ├── LICENSE
    │   │   │   ├── README.md
    │   │   │   ├── lib
    │   │   │   │   ├── array-set.js
    │   │   │   │   ├── base64-vlq.js
    │   │   │   │   ├── base64.js
    │   │   │   │   ├── binary-search.js
    │   │   │   │   ├── mapping-list.js
    │   │   │   │   ├── quick-sort.js
    │   │   │   │   ├── source-map-consumer.d.ts
    │   │   │   │   ├── source-map-consumer.js
    │   │   │   │   ├── source-map-generator.d.ts
    │   │   │   │   ├── source-map-generator.js
    │   │   │   │   ├── source-node.d.ts
    │   │   │   │   ├── source-node.js
    │   │   │   │   └── util.js
    │   │   │   ├── package.json
    │   │   │   ├── source-map.d.ts
    │   │   │   └── source-map.js
    │   │   ├── tinyglobby
    │   │   │   ├── LICENSE
    │   │   │   ├── README.md
    │   │   │   ├── dist
    │   │   │   │   ├── index.cjs
    │   │   │   │   ├── index.d.cts
    │   │   │   │   ├── index.d.mts
    │   │   │   │   └── index.mjs
    │   │   │   └── package.json
    │   │   ├── typescript
    │   │   │   ├── LICENSE.txt
    │   │   │   ├── README.md
    │   │   │   ├── SECURITY.md
    │   │   │   ├── ThirdPartyNoticeText.txt
    │   │   │   ├── bin
    │   │   │   │   ├── tsc
    │   │   │   │   └── tsserver
    │   │   │   ├── lib
    │   │   │   │   ├── _tsc.js
    │   │   │   │   ├── _tsserver.js
    │   │   │   │   ├── _typingsInstaller.js
    │   │   │   │   ├── cs
    │   │   │   │   │   └── diagnosticMessages.generated.json
    │   │   │   │   ├── de
    │   │   │   │   │   └── diagnosticMessages.generated.json
    │   │   │   │   ├── es
    │   │   │   │   │   └── diagnosticMessages.generated.json
    │   │   │   │   ├── fr
    │   │   │   │   │   └── diagnosticMessages.generated.json
    │   │   │   │   ├── it
    │   │   │   │   │   └── diagnosticMessages.generated.json
    │   │   │   │   ├── ja
    │   │   │   │   │   └── diagnosticMessages.generated.json
    │   │   │   │   ├── ko
    │   │   │   │   │   └── diagnosticMessages.generated.json
    │   │   │   │   ├── lib.d.ts
    │   │   │   │   ├── lib.decorators.d.ts
    │   │   │   │   ├── lib.decorators.legacy.d.ts
    │   │   │   │   ├── lib.dom.asynciterable.d.ts
    │   │   │   │   ├── lib.dom.d.ts
    │   │   │   │   ├── lib.dom.iterable.d.ts
    │   │   │   │   ├── lib.es2015.collection.d.ts
    │   │   │   │   ├── lib.es2015.core.d.ts
    │   │   │   │   ├── lib.es2015.d.ts
    │   │   │   │   ├── lib.es2015.generator.d.ts
    │   │   │   │   ├── lib.es2015.iterable.d.ts
    │   │   │   │   ├── lib.es2015.promise.d.ts
    │   │   │   │   ├── lib.es2015.proxy.d.ts
    │   │   │   │   ├── lib.es2015.reflect.d.ts
    │   │   │   │   ├── lib.es2015.symbol.d.ts
    │   │   │   │   ├── lib.es2015.symbol.wellknown.d.ts
    │   │   │   │   ├── lib.es2016.array.include.d.ts
    │   │   │   │   ├── lib.es2016.d.ts
    │   │   │   │   ├── lib.es2016.full.d.ts
    │   │   │   │   ├── lib.es2016.intl.d.ts
    │   │   │   │   ├── lib.es2017.arraybuffer.d.ts
    │   │   │   │   ├── lib.es2017.d.ts
    │   │   │   │   ├── lib.es2017.date.d.ts
    │   │   │   │   ├── lib.es2017.full.d.ts
    │   │   │   │   ├── lib.es2017.intl.d.ts
    │   │   │   │   ├── lib.es2017.object.d.ts
    │   │   │   │   ├── lib.es2017.sharedmemory.d.ts
    │   │   │   │   ├── lib.es2017.string.d.ts
    │   │   │   │   ├── lib.es2017.typedarrays.d.ts
    │   │   │   │   ├── lib.es2018.asyncgenerator.d.ts
    │   │   │   │   ├── lib.es2018.asynciterable.d.ts
    │   │   │   │   ├── lib.es2018.d.ts
    │   │   │   │   ├── lib.es2018.full.d.ts
    │   │   │   │   ├── lib.es2018.intl.d.ts
    │   │   │   │   ├── lib.es2018.promise.d.ts
    │   │   │   │   ├── lib.es2018.regexp.d.ts
    │   │   │   │   ├── lib.es2019.array.d.ts
    │   │   │   │   ├── lib.es2019.d.ts
    │   │   │   │   ├── lib.es2019.full.d.ts
    │   │   │   │   ├── lib.es2019.intl.d.ts
    │   │   │   │   ├── lib.es2019.object.d.ts
    │   │   │   │   ├── lib.es2019.string.d.ts
    │   │   │   │   ├── lib.es2019.symbol.d.ts
    │   │   │   │   ├── lib.es2020.bigint.d.ts
    │   │   │   │   ├── lib.es2020.d.ts
    │   │   │   │   ├── lib.es2020.date.d.ts
    │   │   │   │   ├── lib.es2020.full.d.ts
    │   │   │   │   ├── lib.es2020.intl.d.ts
    │   │   │   │   ├── lib.es2020.number.d.ts
    │   │   │   │   ├── lib.es2020.promise.d.ts
    │   │   │   │   ├── lib.es2020.sharedmemory.d.ts
    │   │   │   │   ├── lib.es2020.string.d.ts
    │   │   │   │   ├── lib.es2020.symbol.wellknown.d.ts
    │   │   │   │   ├── lib.es2021.d.ts
    │   │   │   │   ├── lib.es2021.full.d.ts
    │   │   │   │   ├── lib.es2021.intl.d.ts
    │   │   │   │   ├── lib.es2021.promise.d.ts
    │   │   │   │   ├── lib.es2021.string.d.ts
    │   │   │   │   ├── lib.es2021.weakref.d.ts
    │   │   │   │   ├── lib.es2022.array.d.ts
    │   │   │   │   ├── lib.es2022.d.ts
    │   │   │   │   ├── lib.es2022.error.d.ts
    │   │   │   │   ├── lib.es2022.full.d.ts
    │   │   │   │   ├── lib.es2022.intl.d.ts
    │   │   │   │   ├── lib.es2022.object.d.ts
    │   │   │   │   ├── lib.es2022.regexp.d.ts
    │   │   │   │   ├── lib.es2022.string.d.ts
    │   │   │   │   ├── lib.es2023.array.d.ts
    │   │   │   │   ├── lib.es2023.collection.d.ts
    │   │   │   │   ├── lib.es2023.d.ts
    │   │   │   │   ├── lib.es2023.full.d.ts
    │   │   │   │   ├── lib.es2023.intl.d.ts
    │   │   │   │   ├── lib.es2024.arraybuffer.d.ts
    │   │   │   │   ├── lib.es2024.collection.d.ts
    │   │   │   │   ├── lib.es2024.d.ts
    │   │   │   │   ├── lib.es2024.full.d.ts
    │   │   │   │   ├── lib.es2024.object.d.ts
    │   │   │   │   ├── lib.es2024.promise.d.ts
    │   │   │   │   ├── lib.es2024.regexp.d.ts
    │   │   │   │   ├── lib.es2024.sharedmemory.d.ts
    │   │   │   │   ├── lib.es2024.string.d.ts
    │   │   │   │   ├── lib.es2025.collection.d.ts
    │   │   │   │   ├── lib.es2025.d.ts
    │   │   │   │   ├── lib.es2025.float16.d.ts
    │   │   │   │   ├── lib.es2025.full.d.ts
    │   │   │   │   ├── lib.es2025.intl.d.ts
    │   │   │   │   ├── lib.es2025.iterator.d.ts
    │   │   │   │   ├── lib.es2025.promise.d.ts
    │   │   │   │   ├── lib.es2025.regexp.d.ts
    │   │   │   │   ├── lib.es5.d.ts
    │   │   │   │   ├── lib.es6.d.ts
    │   │   │   │   ├── lib.esnext.array.d.ts
    │   │   │   │   ├── lib.esnext.collection.d.ts
    │   │   │   │   ├── lib.esnext.d.ts
    │   │   │   │   ├── lib.esnext.date.d.ts
    │   │   │   │   ├── lib.esnext.decorators.d.ts
    │   │   │   │   ├── lib.esnext.disposable.d.ts
    │   │   │   │   ├── lib.esnext.error.d.ts
    │   │   │   │   ├── lib.esnext.full.d.ts
    │   │   │   │   ├── lib.esnext.intl.d.ts
    │   │   │   │   ├── lib.esnext.sharedmemory.d.ts
    │   │   │   │   ├── lib.esnext.temporal.d.ts
    │   │   │   │   ├── lib.esnext.typedarrays.d.ts
    │   │   │   │   ├── lib.scripthost.d.ts
    │   │   │   │   ├── lib.webworker.asynciterable.d.ts
    │   │   │   │   ├── lib.webworker.d.ts
    │   │   │   │   ├── lib.webworker.importscripts.d.ts
    │   │   │   │   ├── lib.webworker.iterable.d.ts
    │   │   │   │   ├── pl
    │   │   │   │   │   └── diagnosticMessages.generated.json
    │   │   │   │   ├── pt-br
    │   │   │   │   │   └── diagnosticMessages.generated.json
    │   │   │   │   ├── ru
    │   │   │   │   │   └── diagnosticMessages.generated.json
    │   │   │   │   ├── tr
    │   │   │   │   │   └── diagnosticMessages.generated.json
    │   │   │   │   ├── tsc.js
    │   │   │   │   ├── tsserver.js
    │   │   │   │   ├── tsserverlibrary.d.ts
    │   │   │   │   ├── tsserverlibrary.js
    │   │   │   │   ├── typesMap.json
    │   │   │   │   ├── typescript.d.ts
    │   │   │   │   ├── typescript.js
    │   │   │   │   ├── typingsInstaller.js
    │   │   │   │   ├── watchGuard.js
    │   │   │   │   ├── zh-cn
    │   │   │   │   │   └── diagnosticMessages.generated.json
    │   │   │   │   └── zh-tw
    │   │   │   │       └── diagnosticMessages.generated.json
    │   │   │   └── package.json
    │   │   └── vite
    │   │       ├── LICENSE.md
    │   │       ├── README.md
    │   │       ├── bin
    │   │       │   ├── openChrome.js
    │   │       │   └── vite.js
    │   │       ├── client.d.ts
    │   │       ├── dist
    │   │       │   ├── client
    │   │       │   │   ├── client.mjs
    │   │       │   │   └── env.mjs
    │   │       │   └── node
    │   │       │       ├── chunks
    │   │       │       │   ├── build.js
    │   │       │       │   ├── build2.js
    │   │       │       │   ├── chunk.js
    │   │       │       │   ├── config.js
    │   │       │       │   ├── dist.js
    │   │       │       │   ├── lib.js
    │   │       │       │   ├── logger.js
    │   │       │       │   ├── moduleRunnerTransport.d.ts
    │   │       │       │   ├── node.js
    │   │       │       │   ├── optimizer.js
    │   │       │       │   ├── postcss-import.js
    │   │       │       │   ├── preview.js
    │   │       │       │   └── server.js
    │   │       │       ├── cli.js
    │   │       │       ├── index.d.ts
    │   │       │       ├── index.js
    │   │       │       ├── internal.d.ts
    │   │       │       ├── internal.js
    │   │       │       ├── module-runner.d.ts
    │   │       │       └── module-runner.js
    │   │       ├── misc
    │   │       │   ├── false.js
    │   │       │   └── true.js
    │   │       ├── package.json
    │   │       └── types
    │   │           ├── customEvent.d.ts
    │   │           ├── hmrPayload.d.ts
    │   │           ├── hot.d.ts
    │   │           ├── import-meta.d.ts
    │   │           ├── importGlob.d.ts
    │   │           ├── importMeta.d.ts
    │   │           ├── internal
    │   │           │   ├── cssPreprocessorOptions.d.ts
    │   │           │   ├── esbuildOptions.d.ts
    │   │           │   ├── lightningcssOptions.d.ts
    │   │           │   ├── rollupTypeCompat.d.ts
    │   │           │   └── terserOptions.d.ts
    │   │           └── metadata.d.ts
    │   ├── package-lock.json
    │   ├── package.json
    │   ├── sale-terminal
    │   │   ├── config.ts
    │   │   ├── main.ts
    │   │   └── session.ts
    │   ├── services
    │   │   ├── aiengine.ts
    │   │   ├── approval
    │   │   │   └── approvalworkflowservice.ts
    │   │   ├── authservice.ts
    │   │   ├── bankingservice.ts
    │   │   ├── blockchainservice.ts
    │   │   ├── calibration
    │   │   │   └── calibrationengine.ts
    │   │   ├── conflict
    │   │   │   └── conflictresolver.ts
    │   │   ├── cost
    │   │   │   └── costallocationsystem.ts
    │   │   ├── customsservice.ts
    │   │   ├── customsutils.ts
    │   │   ├── dictionaryapprovalservice.ts
    │   │   ├── dictionaryservice.ts
    │   │   ├── documentai.ts
    │   │   ├── einvoiceengine.ts
    │   │   ├── enterpriselinker.ts
    │   │   ├── eventbridge.ts
    │   │   ├── exportservice.ts
    │   │   ├── fraudguard.ts
    │   │   ├── gmailservice.ts
    │   │   ├── heynaConnector.ts
    │   │   ├── hr
    │   │   │   └── application
    │   │   │       └── handlers
    │   │   │           ├── leave-handler.ts
    │   │   │           └── payroll-handler.ts
    │   │   ├── hrengine.ts
    │   │   ├── ingestion
    │   │   │   ├── aiprocessor.ts
    │   │   │   ├── dictionaryguard.ts
    │   │   │   ├── extractors.ts
    │   │   │   ├── idempotencymanager.ts
    │   │   │   ├── ingestionservice.ts
    │   │   │   └── utils.ts
    │   │   ├── learningengine.ts
    │   │   ├── logisticsservice.ts
    │   │   ├── mapping
    │   │   │   └── smartlinkmappingengine.ts
    │   │   ├── modulehelpers.ts
    │   │   ├── moduleregistry.ts
    │   │   ├── notificationservice.ts
    │   │   ├── offlineservice.ts
    │   │   ├── parser
    │   │   │   └── documentparserlayer.ts
    │   │   ├── paymentservice.ts
    │   │   ├── personnelengine.ts
    │   │   ├── productionengine.ts
    │   │   ├── productionsalesflow.ts
    │   │   ├── productionservice.ts
    │   │   ├── quantumbufferservice.ts
    │   │   ├── quantumengine.ts
    │   │   ├── rbacengine.ts
    │   │   ├── realtimenotificationservice.ts
    │   │   ├── recoveryengine.ts
    │   │   ├── salescore.ts
    │   │   ├── scoring
    │   │   │   └── contextscoringengine.ts
    │   │   ├── security.service.ts
    │   │   ├── sellerengine.ts
    │   │   ├── smartlinkengine.ts
    │   │   ├── staging
    │   │   │   └── eventstaginglayer.ts
    │   │   ├── supplier
    │   │   │   └── supplierengine.ts
    │   │   ├── taskrouter.ts
    │   │   ├── taxreportservice.ts
    │   │   ├── threatdetectionservice.ts
    │   │   └── warehouseservice.ts
    │   ├── superdictionary.ts
    │   ├── sw.js
    │   ├── tsconfig.json
    │   ├── types.ts
    │   ├── utils
    │   │   ├── supplierclassifier.ts
    │   │   └── supplierimporthelper.ts
    │   ├── vite.config.ts
    │   └── wiring
    │       └── domain-flow.wiring.ts
    ├── apps
    │   └── tam-luxury
    │       ├── app-psychology.html
    │       ├── attendance.html
    │       ├── cfo-dashboard.html
    │       ├── chat-rooms.html
    │       ├── daily-work-app.html
    │       ├── favicon.ico
    │       ├── fix.txt
    │       ├── hr-admin.html
    │       ├── hr-dashboard.html
    │       ├── hr-dashboard.html.bak
    │       ├── hr-manager.html
    │       ├── icon-ai.png
    │       ├── icon-hr.png
    │       ├── icon-master.png
    │       ├── icon-prod.png
    │       ├── icon-sales.png
    │       ├── icon-showroom.png
    │       ├── icon-warehouse.png
    │       ├── index-1.html
    │       ├── index.html
    │       ├── index2.html
    │       ├── index3.html
    │       ├── index4.html
    │       ├── indexa.html
    │       ├── indexb.html
    │       ├── indexc.html
    │       ├── indexf.html
    │       ├── kris-email-hub.html
    │       ├── ktt-approval.html
    │       ├── loss-thresholds.html
    │       ├── master-dashboard.html
    │       ├── nattos-audit.html
    │       ├── nattos-data.js
    │       ├── nattos-eod-engine.js
    │       ├── nattos-fx.js
    │       ├── nattos-galaxy.css
    │       ├── nattos-galaxy.js
    │       ├── nattos-glass.css
    │       ├── nattos-loss-thresholds.js
    │       ├── nattos-payment.js
    │       ├── nattos-production.html
    │       ├── nattos-tokens.css
    │       ├── nattos-ui-theme.css
    │       ├── operations-terminal.html
    │       ├── order-flow.html
    │       ├── personal-profile-v2.html
    │       ├── personal-profile.html
    │       ├── pricing-engine.html
    │       ├── production-wallboard.html
    │       ├── showroom-sales.html
    │       ├── surveillance.html
    │       ├── tamluxury-v2.html
    │       ├── tamluxury-v3.html
    │       ├── tamluxury-v4.html
    │       ├── warehouse-full.html
    │       └── warehouse-ops.html
    ├── engine-registry.ts
    ├── node_modules
    │   ├── @esbuild
    │   │   └── darwin-x64
    │   │       ├── README.md
    │   │       ├── bin
    │   │       │   └── esbuild
    │   │       └── package.json
    │   ├── @oxc-project
    │   │   └── types
    │   │       ├── LICENSE
    │   │       ├── README.md
    │   │       ├── package.json
    │   │       └── types.d.ts
    │   ├── @rolldown
    │   │   ├── binding-darwin-x64
    │   │   │   ├── README.md
    │   │   │   ├── package.json
    │   │   │   └── rolldown-binding.darwin-x64.node
    │   │   └── pluginutils
    │   │       ├── LICENSE
    │   │       ├── README.md
    │   │       ├── dist
    │   │       │   ├── filter
    │   │       │   │   ├── composable-filters.d.ts
    │   │       │   │   ├── composable-filters.js
    │   │       │   │   ├── filter-vite-plugins.d.ts
    │   │       │   │   ├── filter-vite-plugins.js
    │   │       │   │   ├── index.d.ts
    │   │       │   │   ├── index.js
    │   │       │   │   ├── simple-filters.d.ts
    │   │       │   │   └── simple-filters.js
    │   │       │   ├── index.d.ts
    │   │       │   ├── index.js
    │   │       │   ├── utils.d.ts
    │   │       │   └── utils.js
    │   │       └── package.json
    │   ├── @types
    │   │   ├── react
    │   │   │   ├── LICENSE
    │   │   │   ├── README.md
    │   │   │   ├── canary.d.ts
    │   │   │   ├── compiler-runtime.d.ts
    │   │   │   ├── experimental.d.ts
    │   │   │   ├── global.d.ts
    │   │   │   ├── index.d.ts
    │   │   │   ├── jsx-dev-runtime.d.ts
    │   │   │   ├── jsx-runtime.d.ts
    │   │   │   ├── package.json
    │   │   │   └── ts5.0
    │   │   │       ├── canary.d.ts
    │   │   │       ├── experimental.d.ts
    │   │   │       ├── global.d.ts
    │   │   │       ├── index.d.ts
    │   │   │       ├── jsx-dev-runtime.d.ts
    │   │   │       └── jsx-runtime.d.ts
    │   │   └── react-dom
    │   │       ├── LICENSE
    │   │       ├── README.md
    │   │       ├── canary.d.ts
    │   │       ├── client.d.ts
    │   │       ├── experimental.d.ts
    │   │       ├── index.d.ts
    │   │       ├── package.json
    │   │       ├── server.browser.d.ts
    │   │       ├── server.bun.d.ts
    │   │       ├── server.d.ts
    │   │       ├── server.edge.d.ts
    │   │       ├── server.node.d.ts
    │   │       ├── static.browser.d.ts
    │   │       ├── static.d.ts
    │   │       ├── static.edge.d.ts
    │   │       ├── static.node.d.ts
    │   │       └── test-utils
    │   │           └── index.d.ts
    │   ├── @vitejs
    │   │   └── plugin-react
    │   │       ├── LICENSE
    │   │       ├── README.md
    │   │       ├── dist
    │   │       │   ├── index.d.ts
    │   │       │   ├── index.js
    │   │       │   └── refresh-runtime.js
    │   │       ├── package.json
    │   │       └── types
    │   │           ├── optionalTypes.d.ts
    │   │           └── preamble.d.ts
    │   ├── accepts
    │   │   ├── HISTORY.md
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── index.js
    │   │   └── package.json
    │   ├── body-parser
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── index.js
    │   │   ├── lib
    │   │   │   ├── read.js
    │   │   │   ├── types
    │   │   │   │   ├── json.js
    │   │   │   │   ├── raw.js
    │   │   │   │   ├── text.js
    │   │   │   │   └── urlencoded.js
    │   │   │   └── utils.js
    │   │   └── package.json
    │   ├── bytes
    │   │   ├── History.md
    │   │   ├── LICENSE
    │   │   ├── Readme.md
    │   │   ├── index.js
    │   │   └── package.json
    │   ├── call-bind-apply-helpers
    │   │   ├── CHANGELOG.md
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── actualApply.d.ts
    │   │   ├── actualApply.js
    │   │   ├── applyBind.d.ts
    │   │   ├── applyBind.js
    │   │   ├── functionApply.d.ts
    │   │   ├── functionApply.js
    │   │   ├── functionCall.d.ts
    │   │   ├── functionCall.js
    │   │   ├── index.d.ts
    │   │   ├── index.js
    │   │   ├── package.json
    │   │   ├── reflectApply.d.ts
    │   │   ├── reflectApply.js
    │   │   ├── test
    │   │   │   └── index.js
    │   │   └── tsconfig.json
    │   ├── call-bound
    │   │   ├── CHANGELOG.md
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── index.d.ts
    │   │   ├── index.js
    │   │   ├── package.json
    │   │   ├── test
    │   │   │   └── index.js
    │   │   └── tsconfig.json
    │   ├── content-disposition
    │   │   ├── HISTORY.md
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── index.js
    │   │   └── package.json
    │   ├── content-type
    │   │   ├── HISTORY.md
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── index.js
    │   │   └── package.json
    │   ├── cookie
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── SECURITY.md
    │   │   ├── index.js
    │   │   └── package.json
    │   ├── cookie-signature
    │   │   ├── History.md
    │   │   ├── LICENSE
    │   │   ├── Readme.md
    │   │   ├── index.js
    │   │   └── package.json
    │   ├── cors
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── lib
    │   │   │   └── index.js
    │   │   └── package.json
    │   ├── csstype
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── index.d.ts
    │   │   ├── index.js.flow
    │   │   └── package.json
    │   ├── debug
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── package.json
    │   │   └── src
    │   │       ├── browser.js
    │   │       ├── common.js
    │   │       ├── index.js
    │   │       └── node.js
    │   ├── depd
    │   │   ├── History.md
    │   │   ├── LICENSE
    │   │   ├── Readme.md
    │   │   ├── index.js
    │   │   ├── lib
    │   │   │   └── browser
    │   │   │       └── index.js
    │   │   └── package.json
    │   ├── detect-libc
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── index.d.ts
    │   │   ├── lib
    │   │   │   ├── detect-libc.js
    │   │   │   ├── elf.js
    │   │   │   ├── filesystem.js
    │   │   │   └── process.js
    │   │   └── package.json
    │   ├── dunder-proto
    │   │   ├── CHANGELOG.md
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── get.d.ts
    │   │   ├── get.js
    │   │   ├── package.json
    │   │   ├── set.d.ts
    │   │   ├── set.js
    │   │   ├── test
    │   │   │   ├── get.js
    │   │   │   ├── index.js
    │   │   │   └── set.js
    │   │   └── tsconfig.json
    │   ├── ee-first
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── index.js
    │   │   └── package.json
    │   ├── encodeurl
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── index.js
    │   │   └── package.json
    │   ├── es-define-property
    │   │   ├── CHANGELOG.md
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── index.d.ts
    │   │   ├── index.js
    │   │   ├── package.json
    │   │   ├── test
    │   │   │   └── index.js
    │   │   └── tsconfig.json
    │   ├── es-errors
    │   │   ├── CHANGELOG.md
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── eval.d.ts
    │   │   ├── eval.js
    │   │   ├── index.d.ts
    │   │   ├── index.js
    │   │   ├── package.json
    │   │   ├── range.d.ts
    │   │   ├── range.js
    │   │   ├── ref.d.ts
    │   │   ├── ref.js
    │   │   ├── syntax.d.ts
    │   │   ├── syntax.js
    │   │   ├── test
    │   │   │   └── index.js
    │   │   ├── tsconfig.json
    │   │   ├── type.d.ts
    │   │   ├── type.js
    │   │   ├── uri.d.ts
    │   │   └── uri.js
    │   ├── es-object-atoms
    │   │   ├── CHANGELOG.md
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── RequireObjectCoercible.d.ts
    │   │   ├── RequireObjectCoercible.js
    │   │   ├── ToObject.d.ts
    │   │   ├── ToObject.js
    │   │   ├── index.d.ts
    │   │   ├── index.js
    │   │   ├── isObject.d.ts
    │   │   ├── isObject.js
    │   │   ├── package.json
    │   │   ├── test
    │   │   │   └── index.js
    │   │   └── tsconfig.json
    │   ├── esbuild
    │   │   ├── LICENSE.md
    │   │   ├── README.md
    │   │   ├── bin
    │   │   │   └── esbuild
    │   │   ├── install.js
    │   │   ├── lib
    │   │   │   ├── main.d.ts
    │   │   │   └── main.js
    │   │   └── package.json
    │   ├── escape-html
    │   │   ├── LICENSE
    │   │   ├── Readme.md
    │   │   ├── index.js
    │   │   └── package.json
    │   ├── etag
    │   │   ├── HISTORY.md
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── index.js
    │   │   └── package.json
    │   ├── express
    │   │   ├── LICENSE
    │   │   ├── Readme.md
    │   │   ├── index.js
    │   │   ├── lib
    │   │   │   ├── application.js
    │   │   │   ├── express.js
    │   │   │   ├── request.js
    │   │   │   ├── response.js
    │   │   │   ├── utils.js
    │   │   │   └── view.js
    │   │   └── package.json
    │   ├── fdir
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── dist
    │   │   │   ├── index.cjs
    │   │   │   ├── index.d.cts
    │   │   │   ├── index.d.mts
    │   │   │   └── index.mjs
    │   │   └── package.json
    │   ├── finalhandler
    │   │   ├── HISTORY.md
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── index.js
    │   │   └── package.json
    │   ├── forwarded
    │   │   ├── HISTORY.md
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── index.js
    │   │   └── package.json
    │   ├── fresh
    │   │   ├── HISTORY.md
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── index.js
    │   │   └── package.json
    │   ├── fsevents
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── fsevents.d.ts
    │   │   ├── fsevents.js
    │   │   ├── fsevents.node
    │   │   └── package.json
    │   ├── function-bind
    │   │   ├── CHANGELOG.md
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── implementation.js
    │   │   ├── index.js
    │   │   ├── package.json
    │   │   └── test
    │   │       └── index.js
    │   ├── get-intrinsic
    │   │   ├── CHANGELOG.md
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── index.js
    │   │   ├── package.json
    │   │   └── test
    │   │       └── GetIntrinsic.js
    │   ├── get-proto
    │   │   ├── CHANGELOG.md
    │   │   ├── LICENSE
    │   │   ├── Object.getPrototypeOf.d.ts
    │   │   ├── Object.getPrototypeOf.js
    │   │   ├── README.md
    │   │   ├── Reflect.getPrototypeOf.d.ts
    │   │   ├── Reflect.getPrototypeOf.js
    │   │   ├── index.d.ts
    │   │   ├── index.js
    │   │   ├── package.json
    │   │   ├── test
    │   │   │   └── index.js
    │   │   └── tsconfig.json
    │   ├── get-tsconfig
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── dist
    │   │   │   ├── index.cjs
    │   │   │   ├── index.d.cts
    │   │   │   ├── index.d.mts
    │   │   │   └── index.mjs
    │   │   └── package.json
    │   ├── gopd
    │   │   ├── CHANGELOG.md
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── gOPD.d.ts
    │   │   ├── gOPD.js
    │   │   ├── index.d.ts
    │   │   ├── index.js
    │   │   ├── package.json
    │   │   ├── test
    │   │   │   └── index.js
    │   │   └── tsconfig.json
    │   ├── has-symbols
    │   │   ├── CHANGELOG.md
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── index.d.ts
    │   │   ├── index.js
    │   │   ├── package.json
    │   │   ├── shams.d.ts
    │   │   ├── shams.js
    │   │   ├── test
    │   │   │   ├── index.js
    │   │   │   ├── shams
    │   │   │   │   ├── core-js.js
    │   │   │   │   └── get-own-property-symbols.js
    │   │   │   └── tests.js
    │   │   └── tsconfig.json
    │   ├── hasown
    │   │   ├── CHANGELOG.md
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── index.d.ts
    │   │   ├── index.js
    │   │   ├── package.json
    │   │   └── tsconfig.json
    │   ├── http-errors
    │   │   ├── HISTORY.md
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── index.js
    │   │   └── package.json
    │   ├── iconv-lite
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── encodings
    │   │   │   ├── dbcs-codec.js
    │   │   │   ├── dbcs-data.js
    │   │   │   ├── index.js
    │   │   │   ├── internal.js
    │   │   │   ├── sbcs-codec.js
    │   │   │   ├── sbcs-data-generated.js
    │   │   │   ├── sbcs-data.js
    │   │   │   ├── tables
    │   │   │   │   ├── big5-added.json
    │   │   │   │   ├── cp936.json
    │   │   │   │   ├── cp949.json
    │   │   │   │   ├── cp950.json
    │   │   │   │   ├── eucjp.json
    │   │   │   │   ├── gb18030-ranges.json
    │   │   │   │   ├── gbk-added.json
    │   │   │   │   └── shiftjis.json
    │   │   │   ├── utf16.js
    │   │   │   ├── utf32.js
    │   │   │   └── utf7.js
    │   │   ├── lib
    │   │   │   ├── bom-handling.js
    │   │   │   ├── helpers
    │   │   │   │   └── merge-exports.js
    │   │   │   ├── index.d.ts
    │   │   │   ├── index.js
    │   │   │   └── streams.js
    │   │   ├── package.json
    │   │   └── types
    │   │       └── encodings.d.ts
    │   ├── inherits
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── inherits.js
    │   │   ├── inherits_browser.js
    │   │   └── package.json
    │   ├── ipaddr.js
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── ipaddr.min.js
    │   │   ├── lib
    │   │   │   ├── ipaddr.js
    │   │   │   └── ipaddr.js.d.ts
    │   │   └── package.json
    │   ├── is-promise
    │   │   ├── LICENSE
    │   │   ├── index.d.ts
    │   │   ├── index.js
    │   │   ├── index.mjs
    │   │   ├── package.json
    │   │   └── readme.md
    │   ├── lightningcss
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── node
    │   │   │   ├── ast.d.ts
    │   │   │   ├── ast.js.flow
    │   │   │   ├── browserslistToTargets.js
    │   │   │   ├── composeVisitors.js
    │   │   │   ├── flags.js
    │   │   │   ├── index.d.ts
    │   │   │   ├── index.js
    │   │   │   ├── index.js.flow
    │   │   │   ├── index.mjs
    │   │   │   ├── targets.d.ts
    │   │   │   └── targets.js.flow
    │   │   └── package.json
    │   ├── lightningcss-darwin-x64
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── lightningcss.darwin-x64.node
    │   │   └── package.json
    │   ├── math-intrinsics
    │   │   ├── CHANGELOG.md
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── abs.d.ts
    │   │   ├── abs.js
    │   │   ├── constants
    │   │   │   ├── maxArrayLength.d.ts
    │   │   │   ├── maxArrayLength.js
    │   │   │   ├── maxSafeInteger.d.ts
    │   │   │   ├── maxSafeInteger.js
    │   │   │   ├── maxValue.d.ts
    │   │   │   └── maxValue.js
    │   │   ├── floor.d.ts
    │   │   ├── floor.js
    │   │   ├── isFinite.d.ts
    │   │   ├── isFinite.js
    │   │   ├── isInteger.d.ts
    │   │   ├── isInteger.js
    │   │   ├── isNaN.d.ts
    │   │   ├── isNaN.js
    │   │   ├── isNegativeZero.d.ts
    │   │   ├── isNegativeZero.js
    │   │   ├── max.d.ts
    │   │   ├── max.js
    │   │   ├── min.d.ts
    │   │   ├── min.js
    │   │   ├── mod.d.ts
    │   │   ├── mod.js
    │   │   ├── package.json
    │   │   ├── pow.d.ts
    │   │   ├── pow.js
    │   │   ├── round.d.ts
    │   │   ├── round.js
    │   │   ├── sign.d.ts
    │   │   ├── sign.js
    │   │   ├── test
    │   │   │   └── index.js
    │   │   └── tsconfig.json
    │   ├── media-typer
    │   │   ├── HISTORY.md
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── index.js
    │   │   └── package.json
    │   ├── merge-descriptors
    │   │   ├── index.d.ts
    │   │   ├── index.js
    │   │   ├── license
    │   │   ├── package.json
    │   │   └── readme.md
    │   ├── mime-db
    │   │   ├── HISTORY.md
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── db.json
    │   │   ├── index.js
    │   │   └── package.json
    │   ├── mime-types
    │   │   ├── HISTORY.md
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── index.js
    │   │   ├── mimeScore.js
    │   │   └── package.json
    │   ├── ms
    │   │   ├── index.js
    │   │   ├── license.md
    │   │   ├── package.json
    │   │   └── readme.md
    │   ├── nanoid
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── async
    │   │   │   ├── index.browser.cjs
    │   │   │   ├── index.browser.js
    │   │   │   ├── index.cjs
    │   │   │   ├── index.d.ts
    │   │   │   ├── index.js
    │   │   │   ├── index.native.js
    │   │   │   └── package.json
    │   │   ├── bin
    │   │   │   └── nanoid.cjs
    │   │   ├── index.browser.cjs
    │   │   ├── index.browser.js
    │   │   ├── index.cjs
    │   │   ├── index.d.cts
    │   │   ├── index.d.ts
    │   │   ├── index.js
    │   │   ├── nanoid.js
    │   │   ├── non-secure
    │   │   │   ├── index.cjs
    │   │   │   ├── index.d.ts
    │   │   │   ├── index.js
    │   │   │   └── package.json
    │   │   ├── package.json
    │   │   └── url-alphabet
    │   │       ├── index.cjs
    │   │       ├── index.js
    │   │       └── package.json
    │   ├── negotiator
    │   │   ├── HISTORY.md
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── index.js
    │   │   ├── lib
    │   │   │   ├── charset.js
    │   │   │   ├── encoding.js
    │   │   │   ├── language.js
    │   │   │   └── mediaType.js
    │   │   └── package.json
    │   ├── object-assign
    │   │   ├── index.js
    │   │   ├── license
    │   │   ├── package.json
    │   │   └── readme.md
    │   ├── object-inspect
    │   │   ├── CHANGELOG.md
    │   │   ├── LICENSE
    │   │   ├── example
    │   │   │   ├── all.js
    │   │   │   ├── circular.js
    │   │   │   ├── fn.js
    │   │   │   └── inspect.js
    │   │   ├── index.js
    │   │   ├── package-support.json
    │   │   ├── package.json
    │   │   ├── readme.markdown
    │   │   ├── test
    │   │   │   ├── bigint.js
    │   │   │   ├── browser
    │   │   │   │   └── dom.js
    │   │   │   ├── circular.js
    │   │   │   ├── deep.js
    │   │   │   ├── element.js
    │   │   │   ├── err.js
    │   │   │   ├── fakes.js
    │   │   │   ├── fn.js
    │   │   │   ├── global.js
    │   │   │   ├── has.js
    │   │   │   ├── holes.js
    │   │   │   ├── indent-option.js
    │   │   │   ├── inspect.js
    │   │   │   ├── lowbyte.js
    │   │   │   ├── number.js
    │   │   │   ├── quoteStyle.js
    │   │   │   ├── toStringTag.js
    │   │   │   ├── undef.js
    │   │   │   └── values.js
    │   │   ├── test-core-js.js
    │   │   └── util.inspect.js
    │   ├── on-finished
    │   │   ├── HISTORY.md
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── index.js
    │   │   └── package.json
    │   ├── once
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── once.js
    │   │   └── package.json
    │   ├── parseurl
    │   │   ├── HISTORY.md
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── index.js
    │   │   └── package.json
    │   ├── path-to-regexp
    │   │   ├── LICENSE
    │   │   ├── Readme.md
    │   │   ├── dist
    │   │   │   ├── index.d.ts
    │   │   │   ├── index.js
    │   │   │   └── index.js.map
    │   │   └── package.json
    │   ├── picocolors
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── package.json
    │   │   ├── picocolors.browser.js
    │   │   ├── picocolors.d.ts
    │   │   ├── picocolors.js
    │   │   └── types.d.ts
    │   ├── picomatch
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── index.js
    │   │   ├── lib
    │   │   │   ├── constants.js
    │   │   │   ├── parse.js
    │   │   │   ├── picomatch.js
    │   │   │   ├── scan.js
    │   │   │   └── utils.js
    │   │   ├── package.json
    │   │   └── posix.js
    │   ├── postcss
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── lib
    │   │   │   ├── at-rule.d.ts
    │   │   │   ├── at-rule.js
    │   │   │   ├── comment.d.ts
    │   │   │   ├── comment.js
    │   │   │   ├── container.d.ts
    │   │   │   ├── container.js
    │   │   │   ├── css-syntax-error.d.ts
    │   │   │   ├── css-syntax-error.js
    │   │   │   ├── declaration.d.ts
    │   │   │   ├── declaration.js
    │   │   │   ├── document.d.ts
    │   │   │   ├── document.js
    │   │   │   ├── fromJSON.d.ts
    │   │   │   ├── fromJSON.js
    │   │   │   ├── input.d.ts
    │   │   │   ├── input.js
    │   │   │   ├── lazy-result.d.ts
    │   │   │   ├── lazy-result.js
    │   │   │   ├── list.d.ts
    │   │   │   ├── list.js
    │   │   │   ├── map-generator.js
    │   │   │   ├── no-work-result.d.ts
    │   │   │   ├── no-work-result.js
    │   │   │   ├── node.d.ts
    │   │   │   ├── node.js
    │   │   │   ├── parse.d.ts
    │   │   │   ├── parse.js
    │   │   │   ├── parser.js
    │   │   │   ├── postcss.d.mts
    │   │   │   ├── postcss.d.ts
    │   │   │   ├── postcss.js
    │   │   │   ├── postcss.mjs
    │   │   │   ├── previous-map.d.ts
    │   │   │   ├── previous-map.js
    │   │   │   ├── processor.d.ts
    │   │   │   ├── processor.js
    │   │   │   ├── result.d.ts
    │   │   │   ├── result.js
    │   │   │   ├── root.d.ts
    │   │   │   ├── root.js
    │   │   │   ├── rule.d.ts
    │   │   │   ├── rule.js
    │   │   │   ├── stringifier.d.ts
    │   │   │   ├── stringifier.js
    │   │   │   ├── stringify.d.ts
    │   │   │   ├── stringify.js
    │   │   │   ├── symbols.js
    │   │   │   ├── terminal-highlight.js
    │   │   │   ├── tokenize.js
    │   │   │   ├── warn-once.js
    │   │   │   ├── warning.d.ts
    │   │   │   └── warning.js
    │   │   └── package.json
    │   ├── proxy-addr
    │   │   ├── HISTORY.md
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── index.js
    │   │   └── package.json
    │   ├── qs
    │   │   ├── CHANGELOG.md
    │   │   ├── LICENSE.md
    │   │   ├── README.md
    │   │   ├── dist
    │   │   │   └── qs.js
    │   │   ├── eslint.config.mjs
    │   │   ├── lib
    │   │   │   ├── formats.js
    │   │   │   ├── index.js
    │   │   │   ├── parse.js
    │   │   │   ├── stringify.js
    │   │   │   └── utils.js
    │   │   ├── package.json
    │   │   └── test
    │   │       ├── empty-keys-cases.js
    │   │       ├── parse.js
    │   │       ├── stringify.js
    │   │       └── utils.js
    │   ├── range-parser
    │   │   ├── HISTORY.md
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── index.js
    │   │   └── package.json
    │   ├── raw-body
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── index.d.ts
    │   │   ├── index.js
    │   │   └── package.json
    │   ├── react
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── cjs
    │   │   │   ├── react-compiler-runtime.development.js
    │   │   │   ├── react-compiler-runtime.production.js
    │   │   │   ├── react-compiler-runtime.profiling.js
    │   │   │   ├── react-jsx-dev-runtime.development.js
    │   │   │   ├── react-jsx-dev-runtime.production.js
    │   │   │   ├── react-jsx-dev-runtime.profiling.js
    │   │   │   ├── react-jsx-dev-runtime.react-server.development.js
    │   │   │   ├── react-jsx-dev-runtime.react-server.production.js
    │   │   │   ├── react-jsx-runtime.development.js
    │   │   │   ├── react-jsx-runtime.production.js
    │   │   │   ├── react-jsx-runtime.profiling.js
    │   │   │   ├── react-jsx-runtime.react-server.development.js
    │   │   │   ├── react-jsx-runtime.react-server.production.js
    │   │   │   ├── react.development.js
    │   │   │   ├── react.production.js
    │   │   │   ├── react.react-server.development.js
    │   │   │   └── react.react-server.production.js
    │   │   ├── compiler-runtime.js
    │   │   ├── index.js
    │   │   ├── jsx-dev-runtime.js
    │   │   ├── jsx-dev-runtime.react-server.js
    │   │   ├── jsx-runtime.js
    │   │   ├── jsx-runtime.react-server.js
    │   │   ├── package.json
    │   │   └── react.react-server.js
    │   ├── react-dom
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── cjs
    │   │   │   ├── react-dom-client.development.js
    │   │   │   ├── react-dom-client.production.js
    │   │   │   ├── react-dom-profiling.development.js
    │   │   │   ├── react-dom-profiling.profiling.js
    │   │   │   ├── react-dom-server-legacy.browser.development.js
    │   │   │   ├── react-dom-server-legacy.browser.production.js
    │   │   │   ├── react-dom-server-legacy.node.development.js
    │   │   │   ├── react-dom-server-legacy.node.production.js
    │   │   │   ├── react-dom-server.browser.development.js
    │   │   │   ├── react-dom-server.browser.production.js
    │   │   │   ├── react-dom-server.bun.development.js
    │   │   │   ├── react-dom-server.bun.production.js
    │   │   │   ├── react-dom-server.edge.development.js
    │   │   │   ├── react-dom-server.edge.production.js
    │   │   │   ├── react-dom-server.node.development.js
    │   │   │   ├── react-dom-server.node.production.js
    │   │   │   ├── react-dom-test-utils.development.js
    │   │   │   ├── react-dom-test-utils.production.js
    │   │   │   ├── react-dom.development.js
    │   │   │   ├── react-dom.production.js
    │   │   │   ├── react-dom.react-server.development.js
    │   │   │   └── react-dom.react-server.production.js
    │   │   ├── client.js
    │   │   ├── client.react-server.js
    │   │   ├── index.js
    │   │   ├── package.json
    │   │   ├── profiling.js
    │   │   ├── profiling.react-server.js
    │   │   ├── react-dom.react-server.js
    │   │   ├── server.browser.js
    │   │   ├── server.bun.js
    │   │   ├── server.edge.js
    │   │   ├── server.js
    │   │   ├── server.node.js
    │   │   ├── server.react-server.js
    │   │   ├── static.browser.js
    │   │   ├── static.edge.js
    │   │   ├── static.js
    │   │   ├── static.node.js
    │   │   ├── static.react-server.js
    │   │   └── test-utils.js
    │   ├── resolve-pkg-maps
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── dist
    │   │   │   ├── index.cjs
    │   │   │   ├── index.d.cts
    │   │   │   ├── index.d.mts
    │   │   │   └── index.mjs
    │   │   └── package.json
    │   ├── rolldown
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── bin
    │   │   │   └── cli.mjs
    │   │   ├── dist
    │   │   │   ├── cli.d.mts
    │   │   │   ├── cli.mjs
    │   │   │   ├── config.d.mts
    │   │   │   ├── config.mjs
    │   │   │   ├── experimental-index.d.mts
    │   │   │   ├── experimental-index.mjs
    │   │   │   ├── experimental-runtime-types.d.ts
    │   │   │   ├── filter-index.d.mts
    │   │   │   ├── filter-index.mjs
    │   │   │   ├── get-log-filter.d.mts
    │   │   │   ├── get-log-filter.mjs
    │   │   │   ├── index.d.mts
    │   │   │   ├── index.mjs
    │   │   │   ├── parallel-plugin-worker.d.mts
    │   │   │   ├── parallel-plugin-worker.mjs
    │   │   │   ├── parallel-plugin.d.mts
    │   │   │   ├── parallel-plugin.mjs
    │   │   │   ├── parse-ast-index.d.mts
    │   │   │   ├── parse-ast-index.mjs
    │   │   │   ├── plugins-index.d.mts
    │   │   │   ├── plugins-index.mjs
    │   │   │   ├── shared
    │   │   │   │   ├── binding-DUEnSb0A.d.mts
    │   │   │   │   ├── binding-Rc5vBspi.mjs
    │   │   │   │   ├── bindingify-input-options-4E8MEYg4.mjs
    │   │   │   │   ├── constructors-ChVDbP6o.mjs
    │   │   │   │   ├── constructors-DYemMpPL.d.mts
    │   │   │   │   ├── define-config-DJOr6Iwt.mjs
    │   │   │   │   ├── define-config-DhJZwTRw.d.mts
    │   │   │   │   ├── error-DBGOT6sf.mjs
    │   │   │   │   ├── get-log-filter-semyr3Lj.d.mts
    │   │   │   │   ├── load-config-C9BtnuRk.mjs
    │   │   │   │   ├── logging-C6h4g8dA.d.mts
    │   │   │   │   ├── logs-D80CXhvg.mjs
    │   │   │   │   ├── misc-DJYbNKZX.mjs
    │   │   │   │   ├── normalize-string-or-regex-BzTP-qJS.mjs
    │   │   │   │   ├── parse-B30xMDQc.mjs
    │   │   │   │   ├── prompt-BYQIwEjg.mjs
    │   │   │   │   ├── resolve-tsconfig-BD5XUCWz.mjs
    │   │   │   │   ├── rolldown-CIfBsrjA.mjs
    │   │   │   │   ├── rolldown-build-hRnqgxyz.mjs
    │   │   │   │   ├── transform-Kz3D2LbX.d.mts
    │   │   │   │   └── watch-BDnUMWmc.mjs
    │   │   │   ├── utils-index.d.mts
    │   │   │   └── utils-index.mjs
    │   │   ├── node_modules
    │   │   │   └── @rolldown
    │   │   │       └── pluginutils
    │   │   │           ├── LICENSE
    │   │   │           ├── README.md
    │   │   │           ├── dist
    │   │   │           │   ├── filter
    │   │   │           │   │   ├── composable-filters.d.ts
    │   │   │           │   │   ├── composable-filters.js
    │   │   │           │   │   ├── filter-vite-plugins.d.ts
    │   │   │           │   │   ├── filter-vite-plugins.js
    │   │   │           │   │   ├── index.d.ts
    │   │   │           │   │   ├── index.js
    │   │   │           │   │   ├── simple-filters.d.ts
    │   │   │           │   │   └── simple-filters.js
    │   │   │           │   ├── index.d.ts
    │   │   │           │   ├── index.js
    │   │   │           │   ├── utils.d.ts
    │   │   │           │   └── utils.js
    │   │   │           └── package.json
    │   │   └── package.json
    │   ├── router
    │   │   ├── HISTORY.md
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── index.js
    │   │   ├── lib
    │   │   │   ├── layer.js
    │   │   │   └── route.js
    │   │   └── package.json
    │   ├── safer-buffer
    │   │   ├── LICENSE
    │   │   ├── Porting-Buffer.md
    │   │   ├── Readme.md
    │   │   ├── dangerous.js
    │   │   ├── package.json
    │   │   ├── safer.js
    │   │   └── tests.js
    │   ├── scheduler
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── cjs
    │   │   │   ├── scheduler-unstable_mock.development.js
    │   │   │   ├── scheduler-unstable_mock.production.js
    │   │   │   ├── scheduler-unstable_post_task.development.js
    │   │   │   ├── scheduler-unstable_post_task.production.js
    │   │   │   ├── scheduler.development.js
    │   │   │   ├── scheduler.native.development.js
    │   │   │   ├── scheduler.native.production.js
    │   │   │   └── scheduler.production.js
    │   │   ├── index.js
    │   │   ├── index.native.js
    │   │   ├── package.json
    │   │   ├── unstable_mock.js
    │   │   └── unstable_post_task.js
    │   ├── send
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── index.js
    │   │   └── package.json
    │   ├── serve-static
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── index.js
    │   │   └── package.json
    │   ├── setprototypeof
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── index.d.ts
    │   │   ├── index.js
    │   │   ├── package.json
    │   │   └── test
    │   │       └── index.js
    │   ├── side-channel
    │   │   ├── CHANGELOG.md
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── index.d.ts
    │   │   ├── index.js
    │   │   ├── package.json
    │   │   ├── test
    │   │   │   └── index.js
    │   │   └── tsconfig.json
    │   ├── side-channel-list
    │   │   ├── CHANGELOG.md
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── index.d.ts
    │   │   ├── index.js
    │   │   ├── list.d.ts
    │   │   ├── package.json
    │   │   ├── test
    │   │   │   └── index.js
    │   │   └── tsconfig.json
    │   ├── side-channel-map
    │   │   ├── CHANGELOG.md
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── index.d.ts
    │   │   ├── index.js
    │   │   ├── package.json
    │   │   ├── test
    │   │   │   └── index.js
    │   │   └── tsconfig.json
    │   ├── side-channel-weakmap
    │   │   ├── CHANGELOG.md
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── index.d.ts
    │   │   ├── index.js
    │   │   ├── package.json
    │   │   ├── test
    │   │   │   └── index.js
    │   │   └── tsconfig.json
    │   ├── source-map-js
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── lib
    │   │   │   ├── array-set.js
    │   │   │   ├── base64-vlq.js
    │   │   │   ├── base64.js
    │   │   │   ├── binary-search.js
    │   │   │   ├── mapping-list.js
    │   │   │   ├── quick-sort.js
    │   │   │   ├── source-map-consumer.d.ts
    │   │   │   ├── source-map-consumer.js
    │   │   │   ├── source-map-generator.d.ts
    │   │   │   ├── source-map-generator.js
    │   │   │   ├── source-node.d.ts
    │   │   │   ├── source-node.js
    │   │   │   └── util.js
    │   │   ├── package.json
    │   │   ├── source-map.d.ts
    │   │   └── source-map.js
    │   ├── statuses
    │   │   ├── HISTORY.md
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── codes.json
    │   │   ├── index.js
    │   │   └── package.json
    │   ├── tinyglobby
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── dist
    │   │   │   ├── index.cjs
    │   │   │   ├── index.d.cts
    │   │   │   ├── index.d.mts
    │   │   │   └── index.mjs
    │   │   └── package.json
    │   ├── toidentifier
    │   │   ├── HISTORY.md
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── index.js
    │   │   └── package.json
    │   ├── tsx
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── dist
    │   │   │   ├── cjs
    │   │   │   │   ├── api
    │   │   │   │   │   ├── index.cjs
    │   │   │   │   │   ├── index.d.cts
    │   │   │   │   │   ├── index.d.mts
    │   │   │   │   │   └── index.mjs
    │   │   │   │   ├── index.cjs
    │   │   │   │   └── index.mjs
    │   │   │   ├── cli.cjs
    │   │   │   ├── cli.mjs
    │   │   │   ├── client-BQVF1NaW.mjs
    │   │   │   ├── client-D6NvIMSC.cjs
    │   │   │   ├── esm
    │   │   │   │   ├── api
    │   │   │   │   │   ├── index.cjs
    │   │   │   │   │   ├── index.d.cts
    │   │   │   │   │   ├── index.d.mts
    │   │   │   │   │   └── index.mjs
    │   │   │   │   ├── index.cjs
    │   │   │   │   └── index.mjs
    │   │   │   ├── get-pipe-path-BHW2eJdv.mjs
    │   │   │   ├── get-pipe-path-BoR10qr8.cjs
    │   │   │   ├── index-7AaEi15b.mjs
    │   │   │   ├── index-BWFBUo6r.cjs
    │   │   │   ├── index-gbaejti9.mjs
    │   │   │   ├── index-gckBtVBf.cjs
    │   │   │   ├── lexer-DQCqS3nf.mjs
    │   │   │   ├── lexer-DgIbo0BU.cjs
    │   │   │   ├── loader.cjs
    │   │   │   ├── loader.mjs
    │   │   │   ├── node-features-_8ZFwP_x.mjs
    │   │   │   ├── node-features-roYmp9jK.cjs
    │   │   │   ├── package-CeBgXWuR.mjs
    │   │   │   ├── package-Dxt5kIHw.cjs
    │   │   │   ├── patch-repl.cjs
    │   │   │   ├── patch-repl.mjs
    │   │   │   ├── preflight.cjs
    │   │   │   ├── preflight.mjs
    │   │   │   ├── register-2sWVXuRQ.cjs
    │   │   │   ├── register-B7jrtLTO.mjs
    │   │   │   ├── register-CFH5oNdT.mjs
    │   │   │   ├── register-D46fvsV_.cjs
    │   │   │   ├── repl.cjs
    │   │   │   ├── repl.mjs
    │   │   │   ├── require-D4F1Lv60.cjs
    │   │   │   ├── require-DQxpCAr4.mjs
    │   │   │   ├── suppress-warnings.cjs
    │   │   │   ├── suppress-warnings.mjs
    │   │   │   ├── temporary-directory-B83uKxJF.cjs
    │   │   │   ├── temporary-directory-CwHp0_NW.mjs
    │   │   │   └── types-Cxp8y2TL.d.ts
    │   │   └── package.json
    │   ├── type-is
    │   │   ├── HISTORY.md
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── index.js
    │   │   └── package.json
    │   ├── typescript
    │   │   ├── LICENSE.txt
    │   │   ├── README.md
    │   │   ├── SECURITY.md
    │   │   ├── ThirdPartyNoticeText.txt
    │   │   ├── bin
    │   │   │   ├── tsc
    │   │   │   └── tsserver
    │   │   ├── lib
    │   │   │   ├── _tsc.js
    │   │   │   ├── _tsserver.js
    │   │   │   ├── _typingsInstaller.js
    │   │   │   ├── cs
    │   │   │   │   └── diagnosticMessages.generated.json
    │   │   │   ├── de
    │   │   │   │   └── diagnosticMessages.generated.json
    │   │   │   ├── es
    │   │   │   │   └── diagnosticMessages.generated.json
    │   │   │   ├── fr
    │   │   │   │   └── diagnosticMessages.generated.json
    │   │   │   ├── it
    │   │   │   │   └── diagnosticMessages.generated.json
    │   │   │   ├── ja
    │   │   │   │   └── diagnosticMessages.generated.json
    │   │   │   ├── ko
    │   │   │   │   └── diagnosticMessages.generated.json
    │   │   │   ├── lib.d.ts
    │   │   │   ├── lib.decorators.d.ts
    │   │   │   ├── lib.decorators.legacy.d.ts
    │   │   │   ├── lib.dom.asynciterable.d.ts
    │   │   │   ├── lib.dom.d.ts
    │   │   │   ├── lib.dom.iterable.d.ts
    │   │   │   ├── lib.es2015.collection.d.ts
    │   │   │   ├── lib.es2015.core.d.ts
    │   │   │   ├── lib.es2015.d.ts
    │   │   │   ├── lib.es2015.generator.d.ts
    │   │   │   ├── lib.es2015.iterable.d.ts
    │   │   │   ├── lib.es2015.promise.d.ts
    │   │   │   ├── lib.es2015.proxy.d.ts
    │   │   │   ├── lib.es2015.reflect.d.ts
    │   │   │   ├── lib.es2015.symbol.d.ts
    │   │   │   ├── lib.es2015.symbol.wellknown.d.ts
    │   │   │   ├── lib.es2016.array.include.d.ts
    │   │   │   ├── lib.es2016.d.ts
    │   │   │   ├── lib.es2016.full.d.ts
    │   │   │   ├── lib.es2016.intl.d.ts
    │   │   │   ├── lib.es2017.arraybuffer.d.ts
    │   │   │   ├── lib.es2017.d.ts
    │   │   │   ├── lib.es2017.date.d.ts
    │   │   │   ├── lib.es2017.full.d.ts
    │   │   │   ├── lib.es2017.intl.d.ts
    │   │   │   ├── lib.es2017.object.d.ts
    │   │   │   ├── lib.es2017.sharedmemory.d.ts
    │   │   │   ├── lib.es2017.string.d.ts
    │   │   │   ├── lib.es2017.typedarrays.d.ts
    │   │   │   ├── lib.es2018.asyncgenerator.d.ts
    │   │   │   ├── lib.es2018.asynciterable.d.ts
    │   │   │   ├── lib.es2018.d.ts
    │   │   │   ├── lib.es2018.full.d.ts
    │   │   │   ├── lib.es2018.intl.d.ts
    │   │   │   ├── lib.es2018.promise.d.ts
    │   │   │   ├── lib.es2018.regexp.d.ts
    │   │   │   ├── lib.es2019.array.d.ts
    │   │   │   ├── lib.es2019.d.ts
    │   │   │   ├── lib.es2019.full.d.ts
    │   │   │   ├── lib.es2019.intl.d.ts
    │   │   │   ├── lib.es2019.object.d.ts
    │   │   │   ├── lib.es2019.string.d.ts
    │   │   │   ├── lib.es2019.symbol.d.ts
    │   │   │   ├── lib.es2020.bigint.d.ts
    │   │   │   ├── lib.es2020.d.ts
    │   │   │   ├── lib.es2020.date.d.ts
    │   │   │   ├── lib.es2020.full.d.ts
    │   │   │   ├── lib.es2020.intl.d.ts
    │   │   │   ├── lib.es2020.number.d.ts
    │   │   │   ├── lib.es2020.promise.d.ts
    │   │   │   ├── lib.es2020.sharedmemory.d.ts
    │   │   │   ├── lib.es2020.string.d.ts
    │   │   │   ├── lib.es2020.symbol.wellknown.d.ts
    │   │   │   ├── lib.es2021.d.ts
    │   │   │   ├── lib.es2021.full.d.ts
    │   │   │   ├── lib.es2021.intl.d.ts
    │   │   │   ├── lib.es2021.promise.d.ts
    │   │   │   ├── lib.es2021.string.d.ts
    │   │   │   ├── lib.es2021.weakref.d.ts
    │   │   │   ├── lib.es2022.array.d.ts
    │   │   │   ├── lib.es2022.d.ts
    │   │   │   ├── lib.es2022.error.d.ts
    │   │   │   ├── lib.es2022.full.d.ts
    │   │   │   ├── lib.es2022.intl.d.ts
    │   │   │   ├── lib.es2022.object.d.ts
    │   │   │   ├── lib.es2022.regexp.d.ts
    │   │   │   ├── lib.es2022.string.d.ts
    │   │   │   ├── lib.es2023.array.d.ts
    │   │   │   ├── lib.es2023.collection.d.ts
    │   │   │   ├── lib.es2023.d.ts
    │   │   │   ├── lib.es2023.full.d.ts
    │   │   │   ├── lib.es2023.intl.d.ts
    │   │   │   ├── lib.es2024.arraybuffer.d.ts
    │   │   │   ├── lib.es2024.collection.d.ts
    │   │   │   ├── lib.es2024.d.ts
    │   │   │   ├── lib.es2024.full.d.ts
    │   │   │   ├── lib.es2024.object.d.ts
    │   │   │   ├── lib.es2024.promise.d.ts
    │   │   │   ├── lib.es2024.regexp.d.ts
    │   │   │   ├── lib.es2024.sharedmemory.d.ts
    │   │   │   ├── lib.es2024.string.d.ts
    │   │   │   ├── lib.es2025.collection.d.ts
    │   │   │   ├── lib.es2025.d.ts
    │   │   │   ├── lib.es2025.float16.d.ts
    │   │   │   ├── lib.es2025.full.d.ts
    │   │   │   ├── lib.es2025.intl.d.ts
    │   │   │   ├── lib.es2025.iterator.d.ts
    │   │   │   ├── lib.es2025.promise.d.ts
    │   │   │   ├── lib.es2025.regexp.d.ts
    │   │   │   ├── lib.es5.d.ts
    │   │   │   ├── lib.es6.d.ts
    │   │   │   ├── lib.esnext.array.d.ts
    │   │   │   ├── lib.esnext.collection.d.ts
    │   │   │   ├── lib.esnext.d.ts
    │   │   │   ├── lib.esnext.date.d.ts
    │   │   │   ├── lib.esnext.decorators.d.ts
    │   │   │   ├── lib.esnext.disposable.d.ts
    │   │   │   ├── lib.esnext.error.d.ts
    │   │   │   ├── lib.esnext.full.d.ts
    │   │   │   ├── lib.esnext.intl.d.ts
    │   │   │   ├── lib.esnext.sharedmemory.d.ts
    │   │   │   ├── lib.esnext.temporal.d.ts
    │   │   │   ├── lib.esnext.typedarrays.d.ts
    │   │   │   ├── lib.scripthost.d.ts
    │   │   │   ├── lib.webworker.asynciterable.d.ts
    │   │   │   ├── lib.webworker.d.ts
    │   │   │   ├── lib.webworker.importscripts.d.ts
    │   │   │   ├── lib.webworker.iterable.d.ts
    │   │   │   ├── pl
    │   │   │   │   └── diagnosticMessages.generated.json
    │   │   │   ├── pt-br
    │   │   │   │   └── diagnosticMessages.generated.json
    │   │   │   ├── ru
    │   │   │   │   └── diagnosticMessages.generated.json
    │   │   │   ├── tr
    │   │   │   │   └── diagnosticMessages.generated.json
    │   │   │   ├── tsc.js
    │   │   │   ├── tsserver.js
    │   │   │   ├── tsserverlibrary.d.ts
    │   │   │   ├── tsserverlibrary.js
    │   │   │   ├── typesMap.json
    │   │   │   ├── typescript.d.ts
    │   │   │   ├── typescript.js
    │   │   │   ├── typingsInstaller.js
    │   │   │   ├── watchGuard.js
    │   │   │   ├── zh-cn
    │   │   │   │   └── diagnosticMessages.generated.json
    │   │   │   └── zh-tw
    │   │   │       └── diagnosticMessages.generated.json
    │   │   └── package.json
    │   ├── unpipe
    │   │   ├── HISTORY.md
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── index.js
    │   │   └── package.json
    │   ├── vary
    │   │   ├── HISTORY.md
    │   │   ├── LICENSE
    │   │   ├── README.md
    │   │   ├── index.js
    │   │   └── package.json
    │   ├── vite
    │   │   ├── LICENSE.md
    │   │   ├── README.md
    │   │   ├── bin
    │   │   │   ├── openChrome.js
    │   │   │   └── vite.js
    │   │   ├── client.d.ts
    │   │   ├── dist
    │   │   │   ├── client
    │   │   │   │   ├── client.mjs
    │   │   │   │   └── env.mjs
    │   │   │   └── node
    │   │   │       ├── chunks
    │   │   │       │   ├── build.js
    │   │   │       │   ├── build2.js
    │   │   │       │   ├── chunk.js
    │   │   │       │   ├── config.js
    │   │   │       │   ├── dist.js
    │   │   │       │   ├── lib.js
    │   │   │       │   ├── logger.js
    │   │   │       │   ├── moduleRunnerTransport.d.ts
    │   │   │       │   ├── node.js
    │   │   │       │   ├── optimizer.js
    │   │   │       │   ├── postcss-import.js
    │   │   │       │   ├── preview.js
    │   │   │       │   └── server.js
    │   │   │       ├── cli.js
    │   │   │       ├── index.d.ts
    │   │   │       ├── index.js
    │   │   │       ├── internal.d.ts
    │   │   │       ├── internal.js
    │   │   │       ├── module-runner.d.ts
    │   │   │       └── module-runner.js
    │   │   ├── misc
    │   │   │   ├── false.js
    │   │   │   └── true.js
    │   │   ├── package.json
    │   │   └── types
    │   │       ├── customEvent.d.ts
    │   │       ├── hmrPayload.d.ts
    │   │       ├── hot.d.ts
    │   │       ├── import-meta.d.ts
    │   │       ├── importGlob.d.ts
    │   │       ├── importMeta.d.ts
    │   │       ├── internal
    │   │       │   ├── cssPreprocessorOptions.d.ts
    │   │       │   ├── esbuildOptions.d.ts
    │   │       │   ├── lightningcssOptions.d.ts
    │   │       │   ├── rollupTypeCompat.d.ts
    │   │       │   └── terserOptions.d.ts
    │   │       └── metadata.d.ts
    │   └── wrappy
    │       ├── LICENSE
    │       ├── README.md
    │       ├── package.json
    │       └── wrappy.js
    ├── package-lock.json
    ├── package.json
    ├── server.js
    └── server.log

346 directories, 2010 files
thien@iMac natt-os_ver2goldmaster % 
thien@iMac natt-os_ver2goldmaster % 
thien@iMac natt-os_ver2goldmaster % 
thien@iMac natt-os_ver2goldmaster % 
thien@iMac natt-os_ver2goldmaster % 
thien@iMac natt-os_ver2goldmaster % 
thien@iMac natt-os_ver2goldmaster % 
thien@iMac natt-os_ver2goldmaster % 
thien@iMac natt-os_ver2goldmaster % 
thien@iMac natt-os_ver2goldmaster % 
thien@iMac natt-os_ver2goldmaster % 
thien@iMac natt-os_ver2goldmaster % 
thien@iMac natt-os_ver2goldmaster % 
thien@iMac natt-os_ver2goldmaster % tree
.
├── database
│   └── ctytam
│       ├── BCTC mẫu
│       │   └── BCTCTH_C03_TCT.XSD
│       ├── bank
│       │   └── saoketk1112.xlsx
│       ├── data kinh doanh
│       ├── data sản xuất
│       │   └── nấu-bụi-vàng.json
│       ├── dieutra
│       │   ├── BAO_CAO_DIEU_TRA_SX_TAM_LUXURY (1).pdf
│       │   └── BAO_CAO_DIEU_TRA_SX_TAM_LUXURY.docx
│       └── khoivanhanh
│           └── soluong
│               ├── bomaycty.csv
│               ├── danhsach_maudon_tacvu.csv
│               ├── danhsach_nhansu_danghi.csv
│               ├── danhsachnhansu.csv
│               ├── dulieuchamcong.csv
│               ├── phongluong.csv
│               ├── quychuan_thangluong.csv
│               ├── quytaccty.csv
│               └── thangluong.csv
└── nattos-server
    ├── app Tâm luxury
    │   ├── analytics-ingestion-service
    │   │   ├── application
    │   │   │   └── ingest-sales-event.ts
    │   │   └── domain
    │   │       └── projections
    │   │           └── daily-revenue.projection.ts
    │   ├── app.tsx
    │   ├── component-contracts.json
    │   ├── components
    │   │   ├── adminconfighub.tsx
    │   │   ├── advancedanalytics.tsx
    │   │   ├── aiavatar.tsx
    │   │   ├── apiportal.tsx
    │   │   ├── app.tsx
    │   │   ├── approval
    │   │   │   └── approvaldashboard.tsx
    │   │   ├── appshell.tsx
    │   │   ├── audittrailmodule.tsx
    │   │   ├── bankingprocessor.tsx
    │   │   ├── blueprintwizard.tsx
    │   │   ├── calibration
    │   │   │   └── calibrationwizard.tsx
    │   │   ├── chatconsultant.tsx
    │   │   ├── collaborationrooms.tsx
    │   │   ├── common
    │   │   │   ├── ButterflyProtocol.tsx
    │   │   │   ├── NattMedal.tsx
    │   │   │   ├── errorboundary.tsx
    │   │   │   └── loadingspinner.tsx
    │   │   ├── complianceportal.tsx
    │   │   ├── customizationrequest.tsx
    │   │   ├── customsintelligence.tsx
    │   │   ├── dailyreportmodule.tsx
    │   │   ├── dashboard.tsx
    │   │   ├── dataanalytics.tsx
    │   │   ├── dataarchivevault.tsx
    │   │   ├── datasyncengine.tsx
    │   │   ├── devportal.tsx
    │   │   ├── dynamicmodulerenderer.tsx
    │   │   ├── enterprisearchitecture.tsx
    │   │   ├── errorboundary.tsx
    │   │   ├── filterpanel.tsx
    │   │   ├── financeaudit.tsx
    │   │   ├── financial
    │   │   │   └── financialdashboard.tsx
    │   │   ├── governancemodule.tsx
    │   │   ├── governanceworkspace.tsx
    │   │   ├── hrcompliance.tsx
    │   │   ├── hrmanagement.tsx
    │   │   ├── krisemailhub.tsx
    │   │   ├── layout.tsx
    │   │   ├── learninghub.tsx
    │   │   ├── livevoice.tsx
    │   │   ├── masterdashboard.tsx
    │   │   ├── notificationhub.tsx
    │   │   ├── notificationportal.tsx
    │   │   ├── omegaprocessor.tsx
    │   │   ├── operationsterminal.tsx
    │   │   ├── paymenthub.tsx
    │   │   ├── personalsphere.tsx
    │   │   ├── productcard.tsx
    │   │   ├── productcatalog.tsx
    │   │   ├── productdetailmodal.tsx
    │   │   ├── productionmanager.tsx
    │   │   ├── productionsalesflowview.tsx
    │   │   ├── productionwallboard.tsx
    │   │   ├── quantumfloworchestrator.tsx
    │   │   ├── quantumpulse.tsx
    │   │   ├── quickhelp.tsx
    │   │   ├── rbacmanager.tsx
    │   │   ├── rfmanalysis.tsx
    │   │   ├── salesarchitectureview.tsx
    │   │   ├── salescrm.tsx
    │   │   ├── salestaxmodule.tsx
    │   │   ├── salesterminal.tsx
    │   │   ├── securityoverlay.tsx
    │   │   ├── sellerterminal.tsx
    │   │   ├── sidebar.tsx
    │   │   ├── smartlinkmapper.tsx
    │   │   ├── supplierclassificationpanel.tsx
    │   │   ├── systemmonitor.tsx
    │   │   ├── systemnavigator.tsx
    │   │   ├── systemticker.tsx
    │   │   ├── taxreportinghub.tsx
    │   │   ├── technicaldocs.tsx
    │   │   ├── thiencommandcenter.tsx
    │   │   ├── unifiedreportinghub.tsx
    │   │   └── warehousemanagement.tsx
    │   ├── constants.ts
    │   ├── contexts
    │   │   ├── accountingcontext.tsx
    │   │   └── mappingcontext.tsx
    │   ├── core
    │   │   ├── dictionary
    │   │   │   └── services
    │   │   │       └── dictionaryservice.ts
    │   │   ├── ingestion
    │   │   │   └── ingestionservice.ts
    │   │   ├── nauion
    │   │   │   └── nauion-engine.ts
    │   │   ├── processing
    │   │   │   └── ai
    │   │   │       └── aicoreprocessor.ts
    │   │   ├── signals
    │   │   │   └── types.ts
    │   │   └── smartlinkengine.ts
    │   ├── css
    │   │   ├── nattos-fx-advanced.css
    │   │   └── nattos-glass.css
    │   ├── finance-service
    │   │   ├── application
    │   │   │   └── handlers
    │   │   │       └── invoice-handler.ts
    │   │   └── infrastructure
    │   │       └── messaging
    │   │           ├── dead-letter.handler.ts
    │   │           └── retry.policy.ts
    │   ├── hooks
    │   │   ├── useauthority.ts
    │   │   ├── userealtimesync.ts
    │   │   ├── usesmartmapping.ts
    │   │   └── usesupplierclassification.ts
    │   ├── index.css
    │   ├── index.html
    │   ├── index.tsx
    │   ├── layerold
    │   │   ├── attendance.html
    │   │   ├── chat-rooms.html
    │   │   ├── daily-work-app.html
    │   │   ├── hr-admin.html
    │   │   ├── hr-manager.html
    │   │   ├── kris-email-hub.html
    │   │   ├── ktt-approval.html
    │   │   ├── loss-thresholds.html
    │   │   ├── master-dashboard.html
    │   │   ├── operations-terminal.html
    │   │   ├── order-flow.html
    │   │   ├── personal-profile-v2.html
    │   │   ├── personal-profile.html
    │   │   ├── pricing-engine.html
    │   │   ├── production-wallboard.html
    │   │   ├── showroom-sales.html
    │   │   ├── surveillance.html
    │   │   ├── tamluxury-v2.html
    │   │   ├── tamluxury-v3.html
    │   │   ├── tamluxury-v4.html
    │   │   ├── warehouse-full.html
    │   │   └── warehouse-ops.html
    │   ├── manifestations
    │   │   └── overlays
    │   │       └── quantumcontainer.tsx
    │   ├── nattos-chromatic.js
    │   ├── nattos-contract.json
    │   ├── nattos-data.js
    │   ├── nattos-doc-engine.js
    │   ├── nattos-eod-engine.js
    │   ├── nattos-fx-advanced.css
    │   ├── nattos-fx.js
    │   ├── nattos-glass.css
    │   ├── nattos-loss-thresholds.js
    │   ├── nattos-payment.js
    │   ├── nattos-responsive.css
    │   ├── nattos-sandbox.css
    │   ├── nattos-sandbox.js
    │   ├── nattos-server.cjs
    │   ├── nattos-smart-get-data.js
    │   ├── nattos-tokens.css
    │   ├── nattos-ui-theme.css
    │   ├── nauion
    │   │   └── ui-runtime.tsx
    │   ├── neuro-link
    │   │   └── context
    │   │       └── quantumuicontext.tsx
    │   ├── node_modules
    │   │   ├── @oxc-project
    │   │   │   └── types
    │   │   │       ├── LICENSE
    │   │   │       ├── README.md
    │   │   │       ├── package.json
    │   │   │       └── types.d.ts
    │   │   ├── @rolldown
    │   │   │   ├── binding-darwin-x64
    │   │   │   │   ├── README.md
    │   │   │   │   ├── package.json
    │   │   │   │   └── rolldown-binding.darwin-x64.node
    │   │   │   └── pluginutils
    │   │   │       ├── LICENSE
    │   │   │       ├── README.md
    │   │   │       ├── dist
    │   │   │       │   ├── filter
    │   │   │       │   │   ├── composable-filters.d.ts
    │   │   │       │   │   ├── composable-filters.js
    │   │   │       │   │   ├── filter-vite-plugins.d.ts
    │   │   │       │   │   ├── filter-vite-plugins.js
    │   │   │       │   │   ├── index.d.ts
    │   │   │       │   │   ├── index.js
    │   │   │       │   │   ├── simple-filters.d.ts
    │   │   │       │   │   └── simple-filters.js
    │   │   │       │   ├── index.d.ts
    │   │   │       │   ├── index.js
    │   │   │       │   ├── utils.d.ts
    │   │   │       │   └── utils.js
    │   │   │       └── package.json
    │   │   ├── @types
    │   │   │   ├── react
    │   │   │   │   ├── LICENSE
    │   │   │   │   ├── README.md
    │   │   │   │   ├── canary.d.ts
    │   │   │   │   ├── compiler-runtime.d.ts
    │   │   │   │   ├── experimental.d.ts
    │   │   │   │   ├── global.d.ts
    │   │   │   │   ├── index.d.ts
    │   │   │   │   ├── jsx-dev-runtime.d.ts
    │   │   │   │   ├── jsx-runtime.d.ts
    │   │   │   │   ├── package.json
    │   │   │   │   └── ts5.0
    │   │   │   │       ├── canary.d.ts
    │   │   │   │       ├── experimental.d.ts
    │   │   │   │       ├── global.d.ts
    │   │   │   │       ├── index.d.ts
    │   │   │   │       ├── jsx-dev-runtime.d.ts
    │   │   │   │       └── jsx-runtime.d.ts
    │   │   │   └── react-dom
    │   │   │       ├── LICENSE
    │   │   │       ├── README.md
    │   │   │       ├── canary.d.ts
    │   │   │       ├── client.d.ts
    │   │   │       ├── experimental.d.ts
    │   │   │       ├── index.d.ts
    │   │   │       ├── package.json
    │   │   │       ├── server.browser.d.ts
    │   │   │       ├── server.bun.d.ts
    │   │   │       ├── server.d.ts
    │   │   │       ├── server.edge.d.ts
    │   │   │       ├── server.node.d.ts
    │   │   │       ├── static.browser.d.ts
    │   │   │       ├── static.d.ts
    │   │   │       ├── static.edge.d.ts
    │   │   │       ├── static.node.d.ts
    │   │   │       └── test-utils
    │   │   │           └── index.d.ts
    │   │   ├── @vitejs
    │   │   │   └── plugin-react
    │   │   │       ├── LICENSE
    │   │   │       ├── README.md
    │   │   │       ├── dist
    │   │   │       │   ├── index.d.ts
    │   │   │       │   ├── index.js
    │   │   │       │   └── refresh-runtime.js
    │   │   │       ├── package.json
    │   │   │       └── types
    │   │   │           ├── optionalTypes.d.ts
    │   │   │           └── preamble.d.ts
    │   │   ├── csstype
    │   │   │   ├── LICENSE
    │   │   │   ├── README.md
    │   │   │   ├── index.d.ts
    │   │   │   ├── index.js.flow
    │   │   │   └── package.json
    │   │   ├── detect-libc
    │   │   │   ├── LICENSE
    │   │   │   ├── README.md
    │   │   │   ├── index.d.ts
    │   │   │   ├── lib
    │   │   │   │   ├── detect-libc.js
    │   │   │   │   ├── elf.js
    │   │   │   │   ├── filesystem.js
    │   │   │   │   └── process.js
    │   │   │   └── package.json
    │   │   ├── fdir
    │   │   │   ├── LICENSE
    │   │   │   ├── README.md
    │   │   │   ├── dist
    │   │   │   │   ├── index.cjs
    │   │   │   │   ├── index.d.cts
    │   │   │   │   ├── index.d.mts
    │   │   │   │   └── index.mjs
    │   │   │   └── package.json
    │   │   ├── fsevents
    │   │   │   ├── LICENSE
    │   │   │   ├── README.md
    │   │   │   ├── fsevents.d.ts
    │   │   │   ├── fsevents.js
    │   │   │   ├── fsevents.node
    │   │   │   └── package.json
    │   │   ├── lightningcss
    │   │   │   ├── LICENSE
    │   │   │   ├── README.md
    │   │   │   ├── node
    │   │   │   │   ├── ast.d.ts
    │   │   │   │   ├── ast.js.flow
    │   │   │   │   ├── browserslistToTargets.js
    │   │   │   │   ├── composeVisitors.js
    │   │   │   │   ├── flags.js
    │   │   │   │   ├── index.d.ts
    │   │   │   │   ├── index.js
    │   │   │   │   ├── index.js.flow
    │   │   │   │   ├── index.mjs
    │   │   │   │   ├── targets.d.ts
    │   │   │   │   └── targets.js.flow
    │   │   │   └── package.json
    │   │   ├── lightningcss-darwin-x64
    │   │   │   ├── LICENSE
    │   │   │   ├── README.md
    │   │   │   ├── lightningcss.darwin-x64.node
    │   │   │   └── package.json
    │   │   ├── nanoid
    │   │   │   ├── LICENSE
    │   │   │   ├── README.md
    │   │   │   ├── async
    │   │   │   │   ├── index.browser.cjs
    │   │   │   │   ├── index.browser.js
    │   │   │   │   ├── index.cjs
    │   │   │   │   ├── index.d.ts
    │   │   │   │   ├── index.js
    │   │   │   │   ├── index.native.js
    │   │   │   │   └── package.json
    │   │   │   ├── bin
    │   │   │   │   └── nanoid.cjs
    │   │   │   ├── index.browser.cjs
    │   │   │   ├── index.browser.js
    │   │   │   ├── index.cjs
    │   │   │   ├── index.d.cts
    │   │   │   ├── index.d.ts
    │   │   │   ├── index.js
    │   │   │   ├── nanoid.js
    │   │   │   ├── non-secure
    │   │   │   │   ├── index.cjs
    │   │   │   │   ├── index.d.ts
    │   │   │   │   ├── index.js
    │   │   │   │   └── package.json
    │   │   │   ├── package.json
    │   │   │   └── url-alphabet
    │   │   │       ├── index.cjs
    │   │   │       ├── index.js
    │   │   │       └── package.json
    │   │   ├── picocolors
    │   │   │   ├── LICENSE
    │   │   │   ├── README.md
    │   │   │   ├── package.json
    │   │   │   ├── picocolors.browser.js
    │   │   │   ├── picocolors.d.ts
    │   │   │   ├── picocolors.js
    │   │   │   └── types.d.ts
    │   │   ├── picomatch
    │   │   │   ├── LICENSE
    │   │   │   ├── README.md
    │   │   │   ├── index.js
    │   │   │   ├── lib
    │   │   │   │   ├── constants.js
    │   │   │   │   ├── parse.js
    │   │   │   │   ├── picomatch.js
    │   │   │   │   ├── scan.js
    │   │   │   │   └── utils.js
    │   │   │   ├── package.json
    │   │   │   └── posix.js
    │   │   ├── postcss
    │   │   │   ├── LICENSE
    │   │   │   ├── README.md
    │   │   │   ├── lib
    │   │   │   │   ├── at-rule.d.ts
    │   │   │   │   ├── at-rule.js
    │   │   │   │   ├── comment.d.ts
    │   │   │   │   ├── comment.js
    │   │   │   │   ├── container.d.ts
    │   │   │   │   ├── container.js
    │   │   │   │   ├── css-syntax-error.d.ts
    │   │   │   │   ├── css-syntax-error.js
    │   │   │   │   ├── declaration.d.ts
    │   │   │   │   ├── declaration.js
    │   │   │   │   ├── document.d.ts
    │   │   │   │   ├── document.js
    │   │   │   │   ├── fromJSON.d.ts
    │   │   │   │   ├── fromJSON.js
    │   │   │   │   ├── input.d.ts
    │   │   │   │   ├── input.js
    │   │   │   │   ├── lazy-result.d.ts
    │   │   │   │   ├── lazy-result.js
    │   │   │   │   ├── list.d.ts
    │   │   │   │   ├── list.js
    │   │   │   │   ├── map-generator.js
    │   │   │   │   ├── no-work-result.d.ts
    │   │   │   │   ├── no-work-result.js
    │   │   │   │   ├── node.d.ts
    │   │   │   │   ├── node.js
    │   │   │   │   ├── parse.d.ts
    │   │   │   │   ├── parse.js
    │   │   │   │   ├── parser.js
    │   │   │   │   ├── postcss.d.mts
    │   │   │   │   ├── postcss.d.ts
    │   │   │   │   ├── postcss.js
    │   │   │   │   ├── postcss.mjs
    │   │   │   │   ├── previous-map.d.ts
    │   │   │   │   ├── previous-map.js
    │   │   │   │   ├── processor.d.ts
    │   │   │   │   ├── processor.js
    │   │   │   │   ├── result.d.ts
    │   │   │   │   ├── result.js
    │   │   │   │   ├── root.d.ts
    │   │   │   │   ├── root.js
    │   │   │   │   ├── rule.d.ts
    │   │   │   │   ├── rule.js
    │   │   │   │   ├── stringifier.d.ts
    │   │   │   │   ├── stringifier.js
    │   │   │   │   ├── stringify.d.ts
    │   │   │   │   ├── stringify.js
    │   │   │   │   ├── symbols.js
    │   │   │   │   ├── terminal-highlight.js
    │   │   │   │   ├── tokenize.js
    │   │   │   │   ├── warn-once.js
    │   │   │   │   ├── warning.d.ts
    │   │   │   │   └── warning.js
    │   │   │   └── package.json
    │   │   ├── react
    │   │   │   ├── LICENSE
    │   │   │   ├── README.md
    │   │   │   ├── cjs
    │   │   │   │   ├── react-compiler-runtime.development.js
    │   │   │   │   ├── react-compiler-runtime.production.js
    │   │   │   │   ├── react-compiler-runtime.profiling.js
    │   │   │   │   ├── react-jsx-dev-runtime.development.js
    │   │   │   │   ├── react-jsx-dev-runtime.production.js
    │   │   │   │   ├── react-jsx-dev-runtime.profiling.js
    │   │   │   │   ├── react-jsx-dev-runtime.react-server.development.js
    │   │   │   │   ├── react-jsx-dev-runtime.react-server.production.js
    │   │   │   │   ├── react-jsx-runtime.development.js
    │   │   │   │   ├── react-jsx-runtime.production.js
    │   │   │   │   ├── react-jsx-runtime.profiling.js
    │   │   │   │   ├── react-jsx-runtime.react-server.development.js
    │   │   │   │   ├── react-jsx-runtime.react-server.production.js
    │   │   │   │   ├── react.development.js
    │   │   │   │   ├── react.production.js
    │   │   │   │   ├── react.react-server.development.js
    │   │   │   │   └── react.react-server.production.js
    │   │   │   ├── compiler-runtime.js
    │   │   │   ├── index.js
    │   │   │   ├── jsx-dev-runtime.js
    │   │   │   ├── jsx-dev-runtime.react-server.js
    │   │   │   ├── jsx-runtime.js
    │   │   │   ├── jsx-runtime.react-server.js
    │   │   │   ├── package.json
    │   │   │   └── react.react-server.js
    │   │   ├── react-dom
    │   │   │   ├── LICENSE
    │   │   │   ├── README.md
    │   │   │   ├── cjs
    │   │   │   │   ├── react-dom-client.development.js
    │   │   │   │   ├── react-dom-client.production.js
    │   │   │   │   ├── react-dom-profiling.development.js
    │   │   │   │   ├── react-dom-profiling.profiling.js
    │   │   │   │   ├── react-dom-server-legacy.browser.development.js
    │   │   │   │   ├── react-dom-server-legacy.browser.production.js
    │   │   │   │   ├── react-dom-server-legacy.node.development.js
    │   │   │   │   ├── react-dom-server-legacy.node.production.js
    │   │   │   │   ├── react-dom-server.browser.development.js
    │   │   │   │   ├── react-dom-server.browser.production.js
    │   │   │   │   ├── react-dom-server.bun.development.js
    │   │   │   │   ├── react-dom-server.bun.production.js
    │   │   │   │   ├── react-dom-server.edge.development.js
    │   │   │   │   ├── react-dom-server.edge.production.js
    │   │   │   │   ├── react-dom-server.node.development.js
    │   │   │   │   ├── react-dom-server.node.production.js
    │   │   │   │   ├── react-dom-test-utils.development.js
    │   │   │   │   ├── react-dom-test-utils.production.js
    │   │   │   │   ├── react-dom.development.js
    │   │   │   │   ├── react-dom.production.js
    │   │   │   │   ├── react-dom.react-server.development.js
    │   │   │   │   └── react-dom.react-server.production.js
    │   │   │   ├── client.js
    │   │   │   ├── client.react-server.js
    │   │   │   ├── index.js
    │   │   │   ├── package.json
    │   │   │   ├── profiling.js
    │   │   │   ├── profiling.react-server.js
    │   │   │   ├── react-dom.react-server.js
    │   │   │   ├── server.browser.js
    │   │   │   ├── server.bun.js
    │   │   │   ├── server.edge.js
    │   │   │   ├── server.js
    │   │   │   ├── server.node.js
    │   │   │   ├── server.react-server.js
    │   │   │   ├── static.browser.js
    │   │   │   ├── static.edge.js
    │   │   │   ├── static.js
    │   │   │   ├── static.node.js
    │   │   │   ├── static.react-server.js
    │   │   │   └── test-utils.js
    │   │   ├── rolldown
    │   │   │   ├── LICENSE
    │   │   │   ├── README.md
    │   │   │   ├── bin
    │   │   │   │   └── cli.mjs
    │   │   │   ├── dist
    │   │   │   │   ├── cli.d.mts
    │   │   │   │   ├── cli.mjs
    │   │   │   │   ├── config.d.mts
    │   │   │   │   ├── config.mjs
    │   │   │   │   ├── experimental-index.d.mts
    │   │   │   │   ├── experimental-index.mjs
    │   │   │   │   ├── experimental-runtime-types.d.ts
    │   │   │   │   ├── filter-index.d.mts
    │   │   │   │   ├── filter-index.mjs
    │   │   │   │   ├── get-log-filter.d.mts
    │   │   │   │   ├── get-log-filter.mjs
    │   │   │   │   ├── index.d.mts
    │   │   │   │   ├── index.mjs
    │   │   │   │   ├── parallel-plugin-worker.d.mts
    │   │   │   │   ├── parallel-plugin-worker.mjs
    │   │   │   │   ├── parallel-plugin.d.mts
    │   │   │   │   ├── parallel-plugin.mjs
    │   │   │   │   ├── parse-ast-index.d.mts
    │   │   │   │   ├── parse-ast-index.mjs
    │   │   │   │   ├── plugins-index.d.mts
    │   │   │   │   ├── plugins-index.mjs
    │   │   │   │   ├── shared
    │   │   │   │   │   ├── binding-DUEnSb0A.d.mts
    │   │   │   │   │   ├── binding-Rc5vBspi.mjs
    │   │   │   │   │   ├── bindingify-input-options-4E8MEYg4.mjs
    │   │   │   │   │   ├── constructors-ChVDbP6o.mjs
    │   │   │   │   │   ├── constructors-DYemMpPL.d.mts
    │   │   │   │   │   ├── define-config-DJOr6Iwt.mjs
    │   │   │   │   │   ├── define-config-DhJZwTRw.d.mts
    │   │   │   │   │   ├── error-DBGOT6sf.mjs
    │   │   │   │   │   ├── get-log-filter-semyr3Lj.d.mts
    │   │   │   │   │   ├── load-config-C9BtnuRk.mjs
    │   │   │   │   │   ├── logging-C6h4g8dA.d.mts
    │   │   │   │   │   ├── logs-D80CXhvg.mjs
    │   │   │   │   │   ├── misc-DJYbNKZX.mjs
    │   │   │   │   │   ├── normalize-string-or-regex-BzTP-qJS.mjs
    │   │   │   │   │   ├── parse-B30xMDQc.mjs
    │   │   │   │   │   ├── prompt-BYQIwEjg.mjs
    │   │   │   │   │   ├── resolve-tsconfig-BD5XUCWz.mjs
    │   │   │   │   │   ├── rolldown-CIfBsrjA.mjs
    │   │   │   │   │   ├── rolldown-build-hRnqgxyz.mjs
    │   │   │   │   │   ├── transform-Kz3D2LbX.d.mts
    │   │   │   │   │   └── watch-BDnUMWmc.mjs
    │   │   │   │   ├── utils-index.d.mts
    │   │   │   │   └── utils-index.mjs
    │   │   │   ├── node_modules
    │   │   │   │   └── @rolldown
    │   │   │   │       └── pluginutils
    │   │   │   │           ├── LICENSE
    │   │   │   │           ├── README.md
    │   │   │   │           ├── dist
    │   │   │   │           │   ├── filter
    │   │   │   │           │   │   ├── composable-filters.d.ts
    │   │   │   │           │   │   ├── composable-filters.js
    │   │   │   │           │   │   ├── filter-vite-plugins.d.ts
    │   │   │   │           │   │   ├── filter-vite-plugins.js
    │   │   │   │           │   │   ├── index.d.ts
    │   │   │   │           │   │   ├── index.js
    │   │   │   │           │   │   ├── simple-filters.d.ts
    │   │   │   │           │   │   └── simple-filters.js
    │   │   │   │           │   ├── index.d.ts
    │   │   │   │           │   ├── index.js
    │   │   │   │           │   ├── utils.d.ts
    │   │   │   │           │   └── utils.js
    │   │   │   │           └── package.json
    │   │   │   └── package.json
    │   │   ├── scheduler
    │   │   │   ├── LICENSE
    │   │   │   ├── README.md
    │   │   │   ├── cjs
    │   │   │   │   ├── scheduler-unstable_mock.development.js
    │   │   │   │   ├── scheduler-unstable_mock.production.js
    │   │   │   │   ├── scheduler-unstable_post_task.development.js
    │   │   │   │   ├── scheduler-unstable_post_task.production.js
    │   │   │   │   ├── scheduler.development.js
    │   │   │   │   ├── scheduler.native.development.js
    │   │   │   │   ├── scheduler.native.production.js
    │   │   │   │   └── scheduler.production.js
    │   │   │   ├── index.js
    │   │   │   ├── index.native.js
    │   │   │   ├── package.json
    │   │   │   ├── unstable_mock.js
    │   │   │   └── unstable_post_task.js
    │   │   ├── source-map-js
    │   │   │   ├── LICENSE
    │   │   │   ├── README.md
    │   │   │   ├── lib
    │   │   │   │   ├── array-set.js
    │   │   │   │   ├── base64-vlq.js
    │   │   │   │   ├── base64.js
    │   │   │   │   ├── binary-search.js
    │   │   │   │   ├── mapping-list.js
    │   │   │   │   ├── quick-sort.js
    │   │   │   │   ├── source-map-consumer.d.ts
    │   │   │   │   ├── source-map-consumer.js
    │   │   │   │   ├── source-map-generator.d.ts
    │   │   │   │   ├── source-map-generator.js
    │   │   │   │   ├── source-node.d.ts
    │   │   │   │   ├── source-node.js
    │   │   │   │   └── util.js
    │   │   │   ├── package.json
    │   │   │   ├── source-map.d.ts
    │   │   │   └── source-map.js
    │   │   ├── tinyglobby
    │   │   │   ├── LICENSE
    │   │   │   ├── README.md
    │   │   │   ├── dist
    │   │   │   │   ├── index.cjs
    │   │   │   │   ├── index.d.cts
    │   │   │   │   ├── index.d.mts
    │   │   │   │   └── index.mjs
    │   │   │   └── package.json
    │   │   ├── typescript
    │   │   │   ├── LICENSE.txt
    │   │   │   ├── README.md
    │   │   │   ├── SECURITY.md
    │   │   │   ├── ThirdPartyNoticeText.txt
    │   │   │   ├── bin
    │   │   │   │   ├── tsc
    │   │   │   │   └── tsserver
    │   │   │   ├── lib
    │   │   │   │   ├── _tsc.js
    │   │   │   │   ├── _tsserver.js
    │   │   │   │   ├── _typingsInstaller.js
    │   │   │   │   ├── cs
    │   │   │   │   │   └── diagnosticMessages.generated.json
    │   │   │   │   ├── de
    │   │   │   │   │   └── diagnosticMessages.generated.json
    │   │   │   │   ├── es
    │   │   │   │   │   └── diagnosticMessages.generated.json
    │   │   │   │   ├── fr
    │   │   │   │   │   └── diagnosticMessages.generated.json
    │   │   │   │   ├── it
    │   │   │   │   │   └── diagnosticMessages.generated.json
    │   │   │   │   ├── ja
    │   │   │   │   │   └── diagnosticMessages.generated.json
    │   │   │   │   ├── ko
    │   │   │   │   │   └── diagnosticMessages.generated.json
    │   │   │   │   ├── lib.d.ts
    │   │   │   │   ├── lib.decorators.d.ts
    │   │   │   │   ├── lib.decorators.legacy.d.ts
    │   │   │   │   ├── lib.dom.asynciterable.d.ts
    │   │   │   │   ├── lib.dom.d.ts
    │   │   │   │   ├── lib.dom.iterable.d.ts
    │   │   │   │   ├── lib.es2015.collection.d.ts
    │   │   │   │   ├── lib.es2015.core.d.ts
    │   │   │   │   ├── lib.es2015.d.ts
    │   │   │   │   ├── lib.es2015.generator.d.ts
    │   │   │   │   ├── lib.es2015.iterable.d.ts
    │   │   │   │   ├── lib.es2015.promise.d.ts
    │   │   │   │   ├── lib.es2015.proxy.d.ts
    │   │   │   │   ├── lib.es2015.reflect.d.ts
    │   │   │   │   ├── lib.es2015.symbol.d.ts
    │   │   │   │   ├── lib.es2015.symbol.wellknown.d.ts
    │   │   │   │   ├── lib.es2016.array.include.d.ts
    │   │   │   │   ├── lib.es2016.d.ts
    │   │   │   │   ├── lib.es2016.full.d.ts
    │   │   │   │   ├── lib.es2016.intl.d.ts
    │   │   │   │   ├── lib.es2017.arraybuffer.d.ts
    │   │   │   │   ├── lib.es2017.d.ts
    │   │   │   │   ├── lib.es2017.date.d.ts
    │   │   │   │   ├── lib.es2017.full.d.ts
    │   │   │   │   ├── lib.es2017.intl.d.ts
    │   │   │   │   ├── lib.es2017.object.d.ts
    │   │   │   │   ├── lib.es2017.sharedmemory.d.ts
    │   │   │   │   ├── lib.es2017.string.d.ts
    │   │   │   │   ├── lib.es2017.typedarrays.d.ts
    │   │   │   │   ├── lib.es2018.asyncgenerator.d.ts
    │   │   │   │   ├── lib.es2018.asynciterable.d.ts
    │   │   │   │   ├── lib.es2018.d.ts
    │   │   │   │   ├── lib.es2018.full.d.ts
    │   │   │   │   ├── lib.es2018.intl.d.ts
    │   │   │   │   ├── lib.es2018.promise.d.ts
    │   │   │   │   ├── lib.es2018.regexp.d.ts
    │   │   │   │   ├── lib.es2019.array.d.ts
    │   │   │   │   ├── lib.es2019.d.ts
    │   │   │   │   ├── lib.es2019.full.d.ts
    │   │   │   │   ├── lib.es2019.intl.d.ts
    │   │   │   │   ├── lib.es2019.object.d.ts
    │   │   │   │   ├── lib.es2019.string.d.ts
    │   │   │   │   ├── lib.es2019.symbol.d.ts
    │   │   │   │   ├── lib.es2020.bigint.d.ts
    │   │   │   │   ├── lib.es2020.d.ts
    │   │   │   │   ├── lib.es2020.date.d.ts
    │   │   │   │   ├── lib.es2020.full.d.ts
    │   │   │   │   ├── lib.es2020.intl.d.ts
    │   │   │   │   ├── lib.es2020.number.d.ts
    │   │   │   │   ├── lib.es2020.promise.d.ts
    │   │   │   │   ├── lib.es2020.sharedmemory.d.ts
    │   │   │   │   ├── lib.es2020.string.d.ts
    │   │   │   │   ├── lib.es2020.symbol.wellknown.d.ts
    │   │   │   │   ├── lib.es2021.d.ts
    │   │   │   │   ├── lib.es2021.full.d.ts
    │   │   │   │   ├── lib.es2021.intl.d.ts
    │   │   │   │   ├── lib.es2021.promise.d.ts
    │   │   │   │   ├── lib.es2021.string.d.ts
    │   │   │   │   ├── lib.es2021.weakref.d.ts
    │   │   │   │   ├── lib.es2022.array.d.ts
    │   │   │   │   ├── lib.es2022.d.ts
    │   │   │   │   ├── lib.es2022.error.d.ts
    │   │   │   │   ├── lib.es2022.full.d.ts
    │   │   │   │   ├── lib.es2022.intl.d.ts
    │   │   │   │   ├── lib.es2022.object.d.ts
    │   │   │   │   ├── lib.es2022.regexp.d.ts
    │   │   │   │   ├── lib.es2022.string.d.ts
    │   │   │   │   ├── lib.es2023.array.d.ts
    │   │   │   │   ├── lib.es2023.collection.d.ts
    │   │   │   │   ├── lib.es2023.d.ts
    │   │   │   │   ├── lib.es2023.full.d.ts
    │   │   │   │   ├── lib.es2023.intl.d.ts
    │   │   │   │   ├── lib.es2024.arraybuffer.d.ts
    │   │   │   │   ├── lib.es2024.collection.d.ts
    │   │   │   │   ├── lib.es2024.d.ts
    │   │   │   │   ├── lib.es2024.full.d.ts
    │   │   │   │   ├── lib.es2024.object.d.ts
    │   │   │   │   ├── lib.es2024.promise.d.ts
    │   │   │   │   ├── lib.es2024.regexp.d.ts
    │   │   │   │   ├── lib.es2024.sharedmemory.d.ts
    │   │   │   │   ├── lib.es2024.string.d.ts
    │   │   │   │   ├── lib.es2025.collection.d.ts
    │   │   │   │   ├── lib.es2025.d.ts
    │   │   │   │   ├── lib.es2025.float16.d.ts
    │   │   │   │   ├── lib.es2025.full.d.ts
    │   │   │   │   ├── lib.es2025.intl.d.ts
    │   │   │   │   ├── lib.es2025.iterator.d.ts
    │   │   │   │   ├── lib.es2025.promise.d.ts
    │   │   │   │   ├── lib.es2025.regexp.d.ts
    │   │   │   │   ├── lib.es5.d.ts
    │   │   │   │   ├── lib.es6.d.ts
    │   │   │   │   ├── lib.esnext.array.d.ts
    │   │   │   │   ├── lib.esnext.collection.d.ts
    │   │   │   │   ├── lib.esnext.d.ts
    │   │   │   │   ├── lib.esnext.date.d.ts
    │   │   │   │   ├── lib.esnext.decorators.d.ts
    │   │   │   │   ├── lib.esnext.disposable.d.ts
    │   │   │   │   ├── lib.esnext.error.d.ts
    │   │   │   │   ├── lib.esnext.full.d.ts
    │   │   │   │   ├── lib.esnext.intl.d.ts
    │   │   │   │   ├── lib.esnext.sharedmemory.d.ts
    │   │   │   │   ├── lib.esnext.temporal.d.ts
    │   │   │   │   ├── lib.esnext.typedarrays.d.ts
    │   │   │   │   ├── lib.scripthost.d.ts
    │   │   │   │   ├── lib.webworker.asynciterable.d.ts
    │   │   │   │   ├── lib.webworker.d.ts
    │   │   │   │   ├── lib.webworker.importscripts.d.ts
    │   │   │   │   ├── lib.webworker.iterable.d.ts
    │   │   │   │   ├── pl
    │   │   │   │   │   └── diagnosticMessages.generated.json
    │   │   │   │   ├── pt-br
    │   │   │   │   │   └── diagnosticMessages.generated.json
    │   │   │   │   ├── ru
    │   │   │   │   │   └── diagnosticMessages.generated.json
    │   │   │   │   ├── tr
    │   │   │   │   │   └── diagnosticMessages.generated.json
    │   │   │   │   ├── tsc.js
    │   │   │   │   ├── tsserver.js
    │   │   │   │   ├── tsserverlibrary.d.ts
    │   │   │   │   ├── tsserverlibrary.js
    │   │   │   │   ├── typesMap.json
    │   │   │   │   ├── typescript.d.ts
    │   │   │   │   ├── typescript.js
    │   │   │   │   ├── typingsInstaller.js
    │   │   │   │   ├── watchGuard.js
    │   │   │   │   ├── zh-cn
    │   │   │   │   │   └── diagnosticMessages.generated.json
    │   │   │   │   └── zh-tw
    │   │   │   │       └── diagnosticMessages.generated.json
    │   │   │   └── package.json
    │   │   └── vite
    │   │       ├── LICENSE.md
    │   │       ├── README.md
    │   │       ├── bin
    │   │       │   ├── openChrome.js
    │   │       │   └── vite.js
    │   │       ├── client.d.ts
    │   │       ├── dist
    │   │       │   ├── client
    │   │       │   │   ├── client.mjs
    │   │       │   │   └── env.mjs
    │   │       │   └── node
    │   │       │       ├── chunks
    │   │       │       │   ├── build.js
    │   │       │       │   ├── build2.js
    │   │       │       │   ├── chunk.js
    │   │       │       │   ├── config.js
    │   │       │       │   ├── dist.js
    │   │       │       │   ├── lib.js
    │   │       │       │   ├── logger.js
    │   │       │       │   ├── moduleRunnerTransport.d.ts
    │   │       │       │   ├── node.js
    │   │       │       │   ├── optimizer.js
    │   │       │       │   ├── postcss-import.js
    │   │       │       │   ├── preview.js
    │   │       │       │   └── server.js
    │   │       │       ├── cli.js
    │   │       │       ├── index.d.ts
    │   │       │       ├── index.js
    │   │       │       ├── internal.d.ts
    │   │       │       ├── internal.js
    │   │       │       ├── module-runner.d.ts
    │   │       │       └── module-runner.js
    │   │       ├── misc
    │   │       │   ├── false.js
    │   │       │   └── true.js
    │   │       ├── package.json
    │   │       └── types
    │   │           ├── customEvent.d.ts
    │   │           ├── hmrPayload.d.ts
    │   │           ├── hot.d.ts
    │   │           ├── import-meta.d.ts
    │   │           ├── importGlob.d.ts
    │   │           ├── importMeta.d.ts
    │   │           ├── internal
    │   │           │   ├── cssPreprocessorOptions.d.ts
    │   │           │   ├── esbuildOptions.d.ts
    │   │           │   ├── lightningcssOptions.d.ts
    │   │           │   ├── rollupTypeCompat.d.ts
    │   │           │   └── terserOptions.d.ts
    │   │           └── metadata.d.ts
    │   ├── package-lock.json
    │   ├── package.json
    │   ├── sale-terminal
    │   │   ├── config.ts
    │   │   ├── main.ts
    │   │   └── session.ts
    │   ├── services
    │   │   ├── aiengine.ts
    │   │   ├── approval
    │   │   │   └── approvalworkflowservice.ts
    │   │   ├── authservice.ts
    │   │   ├── bankingservice.ts
    │   │   ├── blockchainservice.ts
    │   │   ├── calibration
    │   │   │   └── calibrationengine.ts
    │   │   ├── conflict
    │   │   │   └── conflictresolver.ts
    │   │   ├── cost
    │   │   │   └── costallocationsystem.ts
    │   │   ├── customsservice.ts
    │   │   ├── customsutils.ts
    │   │   ├── dictionaryapprovalservice.ts
    │   │   ├── dictionaryservice.ts
    │   │   ├── documentai.ts
    │   │   ├── einvoiceengine.ts
    │   │   ├── enterpriselinker.ts
    │   │   ├── eventbridge.ts
    │   │   ├── exportservice.ts
    │   │   ├── fraudguard.ts
    │   │   ├── gmailservice.ts
    │   │   ├── heynaConnector.ts
    │   │   ├── hr
    │   │   │   └── application
    │   │   │       └── handlers
    │   │   │           ├── leave-handler.ts
    │   │   │           └── payroll-handler.ts
    │   │   ├── hrengine.ts
    │   │   ├── ingestion
    │   │   │   ├── aiprocessor.ts
    │   │   │   ├── dictionaryguard.ts
    │   │   │   ├── extractors.ts
    │   │   │   ├── idempotencymanager.ts
    │   │   │   ├── ingestionservice.ts
    │   │   │   └── utils.ts
    │   │   ├── learningengine.ts
    │   │   ├── logisticsservice.ts
    │   │   ├── mapping
    │   │   │   └── smartlinkmappingengine.ts
    │   │   ├── modulehelpers.ts
    │   │   ├── moduleregistry.ts
    │   │   ├── notificationservice.ts
    │   │   ├── offlineservice.ts
    │   │   ├── parser
    │   │   │   └── documentparserlayer.ts
    │   │   ├── paymentservice.ts
    │   │   ├── personnelengine.ts
    │   │   ├── productionengine.ts
    │   │   ├── productionsalesflow.ts
    │   │   ├── productionservice.ts
    │   │   ├── quantumbufferservice.ts
    │   │   ├── quantumengine.ts
    │   │   ├── rbacengine.ts
    │   │   ├── realtimenotificationservice.ts
    │   │   ├── recoveryengine.ts
    │   │   ├── salescore.ts
    │   │   ├── scoring
    │   │   │   └── contextscoringengine.ts
    │   │   ├── security.service.ts
    │   │   ├── sellerengine.ts
    │   │   ├── smartlinkengine.ts
    │   │   ├── staging
    │   │   │   └── eventstaginglayer.ts
    │   │   ├── supplier
    │   │   │   └── supplierengine.ts
    │   │   ├── taskrouter.ts
    │   │   ├── taxreportservice.ts
    │   │   ├── threatdetectionservice.ts
    │   │   └── warehouseservice.ts
    │   ├── superdictionary.ts
    │   ├── sw.js
    │   ├── tsconfig.json
    │   ├── types.ts
    │   ├── utils
    │   │   ├── supplierclassifier.ts
    │   │   └── supplierimporthelper.ts
    │   ├── vite.config.ts
    │   └── wiring
    │       └── domain-flow.wiring.ts
    ├── apps
    │   └── tam-luxury
    │       ├── app-psychology.html
    │       ├── attendance.html
    │       ├── cfo-dashboard.html
    │       ├── chat-rooms.html
    │       ├── daily-work-app.html
    │       ├── favicon.ico
    │       ├── fix.txt
    │       ├── hr-admin.html
    │       ├── hr-dashboard.html
    │       ├── hr-dashboard.html.bak
    │       ├── hr-manager.html
    │       ├── icon-ai.png
    │       ├── icon-hr.png
    │       ├── icon-master.png
    │       ├── icon-prod.png
    │       ├── icon-sales.png
    │       ├── icon-showroom.png
    │       ├── icon-warehouse.png
    │       ├── index-1.html
    │       ├── index.html
    │       ├── index2.html
    │       ├── index3.html
    │       ├── index4.html
    │       ├── indexa.html
    │       ├── indexb.html
    │       ├── indexc.html
    │       ├── indexf.html
    │       ├── kris-email-hub.html
    │       ├── ktt-approval.html
    │       ├── loss-thresholds.html
    │       ├── master-dashboard.html
    │       ├── nattos-audit.html
    │       ├── nattos-data.js
    │       ├── nattos-eod-engine.js
    │       ├── nattos-fx.js
    │       ├── nattos-galaxy.css
    │       ├── nattos-galaxy.js
    │       ├── nattos-glass.css
    │       ├── nattos-loss-thresholds.js
    │       ├── nattos-payment.js
    │       ├── nattos-production.html
    │       ├── nattos-tokens.css
    │       ├── nattos-ui-theme.css
    │       ├── operations-terminal.html
    │       ├── order-flow.html
    │       ├── personal-profile-v2.html
    │       ├── personal-profile.html
    │       ├── pricing-engine.html
    │       ├── production-wallboard.html
    │       ├── showroom-sales.html
    │       ├── surveillance.html
    │       ├── tamluxury-v2.html
    │       ├── tamluxury-v3.html
    │       ├── tamluxury-v4.html
    │       ├── warehouse-full.html
    │       └── warehouse-ops.html
    ├── engine-registry.ts
    ├── package-lock.json
    ├── package.json
    ├── server.js
    └── server.log
