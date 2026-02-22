const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

export default async function handler(req, res) {
  const { medicamento } = req.query;

  if (!medicamento) {
    return res.status(400).json({ error: 'Informe o medicamento' });
  }

  let browser = null;

  try {
    // Configurações específicas para evitar erros de bibliotecas no Linux da Vercel
    browser = await puppeteer.launch({
      args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: true,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    
    // Identifica o navegador como um usuário real
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');

    // Aumentamos o tempo de espera para 20 segundos (Drogasil pode ser lenta)
    await page.goto(`https://www.drogasil.com.br/search?w=${medicamento}`, {
        waitUntil: 'networkidle2',
        timeout: 20000 
    });

    const resultado = await page.evaluate(() => {
      // Procura o nome e o preço (ajustado para os seletores atuais da Drogasil)
      const nome = document.querySelector('h3')?.innerText || 'Produto não encontrado';
      const preco = document.querySelector('.price-tag, [data-testid="price-value"]')?.innerText || 'Preço não disponível';
      return { nome, preco };
    });

    res.status(200).json({ busca: medicamento, resultado });
  } catch (error) {
    // Retorna o erro detalhado para sabermos o que aconteceu
    res.status(500).json({ error: error.message, stack: error.stack });
  } finally {
    if (browser) await browser.close();
  }
}
