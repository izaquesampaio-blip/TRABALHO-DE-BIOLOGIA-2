const copyButton = document.getElementById("copyXml");
const xmlElement = document.getElementById("nmapXml");

copyButton?.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(xmlElement.textContent);
    copyButton.textContent = "XML copiado!";
    setTimeout(() => copyButton.textContent = "Copiar XML", 1800);
  } catch {
    copyButton.textContent = "Selecione o XML";
  }
});
