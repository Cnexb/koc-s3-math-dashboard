# Serve the site like GitHub Pages (keeps .html paths + trailing slashes).
# Open: http://127.0.0.1:8765/dashboard/s3.html#lessons
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
Write-Host "Starting local server at http://127.0.0.1:8765/"
Write-Host "Dashboard: http://127.0.0.1:8765/dashboard/s3.html#lessons"
npx --yes serve -l 8765 --no-port-switching .
