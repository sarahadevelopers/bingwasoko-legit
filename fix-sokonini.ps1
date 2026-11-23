cd "D:\MY PROJECTS\bingwasoko-legit"

Write-Host "`n=== Step 1: Rename files ===" -ForegroundColor Cyan
$renamed = @{}
Get-ChildItem -Recurse -File -Filter *.html | Where-Object {
    $_.Name -match 'sokonini|Sokonini' -or $_.Name -match ' '
} | ForEach-Object {
    $oldName = $_.Name
    $newName = $_.Name `
        -replace 'Sokonini', 'Sokoni' `
        -replace 'sokonini', 'sokoni' `
        -replace '\s+', '-'
    # Lowercase the whole stem (first letter too) to match other files
    $newName = ($newName.Substring(0,1).ToLower() + $newName.Substring(1))
    if ($oldName -ne $newName) {
        Rename-Item -Path $_.FullName -NewName $newName
        Write-Host "  $oldName -> $newName"
        $renamed[$oldName] = $newName
    }
}

Write-Host "`n=== Step 2: Update every reference across the site ===" -ForegroundColor Cyan
$files = Get-ChildItem -Recurse -Include *.html,*.js,*.json,*.xml -File | Where-Object {
    $_.FullName -notmatch '\\\.git\\|\\node_modules\\'
}

foreach ($f in $files) {
    $c = [System.IO.File]::ReadAllText($f.FullName)
    $orig = $c

    # Fix the spelling
    $c = $c -replace 'Sokonini', 'Sokoni'
    $c = $c -replace 'sokonini', 'sokoni'

    # Fix URL-encoded space references (and any literal-space references)
    $c = $c -replace 'Bingwa%20Sokoni-official-till-number\.html', 'bingwa-sokoni-official-till-number.html'
    $c = $c -replace 'Bingwa Sokoni-official-till-number\.html',     'bingwa-sokoni-official-till-number.html'
    $c = $c -replace 'Bingwa%20Sokonini-official-till-number\.html', 'bingwa-sokoni-official-till-number.html'
    $c = $c -replace 'Bingwa Sokonini-official-till-number\.html',   'bingwa-sokoni-official-till-number.html'

    if ($c -ne $orig) {
        [System.IO.File]::WriteAllText($f.FullName, $c)
        Write-Host "  Updated: $($f.Name)"
    }
}

Write-Host "`n=== Step 3: Verification ===" -ForegroundColor Cyan
$leftover = Select-String -Recurse -Include *.html,*.js,*.json,*.xml -Pattern 'sokonini|Sokonini' -Path .\blog\*.html, .\*.html, .\*.xml, .\*.json
if ($leftover) {
    Write-Host "  STILL PRESENT:" -ForegroundColor Red
    $leftover | Select-Object Path, LineNumber, Line | Format-Table -AutoSize -Wrap
} else {
    Write-Host "  No 'sokonini' left anywhere" -ForegroundColor Green
}

$spaceFiles = Get-ChildItem -Recurse -File -Filter *.html | Where-Object { $_.Name -match ' ' }
if ($spaceFiles) {
    Write-Host "  STILL HAVE SPACES IN NAME:" -ForegroundColor Yellow
    $spaceFiles | Select-Object Name | Format-Table -AutoSize
} else {
    Write-Host "  No HTML files with spaces in the name" -ForegroundColor Green
}