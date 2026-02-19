$FunctionUrl = "https://cgznmxcecljfybcgujjb.supabase.co/functions/v1/sync-tms-metrics"
$AnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnem5teGNlY2xqZnliY2d1ampiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NjUyNTMsImV4cCI6MjA4MzM0MTI1M30.e2SjA1IBFrxd4KkLrT6DYpeuHPiRSg64Jk-M3pPGC6w"
$FailedOffsets = @(25, 95, 100, 125, 235, 240)
$MetricType = "by-topic" 

Write-Host "Retrying Failed Batches (One-by-One) to bypass CPU limits..." -ForegroundColor Cyan

foreach ($baseOffset in $FailedOffsets) {
    Write-Host ">>> Retrying original batch starting at $baseOffset" -ForegroundColor Yellow
    
    # Break the failing batch of 5 into 5 requests of size 1
    for ($i = 0; $i -lt 5; $i++) {
        $currentOffset = $baseOffset + $i
        # Concatenate strings cleanly for PS < 6
        $UriStr = $FunctionUrl + "?offset=" + $currentOffset + "&size=1&reportType=" + $MetricType
        
        Write-Host "   Processing single item: Offset $currentOffset... " -NoNewline
        
        try {
            $response = Invoke-RestMethod -Uri $UriStr -Method Post -Headers @{ "Authorization" = "Bearer $AnonKey" }
            if ($response.PSObject.Properties.Match('scraped_targets').Count) {
             Write-Host "Success." -ForegroundColor Green
            } else {
             Write-Host "Result: $($response | ConvertTo-Json -Depth 1 -Compress)" -ForegroundColor Yellow
            }
        }
        catch {
            Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
            if ($_.Exception.Response) {
                try {
                   $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                   Write-Host "   Details: $($reader.ReadToEnd())" -ForegroundColor DarkRed
                } catch {}
            }
        }
        
        # Pause to be gentle
        Start-Sleep -Seconds 1
    }
}

Write-Host "Retry Complete!" -ForegroundColor Cyan