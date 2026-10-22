# Recrutamento — Freelancer de Audiovisual (Studio WEN)

Página estática (HTML, CSS e JavaScript puros, sem build) para divulgar a vaga freelancer de
audiovisual do Studio WEN e receber candidaturas por e-mail em **contato@wenprodutora.com.br**,
via [Formspree](https://formspree.io).

```
index.html     página completa (textos, seções e formulário)
styles.css     visual (cores no topo, em :root)
script.js      validação e envio do formulário — o endpoint fica na 1ª linha de configuração
assets/        logotipo e fotos reais do estúdio
README.md      este guia
```

> **Estado atual:** a página está completa, mas o envio **ainda não está ativo** — falta criar o
> formulário no Formspree e colar o endpoint (passo 4). Até lá, a página mostra aos candidatos
> que as candidaturas estão temporariamente indisponíveis e não envia nada.

---

## 1. Testar localmente

Os caminhos são relativos, então basta servir a pasta:

```bash
cd recrutamento-studio-wen
python3 -m http.server 8000
```

Abra http://localhost:8000. (Abrir o `index.html` direto pelo Finder também funciona para ver o
layout, mas o envio do formulário só deve ser testado servido por HTTP.)

Testes rápidos:
- Clique em **Enviar candidatura** com tudo vazio: cada campo obrigatório mostra o erro e o foco vai
  para o primeiro.
- Marque "Ainda não tenho experiência prática": as outras opções da pergunta 2 são desmarcadas (e
  vice-versa).
- Celular aceita `(11) 91234-5678`, `11 91234-5678`, `+55 11 91234-5678`, `5511912345678`.

## 2. Substituir fotos e logotipo

| Arquivo | Onde aparece | Proporção exibida |
|---|---|---|
| `assets/logo-wen.webp` | cabeçalho e rodapé (versão para fundo escuro) | original, sem distorção |
| `assets/favicon.png` | ícone da aba | quadrado |
| `assets/studio-principal.webp` | abertura (foto grande) | 16:9 |
| `assets/studio-bastidores.jpg` | "Conheça o Studio WEN" | 4:3 (recorte central) |
| `assets/studio-controle.webp` | galeria — controle técnico | 4:3 |
| `assets/studio-cameras.jpg` | galeria — câmeras e set | 4:3 |
| `assets/studio-cenarios.jpg` | galeria — cenário de entrevista | 4:3 |

As fotos atuais são as mesmas do site oficial e das LPs do Studio A/B.

Para trocar uma foto: substitua o arquivo mantendo o nome **ou** altere o `src` correspondente no
`index.html`. Atualize também o `alt` (descrição da foto), `width` e `height` (dimensões reais
em pixels — evitam que a página "pule" ao carregar). Recomendações: 1600 px de largura,
JPG/WebP abaixo de ~300 KB.

## 3. Editar descrição, serviços e localização

Tudo está no `index.html`, marcado por comentários:

- `<!-- 3. CONHEÇA O STUDIO WEN -->` — os dois parágrafos e o bloco "Onde fica" (bairro, endereço
  e o link do botão **Ver localização**, que abre o Google Maps em nova aba).
- `<!-- 4. SERVIÇOS -->` — os quatro cartões de serviço.
- `<!-- 8. A OPORTUNIDADE -->` — condições da vaga freelancer.
- `<!-- 10. RODAPÉ -->` — endereço e contato.
- No `<head>`: `<title>` e `<meta name="description">` (o que aparece ao compartilhar o link).

## 4. Configurar e ativar o envio (Formspree)

O GitHub Pages só hospeda arquivos estáticos; quem recebe as candidaturas e as manda por e-mail é
o Formspree. Nenhuma senha ou token fica no código — o endpoint é público por natureza.

### 4.1 Criar o formulário
1. Acesse https://formspree.io e crie uma conta **com o e-mail contato@wenprodutora.com.br**
   (ou adicione esse e-mail como destino depois, em *Account → Linked Emails*).
2. Clique em **+ New Form**. Nome sugerido: `Recrutamento freelancer audiovisual`.
   Em *Send emails to*, escolha `contato@wenprodutora.com.br`.
3. O Formspree envia um e-mail de verificação para `contato@wenprodutora.com.br`.
   **Abra a caixa e clique em confirmar** — sem isso, nenhuma candidatura é entregue.
4. Copie o endpoint do formulário, no formato `https://formspree.io/f/abcdwxyz`.

### 4.2 Colar o endpoint
No início do `script.js`:

```js
const FORM_ENDPOINT = "https://formspree.io/f/abcdwxyz";
```

É o **único** lugar a alterar. Com o endpoint preenchido, o aviso de indisponibilidade some e o
botão passa a enviar.

### 4.3 Assunto e endereço de resposta
O próprio formulário já envia:
- `_subject` = **Candidatura freelancer — Audiovisual Studio WEN** (assunto do e-mail);
- `_replyto` = e-mail do candidato (clicar em *Responder* responde direto ao candidato).

Nada a configurar no painel para isso. Os campos chegam com nomes legíveis e numerados
("Nome completo", "1. Nível de conhecimento em audiovisual", …, "11. Restrições de horário").

### Currículo
O candidato informa o currículo em duas partes: um **resumo em texto** (obrigatório) e um **link**
opcional (Google Drive, Dropbox, LinkedIn). Não há envio de arquivo: o upload de anexos no
Formspree só existe nos planos pagos. Se um dia contratar um desses planos, dá para trocar o
campo de link por um `<input type="file">` e enviar com `FormData` em vez de JSON.

### 4.4 Proteção contra spam
- **Honeypot** (`_gotcha`): já incluído no formulário, invisível para pessoas. Se um robô o
  preencher, o Formspree descarta o envio. Nada a configurar.
- **reCAPTCHA**: a página envia via JavaScript (AJAX). No painel, em *Settings → reCAPTCHA*,
  **desligue o reCAPTCHA padrão** do Formspree — com ele ligado, envios por AJAX são recusados e o
  candidato veria a mensagem de erro. (Nos planos pagos é possível usar uma chave reCAPTCHA própria
  em vez de desligar.)
- **Domínio permitido** (*Settings → Restrict to Domain*, se o seu plano tiver): informe o domínio
  do GitHub Pages, por exemplo `usuario.github.io`, para que o formulário só aceite envios da
  página publicada. Configure **depois** de testar localmente, ou o teste local será recusado.
- Opcional: ativar o filtro de spam do Formspree (*Settings → Spam*), quando disponível no plano.

> Limite do plano gratuito do Formspree: verifique a cota mensal de envios no painel antes de
> divulgar o link em larga escala.

## Contador de visitas

Cada navegador que abre a página soma **1** num contador do serviço gratuito Abacus
(`abacus.jasoncameron.dev`), sem cookies e sem dado pessoal. Quem volta à página no mesmo
navegador não conta de novo, então o número se aproxima de "pessoas que acessaram".
Nada aparece para o candidato.

Para ver o número, abra **`visitas.html`** (ex.: `https://USUARIO.github.io/recrutamento-studio-wen/visitas.html`).
Essa página não tem link em lugar nenhum e não aparece no Google.

O contador fica no fim do `script.js` (constante `CONTADOR_URL`).

## 5. Publicar pelo GitHub Pages

1. Crie um repositório (ex.: `recrutamento-studio-wen`) e envie **o conteúdo desta pasta** para
   a raiz dele (o `index.html` precisa ficar na raiz).
   ```bash
   git init
   git add .
   git commit -m "Página de recrutamento — freelancer audiovisual"
   git branch -M main
   git remote add origin https://github.com/USUARIO/recrutamento-studio-wen.git
   git push -u origin main
   ```
2. No GitHub: *Settings → Pages → Build and deployment → Source: Deploy from a branch* →
   branch `main`, pasta `/ (root)` → **Save**.
3. Em 1–2 minutos o link fica disponível em `https://USUARIO.github.io/recrutamento-studio-wen/`.
   Todos os caminhos são relativos, então funciona dentro desse subdiretório.
4. (Opcional) Para a prévia ficar bonita no WhatsApp, troque no `<head>` o `og:image` por um
   endereço absoluto: `https://USUARIO.github.io/recrutamento-studio-wen/assets/studio-principal.webp`.

A página tem `noindex` (não aparece no Google) — ela é feita para ser enviada por link. Para
deixá-la buscável, remova a linha `<meta name="robots" content="noindex">`.

Nenhuma candidatura é gravada no repositório, no navegador ou em arquivo público: os dados vão
direto do navegador do candidato para o Formspree, que os entrega por e-mail.

## 6. Candidatura de teste — antes de divulgar o link

1. Abra a página **publicada** (link do GitHub Pages), de preferência no celular.
2. Preencha tudo com dados de teste (use um e-mail seu como "candidato") e clique em
   **Enviar candidatura**.
3. Deve aparecer "Candidatura enviada! …". Se aparecer erro, confira: endpoint colado
   corretamente, reCAPTCHA desligado, domínio permitido correto.
4. Confira em **contato@wenprodutora.com.br** (inclusive no spam):
   - assunto **Candidatura freelancer — Audiovisual Studio WEN**;
   - todos os campos presentes e legíveis;
   - *Responder* endereçado ao e-mail digitado no teste.
5. Confira também em *Submissions* no painel do Formspree. Se o e-mail chegou no spam, marque
   como "não é spam".
6. Só depois disso envie o link aos candidatos.
