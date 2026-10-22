const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const results = document.getElementById("results");
const emptyState = document.getElementById("empty-state");
const loadingState = document.getElementById("loading-state");
const resultCount = document.getElementById("result-count");

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const query = searchInput.value.trim();
  if (!query) return;

  results.innerHTML = "";
  results.setAttribute("aria-busy", "true");
  emptyState.hidden = true;
  loadingState.hidden = false;
  resultCount.textContent = `Searching for “${query}”…`;
  searchButton.disabled = true;

  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url&iiurlwidth=640&format=json&origin=*`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Image search failed with status ${response.status}`);
    }

    const data = await response.json();
    const pages = Object.values(data.query?.pages ?? {})
      .filter((page) => page.imageinfo?.[0]?.thumburl);

    for (const page of pages) {
      const imageInfo = page.imageinfo[0];
      const titleText = page.title.replace(/^File:/, "").replaceAll("_", " ");

      const card = document.createElement("article");
      card.className = "result-card";

      const imageLink = document.createElement("a");
      imageLink.className = "result-image-link";
      imageLink.href = imageInfo.descriptionurl || imageInfo.url;
      imageLink.target = "_blank";
      imageLink.rel = "noopener noreferrer";
      imageLink.setAttribute("aria-label", `Open ${titleText} on Wikimedia Commons`);

      const image = document.createElement("img");
      image.src = imageInfo.thumburl;
      image.alt = titleText;
      image.loading = "lazy";
      image.decoding = "async";
      imageLink.appendChild(image);

      const title = document.createElement("h2");
      title.textContent = titleText;

      const caption = document.createElement("p");
      caption.textContent = "View image on Wikimedia Commons ↗";

      card.appendChild(imageLink);
      card.appendChild(title);
      card.appendChild(caption);
      results.appendChild(card);
    }

    resultCount.textContent = `Showing ${pages.length} results for “${query}”`;
    if (pages.length === 0) {
      emptyState.textContent = `No images found for “${query}”. Try another topic.`;
      emptyState.hidden = false;
    }
  } catch (error) {
    emptyState.textContent = "We couldn’t load images right now. Please try again.";
    emptyState.hidden = false;
    resultCount.textContent = "Search unavailable";
  } finally {
    loadingState.hidden = true;
    results.setAttribute("aria-busy", "false");
    searchButton.disabled = false;
  }
});

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    searchInput.value = chip.textContent.trim();
    searchForm.requestSubmit();
  });
});
