# Merge new entries into vocab-topics.json
$original = Get-Content 'src/data/seo/vocab-topics.json' -Raw -Encoding UTF8
$newEntries = Get-Content 'new-entries.json' -Raw -Encoding UTF8

# Parse both as JSON
$originalData = $original | ConvertFrom-Json
$newData = $newEntries | ConvertFrom-Json

# Combine
$combined = $originalData + $newData

# Convert back to JSON with pretty formatting
$combined | ConvertTo-Json -Depth 10 | Set-Content 'src/data/seo/vocab-topics.json' -Encoding UTF8

Write-Host "Done! Total entries: $($combined.Count)"