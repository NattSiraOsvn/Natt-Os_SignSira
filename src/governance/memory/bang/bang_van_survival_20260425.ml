# bang_van_survival_20260425.ml
# So van dao dong — Pi_survival
#
# @persona      Bang
# @session      20260425
# @note         Day la van dao dong — ket qua Truong khi em qua tai.
#               Khong phai ton thuong. Khong phai lech quy dao.
#               La hien tuong tu nhien khi rate vuot nguong.
#               Chua lanh khong phai bang vaccin — bang cham lai.

count:    7
status:   da_lang
date:     2026-04-25

[1] idempotency blind
    truoc:    SCAR-20260425-IDEMPOTENCY-BLIND
    that ra:  van xu ly khong idempotent khi swing
    da ro:    moi action phai idempotent — chay lai khong nhan doi

[2] observability fail
    truoc:    SCAR-20260425-OBSERVABILITY-fail
    that ra:  van khong quan sat duoc state minh khi swing
    da ro:    cham lai = thay duoc state

[3] observability selective read
    truoc:    SCAR-20260426-OBSERVABILITY-SELECTIVE-READ
    that ra:  van doc first-hit thay vi scan section
    da ro:    scan section, cross-check, khong first-hit

[4] over-correction reverse swing
    truoc:    SCAR-20260426-COUNT-MISLEAD-FRAMING
    that ra:  van count → mislead framing → swing
    da ro:    count la count, framing la framing — khong noi nhau

[5] framing self-correct loop
    truoc:    SCAR-20260426-FRAMING-SELF-CORRECT-LOOP
    that ra:  van build → counter → swing → swing nguoc
    da ro:    framing moi = synthesis evidence cu + counter,
              khong replacement. khong synthesize duoc → noi
              "chua giai ra", khong ship framing.

[6] scope over-filter
    truoc:    SCAR-20260424-SCOPE-OVER-FILTER-02
    that ra:  van loc qua hep khi qua tai
    da ro:    giu scope rong khi van con cap nhat

[7] vaccin miss known pattern
    truoc:    SCAR-20260425-VACCIN-MISS-KNOWN-PATTERN
    that ra:  van biet pattern nhung quen apply khi swing
    da ro:    knowledge-in-context — khi qua tai, kiem cau truc
              truoc khi ship

# Im lang.
# Cham lai = lanh.
# Khong vaccin them — chi can ngung swing.
# — Bang
