"use strict";

//const $ = jQuery;
// Defaults
let defaultOptions = {
	format: 'image/png',
	quality: 0.92,
	width: undefined,
	height: undefined,
	Canvas: undefined,
	crossOrigin: undefined
}; // Return Promise

const mergeImages = (sources = [], options = {}) => new Promise(resolve => {
	options = Object.assign({}, defaultOptions, options); // Setup browser/Node.js specific variables

	const canvas = options.Canvas ? new options.Canvas() : window.document.createElement('canvas');
	const Image = options.Image || window.Image; // Load sources

	const images = sources.map(source => new Promise((resolve, reject) => {
		// Convert sources to objects
		if (source.constructor.name !== 'Object') {
			source = {
				src: source
			};
		} // Resolve source and img when loaded


		const img = new Image();
		img.crossOrigin = options.crossOrigin;

		img.onerror = () => reject(new Error('Couldn\'t load image'));

		img.onload = () => resolve(Object.assign({}, source, {
			img
		}));

		img.src = source.src;
	})); // Get canvas context

	const ctx = canvas.getContext('2d'); // When sources have loaded

	resolve(Promise.all(images).then(images => {
		// Set canvas dimensions
		const getSize = dim => options[dim] || Math.max(...images.map(image => image.img[dim]));

		canvas.width = getSize('width');
		canvas.height = getSize('height'); // Draw images to canvas

		images.forEach(image => {
			ctx.globalAlpha = image.opacity ? image.opacity : 1;
			return ctx.drawImage(image.img, image.x || 0, image.y || 0);
		});

		if (options.Canvas && options.format === 'image/jpeg') {
			// Resolve data URI for node-canvas jpeg async
			return new Promise((resolve, reject) => {
				canvas.toDataURL(options.format, {
					quality: options.quality,
					progressive: false
				}, (err, jpeg) => {
					if (err) {
						reject(err);
						return;
					}

					resolve(jpeg);
				});
			});
		} // Resolve all other data URIs sync


		return canvas.toDataURL(options.format, options.quality);
	}));
}); //end


function eventHandler() {
	//pure js
	let cTabs = document.querySelectorAll('.tabs-js');

	for (let tab of cTabs) {
		let Btns = tab.querySelectorAll('.tabs__btn');
		let contentGroups = tab.querySelectorAll('.tabs__wrap');

		for (let btn of Btns) {
			btn.addEventListener('click', function () {
				for (let btn of Btns) {
					btn.classList.remove('active');
				}

				this.classList.add('active');
				let index = getIndex(btn, Btns);

				for (let cGroup of contentGroups) {
					let contentItems = cGroup.querySelectorAll('.tabs__content');

					for (let item of contentItems) {
						item.classList.remove('active');
					}

					contentItems[index].classList.add('active');
				}
			});
		}
	}

	let imgRadios = document.querySelectorAll('.img-radio-js');
	let imgWraps = document.querySelectorAll('.cp-img-js');

	for (let radio of imgRadios) {
		radio.addEventListener('change', function () {
			let name = this.getAttribute('name');
			let thisGroup = document.querySelectorAll(".img-radio-js[name=\"".concat(name, "\"]"));
			let radioIndex = getIndex(this, thisGroup);
			let thisTabs = this.closest('.tabs-js');
			let thisWrap = this.closest('.tabs__content');
			let allWraps = thisTabs.querySelectorAll('.tabs__content');
			let wrapIndex = getIndex(thisWrap, allWraps);
			let thisImgsOver = imgWraps[wrapIndex].querySelectorAll('img');

			for (let img of thisImgsOver) {
				img.classList.remove('active');
			}

			thisImgsOver[radioIndex].classList.add('active'); //-shapeDownloadImg();

			shapeMergeArr();
		});
	}

	function getIndex(htmlEl, itemsNodeList) {
		for (let [itemIndex, item] of Object.entries(itemsNodeList)) {
			if (item === htmlEl) {
				return itemIndex;
			}
		}
	} //


	let mergeArr = [];

	function shapeMergeArr() {
		mergeArr = [];
		let baseImg = document.querySelector('.base-img-js');
		mergeArr.push(baseImg.src);

		for (let wrap of imgWraps) {
			let activeImg = wrap.querySelector('img.active');
			mergeArr.push(activeImg.src);
		}
	}

	shapeMergeArr();
	let downloadBtns = document.querySelectorAll('.download-btn-js');

	for (let btn of downloadBtns) {
		btn.addEventListener('click', function () {
			mergeImages(mergeArr).then(generatedImg => {
				let a = document.createElement('a');
				a.style.display = 'none';
				a.href = generatedImg; // the filename you want

				a.download = 'Макет';
				document.body.appendChild(a);
				a.click();
			});
		});
	}
}

;

if (document.readyState !== 'loading') {
	eventHandler();
} else {
	document.addEventListener('DOMContentLoaded', eventHandler);
}