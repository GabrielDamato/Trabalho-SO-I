class Processo{
    constructor(nome, tempoChegada, tempoExecucao, inicioES, duracaoEs){
        this.nome = nome;
        this.tempoChegada = tempoChegada;
        this.tempoExecucao = tempoExecucao;
        this.inicioES = inicioES;
        this.duracaoEs = duracaoEs;
        this.posicaoAtual = 0;
        this.pronto = false;
        this.termino;
    }

    getName(){
        return this.nome;
    }

    getTempoChegada(){
        return this.tempoChegada;
    }

    getTempoExecucao(){
        return this.tempoExecucao;
    }

    getinicioES(){
        return this.inicioES;
    }

    getDuracaoEs(){
        return this.duracaoEs;
    }

    getPosicaoAtual(){
        return this.posicaoAtual;
    }

    setPosicaoAtual(valor){
        this.posicaoAtual = valor;
    }

    setComeco(valor){
        this.comeco = valor;
    }

    getComeco(){
        return this.comeco;
    }

    setTermino(valor){
        this.termino = valor;
    }

    getTermino(){
        return this.termino;
    }

    getPronto(){
        return this.pronto;
    }

    setPronto(status){
        this.pronto = status;
    }

    getTurnaround(){
        return this.termino - this.tempoChegada;
    }

    getAtrasoRelativo(){
        return (this.termino - this.tempoChegada)/this.tempoExecucao;
    }

    setId(id){
        this.id = id;
    }

    getId(){
        return this.id;
    }
}

var listaProcessos = [];

var botaoAdicionar = document.querySelector("#adicionar-processo")
botaoAdicionar.addEventListener("click", function(event){
    
    var nome = document.querySelector("#nome");
    var chegada = document.querySelector("#chegada");
    var execucao = document.querySelector("#execucao");
    var inicioES = document.querySelector("#intervalo-entrada-saida");
    var duracaoEs = document.querySelector("#duracao-entrada-saida");

    if (filtraDadosEntrada(nome, chegada, execucao,) != false){

        if (duracaoEs.value.length == 0 || duracaoEs.value == "0" || inicioES.value.length == 0 || inicioES.value == "0" || inicioES.value >= execucao.value){
            inicioES.value = execucao.value;
            duracaoEs.value = 0;
        }

        var atributos = [nome.value, chegada.value, execucao.value, inicioES.value, duracaoEs.value];

        listaProcessos.push(new Processo(atributos[0], parseInt(atributos[1]), parseInt(atributos[2]), parseInt(atributos[3]), parseInt(atributos[4])));

        criaTabelaDados(atributos);

        var tabela = document.querySelector("#fluxograma");
        var linha = document.createElement("tr");
        var coluna = document.createElement("td");
        var textTd = document.createTextNode(listaProcessos[listaProcessos.length - 1].getName());
        linha.id = listaProcessos.length - 1;
        linha.classList.add("processo");
        tabela.appendChild(linha);
        coluna.appendChild(textTd);
        linha.appendChild(coluna);
        event.preventDefault();
        window.scrollTo(0, 500);
    }
});

var botaoExecutar = document.querySelector("#executar");
botaoExecutar.addEventListener("click", function(event){
    

    if (listaProcessos.length == 0){
        alert("Nenhum processo foi adicionado!");
    }
    setIds(listaProcessos);
    ordenaLista(listaProcessos);
    executaLista(listaProcessos, 0, 0, listaProcessos.length);
    atualizaDadosProcessos(listaProcessos);
    insereTempoTabela();
    event.preventDefault();
    botaoExecutar.setAttribute("disabled","disabled");
    botaoAdicionar.setAttribute("disabled","disabled");
    window.scrollTo(0, 500);
});

var botaoLimpar = document.querySelector("#limpar");
botaoLimpar.addEventListener("click", function(){});

function executaLista(listaProcessos, tempo, i, n){

    verificaPronto(listaProcessos[i], tempo);
    if (listaProcessos[i].pronto == true){  //se o processo está pronto
        //executa até a proxima E/S
        verificaComeco(listaProcessos[i], tempo);
        if (listaProcessos[i].getPosicaoAtual() == 0){    //se o processo ainda não fez E/S
            var avanca = listaProcessos[i].getinicioES();
            listaProcessos[i].setPosicaoAtual(listaProcessos[i].getPosicaoAtual() + avanca);
            listaProcessos[i].setTermino(tempo + avanca);
            listaProcessos[i].setPronto(false); 
            desenhaFluxograma(listaProcessos[i], tempo, avanca, "executado");
            executaLista(listaProcessos, tempo + avanca, 0, n);
        }else{  //se o processo já fez E/S
            var avanca = listaProcessos[i].getTempoExecucao() - listaProcessos[i].getPosicaoAtual();
            listaProcessos[i].setPosicaoAtual(listaProcessos[i].getTempoExecucao());
            listaProcessos[i].setTermino(tempo + avanca);
            terminaProcesso(listaProcessos[i], tempo, avanca);
            if (n > 1){ //se não for o ultimo processo
                desenhaFluxograma(listaProcessos[i], tempo, avanca, "executado");
                ajustaLista(listaProcessos, i);
                n--;
                executaLista(listaProcessos, tempo + avanca, 0, n);
            } else{ //se for o ultimo processo
                desenhaFluxograma(listaProcessos[i], tempo, avanca, "executado");
                tempo += avanca;
                ordenaLista(listaProcessos);
                return false;
            } 
        }
    }else{  //se o processo não está pronto
        if ((i + 1) < n){ //se o processo não for o ultimo da lista
            //passa para o proximo
            executaLista(listaProcessos, tempo, i + 1, n);
        }else if (n == 1){    //se a lista avancaém apenas esse processo
            if(listaProcessos[i].getComeco() != undefined){ //se o processo já foi iniciado
                executaEs(listaProcessos, tempo, i, n);
            }else{  //se o processo ainda não foi iniciado
                executaInicio(listaProcessos, tempo, i, n);
            }
        }else if((i+1) == n && n != 1){ //se nenhum processo está pronto
            i = voltaPrimeiro(listaProcessos, tempo, n);
            if (listaProcessos[i].getComeco() != undefined){
                executaEs(listaProcessos, tempo, i, n);
            }else{
                executaInicio(listaProcessos, tempo, i, n);
            }
        }
    }
}   //executa os processos na lista

function verificaComeco(processo, tempo){
    if (processo.getPosicaoAtual() == 0){
        processo.setComeco(tempo);
    }
}   //atribui o tempo de inicio do processo

function verificaPronto(processo, tempo){
    if (tempo >= processo.getTempoChegada() && processo.getPosicaoAtual() == 0){    //se o processo já chegou e ainda não iniciou
        processo.setPronto(true);
    }else{
        if ((processo.getTermino() + processo.getDuracaoEs()) <= tempo){
            processo.setPronto(true);
        }
    }
}   //verifica se o processo está na fila de prontos

function voltaPrimeiro(listaProcessos, tempo, n){
    var indice;
    var min = Infinity;
    var resto;
    for (var i = 0; i < n; i++){
        if (listaProcessos[i].getComeco() != undefined){    //se o processo já iniciou
            resto = (listaProcessos[i].getDuracaoEs() - (tempo - listaProcessos[i].getTermino()));  //resto é o tempo que falta para terminar E/S
        }else{  //se o processo ainda não iniciou
            resto = listaProcessos[i].getTempoChegada() - tempo;  //resto é o tempo que falta para a chegada do processo
        }
        if (min > resto){
            min = resto;
            indice = i;
        }
    }
    return indice; 
}   //verifica qual processo volta primeiro para a fila de prontos

function terminaProcesso(processo, tempo, avanca){
    processo.setPosicaoAtual(processo.getTempoExecucao());
    processo.setTermino(tempo + avanca);
}   //atribui o tempo de termino do processo

function ajustaLista(listaProcessos, i){
    listaProcessos.push(listaProcessos[i]);
    listaProcessos.splice(i, 1);
}   //remove processo finalizado do escopo de execução

function executaEs(listaProcessos, tempo, i, n){

    var avanca = (listaProcessos[i].getDuracaoEs() - (tempo - listaProcessos[i].getTermino()));
    listaProcessos[i].setPronto(true);
    desenhaFluxograma(listaProcessos[i], tempo, avanca, "coluna");
    executaLista(listaProcessos, tempo + avanca, i, n);
}   //faz o retorno de um processo em entrada e saída e chama sua proxima execução 

function desenhaFluxograma(processo, tempo, avanca, status){
    var tabela = document.querySelector("#fluxograma");
    var numLinhas = tabela.rows.length;
    var linha;
    var coluna;
    for (var i = 0; i < numLinhas; i++){
        for (var j = (tempo + 1); j < (tempo + 1 + avanca); j++){
            linha = tabela.rows[i];
            coluna = linha.insertCell(j);
            if (linha.id == processo.getId()){
                coluna.classList.add("coluna", status);
            }else{
                coluna.classList.add("coluna");
            }
        }
    }
    
}   //cria e formata a tabela do fluxograma de demonstração conforme cada processo é executado

function executaInicio(listaProcessos, tempo, i, n){
    avanca = listaProcessos[i].getTempoChegada() - tempo;
    listaProcessos[i].setPronto(true);
    desenhaFluxograma(listaProcessos[i], tempo, avanca, "coluna");
    executaLista(listaProcessos, tempo + avanca, i, n);
}   //avança até a chegada do processo e chama sua proxima execução

function filtraDadosEntrada(nome, chegada, execucao){
    if (nome.value.length == 0 || chegada.value.length == 0 || execucao.value.length == 0){
        alert("Preencha os valores obrigatórios!");
        return false;
    }
}   //verifica se os campos obrigatórios foram preenchidos

function insereTempoTabela(){
    var tabela = document.querySelector("#fluxograma");
    var tr = tabela.querySelector("tr");
    var header = tabela.createTHead();
    var linha = header.insertRow(0);
    for (var i = 0; i < tr.cells.length; i++){
        var coluna = linha.insertCell(i);
        var text = document.createTextNode(i);
        coluna.classList.add("tempo");
        coluna.appendChild(text);
    }
}   //insere o índice de tempo acima do fluxograma

function criaTabelaDados(atributos){
    var div_pricipal = document.querySelector("#row");
    var div = document.createElement("div"); //Cria a Div
    var tabela = document.createElement("table");
    var nomeAtributos = ["Nome", "Tempo de chegada", "Tempo de execução", "Inicio de E/S", "Duração de E/S"];
    criaCabecalhoDados(tabela, nomeAtributos[0], atributos[0])
    div_pricipal.appendChild(div); // Adiciona a div criada a Div Principal
	div.classList.add("proc_estilo","col-md-2"); // Adicona a classe a Div
    div.appendChild(tabela);
    tabela.classList.add("dados");
    var body = tabela.createTBody();
    for (var i = 0; i < 4; i++){
        var linha = body.insertRow(i);
        body.appendChild(linha);
        for (var j = 0; j < 2; j++){
            var coluna = linha.insertCell(j);
            if (j == 0){
                var text = document.createTextNode(nomeAtributos[i+1]);
                coluna.appendChild(text);
            }else{
                var text = document.createTextNode(atributos[i+1]);
                coluna.appendChild(text);
            }
        }     
    }
}   //cria tabela inicial com o detalhamento dos processos adicionados

function criaCabecalhoDados(tabela, nomeAtributo, atributo){
    var header = tabela.createTHead();
    var linha = header.insertRow(0);
    var c1 = linha.insertCell(0);
    var c2 = linha.insertCell(1);
    var t1 = document.createTextNode(nomeAtributo);
    var t2 = document.createTextNode(atributo);
    c1.appendChild(t1);
    c2.appendChild(t2);
}   //cria cabeçalho da tabela de dados

function atualizaDadosProcessos(listaProcessos){
    var tabelas = document.querySelectorAll(".dados");
    for (var i = 0; i < listaProcessos.length; i++){
        var valoresNovos = [listaProcessos[i].getComeco(), listaProcessos[i].getTermino(), listaProcessos[i].getTurnaround(), listaProcessos[i].getAtrasoRelativo().toFixed(2)];
        var atributos = ["Começo", "Termino", "Turnaround", "Atraso relativo"];
        var id = listaProcessos[i].getId();
        for (var j = 0; j < 4; j++){
            var linha = tabelas[id].insertRow(tabelas[id].rows.length);
            var c1 = linha.insertCell(0);
            var t1 = document.createTextNode(atributos[j]);
            c1.appendChild(t1);
            var c2 = linha.insertCell(1);
            var t2 = document.createTextNode(valoresNovos[j]);
            c2.appendChild(t2);
        }
    }
}   //atualiza a tabela de detalhamento dos processos com seus valores após a execução

function setIds(listaProcessos){
    for (var i = 0; i < listaProcessos.length; i++){
        listaProcessos[i].setId(i);
    }
}   //atribui id's aos processos para identificação no fluxograma

function comparar(a,b){
    if (a.getTempoExecucao() < b.getTempoExecucao()){
        return -1;
    }
    if (a.getTempoExecucao() > b.getTempoExecucao()){
        return 1;
    }
    return 0;
}   //critério de ordenação

function ordenaLista(listaProcessos){
    listaProcessos.sort(comparar)
}   //ordena a lista de processos