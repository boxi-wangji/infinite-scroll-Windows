@echo off
REM setup-shell-cwd-cmd.bat
REM 为 CMD 配置 OSC 9;9 CWD 上报（写入用户级注册表 PROMPT）。
REM 以普通用户身份运行即可。

SET "OSC_PROMPT=$E]9;9;$P$E\$P$G"

REG ADD "HKCU\Environment" /v "PROMPT" /t REG_SZ /d "%OSC_PROMPT%" /f

echo Done! CMD PROMPT set to report CWD via OSC 9;9.
echo Please open a new CMD window for the change to take effect.
pause
