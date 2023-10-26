'use strict';

var useReflexion = true;
var showStats = false;

// Handle different screen ratios
const mapVal = (value, min1, max1, min2, max2) => min2 + (value - min1) * (max2 - min2) / (max1 - min1);
var fovX = () => mapVal(window.innerWidth / window.innerHeight, 16/9, 9/16, 1.7, Math.PI / 3);

if (navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i)) {
	useReflexion = false;
	// Account for the searchbar
	fovX = () => mapVal(window.innerWidth / window.innerHeight, 16/9, 9/16, 1.5, Math.PI / 3);
}
var fovY = () => 2 * Math.atan(Math.tan(fovX() * 0.5) * window.innerHeight / window.innerWidth);

const Stats = require('stats.js');
var stats = new Stats();
stats.showPanel(0);
if (showStats) {
	document.body.appendChild( stats.dom );
}

let regl, map, drawMap, placement, drawPainting, fps;

// Agregar una pantalla de carga
const loadingScreen = document.createElement('div');
loadingScreen.style.position = 'absolute';
loadingScreen.style.top = '50%';
loadingScreen.style.left = '50%';
loadingScreen.style.transform = 'translate(-50%, -50%)'; // Centrar vertical y horizontalmente
loadingScreen.style.width = '100%';
loadingScreen.style.height = '100%';
loadingScreen.style.backgroundColor = 'gray'; // Puedes personalizar el color de fondo
loadingScreen.style.display = 'flex';
loadingScreen.style.justifyContent = 'center';
loadingScreen.style.alignItems = 'center';
loadingScreen.style.zIndex = '9999'; // Asegura que la pantalla de carga esté por encima de todo
loadingScreen.innerHTML = 'Cargando';
document.body.appendChild(loadingScreen);

// Textos para la animación de carga
const loadingTexts = ['Cargando', 'Cargando.', 'Cargando..', 'Cargando...'];
let currentTextIndex = 0;

const updateLoadingText = () => {
  loadingScreen.innerHTML = loadingTexts[currentTextIndex];
  currentTextIndex = (currentTextIndex + 1) % loadingTexts.length;
};

setInterval(updateLoadingText, 500); // Cambia el texto cada medio segundo

// Creamos una función para cargar el contenido
const loadContent = async () => {
	return new Promise(resolve => {
		
		setTimeout(() => {
			fps = require('./fps')(map, fovY);
			resolve();
		}, 2300); // Espera para la carga
			
		regl = require('regl')({
			extensions: [
				//'angle_instanced_arrays',
				'OES_element_index_uint',
				'OES_standard_derivatives'
			],
			optionalExtensions: [
				//'oes_texture_float',
				'EXT_texture_filter_anisotropic'
			],
			attributes: { alpha : false },
		});
			
		map = require('./map')();
		const mesh = require('./mesh');
		drawMap = mesh(regl, map, useReflexion);
		placement = require('./placement')(regl, map);
		drawPainting = require('./painting')(regl);
	});
};

const StartApp = async () => {
	await loadContent();

	document.body.removeChild(loadingScreen);
	// Quitamos la pantalla de carga después de eso

	const context = regl({
		cull: {
			enable: true,
			face: 'back'
		},
		uniforms: {
			view: fps.view,
			proj: fps.proj,
			yScale: 1.0
		}
	});
	
	const reflexion = regl({
		cull: {
			enable: true,
			face: 'front'
		},
		uniforms: {
			yScale: -1.0
		}
	});
	
	regl.frame(({
		time
	}) => {
		stats.begin();
		fps.tick({
			time
		});
		placement.update(fps.pos, fps.fmouse[1], fovX());
		regl.clear({
			color: [0, 0, 0, 1],
			depth: 1
		});
		context(() => {
			if (useReflexion) {
				reflexion(() => {
					drawMap();
					drawPainting(placement.batch());
				});
			}
			drawMap();
			drawPainting(placement.batch());
		});
		stats.end();
	});
};

StartApp();
