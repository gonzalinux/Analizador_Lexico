let fs = require(`fs`);

let archivo=process.argv[2];
let ha_terminado=false;
let puntero=0;
let valor;
let lexema;
let ultimadeclaracion=""
let estadofinal=false;
let listatokens=[]
let TABLASIMBOLOS=[]
let zonadeclaracion=false;
let listastrings=[];
let nTablas=1;
let esfuncion=false;
TABLASIMBOLOS.unshift(new TS_tabla("TablaPrincipal",[]));
let estado=0;
let char;
let charanterior;
let hayerror=false;
let errores=[];
function esta_en_TS(lexema){
    for(let i=0;i<TABLASIMBOLOS[0].elementos.length;i++){
        if(TABLASIMBOLOS[0].elementos[i].lexema===lexema)
            return i;
    }
    return -1;



}
function TS_tabla(nombre,elementos){
    this.nombre=nombre;
    this.elementos=elementos;
    this.desplazamiento=0;
    this.numero=nTablas++;
    let numero=this.numero;
    this.enCadena=()=>{
        let string="";
        for(let i=0;i<elementos.length;i++){
            string+=elementos[i].enCadena()

        }
        return "Contenido Actual de TS "+nombre+" # "+ numero+" :\n"+string;
    }
}


function TS_elemento(lexema, atributos){
    this.lexema=lexema;
    this.atributos=atributos;
    this.enCadena=()=>{
        let string="* LEXEMA: '"+lexema+"'\n" +
            "ATRIBUTOS: \n";

        for(let i=0;i<Object.keys(atributos).length;i++){
            string+="       +"+Object.keys(atributos)[i] +" : "+Object.values(atributos)[i]+"\n"

        }
        string+="----------------------\n"
        return string;
    }


}

function leer(){
    puntero++;
}
function Token(tipo,atributo){
    this.tipo=tipo;
    this.atributo=atributo;
    this.enCadena="<"+tipo+", "+atributo+">";

}

let accion=[38];

accion[0]=(char)=>{
    valor=parseInt(char);
    leer()

}
accion[1]=(char)=>{

    leer()

}
accion[2]=(char)=>{
    lexema=char;
    leer()

}
accion[3]=(char)=>{
    valor=valor*10+parseInt(char);
    leer()

}
accion[4]=(char)=>{
    listatokens.push(new Token("ENT",valor))

}
accion[5]=(char)=>{
    listatokens.push(new Token("asignacion",1))
    leer()

}
accion[6]=(char)=>{
    listatokens.push(new Token("OPAR",2));


}
accion[7]=(char)=>{
    switch (lexema){
        case "+":
            listatokens.push(new Token("OPAR",0));break;
        case "-":
            listatokens.push(new Token("OPAR",1));break;
        case "%":
            listatokens.push(new Token("OPAR",4));break;

    }


}
accion[8]=(char)=>{
    lexema=char;
    leer()

}

accion[9]=(char)=>{
    lexema+=char;
    leer()

}
accion[10]=(char)=>{
    let identificador=false;
    switch (lexema){
        case "function":esfuncion=true;
        case "string":
        case "number":
        case "boolean":zonadeclaracion=true;ultimadeclaracion=lexema;
        case "let":
        case "alert":
        case "else":
        case "if":
        case "input":
        case "return":
            listatokens.push(new Token("RES",lexema));break;
        case "false" : listatokens.push(new Token("BOOL",0));break;
        case "true":    listatokens.push(new Token("BOOL",1));break;
        default:
            identificador=true;

    }



    if(identificador){

        let n;
        let yaesta=esta_en_TS(lexema);
        if(zonadeclaracion||yaesta===-1){
            if(yaesta!==-1){
                error("Se ha declarado una variable declarada anteriormente",false);}

            else {
                let atributos = {
                    tipo:""

                }
                if (esfuncion) {
                    atributos.tipo = "'función'";
                    //TABLASIMBOLOS.unshift(new TS_tabla("TS_"+lexema,[]))

                } else {
                    if(!zonadeclaracion){
                        atributos.tipo="'variable'";
                    }
                    else
                    if (ultimadeclaracion === "string" || ultimadeclaracion === "number") {
                        atributos.desp = TABLASIMBOLOS[0].desplazamiento;
                        atributos.tipo = ultimadeclaracion === "string" ? "'cadena'":"'entero'";
                        TABLASIMBOLOS[0].desplazamiento+=2;
                    }
                    else if (ultimadeclaracion === "boolean"){
                        atributos.tipo = "'lógico'";
                        atributos.desp = TABLASIMBOLOS[0].desplazamiento;
                        TABLASIMBOLOS[0].desplazamiento+=1;
                        TABLASIMBOLOS[0].desplazamiento+=1;
                    }

                }
                n = TABLASIMBOLOS[0].elementos.push(new TS_elemento(lexema, atributos))-1;
            }
        }
        else {
            n = yaesta;
        }
        listatokens.push(new Token("ID",n));
        zonadeclaracion=false;

    }}
accion[11]=(char)=>{
    listatokens.push(new Token("PuntoYComa", ""));
    leer()

}
accion[12]=(char)=>{
    listatokens.push(new Token("Coma", ""));
    leer()

}
accion[13]=(char)=>{

    leer()

}
accion[14]=(char)=>{
    listatokens.push(new Token("OPRE", 0));
    leer()

}
accion[15]=(char)=>{
    listatokens.push(new Token("Asignacion", 0));

}
accion[16]=(char)=>{
    lexema=char;
    leer()

}
accion[17]=(char)=>{
    lexema+=char;
    leer()

}
accion[18]=(char)=>{

    leer()

}
accion[19]=(char)=>{
    if(char=="\\")
        lexema+="\\";
    else
        lexema+="'";
    leer()

}
accion[20]=(char)=>{
    lexema+=char;
    let n=listastrings.push(lexema)
    listatokens.push(new Token("STR", n-1));
    leer();
}
accion[21]=(char)=>{
    listatokens.push(new Token("AbreLlave", ""));
    leer();





}
accion[22]=(char)=>{
    listatokens.push(new Token("CierraLlave", ""));
    leer()

}
accion[23]=(char)=>{
    listatokens.push(new Token("CierraParentesis", ""));
    leer()

}
accion[24]=(char)=>{
    listatokens.push(new Token("AbreParentesis", ""));
    leer()

}
accion[25]=(char)=>{

    leer()

}
accion[26]=(char)=>{
    listatokens.push(new Token("OPLO", 0));
    leer()

}

accion[27]=(char)=>{

    leer()

}
accion[28]=(char)=>{
    listatokens.push(new Token("OPLO", 1));
    leer()

}
accion[29]=(char)=>{
    listatokens.push(new Token("OPLO", 2));
    leer()

}
accion[30]=(char)=>{
    listatokens.push(new Token("EOF", ""));
    ha_terminado=true;

}
accion[31]=(char)=>{

    leer()

}
accion[32]=(char)=>{
    listatokens.push(new Token("OPAR", 3));


}
accion[33]=(char)=>{
    leer()

}
accion[34]=(char)=>{
    leer()

}
accion[35]=(char)=>{
    leer()

}
accion[36]=(char)=>{
    leer()

}
accion[37]=(char)=>{
    leer()

}









function Transicion(estado_futuro,caract,accion){
    this.estado_futuro=estado_futuro;
    this.caract=caract;
    this.accion=accion;


}
function error(informacion, si){

    hayerror=true;
    leer()
    let error="Se ha producido un error en el estado " + estado+ "\n" +
        "Mas informacion:\n"+ informacion ;
    if(si!==false)
        error+="\nEl carácter que libero este error es: "+charanterior;
    else
        error+="\nLa variable que produjo este error es: " +lexema;
    error+="\n----------------------------------\n"
    console.log(error)

    errores.push(error)

}

function Estado(posibles) {
    let ascii;
    this.estadofin=()=>{
        estadofinal=posibles.length === 0;
    }
    this.accion_futura = (char)=> {




        for (let i=0;i<posibles.length;i++) {
            let transicion=posibles[i];


            ascii = char.toUpperCase().charCodeAt(0);
            switch (transicion.caract) {
                case "digito":

                    if (!isNaN(parseInt(char)))
                        return transicion.accion;
                    break;
                case "letra":

                    if (ascii > 64 && ascii < 91)
                        return transicion.accion;
                    break;
                case "del":

                    if ( ascii===10 ||ascii===13|| ascii === 32||ascii === 11||ascii === 9) {

                        return transicion.accion
                    }
                    break;
                case "EOF":
                    if (isNaN(ascii))
                        return transicion.accion;
                    break;
                case "o.c":
                    return transicion.accion;break;

                default:
                    if (Array.isArray(transicion.caract)){

                        for(let i=0;i<transicion.caract.length;i++){
                            if(transicion.caract[i]=="letra"&&(ascii > 64 && ascii < 91))
                                return transicion.accion;
                            if(transicion.caract[i]=="digito"&&!isNaN(parseInt(char)))
                                return transicion.accion;
                            if (char === transicion.caract[i])
                                return transicion.accion;
                        }
                    }
                    if (char === transicion.caract)
                        return transicion.accion;


            }
        }
        return error;
    };
    this.estado_futuro = (char) => {

        for (let i=0;i<posibles.length;i++) {
            let transicion=posibles[i];
            ascii = char.toUpperCase().charCodeAt(0);
            switch (transicion.caract) {
                case "digito":
                    if (!isNaN(parseInt(char)))
                        return transicion.estado_futuro;
                    break;
                case "letra":
                    if (ascii > 64 && ascii < 91)
                        return transicion.estado_futuro;
                    else
                        break;
                case "del":
                    if (ascii===10 ||ascii===13 || ascii === 32||ascii === 11||ascii === 9) {
                        return transicion.estado_futuro
                    }
                    break;
                case "EOF":
                    if (isNaN(ascii))
                        return transicion.estado_futuro;
                    break;
                case "o.c":
                    return transicion.estado_futuro;
                default:
                    if (Array.isArray(transicion.caract)){

                        for(let i=0;i<transicion.caract.length;i++){
                            if(transicion.caract[i]=="letra"&&(ascii > 64 && ascii < 91))
                                return transicion.estado_futuro;
                            if(transicion.caract[i]=="digito"&&!isNaN(parseInt(char)))
                                return transicion.estado_futuro;
                            if (char === transicion.caract[i])
                                return transicion.estado_futuro;
                        }
                    }
                    if (char === transicion.caract)
                        return transicion.estado_futuro;


            }
        }
        return null;
    }

}




let transiciones=[30];
transiciones[0]=[
    new Transicion(0,"del",[leer]),
    new Transicion(1,"digito",[accion[0]]),
    new Transicion(3,"*",[accion[1]]),
    new Transicion(6,["+","-","%"],[accion[2]]),
    new Transicion(7,"letra",[accion[8]]),
    new Transicion(9,";",[accion[11]]),
    new Transicion(10,",",[accion[12]]),
    new Transicion(11,"=",[accion[13]]),
    new Transicion(14,"'",[accion[16]]),
    new Transicion(17,"{",[accion[21]]),
    new Transicion(18,"}",[accion[22]]),
    new Transicion(19,")",[accion[23]]),
    new Transicion(20,"(",[accion[24]]),
    new Transicion(21,"&",[accion[25]]),
    new Transicion(23,"|",[accion[27]]),
    new Transicion(25,"!",[accion[29]]),
    new Transicion(26,"EOF",[accion[30]]),
    new Transicion(27,"/",[accion[31]]),
    new Transicion(0,"o.c",[error,"Se ha introducido un caracter no identificado"]),
]
transiciones[1]=[
    new Transicion(1,"digito",[accion[3]]),
    new Transicion(2,"o.c",[accion[4]]),
]
transiciones[2]=[];
transiciones[3]=[
    new Transicion(4,"=",[accion[5]]),
    new Transicion(5,"o.c",[accion[6]]),

]
transiciones[4]=[];
transiciones[5]=[];
transiciones[6]=[
    new Transicion(5,"o.c",[accion[7]]),
];
transiciones[7]=[
    new Transicion(7,["letra","digito","_"],[accion[9]]),
    new Transicion(8,"o.c",[accion[10]]),
];
transiciones[8]=[];
transiciones[9]=[];
transiciones[10]=[];
transiciones[11]=[
    new Transicion(12,"=",[accion[14]]),
    new Transicion(13,"o.c",[accion[15]]),
];
transiciones[12]=[];
transiciones[13]=[];
transiciones[14]=[

    new Transicion(15,"\\",[accion[18]]),
    new Transicion(16,"'",[accion[20]]),
    new Transicion(14,"o.c",[accion[17]]),


];
transiciones[15]=[
    new Transicion(14,["'","\\"],[accion[19]]),
    new Transicion(0,"o.c",[error, "El caracter \\ es de escape por lo que cualquier caracter otro a ' o \\ no puede estar seguido. "]),
];
transiciones[16]=[];
transiciones[17]=[];
transiciones[18]=[];
transiciones[19]=[];
transiciones[20]=[];
transiciones[21]=[
    new Transicion(22,"&",[accion[26]]),
    new Transicion(0,"o.c",[error, "El operador lógico AND se escribe && y se obtuvo un caracter equivocado despues del primer &"]),
];
transiciones[22]=[];
transiciones[23]=[
    new Transicion(24,"|",[accion[28]]),
    new Transicion(0,"o.c",[error, "El operador lógico OR se escribe || y se obtuvo un caracter equivocado despues del primer |"])
];
transiciones[24]=[];
transiciones[25]=[];
transiciones[26]=[];
transiciones[27]=[
    new Transicion(28,"*",[accion[33]]),
    new Transicion(5,"o.c",[accion[32]]),


];
transiciones[28]=[
    new Transicion(29,"*",[accion[35]]),
    new Transicion(28,"o.c",[accion[34]]),

];
transiciones[29]=[
    new Transicion(0,"/",[accion[37]]),
    new Transicion(28,"o.c",[accion[36]]),
];










let matriz_transicion={

    estados: [],
    accion:(estado,char)=>{

        let resultado=matriz_transicion.estados[estado].accion_futura(char);
        return resultado;

    },
    estado:(estado,char)=>{

        return matriz_transicion.estados[estado].estado_futuro(char);
    }

}




function main(){
    for(let i=0;i<30;i++){
        matriz_transicion.estados.push(new Estado(transiciones[i]));
    }
    archivo=fs.readFileSync(archivo,'utf-8');
    char=archivo.charAt(0);

    while(!ha_terminado){
        estado=0;
        while(!estadofinal){
            charanterior=char;
            let accion= matriz_transicion.accion(estado,char);
            if(accion.length===2)
                accion[0](accion[1]);
            else
                accion[0](char);
            estado=matriz_transicion.estado(estado,char);
            matriz_transicion.estados[estado].estadofin();

            char=archivo.charAt(puntero)
        }
        estadofinal=false;

    }
    let escrito="tokens.txt"
    let tokens="";
    for(let i=0;i<listatokens.length;i++){
        let anadir="\n";
        if(i===listatokens.length-1)
            anadir="";
        tokens+=listatokens[i].enCadena+anadir;

    }
    fs.writeFileSync(escrito,tokens,"utf-8");
    let tabla=TABLASIMBOLOS[0].enCadena();
    fs.writeFileSync("tabla.txt",tabla,'utf-8')

if(hayerror){
    let errorestxt="";
    for (let i=0;i<errores.length;i++){
        errorestxt+=errores[i];
    }
    fs.writeFileSync("salidaerror3.txt",errorestxt,"utf-8")
}
}
main();