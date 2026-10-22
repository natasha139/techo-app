// Failed operations block newer operations so retry cannot overwrite a newer write.
export function createWriteQueue(onState) {
 const items=[];let running=false,error='';
 const emit=()=>onState({pending:items.length,running,error});
 async function drain(){
  if(running)return;
  running=true;error='';emit();
  try{
   while(items.length){
    try{await items[0].run();items.shift();emit();}
    catch(e){error=e?.message || '保存失败';break;}
   }
  }finally{running=false;emit();}
 }
 return {
  enqueue(run){items.push({run});emit();if(!error)void drain();},
  retry(){return drain();},
  hasPending(){return items.length>0;},
 };
}
