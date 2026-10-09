// Gera uma página para cada vaga (vagas/<slug>/index.html) a partir do index.html.
// Roda sozinho no Netlify a cada publicação. Serve para o link direto da vaga
// e para a prévia do WhatsApp mostrar o nome da vaga.
const fs = require("fs");
const path = require("path");
const raiz = path.join(__dirname, "..");
const SITE = "https://black.foradacaixacarreiras.com.br";
const html = fs.readFileSync(path.join(raiz, "index.html"), "utf8");
const m = html.match(/const VAGAS = (\[[\s\S]*?\n\]);/);
if (!m) throw new Error("Lista VAGAS não encontrada no index.html");
const VAGAS = new Function("return " + m[1])();
const esc = t => String(t).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const troca = (h, re, novo) => { if (!re.test(h)) throw new Error("Não achei " + re); return h.replace(re, novo); };
fs.rmSync(path.join(raiz, "vagas"), { recursive: true, force: true });
let n = 0;
for (const v of VAGAS) {
  if (!v.slug) continue;
  const url = `${SITE}/vagas/${v.slug}`;
  const titulo = `Vaga: ${v.titulo} · Fora da Caixa Black`;
  const desc = v.chamada || [v.onde, v.paraQuem, v.modelo].filter(Boolean).join(". ");
  let h = html;
  h = troca(h, /<html lang="pt-BR">/, `<html lang="pt-BR" data-vaga-pagina="${esc(v.slug)}">`);
  h = troca(h, /<title>[^<]*<\/title>/, `<title>${esc(titulo)}</title>`);
  h = troca(h, /<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(desc)}">`);
  h = troca(h, /<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url}">\n<link rel="canonical" href="${url}">`);
  h = troca(h, /<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(titulo)}">`);
  h = troca(h, /<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(desc)}">`);
  const dir = path.join(raiz, "vagas", v.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), h);
  console.log("Página gerada: /vagas/" + v.slug);
  n++;
}
console.log(n + " página(s) de vaga.");
