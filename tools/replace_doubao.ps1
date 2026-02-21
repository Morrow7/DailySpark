# Replace hard-coded Doubao keys in backend-next/src/lib/doubao.ts when present
$file = "backend-next/src/lib/doubao.ts"
if (Test-Path $file) {
  try {
    $content = Get-Content -Raw -LiteralPath $file
    $new = $content -replace "[REDACTED_ACCESS_KEY]","REDACTED_ACCESS_KEY"
    $new = $new -replace "[REDACTED_SECRET_KEY]==","REDACTED_SECRET_KEY"
    if ($new -ne $content) {
      Set-Content -LiteralPath $file -Value $new
    }
  } catch {
    Write-Error "Failed to replace secrets in $file: $_"
    exit 1
  }
}
