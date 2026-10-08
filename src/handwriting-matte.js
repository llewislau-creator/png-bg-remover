export function removeWhiteMatte(pixels){
 for(let i=0;i<pixels.length;i+=4){
  if(!pixels[i+3])continue
  const distance=255-Math.min(pixels[i],pixels[i+1],pixels[i+2])
  if(distance<=18){pixels[i+3]=0;continue}
  if(distance>=70)continue
  const t=(distance-18)/52,alpha=t*t*(3-2*t)
  for(let c=0;c<3;c++)pixels[i+c]=Math.max(0,Math.min(255,Math.round((pixels[i+c]-255*(1-alpha))/alpha)))
  pixels[i+3]=Math.round(pixels[i+3]*alpha)
 }
}
