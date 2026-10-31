$logFile = "$env:USERPROFILE\.gemini\antigravity\brain\8a71c1c2-1d93-46c9-af9d-a9f1d84502b2\.system_generated\logs\transcript.jsonl"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " LIVE AGENT COMMAND MONITOR" -ForegroundColor Green
Write-Host " Listening for executed commands and results..." -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

Get-Content -Path $logFile -Wait -Tail 0 | ForEach-Object {
    try {
        $json = $_ | ConvertFrom-Json -ErrorAction SilentlyContinue
        if ($json) {
            # Check for tool call containing run_command
            if ($json.tool_calls) {
                foreach ($tc in $json.tool_calls) {
                    if ($tc.name -eq 'run_command' -or $tc.function.name -eq 'run_command') {
                        $cmd = if ($tc.args.CommandLine) { $tc.args.CommandLine } else { $tc.function.arguments.CommandLine }
                        $summary = if ($tc.args.toolSummary) { $tc.args.toolSummary } else { $tc.function.arguments.toolSummary }
                        Write-Host "`n>>> [COMMAND] ($summary)" -ForegroundColor Cyan
                        Write-Host "$cmd" -ForegroundColor White
                    }
                }
            }
            # Check for tool results / output
            if ($json.type -eq 'TOOL_RESULT' -or $json.source -eq 'TOOL_RESPONSE' -or $json.content -match 'Command output:') {
                Write-Host "`n<<< [OUTPUT / RESULT]" -ForegroundColor Green
                Write-Host $json.content -ForegroundColor Gray
            }
        }
    } catch {}
}
