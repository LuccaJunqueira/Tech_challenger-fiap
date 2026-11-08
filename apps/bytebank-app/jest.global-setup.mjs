/**
 * Fixa o fuso do processo de teste em America/Sao_Paulo.
 *
 * `process.env.TZ` atribuído dentro de um teste não altera o `Date` do worker
 * (o Jest isola o ambiente). O globalSetup roda no processo principal antes
 * dos workers serem criados, então o valor já nasce valendo para todos.
 */
export default async function globalSetup() {
  process.env.TZ = "America/Sao_Paulo";
}
