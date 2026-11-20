class LastUpdated extends HTMLElement {
  async connectedCallback() {
    const date = await this.getDate();
    if (!date || isNaN(date.getTime())) return;

    const parts = new Intl.DateTimeFormat("en-SG", {
      timeZone: "Asia/Singapore",
      year: "numeric",
      month: "2-digit",
    }).formatToParts(date);
    const year = parts.find((part) => part.type === "year").value;
    const month = parts.find((part) => part.type === "month").value;
    this.textContent = `Last updated ${year}.${month}`;
  }

  async getDate() {
    if (location.hostname === "chengpeng-wang.github.io") {
      try {
        const commitsUrl = new URL("https://api.github.com/repos/chengpeng-wang/chengpeng-wang.github.io/commits");
        commitsUrl.search = new URLSearchParams({ path: this.dataset.page, per_page: 1 });
        const response = await fetch(commitsUrl);
        if (response.ok) {
          const [latest] = await response.json();
          const timestamp = latest?.commit?.committer?.date;
          if (timestamp) return new Date(timestamp);
        }
      } catch {
        // Use the served file's date if GitHub is unavailable.
      }
    }

    if (location.protocol === "file:") return new Date(document.lastModified);

    try {
      const response = await fetch(location.href, { method: "HEAD" });
      const timestamp = response.ok && response.headers.get("last-modified");
      return timestamp ? new Date(timestamp) : null;
    } catch {
      return null;
    }
  }
}

customElements.define("last-updated", LastUpdated);
