<#
.SYNOPSIS
    Free every port/container this project uses, then run the whole stack in
    production mode locally.

.DESCRIPTION
    Brings up NGINX + Next.js + Express + FastAPI + Qdrant + Redis via
    docker-compose.prod.yml, served on http://localhost.

    SAFETY: only ever stops containers belonging to THIS project's compose
    projects (urban-sole, urban-sole-ai). Other projects on this machine --
    ttk-backend, patent_os-postgres and anything else -- are never touched.

.EXAMPLE
    .\run-prod-local.ps1                 # full run: clean, build, start, seed vectors
    .\run-prod-local.ps1 -SkipBuild      # reuse existing images (much faster)
    .\run-prod-local.ps1 -SkipData       # don't re-index / re-train
    .\run-prod-local.ps1 -Down           # just tear everything down and exit
    .\run-prod-local.ps1 -WithWorker     # also run the Celery worker
#>

[CmdletBinding()]
param(
    [switch]$SkipBuild,
    [switch]$SkipData,
    [switch]$Down,
    [switch]$WithWorker
)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
Set-Location $root

# Compose projects owned by this repo. Anything not in this list is left alone.
$OwnedProjects = @('urban-sole', 'urban-sole-ai')
$DevPorts      = @(3000, 5000, 8001)   # dev servers we may need to evict
$PublicPort    = 80

$composeArgs = @(
    '-f', 'docker-compose.prod.yml',
    '--env-file', '.env.production'
)
if ($WithWorker) { $composeArgs += @('--profile', 'worker') }

function Step($n, $msg) { Write-Host "`n[$n] $msg" -ForegroundColor Cyan }
function Ok($msg)       { Write-Host "    OK  $msg" -ForegroundColor Green }
function Warn($msg)     { Write-Host "    !   $msg" -ForegroundColor Yellow }
function Die($msg)      { Write-Host "`nFAILED: $msg" -ForegroundColor Red; exit 1 }

# ---------------------------------------------------------------- preflight
Step 1 "Preflight checks"

if (-not (Test-Path 'docker-compose.prod.yml')) {
    Die "docker-compose.prod.yml not found. Run this from the repo root."
}

try { docker info --format '{{.ServerVersion}}' 2>$null | Out-Null }
catch { Die "Docker is not running. Start Docker Desktop and try again." }
if ($LASTEXITCODE -ne 0) { Die "Docker is not running. Start Docker Desktop and try again." }
Ok "Docker daemon reachable"

if (-not (Test-Path '.env.production')) {
    Die ".env.production missing. Copy .env.production.example and fill it in."
}
Ok ".env.production present"

# Fail fast on placeholders rather than after a 15-minute build.
$envText = Get-Content '.env.production' -Raw
foreach ($key in @('MONGODB_URI', 'SERVICE_TOKEN', 'LLM_GATEWAY_API_KEY')) {
    if ($envText -notmatch "(?m)^$key=.+$") { Die "$key is empty in .env.production" }
}
if ($envText -match '(?m)^SERVICE_TOKEN=change-me\s*$') {
    Die "SERVICE_TOKEN is still the placeholder. The AI service refuses to boot in production."
}
Ok "Required secrets look populated"

New-Item -ItemType Directory -Force -Path 'nginx/certbot/conf', 'nginx/certbot/www' | Out-Null

# ------------------------------------------------------------------ cleanup
Step 2 "Freeing this project's containers and ports"

foreach ($proj in $OwnedProjects) {
    $ids = @(docker ps -aq --filter "label=com.docker.compose.project=$proj" 2>$null)
    if ($ids.Count -gt 0) {
        docker rm -f @ids 2>&1 | Out-Null
        Ok "removed $($ids.Count) container(s) from project '$proj'"
    }
}

# Any container publishing our public port that we do NOT own is a real
# conflict -- report it rather than killing someone else's work.
$blocking = docker ps --format '{{.Names}}|{{.Ports}}|{{.Label "com.docker.compose.project"}}' 2>$null |
    Where-Object { $_ -match ":$PublicPort->" }
foreach ($row in $blocking) {
    $name, $ports, $proj = $row -split '\|'
    if ($OwnedProjects -notcontains $proj) {
        Die "Container '$name' (project '$proj') is using port $PublicPort. Stop it yourself: docker stop $name"
    }
}

# Evict our own dev servers (uvicorn / node) still holding dev ports.
foreach ($port in $DevPorts) {
    $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    foreach ($c in $conns) {
        $p = Get-Process -Id $c.OwningProcess -ErrorAction SilentlyContinue
        if (-not $p) { continue }
        # Only stop dev-server processes; never Docker's proxy or anything else.
        if ($p.ProcessName -match '^(python|pythonw|node|uvicorn)$') {
            Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
            Ok "stopped $($p.ProcessName) (pid $($p.Id)) on port $port"
        } else {
            Warn "port $port held by $($p.ProcessName) (pid $($p.Id)) -- left alone"
        }
    }
}

if (Get-NetTCPConnection -LocalPort $PublicPort -State Listen -ErrorAction SilentlyContinue) {
    Die "Port $PublicPort is still in use. Free it, then re-run."
}
Ok "port $PublicPort is free"

if ($Down) {
    Write-Host "`nAll project containers stopped. (-Down requested, not starting.)" -ForegroundColor Green
    exit 0
}

# -------------------------------------------------------------------- start
Step 3 "Starting the production stack"

# HTTP-only NGINX: the TLS config references certificates that don't exist
# locally, and NGINX refuses to start without them.
$env:NGINX_CONF = './nginx/nginx.http-only.conf'

$up = @('up', '-d')
if (-not $SkipBuild) {
    $up += '--build'
    Warn "first build installs PyTorch and bakes the embedding model -- allow 10-20 min"
}

docker compose @composeArgs @up
if ($LASTEXITCODE -ne 0) { Die "docker compose up failed (see output above)" }
Ok "containers started"

# ------------------------------------------------------------------- health
Step 4 "Waiting for services to become healthy"

function Wait-For($name, $script, $timeoutSec) {
    $deadline = (Get-Date).AddSeconds($timeoutSec)
    while ((Get-Date) -lt $deadline) {
        try { if (& $script) { Ok "$name ready"; return $true } } catch { }
        Start-Sleep -Seconds 2
    }
    Warn "$name did not become ready within ${timeoutSec}s"
    return $false
}

$aiReady = Wait-For 'ai-service' {
    $r = docker compose @composeArgs exec -T ai-service curl -sf http://localhost:8000/health 2>$null
    $LASTEXITCODE -eq 0
} 180

Wait-For 'nginx -> storefront' {
    (Invoke-WebRequest -Uri "http://localhost/" -UseBasicParsing -TimeoutSec 5).StatusCode -eq 200
} 120 | Out-Null

if ($aiReady) {
    $ready = docker compose @composeArgs exec -T ai-service curl -s http://localhost:8000/ready 2>$null
    Write-Host "    /ready -> $ready" -ForegroundColor DarkGray
    if ($ready -match '"mongo":\s*false') {
        Warn "MongoDB unreachable -- check MONGODB_URI, and that this machine's IP is allowlisted in Atlas"
    }
}

# --------------------------------------------------------------- data setup
if (-not $SkipData) {
    Step 5 "One-time data setup (idempotent -- safe to re-run)"
    foreach ($job in @(
        @{ n = 'index_catalog';    d = 'embedding the catalog into Qdrant' },
        @{ n = 'ingest_knowledge'; d = 'building the RAG knowledge base' },
        @{ n = 'train_models';     d = 'training CF + association rules' }
    )) {
        Write-Host "    -> $($job.d)..." -ForegroundColor DarkGray
        docker compose @composeArgs exec -T ai-service python -m "scripts.$($job.n)" 2>&1 |
            Select-Object -Last 1 | ForEach-Object { Write-Host "       $_" -ForegroundColor DarkGray }
        if ($LASTEXITCODE -ne 0) { Warn "$($job.n) failed -- the app still runs, that feature will be degraded" }
        else { Ok $job.n }
    }
} else {
    Step 5 "Skipping data setup (-SkipData)"
}

# ------------------------------------------------------------------- verify
Step 6 "Verifying"

try {
    $homeResp = Invoke-WebRequest -Uri 'http://localhost/api/v1/ai/home' -UseBasicParsing -TimeoutSec 30
    $sections = ([regex]::Matches($homeResp.Content, '"section"')).Count
    if ($sections -gt 0) { Ok "AI recommendations responding ($sections homepage sections)" }
    else { Warn "AI home returned no sections -- try re-running with data setup enabled" }
} catch { Warn "could not reach /api/v1/ai/home yet: $($_.Exception.Message)" }

# The AI service must NOT be reachable from the host in production.
$leaked = $false
foreach ($p in @(8000, 8001)) {
    try {
        Invoke-WebRequest -Uri "http://localhost:$p/health" -UseBasicParsing -TimeoutSec 3 | Out-Null
        $leaked = $true
        Warn "AI service is reachable on port $p -- it should be internal only"
    } catch { }
}
if (-not $leaked) { Ok "AI service is internal-only (not exposed to the host)" }

docker compose @composeArgs ps

Write-Host @"

  ============================================================
    Running in production mode:   http://localhost
  ============================================================

  logs      docker compose -f docker-compose.prod.yml --env-file .env.production logs -f ai-service
  stop      .\run-prod-local.ps1 -Down
  restart   .\run-prod-local.ps1 -SkipBuild -SkipData

"@ -ForegroundColor Green
