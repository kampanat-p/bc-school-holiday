$FunctionUrl = "https://cgznmxcecljfybcgujjb.supabase.co/functions/v1/sync-thesaban"
$AnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnem5teGNlY2xqZnliY2d1ampiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NjUyNTMsImV4cCI6MjA4MzM0MTI1M30.e2SjA1IBFrxd4KkLrT6DYpeuHPiRSg64Jk-M3pPGC6w"

Write-Host "Starting debug loop for offsets 45-49..." -ForegroundColor Magenta

for ($idx = 45; $idx -lt 50; $idx++) {
    $UriStr = "$($FunctionUrl)?size=1&term=2&academicYear=2025&offset=$idx"
    Write-Host "`n--- Offset $idx ---" -ForegroundColor Cyan
    
    try {
        $resp = Invoke-RestMethod -Uri $UriStr -Method Post -Headers @{ "Authorization" = "Bearer $AnonKey" }
        Write-Host "Success! Processed: $($resp.targets_processed)" -ForegroundColor Green
        
        if ($resp.logs) {
            $resp.logs | Select-Object -First 3 | ForEach-Object { 
                Write-Host "   LOG: $_" -ForegroundColor Gray 
            }
        }
    }
    catch {
        Write-Host "FAILED!" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)"
        if ($_.Exception.Response) {
             $s = $_.Exception.Response.GetResponseStream()
             if ($s) {
                $r = New-Object System.IO.StreamReader($s)
                Write-Host "Details: $($r.ReadToEnd())" -ForegroundColor DarkRed
             }
        }
    }
    Start-Sleep -Seconds 2
}
