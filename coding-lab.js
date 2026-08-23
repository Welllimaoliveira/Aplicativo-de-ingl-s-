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
      ],
    },
    csharp: {
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
      ],
    },
  };

  const LANG_LABEL = { python: '🐍 Python', csharp: '🔷 C#' };
  const TIER_LABEL = { basic: 'Básico', medium: 'Médio' };

  // ---------- Estado e progresso ----------
  let state = { lang: 'python', tier: 'basic', topicIndex: 0, exIndex: 0 };

  function ensureCodingData() {
    let x = p();
    if (!x.coding) x.coding = { done: {} };
    if (!x.coding.done) x.coding.done = {};
  }
  function exId(topicI, exI) { return flatExercises()[topicI] ? flatExercises()[topicI][exI]?.id : null; }
  function topics() { return CURRICULUM[state.lang][state.tier]; }
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
    <div class="essay-tabs"><button id="codingTierBasic" class="essay-tab">Básico</button><button id="codingTierMedium" class="essay-tab">Médio</button></div>
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
      <input id="codingPredictInput" class="field" placeholder="O que este código imprime?" style="margin-top:10px" autocapitalize="off" autocomplete="off">
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
    $id('codingLangPy').onclick = () => { state.lang = 'python'; state.tier = 'basic'; state.topicIndex = 0; renderHome(); };
    $id('codingLangCs').onclick = () => { state.lang = 'csharp'; state.tier = 'basic'; state.topicIndex = 0; renderHome(); };
    $id('codingTierBasic').onclick = () => { state.tier = 'basic'; state.topicIndex = 0; renderHome(); };
    $id('codingTierMedium').onclick = () => { state.tier = 'medium'; state.topicIndex = 0; renderHome(); };
    $id('codingCheckBtn').onclick = checkCurrent;
    $id('codingHintBtn').onclick = showHint;
    $id('codingPrevEx').onclick = () => moveExercise(-1);
    $id('codingNextEx').onclick = () => moveExercise(1);
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
    $id('codingTierBasic').classList.toggle('active', state.tier === 'basic');
    $id('codingTierMedium').classList.toggle('active', state.tier === 'medium');
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
    $id('codingExTopic').textContent = `${LANG_LABEL[state.lang]} · ${currentTopic().topic}`;
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
      if (ok) { markDone(ex.id); feedback('✅ Isso mesmo! Você leu o código corretamente. <br><button id="codingAutoNext" class="primary" style="margin-top:8px">Próximo exercício ⏭</button>', 'ok'); $id('codingAutoNext').onclick = () => moveExercise(1); }
      else feedback(`❌ Ainda não. A saída esperada não bate com a sua resposta. Tente reler o código com calma - ou toque em "💡 Dica".`, 'bad');
      renderHome_ifTopicListVisible();
      return;
    }
    // type === 'write'
    if (state.lang === 'python') return checkPython(ex);
    return checkCSharp(ex);
  }

  function renderHome_ifTopicListVisible() { /* nada a fazer: a lista só é redesenhada ao voltar pra ela */ }

  // ---------- Verificação C# (estrutural, sem executar) ----------
  function checkCSharp(ex) {
    const code = $id('codingEditor').value;
    const missing = (ex.checks || []).filter((re) => !re.test(code));
    if (missing.length) {
      feedback(`❌ Seu código ainda não parece ter tudo que o exercício pede. Confira se você usou os elementos certos de C# (olhe a dica se precisar).`, 'bad');
      return;
    }
    markDone(ex.id);
    feedback(`✅ Estrutura correta! Como este app não executa C# de verdade, não conferimos o valor exato - mas com esse código, a saída esperada é:<br><span class="corrected" style="display:block;margin-top:6px;padding:8px">${esc(ex.expectedOutput)}</span><button id="codingAutoNext" class="primary" style="margin-top:8px">Próximo exercício ⏭</button>`, 'ok');
    $id('codingAutoNext').onclick = () => moveExercise(1);
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
        feedback(`✅ Rodou certinho e a saída bateu com o esperado!<br><span class="corrected" style="display:block;margin-top:6px;padding:8px">${esc(output.trim())}</span><button id="codingAutoNext" class="primary" style="margin-top:8px">Próximo exercício ⏭</button>`, 'ok');
        $id('codingAutoNext').onclick = () => moveExercise(1);
      } else {
        feedback(`❌ O código rodou, mas a saída não bateu.<br><b>Sua saída:</b><span class="corrected" style="display:block;margin:4px 0 8px;padding:8px">${esc(output.trim() || '(nada impresso)')}</span><b>Esperado:</b><span class="corrected" style="display:block;margin-top:4px;padding:8px">${esc(ex.expectedOutput)}</span>`, 'bad');
      }
    } catch (e) {
      const msg = e && e.message === 'TIMEOUT' ? 'Seu código demorou demais pra rodar (tem algum loop sem fim?).' : (e && e.message) || 'Erro ao rodar o código.';
      feedback(`❌ ${esc(msg)}`, 'bad');
    } finally {
      $id('codingCheckBtn').disabled = false;
      $id('codingCheckBtn').textContent = '▶️ Rodar e verificar';
    }
  }

  document.addEventListener('DOMContentLoaded', inject);
  if (document.readyState !== 'loading') inject();
})();
