# Fala Real Academy v3 — Web + Android + IA

Aplicativo de inglês pronto para funcionar no navegador pela Vercel e como aplicativo Android.

## Site na Vercel

O site está na raiz do repositório (`index.html`) e não exige etapa de build. Ao importar o repositório na Vercel, mantenha:

- Framework Preset: `Other`
- Build Command: vazio
- Output Directory: `.`

A configuração de segurança e microfone está em `vercel.json`. O navegador solicita o microfone na primeira utilização e reutiliza essa autorização enquanto ela permanecer liberada para o domínio.

## Modo História

- Histórias para níveis iniciante, intermediário e avançado.
- Tradução em português acima de cada trecho em inglês.
- Narração automática em inglês.
- Destaque e rolagem progressiva conforme a leitura.
- Controles de reprodução, navegação e velocidade.

## Estrutura

```text
.github/workflows/android.yml
.github/workflows/backend-test.yml
app/
backend/
build.gradle
gradle.properties
settings.gradle
render.yaml
README.md
```

## Gerar APK

1. Envie o conteúdo desta pasta para a raiz do repositório.
2. GitHub → Actions.
3. Abra `Gerar APK Fala Real v2`.
4. `Run workflow`.
5. Baixe o artefato `Fala-Real-v2-APK`.
6. Dentro estará `app-debug.apk`.

## Backend da IA

A chave da IA não fica no APK.

No Render (ou outro servidor Node), aponte para a pasta `backend/` e configure:

- `GEMINI_API_KEY`
- `APP_ACCESS_TOKEN`
- `GEMINI_MODEL=gemini-3.6-flash`

O arquivo `render.yaml` já está incluído.

Depois do deploy, copie a URL HTTPS.

No aplicativo:

1. Tela inicial → `⚙️ IA`
2. Cole a URL do backend.
3. Digite o mesmo `APP_ACCESS_TOKEN`.
4. Toque `🧪 Testar`.

## Conversa IA

- Fale ou digite em inglês.
- A IA responde em inglês.
- A resposta é lida em voz alta.
- Ao finalizar, o app gera relatório de gramática, vocabulário, fluência, naturalidade, correções e plano de estudo.
- A pontuação de pronúncia é apenas aproximada, baseada no reconhecimento de voz, não em análise acústica de fonemas.

## Redação

- Inglês ou português.
- Tema guiado ou modo livre.
- Banca IA.
- Texto completo corrigido permanece no mesmo idioma em que foi escrito.
- Correção gramatical, ortográfica, coesão, argumentos, vocabulário e naturalidade.
- A banca local offline continua disponível.

## Dicas de palavras

Toque nas palavras em inglês sublinhadas para abrir uma dica em português e ouvir a pronúncia.
