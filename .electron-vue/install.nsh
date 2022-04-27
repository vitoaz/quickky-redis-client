!macro customInit
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\{qucikky-redis-client}"
!macroend

!macro customInstall
  Delete "$INSTDIR\LICENSE.electron.txt"
  Delete "$INSTDIR\LICENSES.chromium.html"
!macroend

