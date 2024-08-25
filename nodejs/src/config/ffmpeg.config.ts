import path from 'path';
import fs from 'fs';
import { format } from 'date-fns';

export const FRAMESIZES = {
	QCIF: '176x144',
	HQVGA: '240x176',
	_240X240: '240x240',
	QVGA: '320x240',
	CIF: '400x296',
	HVGA: '480x320',
	VGA: '640x480',
	SVGA: '800x600',
	XGA: '1024x768',
	HD: '1280x720',
};

export const getEsp32CamSecurityGateSourcePath = () => {
	const directoryPath = path.join(
		__dirname,
		`../assets/videos/esp32_security_gate_cam/`
	);
	const timestamp = format(new Date(), 'ddMMyy_HH_mm_ss');

	if (!fs.existsSync(directoryPath))
		fs.mkdirSync(directoryPath, { recursive: true });

	return path.join(directoryPath, `security_gate_${timestamp}.mp4`);
};
