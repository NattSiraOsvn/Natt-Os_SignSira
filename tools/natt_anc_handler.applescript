
on open location this_URL
    set rawURL to this_URL as text

    if rawURL starts with "anc://" then
        set ancBody to text ((length of "anc://") + 1) thru -1 of rawURL

        set AppleScript's text item delimiters to {"/", "?", "#"}
        set ancKey to text item 1 of ancBody
        set AppleScript's text item delimiters to ""

        if ancKey is "" then
            set ancKey to "core"
        end if

        set targetURL to "http://anc.natt/go/" & ancKey

        try
            do shell script "curl -s -X POST http://core.natt/api/events/emit -H 'Content-Type: application/json' -d " & quoted form of ("{\"type\":\"anc.protocol.opened\",\"cell\":\"anc-handler-cell\",\"payload\":{\"uri\":\"" & rawURL & "\",\"key\":\"" & ancKey & "\",\"target\":\"" & targetURL & "\"}}")
        end try

        open location targetURL
    end if
end open location
