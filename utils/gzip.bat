for /r %i in (*.*) do (
  "C:\Program Files\7-Zip\7z.exe" a -tgzip "%i.gz" "%i"
)