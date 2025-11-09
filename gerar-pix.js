// Endpoint Vercel para gerar o PIX com a WiinPay
// Caminho: /api/gerar-pix

// Importante: A chave da WiinPay deve ser configurada como uma variável de ambiente
// no Vercel (WIINPAY_KEY) para segurança.

export default async function handler(req, res) {
  // Apenas aceita requisições POST
  if (req.method !== 'POST') {
    return res.status(405).json({ mensagem: 'Método não permitido' });
  }

  // Verifica se a chave da API está configurada
  const wiinpayKey = process.env.WIINPAY_KEY;
  if (!wiinpayKey) {
    console.error('WIINPAY_KEY não configurada nas variáveis de ambiente.');
    return res.status(500).json({ mensagem: 'Erro de configuração do servidor.' });
  }

  const { valor, descricao } = req.body;

  // Validação básica dos dados
  if (!valor || typeof valor !== 'number' || valor <= 0) {
    return res.status(400).json({ mensagem: 'Valor inválido.' });
  }
  if (!descricao || typeof descricao !== 'string') {
    return res.status(400).json({ mensagem: 'Descrição inválida.' });
  }

  // Formata o valor para o padrão da API (string com duas casas decimais)
  const valorFormatado = valor.toFixed(2);

  try {
    const response = await fetch('https://api.wiinpay.com/v1/pix/cob', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${wiinpayKey}`,
      },
      body: JSON.stringify({
        valor: valorFormatado,
        descricao: descricao,
        // O webhook é crucial para receber a confirmação de pagamento
        webhookUrl: 'https://seusite.com/api/webhook-wiinpay', // SUBSTITUA PELA SUA URL REAL
        // Outros campos opcionais da WiinPay podem ser adicionados aqui
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // Sucesso na criação da cobrança
      // A resposta da WiinPay deve conter o QR Code (base64) e o PIX Copia e Cola
      return res.status(200).json({
        txid: data.txid, // ID da transação para monitoramento
        qrCode: data.qrCode, // Imagem do QR Code em base64
        pixCopiaECola: data.pixCopiaECola,
        mensagem: 'PIX gerado com sucesso.'
      });
    } else {
      // Erro retornado pela API da WiinPay
      console.error('Erro da WiinPay:', data);
      return res.status(response.status).json({
        mensagem: data.mensagem || 'Erro ao comunicar com a WiinPay.',
        detalhes: data
      });
    }

  } catch (error) {
    console.error('Erro ao gerar PIX:', error);
    return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }
}
