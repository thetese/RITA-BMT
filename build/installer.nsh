!macro customInstall
  MessageBox MB_ICONQUESTION|MB_YESNO|MB_DEFBUTTON1 "Will this installation be used for a Restaurant/Cafe/Bar? (Select 'No' for Retail Shop/Supermarket)" IDYES is_restaurant IDNO is_retail
  
  is_restaurant:
    FileOpen $0 "$INSTDIR\mode.txt" w
    FileWrite $0 "restaurant"
    FileClose $0
    Goto done

  is_retail:
    FileOpen $0 "$INSTDIR\mode.txt" w
    FileWrite $0 "retail"
    FileClose $0
    Goto done

  done:
!macroend
