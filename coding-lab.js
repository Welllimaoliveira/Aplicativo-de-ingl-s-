/* ===== Laboratório de Código: C# e Python para adultos/profissionais =====
   Módulo separado do restante do app (que é voltado a aprender inglês):
   aqui o aluno aprende lógica de programação de verdade. Python roda de
   verdade no navegador via Pyodide (WebAssembly); C# não é executado (é
   pesado demais para rodar 100% no navegador), então os exercícios de
   "escrever código" em C# são conferidos por padrão estrutural (o aluno
   também vê o resultado esperado pra aprender), e os exercícios de "qual é
   a saída" comparam a previsão do aluno com o resultado real e verificado
   por nós - dá pra aprender a ler e entender C# com precisão total mesmo
   sem executar. */
(() => {
  const $id = (id) => document.getElementById(id);

  // ---------- Currículo ----------
  // Cada tópico tem 2 exercícios: um "write" (escrever/completar código) e
  // um "predict" (ler o código e prever a saída). expectedOutput sempre foi
  // conferido rodando o código de verdade (Python local e C# via dotnet)
  // antes de entrar aqui.
  const CURRICULUM = {
    python: {
      // Trilha "Bem Iniciante": passo a passo, um exercício de cada vez,
      // pra quem nunca escreveu uma linha de código. Só 3 conceitos, bem
      // guiados, com pouquíssimo código pra escrever sozinho.
      beginner: [
        { topic: 'Loops (repetição)', exercises: [
          { id:'py-begin-loop-1', type:'write', title:'Repita 3 vezes',
            promptPt:'Um `for` repete um bloco de código várias vezes. Complete o código pra imprimir "Oi!" três vezes (uma em cada linha).',
            starter:'for i in range(3):\n    # seu código aqui: imprima "Oi!"\n    pass',
            expectedOutput:'Oi!\nOi!\nOi!', hint:'Dentro do for, use print("Oi!") - como o range(3) tem 3 números (0,1,2), o print roda 3 vezes.' },
          { id:'py-begin-loop-2', type:'predict', title:'Contando com o for',
            promptPt:'O que este código imprime? (uma linha por número)',
            code:'for n in range(1, 4):\n    print(n)',
            expectedOutput:'1\n2\n3', hint:'range(1, 4) começa em 1 e vai até 3 (o 4 não entra) - por isso conta 1, 2, 3.' },
        ]},
        { topic: 'Funções', exercises: [
          { id:'py-begin-func-1', type:'write', title:'Sua primeira função',
            promptPt:'Uma função é um "pacotinho" de código com nome, que você pode chamar quando quiser. Complete a função `saudacao()` pra ela imprimir "Bem-vindo ao mundo da programação!", e chame ela (a chamada `saudacao()` já está pronta no final).',
            starter:'def saudacao():\n    # seu código aqui\n    pass\n\nsaudacao()',
            expectedOutput:'Bem-vindo ao mundo da programação!', hint:'Dentro da função, use print("Bem-vindo ao mundo da programação!")' },
          { id:'py-begin-func-2', type:'predict', title:'Função com parâmetro',
            promptPt:'O que este código imprime? Uma função pode receber um valor (parâmetro) e devolver um resultado.',
            code:'def dobro(n):\n    return n * 2\n\nprint(dobro(5))',
            expectedOutput:'10', hint:'A função dobro recebe 5, multiplica por 2, e devolve 10.' },
        ]},
        { topic: 'Condicionais (if / else)', exercises: [
          { id:'py-begin-cond-1', type:'write', title:'Pode entrar?',
            promptPt:'Um `if` deixa o código tomar decisões. Complete `checar_idade(idade)`: se `idade >= 18`, imprima "Pode entrar!"; senão, imprima "Você ainda não pode entrar.". A chamada com 20 já está pronta.',
            starter:'def checar_idade(idade):\n    # seu código aqui\n    pass\n\nchecar_idade(20)',
            expectedOutput:'Pode entrar!', hint:'if idade >= 18:\n    print("Pode entrar!")\nelse:\n    print("Você ainda não pode entrar.")' },
          { id:'py-begin-cond-2', type:'predict', title:'Testando a condição',
            promptPt:'O que este código imprime?',
            code:'idade = 15\nif idade >= 18:\n    print("Pode entrar!")\nelse:\n    print("Você ainda não pode entrar.")',
            expectedOutput:'Você ainda não pode entrar.', hint:'15 é menor que 18, então a condição do if é falsa e o else é executado.' },
        ]},
        { topic: 'Texto (strings)', exercises: [
          { id:'py-begin-str-1', type:'write', title:'Nome completo',
            promptPt:'O operador `+` junta textos. Dado `nome = "Ana"` e `sobrenome = "Souza"`, imprima "Ana Souza" (com um espaço no meio).',
            starter:'nome = "Ana"\nsobrenome = "Souza"\n# seu código aqui: imprima o nome completo\n',
            expectedOutput:'Ana Souza', hint:'print(nome + " " + sobrenome) - o " " no meio é o espaço.' },
          { id:'py-begin-str-2', type:'predict', title:'Tamanho e maiúsculas',
            promptPt:'O que este código imprime? (duas linhas)',
            code:'palavra = "banana"\nprint(len(palavra))\nprint(palavra.upper())',
            expectedOutput:'6\nBANANA', hint:'len() conta as letras (6); .upper() deixa tudo maiúsculo.' },
        ]},
        { topic: 'Listas (introdução)', exercises: [
          { id:'py-begin-list-1', type:'write', title:'Quantos itens tem a lista?',
            promptPt:'Uma lista guarda vários valores. A lista `frutas` já está pronta - imprima quantos itens ela tem.',
            starter:'frutas = ["maca", "uva", "pera"]\n# seu código aqui: imprima a quantidade de itens\n',
            expectedOutput:'3', hint:'Use print(len(frutas)) - len() conta os itens da lista.' },
          { id:'py-begin-list-2', type:'predict', title:'Pegando itens pelo índice',
            promptPt:'O que este código imprime? (duas linhas)',
            code:'numeros = [10, 20, 30]\nprint(numeros[0])\nprint(numeros[-1])',
            expectedOutput:'10\n30', hint:'O índice 0 é o primeiro item; -1 é o último.' },
        ]},
      ],
      basic: [
        { topic: 'Variáveis e tipos', exercises: [
          { id:'py-basic-vars-1', type:'write', title:'Calculando a média',
            promptPt:'Escreva uma função `media(a, b, c)` que recebe três notas e devolve a média aritmética. Chame `print(media(7, 8, 9))` para testar.',
            starter:'def media(a, b, c):\n    # seu código aqui\n    pass\n\nprint(media(7, 8, 9))',
            expectedOutput:'8.0', hint:'Some os três valores e divida por 3. Em Python, o operador / já devolve um número decimal (float).' },
          { id:'py-basic-vars-2', type:'predict', title:'Leia com atenção',
            promptPt:'O que este código imprime?',
            code:'x = 5\ny = 2\nprint(x // y, x % y)',
            expectedOutput:'2 1', hint:'// é divisão inteira (arredonda pra baixo), % é o resto da divisão.' },
        ]},
        { topic: 'Condicionais', exercises: [
          { id:'py-basic-cond-1', type:'write', title:'Classificando idades',
            promptPt:'Escreva `classifica(idade)`: devolve "crianca" se idade < 13, "adolescente" se idade < 18, ou "adulto" caso contrário. Teste com `print(classifica(15))`.',
            starter:'def classifica(idade):\n    # seu código aqui\n    pass\n\nprint(classifica(15))',
            expectedOutput:'adolescente', hint:'Use if / elif / else, nessa ordem, comparando idade com 13 e depois com 18.' },
          { id:'py-basic-cond-2', type:'predict', title:'Par ou ímpar',
            promptPt:'O que este código imprime?',
            code:'n = 7\nif n % 2 == 0:\n    print("par")\nelse:\n    print("impar")',
            expectedOutput:'impar', hint:'7 dividido por 2 deixa resto 1, então não é múltiplo de 2.' },
        ]},
        { topic: 'Laços de repetição (loops)', exercises: [
          { id:'py-basic-loop-1', type:'write', title:'Somando uma sequência',
            promptPt:'Some os números de 1 a 5 (incluindo o 5) usando um laço `for` com `range`, e imprima o total.',
            starter:'total = 0\n# seu código aqui\n\nprint(total)',
            expectedOutput:'15', hint:'range(1, 6) gera 1,2,3,4,5. Use total += i dentro do for.' },
          { id:'py-basic-loop-2', type:'predict', title:'Filtrando com while',
            promptPt:'O que este código imprime? (preste atenção nos espaços)',
            code:'i = 0\nwhile i < 10:\n    if i % 2 == 0:\n        print(i, end=" ")\n    i += 1',
            expectedOutput:'0 2 4 6 8', hint:'end=" " faz o print não pular linha, só colocar um espaço - o resultado sai tudo na mesma linha.' },
        ]},
        { topic: 'Listas', exercises: [
          { id:'py-basic-list-1', type:'write', title:'Maior valor sem usar max()',
            promptPt:'Escreva `maior(lista)` que devolve o maior número de uma lista, SEM usar a função pronta `max()`. Teste com `print(maior([4, 9, 2, 7, 1]))`.',
            starter:'def maior(lista):\n    # seu código aqui\n    pass\n\nprint(maior([4, 9, 2, 7, 1]))',
            expectedOutput:'9', hint:'Comece com m = lista[0] e percorra a lista comparando cada item com m.' },
          { id:'py-basic-list-2', type:'predict', title:'Fatiando listas',
            promptPt:'O que este código imprime?',
            code:'nums = [10, 20, 30, 40]\nprint(nums[1:3])',
            expectedOutput:'[20, 30]', hint:'nums[1:3] pega os índices 1 e 2 (o índice 3 não entra).' },
        ]},
        { topic: 'Funções', exercises: [
          { id:'py-basic-func-1', type:'write', title:'Verificando paridade',
            promptPt:'Escreva `eh_par(n)` que devolve True se n for par e False caso contrário. Teste com `print(eh_par(4), eh_par(7))`.',
            starter:'def eh_par(n):\n    # seu código aqui\n    pass\n\nprint(eh_par(4), eh_par(7))',
            expectedOutput:'True False', hint:'Uma expressão como n % 2 == 0 já é True ou False - pode devolver ela direto.' },
          { id:'py-basic-func-2', type:'predict', title:'Parâmetro com valor padrão',
            promptPt:'O que este código imprime?',
            code:'def saudacao(nome, saudacao="Ola"):\n    return f"{saudacao}, {nome}!"\n\nprint(saudacao("Ana"))',
            expectedOutput:'Ola, Ana!', hint:'Como "Ana" só preenche o primeiro parâmetro, o segundo usa o valor padrão "Ola".' },
        ]},
        { topic: 'Strings', exercises: [
          { id:'py-basic-str-1', type:'write', title:'Formatando uma frase',
            promptPt:'Dado `nome = "maria"` e `idade = 30`, imprima "Maria tem 30 anos." usando f-string e o método `.title()` para deixar a primeira letra maiúscula.',
            starter:'nome = "maria"\nidade = 30\n# seu código aqui\n',
            expectedOutput:'Maria tem 30 anos.', hint:'print(f"{nome.title()} tem {idade} anos.")' },
          { id:'py-basic-str-2', type:'predict', title:'Maiúsculas e tamanho',
            promptPt:'O que este código imprime? (são duas linhas)',
            code:'frase = "Python é incrivel"\nprint(frase.upper())\nprint(len(frase))',
            expectedOutput:'PYTHON É INCRIVEL\n17', hint:'.upper() deixa tudo maiúsculo (inclusive acentos); len() conta os caracteres, incluindo espaços.' },
        ]},
        { topic: 'Dicionários', exercises: [
          { id:'py-basic-dict-1', type:'write', title:'Agenda de idades',
            promptPt:'Um dicionário guarda pares chave→valor. Adicione `"Caio"` com idade 40 ao dicionário `idades`, e depois imprima a idade da Bia.',
            starter:'idades = {"Ana": 30, "Bia": 25}\n# seu código aqui\n',
            expectedOutput:'25', hint:'idades["Caio"] = 40 cria a nova chave; print(idades["Bia"]) lê o valor.' },
          { id:'py-basic-dict-2', type:'predict', title:'Chave existe? Valor padrão',
            promptPt:'O que este código imprime? (duas linhas)',
            code:'d = {"a": 1, "b": 2}\nprint("a" in d)\nprint(d.get("z", 0))',
            expectedOutput:'True\n0', hint:'"in" testa se a chave existe (True). .get("z", 0) devolve 0 porque a chave "z" não existe.' },
        ]},
      ],
      medium: [
        { topic: 'Compreensão de listas', exercises: [
          { id:'py-med-comp-1', type:'write', title:'Quadrados com list comprehension',
            promptPt:'Use compreensão de lista para criar uma lista com o quadrado dos números de 1 a 5, e imprima o resultado.',
            starter:'# seu código aqui\nquadrados = []\nprint(quadrados)',
            expectedOutput:'[1, 4, 9, 16, 25]', hint:'quadrados = [x*x for x in range(1, 6)]' },
          { id:'py-med-comp-2', type:'predict', title:'Filtro dentro da compreensão',
            promptPt:'O que este código imprime?',
            code:'pares = [x for x in range(20) if x % 2 == 0]\nprint(pares[:5])',
            expectedOutput:'[0, 2, 4, 6, 8]', hint:'A condição "if x % 2 == 0" filtra só os números pares; [:5] pega os 5 primeiros.' },
        ]},
        { topic: 'Dicionários', exercises: [
          { id:'py-med-dict-1', type:'write', title:'Atualizando um estoque',
            promptPt:'Dado `estoque = {"maca": 10, "banana": 5}`, adicione `"laranja": 8` e some 3 ao valor de "maca". Imprima o dicionário completo.',
            starter:'estoque = {"maca": 10, "banana": 5}\n# seu código aqui\n\nprint(estoque)',
            expectedOutput:"{'maca': 13, 'banana': 5, 'laranja': 8}", hint:'estoque["laranja"] = 8 e depois estoque["maca"] += 3' },
          { id:'py-med-dict-2', type:'predict', title:'Somando os valores',
            promptPt:'O que este código imprime?',
            code:'precos = {"a": 1, "b": 2, "c": 3}\ntotal = sum(precos.values())\nprint(total)',
            expectedOutput:'6', hint:'.values() devolve só os valores do dicionário (1, 2 e 3); sum() soma tudo.' },
        ]},
        { topic: 'Lambda, map e filter', exercises: [
          { id:'py-med-lambda-1', type:'write', title:'Filtrando pares com lambda',
            promptPt:'Use `filter` com uma função `lambda` para pegar só os números pares de `[5, 3, 8, 1, 9]`, e imprima a lista resultante.',
            starter:'nums = [5, 3, 8, 1, 9]\n# seu código aqui\npares = []\nprint(pares)',
            expectedOutput:'[8]', hint:'pares = list(filter(lambda x: x % 2 == 0, nums))' },
          { id:'py-med-lambda-2', type:'predict', title:'Dobrando valores com map',
            promptPt:'O que este código imprime?',
            code:'nums = [1, 2, 3, 4]\ndobro = list(map(lambda x: x * 2, nums))\nprint(dobro)',
            expectedOutput:'[2, 4, 6, 8]', hint:'map aplica a função lambda em cada item da lista, dobrando cada valor.' },
        ]},
        { topic: 'Tratamento de exceções', exercises: [
          { id:'py-med-exc-1', type:'write', title:'Dividindo com segurança',
            promptPt:'Escreva `dividir(a, b)` que devolve `a / b`, mas se `b` for zero, captura o erro com try/except e devolve a string "Erro: divisao por zero". Teste com `print(dividir(10, 2))` e `print(dividir(5, 0))`.',
            starter:'def dividir(a, b):\n    # seu código aqui\n    pass\n\nprint(dividir(10, 2))\nprint(dividir(5, 0))',
            expectedOutput:'5.0\nErro: divisao por zero', hint:'Use try: return a / b, e except ZeroDivisionError: return "Erro: divisao por zero"' },
          { id:'py-med-exc-2', type:'predict', title:'Capturando erro de conversão',
            promptPt:'O que este código imprime?',
            code:'try:\n    x = int("abc")\nexcept ValueError:\n    print("valor invalido")',
            expectedOutput:'valor invalido', hint:'"abc" não é um número, então int("abc") gera um ValueError, que é capturado pelo except.' },
        ]},
        { topic: 'Classes (introdução a OOP)', exercises: [
          { id:'py-med-oop-1', type:'write', title:'Uma conta bancária simples',
            promptPt:'Crie a classe `ContaBancaria` com `__init__(self, saldo=0)`, método `depositar(self, valor)` que soma ao saldo, e `__str__` devolvendo `f"Saldo: {self.saldo}"`. Deposite 50 numa conta com saldo inicial 100 e imprima a conta.',
            starter:'class ContaBancaria:\n    # seu código aqui\n    pass\n\nconta = ContaBancaria(100)\nconta.depositar(50)\nprint(conta)',
            expectedOutput:'Saldo: 150', hint:'def __init__(self, saldo=0): self.saldo = saldo / def depositar(self, valor): self.saldo += valor' },
          { id:'py-med-oop-2', type:'predict', title:'Área de um retângulo',
            promptPt:'O que este código imprime?',
            code:'class Retangulo:\n    def __init__(self, largura, altura):\n        self.largura = largura\n        self.altura = altura\n    def area(self):\n        return self.largura * self.altura\n\nr = Retangulo(4, 5)\nprint(r.area())',
            expectedOutput:'20', hint:'A área é largura vezes altura: 4 * 5.' },
        ]},
        { topic: 'Recursão', exercises: [
          { id:'py-med-rec-1', type:'write', title:'Fatorial recursivo',
            promptPt:'Escreva `fatorial(n)` de forma recursiva (a função chama a si mesma). Teste com `print(fatorial(5))`.',
            starter:'def fatorial(n):\n    # seu código aqui\n    pass\n\nprint(fatorial(5))',
            expectedOutput:'120', hint:'Caso base: se n <= 1, devolva 1. Caso geral: devolva n * fatorial(n - 1).' },
          { id:'py-med-rec-2', type:'predict', title:'Sequência de Fibonacci',
            promptPt:'O que este código imprime?',
            code:'def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n - 1) + fibonacci(n - 2)\n\nprint([fibonacci(i) for i in range(8)])',
            expectedOutput:'[0, 1, 1, 2, 3, 5, 8, 13]', hint:'Cada número é a soma dos dois anteriores: 0, 1, 1, 2, 3, 5, 8, 13.' },
        ]},
        { topic: 'Ordenação com sorted e key', exercises: [
          { id:'py-med-sort-1', type:'write', title:'Ordenar ignorando maiúsculas',
            promptPt:'Ordene a lista `nomes` em ordem alfabética IGNORANDO maiúsculas/minúsculas, guarde em `ordenado` e imprima.',
            starter:'nomes = ["banana", "Abacaxi", "cereja"]\n# seu código aqui\nordenado = nomes\nprint(ordenado)',
            expectedOutput:"['Abacaxi', 'banana', 'cereja']", hint:'ordenado = sorted(nomes, key=str.lower) - o key diz por qual critério comparar.' },
          { id:'py-med-sort-2', type:'predict', title:'Ordenando tuplas pela idade',
            promptPt:'O que este código imprime?',
            code:'pessoas = [("Ana", 30), ("Bia", 25), ("Caio", 35)]\npessoas.sort(key=lambda p: p[1])\nprint(pessoas[0])',
            expectedOutput:"('Bia', 25)", hint:'key=lambda p: p[1] ordena pela idade (2º item). A menor idade fica em primeiro.' },
        ]},
        { topic: 'enumerate e zip', exercises: [
          { id:'py-med-ez-1', type:'write', title:'Juntando duas listas',
            promptPt:'Dadas `nomes` e `notas`, imprima uma linha por pessoa no formato `Ana: 8`.',
            starter:'nomes = ["Ana", "Bia"]\nnotas = [8, 9]\n# seu código aqui\n',
            expectedOutput:'Ana: 8\nBia: 9', hint:'for nome, nota in zip(nomes, notas):\n    print(f"{nome}: {nota}")' },
          { id:'py-med-ez-2', type:'predict', title:'Índice junto com o item',
            promptPt:'O que este código imprime?',
            code:'for i, letra in enumerate("abc"):\n    print(i, letra)',
            expectedOutput:'0 a\n1 b\n2 c', hint:'enumerate dá o índice (0, 1, 2) junto com cada caractere.' },
        ]},
        { topic: 'Conjuntos (set)', exercises: [
          { id:'py-med-set-1', type:'write', title:'Quantos valores diferentes?',
            promptPt:'A lista `numeros` tem valores repetidos. Imprima quantos valores DIFERENTES existem nela.',
            starter:'numeros = [1, 2, 2, 3, 3, 3, 4]\n# seu código aqui\n',
            expectedOutput:'4', hint:'set(numeros) descarta os repetidos; use print(len(set(numeros))).' },
          { id:'py-med-set-2', type:'predict', title:'Interseção e união',
            promptPt:'O que este código imprime? (duas linhas)',
            code:'a = {1, 2, 3, 4}\nb = {3, 4, 5, 6}\nprint(sorted(a & b))\nprint(sorted(a | b))',
            expectedOutput:'[3, 4]\n[1, 2, 3, 4, 5, 6]', hint:'& é interseção (o que está nos dois conjuntos); | é união (todos os elementos).' },
        ]},
      ],
    },
    csharp: {
      beginner: [
        { topic: 'Loops (repetição)', exercises: [
          { id:'cs-begin-loop-1', type:'write', title:'Repita 3 vezes',
            promptPt:'Um `for` repete um bloco de código várias vezes. Complete o código pra imprimir "Oi!" três vezes (uma em cada linha) com `Console.WriteLine`.',
            starter:'for (int i = 0; i < 3; i++) {\n    // seu código aqui: imprima "Oi!"\n}',
            expectedOutput:'Oi!\nOi!\nOi!', checks:[/for\s*\(/, /Console\.WriteLine/i],
            hint:'Dentro do for, use Console.WriteLine("Oi!"); - o for roda 3 vezes (i = 0, 1, 2).' },
          { id:'cs-begin-loop-2', type:'predict', title:'Contando com o for',
            promptPt:'O que este código imprime? (uma linha por número)',
            code:'for (int n = 1; n <= 3; n++) {\n    Console.WriteLine(n);\n}',
            expectedOutput:'1\n2\n3', hint:'O for começa em n=1 e continua enquanto n <= 3 - por isso conta 1, 2, 3.' },
        ]},
        { topic: 'Métodos', exercises: [
          { id:'cs-begin-func-1', type:'write', title:'Seu primeiro método',
            promptPt:'Um método é um "pacotinho" de código com nome, que você pode chamar quando quiser. Complete o método `Saudacao()` pra ele imprimir "Bem-vindo ao mundo da programação!", e chame ele (a chamada `Saudacao();` já está pronta no final).',
            starter:'static void Saudacao() {\n    // seu código aqui\n}\n\nSaudacao();',
            expectedOutput:'Bem-vindo ao mundo da programação!', checks:[/void\s+Saudacao\s*\(/i, /Console\.WriteLine/i],
            hint:'Dentro do método, use Console.WriteLine("Bem-vindo ao mundo da programação!");' },
          { id:'cs-begin-func-2', type:'predict', title:'Método com parâmetro',
            promptPt:'O que este código imprime? Um método pode receber um valor (parâmetro) e devolver um resultado.',
            code:'int Dobro(int n) => n * 2;\nConsole.WriteLine(Dobro(5));',
            expectedOutput:'10', hint:'O método Dobro recebe 5, multiplica por 2, e devolve 10.' },
        ]},
        { topic: 'Condicionais (if / else)', exercises: [
          { id:'cs-begin-cond-1', type:'write', title:'Pode entrar?',
            promptPt:'Um `if` deixa o código tomar decisões. Complete `CheckIdade(idade)`: se `idade >= 18`, imprima "Pode entrar!"; senão, imprima "Você ainda não pode entrar.". A chamada com 20 já está pronta.',
            starter:'static void CheckIdade(int idade) {\n    // seu código aqui\n}\n\nCheckIdade(20);',
            expectedOutput:'Pode entrar!', checks:[/if\s*\(/, /else/],
            hint:'if (idade >= 18) Console.WriteLine("Pode entrar!"); else Console.WriteLine("Você ainda não pode entrar.");' },
          { id:'cs-begin-cond-2', type:'predict', title:'Testando a condição',
            promptPt:'O que este código imprime?',
            code:'int idade = 15;\nif (idade >= 18) Console.WriteLine("Pode entrar!");\nelse Console.WriteLine("Você ainda não pode entrar.");',
            expectedOutput:'Você ainda não pode entrar.', hint:'15 é menor que 18, então a condição do if é falsa e o else é executado.' },
        ]},
        { topic: 'Texto (strings)', exercises: [
          { id:'cs-begin-str-1', type:'write', title:'Nome completo',
            promptPt:'O operador `+` junta textos. Dado `nome = "Ana"` e `sobrenome = "Souza"`, imprima "Ana Souza" (com um espaço no meio) com `Console.WriteLine`.',
            starter:'string nome = "Ana";\nstring sobrenome = "Souza";\n// seu código aqui\n',
            expectedOutput:'Ana Souza', checks:[/Console\.WriteLine/i],
            hint:'Console.WriteLine(nome + " " + sobrenome); ou Console.WriteLine($"{nome} {sobrenome}");' },
          { id:'cs-begin-str-2', type:'predict', title:'Tamanho e maiúsculas',
            promptPt:'O que este código imprime? (duas linhas)',
            code:'string palavra = "banana";\nConsole.WriteLine(palavra.Length);\nConsole.WriteLine(palavra.ToUpper());',
            expectedOutput:'6\nBANANA', hint:'.Length conta as letras (6); .ToUpper() deixa tudo maiúsculo.' },
        ]},
        { topic: 'Listas (introdução)', exercises: [
          { id:'cs-begin-list-1', type:'write', title:'Quantos itens tem a lista?',
            promptPt:'A lista `frutas` já está pronta - imprima quantos itens ela tem com `Console.WriteLine`.',
            starter:'var frutas = new List<string> { "maca", "uva", "pera" };\n// seu código aqui\n',
            expectedOutput:'3', checks:[/\.Count/i, /Console\.WriteLine/i],
            hint:'Console.WriteLine(frutas.Count); - .Count é a quantidade de itens da lista.' },
          { id:'cs-begin-list-2', type:'predict', title:'Pegando itens pelo índice',
            promptPt:'O que este código imprime? (duas linhas)',
            code:'int[] numeros = {10, 20, 30};\nConsole.WriteLine(numeros[0]);\nConsole.WriteLine(numeros[2]);',
            expectedOutput:'10\n30', hint:'Os índices começam em 0: numeros[0] é 10 e numeros[2] é 30.' },
        ]},
      ],
      basic: [
        { topic: 'Variáveis e tipos', exercises: [
          { id:'cs-basic-vars-1', type:'write', title:'Calculando a média',
            promptPt:'Escreva um método `double Media(double a, double b, double c)` que devolve a média das três notas, e imprima o resultado de `Media(7, 8, 9)` com `Console.WriteLine`.',
            starter:'static double Media(double a, double b, double c) {\n    // seu código aqui\n}\n\nConsole.WriteLine(Media(7, 8, 9));',
            expectedOutput:'8', checks:[/double\s+Media\s*\(/i, /Console\.WriteLine/i, /\/\s*3(\.0)?\b/],
            hint:'return (a + b + c) / 3;' },
          { id:'cs-basic-vars-2', type:'predict', title:'Divisão entre inteiros',
            promptPt:'O que este código imprime? (duas linhas)',
            code:'int x = 7;\nint y = 2;\nConsole.WriteLine(x / y);\nConsole.WriteLine(x % y);',
            expectedOutput:'3\n1', hint:'Em C#, dividir dois int trunca o resultado (divisão inteira): 7/2 vira 3, o resto é 1.' },
        ]},
        { topic: 'Condicionais', exercises: [
          { id:'cs-basic-cond-1', type:'write', title:'Classificando idades',
            promptPt:'Escreva `string Classifica(int idade)`: "crianca" se idade < 13, "adolescente" se idade < 18, senão "adulto". Imprima `Classifica(15)`.',
            starter:'static string Classifica(int idade) {\n    // seu código aqui\n}\n\nConsole.WriteLine(Classifica(15));',
            expectedOutput:'adolescente', checks:[/if\s*\(/, /else\s+if\s*\(/, /else\b/],
            hint:'if (idade < 13) ... else if (idade < 18) ... else ...' },
          { id:'cs-basic-cond-2', type:'predict', title:'Switch de dias da semana',
            promptPt:'O que este código imprime?',
            code:'int dia = 3;\nswitch (dia) {\n    case 1: Console.WriteLine("Segunda"); break;\n    case 2: Console.WriteLine("Terca"); break;\n    case 3: Console.WriteLine("Quarta"); break;\n    default: Console.WriteLine("Outro"); break;\n}',
            expectedOutput:'Quarta', hint:'dia vale 3, então cai no case 3.' },
        ]},
        { topic: 'Laços de repetição (loops)', exercises: [
          { id:'cs-basic-loop-1', type:'write', title:'Somando com for',
            promptPt:'Use um `for` para somar os números de 1 a 5 (incluindo o 5) numa variável `total`, e imprima o resultado.',
            starter:'int total = 0;\n// seu código aqui\n\nConsole.WriteLine(total);',
            expectedOutput:'15', checks:[/for\s*\(/, /total\s*\+=|total\s*=\s*total\s*\+/],
            hint:'for (int i = 1; i <= 5; i++) { total += i; }' },
          { id:'cs-basic-loop-2', type:'predict', title:'While com filtro',
            promptPt:'O que este código imprime? (uma linha só)',
            code:'int i = 0;\nwhile (i < 10) {\n    if (i % 2 == 0) Console.Write(i + " ");\n    i++;\n}',
            expectedOutput:'0 2 4 6 8', hint:'Console.Write (sem Line) não pula linha - o resultado sai tudo junto, separado por espaço.' },
        ]},
        { topic: 'Arrays e List<T>', exercises: [
          { id:'cs-basic-list-1', type:'write', title:'Maior valor com foreach',
            promptPt:'Escreva `int Maior(List<int> lista)` que devolve o maior valor, usando `foreach` (sem usar `.Max()` pronto). Teste com `{4, 9, 2, 7, 1}`.',
            starter:'static int Maior(List<int> lista) {\n    // seu código aqui\n}\n\nConsole.WriteLine(Maior(new List<int> {4, 9, 2, 7, 1}));',
            expectedOutput:'9', checks:[/foreach\s*\(/, /List<int>/],
            hint:'int m = lista[0]; foreach (int x in lista) { if (x > m) m = x; } return m;' },
          { id:'cs-basic-list-2', type:'predict', title:'Somando posições de um array',
            promptPt:'O que este código imprime?',
            code:'int[] nums = {10, 20, 30, 40};\nConsole.WriteLine(nums[1] + nums[2]);',
            expectedOutput:'50', hint:'Índices começam em 0: nums[1] é 20, nums[2] é 30.' },
        ]},
        { topic: 'Métodos', exercises: [
          { id:'cs-basic-func-1', type:'write', title:'Verificando paridade',
            promptPt:'Escreva `bool EhPar(int n)` que devolve true se n for par. Imprima `EhPar(4)` e `EhPar(7)`.',
            starter:'static bool EhPar(int n) {\n    // seu código aqui\n}\n\nConsole.WriteLine(EhPar(4));\nConsole.WriteLine(EhPar(7));',
            expectedOutput:'True\nFalse', checks:[/bool\s+EhPar\s*\(/i, /%\s*2\s*==\s*0/],
            hint:'return n % 2 == 0;' },
          { id:'cs-basic-func-2', type:'predict', title:'Parâmetro opcional',
            promptPt:'O que este código imprime?',
            code:'string Saudacao(string nome, string saudacao = "Ola") {\n    return $"{saudacao}, {nome}!";\n}\nConsole.WriteLine(Saudacao("Ana"));',
            expectedOutput:'Ola, Ana!', hint:'Como só "Ana" foi passado, o segundo parâmetro usa o valor padrão "Ola".' },
        ]},
        { topic: 'Strings e interpolação', exercises: [
          { id:'cs-basic-str-1', type:'write', title:'Formatando com $"..."',
            promptPt:'Dado `string nome = "maria"` e `int idade = 30`, imprima "MARIA tem 30 anos." usando interpolação `$"..."` e `.ToUpper()`.',
            starter:'string nome = "maria";\nint idade = 30;\n// seu código aqui\n',
            expectedOutput:'MARIA tem 30 anos.', checks:[/\$"/, /\.ToUpper\s*\(\s*\)/i],
            hint:'Console.WriteLine($"{nome.ToUpper()} tem {idade} anos.");' },
          { id:'cs-basic-str-2', type:'predict', title:'Tamanho e maiúsculas',
            promptPt:'O que este código imprime? (duas linhas)',
            code:'string frase = "Programar e incrivel";\nConsole.WriteLine(frase.Length);\nConsole.WriteLine(frase.ToUpper());',
            expectedOutput:'20\nPROGRAMAR E INCRIVEL', hint:'.Length conta os caracteres, incluindo espaços.' },
        ]},
        { topic: 'Dictionary<K,V>', exercises: [
          { id:'cs-basic-dict-1', type:'write', title:'Agenda de idades',
            promptPt:'Adicione `"Caio"` com idade 40 ao dicionário `idades`, depois imprima a idade da Bia com `Console.WriteLine`.',
            starter:'var idades = new Dictionary<string,int> { {"Ana", 30}, {"Bia", 25} };\n// seu código aqui\n',
            expectedOutput:'25', checks:[/idades\s*\[\s*"Caio"\s*\]\s*=/, /Console\.WriteLine/i],
            hint:'idades["Caio"] = 40; depois Console.WriteLine(idades["Bia"]);' },
          { id:'cs-basic-dict-2', type:'predict', title:'Chave existe? Valor padrão',
            promptPt:'O que este código imprime? (duas linhas)',
            code:'var d = new Dictionary<string,int> { {"a",1}, {"b",2} };\nConsole.WriteLine(d.ContainsKey("a"));\nConsole.WriteLine(d.GetValueOrDefault("z", 0));',
            expectedOutput:'True\n0', hint:'ContainsKey("a") é true. GetValueOrDefault("z", 0) devolve 0 porque "z" não existe.' },
        ]},
      ],
      medium: [
        { topic: 'Classes e objetos', exercises: [
          { id:'cs-med-oop-1', type:'write', title:'Uma conta bancária simples',
            promptPt:'Crie a classe `ContaBancaria` com campo `Saldo`, construtor com valor inicial, e método `Depositar(double valor)`. Deposite 50 numa conta com saldo inicial 100 e imprima o saldo final.',
            starter:'class ContaBancaria {\n    // seu código aqui\n}\n\nvar conta = new ContaBancaria(100);\nconta.Depositar(50);\nConsole.WriteLine(conta.Saldo);',
            expectedOutput:'150', checks:[/class\s+ContaBancaria/i, /Depositar\s*\(/i, /\+=/],
            hint:'public double Saldo; public ContaBancaria(double saldoInicial) { Saldo = saldoInicial; } public void Depositar(double valor) { Saldo += valor; }' },
          { id:'cs-med-oop-2', type:'predict', title:'Área de um retângulo',
            promptPt:'O que este código imprime?',
            code:'class Retangulo {\n    public double Largura, Altura;\n    public Retangulo(double l, double a) { Largura = l; Altura = a; }\n    public double Area() => Largura * Altura;\n}\nvar r = new Retangulo(4, 5);\nConsole.WriteLine(r.Area());',
            expectedOutput:'20', hint:'Área = largura vezes altura: 4 * 5.' },
        ]},
        { topic: 'Herança', exercises: [
          { id:'cs-med-herit-1', type:'write', title:'Um Cachorro é um Animal',
            promptPt:'Crie a classe `Animal` com método virtual `Falar()` devolvendo "...". Crie `Cachorro : Animal` sobrescrevendo `Falar()` para devolver "Au au!". Teste com `Animal a = new Cachorro(); Console.WriteLine(a.Falar());`.',
            starter:'class Animal {\n    // seu código aqui\n}\nclass Cachorro : Animal {\n    // seu código aqui\n}\n\nAnimal a = new Cachorro();\nConsole.WriteLine(a.Falar());',
            expectedOutput:'Au au!', checks:[/:\s*Animal/, /override/i, /virtual/i],
            hint:'Na classe base: public virtual string Falar() => "..."; Na classe filha: public override string Falar() => "Au au!";' },
          { id:'cs-med-herit-2', type:'predict', title:'Polimorfismo numa lista',
            promptPt:'O que este código imprime? (duas linhas)',
            code:'class Veiculo {\n    public virtual int Rodas() => 4;\n}\nclass Moto : Veiculo {\n    public override int Rodas() => 2;\n}\nList<Veiculo> veiculos = new List<Veiculo> { new Veiculo(), new Moto() };\nforeach (var v in veiculos) Console.WriteLine(v.Rodas());',
            expectedOutput:'4\n2', hint:'O primeiro item é um Veiculo puro (4 rodas), o segundo é uma Moto que sobrescreve o método (2 rodas).' },
        ]},
        { topic: 'Interfaces', exercises: [
          { id:'cs-med-iface-1', type:'write', title:'Formas com interface',
            promptPt:'Crie `interface IForma { double Area(); }` e a classe `Quadrado : IForma` com campo `Lado` e `Area() => Lado * Lado`. Teste com lado 3.',
            starter:'interface IForma {\n    double Area();\n}\nclass Quadrado : IForma {\n    // seu código aqui\n}\n\nIForma forma = new Quadrado(3);\nConsole.WriteLine(forma.Area());',
            expectedOutput:'9', checks:[/interface\s+IForma/i, /:\s*IForma/, /double\s+Area\s*\(\s*\)/i],
            hint:'public double Lado; public Quadrado(double lado) { Lado = lado; } public double Area() => Lado * Lado;' },
          { id:'cs-med-iface-2', type:'predict', title:'Área de um círculo',
            promptPt:'O que este código imprime? (arredondado a 2 casas)',
            code:'class Circulo : IForma {\n    public double Raio;\n    public Circulo(double r) { Raio = r; }\n    public double Area() => Math.Round(Math.PI * Raio * Raio, 2);\n}\nIForma forma = new Circulo(2);\nConsole.WriteLine(forma.Area());',
            expectedOutput:'12.57', hint:'Área do círculo = π × raio². π × 4 ≈ 12.566, arredondado pra 12.57.' },
        ]},
        { topic: 'Tratamento de exceções', exercises: [
          { id:'cs-med-exc-1', type:'write', title:'Dividindo com segurança',
            promptPt:'Escreva `string Dividir(int a, int b)` que devolve a divisão como texto, mas captura `DivideByZeroException` e devolve "Erro: divisao por zero". Teste `Dividir(10, 2)` e `Dividir(5, 0)`.',
            starter:'static string Dividir(int a, int b) {\n    // seu código aqui\n}\n\nConsole.WriteLine(Dividir(10, 2));\nConsole.WriteLine(Dividir(5, 0));',
            expectedOutput:'5\nErro: divisao por zero', checks:[/try\s*\{/, /catch\s*\(/],
            hint:'try { int r = a / b; return r.ToString(); } catch (DivideByZeroException) { return "Erro: divisao por zero"; }' },
          { id:'cs-med-exc-2', type:'predict', title:'Erro de conversão',
            promptPt:'O que este código imprime?',
            code:'try {\n    int x = int.Parse("abc");\n} catch (FormatException) {\n    Console.WriteLine("valor invalido");\n}',
            expectedOutput:'valor invalido', hint:'"abc" não é um número válido, então int.Parse lança FormatException, capturada pelo catch.' },
        ]},
        { topic: 'LINQ básico', exercises: [
          { id:'cs-med-linq-1', type:'write', title:'Filtrando com Where',
            promptPt:'Use LINQ (`using System.Linq;`) para filtrar os números pares de `{5, 3, 8, 1, 9}` com `.Where(...)`, e imprima com `string.Join(", ", ...)`.',
            starter:'List<int> nums = new List<int> {5, 3, 8, 1, 9};\n// seu código aqui\n',
            expectedOutput:'8', checks:[/\.Where\s*\(/, /=>/],
            hint:'var pares = nums.Where(x => x % 2 == 0).ToList(); Console.WriteLine(string.Join(", ", pares));' },
          { id:'cs-med-linq-2', type:'predict', title:'Transformando com Select',
            promptPt:'O que este código imprime?',
            code:'List<int> nums = new List<int> {1, 2, 3, 4};\nvar dobro = nums.Select(x => x * 2).ToList();\nConsole.WriteLine(string.Join(", ", dobro));',
            expectedOutput:'2, 4, 6, 8', hint:'.Select() transforma cada item aplicando a expressão - aqui, multiplicando por 2.' },
        ]},
        { topic: 'Dictionary<K,V>', exercises: [
          { id:'cs-med-dict-1', type:'write', title:'Atualizando um estoque',
            promptPt:'Dado `estoque = new Dictionary<string,int> {{"maca",10},{"banana",5}}`, adicione `"laranja"=8` e some 3 ao valor de "maca". Imprima os dois valores.',
            starter:'var estoque = new Dictionary<string,int> { {"maca", 10}, {"banana", 5} };\n// seu código aqui\n\nConsole.WriteLine(estoque["maca"]);\nConsole.WriteLine(estoque["laranja"]);',
            expectedOutput:'13\n8', checks:[/estoque\s*\[\s*"laranja"\s*\]\s*=/, /estoque\s*\[\s*"maca"\s*\]\s*\+=/],
            hint:'estoque["laranja"] = 8; estoque["maca"] += 3;' },
          { id:'cs-med-dict-2', type:'predict', title:'Somando os valores',
            promptPt:'O que este código imprime?',
            code:'var precos = new Dictionary<string,int> { {"a",1}, {"b",2}, {"c",3} };\nint total = precos.Values.Sum();\nConsole.WriteLine(total);',
            expectedOutput:'6', hint:'.Values pega só os valores do dicionário (1, 2 e 3); .Sum() soma tudo.' },
        ]},
        { topic: 'LINQ: OrderBy, Sum e Average', exercises: [
          { id:'cs-med-linq2-1', type:'write', title:'Média com LINQ',
            promptPt:'Use LINQ (`using System.Linq;`) para imprimir a média (`.Average()`) da lista `{4, 8, 6, 2}`.',
            starter:'List<int> nums = new List<int> {4, 8, 6, 2};\n// seu código aqui\n',
            expectedOutput:'5', checks:[/\.Average\s*\(\s*\)/i, /Console\.WriteLine/i],
            hint:'Console.WriteLine(nums.Average()); - a soma 20 dividida por 4 itens dá 5.' },
          { id:'cs-med-linq2-2', type:'predict', title:'Os 3 maiores',
            promptPt:'O que este código imprime?',
            code:'List<int> nums = new List<int> {5, 1, 4, 2, 3};\nvar top3 = nums.OrderByDescending(x => x).Take(3);\nConsole.WriteLine(string.Join(", ", top3));',
            expectedOutput:'5, 4, 3', hint:'OrderByDescending ordena do maior pro menor; Take(3) pega os 3 primeiros: 5, 4, 3.' },
        ]},
        { topic: 'Tuplas e deconstrução', exercises: [
          { id:'cs-med-tup-1', type:'write', title:'Menor e maior de uma vez',
            promptPt:'Escreva `(int, int) MinMax(List<int> l)` que devolve o menor e o maior valor numa tupla. Teste com `{7, 2, 9, 4}`.',
            starter:'static (int, int) MinMax(List<int> l) {\n    // seu código aqui\n}\n\nvar (menor, maior) = MinMax(new List<int> {7, 2, 9, 4});\nConsole.WriteLine(menor);\nConsole.WriteLine(maior);',
            expectedOutput:'2\n9', checks:[/\(int,\s*int\)/, /return\s*\(/],
            hint:'int mn = l[0], mx = l[0]; foreach (var x in l) { if (x < mn) mn = x; if (x > mx) mx = x; } return (mn, mx);' },
          { id:'cs-med-tup-2', type:'predict', title:'Deconstruindo uma tupla nomeada',
            promptPt:'O que este código imprime? (duas linhas)',
            code:'var ponto = (x: 3, y: 4);\nvar (a, b) = ponto;\nConsole.WriteLine(a + b);\nConsole.WriteLine(ponto.y);',
            expectedOutput:'7\n4', hint:'A deconstrução copia x→a (3) e y→b (4), então a + b = 7. ponto.y continua sendo 4.' },
        ]},
        { topic: 'Genéricos <T>', exercises: [
          { id:'cs-med-gen-1', type:'write', title:'Método genérico',
            promptPt:'Escreva um método genérico `T Ultimo<T>(List<T> lista)` que devolve o último item de qualquer lista. Teste com uma lista de strings `{"a", "b", "c"}`.',
            starter:'static T Ultimo<T>(List<T> lista) {\n    // seu código aqui\n}\n\nConsole.WriteLine(Ultimo(new List<string> {"a", "b", "c"}));',
            expectedOutput:'c', checks:[/<T>/, /lista\s*\[\s*lista\.Count\s*-\s*1\s*\]|lista\s*\[\s*\^1\s*\]/],
            hint:'return lista[lista.Count - 1]; - funciona pra lista de qualquer tipo T.' },
          { id:'cs-med-gen-2', type:'predict', title:'Pilha (Stack) é LIFO',
            promptPt:'O que este código imprime? (duas linhas)',
            code:'var pilha = new Stack<int>();\npilha.Push(1);\npilha.Push(2);\npilha.Push(3);\nConsole.WriteLine(pilha.Pop());\nConsole.WriteLine(pilha.Peek());',
            expectedOutput:'3\n2', hint:'Stack é "último a entrar, primeiro a sair". Pop tira o 3 (topo); Peek olha o novo topo (2) sem remover.' },
        ]},
      ],
    },
  };

  const LANG_LABEL = { python: '🐍 Python', csharp: '🔷 C#' };
  // Jornada gamificada: 3 etapas, cada uma só se abre depois de terminar
  // 100% da anterior. O conteúdo do nível avançado (antigo "médio") não foi
  // tocado - só ganhou um nome de topo de trilha.
  const TIER_ORDER = ['beginner', 'basic', 'medium'];
  const TIER_LABEL = { beginner: '🌱 Bem Iniciante', basic: '🚀 Intermediário', medium: '🏆 Super Mega Programador' };

  // ---------- Estado e progresso ----------
  let state = { lang: 'python', tier: 'beginner', topicIndex: 0, exIndex: 0 };

  function ensureCodingData() {
    let x = p();
    if (!x.coding) x.coding = { done: {} };
    if (!x.coding.done) x.coding.done = {};
  }
  function exId(topicI, exI) { return flatExercises()[topicI] ? flatExercises()[topicI][exI]?.id : null; }
  function topicsOf(lang, tier) { return CURRICULUM[lang][tier]; }
  function topics() { return topicsOf(state.lang, state.tier); }
  function flatExercises() { return topics().map((t) => t.exercises); }
  function currentTopic() { return topics()[state.topicIndex]; }
  function currentExercise() { return currentTopic()?.exercises[state.exIndex]; }
  function isDone(id) { ensureCodingData(); return !!p().coding.done[id]; }
  function markDone(id) { ensureCodingData(); p().coding.done[id] = true; save(); refreshProgressCounter(); }
  function refreshProgressCounter() {
    const total = topics().reduce((a, t) => a + t.exercises.length, 0);
    const doneCount = topics().reduce((a, t) => a + topicProgress(t), 0);
    if ($id('codingProgress')) $id('codingProgress').textContent = `${doneCount}/${total} exercícios concluídos neste nível`;
  }
  function topicProgress(t) { return t.exercises.filter((e) => isDone(e.id)).length; }
  function tierProgress(lang, tier) {
    const t = topicsOf(lang, tier);
    const total = t.reduce((a, x) => a + x.exercises.length, 0);
    const done = t.reduce((a, x) => a + topicProgress(x), 0);
    return { total, done };
  }
  // Só o "Bem Iniciante" começa liberado; cada etapa seguinte pede 100% da
  // anterior concluída, pra dar aquela sensação real de progressão.
  function tierUnlocked(lang, tier) {
    const idx = TIER_ORDER.indexOf(tier);
    if (idx <= 0) return true;
    const prev = tierProgress(lang, TIER_ORDER[idx - 1]);
    return prev.total > 0 && prev.done >= prev.total;
  }
  function isTierFullyDone(lang, tier) {
    const { total, done } = tierProgress(lang, tier);
    return total > 0 && done >= total;
  }

  // ---------- Injeta a tela ----------
  function inject() {
    if ($id('codingScreen')) return;
    document.querySelector('.app').insertAdjacentHTML('beforeend', `
<section id="codingScreen" class="hidden">
  <div class="top"><button id="codingBack" class="icon">←</button><div class="brand">Laboratório de <em>Código</em></div><div class="grow"></div></div>
  <div id="codingHome">
    <div class="card" style="text-align:center">
      <div style="font-size:44px">💻</div>
      <h2 style="margin:6px 0">Programação para profissionais</h2>
      <p class="mut">Lógica de programação de verdade em C# e Python. Não é para crianças: aqui você escreve código, roda Python de verdade no navegador e confere sua lógica em C#.</p>
    </div>
    <div class="essay-tabs"><button id="codingLangPy" class="essay-tab">🐍 Python</button><button id="codingLangCs" class="essay-tab">🔷 C#</button></div>
    <div id="codingJourney" class="essay-tabs" style="grid-template-columns:1fr 1fr 1fr"></div>
    <div id="codingTopics" class="story-library"></div>
  </div>
  <div id="codingExercise" class="hidden">
    <div class="card">
      <span id="codingExTopic" class="pill"></span>
      <h2 id="codingExTitle" style="margin:8px 0 4px"></h2>
      <p id="codingExPrompt" class="mut"></p>
    </div>
    <div id="codingWriteArea" class="card hidden">
      <textarea id="codingEditor" class="field" style="font-family:ui-monospace,Menlo,Consolas,monospace;white-space:pre;min-height:220px;resize:vertical;font-size:14px;line-height:1.5" spellcheck="false" autocapitalize="off" autocomplete="off"></textarea>
    </div>
    <div id="codingPredictArea" class="card hidden">
      <pre id="codingSnippet" class="corrected" style="font-size:13px;font-family:ui-monospace,Menlo,Consolas,monospace"></pre>
      <textarea id="codingPredictInput" class="field" placeholder="O que este código imprime? (se forem várias linhas, escreva uma em cada linha)" style="margin-top:10px;min-height:70px;resize:vertical;font-family:ui-monospace,Menlo,Consolas,monospace" autocapitalize="off" autocomplete="off"></textarea>
    </div>
    <div class="row"><button id="codingCheckBtn" class="primary grow">✅ Verificar</button><button id="codingHintBtn" class="secondary">💡 Dica</button></div>
    <div id="codingFeedback" class="hidden" style="margin-top:10px"></div>
    <div class="row" style="margin-top:10px"><button id="codingPrevEx" class="secondary grow">⏮ Anterior</button><button id="codingNextEx" class="secondary grow">Próximo ⏭</button></div>
    <p id="codingProgress" class="mut" style="text-align:center;margin-top:6px"></p>
  </div>
</section>`);
    bind();
  }

  function bind() {
    $id('codingBack').onclick = () => { show('home'); render(); };
    $id('codingLangPy').onclick = () => { state.lang = 'python'; state.tier = 'beginner'; state.topicIndex = 0; renderHome(); };
    $id('codingLangCs').onclick = () => { state.lang = 'csharp'; state.tier = 'beginner'; state.topicIndex = 0; renderHome(); };
    $id('codingCheckBtn').onclick = checkCurrent;
    $id('codingHintBtn').onclick = showHint;
    $id('codingPrevEx').onclick = () => moveExercise(-1);
    $id('codingNextEx').onclick = () => moveExercise(1);
  }

  function selectTier(tier) {
    if (!tierUnlocked(state.lang, tier)) {
      const idx = TIER_ORDER.indexOf(tier);
      const prev = tierProgress(state.lang, TIER_ORDER[idx - 1]);
      alert(`🔒 Ainda não! Termine o nível "${TIER_LABEL[TIER_ORDER[idx - 1]]}" primeiro (${prev.done}/${prev.total} concluídos).`);
      return;
    }
    state.tier = tier; state.topicIndex = 0; renderHome();
  }

  window.openCodingLab = function openCodingLab() {
    inject();
    ensureCodingData();
    show('codingScreen');
    $id('codingHome').classList.remove('hidden');
    $id('codingExercise').classList.add('hidden');
    renderHome();
  };

  function renderHome() {
    $id('codingLangPy').classList.toggle('active', state.lang === 'python');
    $id('codingLangCs').classList.toggle('active', state.lang === 'csharp');
    $id('codingJourney').innerHTML = TIER_ORDER.map((tier) => {
      const unlocked = tierUnlocked(state.lang, tier);
      const fullyDone = isTierFullyDone(state.lang, tier);
      const badge = fullyDone ? ' ✅' : unlocked ? '' : ' 🔒';
      return `<button class="essay-tab${state.tier === tier ? ' active' : ''}" data-tier="${tier}" style="${unlocked ? '' : 'opacity:.55'}">${TIER_LABEL[tier]}${badge}</button>`;
    }).join('');
    document.querySelectorAll('[data-tier]').forEach((b) => b.onclick = () => selectTier(b.dataset.tier));
    $id('codingTopics').innerHTML = topics().map((t, i) => {
      const done = topicProgress(t), total = t.exercises.length;
      return `<button class="story-card" data-topic="${i}"><span class="cover">${done === total ? '✅' : '📘'}</span><span><b>${esc(t.topic)}</b><small>${LANG_LABEL[state.lang]} · ${TIER_LABEL[state.tier]} · ${done}/${total} concluídos</small></span><span class="go">›</span></button>`;
    }).join('');
    document.querySelectorAll('[data-topic]').forEach((b) => b.onclick = () => openTopic(+b.dataset.topic));
  }

  function openTopic(topicIndex) {
    state.topicIndex = topicIndex;
    state.exIndex = 0;
    $id('codingHome').classList.add('hidden');
    $id('codingExercise').classList.remove('hidden');
    renderExercise();
  }

  function renderExercise() {
    const ex = currentExercise();
    if (!ex) return;
    $id('codingExTopic').textContent = `${LANG_LABEL[state.lang]} · ${TIER_LABEL[state.tier]} · ${currentTopic().topic}`;
    $id('codingExTitle').textContent = (ex.type === 'predict' ? '🔎 ' : '⌨️ ') + ex.title;
    $id('codingExPrompt').textContent = ex.promptPt;
    $id('codingFeedback').classList.add('hidden');
    $id('codingFeedback').innerHTML = '';
    const isWrite = ex.type === 'write';
    $id('codingWriteArea').classList.toggle('hidden', !isWrite);
    $id('codingPredictArea').classList.toggle('hidden', isWrite);
    if (isWrite) {
      $id('codingEditor').value = ex.starter || '';
      $id('codingCheckBtn').textContent = state.lang === 'python' ? '▶️ Rodar e verificar' : '✅ Verificar código';
    } else {
      $id('codingSnippet').textContent = ex.code || '';
      $id('codingPredictInput').value = '';
      $id('codingCheckBtn').textContent = '✅ Verificar';
    }
    $id('codingPrevEx').disabled = state.topicIndex === 0 && state.exIndex === 0;
    refreshProgressCounter();
  }

  function moveExercise(dir) {
    const exs = currentTopic().exercises;
    let ti = state.topicIndex, ei = state.exIndex + dir;
    if (ei < 0) {
      if (ti === 0) return;
      ti -= 1; ei = topics()[ti].exercises.length - 1;
    } else if (ei >= exs.length) {
      if (ti >= topics().length - 1) { $id('codingHome').classList.remove('hidden'); $id('codingExercise').classList.add('hidden'); renderHome(); return; }
      ti += 1; ei = 0;
    }
    state.topicIndex = ti; state.exIndex = ei;
    renderExercise();
  }

  function showHint() {
    const ex = currentExercise();
    feedback(`💡 ${ex.hint}`, 'hint');
  }

  // Chamado sempre que um exercício é resolvido corretamente. Se esse era o
  // último exercício do nível, troca o "Próximo exercício" normal por uma
  // conquista comemorando o nível inteiro e avisando o que foi desbloqueado
  // - essa é a "progressão contínua gamificada" pedida.
  function afterSolved(bodyHtml) {
    const justFinishedTier = isTierFullyDone(state.lang, state.tier);
    if (!justFinishedTier) {
      feedback(`${bodyHtml}<button id="codingAutoNext" class="primary" style="margin-top:8px">Próximo exercício ⏭</button>`, 'ok');
      $id('codingAutoNext').onclick = () => moveExercise(1);
      return;
    }
    const idx = TIER_ORDER.indexOf(state.tier);
    const nextTier = TIER_ORDER[idx + 1];
    const goHome = () => { $id('codingHome').classList.remove('hidden'); $id('codingExercise').classList.add('hidden'); renderHome(); };
    const badge = nextTier
      ? `<div class="essay-prompt" style="margin-top:10px"><b>🏅 Nível "${TIER_LABEL[state.tier]}" concluído!</b><br>O nível "${TIER_LABEL[nextTier]}" acabou de ser desbloqueado. 🎉</div>`
      : `<div class="essay-prompt" style="margin-top:10px"><b>🏆 Uau! Você completou TODOS os níveis do Laboratório de Código em ${LANG_LABEL[state.lang]}!</b><br>Isso é nível Super Mega Programador de verdade.</div>`;
    feedback(`${bodyHtml}${badge}<button id="codingAutoNext" class="primary" style="margin-top:8px">🗺️ Ver minha jornada</button>`, 'ok');
    $id('codingAutoNext').onclick = goHome;
  }

  function feedback(html, kind) {
    const el = $id('codingFeedback');
    el.classList.remove('hidden');
    el.className = kind === 'ok' ? 'issue strength' : kind === 'bad' ? 'issue' : 'issue priority';
    el.innerHTML = html;
  }

  function normalize(s) {
    return String(s ?? '').replace(/\r\n/g, '\n').trim().replace(/[ \t]+$/gm, '').replace(/[ \t]+/g, ' ');
  }

  async function checkCurrent() {
    const ex = currentExercise();
    if (!ex) return;
    if (ex.type === 'predict') {
      const guess = $id('codingPredictInput').value;
      const ok = normalize(guess) === normalize(ex.expectedOutput);
      if (ok) { markDone(ex.id); afterSolved('✅ Isso mesmo! Você leu o código corretamente.<br>'); }
      else feedback(`❌ Ainda não. A saída esperada não bate com a sua resposta. Tente reler o código com calma - ou toque em "💡 Dica".`, 'bad');
      return;
    }
    // type === 'write'
    if (state.lang === 'python') return checkPython(ex);
    return checkCSharp(ex);
  }

  // ---------- Verificação C# (estrutural, sem executar) ----------
  function checkCSharp(ex) {
    const code = $id('codingEditor').value;
    const missing = (ex.checks || []).filter((re) => !re.test(code));
    if (missing.length) {
      feedback(`❌ Seu código ainda não parece ter tudo que o exercício pede. Confira se você usou os elementos certos de C# (olhe a dica se precisar).`, 'bad');
      return;
    }
    markDone(ex.id);
    afterSolved(`✅ Estrutura correta! Como este app não executa C# de verdade, não conferimos o valor exato - mas com esse código, a saída esperada é:<br><span class="corrected" style="display:block;margin-top:6px;padding:8px">${esc(ex.expectedOutput)}</span>`);
  }

  // ---------- Execução Python real via Pyodide ----------
  let pyodidePromise = null;
  function ensurePyodide() {
    if (pyodidePromise) return pyodidePromise;
    pyodidePromise = (async () => {
      if (!window.loadPyodide) {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
          s.onload = resolve; s.onerror = () => reject(new Error('Não foi possível carregar o Python (verifique sua internet).'));
          document.head.appendChild(s);
        });
      }
      return await window.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/' });
    })();
    return pyodidePromise;
  }

  // O erro que o Pyodide devolve é o traceback INTEIRO, incluindo os
  // frames internos dele mesmo (_pyodide/_base.py etc.) - confuso pra quem
  // está aprendendo. Fica só a partir do último "File "<exec>"", que é
  // onde o erro de verdade aconteceu no código do aluno.
  function friendlyPyError(message) {
    const text = String(message || '').trim();
    const lines = text.split('\n');
    let lastExecIdx = -1;
    for (let i = 0; i < lines.length; i++) if (lines[i].includes('File "<exec>"')) lastExecIdx = i;
    let snippet = lastExecIdx >= 0 ? lines.slice(lastExecIdx).join('\n').trim() : text;
    snippet = snippet.replace(/File "<exec>", line (\d+)(?:, in .*)?/, 'Linha $1:');
    return snippet || 'Erro ao rodar o código.';
  }

  // Dica curta em português pros erros mais comuns de quem está começando -
  // além de mostrar o erro "cru", explica o que geralmente causa ele.
  function pyErrorTipPt(msg) {
    const tips = [
      [/IndentationError/, '🐍 <b>Erro de indentação:</b> em Python, o que fica "dentro" de uma função, if ou for precisa estar recuado (geralmente 4 espaços) em relação à linha de cima. Confira se todas as linhas do corpo estão alinhadas.'],
      [/SyntaxError/, '🐍 <b>Erro de sintaxe:</b> alguma coisa está escrita de um jeito que o Python não entende - confira parênteses, dois-pontos (:) no fim de if/for/def, e se não falta ou sobra algum caractere.'],
      [/NameError/, '🐍 <b>Nome não encontrado:</b> você usou uma variável ou função que ainda não existe (ou escreveu o nome errado/diferente de como criou).'],
      [/TypeError/, '🐍 <b>Tipo incompatível:</b> você tentou usar dois tipos diferentes juntos de um jeito que não funciona (ex.: somar texto com número).'],
      [/ZeroDivisionError/, '🐍 Você tentou dividir por zero - em matemática isso não tem resultado.'],
      [/IndexError/, '🐍 Você tentou acessar uma posição da lista que não existe (lembre: a contagem começa em 0).'],
      [/KeyError/, '🐍 Você tentou acessar uma chave do dicionário que não existe.'],
    ];
    const hit = tips.find(([re]) => re.test(msg));
    return hit ? `<div style="margin-top:8px">${hit[1]}</div>` : '';
  }

  async function checkPython(ex) {
    const code = $id('codingEditor').value;
    // Alerta leve pra loop claramente infinito, antes de tentar rodar -
    // não impede de rodar (o aluno pode ter um "break" que não detectamos),
    // só avisa.
    if (/while\s+True\s*:/.test(code) && !/\bbreak\b/.test(code)) {
      feedback('⚠️ Seu código tem um "while True" sem "break" - isso pode travar. Revise antes de rodar.', 'bad');
      return;
    }
    $id('codingCheckBtn').disabled = true;
    $id('codingCheckBtn').textContent = '⏳ Carregando Python…';
    feedback('⏳ Rodando seu código…', 'hint');
    try {
      const pyodide = await ensurePyodide();
      $id('codingCheckBtn').textContent = '⏳ Rodando…';
      let output = '';
      pyodide.setStdout({ batched: (s) => { output += s + '\n'; } });
      pyodide.setStderr({ batched: (s) => { output += s + '\n'; } });
      const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('TIMEOUT')), 8000));
      await Promise.race([pyodide.runPythonAsync(code), timeout]);
      const got = normalize(output);
      const expected = normalize(ex.expectedOutput);
      if (got === expected) {
        markDone(ex.id);
        afterSolved(`✅ Rodou certinho e a saída bateu com o esperado!<br><span class="corrected" style="display:block;margin-top:6px;padding:8px">${esc(output.trim())}</span>`);
      } else {
        feedback(`❌ O código rodou, mas a saída não bateu.<br><b>Sua saída:</b><span class="corrected" style="display:block;margin:4px 0 8px;padding:8px">${esc(output.trim() || '(nada impresso)')}</span><b>Esperado:</b><span class="corrected" style="display:block;margin-top:4px;padding:8px">${esc(ex.expectedOutput)}</span>`, 'bad');
      }
    } catch (e) {
      const msg = e && e.message === 'TIMEOUT' ? 'Seu código demorou demais pra rodar (tem algum loop sem fim?).' : friendlyPyError(e && e.message);
      feedback(`❌ Seu código tem um erro:<br><span class="corrected" style="display:block;margin-top:6px;padding:8px;white-space:pre-wrap">${esc(msg)}</span>${pyErrorTipPt(msg)}`, 'bad');
    } finally {
      $id('codingCheckBtn').disabled = false;
      $id('codingCheckBtn').textContent = '▶️ Rodar e verificar';
    }
  }

  document.addEventListener('DOMContentLoaded', inject);
  if (document.readyState !== 'loading') inject();
})();
