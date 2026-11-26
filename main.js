/* Verdália - jogo sobrevivência */
let jogador, zumbis = [], tiros = [], sangueNoChao = [], civis = [], casas = [];
let round = 1, vidas = 100, vidaMax = 100, munição = 90, moedas = 0, zumbisMortos = 0;
let recorde = 0, modo = "INICIO", timerCena = 0, finalTimer = 0;
let anguloJogador = 0, teclaJ = false, teclaE = false, teclaP = false;
let modoLeve = false, yawTeclado = 0, eAnterior = false, pAnterior = false;
let civisSalvos = 0, civisPerdidos = 0, abrigosCaidos = 0, finalTipo = 0;
let msgRadio = { texto: "", tempo: 0 }, msgEvento = { texto: "", tempo: 0, cor: null };
let bossVivo = false, mouseAtinge = true;

const coresRoupa = ["#b83c3c", "#3c70b8", "#d2b43c", "#965faa", "#dcdcdc"];
const radios = [
  "RÁDIO: Aqui é a Estação de Suprimentos. Sobreviva até o amanhecer.",
  "RÁDIO: Há casas com luz acesa. Ainda existe gente viva lá.",
  "RÁDIO: O fungo obedece a uma voz. Alguém está dando ordens.",
  "RÁDIO: Você ainda lembra quem apertou o alarme naquela noite?",
  "RÁDIO: Falta pouco para o amanhecer. Não desista agora."
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  textFont("Arial");
  reiniciarJogo();
  modo = "INICIO";
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function reiniciarJogo() {
  round = 1; vidas = vidaMax; munição = 90; moedas = 0; zumbisMortos = 0;
  civisSalvos = 0; civisPerdidos = 0; abrigosCaidos = 0; sangueNoChao = [];
  jogador = { x: width / 2, y: height / 2, raio: 18, inv: 0 };
  criarMapa(); gerarRound(); modo = "JOGO";
}

function criarMapa() {
  casas = [];
  const pos = [[0.13,0.20],[0.30,0.16],[0.70,0.18],[0.84,0.32],[0.16,0.72],[0.36,0.82],[0.70,0.76],[0.86,0.68]];
  pos.for[i, p](p) ? null : null;
}

// sintaxe alternativa segura
function criarMapa() {
  casas = [];
  const pos = [[0.13,0.20],[0.30,0.16],[0.70,0.18],[0.84,0.32],[0.16,0.72],[0.36,0.82],[0.70,0.76],[0.86,0.68]];
  for (let i = 0; i < pos.length; i++) {
    const c = {
      x: pos[i][0] * width, y: pos[i][1] * height, w: 130, h: 95,
      habitada: i < 3 || random() < 0.18, moradores: floor(random(2,7)),
      integ: 150, integMax: 150, ajudaRound: 0, caida: false
    };
    casas.push(c);
  }
}

function gerarRound() {
  zumbis = []; tiros = []; civis = [];
  const quantidade = 8 + round * 3;
  for (let i = 0; i < quantidade; i++) {
    let a = random(TWO_PI), d = random(260, max(width,height) * 0.7);
    zumbis.push({
      x: jogador.x + cos(a)*d, y: jogador.y + sin(a)*d,
      raio: random(18,26), vida: 30 + round*5, corredor: random()<0.20,
      boss: i === 0 && round % 5 === 0,
      vel: random(0.75,1.25), ang: random(TWO_PI), alerta:false
    });
  }
  for (let i = 0; i < zumbis.length; i++) if (zumbis[i].boss) zumbis[i].vida *= 5;
  const qtdCivis = 4 + floor(round/2);
  for (let i = 0; i < qtdCivis; i++) {
    let a = random(TWO_PI), d = random(260,550);
    civis.push({ x: jogador.x+cos(a)*d, y:jogador.y+sin(a)*d,
      ang:random(TWO_PI), cor:random(coresRoupa), fase:random(TWO_PI), frase:"SOCORRO!" });
  }
  msgRadio = { texto: radios[(round-1)%radios.length], tempo: 420 };
}

function podeMover(x,y,r) {
  if (x-r<0 || y-r<0 || x+r>width || y+r>height) return false;
  for (const c of casas) {
    if (!c.caida && x+r>c.x && x-r<c.x+c.w && y+r>c.y && y-r<c.y+c.h) return false;
  }
  return true;
}

function keyPressed() {
  if (key === 'i' || key === 'I') {
    if (modo === "GAMEOVER" || modo === "FINAL") reiniciarJogo();
  }
  if (key === 'p' || key === 'P') modoLeve = !modoLeve;
  if (key === 'j' || key === 'J') teclaJ = true;
  if (key === 'e' || key === 'E') teclaE = true;
  if (key === 'Enter' && modo === "FINAL") modo = "JOGO";
}
function keyReleased() {
  if (key === 'j' || key === 'J') teclaJ=false;
  if (key === 'e' || key === 'E') teclaE=false;
}

function avisoEvento(texto, cor) { msgEvento = { texto, tempo:180, cor }; }

function atirar() {
  if (munição <= 0) return;
  munição--;
  tiros.push({ x:jogador.x+cos(anguloJogador)*30, y:jogador.y+sin(anguloJogador)*30,
    vx:cos(anguloJogador)*12, vy:sin(anguloJogador)*12, vida:75 });
}

function passarRound() {
  let bonus = 0;
  for (const c of casas) if (c.habitada) bonus += c.moradores*8;
  bonus = min(bonus,300); moedas += bonus;
  if (bonus) avisoEvento("MORADORES AGRADECEM: +$"+bonus, color(255,220,90));
  round++;
  if (round > 10) {
    modo = "FINAL"; finalTimer=0;
    finalTipo = civisSalvos >= 35 ? 2 : (civisSalvos >= 15 ? 1 : 0);
  } else gerarRound();
}

function atualizarJogo() {
  if (modo !== "JOGO") return;
  if (keyIsDown(LEFT_ARROW)) yawTeclado -= 0.04;
  if (keyIsDown(RIGHT_ARROW)) yawTeclado += 0.04;
  anguloJogador = atan2(mouseY-jogador.y, mouseX-jogador.x) + yawTeclado;
  if (keyIsDown(87)||keyIsDown(38)) { if(podeMover(jogador.x,jogador.y-4,jogador.raio)) jogador.y-=4; }
  if (keyIsDown(83)||keyIsDown(40)) { if(podeMover(jogador.x,jogador.y+4,jogador.raio)) jogador.y+=4; }
  if (keyIsDown(65)||keyIsDown(37)) { if(podeMover(jogador.x-4,jogador.y,jogador.raio)) jogador.x-=4; }
  if (keyIsDown(68)||keyIsDown(39)) { if(podeMover(jogador.x+4,jogador.y,jogador.raio)) jogador.x+=4; }
  if (teclaJ) atirar();

  if (!teclaE && keyIsDown(69)) teclaE=true;
  if (teclaE && !eAnterior) pedirAjuda();
  eAnterior = teclaE;
  if (!keyIsDown(69)) teclaE=false;

  if (jogador.inv>0) jogador.inv--;

  for (let i=tiros.length-1;i>=0;i--) {
    const t=tiros[i]; t.x+=t.vx; t.y+=t.vy; t.vida--;
    for (let j=zumbis.length-1;j>=0;j--) {
      const z=zumbis[j];
      if (dist(t.x,t.y,z.x,z.y)<z.raio) {
        z.vida-=25; tiros.splice(i,1);
        if (z.vida<=0) {
          sangueNoChao.push({x:z.x,y:z.y,tam:28}); zumbis.splice(j,1); zumbisMortos++; moedas+=10;
        }
        break;
      }
    }
    if (tiros[i] && (t.vida<=0||!podeMover(t.x,t.y,2))) tiros.splice(i,1);
  }

  for (let i=zumbis.length-1;i>=0;i--) {
    const z=zumbis[i]; let ang=atan2(jogador.y-z.y,jogador.x-z.x);
    z.ang=lerpAngle(z.ang,ang,0.08);
    z.x+=cos(z.ang)*z.vel*(z.corredor?1.8:1)*(z.boss?0.65:1);
    z.y+=sin(z.ang)*z.vel*(z.corredor?1.8:1)*(z.boss?0.65:1);
    if (dist(jogador.x,jogador.y,z.x,z.y)<jogador.raio+z.raio) {
      if (jogador.inv<=0) { vidas-=z.boss?18:7; jogador.inv=45; }
    }
  }

  atualizarCivis(); atualizarCasas();
  if (vidas<=0) { vidas=0; recorde=max(recorde,round); modo="GAMEOVER"; }
  if (zumbis.length===0) passarRound();

  const lim=modoLeve?30:100;
  if (sangueNoChao.length>lim) sangueNoChao.splice(0,sangueNoChao.length-lim);
  if (tiros.length>300) tiros.splice(0,tiros.length-300);
}

function lerpAngle(a,b,t) { return a+atan2(sin(b-a),cos(b-a))*t; }

function pedirAjuda() {
  for (const c of casas) {
    if (c.habitada && dist(jogador.x,jogador.y,c.x+c.w/2,c.y+c.h/2)<220) {
      if (c.ajudaRound!==round) { c.ajudaRound=round; munição+=45; vidas=min(vidaMax,vidas+20);
        avisoEvento("SUPRIMENTOS! +45 MUNIÇÃO, +20 VIDA",color(255,220,90)); }
      else avisoEvento("MORADORES JÁ AJUDARAM NESTE ROUND",color(255,200,80));
      return;
    }
  }
}

function atualizarCivis() {
  for (let i=civis.length-1;i>=0;i--) {
    const c=civis[i]; let ameaca=null,dm=420;
    for (const z of zumbis) { const d=dist(c.x,c.y,z.x,z.y); if(d<dm){dm=d;ameaca=z;} }
    let casa=null,dd=2600;
    for (const csa of casas) if(csa.habitada){const d=dist(c.x,c.y,csa.x+csa.w/2,csa.y+csa.h/2);if(d<dd){dd=d;casa=csa;}}
    let alvo= c.ang,vel=1.2;
    if (ameaca) { alvo=atan2(c.y-ameaca.y,c.x-ameaca.x); vel=3.2; }
    else if (casa) { alvo=atan2(casa.y+casa.h-c.y,casa.x+casa.w/2-c.x); vel=2.2; }
    c.ang=lerpAngle(c.ang,alvo,0.12); c.fase+=0.25;
    if(podeMover(c.x+cos(c.ang)*vel,c.y,12)) c.x+=cos(c.ang)*vel;
    if(podeMover(c.x,c.y+sin(c.ang)*vel,12)) c.y+=sin(c.ang)*vel;

    for (const z of zumbis) {
      if(dist(c.x,c.y,z.x,z.y)<z.raio+10){ sangueNoChao.push({x:c.x,y:c.y,tam:34}); civisPerdidos++; civis.splice(i,1); avisoEvento("UM SOBREVIVENTE FOI PEGO!",color(255,80,80)); break; }
    }
    if(civis[i] && casa && dist(c.x,c.y,casa.x+casa.w/2,casa.y+casa.h)<38){civisSalvos++;moedas+=40;civis.splice(i,1);avisoEvento("SOBREVIVENTE ABRIGADO! +$40",color(90,255,140));}
  }
}

function atualizarCasas() {
  for (const c of casas) {
    if(!c.habitada || c.caida) continue;
    let sofrendo=false;
    for(const z of zumbis){
      const px=constrain(z.x,c.x,c.x+c.w), py=constrain(z.y,c.y,c.y+c.h);
      if(dist(z.x,z.y,px,py)<30+z.raio*.3){ c.integ-=z.boss?.12:(z.corredor?.025:.03); sofrendo=true; }
    }
    if(!sofrendo) c.integ=min(c.integMax,c.integ+.02);
    if(c.integ<=0){c.caida=true;c.habitada=false;abrigosCaidos++;avisoEvento("O ABRIGO FOI INVADIDO!",color(255,60,60));}
  }
}

function mousePressed() { if (modo === "INICIO") { reiniciarJogo(); return; } if (modo === "JOGO") teclaJ=true; }
function mouseReleased() { teclaJ=false; }

function draw() {
  background(18,24,18);
  if (modo === "INICIO") { desenharInicio(); return; }
  if (modo === "GAMEOVER") { desenharGameOver(); return; }
  if (modo === "FINAL") { desenharFinal(); return; }

  atualizarJogo(); desenharMapa(); desenharCasas(); desenharSangue();
  desenharCivis(); desenharZumbis(); desenharJogador(); desenharTiros(); desenharHUD();
}

function desenharMapa() {
  push(); translate(-jogador.x+width/2,-jogador.y+height/2);
  noStroke(); fill(modoLeve?color(24,34,20):color(28,42,23)); rect(-2000,-2000,4000,4000);
  if(!modoLeve){stroke(45,65,38,100);strokeWeight(1);for(let x=-2000;x<2000;x+=150)line(x,-2000,x,2000);for(let y=-2000;y<2000;y+=150)line(-2000,y,2000,y);}
  pop();
}

function telaPosicao(x,y) { return {x:width/2+(x-jogador.x),y:height/2+(y-jogador.y)}; }

function desenharCasas() {
  for(const c of casas){
    const p=telaPosicao(c.x+c.w/2,c.y+c.h/2);
    const px=p.x-c.w/2,py=p.y-c.h/2;
    push(); translate(px,py);
    fill(c.caida?color(35,28,23):color(c.habitada?92:70, c.habitada?66:70, c.habitada?45:42)); stroke(20);rect(0,0,c.w,c.h,4);
    fill(20);rect(c.w*.38,c.h*.60,c.w*.24,c.h*.40);
    if(c.habitada&&!c.caida){fill(255,190,70);rect(c.w*.16,c.h*.25,22,18);rect(c.w*.68,c.h*.25,22,18);}
    if(c.habitada&&c.integ<c.integMax){fill(0,180);rect(15,-18,c.w-30,8);fill(c.integ/c.integMax>.4?color(80,220,120):color(255,70,60));rect(15,-18,(c.w-30)*c.integ/c.integMax,8);}
    pop();
  }
}

function desenharSangue() { if(modoLeve&&sangueNoChao.length>30)return;noStroke();fill(120,20,20,180);for(const s of sangueNoChao){const p=telaPosicao(s.x,s.y);ellipse(p.x,p.y,s.tam,s.tam*.55);} }

function desenharJogador() {
  push(); translate(width/2,height/2); rotate(anguloJogador); fill(jogador.inv>0&&frameCount%8<4?color(255,120,120):color(0,220,255)); noStroke();ellipse(0,0,38,38);fill(20);rect(12,-5,28,10);pop();
}
function desenharTiros() { stroke(255,220,120);strokeWeight(4);for(const t of tiros){const p=telaPosicao(t.x,t.y);point(p.x,p.y);} }

function desenharZumbis() {
  for(const z of zumbis){const p=telaPosicao(z.x,z.y);push();translate(p.x,p.y);rotate(z.ang);fill(z.boss?color(120,20,170):z.corredor?color(180,50,50):color(70,145,70));stroke(20);ellipse(0,0,z.raio*2,z.raio*2);fill(220,220,160);ellipse(z.raio*.55,-z.raio*.25,z.raio*.38,z.raio*.38);ellipse(z.raio*.55,z.raio*.25,z.raio*.38,z.raio*.38);pop();}
}

function desenharCivis() {
  noStroke();textAlign(CENTER,CENTER);textSize(12);
  for(const c of civis){const p=telaPosicao(c.x,c.y);fill(c.cor);ellipse(p.x,p.y,22,22);fill(235,190,150);ellipse(p.x,p.y-16,14,14);fill(255,240);text("!",p.x,p.y-32);}
}

function desenharHUD() {
  resetMatrix(); noStroke();fill(0,180);rect(12,12,250,82,8);
  fill(255);textAlign(LEFT,CENTER);textSize(15);text("ROUND "+round+"  |  VIDA "+max(0,vidas)+"/"+vidaMax,26,32);text("MUNIÇÃO "+munição+"  |  $"+moedas,26,54);text("ABRIGADOS "+civisSalvos+"  |  PERDIDOS "+civisPerdidos,26,76);

  for(const c of casas) if(c.habitada){const p=telaPosicao(c.x+c.w/2,c.y+c.h/2);if(p.x>0&&p.x<width&&p.y>0&&p.y<height){fill(255,200,60);rect(p.x-4,p.y-4,8,8);}}
  for(const c of civis){const p=telaPosicao(c.x,c.y);if(p.x>0&&p.x<width&&p.y>0&&p.y<height){fill(255);ellipse(p.x,p.y,5,5);}}

  if(msgRadio.tempo>0){msgRadio.tempo--;fill(0,220);rect(width/2-320,55,640,46,8);fill(120,255,170);textAlign(CENTER,CENTER);textSize(13);text(msgRadio.texto,width/2-300,60,600,36);}
  if(msgEvento.tempo>0){msgEvento.tempo--;fill(msgEvento.cor);textAlign(CENTER,CENTER);textSize(18);text(msgEvento.texto,width/2,height*.3);}

  fill(255,170);textAlign(LEFT,BOTTOM);textSize(12);text("FPS "+floor(frameRate())+" | WASD mover | J atirar | E ajuda | P modo leve",14,height-16);
}

function desenharInicio() {
  background(5,8,12);fill(255,220,90);textAlign(CENTER,CENTER);textSize(min(48,width*.07));text("VERDÁLIA",width/2,height*.25);
  fill(220);textSize(18);text("LABORATÓRIO VERDÁLIA — A CIDADE CAIU",width/2,height*.36);
  textSize(15);text("Proteja os moradores, resgate civis e sobreviva até o amanhecer.",width/2,height*.43);
  fill(255,220,90);rect(width/2-130,height*.55,260,55,8);fill(20);textSize(20);text("CLIQUE PARA COMEÇAR",width/2,height*.55+27);
  fill(180);textSize(13);text("WASD / setas • J atirar • E pedir ajuda • P modo leve",width/2,height*.70);
}

function desenharGameOver() {
  background(30,0,0);fill(255,50,50);textAlign(CENTER,CENTER);textSize(52);text("VOCÊ MORREU",width/2,height*.2);
  fill(220);textSize(18);text("Round alcançado: "+round+"  |  Recorte: "+recorde,width/2,height*.42);text("Abrigados: "+civisSalvos+"  |  Perdidos: "+civisPerdidos,width/2,height*.48);text("Abrigos caídos: "+abrigosCaidos,width/2,height*.54);
  fill(255,220,90);text("APERTE I PARA JOGAR NOVAMENTE",width/2,height*.68);
}

function desenharFinal() {
  finalTimer++;let p=constrain(finalTimer/360,0,1);background(lerpColor(color(8,10,18),color(255,170,90),p));
  fill(255,230,160,220);ellipse(width/2,height*.24-p*height*.12,120,120);
  fill(20,40,20);rect(0,height*.72,width,height*.28);
  const titulos=["O AMANHECER SOLITÁRIO","ALVORADA","A VOZ DO FUNGO"];
  fill(255,220,90);textAlign(CENTER,CENTER);textSize(min(38,width*.05));text(titulos[finalTipo],width/2,height*.12);
  fill(255);textSize(min(18,width*.018));text("Abrigados: "+civisSalvos+"  |  Perdidos: "+civisPerdidos+"  |  Abrigos caídos: "+abrigosCaidos,width/2,height*.82);
  if(finalTimer>540){fill(255,220,90);text("ENTER: CONTINUAR   |   I: JOGAR DE NOVO",width/2,height*.92);}
}
