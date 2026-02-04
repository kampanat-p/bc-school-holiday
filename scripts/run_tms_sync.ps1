$FunctionUrl = "https://cgznmxcecljfybcgujjb.supabase.co/functions/v1/sync-tms-metrics"
$AnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnem5teGNlY2xqZnliY2d1ampiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NjUyNTMsImV4cCI6MjA4MzM0MTI1M30.e2SjA1IBFrxd4KkLrT6DYpeuHPiRSg64Jk-M3pPGC6w"

Write-Host "Starting TMS Metrics Sync..." -ForegroundColor Cyan

for ($offset = 0; $offset -le 270; $offset += 5) {
    # Construct URI with simple concatenation to avoid parsing issues
    $UriStr = $FunctionUrl + "?offset=" + $offset + "&size=5"
    
    Write-Host "Processing batch: Offset $offset, Size 5... " -NoNewline
    
    try {
        $response = Invoke-RestMethod -Uri $UriStr -Method Post -Headers @{ "Authorization" = "Bearer $AnonKey" }
        
        # Check if response has 'processed' property
        if ($response.PSObject.Properties.Match('processed').Count) {
             Write-Host "Success. Processed: $($response.processed)" -ForegroundColor Green
        } else {
             Write-Host "Success. Result: $($response | ConvertTo-Json -Depth 1 -Compress)" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
             # Try to read error body
             try {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $responseText = $reader.ReadToEnd()
                Write-Host " Details: $responseText" -ForegroundColor DarkRed
             } catch {}
        }
    }
    
    Start-Sleep -Seconds 3
}

Write-Host "Sync Complete!" -ForegroundColor Cyan