const supabaseUrl = 'https://jzoxixunkeipmtvuhkwv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6b3hpeHVua2VpcG10dnVoa3d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NzU5MjgsImV4cCI6MjA2MjI1MTkyOH0.7Z4rya4gnb12blZTC72BfKYgag9586m1-sfgFP9wSf8'; // mantenha sua chave completa aqui
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

function formataPreco(preco) {
  return preco.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

async function renderizarProdutos() {
  const container = document.getElementById('produtos');
  container.innerHTML = '';

  const { data: produtos, error } = await supabase
    .from('produtos')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Erro ao buscar produtos:', error.message);
    container.innerHTML = '<p>Erro ao carregar os produtos.</p>';
    return;
  }

  produtos.forEach(produto => {
    const card = document.createElement('div');
    card.className = 'produto-card';

    const info = document.createElement('div');
    info.className = 'produto-info';

    const nome = document.createElement('h3');
    nome.className = 'produto-nome';
    nome.textContent = produto.nome;

    const descricao = document.createElement('p');
    descricao.className = 'produto-descricao';
    descricao.textContent = produto.descricao;

    const precoDiv = document.createElement('div');
    precoDiv.className = 'produto-preco';

    if (produto.temDesconto) {
      const precoOriginal = document.createElement('span');
      precoOriginal.className = 'preco-original';
      precoOriginal.textContent = formataPreco(produto.precoOriginal);

      const precoDesconto = document.createElement('span');
      precoDesconto.className = 'preco-desconto';
      precoDesconto.textContent = formataPreco(produto.preco);

      precoDiv.appendChild(precoOriginal);
      precoDiv.appendChild(precoDesconto);
    } else {
      precoDiv.textContent = formataPreco(produto.preco);
    }

    info.appendChild(nome);
    info.appendChild(descricao);
    info.appendChild(precoDiv);
    card.appendChild(info);
    container.appendChild(card);
  });
}

async function aplicarDesconto() {
  const { data: produtos, error } = await supabase.from('produtos').select('*');

  if (error) {
    console.error('Erro ao buscar produtos:', error.message);
    return;
  }

  for (const produto of produtos) {
    if (!produto.temDesconto) {
      const novoPreco = produto.preco * 0.9;

      const { error: updateError } = await supabase
        .from('produtos')
        .update({
          precoOriginal: produto.preco,
          preco: novoPreco,
          temDesconto: true
        })
        .eq('id', produto.id);

      if (updateError) {
        console.error(`Erro ao aplicar desconto no produto ${produto.id}:`, updateError.message);
      }
    }
  }

  renderizarProdutos();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', renderizarProdutos);
document.getElementById('aplicarDesconto').addEventListener('click', aplicarDesconto);
