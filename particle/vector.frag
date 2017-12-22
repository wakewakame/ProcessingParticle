#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

uniform vec2 reso;
uniform sampler2D noise_mat;

// ノイズ取得
float getNoise(vec2 p){
	p.x /= reso.x;
	p.y /= reso.y;
	vec4 col = texture2D(noise_mat, p).rgba;
	float req = 
		col.r / pow(255.0, 0.0) +
		col.g / pow(255.0, 1.0) +
		col.b / pow(255.0, 2.0) +
		col.a / pow(255.0, 3.0);
	return req;
}

// 黒->白ベクトル算出
vec2 getGradient(vec2 p){
	float n0 = getNoise(p);
	float n1 = getNoise(p + vec2(1.0 / (reso.x - 1.0), 0));
	float n2 = getNoise(p + vec2(0, 1.0 / (reso.y - 1.0)));
	vec2 req = vec2(n1 - n0, n2 - n0);
	req.x *= (reso.x - 1.0);
	req.y *= (reso.y - 1.0);
	return req;
}
// 黒->白ベクトルの法線ベクトル算出
vec2 getDFNoise(vec2 p){
	vec2 g = getGradient(p);
	return vec2(g.y, -g.x);
}

// ベクトル場生成
void main(void){
	// ベクトル場算出
	vec2 dp = getDFNoise(gl_FragCoord.xy) * 0.003;
	// ベクトルの原点を(0.5, 0.5)に変換
	dp += vec2(0.5, 0.5);

	// vec2型のdpを4分割してRGBAに格納する
	//|------------------------------|
	//|dp.x  : | xxxxxxxx | xxxxxxxx |
	//|color : | R        | G        |
	//|------------------------------|
	//|dp.y  : | xxxxxxxx | xxxxxxxx |
	//|color : | B        | A        |
	//|------------------------------|

	int r = int(floor(dp.x * pow(255.0, 1.0))) % 255;
	int g = int(floor(dp.x * pow(255.0, 2.0))) % 255;
	int b = int(floor(dp.y * pow(255.0, 1.0))) % 255;
	int a = int(floor(dp.y * pow(255.0, 2.0))) % 255;

	gl_FragColor = vec4(
		float(r) / 255.0,
		float(g) / 255.0,
		float(b) / 255.0,
		float(a) / 255.0
	);
}
