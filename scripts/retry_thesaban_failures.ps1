$FunctionUrl = "https://cgznmxcecljfybcgujjb.supabase.co/functions/v1/sync-thesaban"
$AnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnem5teGNlY2xqZnliY2d1ampiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NjUyNTMsImV4cCI6MjA4MzM0MTI1M30.e2SjA1IBFrxd4KkLrT6DYpeuHPiRSg64Jk-M3pPGC6w"

$FailedOffsets = @(45, 70)
$BatchSize = 1 # Reduced to 1 to guarantee success against worker limits

Write-Host "Retrying Failed TMS Thesaban Batches..." -ForegroundColor Cyan

foreach ($offset in $FailedOffsets) {
    # Construct URI with stricter parameters
    $UriStr = "$($FunctionUrl.Trim())?size=$BatchSize&term=2&academicYear=2025&offset=$offset"
    
    Write-Host "Retrying batch: Offset $offset (Size $BatchSize)... " -NoNewline
    
    try {
        $response = Invoke-RestMethod -Uri $UriStr -Method Post -Headers @{ "Authorization" = "Bearer $AnonKey" }
        
        Write-Host "Success." -ForegroundColor Green
        Write-Host "  Targets Processed: $($response.targets_processed)" -ForegroundColor Gray
        Write-Host "  Records Upserted:  $($response.records_upserted)" -ForegroundColor Gray
    }
    catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
             try {
                $stream = $_.Exception.Response.GetResponseStream()
                if ($stream) {
                    $reader = New-Object System.IO.StreamReader($stream)
                    $responseText = $reader.ReadToEnd()
                    Write-Host " Details: $responseText" -ForegroundColor DarkRed
                }
             } catch {}
        }
    }
    
    # Check if we need to do the remaining part of the original 5-item batch
    # Original batch was size 5 (e.g. 45-49). We just did 3 (45-47). 
    # We need to do 48-49.
    $remainingOffset = $offset + $BatchSize
    $remainingSize = 5 - $BatchSize
    
    Start-Sleep -Seconds 5
    
    $UriStrRem = "$($FunctionUrl.Trim())?size=$remainingSize&term=2&academicYear=2025&offset=$remainingOffset"
    Write-Host "  > Cleanup batch: Offset $remainingOffset (Size $remainingSize)... " -NoNewline
    
    try {
        $response = Invoke-RestMethod -Uri $UriStrRem -Method Post -Headers @{ "Authorization" = "Bearer $AnonKey" }
        Write-Host "Success ($($response.records_upserted) recs)." -ForegroundColor Green
    } catch {
        Write-Host "Error on cleanup." -ForegroundColor Red
    }

    Start-Sleep -Seconds 5
}

Write-Host "Retry Complete!" -ForegroundColor Cyan
