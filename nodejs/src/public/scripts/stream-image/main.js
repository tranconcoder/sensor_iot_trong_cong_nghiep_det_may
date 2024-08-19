// const ws = new WebSocket(
// 	'ws://192.168.0.185:3000?source=receive_image_from_server'
// );
const img = document.getElementById('image');

// ws.onmessage = (event) => {};

const b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
	const byteCharacters = atob(b64Data);
	const byteArrays = [];

	for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
		const slice = byteCharacters.slice(offset, offset + sliceSize);

		const byteNumbers = new Array(slice.length);
		for (let i = 0; i < slice.length; i++) {
			byteNumbers[i] = slice.charCodeAt(i);
		}

		const byteArray = new Uint8Array(byteNumbers);
		byteArrays.push(byteArray);
	}

	const blob = new Blob(byteArrays, { type: contentType });
	return blob;
};

var oReq = new XMLHttpRequest();
oReq.open('GET', 'http://192.168.0.185:3000/stream/security-gate-cam', true);
oReq.setRequestHeader(
	'Content-Type',
	'multipart/x-mixed-replace; boundary=123456789000000000000987654321'
);
oReq.onreadystatechange = function () {
	if (oReq.readyState == 3) {
		const allChunk = oReq.responseText.split(
			'---123456789000000000000987654321'
		);

		const lastChunk = allChunk.at(-1).split('\r\n');
		const chunkData = lastChunk[4];

		img.src = chunkData;
	}
};
oReq.send();

// fetch('http://192.168.0.185:3000/stream/security-gate-cam', {
// 	headers: {
// 		'Content-Type':
// 			'multipart/x-mixed-replace; boundary=123456789000000000000987654321',
// 	},
// })
// 	.then((res) => res.text())
// 	.then((base64) => {
// 		console.log(base64);
// 		img.src = base64;
// 	})
// 	.catch(console.err);
