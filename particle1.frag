#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

uniform vec2 reso;
uniform sampler2D vec_mat;
uniform sampler2D pos_mat;
uniform float vect_scale;
uniform float part_redu;

// ベクトル取得
vec2 getVector(vec2 p){
	vec4 col = texture2D(vec_mat, p).rgba;
	vec2 req = vect_scale * (vec2(
		col.r / pow(255.0, 0.0) +
		col.g / pow(255.0, 1.0),
		col.b / pow(255.0, 0.0) +
		col.a / pow(255.0, 1.0)
	) - vec2(0.5, 0.5));
	return req;
}
// 座標取得
vec2 getPosition(vec2 p){
	p.x /= reso.x;
	p.y /= reso.y;
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
	p.x /= reso.x;
	p.y /= reso.y;
	vec4 col = texture2D(pos_mat, p).rgba;
	float req = 
		col.r / pow(255.0, 0.0) +
		col.g / pow(255.0, 1.0) +
		col.b / pow(255.0, 2.0) +
		col.a / pow(255.0, 3.0);
	return req;
}

// 移動
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
		// 座標取得
		vec2 position = getPosition(gl_FragCoord.xy);
		// 現在の座標の速度場取得
		vec2 vector = getVector(position);
		// 座標更新
		position += vector;
		position.x = clamp(position.x, 0.0, 1.0);
		position.y = clamp(position.y, 0.0, 1.0);
		// 代入
		r = int(floor(position.x * pow(255.0, 1.0))) % 255;
		g = int(floor(position.x * pow(255.0, 2.0))) % 255;
		b = int(floor(position.y * pow(255.0, 1.0))) % 255;
		a = int(floor(position.y * pow(255.0, 2.0))) % 255;
	}
	else{
		// サイズ取得
		float size = getSize(gl_FragCoord.xy);
		if(size == 0.0) size = 1.0f;
		// サイズ更新
		size -= part_redu;
		size = max(0.0, size);
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