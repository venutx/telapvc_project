// Endpoint Vercel para gerar o PIX com a WiinPay
// Caminho: /api/gerar-pix

// Importante: A chave da WiinPay deve ser configurada como uma variável de ambiente
// no Vercel (WIINPAY_KEY) para segurança.
// O webhook também deve ser configurado como variável de ambiente (WIINPAY_WEBHOOK)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // O frontend deve enviar: value, name, email, description
  const { value, name, email, description } = req.body;

  // Validação básica
  if (!value || isNaN(Number(value)) || Number(value) <= 0) {
    return res.status(400).json({ error: 'Valor inválido.' });
  }

  try {
    const response = await fetch('https://api.wiinpay.com.br/payment/create', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        api_key: process.env.WIINPAY_KEY,
        value: Number(value),
        name: name || 'Cliente', // Usar 'Cliente' como fallback
        email: email || 'cliente@exemplo.com', // Usar email de fallback
        description: description || 'Pagamento via PIX',
        webhook_url: process.env.WIINPAY_WEBHOOK || '' // Webhook deve ser configurado
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro WiinPay:', data);
      return res.status(400).json({ error: data });
    }

    // A API WiinPay retorna qr_code_base64 e qr_code_text
    return res.status(200).json({
      qr_code_base64: data.qr_code_base64 || data.qrCodeBase64,
      qr_code_text: data.qr_code_text || data.qrCode,
      payment_id: data.payment_id || data.id
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
