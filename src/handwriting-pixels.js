export function inkBounds(data,width,height){
 let left=width,top=height,right=-1,bottom=-1
 for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(data[(y*width+x)*4+3]>0){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y)}
 return right<0?null:{x:left,y:top,width:right-left+1,height:bottom-top+1}
}
export function tintInk(data,hex){
 if(!/^#[0-9a-f]{6}$/i.test(hex))throw new Error('Invalid color')
 const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16))
 for(let i=0;i<data.length;i+=4){if(!data[i+3])continue;for(let c=0;c<3;c++)data[i+c]=rgb[c]}
}
