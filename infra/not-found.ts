// Código injetado nas funções do CloudFront do site (sst.config.ts), para endereços que não
// existem receberem a 404.html com status 404.
//
// O roteador do SST manda tudo que está em /blog direto para o S3, sem conferir se o arquivo
// existe: um post que não existe virava o "acesso negado" do S3. E o indexPage serve a 404.html
// com status 200. Então:
// - na entrada (viewer request), um endereço que não é página conhecida (/, /blog/,
//   /blog/<post>/) nem arquivo de um post conhecido vira /404.html, marcado num cabeçalho;
// - na saída (viewer response), esse pedido, ou um arquivo da raiz que não existe (/foo.xml,
//   que volta como a página HTML do indexPage), passa a ter status 404.
//
// As funções do CloudFront têm limite de 10 KB e o código do SST ocupa a maior parte: daí os
// nomes curtos (com _ para não colidir com os do SST) e nada de comentários no código injetado.
export function notFoundEdge(slugs: string[]) {
  const posts = slugs.join("|");
  const page = `^\\/(blog\\/((${posts})\\/)?)?$`;
  const postFile = `^\\/blog\\/(${posts})\\/[^/]+$`;

  const request = [
    `var _rq = event.request, _ru = _rq.uri;`,
    `_rq.headers["x-rfoel-path"] = { value: _ru };`,
    `var _rk = /\\.[^/]*$/.test(_ru) ? !/^\\/blog\\/[^/]+\\//.test(_ru) || /${postFile}/.test(_ru) : /${page}/.test(_ru.replace(/\\/?$/, "/"));`,
    `if (!_rk) { _rq.headers["x-rfoel-404"] = { value: "1" }; _rq.uri = "/404.html"; }`,
  ].join("\n");

  const response = [
    `var _sq = event.request.headers, _ss = event.response;`,
    `var _sp = (_sq["x-rfoel-path"] || { value: event.request.uri }).value;`,
    `var _st = (_ss.headers["content-type"] || { value: "" }).value;`,
    `var _sm = _ss.statusCode === 200 && /\\.[^/]*$/.test(_sp) && !/\\.html$/.test(_sp) && /^text\\/html/.test(_st);`,
    `if (_sq["x-rfoel-404"] || _sm) { _ss.statusCode = 404; _ss.statusDescription = "Not Found"; }`,
  ].join("\n");

  return { request, response };
}
