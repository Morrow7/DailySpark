# Replace hard-coded Doubao keys in backend-next/src/lib/doubao.ts when present
@(
  'backend-next/src/lib/doubao.ts',
  'tools/replace_doubao.ps1'
 ) | ForEach-Object {
  $f = $_
  if (Test-Path $f) {
    try {
      $content = Get-Content -Raw -LiteralPath $f
      # Replace default inline assignments like: process.env.DOUBAO_ACCESS_KEY || '...'
      $new = $content -replace "process\.env\.DOUBAO_ACCESS_KEY\s*\|\|\s*'[^']*'","process.env.DOUBAO_ACCESS_KEY"
      $new = $new -replace "process\.env\.DOUBAO_SECRET_KEY\s*\|\|\s*'[^']*'","process.env.DOUBAO_SECRET_KEY"
      if ($new -ne $content) {
        Set-Content -LiteralPath $f -Value $new
      }
    } catch {
      Write-Error "Failed to replace secrets in $f: $_"
      exit 1
    }
  }
}
