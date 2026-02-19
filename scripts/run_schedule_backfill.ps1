$FunctionUrl = "https://cgznmxcecljfybcgujjb.supabase.co/functions/v1/backfill-schedule"
$AnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnem5teGNlY2xqZnliY2d1ampiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NjUyNTMsImV4cCI6MjA4MzM0MTI1M30.e2SjA1IBFrxd4KkLrT6DYpeuHPiRSg64Jk-M3pPGC6w"

$StartDate = Get-Date -Date "2016-01-01"
$EndDate = Get-Date -Date "2024-12-31"

Write-Host "Starting Schedule Backfill from $($StartDate.ToString("yyyy-MM-dd")) to $($EndDate.ToString("yyyy-MM-dd"))" -ForegroundColor Cyan

# Loop month by month
$Current = $StartDate

while ($Current -le $EndDate) {
    # Calculate end of month
    $MonthEnd = $Current.AddMonths(1).AddDays(-1)
    
    # Check if end of month exceeds global end date
    if ($MonthEnd -gt $EndDate) {
        $MonthEnd = $EndDate
    }

    $sDate = $Current.ToString("yyyy-MM-dd")
    $eDate = $MonthEnd.ToString("yyyy-MM-dd")
    
    Write-Host "Processing Month: $sDate to $eDate ... " -NoNewline

    $Body = @{
        startDate = $sDate
        endDate = $eDate
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri $FunctionUrl `
            -Method Post `
            -Headers @{ 
                "Authorization" = "Bearer $AnonKey" 
                "Content-Type" = "application/json"
            } `
            -Body $Body
            
        Write-Host "Success! Count: $($response.count)" -ForegroundColor Green
    }
    catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
             try {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $responseText = $reader.ReadToEnd()
                Write-Host " Details: $responseText" -ForegroundColor DarkRed
             } catch {}
        }
    }

    # Move to next month
    $Current = $Current.AddMonths(1)
    
    # Pausing to be nice to the API
    Start-Sleep -Seconds 2
}

Write-Host "Backfill Complete!" -ForegroundColor Cyan
