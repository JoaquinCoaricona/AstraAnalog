import './config.js';
if(process.argv.includes('--production'))process.env.NODE_ENV='production';
const {app}=await import('./app.js');
const port=Number(process.env.PORT)||3001;
const host=process.env.HOST||(process.env.NODE_ENV==='production'?'0.0.0.0':'127.0.0.1');
app.listen(port,host);
