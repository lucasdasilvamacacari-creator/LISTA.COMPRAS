/**
 * Normalização de texto para busca e para gerar ids.
 *
 * Tudo em minúsculas, sem acento e sem pontuação, porque é assim que a
 * pessoa digita com pressa no corredor do mercado.
 */

/** "Pão de Açúcar!" → "pao de acucar" */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Slug estável usado como id de documento no Firestore.
 * "Leite integral" → "leite-integral"
 *
 * Determinístico de propósito: dois aparelhos offline que digitam o mesmo
 * nome geram o MESMO id e, por isso, escrevem no mesmo documento em vez de
 * criar duplicatas.
 */
export function slug(texto: string): string {
  const base = normalizar(texto).replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  // Limite de segurança: ids de documento do Firestore vão até 1500 bytes,
  // mas ids curtos deixam a URL e os logs legíveis.
  return base.slice(0, 80);
}

/** Primeira letra maiúscula, preservando o resto como o usuário escreveu. */
export function capitalizar(texto: string): string {
  const limpo = texto.trim().replace(/\s+/g, ' ');
  if (!limpo) return '';
  return limpo.charAt(0).toLocaleUpperCase('pt-BR') + limpo.slice(1);
}

/**
 * Distância de Levenshtein com limite (early exit).
 * Usada para tolerar erro de digitação: "arros" → "arroz".
 * Retorna um número > limite quando passa do limite (não precisamos do valor exato).
 */
export function distancia(a: string, b: string, limite = 2): number {
  if (a === b) return 0;
  const la = a.length;
  const lb = b.length;
  if (Math.abs(la - lb) > limite) return limite + 1;
  if (la === 0) return lb;
  if (lb === 0) return la;

  let anterior = new Array<number>(lb + 1);
  let atual = new Array<number>(lb + 1);
  for (let j = 0; j <= lb; j++) anterior[j] = j;

  for (let i = 1; i <= la; i++) {
    atual[0] = i;
    let melhorNaLinha = atual[0] as number;
    for (let j = 1; j <= lb; j++) {
      const custo = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      const valor = Math.min(
        (anterior[j] as number) + 1,
        (atual[j - 1] as number) + 1,
        (anterior[j - 1] as number) + custo,
      );
      atual[j] = valor;
      if (valor < melhorNaLinha) melhorNaLinha = valor;
    }
    if (melhorNaLinha > limite) return limite + 1;
    const troca = anterior;
    anterior = atual;
    atual = troca;
  }

  return anterior[lb] as number;
}

/**
 * Quebra uma fala em possíveis itens.
 * "leite, ovos e pão" → ["leite", "ovos", "pão"]
 */
export function separarItensFalados(texto: string): string[] {
  return texto
    .split(/[,;\n]|\be\b|\bmais\b|\btambém\b|\bentão\b/gi)
    .map((parte) => parte.trim())
    .filter((parte) => parte.length >= 2)
    .slice(0, 20);
}
