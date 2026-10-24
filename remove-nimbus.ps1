# Removes Primnox's Nimbus from this PC: the program, and everything it keeps
# (profiles with history, passwords, tabs and settings, their cache, update
# downloads, shortcuts and registry entries). A reinstall then starts fresh.
#
# Nimbus keeps its profiles in the same folder as Firefox does,
# %APPDATA%\Mozilla\Firefox, so only the profiles Nimbus made are removed and
# a real Firefox's profiles stay. When nothing but Nimbus used that folder, the
# whole folder goes.
#
#   powershell -ExecutionPolicy Bypass -File remove-nimbus.ps1 -DryRun   lists what would go
#   powershell -ExecutionPolicy Bypass -File remove-nimbus.ps1           removes it
#   add -DataOnly to keep the program and only start over with fresh data
param([switch]$DryRun, [switch]$DataOnly, [switch]$Elevated)
$ErrorActionPreference = 'Stop'

function Say($text) { Write-Host $text }
function Step($what, [scriptblock]$do) {
  if ($DryRun) {
    Say "  would $what"
  } else {
    Say "  $what"
    try { & $do } catch { Say "    couldn't: $($_.Exception.Message)" }
  }
}
function Done {
  if ($Elevated) { Read-Host 'Press Enter to close' | Out-Null }
}

# ---- where Nimbus is installed ----------------------------------------------

Add-Type -AssemblyName System.IO.Compression.FileSystem

# Any install with Nimbus inside, whatever it was called when it was built.
function IsNimbusBuild($dir) {
  $omni = Join-Path $dir 'browser\omni.ja'
  if (-not (Test-Path -LiteralPath $omni)) { return $false }
  try {
    $zip = [IO.Compression.ZipFile]::OpenRead($omni)
    try { return [bool]($zip.Entries | Where-Object { $_.FullName -eq 'chrome/browser/content/browser/nimbus/nimbus.js' } | Select-Object -First 1) }
    finally { $zip.Dispose() }
  } catch { return $false }
}

$installs = @()
foreach ($root in 'HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall',
                  'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall',
                  'HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall') {
  foreach ($key in Get-ChildItem $root -ErrorAction SilentlyContinue) {
    $p = Get-ItemProperty $key.PSPath
    if ($p.InstallLocation -and ($p.DisplayName -like 'Primnox Nimbus*' -or (IsNimbusBuild $p.InstallLocation.Trim('"')))) {
      $installs += [pscustomobject]@{
        Dir = $p.InstallLocation.Trim('"').TrimEnd('\')
        Uninstaller = ($p.UninstallString -replace '"', '').Trim()
        Name = $p.DisplayName
      }
    }
  }
}
$installs = @($installs | Sort-Object Dir -Unique)
$dirs = @($installs | ForEach-Object { $_.Dir })

function InNimbus($path) {
  if (-not $path) { return $false }
  foreach ($d in $dirs) {
    if ($path.TrimEnd('\').Equals($d, 'OrdinalIgnoreCase') -or $path.StartsWith("$d\", 'OrdinalIgnoreCase')) { return $true }
  }
  return $false
}

# Uninstalling needs administrator rights; ask once, up front.
$admin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if ($installs.Count -and -not $admin -and -not $DryRun -and -not $DataOnly) {
  Say 'Windows will ask for permission to uninstall Nimbus.'
  Start-Process powershell.exe -Verb RunAs -ArgumentList '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', "`"$PSCommandPath`"", '-Elevated'
  return
}

if ($DryRun) { Say 'Dry run: nothing is removed.' }

# ---- the program ------------------------------------------------------------

Say ''
Say 'Program'
if (-not $installs.Count) { Say '  not installed' }
if ($DataOnly) { Say '  kept' }
$running = @(Get-Process | Where-Object { InNimbus $_.Path })
if ($running.Count) {
  Step "close Nimbus ($($running.Count) processes)" {
    foreach ($p in $running) { try { [void]$p.CloseMainWindow() } catch {} }
    $until = (Get-Date).AddSeconds(15)
    while ((Get-Process | Where-Object { InNimbus $_.Path }) -and (Get-Date) -lt $until) { Start-Sleep -Milliseconds 300 }
    Get-Process | Where-Object { InNimbus $_.Path } | Stop-Process -Force
  }
}
foreach ($i in $installs | Where-Object { -not $DataOnly }) {
  Step "uninstall $($i.Name) from $($i.Dir)" {
    if (Test-Path -LiteralPath $i.Uninstaller) {
      Start-Process -FilePath $i.Uninstaller -ArgumentList '/S' -Wait
      # The uninstaller hands off to a copy of itself, so wait for the files.
      $until = (Get-Date).AddSeconds(90)
      while ((Test-Path -LiteralPath (Join-Path $i.Dir 'firefox.exe')) -and (Get-Date) -lt $until) { Start-Sleep -Milliseconds 500 }
    }
  }
  if (Test-Path -LiteralPath $i.Dir) {
    Step "delete what's left of $($i.Dir)" {
      Remove-Item -LiteralPath $i.Dir -Recurse -Force
      $parent = Split-Path $i.Dir -Parent
      if ((Test-Path -LiteralPath $parent) -and -not (Get-ChildItem -LiteralPath $parent -Force)) { Remove-Item -LiteralPath $parent -Force }
    }
  }
}
foreach ($hive in @('HKLM:\Software\Mozilla', 'HKLM:\Software\WOW6432Node\Mozilla', 'HKCU:\Software\Mozilla') | Where-Object { -not $DataOnly }) {
  foreach ($key in Get-ChildItem $hive -ErrorAction SilentlyContinue | Where-Object { $_.PSChildName -like 'Primnox Nimbus*' }) {
    Step "delete the registry key $($key.Name)" { Remove-Item -LiteralPath $key.PSPath -Recurse -Force }
  }
}
$shell = New-Object -ComObject WScript.Shell
$linkDirs = @([Environment]::GetFolderPath('Desktop'), [Environment]::GetFolderPath('CommonDesktopDirectory'),
              [Environment]::GetFolderPath('StartMenu'), [Environment]::GetFolderPath('CommonStartMenu'),
              (Join-Path $env:APPDATA 'Microsoft\Internet Explorer\Quick Launch\User Pinned\TaskBar'))
foreach ($ld in $linkDirs | Where-Object { -not $DataOnly }) {
  foreach ($lnk in Get-ChildItem -LiteralPath $ld -Filter '*.lnk' -Recurse -ErrorAction SilentlyContinue) {
    $target = $shell.CreateShortcut($lnk.FullName).TargetPath
    if ((InNimbus $target) -or ($lnk.BaseName -like "*Primnox's Nimbus*" -and -not (Test-Path -LiteralPath $target))) {
      Step "delete the shortcut $($lnk.FullName)" { Remove-Item -LiteralPath $lnk.FullName -Force }
    }
  }
}

# ---- the data -----------------------------------------------------------------

Say ''
Say 'Data'
$moz = Join-Path $env:APPDATA 'Mozilla\Firefox'
$mozLocal = Join-Path $env:LOCALAPPDATA 'Mozilla\Firefox'

# A profile is Nimbus's if Nimbus wrote its own files or settings into it, or
# if a Nimbus install was the last to open it.
$marker = 'user_pref\("nimbus\.(intro\.done|crashReports\.optedOut|scene|layout|workspaces|update\.lastCheck|newtab\.|peek|gestures|tabs\.cleanup)'
function IsNimbusProfile($dir) {
  foreach ($f in 'nimbus-smtc.ps1', 'nimbus-notebook.json', 'nimbus-tweaks.json') {
    if (Test-Path -LiteralPath (Join-Path $dir $f)) { return $true }
  }
  $prefs = Join-Path $dir 'prefs.js'
  if ((Test-Path -LiteralPath $prefs) -and (Select-String -LiteralPath $prefs -Pattern $marker -Quiet)) { return $true }
  $compat = Join-Path $dir 'compatibility.ini'
  if (Test-Path -LiteralPath $compat) {
    $m = Select-String -LiteralPath $compat -Pattern '^LastPlatformDir=(.+)$' | Select-Object -First 1
    if ($m -and (InNimbus $m.Matches[0].Groups[1].Value)) { return $true }
  }
  return $false
}

# profiles.ini and installs.ini, section by section, in order.
function ReadIni($path) {
  $sections = New-Object System.Collections.ArrayList
  if (-not (Test-Path -LiteralPath $path)) { return , $sections }
  $cur = $null
  foreach ($line in Get-Content -LiteralPath $path) {
    if ($line -match '^\[(.+)\]\s*$') {
      $cur = [pscustomobject]@{ Name = $Matches[1]; Lines = New-Object System.Collections.ArrayList }
      [void]$sections.Add($cur)
    } elseif ($cur -and $line.Trim()) {
      [void]$cur.Lines.Add($line)
    }
  }
  return , $sections
}
function IniValue($section, $key) {
  foreach ($l in $section.Lines) { if ($l -match "^$([regex]::Escape($key))=(.*)$") { return $Matches[1] } }
  return $null
}
function WriteIni($path, $sections) {
  $out = New-Object System.Collections.ArrayList
  foreach ($s in $sections) { [void]$out.Add("[$($s.Name)]"); foreach ($l in $s.Lines) { [void]$out.Add($l) }; [void]$out.Add('') }
  [IO.File]::WriteAllLines($path, [string[]]$out)
}
function FullPath($rel, $isRelative) {
  if ($isRelative -eq '0') { return $rel }
  return Join-Path $moz ($rel -replace '/', '\')
}

$profilesIni = Join-Path $moz 'profiles.ini'
$installsIni = Join-Path $moz 'installs.ini'
$ini = ReadIni $profilesIni
$gone = @{}        # profile paths as profiles.ini writes them
$goneDirs = @()
foreach ($s in $ini | Where-Object { $_.Name -match '^Profile\d+$' }) {
  $rel = IniValue $s 'Path'
  $full = FullPath $rel (IniValue $s 'IsRelative')
  if ($rel -and (Test-Path -LiteralPath $full) -and (IsNimbusProfile $full)) { $gone[$rel] = $true; $goneDirs += $full }
}
# Nimbus profiles the list no longer mentions.
foreach ($d in Get-ChildItem -LiteralPath (Join-Path $moz 'Profiles') -Directory -ErrorAction SilentlyContinue) {
  if ($goneDirs -notcontains $d.FullName -and (IsNimbusProfile $d.FullName)) { $goneDirs += $d.FullName }
}
# Installs whose profile is going, by their install hash.
$goneHashes = @()
foreach ($s in $ini) {
  $def = IniValue $s 'Default'
  if ($def -and $gone[$def] -and $s.Name -match '^Install([0-9A-F]+)$') { $goneHashes += $Matches[1] }
}

if (-not $goneDirs.Count) { Say '  no Nimbus profiles found' }

# What stays: other profiles with anything in them, or other installs.
$keep = @(Get-ChildItem -LiteralPath (Join-Path $moz 'Profiles') -Directory -ErrorAction SilentlyContinue |
  Where-Object { $goneDirs -notcontains $_.FullName -and (Test-Path -LiteralPath (Join-Path $_.FullName 'prefs.js')) })
$otherInstalls = @($ini | Where-Object { $_.Name -match '^Install([0-9A-F]+)$' -and $goneHashes -notcontains $Matches[1] })

if ($goneDirs.Count -and -not $keep.Count -and -not $otherInstalls.Count) {
  # Only Nimbus used this folder.
  foreach ($d in $moz, $mozLocal) {
    if (Test-Path -LiteralPath $d) { Step "delete $d (only Nimbus used it)" { Remove-Item -LiteralPath $d -Recurse -Force } }
  }
} else {
  foreach ($d in $goneDirs) {
    Step "delete the Nimbus profile $d" { Remove-Item -LiteralPath $d -Recurse -Force }
    $cache = Join-Path $mozLocal ('Profiles\' + (Split-Path $d -Leaf))
    if (Test-Path -LiteralPath $cache) { Step "delete its cache $cache" { Remove-Item -LiteralPath $cache -Recurse -Force } }
  }
  if ($gone.Count) {
    Step "take the Nimbus profiles out of $profilesIni" {
      $left = New-Object System.Collections.ArrayList
      $n = 0
      foreach ($s in $ini) {
        $path = IniValue $s 'Path'
        if ($s.Name -match '^Profile\d+$') {
          if ($path -and $gone[$path]) { continue }
          $s.Name = "Profile$n"; $n++
        } elseif ($s.Name -match '^Install([0-9A-F]+)$' -and $goneHashes -contains $Matches[1]) {
          continue
        } elseif ($s.Name -eq 'BackgroundTasksProfiles') {
          $s.Lines = New-Object System.Collections.ArrayList (, @($s.Lines | Where-Object { $l = $_; -not ($goneHashes | Where-Object { $l -like "MozillaBackgroundTask-$_-*" }) }))
        }
        [void]$left.Add($s)
      }
      WriteIni $profilesIni $left
      $inst = ReadIni $installsIni
      if ($inst.Count) { WriteIni $installsIni @($inst | Where-Object { $goneHashes -notcontains $_.Name }) }
    }
  }
  foreach ($h in $goneHashes) {
    foreach ($bg in Get-ChildItem -LiteralPath (Join-Path $moz 'Background Tasks Profiles') -Directory -Filter "*MozillaBackgroundTask-$h-*" -ErrorAction SilentlyContinue) {
      Step "delete $($bg.FullName)" { Remove-Item -LiteralPath $bg.FullName -Recurse -Force }
    }
  }
}

$updates = Join-Path $env:TEMP 'nimbus-update'
if (Test-Path -LiteralPath $updates) { Step "delete downloaded updates in $updates" { Remove-Item -LiteralPath $updates -Recurse -Force } }

Say ''
if ($DryRun) { Say 'Run it without -DryRun to remove these.' }
elseif ($DataOnly) { Say "Nimbus's data is gone. It starts fresh the next time it opens." }
else { Say 'Nimbus is gone. Installing it again starts fresh.' }
Done
