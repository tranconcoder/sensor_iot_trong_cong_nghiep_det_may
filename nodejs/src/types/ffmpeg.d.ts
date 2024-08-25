import { ObjectAnyType } from './object';

export interface ConfigFilterVideo extends ObjectAnyType<string | number> {
	fontcolor: string;
	fontfile: string;
	fontsize: number;
	text: string;
	x: number;
	y: number;
}
