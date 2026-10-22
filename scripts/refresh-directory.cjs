// Public SEC metadata only. Run manually and review changes before publishing.
const fs=require('node:fs');
const path=require('node:path');
(async()=>{
 const source='https://www.sec.gov/files/company_tickers.json';
 const response=await fetch(source,{headers:{'User-Agent':process.env.SEC_USER_AGENT||'StockSense research (https://github.com/devtobi16/stock-sense)'},signal:AbortSignal.timeout(20000)});
 if(!response.ok)throw Error(`SEC directory unavailable (${response.status}); previous directory retained.`);
 const companies=Object.values(await response.json()).filter(c=>typeof c.title==='string'&&/^[A-Z0-9]{1,10}(?:[.-][A-Z0-9]{1,4})?$/.test(c.ticker)&&Number.isInteger(c.cik_str)&&c.cik_str>0).map(c=>({ticker:c.ticker,cik:String(c.cik_str),name:c.title}));
 if(companies.length<1000)throw Error('Unexpectedly small SEC directory; previous directory retained.');
 fs.writeFileSync(path.join(__dirname,'../server/data/secDirectory.json'),JSON.stringify({source,capturedAt:new Date().toISOString(),companies}));
 console.log(`Saved ${companies.length} SEC ticker mappings.`);
})().catch(e=>{console.error(e.message);process.exitCode=1;});
