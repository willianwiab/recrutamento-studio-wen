/* Studio WEN — formulário de candidatura
   Envio via Formspree (https://formspree.io). Nada é salvo no navegador. */

/* ============================================================
   CONFIGURAÇÃO — único lugar a editar.
   Cole aqui o endpoint do seu formulário no Formspree, no formato
   "https://formspree.io/f/XXXXXXXX". Enquanto estiver vazio, a página
   NÃO envia candidaturas e mostra um aviso de indisponibilidade.
   ============================================================ */
const FORM_ENDPOINT = "";

const ASSUNTO = "Candidatura freelancer — Audiovisual Studio WEN";
const TEMPO_LIMITE_MS = 20000;

(function () {
  "use strict";

  const form = document.getElementById("form-candidatura");
  if (!form) return;

  const btn = document.getElementById("btn-enviar");
  const status = document.getElementById("form-status");
  const avisoIndisponivel = document.getElementById("form-indisponivel");
  const sucesso = document.getElementById("form-sucesso");
  const textoBotao = btn.textContent;
  const configurado = /^https:\/\/formspree\.io\/f\/[A-Za-z0-9]+$/.test(FORM_ENDPOINT.trim());
  let enviando = false;

  if (!configurado) avisoIndisponivel.hidden = false;

  /* ---------- Opção exclusiva: "Ainda não tenho experiência prática" ---------- */
  const grupoContato = form.querySelectorAll('input[name="contato"]');
  grupoContato.forEach(function (cb) {
    cb.addEventListener("change", function () {
      if (!cb.checked) return;
      if (cb.hasAttribute("data-exclusive")) {
        grupoContato.forEach(function (o) { if (o !== cb) o.checked = false; });
      } else {
        grupoContato.forEach(function (o) { if (o.hasAttribute("data-exclusive")) o.checked = false; });
      }
    });
  });

  /* ---------- Validação ---------- */
  function soDigitos(v) { return v.replace(/\D/g, ""); }

  function celularValido(valor) {
    const v = valor.trim();
    if (!/^[\d\s()+\-.]+$/.test(v)) return false;
    let d = soDigitos(v);
    if (v.startsWith("+")) {
      if (!d.startsWith("55")) return false;
      d = d.slice(2);
    } else if ((d.length === 12 || d.length === 13) && d.startsWith("55")) {
      d = d.slice(2);
    }
    // celular brasileiro: DDD (11 a 99) + 9 + 8 dígitos
    return /^[1-9][1-9]9\d{8}$/.test(d);
  }

  function emailValido(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
  }

  function urlValida(v) {
    const t = v.trim();
    if (!t) return true;
    try {
      const u = new URL(/^https?:\/\//i.test(t) ? t : "https://" + t);
      return u.hostname.includes(".");
    } catch (e) { return false; }
  }

  function marcados(nome) {
    return Array.from(form.querySelectorAll('input[name="' + nome + '"]:checked')).map(function (i) { return i.value; });
  }

  function setErro(alvo, erroId, msg) {
    const p = document.getElementById(erroId);
    if (p) p.textContent = msg || "";
    if (msg) alvo.setAttribute("aria-invalid", "true");
    else alvo.removeAttribute("aria-invalid");
  }

  const regrasCampos = [
    { id: "f-nome", msg: function (v) { return v.trim().length < 3 || !/\s/.test(v.trim()) ? "Informe seu nome completo." : ""; } },
    { id: "f-celular", msg: function (v) {
        if (!v.trim()) return "Informe seu celular com DDD.";
        return celularValido(v) ? "" : "Confira o número: use DDD + número, por exemplo (11) 91234-5678.";
      } },
    { id: "f-email", msg: function (v) {
        if (!v.trim()) return "Informe seu e-mail.";
        return emailValido(v) ? "" : "Confira o e-mail, por exemplo nome@exemplo.com.";
      } },
    { id: "f-local", msg: function (v) { return v.trim().length < 3 ? "Informe sua cidade e bairro." : ""; } },
    { id: "f-portfolio", msg: function (v) { return urlValida(v) ? "" : "Confira o link, por exemplo https://instagram.com/seuperfil."; } },
    { id: "f-experiencia", msg: function (v) { return v.trim().length < 10 ? "Conte um pouco sobre você, mesmo que esteja começando." : ""; } },
    { id: "f-curriculo", msg: function (v) { return v.trim().length < 20 ? "Conte um pouco da sua trajetória ou cole aqui o texto do seu currículo." : ""; } },
    { id: "f-curriculo-link", msg: function (v) { return urlValida(v) ? "" : "Confira o link, por exemplo https://drive.google.com/..."; } },
    { id: "f-situacao", msg: function (v) { return v.trim().length < 5 ? "Responda com suas palavras." : ""; } },
    { id: "f-problemas", msg: function (v) { return v.trim().length < 5 ? "Responda com suas palavras." : ""; } },
    { id: "f-antecedencia", msg: function (v) { return !v.trim() ? "Informe a antecedência de que você precisa." : ""; } },
    { id: "f-inicio", msg: function (v) { return !v.trim() ? "Informe quando poderia começar." : ""; } }
  ];

  const regrasGrupos = [
    { id: "g-nivel", nome: "nivel", msg: "Escolha uma opção." },
    { id: "g-contato", nome: "contato", msg: "Marque pelo menos uma opção." },
    { id: "g-dias", nome: "dias", msg: "Marque pelo menos um dia." },
    { id: "g-periodos", nome: "periodos", msg: "Marque pelo menos um período." },
    { id: "g-fds", nome: "fim_de_semana", msg: "Escolha uma opção." }
  ];

  function validarCampo(regra) {
    const el = document.getElementById(regra.id);
    const msg = regra.msg(el.value);
    setErro(el, regra.id + "-erro", msg);
    return msg ? el : null;
  }

  function validarGrupo(regra) {
    const fs = document.getElementById(regra.id);
    const msg = marcados(regra.nome).length ? "" : regra.msg;
    setErro(fs, regra.id + "-erro", msg);
    return msg ? fs.querySelector("input") : null;
  }

  function validarTudo() {
    const invalidos = [];
    regrasCampos.forEach(function (r) { const e = validarCampo(r); if (e) invalidos.push(e); });
    regrasGrupos.forEach(function (r) { const e = validarGrupo(r); if (e) invalidos.push(e); });
    // primeiro inválido na ordem visual da página
    invalidos.sort(function (a, b) {
      return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });
    return invalidos[0] || null;
  }

  // Revalida ao sair do campo (só se já mostrou erro ou foi preenchido) e limpa o erro ao corrigir
  regrasCampos.forEach(function (r) {
    const el = document.getElementById(r.id);
    el.addEventListener("blur", function () { if (el.value.trim() || el.getAttribute("aria-invalid")) validarCampo(r); });
    el.addEventListener("input", function () { if (el.getAttribute("aria-invalid")) validarCampo(r); });
  });
  regrasGrupos.forEach(function (r) {
    document.getElementById(r.id).addEventListener("change", function () {
      if (document.getElementById(r.id).getAttribute("aria-invalid")) validarGrupo(r);
    });
  });

  /* ---------- Status ---------- */
  function mostrarStatus(html, tipo) {
    status.className = "notice " + (tipo === "erro" ? "notice-error" : "notice-warn");
    status.innerHTML = html;
    status.hidden = false;
  }
  function limparStatus() { status.hidden = true; status.innerHTML = ""; }

  function setEnviando(sim) {
    enviando = sim;
    btn.disabled = sim;
    btn.setAttribute("aria-busy", sim ? "true" : "false");
    btn.textContent = sim ? "Enviando..." : textoBotao;
  }

  /* ---------- Monta os dados com nomes claros para o e-mail ---------- */
  function montarDados() {
    const v = function (id) { return document.getElementById(id).value.trim(); };
    const email = v("f-email");
    const comHttps = function (u) { return u && !/^https?:\/\//i.test(u) ? "https://" + u : u; };
    const portfolio = comHttps(v("f-portfolio"));
    const curriculoLink = comHttps(v("f-curriculo-link"));

    return {
      "Nome completo": v("f-nome"),
      "Celular/WhatsApp": v("f-celular"),
      "E-mail": email,
      "Cidade e bairro": v("f-local"),
      "Portfólio ou rede profissional": portfolio || "(não informado)",
      "1. Nível de conhecimento em audiovisual": marcados("nivel").join(""),
      "2. Atividades/equipamentos com que já teve contato": marcados("contato").join(", "),
      "3. Experiência e o que gostaria de aprender": v("f-experiencia"),
      "Currículo (resumo)": v("f-curriculo"),
      "Currículo (link)": curriculoLink || "(não informado)",
      "4. Terminou a tarefa e a equipe precisa de ajuda — o que faria": v("f-situacao"),
      "5. Como lida com dúvidas ou problemas técnicos": v("f-problemas"),
      "6. Dias disponíveis": marcados("dias").join(", "),
      "7. Períodos disponíveis": marcados("periodos").join(", "),
      "8. Disponível nos fins de semana": marcados("fim_de_semana").join(""),
      "9. Antecedência necessária": v("f-antecedencia"),
      "10. Quando poderia começar": v("f-inicio"),
      "11. Restrições de horário ou compromissos": v("f-restricoes") || "(nenhuma informada)",
      // campos especiais do Formspree
      "_replyto": email,
      "_subject": ASSUNTO,
      "_gotcha": document.getElementById("f-website").value
    };
  }

  /* ---------- Envio ---------- */
  form.addEventListener("submit", async function (ev) {
    ev.preventDefault();
    if (enviando) return;
    limparStatus();

    const primeiroInvalido = validarTudo();
    if (primeiroInvalido) {
      mostrarStatus("<strong>Confira os campos destacados.</strong> Algumas respostas obrigatórias estão faltando ou precisam de ajuste.", "erro");
      primeiroInvalido.scrollIntoView({ block: "center" });
      primeiroInvalido.focus({ preventScroll: true });
      return;
    }

    if (!configurado) {
      mostrarStatus("<strong>As candidaturas estão temporariamente indisponíveis.</strong> Suas respostas continuam preenchidas nesta página. Por favor, tente novamente mais tarde.", "aviso");
      return;
    }

    setEnviando(true);
    const controle = new AbortController();
    const timer = setTimeout(function () { controle.abort(); }, TEMPO_LIMITE_MS);

    try {
      const resp = await fetch(FORM_ENDPOINT.trim(), {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(montarDados()),
        signal: controle.signal
      });

      let corpo = null;
      try { corpo = await resp.json(); } catch (e) { /* resposta sem JSON */ }

      if (resp.ok && (!corpo || corpo.ok !== false)) {
        form.hidden = true;
        avisoIndisponivel.hidden = true;
        sucesso.hidden = false;
        sucesso.focus();
        return;
      }

      throw new Error("resposta " + resp.status);
    } catch (erro) {
      const msgRede = erro && erro.name === "AbortError"
        ? "O envio demorou mais que o esperado."
        : "Não foi possível enviar sua candidatura agora.";
      mostrarStatus("<strong>" + msgRede + "</strong> Suas respostas foram mantidas. Verifique sua conexão e toque em “Enviar candidatura” novamente.", "erro");
      status.setAttribute("tabindex", "-1");
      status.focus();
    } finally {
      clearTimeout(timer);
      if (!form.hidden) setEnviando(false);
    }
  });
})();
