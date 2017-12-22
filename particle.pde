final int num_particle_sqrt = 512; // 描画するパーティクルの数の平方根
final int perl_mat_size_sqrt = 32; // パーリンノイズ画像の解像度の平方根
final float perl_frequency = 3.0f; // パーリンノイズの周波数
final float perl_speed = 0.6f; // パーリンノイズの変化速度
final float vect_scale = 30.0f; // 速度場の速度係数
final float part_redu = 0.004f; // パーティクルのリセットまでの速度
final float part_gen_size = 8.0f; // パーティクルの生成される半径

float time; // 経過時間
PGraphics perl_noise_mat; // パーリンノイズ画像
PGraphics vector_mat; // 速度場配列バッファ
PGraphics pos_mat; // パーティクル座標、サイズ配列バッファ
PShader perl_noise_sd; // パーリンノイズ生成シェーダ
PShader vector_sd; // 速度場算出シェーダ
PShader init_particle_sd; // パーティクル制御シェーダ1
PShader particle1_sd; // パーティクル制御シェーダ1(座標、サイズ更新用)
PShader particle2_sd; // パーティクル制御シェーダ2(サイズが0になったパーティクルのリセット用)
PShader point_sd; // パーティクル描画シェーダ
PShape index_shape; // パーティクル描画シェーダの頂点テクスチャフェッチ(VTF)のインデックス代入用

// ノイズ視覚化用
PGraphics view_noise_mat;
PShader view_noise_sd;

// アルゴリズム参考URL : https://github.com/keijiro/DFNoiseTest
// 技術参考URL : https://wgld.org/d/webgl/w071.html
// 技術参考URL : https://forum.processing.org/two/discussion/1071/point-clouds-in-processing-2-1-with-opengl
// Processingのコード、シェーダ等は全て自作です

void setup() {
  // ウィンドウ生成
  size(512, 512, OPENGL);
  frameRate(60.0f);
  
  // ローディング画面一時表示
  background(30, 30, 30, 255);
  fill(0, 128, 198, 255);
  textSize(48);
  textAlign(CENTER, CENTER);
  text("now loading", width / 2, height / 2);
  
  // 変数初期化
  time = 0.0f;
  
  // インスタンス生成
  perl_noise_mat = createGraphics( perl_mat_size_sqrt, perl_mat_size_sqrt, OPENGL);
  vector_mat = createGraphics( perl_noise_mat.width, perl_noise_mat.height, OPENGL);
  pos_mat = createGraphics(num_particle_sqrt, num_particle_sqrt * 2, OPENGL);
  perl_noise_sd = loadShader("perl_noise.frag");
  vector_sd = loadShader("vector.frag");
  init_particle_sd = loadShader("init_particle.frag");
  particle1_sd = loadShader("particle1.frag");
  particle2_sd = loadShader("particle2.frag");
  point_sd = loadShader("point.frag", "point.vert");
  index_shape = createShape();
  
  // シェーダ変数代入
  perl_noise_sd.set("reso", (float)perl_noise_mat.width, (float)perl_noise_mat.height);
  perl_noise_sd.set("frequency", perl_frequency);
  perl_noise_sd.set("speed", perl_speed);
  vector_sd.set("reso", (float)vector_mat.width, (float)vector_mat.height);
  init_particle_sd.set("reso", (float)pos_mat.width, (float)pos_mat.height);
  init_particle_sd.set("part_gen_size", part_gen_size);
  particle1_sd.set("reso", (float)pos_mat.width, (float)pos_mat.height);
  particle1_sd.set("vect_scale", vect_scale);
  particle1_sd.set("part_redu", part_redu);
  particle2_sd.set("scr_reso", (float)width, (float)height);
  particle2_sd.set("pos_reso", (float)pos_mat.width, (float)pos_mat.height);
  particle2_sd.set("part_gen_size", part_gen_size);
  particle2_sd.set("part_gen_point", ((float)width)/2.0f, ((float)height)/2.0f);
  point_sd.set("mat_reso", (float)pos_mat.width, (float)pos_mat.height);
  point_sd.set("scr_reso", (float)width, (float)height);
  
  // point_sdのVTFインデックス用頂点生成
  index_shape.beginShape(POINTS);
  index_shape.noFill();
  index_shape.stroke(30, 30, 30, 255);
  for (int i = 0; i < pos_mat.width; i++) {
    for (int j = 0; j < pos_mat.height / 2; j++) {
      index_shape.vertex((float)i, (float)j);
    }
  }
  index_shape.endShape();
  
  // パーティクル座標、サイズの初期化
  pos_mat.beginDraw();
  init_particle_sd.set("time", 0.0f);
  pos_mat.filter(init_particle_sd);
  pos_mat.endDraw();
  
  // ノイズ視覚化用
  view_noise_mat = createGraphics( perl_noise_mat.width, perl_noise_mat.height, OPENGL);
  view_noise_sd = loadShader("view_noise.frag");
  view_noise_sd.set("reso", (float)view_noise_mat.width, (float)view_noise_mat.height);
}

void draw() {
  // 経過時間更新
  time += 1.0f / frameRate;
  
  // パーリンノイズ更新
  perl_noise_mat.beginDraw();
  perl_noise_sd.set("time", time);
  perl_noise_mat.filter(perl_noise_sd);
  perl_noise_mat.endDraw();

  // 速度場更新
  vector_mat.beginDraw();
  vector_sd.set("noise_mat", perl_noise_mat);
  vector_mat.filter(vector_sd);
  vector_mat.endDraw();

  // パーティクル座標更新
  pos_mat.beginDraw();
  particle1_sd.set("vec_mat", vector_mat);
  particle1_sd.set("pos_mat", pos_mat);
  pos_mat.filter(particle1_sd);
  pos_mat.endDraw();

  // サイズ0のパーティクルをリセット
  pos_mat.beginDraw();
  particle2_sd.set("pos_mat", pos_mat);
  particle2_sd.set("time", time);
  particle2_sd.set("scr_reso", (float)width, (float)height);
  if (mousePressed == true) particle2_sd.set("part_gen_point", (float)mouseX, (float)mouseY);
  else particle2_sd.set("part_gen_point", ((float)width)/2.0f, ((float)height)/2.0f);
  pos_mat.filter(particle2_sd);
  pos_mat.endDraw();
  
  // ノイズ視覚化
  view_noise_mat.beginDraw();
  view_noise_sd.set("noise_mat", perl_noise_mat);
  view_noise_mat.filter(view_noise_sd);
  view_noise_mat.endDraw();

  // 背景初期化
  background(30, 30, 30, 255);
  
  if (keyPressed == true) image(view_noise_mat, 0, 0, width, height);

  // パーティクルの描画
  point_sd.set("scr_reso", (float)width, (float)height);
  point_sd.set("pos_mat", pos_mat);
  shader(point_sd);
  shape(index_shape);
  resetShader();

  // フレームレートの表示
  fill(0, 128, 198, 255);
  noStroke();
  textSize(20.0f);
  textAlign(LEFT, TOP);
  text("fps : " + String.valueOf(frameRate), 10, 25);
}