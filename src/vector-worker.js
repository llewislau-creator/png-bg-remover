import ImageTracer from 'imagetracerjs'
self.onmessage=({data})=>{try{const {pixels,width,height,options,id}=data;const svg=ImageTracer.imagedataToSVG({data:new Uint8ClampedArray(pixels),width,height},options);self.postMessage({id,svg})}catch(error){self.postMessage({id,error:String(error.message||error)})}}
