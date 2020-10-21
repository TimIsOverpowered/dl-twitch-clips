import io from 'socket.io-client';
import feathers from '@feathersjs/client';

const socket = io('https://clips.overpowered.tv:2053');
const client = feathers();

client.configure(feathers.socketio(socket, {
  timeout: 10 * 1000
}));
client.configure(feathers.authentication({
  storage: window.localStorage
}));

export default client;