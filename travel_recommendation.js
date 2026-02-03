const KEYWORD_MAP = {
  beach: "beaches",
  beaches: "beaches",
  temple: "temples",
  temples: "temples",
  country: "countries",
  countries: "countries",
};

// (opcional) quita espacios extra y hace lowercase
function normalizeQuery(q) {
  return q.trim().toLowerCase();
}

function renderCard(item) {
  return `
    <article class="card">
      <img src="${item.imageUrl}" alt="${item.name}" />
      <h3>${item.name}</h3>
      <p>${item.description}</p>
      <button>Visit</button>
    </article>
  `;
}

function renderCityCard(city) {
  return `
    <article class="card">
      <img src="${city.imageUrl}" alt="${city.name}" />
      <h3>${city.name}</h3>
      <p>${city.description}</p>
      <button>Visit</button>
    </article>
  `;
}

async function searchTravel() {
  const inputEl = document.getElementById("inputSearch");
  const resultDiv = document.getElementById("result");

  const query = normalizeQuery(inputEl.value);
  resultDiv.innerHTML = "";

  if (!query) {
    resultDiv.innerHTML = "<p>Please enter a keyword.</p>";
    return;
  }

  try {
    const res = await fetch("travel_recommendation_api.json");
    const data = await res.json();

    // 1) ¿El usuario escribió una keyword tipo beach/temples/countries?
    const mapped = KEYWORD_MAP[query];

    // Si escribió "beach/beaches" => mostrar data.beaches
    if (mapped === "beaches" || mapped === "temples") {
      const list = data[mapped] || [];
      if (!list.length) {
        resultDiv.innerHTML = "<p>No results.</p>";
        return;
      }
      resultDiv.innerHTML = list.map(renderCard).join("");
      return;
    }

    // 2) Buscar por país (Australia / Japan / Brazil) aunque escriba en cualquier case
    //    Ej: "japan", "JAPAN" => match con data.countries[i].name
    const country = (data.countries || []).find(c =>
      c.name.toLowerCase() === query
    );

    if (country) {
      // mostrar ciudades del país
      resultDiv.innerHTML = `
        <h2>${country.name}</h2>
        <div class="grid">
          ${country.cities.map(renderCityCard).join("")}
        </div>
      `;
      return;
    }

    // 3) (opcional) Buscar también por ciudad/templo/playa por substring
    //    Ej: "rio" => encuentra "Rio de Janeiro, Brazil"
    const hits = [];

    // playas
    for (const b of data.beaches || []) {
      if (b.name.toLowerCase().includes(query)) hits.push(renderCard(b));
    }

    // templos
    for (const t of data.temples || []) {
      if (t.name.toLowerCase().includes(query)) hits.push(renderCard(t));
    }

    // ciudades
    for (const c of data.countries || []) {
      for (const city of c.cities || []) {
        if (city.name.toLowerCase().includes(query)) hits.push(renderCityCard(city));
      }
    }

    resultDiv.innerHTML = hits.length
      ? `<div class="grid">${hits.join("")}</div>`
      : "<p>No results found.</p>";
  } catch (err) {
    console.error(err);
    resultDiv.innerHTML = "<p>Error loading data.</p>";
  }
}

// SOLO buscar cuando den click
document.getElementById("btnSearch").addEventListener("click", searchTravel);

// (opcional) Clear
document.getElementById("btnClear").addEventListener("click", () => {
  document.getElementById("inputSearch").value = "";
  document.getElementById("result").innerHTML = "";
});
