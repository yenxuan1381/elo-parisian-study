export const records = [
 {title:'Ride',artist:'HYBS',kind:'song',id:'37HhnXqIRFSSJXWsysl6B7',color:'#6d8374'},
 {title:'magnolia',artist:'keshi',kind:'song',id:'6PAvEeeSw7zuaQTUnoZPlg',color:'#b77d80'},
 {title:'Nothing to You',artist:'ZUHAIR & Josiah Saav',kind:'song',id:'7K4RF1ebRKkn6IqJSadJNJ',color:'#7e7180'},
 {title:'24/7, 365',artist:'elijah woods',kind:'song',id:'7DFwy0ki0TfOfdDCr66ahT',color:'#b68c5e'},
 {title:'All I Ever Need',artist:'Austin Mahone',kind:'song',id:'6jQulkyysEDTWIle4v8ehT',color:'#78685e'},
 {title:'Making Steak',artist:'HYBS',kind:'album',id:'2KR8a0U0f286MuzLaEJhL6',color:'#879678'},
 {title:'Thinkin Bout You',artist:'SUMI & DJ YEN · includes time will tell',kind:'album',id:'0mNAzdyn2Zw3iSV6cn4tsc',color:'#8d929f'},
 {title:"i’m keshi",artist:'A playlist by keshi',kind:'playlist',id:'0HRjlYcjF9B6aU6VhugDtQ',color:'#9c7474'},
] as const;
export type RecordChoice=typeof records[number];
export function recordUri(record:RecordChoice){return `spotify:${record.kind==='song'?'track':record.kind}:${record.id}`}
export function recordUrl(record:RecordChoice){return `https://open.spotify.com/${record.kind==='song'?'track':record.kind}/${record.id}`}
export const roomPlaces=[
 {id:'room',name:'The whole room',detail:'A little corner of Paris'},
 {id:'drinks',name:'Something warm',detail:'Tea, matcha & coffee'},
 {id:'music',name:'The gramophone',detail:'A few favourites on repeat'},
 {id:'typewriter',name:'A letter to Emily',detail:'Leave a little of yourself here'},
 {id:'nook',name:'The reading corner',detail:'Put your feet up'},
 {id:'travel',name:'The postcard wall',detail:'Six places to daydream about'},
 {id:'window',name:'Paris after dark',detail:'City lights & a little celebration'},
 {id:'candles',name:'The candle shelf',detail:'A softer kind of light'},
 {id:'desk',name:'The writing desk',detail:'Room for a new idea'},
 {id:'library',name:'The library',detail:'Between the pages'},
 {id:'cat',name:'A little kindness',detail:'Fill the cat’s bowl'},
] as const;
