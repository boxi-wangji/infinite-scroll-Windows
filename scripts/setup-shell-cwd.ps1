# setup-shell-cwd.ps1
# 为 PowerShell 注入 OSC 7 / OSC 9;9 CWD 上报，供 Infinite Scroll 追踪工作目录。
# 运行一次即可，效果写入 PowerShell profile，永久生效。
#
# 使用方法（以管理员身份运行 PowerShell）：
#   .\scripts\setup-shell-cwd.ps1

$profilePath = $PROFILE.CurrentUserAllHosts

$snippet = @'

# ── Infinite Scroll: CWD reporting ──────────────────────────────────────────
# Emits OSC 7 and OSC 9;9 sequences so Infinite Scroll can track the current
# working directory and restore sessions to the correct path on restart.
function prompt {
    $cwd = (Get-Location).Path
    # OSC 7: file:///C:/path  (xterm standard)
    $osc7 = "`e]7;file:///$($cwd.Replace('\','/'))`a"
    # OSC 9;9: C:\path  (Windows Terminal format)
    $osc9 = "`e]9;9;$cwd`a"
    Write-Host -NoNewline "$osc7$osc9"
    # Keep the default prompt appearance
    "PS $cwd> "
}
# ────────────────────────────────────────────────────────────────────────────
'@

# Create profile directory if needed
$profileDir = Split-Path $profilePath
if (-not (Test-Path $profileDir)) {
    New-Item -ItemType Directory -Path $profileDir -Force | Out-Null
}

# Avoid duplicate injection
if (Test-Path $profilePath) {
    $existing = Get-Content $profilePath -Raw
    if ($existing -match "Infinite Scroll: CWD reporting") {
        Write-Host "Already configured. No changes made." -ForegroundColor Yellow
        exit 0
    }
}

Add-Content -Path $profilePath -Value $snippet
Write-Host "Done! CWD reporting added to: $profilePath" -ForegroundColor Green
Write-Host "Restart PowerShell for the change to take effect." -ForegroundColor Cyan
