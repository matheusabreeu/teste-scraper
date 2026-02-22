export default async function handler(req, res) {
  const { medicamento } = req.query;

  try {
    // Fazemos a chamada direto para a busca da Drogasil (como o site deles faz)
    const response = await fetch(`https://api-gateway-prod.drogasil.com.br/search/v2/store/DROGASIL/term/${medicamento}?limit=1`);
    const data = await response.json();

    if (data.results && data.results.products && data.results.products.length > 0) {
      const produto = data.results.products[0];
      res.status(200).json({
        nome: produto.name,
        preco: produto.valueTo,
        link: `https://www.drogasil.com.br/${produto.urlKey}`
      });
    } else {
      res.status(404).json({ error: "Medicamento não encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Erro na consulta" });
  }
}
