# Tạo thư mục gốc cho neural-main-cell
mkdir -p src/cells/governance/neural-main-cell/{core,interfaces,config,infrastructure,domain,application,ports}

# Tạo các file bắt buộc theo Hiến pháp (6 thành phần)
touch src/cells/governance/neural-main-cell/identity.ts
touch src/cells/governance/neural-main-cell/capability.manifest.ts
touch src/cells/governance/neural-main-cell/boundary.rule.ts
touch src/cells/governance/neural-main-cell/trace.memory.ts
touch src/cells/governance/neural-main-cell/confidence.score.ts
touch src/cells/governance/neural-main-cell/smartlink.port.ts

# Tạo các file cho Stability Validator
touch src/cells/governance/neural-main-cell/core/validator.engine.ts
touch src/cells/governance/neural-main-cell/core/graph.consistency.check.ts
touch src/cells/governance/neural-main-cell/core/behavior.anomaly.detector.ts
touch src/cells/governance/neural-main-cell/core/blindspot.detector.ts
touch src/cells/governance/neural-main-cell/core/freeze.proposer.ts
touch src/cells/governance/neural-main-cell/interfaces/data.fetcher.ts
touch src/cells/governance/neural-main-cell/interfaces/reporter.ts
touch src/cells/governance/neural-main-cell/config/thresholds.json