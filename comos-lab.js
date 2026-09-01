/* ===== Laboratório COMOS: aprenda a programar/depurar scripts do COMOS =====

   O COMOS (Siemens) automatiza engenharia de plantas com scripts em
   VBScript rodando sobre uma árvore de objetos (Project > objetos de
   engenharia > atributos). Aqui a gente SIMULA essa árvore e um
   interpretador de VBScript (subconjunto prático) pra você:
     - explorar o modelo de objetos (painel lateral)
     - escrever scripts e ver o resultado na "janela imediata"
     - depurar passo a passo, com watch de variáveis e linha atual
     - fazer exercícios guiados

   Nada aqui fala com um COMOS real - é um ambiente de treino seguro.
   A API imita nomes reais: objProject, .Name, .Attributes.Item("..."),
   .CDevices, For Each, Debug.Print, MsgBox, etc.

   Validado contra o manual oficial Siemens "Administration Advanced
   Scripting" (A2S00000650): .Spec("Nome")/.Value/.GetXValue/.SetXValue pra
   ler/escrever atributo (NÃO existe .GetAttributeValue no COMOS de
   verdade - isso era um método inventado, mantido aqui só como alias
   morto pra não quebrar scripts antigos), .FullLabel/.Class/.IsFolder/
   .SystemType/.Owner/.OwnerByClass como propriedades reais de objeto.
*/
(() => {
  'use strict';
  const $id = (id) => document.getElementById(id);
  const escv = (s) => { const d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; };

  // =====================================================================
  // 1. MODELO COMOS SIMULADO
  // =====================================================================
  // Cada nó imita um objeto de engenharia do COMOS. A hierarquia lembra
  // uma unidade de processo com equipamentos e instrumentos.
  function attr(name, value, unit) { return { __comosAttr: true, Name: name, Value: value, Unit: unit || '' }; }

  // No COMOS de verdade, "objeto de pasta" (categoria, sem engenharia real -
  // SystemType 13, CDevice) e "objeto de engenharia" (equipamento/instrumento
  // de fato - SystemType 8, Device) são coisas DIFERENTES (.IsFolder,
  // .SystemType) - aqui simulamos essa distinção pelas classes que já
  // existem no modelo (Project/Location = pasta; o resto = engenharia).
  const FOLDER_CLASSES = ['Project', 'Location'];
  function systemTypeFor(className) {
    if (className === 'Project') return 2;
    if (FOLDER_CLASSES.includes(className)) return 13; // CDevice (base object/pasta)
    return 8; // Device (objeto de engenharia)
  }
  function node(def, parent) {
    const n = {
      __comos: true,
      Name: def.Name,
      Description: def.Description || '',
      ClassName: def.ClassName || 'Object',
      // .FullLabel e .Class são nomes reais do COMOS (ver manual "Advanced
      // Scripting"): FullLabel costuma ser o Name completo/tag do objeto;
      // Class é o código/classe de engenharia. .ClassName continua existindo
      // por compatibilidade com os exercícios já escritos.
      FullLabel: def.Name,
      Class: def.ClassName || 'Object',
      IsFolder: FOLDER_CLASSES.includes(def.ClassName),
      SystemType: systemTypeFor(def.ClassName),
      _attrs: {},
      _children: [],
      _parent: parent || null,
    };
    (def.Attributes || []).forEach((a) => { n._attrs[a.Name.toLowerCase()] = a; });
    n.SystemFullName = (parent ? parent.SystemFullName + '|' : '') + n.Name;
    (def.Children || []).forEach((c) => n._children.push(node(c, n)));
    return n;
  }

  function buildModel() {
    return node({
      Name: '=P01', Description: 'Planta piloto - Unidade de resfriamento', ClassName: 'Project',
      Attributes: [attr('ProjectPhase', 'Detalhamento'), attr('Client', 'A1 Engenharia')],
      Children: [
        {
          Name: '=A10', Description: 'Sistema de água de resfriamento', ClassName: 'Location',
          Attributes: [attr('Area', 'Externa')],
          Children: [
            {
              Name: 'P-101A', Description: 'Bomba de água de resfriamento A', ClassName: 'Pump',
              Attributes: [attr('Power', 75, 'kW'), attr('Voltage', 380, 'V'), attr('Flow', 320, 'm3/h'), attr('Status', 'Operando')],
              Children: [
                { Name: 'M-101A', Description: 'Motor da bomba P-101A', ClassName: 'Motor',
                  Attributes: [attr('Power', 75, 'kW'), attr('Voltage', 380, 'V'), attr('FrameSize', '280M')] },
              ],
            },
            {
              Name: 'P-101B', Description: 'Bomba de água de resfriamento B (reserva)', ClassName: 'Pump',
              Attributes: [attr('Power', 75, 'kW'), attr('Voltage', 380, 'V'), attr('Flow', 320, 'm3/h'), attr('Status', 'Reserva')],
              Children: [
                { Name: 'M-101B', Description: 'Motor da bomba P-101B', ClassName: 'Motor',
                  Attributes: [attr('Power', 75, 'kW'), attr('Voltage', 380, 'V'), attr('FrameSize', '280M')] },
              ],
            },
            { Name: 'TT-101', Description: 'Transmissor de temperatura da saída', ClassName: 'Instrument',
              Attributes: [attr('Signal', '4-20mA'), attr('Range', '0-100', 'degC'), attr('SetPoint', 32, 'degC')] },
            { Name: 'PT-101', Description: 'Transmissor de pressao do header', ClassName: 'Instrument',
              Attributes: [attr('Signal', '4-20mA'), attr('Range', '0-16', 'bar'), attr('SetPoint', 4.5, 'bar')] },
          ],
        },
        {
          Name: '=A20', Description: 'Torre de resfriamento', ClassName: 'Location',
          Attributes: [attr('Area', 'Externa')],
          Children: [
            { Name: 'CT-201', Description: 'Torre de resfriamento induzida', ClassName: 'Equipment',
              Attributes: [attr('Capacity', 1800, 'm3/h'), attr('Cells', 3), attr('Status', 'Operando')] },
            { Name: 'FN-201', Description: 'Ventilador da torre CT-201', ClassName: 'Fan',
              Attributes: [attr('Power', 45, 'kW'), attr('Voltage', 380, 'V'), attr('Status', 'Operando')] },
            { Name: 'LT-201', Description: 'Nivel da bacia da torre', ClassName: 'Instrument',
              Attributes: [attr('Signal', '4-20mA'), attr('Range', '0-3', 'm'), attr('SetPoint', 1.8, 'm')] },
          ],
        },
      ],
    }, null);
  }

  // =====================================================================
  // 2. INTERPRETADOR - subconjunto de VBScript
  // =====================================================================
  // Suporta: comentários (' e Rem), Dim, Set/atribuição, If/ElseIf/Else/
  // End If (bloco e linha única), For i = a To b [Step s]/Next,
  // For Each x In coll/Next, Do While/Loop, Do/Loop While, operadores
  // & + - * / Mod = <> < > <= >= And Or Not, acesso a membros e chamadas
  // (obj.Prop, obj.Metodo(args), coll.Count, coll.Item(i)),
  // MsgBox / Debug.Print / Print / WScript.Echo.
  const Interp = (() => {
    const KW = new Set(['dim','set','if','then','elseif','else','end','for','each','in','to','step','next','do','while','loop','and','or','not','mod','true','false','nothing','rem','function','sub','call']);

    // ---- Tokenizer de expressão ----
    function tokenize(src) {
      const t = []; let i = 0;
      const isId = (c) => /[A-Za-z0-9_]/.test(c);
      while (i < src.length) {
        const c = src[i];
        if (c === ' ' || c === '\t') { i++; continue; }
        if (c === '"') {
          let j = i + 1, s = '';
          while (j < src.length) {
            if (src[j] === '"' && src[j + 1] === '"') { s += '"'; j += 2; continue; }
            if (src[j] === '"') { j++; break; }
            s += src[j++];
          }
          t.push({ k: 'str', v: s }); i = j; continue;
        }
        if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] || ''))) {
          let j = i, s = '';
          while (j < src.length && /[0-9.]/.test(src[j])) s += src[j++];
          t.push({ k: 'num', v: parseFloat(s) }); i = j; continue;
        }
        if (isId(c) && !/[0-9]/.test(c)) {
          let j = i, s = '';
          while (j < src.length && isId(src[j])) s += src[j++];
          const low = s.toLowerCase();
          if (low === 'true') t.push({ k: 'num', v: true });
          else if (low === 'false') t.push({ k: 'num', v: false });
          else if (low === 'nothing') t.push({ k: 'nothing' });
          else if (['and','or','not','mod'].includes(low)) t.push({ k: 'op', v: low });
          else t.push({ k: 'id', v: s });
          i = j; continue;
        }
        const two = src.substr(i, 2);
        if (two === '<>' || two === '<=' || two === '>=') { t.push({ k: 'op', v: two }); i += 2; continue; }
        if ('+-*/&=<>().,'.includes(c)) { t.push({ k: 'op', v: c }); i++; continue; }
        throw new Error('Caractere inesperado: ' + c);
      }
      return t;
    }

    // ---- Parser de expressão (precedência) ----
    function parseExpr(tokens) {
      let pos = 0;
      const peek = () => tokens[pos];
      const next = () => tokens[pos++];
      const expect = (v) => { const tk = next(); if (!tk || tk.v !== v) throw new Error('Esperava "' + v + '"'); };

      function primary() {
        const tk = peek();
        if (!tk) throw new Error('Expressão incompleta');
        if (tk.k === 'num') { next(); return { t: 'lit', v: tk.v }; }
        if (tk.k === 'str') { next(); return { t: 'lit', v: tk.v }; }
        if (tk.k === 'nothing') { next(); return { t: 'lit', v: null }; }
        if (tk.k === 'op' && tk.v === '(') { next(); const e = expr(); expect(')'); return e; }
        if (tk.k === 'op' && (tk.v === '-' || tk.v === '+')) { next(); return { t: 'unary', op: tk.v, e: primary() }; }
        if (tk.k === 'op' && tk.v === 'not') { next(); return { t: 'unary', op: 'not', e: cmp() }; }
        if (tk.k === 'id') {
          next();
          let nodeE = { t: 'var', name: tk.v };
          if (peek() && peek().v === '(') nodeE = { t: 'call', target: nodeE, args: parseArgs() };
          return postfix(nodeE);
        }
        throw new Error('Token inesperado na expressão');
      }
      function parseArgs() {
        expect('('); const args = [];
        if (peek() && peek().v === ')') { next(); return args; }
        args.push(expr());
        while (peek() && peek().v === ',') { next(); args.push(expr()); }
        expect(')');
        return args;
      }
      function postfix(e) {
        while (peek() && peek().v === '.') {
          next();
          const nameTk = next();
          if (!nameTk || nameTk.k !== 'id') throw new Error('Esperava um nome depois do ponto');
          let m = { t: 'member', obj: e, name: nameTk.v };
          if (peek() && peek().v === '(') m = { t: 'call', target: m, args: parseArgs() };
          e = m;
        }
        return e;
      }
      function mul() { let e = primary(); while (peek() && peek().k === 'op' && ['*','/','mod'].includes(peek().v)) { const op = next().v; e = { t: 'bin', op, l: e, r: primary() }; } return e; }
      function add() { let e = mul(); while (peek() && peek().k === 'op' && ['+','-','&'].includes(peek().v)) { const op = next().v; e = { t: 'bin', op, l: e, r: mul() }; } return e; }
      function cmp() { let e = add(); while (peek() && peek().k === 'op' && ['=','<>','<','>','<=','>='].includes(peek().v)) { const op = next().v; e = { t: 'bin', op, l: e, r: add() }; } return e; }
      function andE() { let e = cmp(); while (peek() && peek().v === 'and') { next(); e = { t: 'bin', op: 'and', l: e, r: cmp() }; } return e; }
      function orE() { let e = andE(); while (peek() && peek().v === 'or') { next(); e = { t: 'bin', op: 'or', l: e, r: andE() }; } return e; }
      function expr() { return orE(); }

      const e = expr();
      if (pos < tokens.length) throw new Error('Sobrou "' + (tokens[pos].v ?? '?') + '" na expressão');
      return e;
    }

    // ---- Membros do modelo COMOS ----
    function collection(items) {
      return {
        __coll: true, _items: items,
        get Count() { return items.length; },
      };
    }
    function attrToStr(a) { return a.Value + (a.Unit ? ' ' + a.Unit : ''); }
    function getMember(obj, name, args, ctx) {
      const lname = name.toLowerCase();
      if (obj == null) throw new Error('Objeto é Nothing - não dá para acessar "' + name + '"');
      if (obj.__coll) {
        if (lname === 'count') return obj._items.length;
        if (lname === 'item') { const i = Math.trunc(num(args[0])); if (i < 0 || i >= obj._items.length) throw new Error('Índice fora da coleção: ' + i); return obj._items[i]; }
        throw new Error('Coleção não tem "' + name + '"');
      }
      if (obj.__comosAttr) {
        if (lname === 'name') return obj.Name;
        if (lname === 'value') return obj.Value;
        if (lname === 'unit') return obj.Unit;
        if (lname === 'displayvalue') return attrToStr(obj);
        // GetXValue/SetXValue/GetDisplayXValue são os nomes reais do COMOS
        // pra ler/escrever o valor de um atributo (ver manual "Advanced
        // Scripting", cap. Attributes). O COMOS de verdade tem várias
        // "colunas" de valor por índice (0=Value, 1=Min/Norm/Max...) - aqui
        // simplificamos e todo índice aponta pro mesmo Value.
        if (lname === 'getxvalue') return obj.Value;
        if (lname === 'getdisplayxvalue') return attrToStr(obj);
        if (lname === 'setxvalue') { obj.Value = args[1]; return undefined; }
        throw new Error('Atributo não tem "' + name + '"');
      }
      if (obj.__comos) {
        if (lname === 'name') return obj.Name;
        if (lname === 'fulllabel') return obj.FullLabel;
        if (lname === 'label') return obj.FullLabel;
        if (lname === 'description') return obj.Description;
        if (lname === 'classname') return obj.ClassName;
        if (lname === 'class') return obj.Class;
        if (lname === 'isfolder') return obj.IsFolder;
        if (lname === 'systemtype') return obj.SystemType;
        if (lname === 'systemfullname' || lname === 'fullname') return obj.SystemFullName;
        if (lname === 'parent' || lname === 'owner') return obj._parent;
        if (lname === 'ownerbyclass') {
          // Real: sobe a árvore procurando o primeiro dono de uma dada
          // classe/código. Aqui a "classe" é o mesmo ClassName do modelo
          // (simplificação - no COMOS real costuma ser um código de 1
          // letra, ex. "D" pra Device).
          const wanted = String(args[0]).toLowerCase();
          let cur = obj._parent;
          while (cur) { if (cur.ClassName.toLowerCase() === wanted) return cur; cur = cur._parent; }
          return null;
        }
        if (lname === 'cdevices' || lname === 'children') return collection(obj._children.slice());
        if (lname === 'attributes') return collection(Object.values(obj._attrs));
        // .Spec(nome) é como o COMOS de verdade navega até um atributo (ver
        // manual: "Set objAtt = objDev.Spec(<NestedName>)"). .Attribute()
        // continua existindo como sinônimo mais simples de digitar.
        if (lname === 'spec' || lname === 'attribute') { const a = obj._attrs[String(args[0]).toLowerCase()]; if (!a) throw new Error('Atributo não encontrado: ' + args[0]); return a; }
        // .GetAttributeValue não existe no COMOS de verdade (o jeito certo é
        // .Spec("Nome").Value) - mantido aqui só pra não quebrar scripts
        // antigos, mas não é mais ensinado nos exercícios.
        if (lname === 'getattributevalue') { const a = obj._attrs[String(args[0]).toLowerCase()]; return a ? a.Value : null; }
        if (lname === 'devicebyname' || lname === 'itembyname') {
          const nm = String(args[0]).toLowerCase();
          const found = obj._children.find((c) => c.Name.toLowerCase() === nm);
          if (!found) throw new Error('Objeto filho não encontrado: ' + args[0]);
          return found;
        }
        throw new Error('Objeto COMOS não tem "' + name + '"');
      }
      if (typeof obj === 'object' && obj && name in obj) {
        const v = obj[name];
        return typeof v === 'function' ? v(...(args || [])) : v;
      }
      throw new Error('Não sei acessar "' + name + '"');
    }

    // ---- Helpers de valor ----
    function num(v) { if (v === true) return -1; if (v === false) return 0; if (v == null) return 0; const n = typeof v === 'number' ? v : parseFloat(v); if (isNaN(n)) throw new Error('Valor não numérico: ' + str(v)); return n; }
    function str(v) {
      if (v == null) return '';
      if (v === true) return 'True'; if (v === false) return 'False';
      if (typeof v === 'number') return Number.isInteger(v) ? String(v) : String(v);
      if (v.__comos) return '[' + v.ClassName + ' ' + v.Name + ']';
      if (v.__comosAttr) return attrToStr(v);
      if (v.__coll) return '[Collection(' + v._items.length + ')]';
      return String(v);
    }
    function truthy(v) { if (v === true) return true; if (v === false || v == null) return false; if (typeof v === 'number') return v !== 0; if (typeof v === 'string') return v.toLowerCase() === 'true'; return !!v; }

    // ---- Funções internas (globais) ----
    function builtinCall(nameLow, args) {
      switch (nameLow) {
        case 'ucase': return str(args[0]).toUpperCase();
        case 'lcase': return str(args[0]).toLowerCase();
        case 'len': return str(args[0]).length;
        case 'trim': return str(args[0]).trim();
        case 'cstr': return str(args[0]);
        case 'cint': case 'clng': return Math.trunc(num(args[0]));
        case 'cdbl': return num(args[0]);
        case 'left': return str(args[0]).slice(0, Math.trunc(num(args[1])));
        case 'right': return str(args[0]).slice(-Math.trunc(num(args[1])) || str(args[0]).length);
        case 'mid': { const s = str(args[0]); const start = Math.trunc(num(args[1])) - 1; const l = args[2] != null ? Math.trunc(num(args[2])) : undefined; return l == null ? s.slice(start) : s.slice(start, start + l); }
        case 'instr': return str(args[0]).indexOf(str(args[1])) + 1;
        case 'replace': return str(args[0]).split(str(args[1])).join(str(args[2]));
        case 'isnull': case 'isempty': return args[0] == null;
        case 'isnothing': return args[0] == null;
        case 'abs': return Math.abs(num(args[0]));
        case 'int': case 'fix': return Math.trunc(num(args[0]));
        case 'round': return args[1] != null ? Number(num(args[0]).toFixed(Math.trunc(num(args[1])))) : Math.round(num(args[0]));
        default: return undefined;
      }
    }

    // ---- Avaliador ----
    function evalNode(n, env, ctx) {
      switch (n.t) {
        case 'lit': return n.v;
        case 'var': {
          const k = n.name.toLowerCase();
          if (env.has(k)) return env.get(k);
          if (k === 'nothing') return null;
          throw new Error('Variável não definida: ' + n.name);
        }
        case 'unary': {
          if (n.op === 'not') return !truthy(evalNode(n.e, env, ctx));
          const v = num(evalNode(n.e, env, ctx));
          return n.op === '-' ? -v : v;
        }
        case 'member': {
          const o = evalNode(n.obj, env, ctx);
          return getMember(o, n.name, [], ctx);
        }
        case 'call': {
          const tgt = n.target;
          const args = n.args.map((a) => evalNode(a, env, ctx));
          if (tgt.t === 'var') {
            const low = tgt.name.toLowerCase();
            const b = builtinCall(low, args);
            if (b !== undefined || ['isnull','isempty','isnothing'].includes(low)) return b;
            if (env.has(low)) return getMember(env.get(low), 'Item', args, ctx); // coleção(i)
            throw new Error('Função desconhecida: ' + tgt.name);
          }
          const o = evalNode(tgt.obj, env, ctx);
          return getMember(o, tgt.name, args, ctx);
        }
        case 'bin': {
          const op = n.op;
          if (op === 'and') return truthy(evalNode(n.l, env, ctx)) && truthy(evalNode(n.r, env, ctx));
          if (op === 'or') return truthy(evalNode(n.l, env, ctx)) || truthy(evalNode(n.r, env, ctx));
          const l = evalNode(n.l, env, ctx), r = evalNode(n.r, env, ctx);
          if (op === '&') return str(l) + str(r);
          if (op === '=') return looseEq(l, r);
          if (op === '<>') return !looseEq(l, r);
          if (op === '+') { if (typeof l === 'string' || typeof r === 'string') return str(l) + str(r); return num(l) + num(r); }
          if (op === '-') return num(l) - num(r);
          if (op === '*') return num(l) * num(r);
          if (op === '/') { const d = num(r); if (d === 0) throw new Error('Divisão por zero'); return num(l) / d; }
          if (op === 'mod') return Math.trunc(num(l)) % Math.trunc(num(r));
          if (op === '<') return cmpVal(l, r) < 0;
          if (op === '>') return cmpVal(l, r) > 0;
          if (op === '<=') return cmpVal(l, r) <= 0;
          if (op === '>=') return cmpVal(l, r) >= 0;
          throw new Error('Operador não suportado: ' + op);
        }
      }
      throw new Error('Nó de expressão inválido');
    }
    function looseEq(l, r) {
      if (l == null || r == null) return l == null && r == null;
      if (typeof l === 'number' || typeof r === 'number') { try { return num(l) === num(r); } catch (e) { return str(l) === str(r); } }
      if (typeof l === 'boolean' || typeof r === 'boolean') return truthy(l) === truthy(r);
      return str(l).toLowerCase() === str(r).toLowerCase();
    }
    function cmpVal(l, r) {
      if (typeof l === 'number' && typeof r === 'number') return l - r;
      const a = str(l), b = str(r);
      if (!isNaN(parseFloat(a)) && !isNaN(parseFloat(b)) && a.trim() !== '' && b.trim() !== '') return parseFloat(a) - parseFloat(b);
      return a < b ? -1 : a > b ? 1 : 0;
    }

    // ---- Quebra em statements/blocos ----
    function preprocess(source) {
      const rawLines = source.replace(/\r/g, '').split('\n');
      const lines = [];
      rawLines.forEach((raw, idx) => {
        let line = raw;
        // remove comentário (' fora de string)
        let inStr = false, cut = -1;
        for (let k = 0; k < line.length; k++) {
          const ch = line[k];
          if (ch === '"') inStr = !inStr;
          else if (ch === "'" && !inStr) { cut = k; break; }
        }
        if (cut >= 0) line = line.slice(0, cut);
        const trimmed = line.trim();
        if (!trimmed) return;
        if (/^rem(\s|$)/i.test(trimmed)) return;
        lines.push({ text: trimmed, ln: idx + 1 });
      });
      return lines;
    }

    // Executa uma lista de statements. Retorna via ctx (output/env).
    // stepCb(ln, env) é chamado antes de cada statement quando presente.
    function execBlock(stmts, env, ctx) {
      for (let i = 0; i < stmts.length; i++) {
        const s = stmts[i];
        i = execStmt(stmts, i, env, ctx);
      }
    }

    function findMatch(stmts, start, openRe, closeRe, midRes) {
      let depth = 1;
      for (let j = start + 1; j < stmts.length; j++) {
        const tx = stmts[j].text;
        if (openRe.test(tx)) depth++;
        else if (closeRe.test(tx)) { depth--; if (depth === 0) return j; }
      }
      throw new Error('Bloco não fechado (linha ' + stmts[start].ln + ')');
    }

    function execStmt(stmts, i, env, ctx) {
      const s = stmts[i];
      const text = s.text;
      if (ctx.step) ctx.step(s.ln, env);
      ctx.count++;
      if (ctx.count > 20000) throw new Error('Execução longa demais (loop infinito?)');

      // Dim
      let m;
      if ((m = /^dim\s+(.+)$/i.exec(text))) {
        m[1].split(',').forEach((nm) => { const k = nm.trim().replace(/\(.*\)/, '').toLowerCase(); if (k) env.set(k, null); });
        return i;
      }
      // Set x = ...  /  x = ...
      if ((m = /^(?:set\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/i.exec(text)) && !/^(if|elseif|for|do|while)\b/i.test(text)) {
        const val = evalNode(parseExpr(tokenize(m[2])), env, ctx);
        env.set(m[1].toLowerCase(), val);
        return i;
      }
      // MsgBox / Debug.Print / Print / WScript.Echo
      if ((m = /^(msgbox|print|debug\.print|wscript\.echo)\s+(.+)$/i.exec(text))) {
        ctx.output.push(str(evalNode(parseExpr(tokenize(m[2])), env, ctx)));
        return i;
      }
      if (/^(msgbox|debug\.print|wscript\.echo|print)\s*$/i.test(text)) { ctx.output.push(''); return i; }
      // Call foo(...)  -> apenas avalia
      if ((m = /^call\s+(.+)$/i.exec(text))) { evalNode(parseExpr(tokenize(m[1])), env, ctx); return i; }

      // If ... Then (linha única)  vs  If ... Then (bloco)
      if ((m = /^if\s+(.+?)\s+then\s+(.+)$/i.exec(text))) {
        if (truthy(evalNode(parseExpr(tokenize(m[1])), env, ctx))) {
          execStmt([{ text: m[2], ln: s.ln }], 0, env, ctx);
        }
        return i;
      }
      if ((m = /^if\s+(.+?)\s+then$/i.exec(text))) {
        const endIdx = findMatch(stmts, i, /^if\s+.+\s+then$/i, /^end\s+if$/i);
        // coletar ramos
        const branches = []; let curCond = m[1], curStart = i + 1;
        let depth = 0;
        for (let j = i + 1; j < endIdx; j++) {
          const tx = stmts[j].text;
          if (/^if\s+.+\s+then$/i.test(tx)) depth++;
          else if (/^end\s+if$/i.test(tx)) depth--;
          else if (depth === 0 && /^elseif\s+(.+?)\s+then$/i.test(tx)) {
            branches.push({ cond: curCond, body: stmts.slice(curStart, j) });
            curCond = /^elseif\s+(.+?)\s+then$/i.exec(tx)[1]; curStart = j + 1;
          } else if (depth === 0 && /^else$/i.test(tx)) {
            branches.push({ cond: curCond, body: stmts.slice(curStart, j) });
            curCond = null; curStart = j + 1;
          }
        }
        branches.push({ cond: curCond, body: stmts.slice(curStart, endIdx) });
        for (const b of branches) {
          if (b.cond == null || truthy(evalNode(parseExpr(tokenize(b.cond)), env, ctx))) { execBlock(b.body, env, ctx); break; }
        }
        return endIdx;
      }

      // For Each x In coll ... Next
      if ((m = /^for\s+each\s+([A-Za-z_]\w*)\s+in\s+(.+)$/i.exec(text))) {
        const endIdx = findMatch(stmts, i, /^for\s+/i, /^next\b/i);
        const coll = evalNode(parseExpr(tokenize(m[2])), env, ctx);
        const items = coll && coll.__coll ? coll._items : (Array.isArray(coll) ? coll : null);
        if (!items) throw new Error('For Each precisa de uma coleção (ex.: objProject.CDevices)');
        const body = stmts.slice(i + 1, endIdx);
        for (const it of items) { env.set(m[1].toLowerCase(), it); execBlock(body, env, ctx); }
        return endIdx;
      }
      // For i = a To b [Step s] ... Next
      if ((m = /^for\s+([A-Za-z_]\w*)\s*=\s*(.+?)\s+to\s+(.+?)(?:\s+step\s+(.+))?$/i.exec(text))) {
        const endIdx = findMatch(stmts, i, /^for\s+/i, /^next\b/i);
        const from = num(evalNode(parseExpr(tokenize(m[2])), env, ctx));
        const to = num(evalNode(parseExpr(tokenize(m[3])), env, ctx));
        const stp = m[4] ? num(evalNode(parseExpr(tokenize(m[4])), env, ctx)) : 1;
        const body = stmts.slice(i + 1, endIdx);
        if (stp === 0) throw new Error('Step 0 gera loop infinito');
        for (let v = from; stp > 0 ? v <= to : v >= to; v += stp) { env.set(m[1].toLowerCase(), v); execBlock(body, env, ctx); }
        return endIdx;
      }
      // Do While cond ... Loop   /   Do ... Loop While cond
      if (/^do\s+while\s+(.+)$/i.test(text) || /^do$/i.test(text)) {
        const endIdx = findMatch(stmts, i, /^do\b/i, /^loop\b/i);
        const headCond = /^do\s+while\s+(.+)$/i.exec(text);
        const tailCond = /^loop\s+while\s+(.+)$/i.exec(stmts[endIdx].text);
        const body = stmts.slice(i + 1, endIdx);
        let guard = 0;
        if (headCond) {
          while (truthy(evalNode(parseExpr(tokenize(headCond[1])), env, ctx))) { execBlock(body, env, ctx); if (++guard > 5000) throw new Error('Loop longo demais'); }
        } else {
          do { execBlock(body, env, ctx); if (++guard > 5000) throw new Error('Loop longo demais'); }
          while (tailCond && truthy(evalNode(parseExpr(tokenize(tailCond[1])), env, ctx)));
        }
        return endIdx;
      }
      if (/^(next|loop|end\s+if|wend)\b/i.test(text)) return i; // fechamentos soltos: ignora

      // fallback: tenta avaliar como expressão (ex.: chamada de método)
      try { evalNode(parseExpr(tokenize(text)), env, ctx); return i; }
      catch (e) { throw new Error('Não entendi a linha: "' + text + '"  (' + e.message + ')'); }
    }

    function run(source, opts) {
      opts = opts || {};
      const env = new Map();
      const model = buildModel();
      env.set('objproject', model);
      env.set('workset', { CurrentProject: model });
      env.set('objselected', model._children[0]._children[0]); // P-101A, um device pré-selecionado
      const ctx = { output: [], count: 0, step: opts.step || null };
      let error = null;
      try {
        const stmts = preprocess(source);
        execBlock(stmts, env, ctx);
      } catch (e) {
        error = e.message || String(e);
      }
      const vars = {};
      env.forEach((v, k) => { if (!['workset'].includes(k)) vars[k] = str(v); });
      return { output: ctx.output.join('\n'), vars, error, model };
    }

    return { run, buildModel, _str: str };
  })();

  // =====================================================================
  // 3. CURRÍCULO GUIADO
  // =====================================================================
  const LESSONS = {
    explorar: {
      label: '🔎 Explorando o modelo',
      items: [
        { id: 'comos-x1', title: 'O nome do projeto',
          promptPt: 'A variável `objProject` já aponta para o projeto aberto. Imprima o nome dele com `Debug.Print`.',
          starter: "' objProject = projeto atual. Complete a linha abaixo:\nDebug.Print objProject.",
          solution: 'Debug.Print objProject.Name',
          expected: '=P01',
          hint: 'Debug.Print objProject.Name  — todo objeto COMOS tem .Name.' },
        { id: 'comos-x2', title: 'Descrição e classe',
          promptPt: 'Imprima a descrição do projeto (`.Description`) e, na linha seguinte, a classe dele (`.ClassName`).',
          starter: "Debug.Print objProject.Description\n' agora imprima objProject.ClassName na linha de baixo\n",
          solution: 'Debug.Print objProject.Description\nDebug.Print objProject.ClassName',
          expected: 'Planta piloto - Unidade de resfriamento\nProject',
          hint: 'São dois Debug.Print: um com .Description e outro com .ClassName.' },
        { id: 'comos-x3', title: 'Quantos filhos diretos?',
          promptPt: 'A coleção `objProject.CDevices` traz os objetos filhos. Imprima quantos são usando `.Count`.',
          starter: "' complete: quantos objetos há em objProject.CDevices ?\nDebug.Print ",
          solution: 'Debug.Print objProject.CDevices.Count',
          expected: '2',
          hint: 'Debug.Print objProject.CDevices.Count — o projeto tem duas áreas (=A10 e =A20).' },
        { id: 'comos-x4', title: 'Listando as áreas',
          promptPt: 'Use `For Each` para percorrer `objProject.CDevices` e imprimir o `.Name` de cada área.',
          starter: 'Dim area\nFor Each area In objProject.CDevices\n    \' imprima area.Name aqui\nNext',
          solution: 'Dim area\nFor Each area In objProject.CDevices\n    Debug.Print area.Name\nNext',
          expected: '=A10\n=A20',
          hint: 'Dentro do For Each: Debug.Print area.Name.' },
        { id: 'comos-x5', title: 'Um atributo de um instrumento',
          promptPt: 'Pegue a área =A10 com `objProject.CDevices.Item(0)`, depois o instrumento TT-101 por nome com `.DeviceByName("TT-101")`, e imprima o valor do atributo "SetPoint". No COMOS de verdade, o jeito certo de acessar um atributo é `.Spec("Nome")` (que devolve o atributo) seguido de `.Value` (que devolve o valor) - é assim mesmo que o manual oficial do COMOS ensina.',
          starter: 'Dim a10, tt\nSet a10 = objProject.CDevices.Item(0)\nSet tt = a10.DeviceByName("TT-101")\n\' imprima tt.Spec("SetPoint").Value aqui\n',
          solution: 'Dim a10, tt\nSet a10 = objProject.CDevices.Item(0)\nSet tt = a10.DeviceByName("TT-101")\nDebug.Print tt.Spec("SetPoint").Value',
          expected: '32',
          hint: 'Debug.Print tt.Spec("SetPoint").Value  — .Spec() acha o atributo, .Value pega o número.' },
        { id: 'comos-x6', title: 'FullLabel, Class e IsFolder',
          promptPt: 'No COMOS de verdade, todo objeto tem `.FullLabel` (tag completa), `.Class` (classe de engenharia) e `.IsFolder` (True se for uma pasta/categoria, não um equipamento real). Pegue a área =A10 e imprima essas três informações, uma por linha.',
          starter: 'Dim a10\nSet a10 = objProject.CDevices.Item(0)\n\' imprima a10.FullLabel, a10.Class e a10.IsFolder (uma linha cada)\n',
          solution: 'Dim a10\nSet a10 = objProject.CDevices.Item(0)\nDebug.Print a10.FullLabel\nDebug.Print a10.Class\nDebug.Print a10.IsFolder',
          expected: '=A10\nLocation\nTrue',
          hint: 'Três Debug.Print seguidos: a10.FullLabel, a10.Class, a10.IsFolder.' },
      ],
    },
    automatizar: {
      label: '⚙️ Automatizando tarefas',
      items: [
        { id: 'comos-a1', title: 'Contar bombas',
          promptPt: 'Percorra os filhos da área =A10 e conte quantos objetos têm `.ClassName` igual a "Pump". Imprima só o número no final.',
          starter: 'Dim a10, d, total\nSet a10 = objProject.CDevices.Item(0)\ntotal = 0\nFor Each d In a10.CDevices\n    \' some 1 em total quando d.ClassName = "Pump"\nNext\nDebug.Print total',
          solution: 'Dim a10, d, total\nSet a10 = objProject.CDevices.Item(0)\ntotal = 0\nFor Each d In a10.CDevices\n    If d.ClassName = "Pump" Then total = total + 1\nNext\nDebug.Print total',
          expected: '2',
          hint: 'If d.ClassName = "Pump" Then total = total + 1  (If de linha única).' },
        { id: 'comos-a2', title: 'Relatório de motores',
          promptPt: 'Para cada bomba da área =A10, imprima uma linha no formato `NomeDaBomba: Potencia kW`. O motor é o primeiro filho da bomba (`d.CDevices.Item(0)`), e a potência é `.Spec("Power").Value` do motor.',
          starter: 'Dim a10, d, mot\nSet a10 = objProject.CDevices.Item(0)\nFor Each d In a10.CDevices\n    If d.ClassName = "Pump" Then\n        Set mot = d.CDevices.Item(0)\n        \' Debug.Print no formato  d.Name & ": " & ... & " kW"\n    End If\nNext',
          solution: 'Dim a10, d, mot\nSet a10 = objProject.CDevices.Item(0)\nFor Each d In a10.CDevices\n    If d.ClassName = "Pump" Then\n        Set mot = d.CDevices.Item(0)\n        Debug.Print d.Name & ": " & mot.Spec("Power").Value & " kW"\n    End If\nNext',
          expected: 'P-101A: 75 kW\nP-101B: 75 kW',
          hint: 'O & junta texto: d.Name & ": " & mot.Spec("Power").Value & " kW".' },
        { id: 'comos-a3', title: 'Achar quem está em reserva',
          promptPt: 'Percorra os filhos da área =A10 e imprima o `.Name` das bombas (`.ClassName = "Pump"`) que têm o atributo "Status" igual a "Reserva" (`.Spec("Status").Value`). Cheque a classe ANTES de acessar `.Spec("Status")` - os instrumentos da mesma área não têm esse atributo, e no COMOS de verdade `.Spec()` dá erro quando o atributo não existe (por isso sempre se confere a classe/existência antes de acessar).',
          starter: 'Dim a10, d\nSet a10 = objProject.CDevices.Item(0)\nFor Each d In a10.CDevices\n    \' If d.ClassName = "Pump" And d.Spec("Status").Value = "Reserva" Then ...\nNext',
          solution: 'Dim a10, d\nSet a10 = objProject.CDevices.Item(0)\nFor Each d In a10.CDevices\n    If d.ClassName = "Pump" Then\n        If d.Spec("Status").Value = "Reserva" Then Debug.Print d.Name\n    End If\nNext',
          expected: 'P-101B',
          hint: 'Primeiro If d.ClassName = "Pump" Then, e só dentro dele checa If d.Spec("Status").Value = "Reserva".' },
        { id: 'comos-a4', title: 'Somar potência instalada',
          promptPt: 'Percorra TODAS as áreas e TODOS os filhos de cada área. Some o atributo "Power" de todo objeto que tiver esse atributo (sem o atributo, `.Attribute("Power")` estoura erro - teste antes com `.Attributes.Count`, ou simplesmente cheque se o `.ClassName` é "Pump" ou "Fan"). Imprima o total.',
          starter: 'Dim area, d, total\ntotal = 0\nFor Each area In objProject.CDevices\n    For Each d In area.CDevices\n        \' some d.Spec("Power").Value em total quando d for Pump ou Fan\n    Next\nNext\nDebug.Print total',
          solution: 'Dim area, d, total\ntotal = 0\nFor Each area In objProject.CDevices\n    For Each d In area.CDevices\n        If d.ClassName = "Pump" Or d.ClassName = "Fan" Then total = total + d.Spec("Power").Value\n    Next\nNext\nDebug.Print total',
          expected: '195',
          hint: 'Dois For Each aninhados. 75 (P-101A) + 75 (P-101B) + 45 (FN-201) = 195. Os motores são filhos das bombas, não das áreas.' },
        { id: 'comos-a5', title: 'Caminho completo de um objeto',
          promptPt: 'Pegue a área =A20 (`Item(1)`), depois o objeto CT-201, e imprima o `.SystemFullName` dele (o "endereço" completo na árvore).',
          starter: 'Dim a20, ct\nSet a20 = objProject.CDevices.Item(1)\n\' pegue CT-201 e imprima o SystemFullName\n',
          solution: 'Dim a20, ct\nSet a20 = objProject.CDevices.Item(1)\nSet ct = a20.DeviceByName("CT-201")\nDebug.Print ct.SystemFullName',
          expected: '=P01|=A20|CT-201',
          hint: 'Set ct = a20.DeviceByName("CT-201") e depois Debug.Print ct.SystemFullName.' },
      ],
    },
  };

  // =====================================================================
  // 4. INTERFACE
  // =====================================================================
  const state = { mode: 'console', tier: 'explorar', exIndex: 0, dbg: null };

  function pdata() {
    const x = p();
    if (!x.comos) x.comos = { done: {}, lastScript: '' };
    if (!x.comos.done) x.comos.done = {};
    return x.comos;
  }

  const SAMPLE = [
    "' Bem-vindo ao Laboratório COMOS!",
    "' objProject aponta pro projeto. Rode (ou use Passo a passo).",
    'Dim area, d',
    'Debug.Print "Projeto: " & objProject.Name & " (" & objProject.Description & ")"',
    'For Each area In objProject.CDevices',
    '    Debug.Print "- Area " & area.Name & " tem " & area.CDevices.Count & " objetos"',
    '    For Each d In area.CDevices',
    '        Debug.Print "    " & d.Name & " [" & d.ClassName & "]"',
    '    Next',
    'Next',
  ].join('\n');

  function inject() {
    if ($id('comosScreen')) return;
    document.querySelector('.app').insertAdjacentHTML('beforeend', `
<section id="comosScreen" class="hidden">
  <div class="top"><button id="comosBack" class="icon">←</button><div class="brand">Laboratório <em>COMOS</em></div><div class="grow"></div></div>
  <div class="essay-tabs"><button id="comosTabConsole" class="essay-tab active">🖥️ Console / Debugger</button><button id="comosTabTrilha" class="essay-tab">🎓 Trilha guiada</button></div>

  <div id="comosConsole">
    <div class="card">
      <b>Árvore de objetos (modelo simulado)</b>
      <div id="comosTree" class="comos-tree"></div>
    </div>
    <div class="card">
      <b>Script VBScript</b>
      <textarea id="comosEditor" class="field" spellcheck="false" autocapitalize="off" autocomplete="off" style="font-family:ui-monospace,Menlo,Consolas,monospace;white-space:pre;min-height:200px;resize:vertical;font-size:13px;line-height:1.5"></textarea>
      <div class="row" style="margin-top:8px;flex-wrap:wrap">
        <button id="comosRun" class="primary grow">▶️ Executar</button>
        <button id="comosStep" class="secondary">⏯️ Passo a passo</button>
        <button id="comosStepNext" class="secondary" disabled>Próximo passo ⏭</button>
        <button id="comosStop" class="secondary" disabled>⏹️ Parar</button>
        <button id="comosReset" class="secondary">↩️ Exemplo</button>
      </div>
    </div>
    <div class="card">
      <b>Watch — variáveis</b>
      <div id="comosWatch" class="comos-watch mut">Rode ou dê um passo pra ver as variáveis.</div>
    </div>
    <div class="card">
      <b>Janela imediata (saída)</b>
      <pre id="comosOut" class="corrected" style="min-height:70px;font-size:13px;font-family:ui-monospace,Menlo,Consolas,monospace;white-space:pre-wrap"></pre>
    </div>
  </div>

  <div id="comosTrilha" class="hidden">
    <div class="essay-tabs" id="comosTierTabs" style="grid-template-columns:1fr 1fr"></div>
    <div id="comosLessonList" class="story-library"></div>
    <div id="comosExercise" class="hidden">
      <div class="card">
        <span id="comosExTopic" class="pill"></span>
        <h2 id="comosExTitle" style="margin:8px 0 4px"></h2>
        <p id="comosExPrompt" class="mut"></p>
      </div>
      <div class="card">
        <textarea id="comosExEditor" class="field" spellcheck="false" autocapitalize="off" autocomplete="off" style="font-family:ui-monospace,Menlo,Consolas,monospace;white-space:pre;min-height:170px;resize:vertical;font-size:13px;line-height:1.5"></textarea>
      </div>
      <div class="row"><button id="comosExCheck" class="primary grow">✅ Verificar</button><button id="comosExHint" class="secondary">💡 Dica</button><button id="comosExRun" class="secondary">▶️ Testar</button></div>
      <div id="comosExFeedback" class="hidden" style="margin-top:10px"></div>
      <pre id="comosExOut" class="corrected" style="margin-top:8px;min-height:44px;font-size:13px;font-family:ui-monospace,Menlo,Consolas,monospace;white-space:pre-wrap"></pre>
      <div class="row" style="margin-top:10px"><button id="comosExPrev" class="secondary grow">⏮ Anterior</button><button id="comosExNext" class="secondary grow">Próximo ⏭</button></div>
      <p id="comosExProgress" class="mut" style="text-align:center;margin-top:6px"></p>
    </div>
  </div>
</section>`);
    bind();
  }

  function bind() {
    $id('comosBack').onclick = () => {
      if (state.mode === 'trilha' && !$id('comosExercise').classList.contains('hidden')) { showLessonList(); return; }
      show('home'); render();
    };
    $id('comosTabConsole').onclick = () => switchMode('console');
    $id('comosTabTrilha').onclick = () => switchMode('trilha');
    $id('comosRun').onclick = runConsole;
    $id('comosStep').onclick = startStepping;
    $id('comosStepNext').onclick = stepOnce;
    $id('comosStop').onclick = stopStepping;
    $id('comosReset').onclick = () => { $id('comosEditor').value = SAMPLE; persistScript(); };
    $id('comosEditor').addEventListener('input', persistScript);
    $id('comosExCheck').onclick = checkExercise;
    $id('comosExHint').onclick = () => feedback($id('comosExFeedback'), '💡 ' + currentEx().hint, 'hint');
    $id('comosExRun').onclick = () => { const r = Interp.run($id('comosExEditor').value); $id('comosExOut').textContent = r.error ? '⛔ ' + r.error : (r.output || '(nada impresso)'); };
    $id('comosExPrev').onclick = () => moveEx(-1);
    $id('comosExNext').onclick = () => moveEx(1);
  }

  window.openComosLab = function openComosLab() {
    inject();
    show('comosScreen');
    const d = pdata();
    $id('comosEditor').value = d.lastScript && d.lastScript.trim() ? d.lastScript : SAMPLE;
    renderTree();
    switchMode('console');
  };

  function switchMode(mode) {
    state.mode = mode;
    $id('comosTabConsole').classList.toggle('active', mode === 'console');
    $id('comosTabTrilha').classList.toggle('active', mode === 'trilha');
    $id('comosConsole').classList.toggle('hidden', mode !== 'console');
    $id('comosTrilha').classList.toggle('hidden', mode !== 'trilha');
    if (mode === 'trilha') renderTierTabs(), showLessonList();
  }

  function persistScript() { const d = pdata(); d.lastScript = $id('comosEditor').value; save(); }

  // ---- Árvore de objetos ----
  function renderTree() {
    const model = Interp.buildModel();
    const html = nodeHtml(model, true);
    $id('comosTree').innerHTML = html;
    $id('comosTree').querySelectorAll('[data-toggle]').forEach((el) => {
      el.onclick = () => { const w = el.closest('.comos-node'); w.classList.toggle('open'); };
    });
  }
  function nodeHtml(n, open) {
    const attrs = Object.values(n._attrs);
    const kids = n._children;
    const hasKids = kids.length || attrs.length;
    return `<div class="comos-node${open ? ' open' : ''}">
      <div class="comos-row"${hasKids ? ' data-toggle="1"' : ''}>
        <span class="comos-caret">${hasKids ? '▸' : '·'}</span>
        <b>${escv(n.Name)}</b> <span class="mut">${escv(n.ClassName)}</span>
      </div>
      <div class="comos-kids">
        ${attrs.map((a) => `<div class="comos-attr">🏷️ ${escv(a.Name)} = <b>${escv(a.Value)}</b> ${escv(a.Unit || '')}</div>`).join('')}
        ${kids.map((k) => nodeHtml(k, false)).join('')}
      </div>
    </div>`;
  }

  // ---- Console: executar ----
  function runConsole() {
    stopStepping();
    const r = Interp.run($id('comosEditor').value);
    $id('comosOut').textContent = r.output || '(nada impresso)';
    if (r.error) $id('comosOut').textContent += (r.output ? '\n' : '') + '⛔ ' + r.error;
    renderWatch(r.vars);
  }
  function renderWatch(vars) {
    const keys = Object.keys(vars).filter((k) => !['objproject', 'objselected'].includes(k));
    if (!keys.length) { $id('comosWatch').innerHTML = '<span class="mut">Nenhuma variável do usuário ainda.</span>'; return; }
    $id('comosWatch').innerHTML = keys.map((k) => `<div class="comos-wrow"><code>${escv(k)}</code> <span class="mut">=</span> ${escv(vars[k])}</div>`).join('');
  }

  // ---- Console: passo a passo (debugger) ----
  function startStepping() {
    const lines = $id('comosEditor').value.replace(/\r/g, '').split('\n');
    state.dbg = { lines, queue: [], done: false, vars: {}, out: [] };
    // recolhe os "pontos de parada" (statements) usando o próprio interpretador em modo step,
    // mas de forma incremental: executamos tudo com um callback que enfileira snapshots.
    const snaps = [];
    Interp.run($id('comosEditor').value, {
      step: (ln, env) => {
        const vars = {};
        env.forEach((v, k) => { if (!['workset', 'objproject', 'objselected'].includes(k)) vars[k] = Interp._str(v); });
        snaps.push({ ln, vars });
      },
    });
    state.dbg.snaps = snaps;
    state.dbg.i = -1;
    $id('comosStepNext').disabled = snaps.length === 0;
    $id('comosStop').disabled = false;
    $id('comosOut').textContent = snaps.length ? '⏯️ Pronto pra depurar: ' + snaps.length + ' passos. Toque em "Próximo passo".' : '(nenhum comando executável)';
    $id('comosWatch').innerHTML = '<span class="mut">Toque em "Próximo passo" pra começar.</span>';
    highlightLine(null);
  }
  function stepOnce() {
    const d = state.dbg; if (!d) return;
    d.i++;
    if (d.i >= d.snaps.length) {
      const full = Interp.run($id('comosEditor').value);
      $id('comosOut').textContent = (full.output || '(nada impresso)') + '\n\n✅ Fim do script.';
      if (full.error) $id('comosOut').textContent += '\n⛔ ' + full.error;
      renderWatch(full.vars);
      highlightLine(null);
      stopStepping();
      return;
    }
    const s = d.snaps[d.i];
    highlightLine(s.ln);
    renderWatch(s.vars);
    // saída acumulada até este ponto: re-executa e mostra (simples e confiável)
    $id('comosOut').textContent = `Passo ${d.i + 1}/${d.snaps.length} — linha ${s.ln}:\n  ${(d.lines[s.ln - 1] || '').trim()}`;
  }
  function stopStepping() {
    state.dbg = null;
    $id('comosStepNext').disabled = true;
    $id('comosStop').disabled = true;
    highlightLine(null);
  }
  function highlightLine(ln) {
    const ta = $id('comosEditor');
    if (ln == null) { ta.style.removeProperty('--hl'); return; }
    // sem numeração real de linha no textarea: mostramos a linha no output;
    // aqui damos um feedback simples selecionando a linha.
    const lines = ta.value.split('\n');
    let start = 0;
    for (let k = 0; k < ln - 1; k++) start += lines[k].length + 1;
    const end = start + (lines[ln - 1] || '').length;
    ta.focus(); ta.setSelectionRange(start, end);
  }

  // ---- Trilha guiada ----
  function renderTierTabs() {
    $id('comosTierTabs').innerHTML = Object.entries(LESSONS).map(([key, t]) =>
      `<button class="essay-tab${state.tier === key ? ' active' : ''}" data-tier="${key}">${t.label}</button>`).join('');
    $id('comosTierTabs').querySelectorAll('[data-tier]').forEach((b) => {
      b.onclick = () => { state.tier = b.dataset.tier; state.exIndex = 0; renderTierTabs(); showLessonList(); };
    });
  }
  function items() { return LESSONS[state.tier].items; }
  function currentEx() { return items()[state.exIndex]; }
  function isDone(id) { return !!pdata().done[id]; }

  function showLessonList() {
    $id('comosLessonList').classList.remove('hidden');
    $id('comosExercise').classList.add('hidden');
    $id('comosLessonList').innerHTML = items().map((ex, i) => {
      const done = isDone(ex.id);
      return `<button class="story-card" data-ex="${i}"><span class="cover">${done ? '✅' : '📝'}</span><span><b>${escv(ex.title)}</b><small>${LESSONS[state.tier].label}${done ? ' · concluído' : ''}</small></span><span class="go">›</span></button>`;
    }).join('');
    $id('comosLessonList').querySelectorAll('[data-ex]').forEach((b) => {
      b.onclick = () => { state.exIndex = +b.dataset.ex; openExercise(); };
    });
    const total = items().length, done = items().filter((e) => isDone(e.id)).length;
    // reaproveita o parágrafo de progresso quando exercício estiver aberto
  }
  function openExercise() {
    $id('comosLessonList').classList.add('hidden');
    $id('comosExercise').classList.remove('hidden');
    const ex = currentEx();
    $id('comosExTopic').textContent = LESSONS[state.tier].label;
    $id('comosExTitle').textContent = ex.title;
    $id('comosExPrompt').textContent = ex.promptPt;
    $id('comosExEditor').value = ex.starter;
    $id('comosExFeedback').classList.add('hidden');
    $id('comosExOut').textContent = '';
    const total = items().length, done = items().filter((e) => isDone(e.id)).length;
    $id('comosExProgress').textContent = `${done}/${total} concluídos nesta trilha`;
    $id('comosExPrev').disabled = state.exIndex === 0;
    $id('comosExNext').disabled = state.exIndex === total - 1;
  }
  function moveEx(dir) {
    const n = state.exIndex + dir;
    if (n < 0 || n >= items().length) return;
    state.exIndex = n; openExercise();
  }
  function checkExercise() {
    const ex = currentEx();
    const r = Interp.run($id('comosExEditor').value);
    $id('comosExOut').textContent = r.error ? '⛔ ' + r.error : (r.output || '(nada impresso)');
    if (r.error) { feedback($id('comosExFeedback'), '❌ O script deu erro: ' + escv(r.error), 'bad'); return; }
    const got = (r.output || '').trim().replace(/\s+$/gm, '');
    const want = ex.expected.trim();
    if (got === want) {
      pdata().done[ex.id] = true; save();
      const total = items().length, done = items().filter((e) => isDone(e.id)).length;
      $id('comosExProgress').textContent = `${done}/${total} concluídos nesta trilha`;
      const last = state.exIndex === total - 1;
      feedback($id('comosExFeedback'),
        `✅ Certo! A saída bate com o esperado.` +
        (last ? ' 🏁 Você terminou esta trilha!' : ' <button id="comosExAuto" class="primary" style="margin-top:8px">Próximo ⏭</button>'), 'ok');
      const b = $id('comosExAuto'); if (b) b.onclick = () => moveEx(1);
      showLessonListSilently();
    } else {
      feedback($id('comosExFeedback'),
        `❌ Ainda não. <br><b>Esperado:</b><span class="corrected" style="display:block;margin:4px 0;padding:6px">${escv(ex.expected)}</span><b>Sua saída:</b><span class="corrected" style="display:block;padding:6px">${escv(r.output || '(nada impresso)')}</span>`, 'bad');
    }
  }
  function showLessonListSilently() { /* mantém a lista atualizada ao voltar */ }

  function feedback(el, html, kind) {
    el.className = '';
    el.classList.remove('hidden');
    el.style.padding = '10px';
    el.style.borderRadius = '10px';
    el.style.background = kind === 'ok' ? 'rgba(46,160,67,.14)' : kind === 'bad' ? 'rgba(220,60,60,.12)' : 'rgba(120,120,120,.12)';
    el.innerHTML = html;
  }

  // CSS do módulo
  const css = document.createElement('style');
  css.textContent = `
  .comos-tree{margin-top:8px;font-size:13px;max-height:230px;overflow:auto;font-family:ui-monospace,Menlo,Consolas,monospace}
  .comos-node>.comos-kids{display:none;margin-left:16px;border-left:1px dashed rgba(128,128,128,.35);padding-left:10px}
  .comos-node.open>.comos-kids{display:block}
  .comos-row{cursor:default;padding:2px 0}
  .comos-row[data-toggle]{cursor:pointer}
  .comos-caret{display:inline-block;width:14px;color:#888}
  .comos-node.open>.comos-row>.comos-caret{transform:rotate(90deg)}
  .comos-attr{color:#7a7a7a;padding:1px 0}
  .comos-watch{margin-top:8px;font-size:13px}
  .comos-wrow{padding:2px 0;font-family:ui-monospace,Menlo,Consolas,monospace}
  .comos-wrow code{background:rgba(128,128,128,.14);padding:1px 5px;border-radius:5px}`;
  document.head.appendChild(css);

  document.addEventListener('DOMContentLoaded', inject);
  if (document.readyState !== 'loading') inject();

  // Hook de teste (sem efeito no navegador)
  if (typeof module !== 'undefined' && module.exports) module.exports = { Interp, LESSONS, SAMPLE };
})();
