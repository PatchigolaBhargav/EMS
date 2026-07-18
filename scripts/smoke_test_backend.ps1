$base = 'http://localhost:5001'
$email = 'smoke.test.' + (Get-Date -UFormat %s) + '@example.com'
$pwd = 'SmokePass123'

$signupBody = @{ fullname = 'Smoke Tester'; email = $email; phone = '0000000000'; password = $pwd } | ConvertTo-Json
$signup = Invoke-RestMethod -Uri "$base/api/signup" -Method Post -ContentType 'application/json' -Body $signupBody
Write-Output '== signup =='
$signup | ConvertTo-Json -Compress

$loginBody = @{ email = $email; password = $pwd } | ConvertTo-Json
$login = Invoke-RestMethod -Uri "$base/api/login" -Method Post -ContentType 'application/json' -Body $loginBody
Write-Output '== login =='
$login | ConvertTo-Json -Compress

$regId = 'PS-SMOKE-' + (Get-Date -UFormat %s)
$registration = @{ id = $regId; userName = 'Smoke Tester'; userEmail = $email; category = 'SmokeTest'; event = 'Smoke Event'; bookingDate = (Get-Date -Format yyyy-MM-dd); totalBill = '₹100'; amount = '₹100'; paymentMethod = 'Card'; status = 'Pending'; items = @() }
$create = Invoke-RestMethod -Uri "$base/api/registrations" -Method Post -ContentType 'application/json' -Body ($registration | ConvertTo-Json -Depth 5)
Write-Output '== create =='
$create | ConvertTo-Json -Compress

$fetch = Invoke-RestMethod -Uri "$base/api/registrations?userEmail=$email" -Method Get
Write-Output '== fetch =='
$fetch | ConvertTo-Json -Compress

$updateBody = @{ status = 'Confirmed' } | ConvertTo-Json
$update = Invoke-RestMethod -Uri "$base/api/registrations/$regId" -Method Put -ContentType 'application/json' -Body $updateBody
Write-Output '== update =='
$update | ConvertTo-Json -Compress

$delete = Invoke-RestMethod -Uri "$base/api/registrations/$regId" -Method Delete
Write-Output '== delete =='
$delete | ConvertTo-Json -Compress

Write-Output 'SMOKE_SCRIPT_DONE'
