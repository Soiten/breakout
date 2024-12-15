let blocos;
let bola;
let barra;
let tela = "inicio";
let optionPointer = 1;
let partsAtuais = [];
let fadeFrame;

let premio, like;

const LARGURA = 35,
  ALTURA = 20,
  QUANT_BLOCOS = 5;

function preload() {
  premio = loadImage("vitoria.jpg");
  like = loadImage("like.png");
}

function setup() {
  createCanvas(600, 600);
  // randomSeed(99);
  novoJogo(tela);
}

function draw() {
  background(0);
  if (tela == "inicio") {
    titulo();
    mostrarOpcoes();
  } else if (tela == "jogo") {
    bola.display();
    bola.update();
    blocos.exibirBlocos();
    barra.display();
    barra.update();
    gerenciaParticulas();
    if (bola.vidas <= 0) tela = "gameover";
    if (blocos.getRemaining() == 0) transicao();
  } else if (tela == "instrucoes") {
    mostrarRegras();
  } else if (tela == "gameover") {
    mostraGameover();
  } else if (tela == "vitoria") {
    mostraVitoria();
  }
}

function keyPressed() {
  if (tela == "inicio") {
    if (keyCode == UP_ARROW) {
      optionPointer--;
    } else if (keyCode == DOWN_ARROW) {
      optionPointer++;
    }
    optionPointer = max(optionPointer, 1);
    optionPointer = min(optionPointer, 2);
    if (keyCode == ENTER || key == " ") {
      if (optionPointer == 1) tela = "jogo";
      else if (optionPointer == 2) tela = "instrucoes";
    }
  } else if (tela == "instrucoes") {
    if (key == "b") tela = "inicio";
  } else if (tela == "gameover") {
    if (key == "r") {
      novoJogo("jogo");
    }
  }
}

function titulo() {
  textAlign(CENTER);
  fill("white");
  textSize(49);
  text("BREAKOUT", width / 2, height * 0.3);
  fill(10);
  textSize(48);
  text("BREAKOUT", width / 2, height * 0.3 - 2);
}

function mostrarOpcoes() {
  let x = width * 0.08,
    y = height * 0.85,
    h = height - y;
  let n = 2,
    distancia = h / (n + 1);
  textSize(25);
  textAlign(LEFT);
  fill(255);
  triangle(
    x - 5,
    y + distancia * optionPointer,
    x - 20,
    y + distancia * optionPointer - 5,
    x - 20,
    y + distancia * optionPointer + 5
  );
  text("Novo jogo", x, y + distancia + 5);
  text("Como jogar?", x, y + distancia * 2 + 5);
}

function mostrarRegras() {
  textAlign(CENTER);
  textSize(24);
  fill(10);
  rect(width * 0.105, height * 0.15, width * 0.78, height * 0.65);
  fill(255);
  text(
    "Seu objetivo nesse jogo é destruir todos os bloquinhos coloridos na tela\n\nVocê tem três vidas\n\nVocê pode aplicar uma velocidade na bolinha se segurar a direção no momento do impacto\n\nA bola aumenta a velocidade vertical conforme vai rebatendo na barra",
    width * 0.12,
    height * 0.2,
    width * 0.75
  );
  text("Pressione 'b' para voltar", width * 0.12, height * 0.9, width * 0.75);
}

function mostraGameover() {
  fill(255);
  textAlign(CENTER);
  text(
    "Você perdeu :(\n\nAperte 'r' para tentar novamente",
    width * 0.12,
    height / 2,
    width * 0.75
  );
}

function mostraVitoria() {
  image(premio, 0, 0, width, height);
  fill(0);
  image(like, -width * 0.08, height * 0.35, width / 1.8, height / 1.8);
  image(like, width * 0.5, height * 0.35, width / 1.8, height / 1.8);
  rect(width * 0.4, 0, width * 0.5, height * 0.1);
  rect(width * 0.5, height * 0.8, width * 0.4, height * 0.2);
  textSize(80);
  fill("chocolate");
  text("PARABéS ! !", width * 0.12, height / 2);
}

function novoJogo(valor) {
  colorMode(HSB, 360, 100, 100);
  noStroke();

  bola = new Bola(width / 2, height * 0.8, 7);
  blocos = new SistemaBlocos();
  barra = new Barra(80, 20);
  partsAtuais = [];
  //gera as posições dos blocos
  if (QUANT_BLOCOS == -1)
    for (let x = 0; x <= width - LARGURA; x += LARGURA) {
      for (let y = 0; y <= height * 0.7 - ALTURA; y += ALTURA)
        blocos.addBloco(new Bloco(x, y, LARGURA, ALTURA));
    }
  else
    for (let i = 0; i < QUANT_BLOCOS; i++) {
      blocos.addBloco(
        new Bloco(
          floor(random(width / LARGURA)) * LARGURA,
          floor(random((height * 0.7) / ALTURA)) * ALTURA,
          LARGURA,
          ALTURA
        )
      );
    }
  tela = valor;
}

function transicao() {
  if (fadeFrame == undefined) fadeFrame = frameCount;
  bola.slowMo();
  if (frameCount % 15 == 0)
    new Particulas(
      random(width),
      random(height),
      20,
      random([0, 120, 300]),
      3,
      0,
      1,
      TWO_PI,
      0.01
    );
  let pct = ((frameCount - fadeFrame) / 240) ** 4;
  fill(0, 0, 100, pct);
  rect(0, 0, width, height);
  if (pct >= 1) {
    tela = "vitoria";
  }
}

function gerenciaParticulas() {
  let tamanho = partsAtuais.length;
  for (let i = 0; i < tamanho; i++) {
    partsAtuais[i].update();
    if (partsAtuais[i].ended) {
      partsAtuais.splice(i, 1);
      tamanho--;
    }
  }
}

class Bloco {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.hue = map(this.y, 0, height * 0.7, 0, 360);
  }

  checkCollision(ball) {
    let dadosColisao = {
      colidiu: false,
      vertical: "meio",
      horizontal: "meio",
      ponto: undefined,
    };

    let testeX = ball.pos.x;
    let testeY = ball.pos.y;

    if (ball.pos.x < this.x) {
      testeX = this.x;
      dadosColisao.horizontal = "esquerda";
    }
    if (ball.pos.x > this.x + this.w) {
      testeX = this.x + this.w;
      dadosColisao.horizontal = "direita";
    }

    if (ball.pos.y < this.y) {
      testeY = this.y;
      dadosColisao.vertical = "cima";
    }
    if (ball.pos.y > this.y + this.h) {
      testeY = this.y + this.h;
      dadosColisao.vertical = "baixo";
    }

    dadosColisao.ponto = createVector(testeX, testeY);

    if (dist(ball.pos.x, ball.pos.y, testeX, testeY) < ball.r) {
      dadosColisao.colidiu = true;
      new Particulas(
        testeX,
        testeY,
        8,
        60,
        5,
        atan2(-ball.pos.y + testeY, -ball.pos.x + testeX),
        3,
        0.65,
        0.02,
        7
      );
    }

    return dadosColisao;
  }

  display() {
    fill(this.hue, 100, 100);
    rect(this.x, this.y, this.w, this.h);
  }
}

class SistemaBlocos {
  constructor() {
    this.blocos = [];
  }

  addBloco(bloco) {
    this.blocos.push(bloco);
  }

  colisoes(bola) {
    const quemColidiu = { index: undefined, dados: undefined };
    this.blocos.forEach((bloco, i) => {
      const dados = bloco.checkCollision(bola);
      if (dados.colidiu) {
        quemColidiu.index = i;
        quemColidiu.dados = dados;
      }
    });
    return quemColidiu;
  }

  removerBloco(index) {
    this.blocos.splice(index, 1);
  }

  exibirBlocos() {
    this.blocos.forEach((bloco) => {
      bloco.display();
    });
  }

  getRemaining() {
    return this.blocos.length;
  }
}

class Bola {
  constructor(x, y, r) {
    this.pos = createVector(x, y);
    this.r = r;
    this.vel = createVector(0, 3);
    this.breakTimer = 45;
    this.vidas = 4;
  }

  display() {
    fill(255);
    circle(this.pos.x, this.pos.y, this.r * 2);
    //desenha vidas
    for (let i = 0; i < this.vidas - 1; i++)
      circle(20, height - i * 20 - 20, 12);
  }

  update() {
    if (this.breakTimer > 0) {
      if (this.breakTimer % 5 == 0)
        new Particulas(this.pos.x, this.pos.y, 2, -1, 1, 0, 0, TWO_PI);
      this.breakTimer--;
      return;
    }

    this.pos.add(this.vel);

    //colisao com blocos
    let colisor = blocos.colisoes(this);
    if (typeof colisor.index !== "undefined") {
      blocos.removerBloco(colisor.index);

      if (colisor.dados.vertical == "cima") {
        this.vel.y = -abs(this.vel.y);
      } else if (colisor.dados.vertical == "baixo") {
        this.vel.y = abs(this.vel.y);
      }

      if (colisor.dados.horizontal == "esquerda") {
        this.vel.x = -abs(this.vel.x);
      } else if (colisor.dados.horizontal == "direita") {
        this.vel.x = abs(this.vel.x);
      }
    }

    //colisao com bordas da tela
    if (this.pos.x - this.r < 0) {
      this.pos.x = this.r;
      this.vel.x *= -1;
    }
    if (this.pos.y - this.r < 0) {
      this.pos.y = this.r;
      this.vel.y *= -1;
    }
    if (this.pos.y - this.r > height + 30) {
      this.reset();
    }
    if (this.pos.x + this.r > width) {
      this.pos.x = width - this.r;
      this.vel.x *= -1;
    }

    //colisao barra
    if (barra.checkCollision(this).colidiu) {
      let r = random(0.1);
      this.vel.y = -abs(this.vel.y) - r;
      //efeito de aumentar a velocidade
      if (keyIsDown(LEFT_ARROW)) this.vel.x -= 0.5 + r;
      if (keyIsDown(RIGHT_ARROW)) this.vel.x += 0.5 + r;
    }
  }

  reset() {
    new Particulas(
      this.pos.x,
      this.pos.y - 20,
      20,
      0,
      this.vel.mag() * 1.1,
      1.5 * PI,
      5,
      0.3
    );
    this.pos = createVector(width / 2, 0.8 * height);
    this.breakTimer = 60;
    this.vel.x = 0;
    this.vidas--;
  }

  // congelar() {
  //   this.breakTimer = 600;
  // }
  slowMo() {
    this.vel.setMag(0.3);
  }
}

class Barra extends Bloco {
  constructor(largura = 70, altura = 10) {
    // let largura = 70;
    let x = width / 2 - largura / 2;
    super(x, height * 0.9, largura, altura);
  }

  display() {
    fill(255);
    rect(this.x, this.y, this.w, this.h);
  }

  update() {
    if (keyIsDown(LEFT_ARROW)) this.x -= 5;
    if (keyIsDown(RIGHT_ARROW)) this.x += 5;
    this.x = max(0, this.x);
    this.x = min(this.x, width - this.w);
  }
}

class Particulas {
  constructor(
    x,
    y,
    quantidade = 1,
    hue = 0,
    vel = 1,
    velAngle = 0,
    velDecrease = 0,
    spread = 0,
    lifetimeDecrease = 0.02,
    size = 7
  ) {
    this.parts = [];
    this.hue = hue;
    this.ended = false;
    for (let i = 0; i < quantidade; i++) {
      this.parts[i] = {
        pos: createVector(x, y),
        lifetime: 1.0,
        decrease: lifetimeDecrease,
        size: size,
        vel: createVector(1, 0)
          .setMag(vel - random(velDecrease))
          .rotate(velAngle + random(-spread / 2, spread / 2)),
      };
    }
    partsAtuais.push(this);
  }

  update() {
    this.parts.forEach((part, i) => {
      part.lifetime -= part.decrease;
      part.pos.add(part.vel);
      if (part.lifetime <= 0) this.matarParticula(i);
    });
    this.display();
  }

  display() {
    fill(max(0, this.hue), this.hue >= 0 ? 100 : 0, 100);
    this.parts.forEach((part) => {
      circle(part.pos.x, part.pos.y, part.size * part.lifetime);
    });
  }

  matarParticula(i) {
    this.parts.splice(i, 1);
    if (this.parts.length == 0) this.ended = true;
  }
}
