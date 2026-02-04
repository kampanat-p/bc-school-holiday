$FunctionUrl = "https://cgznmxcecljfybcgujjb.supabase.co/functions/v1/sync-tms-metrics"
$AnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnem5teGNlY2xqZnliY2d1ampiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NjUyNTMsImV4cCI6MjA4MzM0MTI1M30.e2SjA1IBFrxd4KkLrT6DYpeuHPiRSg64Jk-M3pPGC6w"

Write-Host "Starting TMS Metrics Sync (By Topic)..." -ForegroundColor Cyan

for ($offset = 0; $offset -le 270; $offset += 5) {
    # Construct URI with &reportType=by-topic
    $UriStr = $FunctionUrl + "?offset=" + $offset + "&size=5&reportType=by-topic"
    
    Write-Host "Processing batch: Offset $offset, Size 5, Type 'by-topic'... " -NoNewline
    
    try {
        $response = Invoke-RestMethod -Uri $UriStr -Method Post -Headers @{ "Authorization" = "Bearer $AnonKey" }
        
        # Check if response has 'processed' property or 'scraped_targets'
        if ($response.PSObject.Properties.Match('scraped_targets').Count) {
             Write-Host "Success. Scraped: $($response.scraped_targets), DB: $($response.total_records)" -ForegroundColor Green
        } else {
             Write-Host "Result: $($response | ConvertTo-Json -Depth 1 -Compress)" -ForegroundColor Yellow
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