import ws from 'ws';

export interface WebSocket extends ws {
	id: string;
	source: string;
}
