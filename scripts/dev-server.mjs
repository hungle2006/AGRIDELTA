// Vite preview for managed Linux hosts where interface enumeration is unavailable.
import os from 'node:os';
import {createServer} from 'vite';
const interfaces=os.networkInterfaces;
os.networkInterfaces=()=>{try{return interfaces();}catch{return{lo:[{address:'127.0.0.1',netmask:'255.0.0.0',family:'IPv4',mac:'00:00:00:00:00:00',internal:true,cidr:'127.0.0.1/8'}]};}};
const args=process.argv.slice(2);const value=(flag,fallback)=>{const i=args.indexOf(flag);return i>=0&&args[i+1]?args[i+1]:fallback;};
const server=await createServer({server:{host:value('--host','0.0.0.0'),port:Number(value('--port','4173')),strictPort:args.includes('--strictPort'),allowedHosts:['terminal.local']}});
await server.listen();server.printUrls();
