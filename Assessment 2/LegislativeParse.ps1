#Pulls the current staff member list from the Oregon State Legislature 
  #(link: https://api.oregonlegislature.gov/odata/odataservice.svc/CommitteeStaffMembers)
#Merges the data using the Legislative Session Key from the following source 
  #(link: https://api.oregonlegislature.gov/odata/odataservice.svc/LegislativeSessions)
#Outputs a CSV containing the individual, the associated legislative session name, the beginning and end times ordered by session begin date/time.

$output = "Assessment2CSV.csv"

$namespace = @{
    d = "http://schemas.microsoft.com/ado/2007/08/dataservices"
    m = "http://schemas.microsoft.com/ado/2007/08/dataservices/metadata"
}

$curStaffURL = "https://api.oregonlegislature.gov/odata/odataservice.svc/CommitteeStaffMembers?`$select=FirstName,LastName,SessionKey"
$legSessionURL = "https://api.oregonlegislature.gov/odata/odataservice.svc/LegislativeSessions?`$select=SessionKey,SessionName,BeginDate,EndDate"

$curStaffXML = $null
$legSessionXML = $null

Write-Output $curStaffURL

try {
  $curStaffRes = Invoke-WebRequest -Uri $curStaffURL -Method Get
  $curStaffXML = [xml]$curStaffRes.Content
} catch {
  Write-Error "Current Staff Fetch Failure : $_"
  exit 1
}

try {
  $legSessionRes = Invoke-WebRequest -Uri $legSessionURL -Method GET
  $legSessionXML = [xml]$legSessionRes.Content
} catch {
  Write-Error "Legislative Session Fetch Failure : $_"
  exit 1
}

$xmlNamespaceManager = New-Object System.Xml.XmlNamespaceManager($curStaffXML.NameTable)

foreach ($prefix in $namespace.Keys) {
    $xmlNamespaceManager.AddNamespace($prefix, $namespace[$prefix])
}


$staffSessionMergedXML = foreach ($staffEntry in $curStaffXML.SelectNodes("//m:properties", $xmlNamespaceManager)) {
  $matchedSessionEntry = $legSessionXML.SelectNodes("//m:properties", $xmlNamespaceManager) | Where-Object { $_.SessionKey -eq $staffEntry.SessionKey }

  if($matchedSessionEntry) {
    $mergedEntry = [PSCustomObject]@{
      Name = $staffEntry.FirstName + " " + $staffEntry.LastName
      SessionName = $matchedSessionEntry.SessionName
      BeginTime = $matchedSessionEntry.BeginDate.innerText
      EndTime = $matchedSessionEntry.EndDate.innerText
    }
    $mergedEntry
  }
} 

$staffSessionMergedXML | Sort-Object BeginTime | Export-Csv -Path $output -NoTypeInformation

Write-Output "Done: $output"