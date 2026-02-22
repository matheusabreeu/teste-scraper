const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

export default async function handler(req, res) {
  const { medicamento } = req.query;

  if (!medicamento) {
    return res.status(400).json({ error: 'Informe o medicamento' });
  }

  let browser = null;

  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    
    // Configura um "disfarce" para não sermos bloqueados de cara
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');

    await page.goto(`https://www.drogasil.com.br/search?w=${medicamento}`, {
        waitUntil: 'networkidle2',
    });

    const resultado = await page.evaluate(() => {
      // Pega o nome e o preço do primeiro item que aparecer
      const nome = document.querySelector('h3')?.innerText || 'Não encontrado';
      const preco = document.querySelector('.price-tag')?.innerText || 'Preço não encontrado';
      return { nome, preco };
    });

    res.status(200).json({ busca: medicamento, resultado });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (browser) await browser.close();
  }
}
