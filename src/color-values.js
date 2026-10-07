// Simple estimate without a print ICC profile.
export function estimatedCmyk(rgb){
 const channels=rgb.map(value=>value/255),black=1-Math.max(...channels)
 if(black===1)return [0,0,0,100]
 return [...channels.map(value=>Math.round((1-value-black)/(1-black)*100)),Math.round(black*100)]
}
