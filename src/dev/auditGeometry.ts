/** Read-only browser audit, scoped to the physical leaves after landing. */
export function inspectLandedGeometry(host: HTMLElement) {
  const failures: Array<{ text: string; source: string | undefined; side: string | undefined; left: number; right: number; top: number; bottom: number }> = [];
  let checkedTextLines = 0;
  const pages = [...host.querySelectorAll<HTMLElement>(".spike-leaf")].filter(page => getComputedStyle(page).display !== "none");
  for (const page of pages) {
    const boundary = page.getBoundingClientRect();
    const walker = document.createTreeWalker(page, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.textContent?.trim() || node.parentElement?.closest(".planet-atlas-viewport,.sr-only,script,style")) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const rect of range.getClientRects()) {
        if (!rect.width || !rect.height) continue;
        checkedTextLines++;
        if (rect.left < boundary.left - 2 || rect.right > boundary.right + 2 || rect.top < boundary.top - 2 || rect.bottom > boundary.bottom + 2) {
          failures.push({ text: node.textContent.trim().slice(0, 120), source: page.dataset.sourceSpread, side: page.dataset.side,
            left: rect.left - boundary.left, right: rect.right - boundary.right, top: rect.top - boundary.top, bottom: rect.bottom - boundary.bottom });
        }
      }
    }
  }
  return { page: host.dataset.currentPage, checkedTextLines, failures,
    documentOverflow: { x: document.documentElement.scrollWidth - innerWidth, y: document.documentElement.scrollHeight - innerHeight },
    scrollbars: [...host.querySelectorAll<HTMLElement>("*")].filter(element => {
      const style = getComputedStyle(element);
      return (style.overflowY === "auto" || style.overflowY === "scroll") && element.scrollHeight > element.clientHeight + 2;
    }).map(element => element.className),
  };
}
