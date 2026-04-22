$ErrorActionPreference = "Stop"

Set-Location "c:\Users\moham\Documents\PROYECTO\sistema-reservas"

function Move-IfExists($from, $to) {
  if (Test-Path $from) {
    Move-Item -Path $from -Destination $to
    Write-Host "Moved: $from -> $to"
  }
}

function Replace-InFile($file, $replacements) {
  $content = Get-Content -Path $file -Raw
  $original = $content

  foreach ($r in $replacements) {
    $content = [regex]::Replace($content, $r.Pattern, $r.Replacement)
  }

  if ($content -ne $original) {
    Set-Content -Path $file -Value $content -Encoding UTF8
    Write-Host "Updated: $file"
  }
}

# 1) Carpeta products -> resources
if (Test-Path ".\src\products") {
  Move-Item ".\src\products" ".\src\resources"
}

# 2) Renombrar archivos principales
Move-IfExists ".\src\resources\products.module.ts" ".\src\resources\resources.module.ts"
Move-IfExists ".\src\resources\products.controller.ts" ".\src\resources\resources.controller.ts"
Move-IfExists ".\src\resources\products.service.ts" ".\src\resources\resources.service.ts"
Move-IfExists ".\src\resources\entities\product.entity.ts" ".\src\resources\entities\resource.entity.ts"

# DTOs
if (Test-Path ".\src\resources\dto\create-product.dto.ts") {
  Move-Item ".\src\resources\dto\create-product.dto.ts" ".\src\resources\dto\create-room.dto.ts"
  Copy-Item ".\src\resources\dto\create-room.dto.ts" ".\src\resources\dto\create-laptop.dto.ts"
  Copy-Item ".\src\resources\dto\create-room.dto.ts" ".\src\resources\dto\create-lab-equipment.dto.ts"
}
Move-IfExists ".\src\resources\dto\update-product.dto.ts" ".\src\resources\dto\update-resource.dto.ts"

# 3) Reemplazos internos (imports/nombres)
$tsFiles = Get-ChildItem ".\src" -Recurse -Filter "*.ts" | Select-Object -ExpandProperty FullName
$commonReplacements = @(
  @{ Pattern = "products\.module";        Replacement = "resources.module" },
  @{ Pattern = "products\.controller";    Replacement = "resources.controller" },
  @{ Pattern = "products\.service";       Replacement = "resources.service" },
  @{ Pattern = "product\.entity";         Replacement = "resource.entity" },
  @{ Pattern = "update-product\.dto";     Replacement = "update-resource.dto" },

  @{ Pattern = "\bProductsModule\b";      Replacement = "ResourcesModule" },
  @{ Pattern = "\bProductsController\b";  Replacement = "ResourcesController" },
  @{ Pattern = "\bProductsService\b";     Replacement = "ResourcesService" },

  @{ Pattern = "['""](\.?\.?/)*products/"; Replacement = "'$1resources/" },
  @{ Pattern = "\bitems\b";               Replacement = "resources" },

  @{ Pattern = "\bCreateProductDto\b";    Replacement = "CreateRoomDto" },
  @{ Pattern = "create-product\.dto";     Replacement = "create-room.dto" },

  @{ Pattern = "\bUpdateProductDto\b";    Replacement = "UpdateResourceDto" },

  @{ Pattern = "\bProduct\b";             Replacement = "Resource" },
  @{ Pattern = "\bproduct\b";             Replacement = "resource" }
)

foreach ($file in $tsFiles) {
  Replace-InFile -file $file -replacements $commonReplacements
}

# 4) Ajustes de clases DTO copiados
if (Test-Path ".\src\resources\dto\create-room.dto.ts") {
  Replace-InFile ".\src\resources\dto\create-room.dto.ts" @(
    @{ Pattern = "\bCreateRoomDto\b"; Replacement = "CreateRoomDto" } # no-op
  )
}

if (Test-Path ".\src\resources\dto\create-laptop.dto.ts") {
  Replace-InFile ".\src\resources\dto\create-laptop.dto.ts" @(
    @{ Pattern = "\bCreateRoomDto\b"; Replacement = "CreateLaptopDto" }
  )
}

if (Test-Path ".\src\resources\dto\create-lab-equipment.dto.ts") {
  Replace-InFile ".\src\resources\dto\create-lab-equipment.dto.ts" @(
    @{ Pattern = "\bCreateRoomDto\b"; Replacement = "CreateLabEquipmentDto" }
  )
}

# update-resource.dto: PartialType(CreateRoomDto) -> PartialType(Resource)
if (Test-Path ".\src\resources\dto\update-resource.dto.ts") {
  Replace-InFile ".\src\resources\dto\update-resource.dto.ts" @(
    @{ Pattern = "\bCreateRoomDto\b"; Replacement = "Resource" },
    @{ Pattern = "create-room\.dto";  Replacement = "resource.entity" }
  )
}

Write-Host "`n✅ Renombre y reemplazos completados."
Write-Host "Siguiente: npm run build"