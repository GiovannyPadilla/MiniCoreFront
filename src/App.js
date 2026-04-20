import { useState } from "react";

const API = "https://minicoreback-1.onrender.com";

const fmt = (v) =>
    new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" }).format(v);

function getDefaultDates() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const prev = new Date(now);
  prev.setMonth(prev.getMonth() - 1);
  const start = `${prev.getFullYear()}-${pad(prev.getMonth() + 1)}-${pad(prev.getDate())}`;
  return { start, today };
}

const { start, today } = getDefaultDates();

export default function Comisiones() {
  const [fechaInicio, setFechaInicio] = useState(start);
  const [fechaFin, setFechaFin] = useState(today);
  const [resultados, setResultados] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const calcular = async () => {
    setError("");
    if (!fechaInicio || !fechaFin) {
      setError("Selecciona ambas fechas.");
      return;
    }
    if (fechaInicio > fechaFin) {
      setError("La fecha inicio debe ser anterior a la fecha fin.");
      return;
    }

    setLoading(true);
    setResultados(null);

    try {
      const res = await fetch(`${API}/api/core/calcular`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fechaInicio, fechaFin }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      const sorted = [...data].sort((a, b) => b.totalVendido - a.totalVendido);
      setResultados(sorted);
    } catch (e) {
      setError("No se pudo conectar con la API. " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
      <section style={styles.wrap}>
        <h2 style={styles.title}>Calcular comisiones</h2>

        <section style={styles.row}>
          <section style={styles.field}>
            <label style={styles.label}>Fecha inicio</label>
            <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                style={styles.input}
            />
          </section>
          <section style={styles.field}>
            <label style={styles.label}>Fecha fin</label>
            <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                style={styles.input}
            />
          </section>
          <button onClick={calcular} disabled={loading} style={styles.btn}>
            {loading ? "Calculando..." : "Calcular"}
          </button>
        </section>

        {error && <p style={styles.error}>{error}</p>}

        {resultados !== null && (
            <section style={styles.card}>
              {resultados.length === 0 ? (
                  <p style={styles.empty}>Sin ventas en ese rango de fechas.</p>
              ) : (
                  resultados.map((r, i) => {
                    const com = parseFloat(r.comisionCalculada || 0);
                    return (
                        <section key={i} style={styles.resRow(i < resultados.length - 1)}>
                          <section>
                            <p style={styles.name}>{r.vendedor}</p>
                            <p style={styles.sub}>
                              {r.reglaAplicada} · vendido: {fmt(r.totalVendido)}
                            </p>
                          </section>
                          <p style={com > 0 ? styles.comision : styles.comisionZero}>
                            {fmt(com)}
                          </p>
                        </section>
                    );
                  })
              )}
            </section>
        )}
      </section>
  );
}

const styles = {
  wrap: {
    maxWidth: 560,
    margin: "0 auto",
    padding: "2rem 1rem",
    fontFamily: "system-ui, sans-serif",
  },
  title: {
    fontSize: 20,
    fontWeight: 500,
    marginBottom: "1.5rem",
    color: "#111",
  },
  row: {
    display: "flex",
    gap: 12,
    alignItems: "flex-end",
    flexWrap: "wrap",
    marginBottom: "1rem",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    flex: 1,
    minWidth: 140,
  },
  label: {
    fontSize: 13,
    color: "#666",
  },
  input: {
    padding: "8px 10px",
    border: "1px solid #ddd",
    borderRadius: 8,
    fontSize: 14,
    color: "#111",
    background: "#fff",
    outline: "none",
  },
  btn: {
    padding: "9px 20px",
    background: "#111",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  error: {
    fontSize: 13,
    color: "#c0392b",
    marginBottom: "1rem",
  },
  card: {
    marginTop: "1.5rem",
    border: "1px solid #e5e5e5",
    borderRadius: 12,
    overflow: "hidden",
    background: "#fff",
  },
  resRow: (hasBorder) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    borderBottom: hasBorder ? "1px solid #f0f0f0" : "none",
  }),
  name: {
    fontSize: 14,
    fontWeight: 500,
    color: "#111",
  },
  sub: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  comision: {
    fontSize: 15,
    fontWeight: 500,
    color: "#2d7a4f",
  },
  comisionZero: {
    fontSize: 14,
    color: "#aaa",
  },
  empty: {
    padding: "2rem",
    textAlign: "center",
    fontSize: 14,
    color: "#888",
  },
};