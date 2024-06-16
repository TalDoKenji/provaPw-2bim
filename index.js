document.addEventListener("DOMContentLoaded", () => {
    const url = `https://servicodados.ibge.gov.br/`;


    function init() {
        getNews();
        buildPagination();
        setSearchFunction();
        setFilterFunction();
    }

    async function getNews() {
        buildDefaultFilters();
        setFilter({
            key: "page",
            value: new URLSearchParams(window.location.search).get("page") || 1,
        });
        const filters = buildUrlFilters();
        let apiURL = `${url}api/v3/noticias?${filters}`;
        const news = await (await fetch(apiURL)).json();
        const newsList = document.getElementById("news-list");
        newsList.innerHTML = "";
        news.items.forEach((item) => {
            const imgUrl = JSON.parse(item.imagens).image_intro;
            const li = document.createElement("li");
            li.classList.add("news-item");
            li.innerHTML = `
              <div class="img-news-area" style="background-image: url(https://agenciadenoticias.ibge.gov.br/${imgUrl});">
                 
              </div>
              <div>
                  <h2>${item.titulo}</h2>
                  <p>${item.introducao}</p>
                  <div class="d-flex justify-content-between">
                  <div>#${item.editorias}</div>    
                  <div>${calculateDaysAgo(item.data_publicacao)}</div>
                  </div>
                  <button class="see-more-btn">
                      <a href="${item.link}" target="_blank">Leia mais</a>
                  </button>
              </div>
          `;

            console.log(li)
            newsList.appendChild(li);
        });
    }

    function buildDefaultFilters() {
        if (getFilters().length > 0) return;
        setFilter({ key: "qtd", value: 10 });
        setFilter({ key: "page", value: 1 });
    }

    function calculateDaysAgo(date) {

        const [dateStr, timeStr] = date.split("T");

        const [year, month, day] = dateStr.split("-").map(Number);

        const [hour, minute] = timeStr.split(":").map(Number);
        const publishDate = new Date(year, month - 1, day, hour, minute);
        console.log("publicacao", publishDate)

        const now = new Date();
        console.log("data atual: ", now)

        const diffMillis = Math.abs(now - publishDate)
        console.log("diferença das datas:", diffMillis)


        const diffDays = Math.ceil(diffMillis / (1000 * 3600 * 24));
        console.log("diferença de dias: ", diffDays)

        if (diffDays === 0) {
            return "Publicado hoje";
        } else if (diffDays === 1) {
            return "Publicado ontem";
        } else {
            return `Publicado há ${diffDays} dias`;
        }
    }

    function countActiveFilters() {
        const filterType = document.getElementById("filter-type").value;
        const filterQtd = document.getElementById("qtd-filter").value;
        const filterStart = document.getElementById("filter-start").value;
        const filterEnd = document.getElementById("filter-end").value;

        let count = 0;

        if (filterType) count++;
        if (filterQtd) count++;
        if (filterStart) count++;
        if (filterEnd) count++;

        return count;
    }

    function updateFilterCount() {
        const activeFiltersCount = countActiveFilters();
        const filterCountElement = document.getElementById('filter-count');
        if (filterCountElement) {
            filterCountElement.textContent = activeFiltersCount;
        }
    }



    function buildPagination() {
        const paginator = document.getElementById("paginator");
        const currentPage =
            new URLSearchParams(window.location.search).get("page") || 1;
        const urlParams = new URLSearchParams(window.location.search);
        let existingParams = Array.from(urlParams.entries());
        existingParams = existingParams.filter(([key, value]) => key !== "page");
        if (currentPage < 5) {
            for (let i = 1; i <= 10; i++) {
                const li = document.createElement("li");
                if (i == currentPage) li.classList.add("active");
                li.classList.add("page-item");
                const queryParams = existingParams.map(([key, value]) => `${key}=${value}`).join("&");
                li.innerHTML = `<button><a href="?${queryParams}&page=${i}">${i}</a></button>`;
                paginator.appendChild(li);
            }
        } else {
            for (let i = Number(currentPage) - 4; i <= Number(currentPage) + 5; i++) {
                const li = document.createElement("li");
                if (i == currentPage) li.classList.add("active");
                li.classList.add("page-item");
                const queryParams = existingParams.map(([key, value]) => `${key}=${value}`).join("&");
                li.innerHTML = `<button><a href="?${queryParams}&page=${i}">${i}</a></button>`;
                paginator.appendChild(li);
            }
        }
    }

    function getFilters() {
        const urlParams = new URLSearchParams(window.location.search);
        const filters = [];
        for (const [key, value] of urlParams.entries()) {
            filters.push({ key, value });
        }
        return filters;
    }

    function buildUrlFilters() {
        const filters = getFilters();
        const urlText = filters
            .map((filter) => `${filter.key}=${filter.value}`)
            .join("&");
        return urlText;
    }

    function unsetAllFilters() {
        localStorage.removeItem("filters");
    }

    function unsetFilter(key) {
        const filters = getFilters();
        const newFilters = filters.filter((filter) => filter.key !== key);
        localStorage.setItem("filters", JSON.stringify(newFilters));
    }

    function setFilter(newFilter) {
        const currentFilters = getFilters();
        const filterExist = currentFilters
            .map((filter) => filter.key)
            .includes(newFilter.key);
        if (filterExist) {
            currentFilters.splice(
                currentFilters.findIndex((filter) => filter.key === newFilter.key),
                1
            );
        }
        currentFilters.push(newFilter);
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set(newFilter.key, newFilter.value);
        window.history.replaceState(null, null, `?${urlParams.toString()}`);
    }

    function setSearchFunction() {
        const searchButton = document.getElementById("search-button");
        searchButton.addEventListener("click", search);
    }

    function search() {
        unsetFilter("busca");
        const searchInput = document.getElementById("search");
        setFilter({ key: "busca", value: searchInput.value });
        getNews();
    }

    function setFilterFunction() {
        const filterButton = document.getElementById("filter-button");
        filterButton.addEventListener("click", filter);
    }

    function filter() {
        const filterType = document.getElementById("filter-type").value;
        const filterQtd = document.getElementById("qtd-filter").value;
        const filterStart = document.getElementById("filter-start").value;
        const filterEnd = document.getElementById("filter-end").value;

        if (filterType) setFilter({ key: "tipo", value: filterType });
        else unsetFilter("tipo");
        if (filterQtd) setFilter({ key: "qtd", value: filterQtd });
        else unsetFilter("qtd");
        if (filterStart) setFilter({ key: "de", value: toFilterDate(filterStart) });
        else unsetFilter("de");
        if (filterEnd) setFilter({ key: "ate", value: toFilterDate(filterEnd) });
        else unsetFilter("ate");

        updateFilterCount();
        toggleFilter();
        getNews();



    }

    function toFilterDate(date) {
        console.log(date);
        const [year, month, day] = date.split("-");
        const formattedDate = `${month}-${day}-${year}`;
        return formattedDate;
    }

    init();
});

function toggleFilter() {
    const overlay = document.getElementById("overlay");
    overlay.style.display = overlay.style.display === "block" ? "none" : "block";
    const dialog = document.getElementById("filter-dialog");
    if (dialog.getAttribute("open")) {
        dialog.removeAttribute("open");
    } else {
        dialog.setAttribute("open", true);
    }
}