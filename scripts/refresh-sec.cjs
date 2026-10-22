// Refresh a bounded, source-attributed SEC fallback. No credentials or AI calls.
// Run manually with npm run refresh:sec, then review and commit the changed data.
const fs=require('node:fs');
const path=require('node:path');
const {createResearch,COMPANIES}=require('../server/services/companyResearch');
const destination=path.join(__dirname,'../server/data/secSnapshots.json');
const snapshots=JSON.parse(fs.readFileSync(destination,'utf8'));
const research=createResearch({market:{},generate:async()=>'',snapshots:{},maxDocumentBytes:50000000,secTimeoutMs:20000});
(async()=>{
 for(const ticker of (process.argv.length>2?process.argv.slice(2).map(t=>t.toUpperCase()).filter(t=>COMPANIES[t]):Object.keys(snapshots))) {
  try {
   const metadata=await research.filings(ticker);
   if(metadata.cachedSnapshot||metadata.unavailable||metadata.unsupported) throw Error('Live retrieval required');
   const documents={};
   for(const form of ['10-K','10-Q','8-K','20-F','40-F','6-K']) {
    const f=metadata.filings.find(v=>v.form===form);if(!f)continue;
    try {
     const paragraphs=new Set();
     for(const query of ['business products services revenue sales performance','risks supply competition regulation litigation','management discussion cash operating results liquidity']) {
      const evidence=await research.document(ticker,f.accession,query);
      for(const e of evidence.excerpts) paragraphs.add(e.text);
     }
     documents[f.accession]={text:[...paragraphs].join('\n'),capturedAt:new Date().toISOString(),url:f.url};
    } catch(e) {console.log(ticker,form,'document not captured:',e.message);}
   }
   snapshots[ticker]={...metadata,documents,capturedAt:new Date().toISOString()};
   fs.writeFileSync(destination,JSON.stringify(snapshots,null,2)+'\n');
   console.log(ticker,'verified filings:',metadata.filings.length,'saved documents:',Object.keys(documents).length);
  } catch(e){console.log(ticker,'kept prior snapshot:',e.message);}
 }
})();
