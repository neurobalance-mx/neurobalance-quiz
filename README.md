# Quiz de Perfil Cerebral Neurobalance · V1

Web app del cuestionario de 42 preguntas, con cálculo de los cuatro indicadores (FL, FR, RL, RR), resultado rojo, azul, combinado o insuficiente, descarga de guías PDF, panel de administración y envío de cada respuesta a GoHighLevel, Google Sheets, Microsoft (Power Automate) o cualquier webhook.

**Stack:** Next.js 14 (App Router) · Supabase (Postgres) · Tailwind · despliegue en Vercel.

## Puesta en marcha

1. **Supabase.** Crea un proyecto y ejecuta `supabase/schema.sql` en el SQL Editor.
2. **Variables de entorno.** Copia `.env.example` a `.env.local` (en Vercel: Settings → Environment Variables):
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API; solo se usa del lado del servidor)
   - `ADMIN_PASSWORD` — contraseña del panel `/admin`
   - `ALLOWED_FRAME_ANCESTORS` — dominios que pueden embeber el quiz en iframe, por ejemplo `https://neurobalance.com`
3. **Local:** `npm install` y `npm run dev` → http://localhost:3000
   Sin variables de Supabase la app funciona en *modo demostración* (datos en memoria).
4. **Vercel:** importa el repositorio, agrega las variables y despliega. Sugerido: subdominio `quiz.<dominio-del-cliente>`.
5. **Guías PDF.** Sube las finales a `public/guias/` o a cualquier URL pública y actualiza los enlaces en `/admin → Reglas y guías`. Las que vienen son provisionales.

### Insertar en WordPress / Elementor

```html
<iframe src="https://quiz.tudominio.com" style="width:100%;min-height:900px;border:0" title="Quiz Perfil Cerebral"></iframe>
```

Los parámetros UTM de la URL (`?utm_source=instagram`) se guardan con cada respuesta.

## Flujo

Bienvenida → registro (nombre, correo, teléfono opcional, aviso de privacidad, consentimiento comercial separado) → sobre quién y edad → 6 bloques de 6 preguntas → contexto P37–P39 → P40–P42 → resultado.

- El lead se guarda al terminar el registro (`status = started`); así se conservan los contactos que no terminan.
- Al terminar se calcula en el servidor, se guarda (`status = completed`) y se envía a las integraciones activas. Un fallo en una integración nunca bloquea el resultado; queda registrado en `integrations_log` y se ve en el panel.

## Reglas de cálculo (`lib/scoring.ts`)

- Indicador = promedio de respuestas válidas × 25. "No observado" = `null`, no entra al promedio. Bloque sin respuestas válidas = `null`.
- Mínimos de completitud (editables): 9/12 por bloque de fortalezas y 4/6 por bloque de retos → si no se alcanzan, "información insuficiente".
- FL − FR ≥ 15 → rojo · FR − FL ≥ 15 → azul · diferencia menor → combinado (ambas guías).
- Retos: se muestran solo los marcados desde "Frecuentemente" (editable). Nunca se restan de las fortalezas ni se infieren del lado opuesto.
- 0–5 años: por defecto no se asigna perfil ni se muestran puntajes, hasta tener la versión adaptada (editable).
- P37–P42 no puntúan. P42 admite hasta 3 opciones; "No identifico factores" excluye las demás.

Pruebas: `npm run test:scoring`

## Panel `/admin`

- **Respuestas:** totales por perfil, filtros, detalle de cada respuesta (P01–P36, consentimiento, origen, estado de envíos) y **Exportar CSV**.
- **Reglas y guías:** umbrales, modo para menores de 6 años, URLs de las guías, aviso de privacidad y nota de correo.
- **Integraciones:** activar o desactivar cada destino y **Enviar prueba**.

## Integraciones

Todos los destinos reciben el mismo JSON plano (una fila): datos del lead, consentimientos, configuración, resultado, FL/FR/RL/RR, URLs de guía, P01–P36 en texto, P37–P42 en texto y UTMs.

### GoHighLevel
- **Inbound webhook (recomendado):** crea un workflow con el disparador *Inbound Webhook*, pega su URL en el panel y usa *Enviar prueba* para que GHL detecte los campos. Después mapea contacto, campos personalizados (perfil, FL, FR…) y agrega la acción de correo con el enlace a la guía según `result`.
- **API v2:** usa un *Private Integration Token* con permiso de contactos y el Location ID. Crea o actualiza el contacto con las etiquetas configuradas y `neurobalance-red`, `-blue`, `-combined` o `-insufficient`.

### Google Sheets
1. En la hoja: Extensiones → Apps Script, pega el código de abajo y cambia `SECRET`.
2. Implementar → Nueva implementación → Aplicación web · Ejecutar como: *yo* · Acceso: *cualquier usuario*.
3. Pega la URL `/exec` y la clave en el panel.

```javascript
const SECRET = "cambia-esta-clave";
function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  if (body.secret !== SECRET) return ContentService.createTextOutput("unauthorized");
  const row = body.row;
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  let headers = sh.getLastRow() ? sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0] : [];
  const keys = Object.keys(row);
  if (!headers.length) { headers = keys; sh.appendRow(headers); }
  keys.filter(k => !headers.includes(k)).forEach(k => { headers.push(k); sh.getRange(1, headers.length).setValue(k); });
  sh.appendRow(headers.map(h => row[h] ?? ""));
  return ContentService.createTextOutput("ok");
}
```

### Microsoft (Excel, SharePoint o Dataverse)
1. Power Automate → flujo automatizado con *Cuando se recibe una solicitud HTTP*.
2. Para el esquema JSON, usa *Generar a partir de muestra* con el payload de una prueba.
3. Agrega *Agregar una fila a una tabla* (Excel Online) o *Crear elemento* (SharePoint) y mapea los campos.
4. Guarda, copia la URL del disparador y pégala en el panel.

### Webhook genérico
Para Zapier, Make, n8n u otro CRM. Envía el encabezado opcional `X-Webhook-Secret`.

## Pendientes editoriales
- Validar con Neurobalance los textos de perfil y retos (`lib/texts.ts`, `CHALLENGE_LABELS` en `lib/questions.ts`) y la versión en primera persona de las preguntas.
- Guías PDF finales roja y azul.
- Versión de reactivos para 0–5 años.
- Aviso de privacidad (LFPDPPP).

## Estructura
```
app/                páginas y endpoints (/api/start, /api/submit, /api/admin/*)
components/         Quiz, ResultView, Admin, Hemispheres
lib/questions.ts    banco de 42 preguntas (sobre mí / sobre otra persona) y metadatos
lib/scoring.ts      cálculo y clasificación
lib/settings.ts     parámetros editables y valores por defecto
lib/integrations.ts envío a GHL, Sheets, Microsoft y webhooks
supabase/schema.sql esquema de base de datos
```
