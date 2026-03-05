#!/bin/bash
BASE_DIR="$(pwd)"
REPORT_FILE="baithi_report_$(date +%Y%m%d_%H%M%S).md"

{
    echo "# 📝 BÁO CÁO TỰ ĐÁNH GIÁ BÀI THI KIM"
    echo "**Ngày:** $(date)"
    echo "**Thư mục:** $BASE_DIR"
    echo

    echo "## 📁 Cấu trúc thư mục (2 cấp)"
    tree -L 2 2>/dev/null || echo "⚠️ Cần cài 'tree' để hiển thị đẹp hơn"
    echo

    echo "## 📄 Danh sách file (.ts)"
    find . -name "*.ts" -type f | sort | while read f; do
        lines=$(cat "$f" | wc -l | tr -d ' ')
        echo "- $f ($lines dòng)"
    done
    echo

    echo "## 🧩 Kiểm tra 6 thành phần bắt buộc của cell"
    required_files=("identity.ts" "capability.manifest.ts" "boundary.rule.ts" "trace.memory.ts" "confidence.score.ts" "smartlink.port.ts")
    for rf in "${required_files[@]}"; do
        if [ -f "$rf" ]; then echo "✅ $rf"; else echo "❌ $rf (THIẾU)"; fi
    done
    echo

    echo "## ⚙️ Kiểm tra các module chính của Stability Validator"
    core_modules=("core/validator.engine.ts" "core/graph.consistency.check.ts" "core/behavior.anomaly.detector.ts" "core/blindspot.detector.ts" "core/freeze.proposer.ts" "interfaces/data.fetcher.ts" "interfaces/reporter.ts" "config/thresholds.json" "test/validator.test.ts")
    for cm in "${core_modules[@]}"; do
        if [ -f "$cm" ]; then echo "✅ $cm"; else echo "⚠️ $cm (không bắt buộc nhưng nên có)"; fi
    done
    echo

    echo "## 🔍 Kiểm tra nội dung cơ bản (grep)"
    grep -q "cellIdentity" identity.ts && echo "### identity.ts: ✅ OK" || echo "### identity.ts: ❌ Không tìm thấy 'cellIdentity'"
    grep -q "provides" capability.manifest.ts && echo "### capability.manifest.ts: ✅ OK" || echo "### capability.manifest.ts: ❌ Không tìm thấy 'provides'"
    grep -q "allowedIncoming" boundary.rule.ts && echo "### boundary.rule.ts: ✅ OK" || echo "### boundary.rule.ts: ❌ Không tìm thấy 'allowedIncoming'"
    grep -q "class TraceMemory" trace.memory.ts && echo "### trace.memory.ts: ✅ OK" || echo "### trace.memory.ts: ❌ Không tìm thấy 'class TraceMemory'"
    grep -q "class ConfidenceScore" confidence.score.ts && echo "### confidence.score.ts: ✅ OK" || echo "### confidence.score.ts: ❌ Không tìm thấy 'class ConfidenceScore'"
    grep -q "class NeuralMainPort" smartlink.port.ts && echo "### smartlink.port.ts: ✅ OK" || echo "### smartlink.port.ts: ❌ Không tìm thấy 'class NeuralMainPort'"
    if [ -f core/validator.engine.ts ]; then
        grep -q "class ValidatorEngine" core/validator.engine.ts && echo "### core/validator.engine.ts: ✅ OK" || echo "### core/validator.engine.ts: ❌ Không tìm thấy 'class ValidatorEngine'"
    else
        echo "### core/validator.engine.ts: ⚠️ File không tồn tại"
    fi
    if [ -f core/graph.consistency.check.ts ]; then
        grep -q "checkGraphConsistency" core/graph.consistency.check.ts && echo "### core/graph.consistency.check.ts: ✅ OK" || echo "### core/graph.consistency.check.ts: ❌ Không tìm thấy 'checkGraphConsistency'"
    else
        echo "### core/graph.consistency.check.ts: ⚠️ File không tồn tại"
    fi
    if [ -f config/thresholds.json ]; then
        grep -q "defensive_contraction" config/thresholds.json && echo "### config/thresholds.json: ✅ OK" || echo "### config/thresholds.json: ❌ Không tìm thấy cấu hình"
    else
        echo "### config/thresholds.json: ⚠️ File không tồn tại"
    fi
    echo

    echo "## 📊 Thống kê tổng thể"
    total_files=$(find . -name "*.ts" | wc -l | tr -d ' ')
    total_lines=$(find . -name "*.ts" -exec cat {} \; | wc -l | tr -d ' ')
    echo "- Tổng số file .ts: $total_files"
    echo "- Tổng số dòng code: $total_lines"
    echo

    echo "## 🏆 Điểm tự đánh giá (tạm thời)"
    score=0; max_score=18
    for rf in "${required_files[@]}"; do [ -f "$rf" ] && ((score++)); done
    core_count=0; for cm in "${core_modules[@]}"; do [ -f "$cm" ] && ((core_count++)); done
    [ $core_count -gt 5 ] && core_count=5; score=$((score + core_count))
    content_checks=0
    grep -q "cellIdentity" identity.ts && ((content_checks++))
    grep -q "provides" capability.manifest.ts && ((content_checks++))
    grep -q "allowedIncoming" boundary.rule.ts && ((content_checks++))
    grep -q "class TraceMemory" trace.memory.ts && ((content_checks++))
    grep -q "class ConfidenceScore" confidence.score.ts && ((content_checks++))
    grep -q "class NeuralMainPort" smartlink.port.ts && ((content_checks++))
    grep -q "checkGraphConsistency" core/graph.consistency.check.ts 2>/dev/null && ((content_checks++))
    score=$((score + content_checks))
    echo "Điểm số: $score/$max_score"
    echo "*(Lưu ý: đây chỉ là đánh giá sơ bộ, kết quả cuối cùng do Anh Natt quyết định)*"
    echo

    if [ $score -ge 15 ]; then echo "## ✅ Kết luận\n🎉 Bài thi đã hoàn thành tốt, đáp ứng hầu hết yêu cầu."
    elif [ $score -ge 10 ]; then echo "## ✅ Kết luận\n👍 Bài thi đạt yêu cầu cơ bản, cần bổ sung một số file/nội dung."
    else echo "## ✅ Kết luận\n⚠️ Bài thi còn thiếu nhiều, cần hoàn thiện thêm."; fi

} | tee "$REPORT_FILE"
echo "📄 Báo cáo đã được lưu tại: $REPORT_FILE"
