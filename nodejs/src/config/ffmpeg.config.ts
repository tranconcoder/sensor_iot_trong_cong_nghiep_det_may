import path from 'path';
import fs from 'fs';
import { format } from 'date-fns';

const fps = 5;
export const WIDTH = 640;
export const HEIGHT = 480;
export const INPUT_FPS = fps;
export const OUTPUT_FPS = fps;
export const getEsp32CamSecurityGateSourcePath = () => {
	const directoryPath = path.join(
		__dirname,
		`../assets/videos/esp32_security_gate_cam/`
	);
	const timestamp = format(new Date(), 'ddMMyy_HH_mm_ss');

	if (!fs.existsSync(directoryPath)) fs.mkdirSync(directoryPath);

	return path.join(directoryPath, `security_gate_${timestamp}.mp4`);
};
