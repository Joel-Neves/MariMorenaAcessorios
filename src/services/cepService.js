export async function buscarEnderecoViaCep(cep) {
  const cepLimpo = cep.replace(/\D/g, '');

  if (cepLimpo.length !== 8) {
    throw new Error('CEP deve ter 8 dígitos.');
  }

  const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);

  if (!response.ok) {
    throw new Error('Erro ao consultar CEP');
  }

  const data = await response.json();

  if (data.erro) {
    throw new Error('CEP inválido ou não encontrado.');
  }

  return {
    city: data.localidade,
    state: data.uf,
    neighborhood: data.bairro,
    street: data.logradouro
  };
}
