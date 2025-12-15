# OSRM Setup Script for Morocco
# Run this in PowerShell from the project root or backend folder

$ErrorActionPreference = "Stop"

Write-Host "=== OSRM Morocco Setup ===" -ForegroundColor Cyan

# 0. Check Docker availability
try {
    docker --version | Out-Null
}
catch {
    Write-Error "Docker is not installed or not available in PATH. Please install Docker Desktop and try again."
    exit 1
}

# 1. Create a directory for OSRM data
$OsrmDataDir = Join-Path $PWD "osrm-data"
if (!(Test-Path -Path $OsrmDataDir)) {
    New-Item -ItemType Directory -Path $OsrmDataDir | Out-Null
    Write-Host "Created directory: $OsrmDataDir"
}
else {
    Write-Host "Using existing OSRM data directory: $OsrmDataDir"
}

# 2. Download Morocco Map Data
$MapUrl = "https://download.geofabrik.de/africa/morocco-latest.osm.pbf"
$MapFile = Join-Path $OsrmDataDir "morocco-latest.osm.pbf"


if (!(Test-Path -Path $MapFile)) {
    Write-Host "Downloading Morocco map data from $MapUrl ..."
    try {
        Invoke-WebRequest -Uri $MapUrl -OutFile $MapFile
        Write-Host "Download complete: $MapFile"
    }
    catch {
        Write-Error "Failed to download Morocco map data. Error: $($_.Exception.Message)"
        exit 1
    }
}
else {
    Write-Host "Map data already exists at: $MapFile"
}

Write-Host "Map data already exists at: $MapFile"
}

# 2b. Clean up potential stale data to prevent algorithm mismatch
Write-Host "Cleaning up old OSRM generated files..."
Get-ChildItem -Path $OsrmDataDir -File | Where-Object { $_.Name -ne "morocco-latest.osm.pbf" } | Remove-Item -Force
Write-Host "Extracting map data with osrm-extract..."
docker run --rm -t -v "${OsrmDataDir}:/data" osrm/osrm-backend `
    osrm-extract -p /opt/car.lua /data/morocco-latest.osm.pbf

Write-Host "Partitioning map data with osrm-partition..."
docker run --rm -t -v "${OsrmDataDir}:/data" osrm/osrm-backend `
    osrm-partition /data/morocco-latest.osrm

Write-Host "Customizing map data with osrm-customize..."
docker run --rm -t -v "${OsrmDataDir}:/data" osrm/osrm-backend `
    osrm-customize /data/morocco-latest.osrm

# 4. Clean up any existing OSRM container with the same name
$existingContainer = docker ps -aq -f "name=^osrm-morocco$"
if ($existingContainer) {
    Write-Host "Found existing container 'osrm-morocco' (ID: $existingContainer). Stopping and removing..."
    docker rm -f $existingContainer | Out-Null
    Write-Host "Old 'osrm-morocco' container removed."
}

# 5. Run OSRM (strictly bound to localhost)
# Map host 127.0.0.1:5001 -> container 5000 to avoid conflicts with backend
Write-Host "Starting OSRM server on http://127.0.0.1:5001 ..."
docker run -d `
    -p 127.0.0.1:5001:5000 `
    -v "${OsrmDataDir}:/data" `
    --name osrm-morocco `
    --restart always `
    osrm/osrm-backend osrm-routed --algorithm mld /data/morocco-latest.osrm | Out-Null

Write-Host "OSRM setup complete and running on http://127.0.0.1:5001" -ForegroundColor Green
