@echo off
setlocal

REM === CONFIGURATION ===
set "SRC_DIR=C:\Users\speci\OneDrive\Desktop\Website\college"
set "DST_DIR=C:\Users\speci\OneDrive\Desktop\cs\CS465"
set "LOG=sync_log.txt"
set "DATESTAMP=%DATE% %TIME%"

echo ==== SYNC STARTED ON %DATESTAMP% ==== >> "%LOG%"

REM === DELETE ONLY cs\CS465\college DIRECTORY ===
if exist "%DST_DIR%\college" (
    echo Deleting %DST_DIR%\college... >> "%LOG%"
    rmdir /s /q "%DST_DIR%\college"
    echo Deleted %DST_DIR%\college >> "%LOG%"
)

REM === COPY college DIRECTORY ===
echo Copying %SRC_DIR% to %DST_DIR%\college... >> "%LOG%"
xcopy "%SRC_DIR%" "%DST_DIR%\college\" /E /H /C /I /Y >> "%LOG%"
echo Finished copying college folder. >> "%LOG%"

REM === DELETE AND REPLACE app.js IN ROOT ===
set "SRC_APP=%SRC_DIR%\app.js"
set "DST_APP=%DST_DIR%\app.js"

if exist "%DST_APP%" (
    echo Deleting existing app.js... >> "%LOG%"
    del /f /q "%DST_APP%"
)

if exist "%SRC_APP%" (
    echo Copying new app.js... >> "%LOG%"
    copy /Y "%SRC_APP%" "%DST_APP%" >> "%LOG%"
) else (
    echo [WARNING] Source app.js not found at %SRC_APP% >> "%LOG%"
)

echo ==== SYNC COMPLETED ON %DATESTAMP% ==== >> "%LOG%"
echo Sync completed. Press any key to exit.
pause
