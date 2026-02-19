$FunctionUrl = "https://cgznmxcecljfybcgujjb.supabase.co/functions/v1/sync-thesaban"
$AnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnem5teGNlY2xqZnliY2d1ampiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NjUyNTMsImV4cCI6MjA4MzM0MTI1M30.e2SjA1IBFrxd4KkLrT6DYpeuHPiRSg64Jk-M3pPGC6w"

Write-Host "Starting debug loop for offsets 45-49 (with School Names)..." -ForegroundColor Magenta

for ($idx = 45; $idx -lt 50; $idx++) { # 5 iterations
    $UriStr = "$($FunctionUrl)?size=1&term=2&academicYear=2025&offset=$idx"
    Write-Host "`n--- Offset $idx ---" -ForegroundColor Cyan
    
    try {
        $resp = Invoke-RestMethod -Uri $UriStr -Method Post -Headers @{ "Authorization" = "Bearer $AnonKey" }
        Write-Host "Success! Processed: $($resp.targets_processed)" -ForegroundColor Green
        
        if ($resp.logs) {
            # Find logs that contain "Processing School" or "Scraping"
            $resp.logs | Where-Object { $_ -match "Processing School" -or $_ -match "Scraping" } | ForEach-Object { 
                Write-Host "   $_" -ForegroundColor Yellow 
            }
        }
    }
    catch {
        Write-Host "FAILED!" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)"
    }
    Start-Sleep -Seconds 1
}
