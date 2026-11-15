import {fileURLToPath} from 'node:url';
try{process.loadEnvFile(fileURLToPath(new URL('./.env',import.meta.url)));}
catch(error){if(error.code!=='ENOENT')throw new Error('No se pudo cargar backend/.env. Revisá el formato sin publicar su contenido.');}
