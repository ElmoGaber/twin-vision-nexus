$ErrorActionPreference = 'Stop'

$env:DOCKER_HOST = 'tcp://localhost:2375'
$statusText = (supabase status | Out-String)
$m = [regex]::Match($statusText, 'sb_secret_[A-Za-z0-9_-]+')
if (-not $m.Success) { throw 'Local secret key not found in supabase status output.' }
$localSecret = $m.Value
$localBase = 'http://localhost:54321'

$licensesCsv = 'd:\Downloads\licenses_rows.csv'
$profilesCsv = 'd:\Downloads\profiles_rows.csv'
if (!(Test-Path $licensesCsv)) { throw "Missing file: $licensesCsv" }
if (!(Test-Path $profilesCsv)) { throw "Missing file: $profilesCsv" }

$licenses = Import-Csv $licensesCsv
$profiles = Import-Csv $profilesCsv

$created = 0
$existing = 0
$idMap = @{}

$usersResp = Invoke-RestMethod -Method Get -Uri "$localBase/auth/v1/admin/users?page=1&per_page=1000" -Headers @{ apikey = $localSecret; Authorization = "Bearer $localSecret" }
$usersByEmail = @{}
foreach ($u in $usersResp.users) {
  if ($u.email) {
    $usersByEmail[$u.email.ToLower()] = $u.id
  }
}

foreach ($row in $licenses) {
  $email = $row.email
  $remoteUserId = $row.user_id
  if (-not $email) { continue }

  $emailKey = $email.ToLower()
  if ($usersByEmail.ContainsKey($emailKey)) {
    $existing++
    $idMap[$remoteUserId] = $usersByEmail[$emailKey]
    continue
  }

  $body = @{
    email         = $email
    password      = 'Temp#12345678'
    email_confirm = $true
    user_metadata = @{}
    app_metadata  = @{}
  } | ConvertTo-Json -Depth 5

  $newUser = Invoke-RestMethod -Method Post -Uri "$localBase/auth/v1/admin/users" -Headers @{ apikey = $localSecret; Authorization = "Bearer $localSecret"; 'Content-Type' = 'application/json' } -Body $body
  $created++
  $usersByEmail[$emailKey] = $newUser.id
  $idMap[$remoteUserId] = $newUser.id
}

$profilesUpserted = 0
foreach ($p in $profiles) {
  $remoteUserId = $p.user_id
  if (-not $idMap.ContainsKey($remoteUserId)) { continue }

  $payload = @{
    user_id    = $idMap[$remoteUserId]
    full_name  = $p.full_name
    avatar_url = $(if ($p.avatar_url -eq '') { $null } else { $p.avatar_url })
  } | ConvertTo-Json

  Invoke-RestMethod -Method Post -Uri "$localBase/rest/v1/profiles?on_conflict=user_id" -Headers @{ apikey = $localSecret; Authorization = "Bearer $localSecret"; Prefer = 'resolution=merge-duplicates'; 'Content-Type' = 'application/json' } -Body $payload | Out-Null
  $profilesUpserted++
}

$licensesUpserted = 0
foreach ($l in $licenses) {
  $remoteUserId = $l.user_id
  if (-not $idMap.ContainsKey($remoteUserId)) { continue }

  $payload = @{
    user_id    = $idMap[$remoteUserId]
    email      = $l.email
    status     = $l.status
    days_valid = [int]$l.days_valid
    expires_at = $l.expires_at
    notes      = $(if ($l.notes -eq '') { $null } else { $l.notes })
  } | ConvertTo-Json

  Invoke-RestMethod -Method Post -Uri "$localBase/rest/v1/licenses?on_conflict=user_id" -Headers @{ apikey = $localSecret; Authorization = "Bearer $localSecret"; Prefer = 'resolution=merge-duplicates'; 'Content-Type' = 'application/json' } -Body $payload | Out-Null
  $licensesUpserted++
}

Write-Host "Users created: $created"
Write-Host "Users already existed: $existing"
Write-Host "Profiles upserted: $profilesUpserted"
Write-Host "Licenses upserted: $licensesUpserted"

$verify = Invoke-RestMethod -Method Get -Uri "$localBase/rest/v1/licenses?select=email,status,expires_at,user_id" -Headers @{ apikey = $localSecret; Authorization = "Bearer $localSecret" }
Write-Host "Local licenses rows: $($verify.Count)"
$verify | ConvertTo-Json -Depth 4
