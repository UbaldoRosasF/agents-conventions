# Theme Check

Config: [`.theme-check.yml`](../../.theme-check.yml). Usar extensión Shopify Theme Check en VS Code o CLI.

## Reglas enforced (alto impacto)

| Check | Setting | Impacto para agentes |
|-------|---------|---------------------|
| `ConvertIncludeToRender` | on | Siempre `{% render %}` |
| `NestedSnippet` | max 3 | Limitar profundidad de snippets |
| `TemplateLength` | 500 lines | Dividir sections grandes; schema/stylesheet/javascript excluidos |
| `UnusedAssign` | on | Remover assigns muertos |
| `ValidSchema` | on | Schema JSON debe validar |
| `ValidJson` | on | Locale/config JSON válido |
| `MatchingSchemaTranslations` | on | Claves `t:` del schema existen en locales |
| `TranslationKeyExists` | on | Claves `t` usadas existen |
| `DeprecatedFilter` | on | Sin filtros Liquid deprecados |
| `DeprecateLazysizes` | on | Sin markup lazysizes |
| `DeprecateBgsizes` | on | Sin markup bgsizes |
| `ParserBlockingJavaScript` | on | Evitar scripts blocking |
| `AssetUrlFilters` | on | Usar filtro `asset_url` correctamente |
| `ContentForHeaderModification` | on | Nunca alterar output de `content_for_header` |
| `HtmlParsingError` | on | Estructura HTML válida |

## Relajadas / off (proyecto)

| Check | Status |
|-------|--------|
| `ImgWidthAndHeight` | off |
| `ImgLazyLoading` | off |
| `RemoteAsset` | off |
| `AssetSizeCSS` / `AssetSizeJavaScript` | off |
| `ParserBlockingScriptTag` | off |

Seguir [performance-seo-a11y.md](performance-seo-a11y.md) — checks off no eximen buenas prácticas.

## Rutas ignoradas

Theme Check omite: `node_modules`, `assets/*`, `locales/*`, snippets vendor (`judgeme_*`, `boost-pfs*`, `wishlisthero-*`, etc.). Enfocar checks en `sections/`, `snippets/`, `blocks/`, `layout/`, `templates/` de primera parte.

## Ejecutar

```bash
shopify theme check
```

Corregir errores antes de entregar; warnings de traducciones/schema deben resolverse en código nuevo.
