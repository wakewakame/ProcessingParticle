#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

const float pi = 3.14159265;

uniform vec2 scr_reso;
uniform vec2 pos_reso;
uniform sampler2D pos_mat;
uniform float time;
uniform float part_gen_size;
uniform vec2 part_gen_point;

// 座標取得
vec2 getPosition(vec2 p){
	p.x /= pos_reso.x;
	p.y /= pos_reso.y;
	vec4 col = texture2D(pos_mat, p).rgba;
	vec2 req = vec2(
		col.r / pow(255.0, 0.0) +
		col.g / pow(255.0, 1.0),
		col.b / pow(255.0, 0.0) +
		col.a / pow(255.0, 1.0)
	);
	return req;
}
// サイズ取得
float getSize(vec2 p){
	p.x /= pos_reso.x;
	p.y /= pos_reso.y;
	vec4 col = texture2D(pos_mat, p).rgba;
	float req = 
		col.r / pow(255.0, 0.0) +
		col.g / pow(255.0, 1.0) +
		col.b / pow(255.0, 2.0) +
		col.a / pow(255.0, 3.0);
	return req;
}
// ノイズ取得
float getNoise(vec2 p){
	return fract(sin(dot(p ,vec2(12.9898,78.233))) * 43758.5453);
}

// サイズ0のパーティクルを初期化
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

	if (gl_FragCoord.y > pos_reso.y / 2.0){
		// 座標取得
		vec2 position = getPosition(gl_FragCoord.xy);
		// サイズ取得
		float size = getSize(gl_FragCoord.xy - vec2(0.0, pos_reso.y / 2.0));
		// サイズが0.0なら座標リセット
		if(size == 0.0) {
			// 座標初期化
			position = part_gen_point;
			position.x /= scr_reso.x;
			position.y /= scr_reso.y;
			// ノイズ取得
			vec2 noise = vec2(
				getNoise(gl_FragCoord.xy + vec2(time * 10.0)),
				getNoise(gl_FragCoord.xy - vec2(time * 10.0))
			);
			// part_gen_size以内に収まるノイズを生成
			vec2 get_noise = vec2(
				sin(noise.x * 2.0 * pi) * noise.y * (part_gen_size / scr_reso.x),
				cos(noise.x * 2.0 * pi) * noise.y * (part_gen_size / scr_reso.y)
			);
			// get_noiseをpositionに加算
			position += get_noise;
		}
		// 代入
		r = int(floor(position.x * pow(255.0, 1.0))) % 255;
		g = int(floor(position.x * pow(255.0, 2.0))) % 255;
		b = int(floor(position.y * pow(255.0, 1.0))) % 255;
		a = int(floor(position.y * pow(255.0, 2.0))) % 255;
	}
	else{
		// サイズ取得
		float size = getSize(gl_FragCoord.xy);
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