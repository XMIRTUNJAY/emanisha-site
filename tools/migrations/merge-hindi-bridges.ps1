# Merge new Hindi bridge entries into hindi-bridges.json (no duplicates)
$original = Get-Content 'src/data/seo/hindi-bridges.json' -Raw -Encoding UTF8
$newEntries = Get-Content 'new-hindi-bridges.json' -Raw -Encoding UTF8

# Parse both as JSON
$originalData = $original | ConvertFrom-Json
$newData = $newEntries | ConvertFrom-Json

# Create a set of existing slugs to avoid duplicates
$existingSlugs = @{}
$originalData | ForEach-Object { $existingSlugs[$_.slug] = $true }

# Only add new entries that don't already exist
$uniqueNewData = $newData | Where-Object { -not $existingSlugs[$_.slug] }

# Combine
$combined = $originalData + $uniqueNewData

# Convert back to JSON with pretty formatting
$combined | ConvertTo-Json -Depth 10 | Set-Content 'src/data/seo/hindi-bridges.json' -Encoding UTF8

Write-Host "Done! Total entries: $($combined.Count) (added $($uniqueNewData.Count) new)"