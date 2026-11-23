# fix-popular-packages.ps1
$repoRoot = "D:\MY PROJECTS\bingwasoko-legit"
Set-Location $repoRoot

$newWidget = @'
<div class="popular-packages">
    <a href="../product/safaricom-1-gb-1-hour-5.html" class="popular-package safaricom">
        <div class="p-name">1 GB</div>
        <div class="p-price">Ksh 19</div>
        <div class="p-validity">⏱️ 1 Hour</div>
        <div class="p-badge">🔥 Popular</div>
        <div class="p-cta">View Bundle →</div>
    </a>
    <a href="../product/safaricom-15-gb-3-hours-4.html" class="popular-package safaricom">
        <div class="p-name">1.5 GB</div>
        <div class="p-price">Ksh 52</div>
        <div class="p-validity">⏱️ 3 Hours</div>
        <div class="p-badge">⚡ Best Deal</div>
        <div class="p-cta">View Bundle →</div>
    </a>
    <a href="../product/safaricom-45-mins-3-hours-17.html" class="popular-package safaricom">
        <div class="p-name">45 Mins</div>
        <div class="p-price">Ksh 23</div>
        <div class="p-validity">⏱️ 3 Hours</div>
        <div class="p-badge">📞 Best Value</div>
        <div class="p-cta">View Bundle →</div>
    </a>
    <a href="../product/safaricom-100-mins-2-days-15.html" class="popular-package safaricom">
        <div class="p-name">100 Mins</div>
        <div class="p-price">Ksh 100</div>
        <div class="p-validity">⏱️ Till Midnight</div>
        <div class="p-badge">📦 Big Saver</div>
        <div class="p-cta">View Bundle →</div>
    </a>
</div>
'@

function Replace-WidgetBlock {
    param([string]$Content, [string]$Replacement)
    $marker = '<div class="popular-packages">'
    $searchFrom = 0
    $result = $Content
    while ($true) {
        $startIdx = $result.IndexOf($marker, $searchFrom)
        if ($startIdx -lt 0) { break }
        $i = $startIdx; $depth = 0; $endIdx = -1
        while ($i -lt $result.Length) {
            $nextOpen  = $result.IndexOf('<div', $i)
            $nextClose = $result.IndexOf('</div>', $i)
            if ($nextClose -lt 0) { break }
            if ($nextOpen -ge 0 -and $nextOpen -lt $nextClose) {
                $depth++; $i = $nextOpen + 4
            } else {
                $depth--; $i = $nextClose + 6
                if ($depth -eq 0) { $endIdx = $i; break }
            }
        }
        if ($endIdx -lt 0) { break }
        $result = $result.Substring(0, $startIdx) + $Replacement + $result.Substring($endIdx)
        $searchFrom = $startIdx + $Replacement.Length
    }
    return $result
}

$files = Get-ChildItem -Path "$repoRoot\*.html", "$repoRoot\blog\*.html" -File
$updated = 0
foreach ($file in $files) {
    $content  = [System.IO.File]::ReadAllText($file.FullName)
    $original = $content
    $content  = Replace-WidgetBlock -Content $content -Replacement $newWidget
    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($file.FullName, $content, (New-Object System.Text.UTF8Encoding($false)))
        Write-Host "✅ Fixed: $($file.Name)" -ForegroundColor Green
        $updated++
    }
}
Write-Host "`nUpdated $updated file(s)." -ForegroundColor Cyan

Write-Host "`nChecking for non-Safaricom product links..." -ForegroundColor Yellow
$badBlog = Select-String -Path "$repoRoot\blog\*.html" -Pattern 'href="\.\./product/(?!safaricom-)'
$badRoot = Select-String -Path "$repoRoot\*.html"      -Pattern 'href="product/(?!safaricom-)'
if ($badBlog -or $badRoot) {
    Write-Host "⚠️ Old links still present:" -ForegroundColor Red
    @($badBlog) + @($badRoot) | Where-Object { $_ } | ForEach-Object { Write-Host "  $($_.Path):$($_.LineNumber)" }
} else {
    Write-Host "✅ No old product links remain." -ForegroundColor Green
}