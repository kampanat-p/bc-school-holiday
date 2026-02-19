$FunctionUrl = "https://cgznmxcecljfybcgujjb.supabase.co/functions/v1/sync-thesaban"
$AnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnem5teGNlY2xqZnliY2d1ampiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NjUyNTMsImV4cCI6MjA4MzM0MTI1M30.e2SjA1IBFrxd4KkLrT6DYpeuHPiRSg64Jk-M3pPGC6w"

Write-Host "Starting TMS Thesaban Score Sync..." -ForegroundColor Cyan

# Loop through offsets. Adjust max offset as needed (e.g., 500 if there are many classes)
# The default batch size is 5 in the edge function.
for ($offset = 0; $offset -le 100; $offset += 5) {
    # Construct URI with parameters
    # term=2, academicYear=2025 are defaults in the function but good to be explicit
    # Using Trim() to ensure no invisible whitespace issues
    $UriStr = "$($FunctionUrl.Trim())?size=5&term=2&academicYear=2025&offset=$offset"
    
    # Write-Host "DEBUG: Calling URI: '$UriStr'" -ForegroundColor DarkGray
    Write-Host "Processing batch: Offset $offset... " -NoNewline
    
    try {
        $response = Invoke-RestMethod -Uri $UriStr -Method Post -Headers @{ "Authorization" = "Bearer $AnonKey" }
        
        Write-Host "Success." -ForegroundColor Green
        Write-Host "  Targets Processed: $($response.targets_processed)" -ForegroundColor Gray
        Write-Host "  Records Upserted:  $($response.records_upserted)" -ForegroundColor Gray

        # Stop if we processed fewer targets than requested (end of list)
        if ($response.targets_processed -lt 5) {
            Write-Host "End of list reached." -ForegroundColor Cyan
            break
        }
    }
    catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
             # Try to read error body
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
    
    Start-Sleep -Seconds 3
}

Write-Host "Sync Complete!" -ForegroundColor Cyan
