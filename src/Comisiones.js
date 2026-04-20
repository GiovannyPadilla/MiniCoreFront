const res = await fetch(`${API}/api/core/calcular`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fechaInicio, fechaFin }),
});