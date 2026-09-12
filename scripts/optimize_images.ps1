Add-Type -AssemblyName System.Drawing

$files = Get-ChildItem -Path "assets\images\*.jpg"

function Resize-Image {
    param (
        [string]$Path,
        [int]$MaxWidth,
        [int]$MaxHeight,
        [long]$Quality = 82
    )

    $src = [System.Drawing.Image]::FromFile($Path)
    $origW = $src.Width
    $origH = $src.Height

    # Calculate scale factor
    $ratioX = $MaxWidth / $origW
    $ratioY = $MaxHeight / $origH
    $ratio = [Math]::Min($ratioX, $ratioY)
    if ($ratio -ge 1.0) {
        $ratio = 1.0
    }

    $newW = [int]($origW * $ratio)
    $newH = [int]($origH * $ratio)

    $bmp = New-Object System.Drawing.Bitmap($newW, $newH)
    $graph = [System.Drawing.Graphics]::FromImage($bmp)
    $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graph.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graph.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graph.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $graph.DrawImage($src, 0, 0, $newW, $newH)

    $src.Dispose()
    $graph.Dispose()

    # Encoder parameters for JPEG Quality
    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, $Quality)

    $tempPath = $Path + ".tmp.jpg"
    $bmp.Save($tempPath, $codec, $encoderParams)
    $bmp.Dispose()

    # Replace original
    Move-Item -Path $tempPath -Destination $Path -Force
}

Write-Host "Optimizing images..."

foreach ($file in $files) {
    $beforeSize = $file.Length
    $name = $file.Name

    if ($name -like "member_*") {
        # Member avatars (used at max 64px display)
        Resize-Image -Path $file.FullName -MaxWidth 300 -MaxHeight 300 -Quality 82
    }
    elseif ($name -eq "hero_bg.jpg") {
        # Hero background
        Resize-Image -Path $file.FullName -MaxWidth 1400 -MaxHeight 900 -Quality 80
    }
    else {
        # Programs, Trainers, Coach
        Resize-Image -Path $file.FullName -MaxWidth 700 -MaxHeight 700 -Quality 82
    }

    $afterFile = Get-Item $file.FullName
    $afterSize = $afterFile.Length
    $saving = [Math]::Round(($beforeSize - $afterSize) / $beforeSize * 100, 1)
    Write-Host "$name : $([Math]::Round($beforeSize/1KB, 1))KB -> $([Math]::Round($afterSize/1KB, 1))KB ($saving% saved)"
}
Write-Host "Image optimization complete!"
