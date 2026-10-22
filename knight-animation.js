// Knight movement supplement: fixed map and existing level icons remain untouched.
// Level anchors are unchanged; only the route between them is refined.
// Waypoints follow the bends of the existing stone stepping-stone trail.
const KNIGHT_WAYPOINTS = [
 [170,989], [150,958], [147,915], [156,872], [183,835], [222,801], [253,775], [282,744],
 [324,738], [369,721], [414,686], [442,651], [444,608], [455,579], [466,561],
 [509,547], [551,521], [582,495], [608,458], [612,417], [605,364],
 [647,366], [689,378], [737,378], [781,354], [810,320], [814,290], [800,265]
];
const LEVEL_NODE_INDEX=[0,7,14,20,27];
// Lower the knight sprite without moving the map or level markers.
// Sprite CSS width = 15% of 941 = 141.15 map pixels.
// The walk sprite foot-center is x=54/162 of its image; centered CSS anchor is x=81/162.
// Thus shift anchor right ~23.5 map pixels so feet, not image centre, meet the stones.
// The sprite alpha feet end at y=206/215: +~8 map pixels brings soles to the waypoint.
const KNIGHT_FEET_X_SHIFT=24;
const KNIGHT_FEET_Y_SHIFT=8;
// Path coordinates describe the centres of stepping stones, not the character head.
const KNIGHT_VERTICAL_OFFSET=0;
const KNIGHT_ASSETS={idle:'knight_idle.png',walk:'knight_walk.png',final:'final_couple.png'};
// Engine state: -1 all locked; 0 first open; 1 first finished, second open; ...; 5 complete.
let journeyStage=-1; let knightAnimation=null;
function knightNodeImage(file, className){
 const im=document.createElement('img');im.src=file;im.className=className;im.draggable=false;im.alt='';return im;
}
function knightPlace(el,x,y){
 el.style.left=(x/941*100)+'%';el.style.top=(y/1672*100)+'%';
 const dot=document.getElementById('knight-debug-feet');
 if(dot){dot.style.left=((x-KNIGHT_FEET_X_SHIFT)/941*100)+'%';dot.style.top=((y-KNIGHT_FEET_Y_SHIFT-KNIGHT_VERTICAL_OFFSET)/1672*100)+'%';}
}
function animateKnight(startIndex,endIndex,done){
 // Real path follows the approved stone trail via intermediate waypoints.
 const img=document.getElementById('knight-sprite');
 if(!img){done();return;}
 img.src=KNIGHT_ASSETS.walk;
 const pts=KNIGHT_WAYPOINTS.slice(LEVEL_NODE_INDEX[startIndex],LEVEL_NODE_INDEX[endIndex]+1);
 let lengths=[],total=0;
 for(let i=1;i<pts.length;i++){const length=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);lengths.push(length);total+=length;}
 const duration=Math.max(1700, Math.min(4800,total*9));
 // Start at the previously completed level, never flash at destination.
 knightPlace(img,pts[0][0]+KNIGHT_FEET_X_SHIFT,pts[0][1]+KNIGHT_FEET_Y_SHIFT+KNIGHT_VERTICAL_OFFSET);
 let start=null;
 function tick(t){if(start===null)start=t;const p=Math.min(1,(t-start)/duration);let remaining=total*p;let j=0;while(j<lengths.length-1 && remaining>lengths[j]){remaining-=lengths[j];j++;}const frac=Math.min(1,remaining/(lengths[j]||1));const a=pts[j],b=pts[j+1]||pts[j];knightPlace(img,a[0]+(b[0]-a[0])*frac+KNIGHT_FEET_X_SHIFT,a[1]+(b[1]-a[1])*frac+KNIGHT_FEET_Y_SHIFT+KNIGHT_VERTICAL_OFFSET+Math.sin(t/105)*2);img.style.transform='translate(-50%,-100%) scaleX(1)';if(p<1)knightAnimation=requestAnimationFrame(tick);else {knightAnimation=null;img.src=KNIGHT_ASSETS.idle;img.style.transform='translate(-50%,-100%)';done();}}
 knightAnimation=requestAnimationFrame(tick);
}
function setStage(newStage,{animate=true}={}){
 newStage=Math.max(-1,Math.min(5,Math.trunc(newStage)));if(knightAnimation){cancelAnimationFrame(knightAnimation);knightAnimation=null;}
 const old=journeyStage;journeyStage=newStage;
 document.querySelectorAll('.level').forEach(el=>el.remove());
 const map=document.getElementById('map');
 const points=[[170,989],[282,744],[466,561],[605,364],[800,265]];
 points.forEach(([x,y],i)=>{const state=i<newStage?'completed':i===newStage?'open':'locked';const marker=document.createElement('img');marker.className='level';marker.src='level_'+(i+1)+'_'+state+'.png';marker.alt='Level '+(i+1)+': '+state;marker.style.left=(x/941*100)+'%';marker.style.top=(y/1672*100)+'%';map.appendChild(marker);});
 const sprite=document.getElementById('knight-sprite');const couple=document.getElementById('final-couple');sprite.hidden=true;couple.hidden=true;
 if(newStage===5){couple.hidden=false;knightPlace(couple,790,234);}
 else if(newStage>=0){sprite.hidden=false;let [x,y]=points[newStage];knightPlace(sprite,x+KNIGHT_FEET_X_SHIFT,y+KNIGHT_FEET_Y_SHIFT+KNIGHT_VERTICAL_OFFSET);sprite.src=KNIGHT_ASSETS.idle;sprite.style.transform='translate(-50%,-100%)';
 if(animate&&old>=0&&newStage===old+1){animateKnight(old,newStage,()=>{knightPlace(sprite,x+KNIGHT_FEET_X_SHIFT,y+KNIGHT_FEET_Y_SHIFT+KNIGHT_VERTICAL_OFFSET);});}}
 const status=document.getElementById('status'); status.textContent=newStage===-1?'All levels locked — knight hidden.':newStage===5?'All completed — knight and princess together.':'Level '+(newStage+1)+' open — knight at level '+(newStage+1)+'.';
}
