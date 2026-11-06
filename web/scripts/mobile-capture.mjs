import {chromium} from "playwright";
import {routes,submit} from "./fixtures.mjs";
const b=await chromium.launch({channel:"msedge"});
try{
 for(const kind of ["verified","conflict","unchecked","three-states","record-only","error","offline","rate","answer-dark"]){
  const c=await b.newContext({viewport:{width:390,height:844},colorScheme:kind==="answer-dark"?"dark":"light",reducedMotion:kind==="answer-dark"?"reduce":"no-preference"});
  await routes(c,kind==="answer-dark"?"verified":kind);const p=await c.newPage();await p.goto("http://localhost:4178/?review=1");await submit(p);
  if(["error","offline","rate"].includes(kind))await p.getByRole("alert").waitFor();else{await p.locator(".checked-claim").first().waitFor();await p.locator(".source-record").scrollIntoViewIfNeeded();await p.locator(".source-record img").evaluateAll(async es=>Promise.all(es.map(i=>i.decode().catch(()=>{}))))}
  await p.evaluate(()=>scrollTo(0,0));await p.waitForTimeout(700);
  await p.screenshot({path:new URL("../../docs/shots/saga/final/phone-390/"+kind+".png",import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,"$1"),fullPage:true});await c.close();
 }
}finally{await b.close()}
console.log("Nine affected phone captures refreshed");
