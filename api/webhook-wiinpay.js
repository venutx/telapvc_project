// Endpoint Vercel para receber a confirmação de pagamento da WiinPay (Webhook)
// Caminho: /api/webhook-wiinpay

export default async function handler(req, res) {
  // Apenas aceita requisições POST
  if (req.method !== 'POST') {
    return res.status(405).json({ mensagem: 'Método não permitido' });
  }

  // A WiinPay envia os dados do pagamento no corpo da requisição
  const pagamento = req.body;

  // IMPORTANTE: Em um ambiente de produção, você DEVE verificar a assinatura
  // do webhook para garantir que a requisição veio realmente da WiinPay.
  // Consulte a documentação da WiinPay sobre como verificar a assinatura.

  try {
    // 1. Logar o evento para debug
    console.log('Webhook WiinPay Recebido:', pagamento);

    // 2. Processar o status do pagamento
    if (pagamento.status === 'CONCLUIDA') {
      const txid = pagamento.txid;
      const valor = pagamento.valor;
      const descricao = pagamento.descricao;

      // Lógica crucial:
      // - Buscar o pedido/assinatura no seu banco de dados usando o 'txid'
      // - Marcar o pedido como pago
      // - Liberar o acesso ao conteúdo para o usuário
      
      console.log(`Pagamento CONCLUÍDO para TXID: ${txid}, Valor: ${valor}, Descrição: ${descricao}`);
      // Exemplo de lógica de liberação de acesso:
      // await liberarAcessoUsuario(txid);

    } else if (pagamento.status === 'EXPIRADA') {
      // Lógica para pagamentos expirados
      console.log(`Pagamento EXPIRADO para TXID: ${pagamento.txid}`);
    }
    // Outros status como 'AGUARDANDO' ou 'CANCELADA' também podem ser tratados

    // A API de webhook DEVE retornar um status 200 OK para a WiinPay
    // saber que você recebeu a notificação.
    return res.status(200).json({ recebido: true });

  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    // Retornar um erro (ex: 500) fará com que a WiinPay tente reenviar a notificação
    return res.status(500).json({ erro: 'Erro interno ao processar notificação.' });
  }
}
