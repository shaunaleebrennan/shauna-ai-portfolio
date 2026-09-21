import {copyFile, mkdir, readFile, writeFile, readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const source='../ai-positioning-qa';
const target='it-pressure-test';
const files=['tool.html','manual-review.html','favicon.svg','assets/styles.css','assets/it-buyer.css',...(await readdir(`${source}/docs/assets/js`)).filter(f=>f.endsWith('.js')).map(f=>`assets/js/${f}`)];
const manifest={sourceRepository:'https://github.com/shaunaleebrennan/ai-positioning-qa',sourceCommit:execFileSync('git',['-C',source,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),files:[]};
for(const file of files){const dest=file==='tool.html'?'index.html':file;await mkdir(`${target}/${dest.split('/').slice(0,-1).join('/')}`,{recursive:true});await copyFile(`${source}/docs/${file}`,`${target}/${dest}`);manifest.files.push({source:file,path:dest,sha256:createHash('sha256').update(await readFile(`${target}/${dest}`)).digest('hex')});}
await writeFile(`${target}/source-manifest.json`,JSON.stringify(manifest,null,2)+'\n');
console.log(`Synced ${files.length} public runtime files. No research or private source files copied.`);
