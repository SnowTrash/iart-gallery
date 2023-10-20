'strict mode';

const api = require('../api_handler/api');
const selectedApi = new URLSearchParams(window.location.search).get("api");
const dataAccess = api[selectedApi] || api[api.default];
const text = require('./text');

let paintingCache = {};
let unusedTextures = [];


// cargar dinamicamente la imagen segun la resolución

// const dynamicQualThreshold = 2;
// function dynamicQual(quality) {
// 	if(!navigator.connection || navigator.connection.downlink < dynamicQualThreshold) {
// 		quality = (quality == 'high') ? 'mid' : 'low';
// 	}
// 	return quality;
// }

const resizeCanvas = document.createElement('canvas');
resizeCanvas.width = resizeCanvas.height = 2048;
const ctx = resizeCanvas.getContext('2d');
ctx.mozImageSmoothingEnabled = false;
ctx.webkitImageSmoothingEnabled = false;
let aniso = false;

const emptyImage = (regl) => [
	(unusedTextures.pop() || regl.texture)([[[200, 200, 200]]]),
	_=>(unusedTextures.pop() || regl.texture)([[[0, 0, 0, 0]]]),
	1
];

async function loadImage(regl, p) {
	if (aniso === false) {
		aniso = regl.hasExtension('EXT_texture_filter_anisotropic') ? regl._gl.getParameter(
			regl._gl.getExtension('EXT_texture_filter_anisotropic').MAX_TEXTURE_MAX_ANISOTROPY_EXT
		) : 0;
		console.log(aniso);
	}
	
	let image, title;
	try {
		// accesso a las imagenes de calidad dinamica
		// const data = await dataAccess.fetchImage(p, dynamicQual(res));
		
		const data = await dataAccess.fetchImage(p);
		title = data.title;

		// console.log("titulo desde image.js:  "+ title);

		// Resize image to a power of 2 to use mipmap (faster than createImageBitmap resizing)
		image = await createImageBitmap(data.image);
		ctx.drawImage(image, 0, 0, resizeCanvas.width, resizeCanvas.height);
	} catch(e) {
		// Try again with a lower resolution, otherwise return an empty image
		console.error(e);
		return emptyImage(regl);

		//linea de acceso a calidad dinámica
		// return res == "high" ? await loadImage(regl, p, "low") : emptyImage(regl);
	}

	return [(unusedTextures.pop() || regl.texture)({
			data: resizeCanvas,
			min: 'mipmap',
			mipmap: 'nice',
			aniso,
			flipY: true
		}),
		width=>text.init((unusedTextures.pop() || regl.texture), title, width),
		image.width / image.height
	];
}

let loadedTextures = [];

module.exports = {
	fetch: (regl, count = 10, res = "low", cbOne, cbAll) => {
		const from = Object.keys(paintingCache).length;
		dataAccess.fetchList(from, count).then(paintings => {
			count = paintings.length;
			paintings.map(p => {
				if (paintingCache[p.image_id]) {
					if (--count === 0)
						cbAll();
					return;
				}
				paintingCache[p.image_id] = p;
				loadImage(regl, p).then(([tex, textGen, aspect]) => {
					cbOne({ ...p, tex, textGen, aspect });
					if (--count === 0)
						cbAll();
				});
			})
		});
	},
	load: (regl, p) => {
		if (p.tex || p.loading)
			return;
		p.loading = true;
		loadImage(regl, p).then(([tex, textGen]) => {
			p.loading = false;
			p.tex = tex;
			p.text = textGen(p.width);
		});
	},
    unload: (p) => {
        if (p.tex && loadedTextures.includes(p.tex)) {
            p.tex.destroy();
            p.tex = undefined;
            loadedTextures = loadedTextures.filter(tex => tex !== p.tex);
        }
        if (p.text && loadedTextures.includes(p.text)) {
            p.text.destroy();
            p.text = undefined;
            loadedTextures = loadedTextures.filter(tex => tex !== p.text);
        }
    }
};