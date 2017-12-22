#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

const float pi = 3.14159265;

uniform vec2 reso;
uniform float time;
uniform float part_gen_size;

// ノイズ取得
float getNoise(vec2 p){
	return fract(sin(dot(p ,vec2(12.9898,78.233))) * 43758.5453);
}

// 初期化
void main(void){
	
	// 画像の上半分をパーティクル座標配列、下半分をパーティクルサイズ配列とする
	//
	// vec2型のpositionを4分割してRGBAに格納する
	//|-----------------------------------|
	//|position.x : | xxxxxxxx | xxxxxxxx |
	//|color      : | R        | G        |
	//|-----------------------------------|
	//|position.y : | xxxxxxxx | xxxxxxxx |
	//|color      : | B        | A        |
	//|-----------------------------------|
	//
	// float型のsizeを4分割してRGBAに格納する
	//|----------------------------------------------------|
	//|size  : | xxxxxxxx | xxxxxxxx | xxxxxxxx | xxxxxxxx |
	//|color : | R        | G        | B        | A        |
	//|----------------------------------------------------|

	int r, g, b, a;

	if (gl_FragCoord.y > reso.y / 2.0){
		// 座標初期化
		vec2 position = vec2(0.5, 0.5);
		// ノイズ取得
		vec2 noise = vec2(
			getNoise(gl_FragCoord.xy + vec2(time * 10.0)),
			getNoise(gl_FragCoord.xy - vec2(time * 10.0))
		);
		// part_gen_size以内に収まるノイズを生成
		vec2 get_noise = vec2(
			sin(noise.x * 2.0 * pi) * noise.y * (part_gen_size / reso.x),
			cos(noise.x * 2.0 * pi) * noise.y * (part_gen_size / (reso.y / 2.0))
		);
		// get_noiseをpositionに加算
		position += get_noise;
		// 代入
		r = int(floor(position.x * pow(255.0, 1.0))) % 255;
		g = int(floor(position.x * pow(255.0, 2.0))) % 255;
		b = int(floor(position.y * pow(255.0, 1.0))) % 255;
		a = int(floor(position.y * pow(255.0, 2.0))) % 255;
	}
	else{
		// サイズをインデックスに比例して0.0から1.0の範囲で代入
		float size = (gl_FragCoord.y * reso.x + gl_FragCoord.x) / (gl_FragCoord.x * (gl_FragCoord.y / 2.0));
		// 代入
		r = int(floor(size * pow(255.0, 1.0))) % 255;
		g = int(floor(size * pow(255.0, 2.0))) % 255;
		b = int(floor(size * pow(255.0, 3.0))) % 255;
		a = int(floor(size * pow(255.0, 4.0))) % 255;
	}

	gl_FragColor = vec4(
		float(r) / 255.0,
		float(g) / 255.0,
		float(b) / 255.0,
		float(a) / 255.0
	);
}