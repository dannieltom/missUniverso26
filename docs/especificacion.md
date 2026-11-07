# Especificación: app de calificación en vivo, Miss Universo 2026 (Puerto Rico)

## 1. Objetivo
Aplicación web para seguir el Miss Universo 2026 en vivo. Cada persona califica a las candidatas en cada ronda mientras ve la transmisión. El sistema calcula los rankings, los compara con los resultados oficiales y, cuando el certamen anuncia quiénes avanzan, cambia el grupo de candidatas de la siguiente ronda. Puede usarse sola o en partida con amigos, como juego.

## 2. Modos de uso
- **Individual:** sin sala ni código. La persona inicia sesión con Google y usa la app para ella. Tiene su historial y sus aciertos contra los resultados oficiales.
- **Partida (sala):** alguien crea una sala y recibe un código corto (ej. `MU-7K3P`) y un enlace. Los demás inician sesión con Google, entran con el código y todos ven el marcador en vivo.
- **Sin sala, varias personas:** cada amigo usa la app por su cuenta, sin marcador compartido.
- **Inicio de sesión obligatorio:** para usar la app se requiere iniciar sesión con Google. Google maneja la identidad y la recuperación de acceso, así que no hay código de recuperación ni apodo anónimo. El apodo se toma del nombre de la cuenta y puede cambiarse dentro de la app.
- **Participación parcial:** cada persona o sala elige qué rondas jugar. Nada es obligatorio.

## 3. Rondas
Cada ronda es independiente: tiene sus criterios, su grupo de candidatas, su ranking y su marcador. No se suman puntajes entre rondas.

**R1. Desfile de traje típico**
- Todas las candidatas. Cada una se califica de 1.0 a 10.0. No hay tops ni cortes.
- El sistema muestra el ranking de mayor a menor puntaje.

**R2. Competencia preliminar**
- Subsección **Traje de baño:** pasarela y puntaje de 1.0 a 10.0.
- Subsección **Traje de gala (vestido de noche):** pasarela y vestido, de 1.0 a 10.0.
- La entrevista con el jurado no se califica en la app.
- Todas las candidatas. Sin tops oficiales en esta ronda.
- Su ranking define a las semifinalistas predichas. El sistema genera automáticamente el top N según el puntaje. N es editable por el administrador, porque la lista oficial aún no se conoce.

**R3. Noche final, parte 1 (semifinalistas)**
- Al anunciar las semifinalistas, el administrador carga el grupo oficial. La cantidad de semifinalistas es editable.
- El grupo de la ronda pasa a ser el oficial. Mientras no se haya cargado, el grupo es el de tus picks.
- Subsecciones: traje de baño y vestido de noche, con puntaje de 1.0 a 10.0.
- Compara tus semifinalistas predichas con las oficiales y muestra aciertos.

**R4. Noche final, parte 2 (Top 5)**
- Al anunciar el Top 5, el administrador carga el grupo oficial. Reemplaza el top 5 que tú habías elegido. La cantidad de candidatas del corte también es editable.
- Sobre ese grupo oficial se califican las preguntas y la oratoria. La oratoria solo existe en esta parte.
- Compara tus picks de Top 5 con los oficiales.

**R5. Ganadora**
- Pick de la ganadora. Suma puntos si acierta.
- La ganadora se decide solo con las rondas de noche final (R3 y R4). La preliminar no cuenta para la ganadora.
- Ranking final de la partida según aciertos y puntos de R3, R4 y R5.
- Las demás rondas sirven para jugar y comparar: aciertos y puntaje por candidata.

## 4. Reglas de grupo oficial
- Cada ronda tiene un **grupo activo**. Si el oficial está cargado, el grupo activo es ese. Si no, es el predicho (o el total, en R1).
- Los puntajes que diste a candidatas que luego no avanzan se conservan para comparar, pero no entran al ranking de la ronda siguiente.
- Al cargar un grupo oficial, el sistema recalcula el ranking de la ronda con ese grupo y muestra qué acertaste.

## 5. Candidatas
- Registro: nombre, país, foto y descripción, tomados de las páginas oficiales.
- Orden alfabético, que es el orden de desfile.
- Marcador de "candidata en pantalla" (botón Siguiente).
- Carga por script o manual. No hay scraping automático.

## 6. Calificación
- Escala de 1.0 a 10.0 con decimales de un dígito (9.5, 3.7). Valores fuera de rango se rechazan.
- Por candidata, ronda, subsección y criterio.
- Editable hasta que se cierre la ronda.
- Flujo rápido: calificar, guardar, siguiente, sin recargar.
- Puntaje de subsección = promedio simple de sus criterios. No hay pesos.

## 7. Picks
- Se generan automáticamente desde tu ranking de la ronda anterior (semifinalistas desde R2, Top 5 desde R3).
- Puedes ajustarlos antes de que se bloqueen. Se bloquean al empezar la ronda correspondiente.
- Cada acierto contra el grupo oficial suma puntos.

## 8. Resultados oficiales y aciertos
- Un administrador carga el grupo oficial de cada ronda, seleccionando las candidatas en orden.
- Al cargarlo se calcula automáticamente: ✓ o ✗ por candidata y el conteo (ej. "Acertaste 7 de 10").
- Los resultados oficiales son comunes a toda la app.
- Acceso del administrador con PIN.

## 9. Puntos y marcador (partidas)
- Cada acierto suma puntos según la ronda y el corte (valores ajustables; por ejemplo, semifinalistas 10 puntos, Top 5 50, ganadora 150).
- Ranking por puntos totales dentro de la partida, por ronda.
- Revelación animada al cargar cada grupo oficial.

## 10. Tiempo real
- Los cambios oficiales y los marcadores se actualizan en todos los dispositivos sin recargar.

## 11. Requisitos no funcionales
- Responsive y usable en celular.
- Inicio de sesión obligatorio con Google.
- Datos persistentes entre recargas.
- Sincronización en menos de 2 segundos.
- Solo el administrador puede modificar resultados oficiales.

## 12. Modelo de datos
Ver `supabase/migrations/20261107000000_init_miss_universo.sql`.

## 13. Tecnología propuesta
- **Frontend:** Next.js con React, TypeScript y Tailwind CSS. Versión web responsive instalable (PWA).
- **Datos y tiempo real:** Supabase (PostgreSQL + Realtime).
- **Animaciones y gráficas:** Framer Motion y Recharts.
- **Hosting:** Vercel para el frontend y Supabase para los datos.
- **Identidad:** inicio de sesión con Google mediante Supabase Auth.
- **Alternativa académica:** Node.js con Express o Fastify, PostgreSQL y Socket.IO.

## 14. Decisiones confirmadas
- Subsecciones y criterios: Traje de baño (pasarela, puntaje general), Traje de gala (pasarela, vestido), desfile de traje típico (puntaje general). Sin pesos.
- Entrevista con el jurado: no se califica en la app.
- Cantidad de semifinalistas y de candidatas del Top 5: editables.
- Picks: dan puntos.
- Ganadora: se decide solo con la noche final.

## 15. Pendientes
- Empates en los cortes.
- Valores de puntos por acierto (propuesta en la sección 9).
