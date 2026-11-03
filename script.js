<script>
    // CONFIGURACIÓN DE SUPABASE
    const SUPABASE_URL = "PEGA_AQUI_LA_URL_DE_TU_PROYECTO";
    const SUPABASE_ANON_KEY = "PEGA_AQUI_TU_CLAVE_PUBLICA_ANON";

    // MENÚ DE NAVEGACIÓN
    function alternarMenu() {
        document.getElementById("menu").classList.toggle("activo");
    }

    function cerrarMenu() {
        document.getElementById("menu").classList.remove("activo");
    }

    document.querySelectorAll("#menu a").forEach(enlace => {
        enlace.addEventListener("click", cerrarMenu);
    });

    // BOTÓN PARA SUBIR AL INICIO
    window.addEventListener("scroll", () => {
        const boton = document.getElementById("btnSubir");

        if (boton) {
            boton.style.display = window.scrollY > 300 ? "block" : "none";
        }
    });

    function subirAlInicio() {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    // VISOR DE IMÁGENES
    function abrirVisor(img) {
        const visor = document.getElementById("visorImagen");
        const imagenGrande = document.getElementById("imagenGrande");

        if (visor && imagenGrande) {
            imagenGrande.src = img.src;
            imagenGrande.alt = img.alt;
            visor.style.display = "flex";
        }
    }

    function cerrarVisor() {
        const visor = document.getElementById("visorImagen");

        if (visor) {
            visor.style.display = "none";
        }
    }

    document.querySelectorAll("img").forEach(imagen => {
        imagen.addEventListener("click", () => abrirVisor(imagen));
    });

    // CERRAR VISOR CON ESCAPE
    document.addEventListener("keydown", evento => {
        if (evento.key === "Escape") {
            cerrarVisor();
        }
    });

    // FUNCIONES PARA DOCENTES
    function normalizar(texto) {
        return String(texto || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    }

    function escaparHTML(valor) {
        return String(valor || "").replace(/[&<>"']/g, caracter => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[caracter]);
    }

    function obtenerCategorias(categoria) {
        return String(categoria || "")
            .split(/\s+/)
            .filter(Boolean);
    }

    function obtenerEtiqueta(categorias) {
        if (categorias.includes("modulo")) return "Docente de módulo";
        if (categorias.includes("club")) return "Encargado de club";
        return "Docente de materia";
    }

    function obtenerFotoDocente(docente) {
        return docente.foto || "imagenes itace/docentes/docente-generico.jpg";
    }

    // DIBUJAR DOCENTES
    function dibujarDocentes(registros) {
        const contenedor = document.getElementById("listaDocentes");

        if (!contenedor) return;

        contenedor.innerHTML = registros.map(docente => {
            const categorias = obtenerCategorias(docente.categoria);

            return `
                <article class="docente-card"
                    data-categoria="${escaparHTML(docente.categoria)}"
                    data-categorias="${escaparHTML(docente.categoria)}">

                    <img
                        src="${escaparHTML(obtenerFotoDocente(docente))}"
                        alt="Fotografía de ${escaparHTML(docente.nombre)}"
                        loading="lazy">

                    <div class="docente-info">
                        <span class="docente-etiqueta">
                            ${escaparHTML(obtenerEtiqueta(categorias))}
                        </span>

                        <h3>${escaparHTML(docente.nombre)}</h3>

                        <p><strong>Materias o actividades:</strong>
                            ${escaparHTML(docente.materias)}
                        </p>

                        <p><strong>Semestres:</strong>
                            ${escaparHTML(docente.semestres)}
                        </p>

                        <p><strong>Preparación:</strong>
                            ${escaparHTML(docente.preparacion)}
                        </p>
                    </div>
                </article>
            `;
        }).join("");
    }

    // FILTRAR DOCENTES
    function filtrarDocentes() {
        const busqueda = normalizar(
            document.getElementById("buscarDocente")?.value
        );

        const categoriaSeleccionada =
            document.querySelector(".filtro-categoria.activo")?.dataset.categoria || "todos";

        const materiaSeleccionada =
            document.getElementById("filtroMateria")?.value || "todos";

        const tarjetas = document.querySelectorAll(".docente-card");
        let visibles = 0;

        tarjetas.forEach(tarjeta => {
            const texto = normalizar(tarjeta.textContent);
            const categorias = obtenerCategorias(
                tarjeta.dataset.categorias || tarjeta.dataset.categoria
            );

            const coincideBusqueda = texto.includes(busqueda);
            const coincideCategoria =
                categoriaSeleccionada === "todos" ||
                categorias.includes(categoriaSeleccionada);

            const coincideMateria =
                materiaSeleccionada === "todos" ||
                texto.includes(normalizar(materiaSeleccionada));

            const mostrar =
                coincideBusqueda && coincideCategoria && coincideMateria;

            tarjeta.style.display = mostrar ? "" : "none";

            if (mostrar) visibles++;
        });

        const contador = document.getElementById("contadorDocentes");

        if (contador) {
            contador.textContent = `Docentes encontrados: ${visibles}`;
        }
    }

    // EVENTOS DE FILTROS
    document.querySelectorAll(".filtro-categoria").forEach(boton => {
        boton.addEventListener("click", () => {
            document.querySelectorAll(".filtro-categoria")
                .forEach(elemento => elemento.classList.remove("activo"));

            boton.classList.add("activo");
            filtrarDocentes();
        });
    });

    document.getElementById("buscarDocente")
        ?.addEventListener("input", filtrarDocentes);

    document.getElementById("filtroMateria")
        ?.addEventListener("change", filtrarDocentes);

    document.getElementById("limpiarDocentes")
        ?.addEventListener("click", () => {
            document.getElementById("buscarDocente").value = "";
            document.getElementById("filtroMateria").value = "todos";

            document.querySelectorAll(".filtro-categoria")
                .forEach(boton => boton.classList.remove("activo"));

            document.querySelector('.filtro-categoria[data-categoria="todos"]')
                ?.classList.add("activo");

            filtrarDocentes();
        });

    // EVITAR QUE EL AUDIO SIGA SONANDO AL REPRODUCIR UN VIDEO
    document.querySelectorAll("video").forEach(video => {
        video.addEventListener("play", () => {
            document.querySelectorAll("audio").forEach(audio => {
                audio.pause();
            });
        });
    });

    // SINCRONIZACIÓN CON SUPABASE
    async function sincronizarDocentesEnLinea() {
        try {
            if (
                SUPABASE_URL.includes("PEGA_AQUI") ||
                SUPABASE_ANON_KEY.includes("PEGA_AQUI")
            ) {
                console.info("Supabase todavía no está configurado.");
                return;
            }

            const respuesta = await fetch(
                `${SUPABASE_URL}/rest/v1/docentes?select=*`,
                {
                    method: "GET",
                    headers: {
                        "apikey": SUPABASE_ANON_KEY,
                        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
                    }
                }
            );

            if (!respuesta.ok) {
                throw new Error("No se pudieron consultar los docentes.");
            }

            const data = await respuesta.json();

            console.info("Docentes sincronizados:", data.length);

            // Las tarjetas visibles se conservan en el HTML.
            filtrarDocentes();

        } catch (error) {
            console.error("Error al sincronizar docentes:", error);
        }
    }

    // INICIAR FILTROS Y SINCRONIZACIÓN
    filtrarDocentes();
    sincronizarDocentesEnLinea();
</script></script>