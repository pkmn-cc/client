import * as https from 'https';
import * as WebSocket from 'ws';

import {Listeners} from './listeners';
import {Params, Parser} from './parser';

export class Client {
  readonly ws: WebSocket;
  readonly listeners: Listeners;

  readonly url: {host: string, path: string};
  readonly name: string;

  constructor(
      server: string, port = 8000, name?: string, readonly password?: string,
      readonly room: string = 'lobby', host = 'play.pokemonshowdown.com') {
    this.name = name || `BOT-${Math.random().toString(36).substring(2)}`;
    this.url = {host, path: `/~~${server}:${port}/action.php`};

    this.listeners = new Listeners();
    this.listeners.on('challstr', p => this.onChallstr(p));
    this.listeners.on('updateuser', p => this.onUpdateUser(p));

    this.ws = new WebSocket(`ws://${server}:${port}/showdown/websocket`);
    this.ws.on('open', () => {});
    this.ws.on('message', (msg: string) => this.onMessage(msg));
    this.ws.on('error', err => this.onError(err));
  }

  destroy() {
    this.ws.close();
  }

  private onMessage(msg: string) {
    const lines = msg.split('\n');
    const id = (lines[0].charAt(0) === '>') ? lines[0].slice(1) : undefined;

    for (const line of lines) {
      const params = Parser.parseLine(line);
      if (!params.args[0]) continue;
      if (id) {
        // TODO
      } else {
        this.listeners.send(params);
      }
    }
  }

  private onError(err: Error) {
    throw err;
  }

  private onChallstr(params: Params) {
    const [, challengekeyid, challenge] = params.args;

    const options: https.RequestOptions = {
      hostname: this.url.host,
      path: this.url.path,
      agent: false,
    };

    let data = '';
    if (!this.password) {
      options.method = 'GET';
      options.path += `?act=getassertion&userid=${encodeURI(this.name)}` +
          `&challstr=${challengekeyid}%7C${challenge}`;
    } else {
      options.method = 'POST';
      data = `act=login&name=${encodeURI(this.name)}` +
          `&pass=${encodeURI(this.password)}` +
          `&challstr=${challengekeyid}%7C${challenge}`;
      options.headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': data.length
      };
    }

    const req = https.request(options, (res) => {
      res.setEncoding('utf8');

      let chunks = '';
      res.on('data', (chunk) => {
        chunks += chunk;
      });

      res.on('end', () => {
        if (chunks === ';' ||                       // registered name
            chunks.length < 50 ||                   // failed login
            chunks.indexOf('heavy load') !== -1 ||  // login server throttling
            chunks.substr(0, 16) === '<!DOCTYPE html>') {  // 522
          this.onError(new Error(chunks));
          return;
        }

        if (chunks.indexOf('|challstr|') >= 0) {
          this.onMessage(chunks);
          return;
        }

        // GET: the response (chunks) is the assertion
        let assertion = chunks;
        try {  // POST: returns JSON containing the assertion
          const json = JSON.parse(chunks.substr(1));
          if (json.actionsuccess && json.curuser.loggedin) {
            assertion = json.assertion;
          } else {
            this.onError(new Error(json.assertion));
            return;
          }
        } catch (err) {
        }  // GET
        this.ws.send('|/trn ' + this.name + ',0,' + assertion);
      });
    });

    req.on('error', err => this.onError(err));
    if (data) req.write(data);

    return req.end();
  }

  private onUpdateUser(params: Params) {
    const [, name, status] = params.args;
    if (status !== '1' || name !== this.name) return false;
    this.ws.send('|/join ' + this.room);
    return true;
  }
}