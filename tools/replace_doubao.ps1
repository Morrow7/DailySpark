# Replace hard-coded Doubao keys in backend-next/src/lib/doubao.ts when present
$file = "backend-next/src/lib/doubao.ts"
if (Test-Path $file) {
  try {
    $content = Get-Content -Raw -LiteralPath $file
    # Replace default inline assignments like: process.env.DOUBAO_ACCESS_KEY || '...'
    $new = $content -replace "process\.env\.DOUBAO_ACCESS_KEY\s*\|\|\s*'[^']*'","process.env.DOUBAO_ACCESS_KEY"
    $new = $new -replace "process\.env\.DOUBAO_SECRET_KEY\s*\|\|\s*'[^']*'","process.env.DOUBAO_SECRET_KEY"
    if ($new -ne $content) {
      Set-Content -LiteralPath $file -Value $new
    }
  } catch {
    Write-Error "Failed to replace secrets in $file: $_"
    exit 1
  }
}
