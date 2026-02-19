$FunctionUrl = "https://cgznmxcecljfybcgujjb.supabase.co/functions/v1/sync-thesaban"
$AnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnem5teGNlY2xqZnliY2d1ampiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NjUyNTMsImV4cCI6MjA4MzM0MTI1M30.e2SjA1IBFrxd4KkLrT6DYpeuHPiRSg64Jk-M3pPGC6w"

# Run just one batch (offset 0) to debug
$offset = 0
$UriStr = "$($FunctionUrl)?size=1&term=2&academicYear=2025&offset=$offset&school=S.Mk."
# Added school=S.Mk. to force a known school code if helpful, or remove to use default list.
# Let's remove school force to test the default logic first batch
$UriStr = "$($FunctionUrl)?size=1&term=2&academicYear=2025&offset=$offset"

Write-Host "DEBUG: Calling URI: '$UriStr'" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri $UriStr -Method Post -Headers @{ "Authorization" = "Bearer $AnonKey" }
    
    Write-Host "Success." -ForegroundColor Green
    Write-Host "  Targets Processed: $($response.targets_processed)" -ForegroundColor Gray
    Write-Host "  Records Upserted:  $($response.records_upserted)" -ForegroundColor Gray
    
    Write-Host "`n--- SERVER LOGS ---" -ForegroundColor Yellow
    if ($response.logs) {
        $response.logs | ForEach-Object { Write-Host $_ }
    } else {
        Write-Host "No logs returned." -ForegroundColor Red
    }
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
            $stream = $_.Exception.Response.GetResponseStream()
            if ($stream) {
                $reader = New-Object System.IO.StreamReader($stream)
                $errBody = $reader.ReadToEnd()
                Write-Host " Details: $errBody" -ForegroundColor DarkRed
                
                # Try to parse JSON error to see logs
                try {
                    $jsonErr = $errBody | ConvertFrom-Json
                    if ($jsonErr.logs) {
                        Write-Host "`n--- SERVER LOGS (from error) ---" -ForegroundColor Yellow
                        $jsonErr.logs | ForEach-Object { Write-Host $_ }
                    }
                } catch {}
            }
    }
}
