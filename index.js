'use strict'

module.exports = function GatheringMarkers(mod) {
    const config = require('./config.json');
    
    let active = true,
    enabled = true,
    markenabled = true,
    messager = false,
    alerts = false,
    Item_ID = 98260,
    whiteList = [],
    markList = [],
    marks = [];
    
    mod.hook('S_LOGIN', 10, (event) => {
        configInit();
    })
    
    mod.hook('S_SPAWN_COLLECTION', 4, (event) => {
        if (!enabled || !active) return;
        if (!whiteList.includes(event.id)) return;

        if (markenabled) {   
            if (markList.includes(event.id)) {
                spawnMark(event.gameId*100n, event.loc);
                marks.push(event.gameId);
            }
        }
        
        if (alerts) notice('Found ' + event.id)
        
        if (messager) mod.command.message('Found ' + event.id)
            
    })
        
    mod.hook('S_DESPAWN_COLLECTION', 2, (event) => {
        if (marks.includes(event.gameId)) {
            despawnMark(event.gameId*100n)
            marks.splice(markList.indexOf(event.gameId));
        }
    })
    
	mod.hook('S_LOAD_TOPO', 3, event => {
        active = event.zone < 9000;
		marks = [];
	})
    
	function configInit() {
        if (config) {
            ({enabled,markenabled,messager,alerts,Item_ID,whiteList,markList} = config)
        } else {
            mod.command.message("Error: Unable to load config.json - Using default values for now");
        }
	}

	function spawnMark(idRef, loc) {
        console.log('b ' + loc.z);
        loc.z -= 100;
        console.log('a' + loc.z);
		mod.send('S_SPAWN_DROPITEM', 6, {
			gameId: idRef,
			loc:loc,
			item: Item_ID, 
			amount: 1,
			expiry: 300000,
			explode:false,
			masterwork:false,
			enchant:0,
			source:0,
			debug:false,
			owners: [{id: 0}]
		})
	}
	
	function despawnMark(idRef) {
		mod.send('S_DESPAWN_DROPITEM', 4, {
			gameId: idRef
		})
	}    
    
	function notice(msg) {
		mod.send('S_DUNGEON_EVENT_MESSAGE', 2, {
            type: 43,
            chat: false,
            channel: 0,
            message: msg
        })
    }
    
    mod.command.add('gathering', (p1)=> {
        if (p1) p1 = p1.toLowerCase();
        if (p1 == null) {
            enabled = !enabled;
        } else if (p1 === 'off') {
            enabled = false;
        } else if (p1 === 'on') {
            enabled = true;
        } else if (['alert', 'alerts'].includes(p1)) {
			alerts = !alerts;
			mod.command.message(alerts ? 'System popup notice enabled' : 'System popup notice disabled');
            return;
        } else if (['message', 'messages', 'proxy'].includes(p1)) {
			messager = !messager;
			mod.command.message(messager ? 'Proxy messages enabled' : 'Proxy messages disabled');
            return;
        } else if (['mark', 'marks', 'marker', 'markers'].includes(p1)) {
			markenabled = !markenabled;
			mod.command.message(markenabled ? 'Item Markers enabled' : 'Item Markers disabled');
            return;
        } else if (p1 === 'clear') {
            mod.command.message('Item Markers Clear Attempted');
			for(let itemid of marks) despawnMark(itemid);
            return;
        } else {
            mod.command.message(p1 +' is an invalid argument');
            return;
        }        
        mod.command.message(enabled ? 'Enabled' : 'Disabled');
    });

}