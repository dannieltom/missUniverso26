// Muestra un número con los decimales indicados SIN redondear: 9.769 se ve como 9.76.
export function truncarTexto(valor: number, decimales: number): string {
  const factor = 10 ** decimales;
  // El pequeño margen evita errores de punto flotante (por ejemplo 9.7 * 100 = 969.9999...).
  const truncado = Math.floor(valor * factor + 1e-9) / factor;
  return truncado.toFixed(decimales);
}
