class Battle {




	runMinor(args: Args, kwArgs: KWArgs, nextArgs?: Args, nextKwargs?: KWArgs) {
		switch (args[0]) {
		case '-damage': {

		}
		case '-heal': {

		}
		case '-sethp': {
			for (let k = 0; k < 2; k++) {
				let cpoke = this.getPokemon(args[1 + 2 * k]);
				if (cpoke) {
					let damage = cpoke.healthParse(args[2 + 2 * k])!;
					let range = cpoke.getDamageRange(damage);
					let formattedRange = cpoke.getFormattedRange(range, 0, ' to ');
					let diff = damage[0];
					if (diff > 0) {
						this.scene.healAnim(cpoke, formattedRange);
					} else {
						this.scene.damageAnim(cpoke, formattedRange);
					}
				}
			}
			this.log(args, kwArgs);
			break;
		}
		case '-boost': {
			let poke = this.getPokemon(args[1])!;
			let stat = args[2] as BoostStatName;
			if (this.gen === 1 && stat === 'spd') break;
			if (this.gen === 1 && stat === 'spa') stat = 'spc';
			let amount = parseInt(args[3], 10);
			if (amount === 0) {
				this.scene.resultAnim(poke, 'Highest ' + BattleStats[stat], 'neutral');
				this.log(args, kwArgs);
				break;
			}
			if (!poke.boosts[stat]) {
				poke.boosts[stat] = 0;
			}
			poke.boosts[stat] += amount;

			if (!kwArgs.silent && kwArgs.from) {
				let effect = Dex.getEffect(kwArgs.from);
				let ofpoke = this.getPokemon(kwArgs.of);
				if (!(effect.id === 'weakarmor' && stat === 'spe')) {
					this.activateAbility(ofpoke || poke, effect);
				}
			}
			this.scene.resultAnim(poke, poke.getBoost(stat), 'good');
			this.log(args, kwArgs);
			break;
		}
		case '-unboost': {
			let poke = this.getPokemon(args[1])!;
			let stat = args[2] as BoostStatName;
			if (this.gen === 1 && stat === 'spd') break;
			if (this.gen === 1 && stat === 'spa') stat = 'spc';
			let amount = parseInt(args[3], 10);
			if (amount === 0) {
				this.scene.resultAnim(poke, 'Lowest ' + BattleStats[stat], 'bad');
				this.log(args, kwArgs);
				break;
			}
			if (!poke.boosts[stat]) {
				poke.boosts[stat] = 0;
			}
			poke.boosts[stat] -= amount;

			if (!kwArgs.silent && kwArgs.from) {
				let effect = Dex.getEffect(kwArgs.from);
				let ofpoke = this.getPokemon(kwArgs.of);
				this.activateAbility(ofpoke || poke, effect);
			}
			this.scene.resultAnim(poke, poke.getBoost(stat), 'bad');
			this.log(args, kwArgs);
			break;
		}
		case '-setboost': {
			let poke = this.getPokemon(args[1])!;
			let stat = args[2] as BoostStatName;
			let amount = parseInt(args[3], 10);
			poke.boosts[stat] = amount;
			this.scene.resultAnim(poke, poke.getBoost(stat), (amount > 0 ? 'good' : 'bad'));
			this.log(args, kwArgs);
			break;
		}
		case '-swapboost': {
			let poke = this.getPokemon(args[1])!;
			let poke2 = this.getPokemon(args[2])!;
			let stats = args[3] ? args[3].split(', ') : ['atk', 'def', 'spa', 'spd', 'spe', 'accuracy', 'evasion'];
			for (const stat of stats) {
				let tmp = poke.boosts[stat];
				poke.boosts[stat] = poke2.boosts[stat];
				if (!poke.boosts[stat]) delete poke.boosts[stat];
				poke2.boosts[stat] = tmp;
				if (!poke2.boosts[stat]) delete poke2.boosts[stat];
			}
			this.scene.resultAnim(poke, 'Stats swapped', 'neutral');
			this.scene.resultAnim(poke2, 'Stats swapped', 'neutral');

			this.log(args, kwArgs);
			break;
		}
		case '-clearpositiveboost': {
			let poke = this.getPokemon(args[1])!;
			let ofpoke = this.getPokemon(args[2]);
			let effect = Dex.getEffect(args[3]);
			for (const stat in poke.boosts) {
				if (poke.boosts[stat] > 0) delete poke.boosts[stat];
			}
			this.scene.resultAnim(poke, 'Boosts lost', 'bad');

			if (effect.id) {
				switch (effect.id) {
				case 'spectralthief':
					// todo: update StealBoosts so it animates 1st on Spectral Thief
					this.scene.runOtherAnim('spectralthiefboost' as ID, [ofpoke!, poke]);
					break;
				}
			}
			this.log(args, kwArgs);
			break;
		}
		case '-clearnegativeboost': {
			let poke = this.getPokemon(args[1])!;
			for (const stat in poke.boosts) {
				if (poke.boosts[stat] < 0) delete poke.boosts[stat];
			}
			this.scene.resultAnim(poke, 'Restored', 'good');

			this.log(args, kwArgs);
			break;
		}
		case '-copyboost': {
			let poke = this.getPokemon(args[1])!;
			let frompoke = this.getPokemon(args[2])!;
			let stats = args[3] ? args[3].split(', ') : ['atk', 'def', 'spa', 'spd', 'spe', 'accuracy', 'evasion'];
			for (const stat of stats) {
				poke.boosts[stat] = frompoke.boosts[stat];
				if (!poke.boosts[stat]) delete poke.boosts[stat];
			}
			this.scene.resultAnim(poke, 'Stats copied', 'neutral');

			this.log(args, kwArgs);
			break;
		}
		case '-clearboost': {
			let poke = this.getPokemon(args[1])!;
			poke.boosts = {};
			this.scene.resultAnim(poke, 'Stats reset', 'neutral');

			this.log(args, kwArgs);
			break;
		}
		case '-invertboost': {
			let poke = this.getPokemon(args[1])!;
			for (const stat in poke.boosts) {
				poke.boosts[stat] = -poke.boosts[stat];
			}
			this.scene.resultAnim(poke, 'Stats inverted', 'neutral');

			this.log(args, kwArgs);
			break;
		}
		case '-clearallboost': {
			let timeOffset = this.scene.timeOffset;
			for (const side of this.sides) {
				for (const active of side.active) {
					if (active) {
						active.boosts = {};
						this.scene.timeOffset = timeOffset;
						this.scene.resultAnim(active, 'Stats reset', 'neutral');
					}
				}
			}

			this.log(args, kwArgs);
			break;
		}
		case '-crit': {
			let poke = this.getPokemon(args[1]);
			if (poke) this.scene.resultAnim(poke, 'Critical hit', 'bad');
			if (this.activeMoveIsSpread) kwArgs.spread = '.';
			this.log(args, kwArgs);
			break;
		}
		case '-supereffective': {
			let poke = this.getPokemon(args[1]);
			if (poke) {
				this.scene.resultAnim(poke, 'Super-effective', 'bad');
				if (window.Config && Config.server && Config.server.afd) {
					this.scene.runOtherAnim('hitmark' as ID, [poke]);
				}
			}
			if (this.activeMoveIsSpread) kwArgs.spread = '.';
			this.log(args, kwArgs);
			break;
		}
		case '-resisted': {
			let poke = this.getPokemon(args[1]);
			if (poke) this.scene.resultAnim(poke, 'Resisted', 'neutral');
			if (this.activeMoveIsSpread) kwArgs.spread = '.';
			this.log(args, kwArgs);
			break;
		}
		case '-immune': {
			let poke = this.getPokemon(args[1])!;
			let fromeffect = Dex.getEffect(kwArgs.from);
			this.activateAbility(this.getPokemon(kwArgs.of) || poke, fromeffect);
			this.log(args, kwArgs);
			this.scene.resultAnim(poke, 'Immune', 'neutral');
			break;
		}
		case '-miss': {
			let target = this.getPokemon(args[2]);
			if (target) {
				this.scene.resultAnim(target, 'Missed', 'neutral');
			}
			this.log(args, kwArgs);
			break;
		}
		case '-fail': {
			let poke = this.getPokemon(args[1])!;
			let effect = Dex.getEffect(args[2]);
			let fromeffect = Dex.getEffect(kwArgs.from);
			let ofpoke = this.getPokemon(kwArgs.of);
			this.activateAbility(ofpoke || poke, fromeffect);
			switch (effect.id) {
			case 'brn':
				this.scene.resultAnim(poke, 'Already burned', 'neutral');
				break;
			case 'tox':
			case 'psn':
				this.scene.resultAnim(poke, 'Already poisoned', 'neutral');
				break;
			case 'slp':
				if (fromeffect.id === 'uproar') {
					this.scene.resultAnim(poke, 'Failed', 'neutral');
				} else {
					this.scene.resultAnim(poke, 'Already asleep', 'neutral');
				}
				break;
			case 'par':
				this.scene.resultAnim(poke, 'Already paralyzed', 'neutral');
				break;
			case 'frz':
				this.scene.resultAnim(poke, 'Already frozen', 'neutral');
				break;
			case 'unboost':
				this.scene.resultAnim(poke, 'Stat drop blocked', 'neutral');
				break;
			default:
				if (poke) {
					this.scene.resultAnim(poke, 'Failed', 'neutral');
				}
				break;
			}
			this.log(args, kwArgs);
			break;
		}
		case '-block': {
			let poke = this.getPokemon(args[1])!;
			let effect = Dex.getEffect(args[2]);
			let ofpoke = this.getPokemon(kwArgs.of);
			this.activateAbility(ofpoke || poke, effect);
			switch (effect.id) {
			case 'quickguard':
				poke.addTurnstatus('quickguard' as ID);
				this.scene.resultAnim(poke, 'Quick Guard', 'good');
				break;
			case 'wideguard':
				poke.addTurnstatus('wideguard' as ID);
				this.scene.resultAnim(poke, 'Wide Guard', 'good');
				break;
			case 'craftyshield':
				poke.addTurnstatus('craftyshield' as ID);
				this.scene.resultAnim(poke, 'Crafty Shield', 'good');
				break;
			case 'protect':
				poke.addTurnstatus('protect' as ID);
				this.scene.resultAnim(poke, 'Protected', 'good');
				break;

			case 'safetygoggles':
				poke.item = 'Safety Goggles';
				break;
			case 'protectivepads':
				poke.item = 'Protective Pads';
				break;
			}
			this.log(args, kwArgs);
			break;
		}
		case '-center': case '-notarget': case '-ohko':
		case '-combine': case '-hitcount': case '-waiting': case '-zbroken': {
			this.log(args, kwArgs);
			break;
		}
		case '-zpower': {
			let poke = this.getPokemon(args[1])!;
			this.scene.runOtherAnim('zpower' as ID, [poke]);
			this.log(args, kwArgs);
			break;
		}
		case '-prepare': {
			let poke = this.getPokemon(args[1])!;
			let moveid = toId(args[2]);
			let target = this.getPokemon(args[3]) || poke.side.foe.active[0] || poke;
			this.scene.runPrepareAnim(moveid, poke, target);
			this.log(args, kwArgs);
			break;
		}
		case '-mustrecharge': {
			let poke = this.getPokemon(args[1])!;
			poke.addMovestatus('mustrecharge' as ID);
			this.scene.updateStatbar(poke);
			break;
		}
		case '-status': {
			let poke = this.getPokemon(args[1])!;
			let effect = Dex.getEffect(kwArgs.from);
			let ofpoke = this.getPokemon(kwArgs.of) || poke;
			poke.status = args[2] as StatusName;
			poke.removeVolatile('yawn' as ID);
			this.activateAbility(ofpoke || poke, effect);
			if (effect.effectType === 'Item') {
				ofpoke.item = effect.name;
			}

			switch (args[2]) {
			case 'brn':
				this.scene.resultAnim(poke, 'Burned', 'brn');
				this.scene.runStatusAnim('brn' as ID, [poke]);
				break;
			case 'tox':
				this.scene.resultAnim(poke, 'Toxic poison', 'psn');
				this.scene.runStatusAnim('psn' as ID, [poke]);
				poke.statusData.toxicTurns = (effect.name === "Toxic Orb" ? -1 : 0);
				break;
			case 'psn':
				this.scene.resultAnim(poke, 'Poisoned', 'psn');
				this.scene.runStatusAnim('psn' as ID, [poke]);
				break;
			case 'slp':
				this.scene.resultAnim(poke, 'Asleep', 'slp');
				if (effect.id === 'rest') {
					poke.statusData.sleepTurns = 0; // for Gen 2 use through Sleep Talk
				}
				break;
			case 'par':
				this.scene.resultAnim(poke, 'Paralyzed', 'par');
				this.scene.runStatusAnim('par' as ID, [poke]);
				break;
			case 'frz':
				this.scene.resultAnim(poke, 'Frozen', 'frz');
				this.scene.runStatusAnim('frz' as ID, [poke]);
				break;
			default:
				this.scene.updateStatbar(poke);
				break;
			}
			this.log(args, kwArgs);
			break;
		}
		case '-curestatus': {
			let poke = this.getPokemon(args[1])!;
			let effect = Dex.getEffect(kwArgs.from);

			if (effect.id) {
				switch (effect.id) {
				case 'flamewheel':
				case 'flareblitz':
				case 'fusionflare':
				case 'sacredfire':
				case 'scald':
				case 'steameruption':
					kwArgs.thaw = '.';
					break;
				}
			}
			if (poke) {
				poke.status = '';
				switch (args[2]) {
				case 'brn':
					this.scene.resultAnim(poke, 'Burn cured', 'good');
					break;
				case 'tox':
				case 'psn':
					poke.statusData.toxicTurns = 0;
					this.scene.resultAnim(poke, 'Poison cured', 'good');
					break;
				case 'slp':
					this.scene.resultAnim(poke, 'Woke up', 'good');
					poke.statusData.sleepTurns = 0;
					break;
				case 'par':
					this.scene.resultAnim(poke, 'Paralysis cured', 'good');
					break;
				case 'frz':
					this.scene.resultAnim(poke, 'Thawed', 'good');
					break;
				default:
					poke.removeVolatile('confusion' as ID);
					this.scene.resultAnim(poke, 'Cured', 'good');
				}
			}
			this.log(args, kwArgs);
			break;

		}
		case '-cureteam': { // For old gens when the whole team was always cured
			let poke = this.getPokemon(args[1])!;
			for (const target of poke.side.pokemon) {
				target.status = '';
				this.scene.updateStatbarIfExists(target);
			}

			this.scene.resultAnim(poke, 'Team Cured', 'good');
			this.log(args, kwArgs);
			break;
		}
		case '-item': {
			let poke = this.getPokemon(args[1])!;
			let item = Dex.getItem(args[2]);
			let effect = Dex.getEffect(kwArgs.from);
			let ofpoke = this.getPokemon(kwArgs.of);
			poke.item = item.name;
			poke.itemEffect = '';
			poke.removeVolatile('airballoon' as ID);
			if (item.id === 'airballoon') poke.addVolatile('airballoon' as ID);

			if (effect.id) {
				switch (effect.id) {
				case 'pickup':
					this.activateAbility(poke, "Pickup");
					// falls through
				case 'recycle':
					poke.itemEffect = 'found';
					this.scene.resultAnim(poke, item.name, 'neutral');
					break;
				case 'frisk':
					this.activateAbility(ofpoke!, "Frisk");
					if (poke && poke !== ofpoke) { // used for gen 6
						poke.itemEffect = 'frisked';
						this.scene.resultAnim(poke, item.name, 'neutral');
					}
					break;
				case 'magician':
				case 'pickpocket':
					this.activateAbility(poke, effect.name);
					// falls through
				case 'thief':
				case 'covet':
					// simulate the removal of the item from the ofpoke
					ofpoke!.item = '';
					ofpoke!.itemEffect = '';
					ofpoke!.prevItem = item.name;
					ofpoke!.prevItemEffect = 'stolen';
					ofpoke!.addVolatile('itemremoved' as ID);
					poke.itemEffect = 'stolen';
					this.scene.resultAnim(poke, item.name, 'neutral');
					this.scene.resultAnim(ofpoke!, 'Item Stolen', 'bad');
					break;
				case 'harvest':
					poke.itemEffect = 'harvested';
					this.activateAbility(poke, "Harvest");
					this.scene.resultAnim(poke, item.name, 'neutral');
					break;
				case 'bestow':
					poke.itemEffect = 'bestowed';
					this.scene.resultAnim(poke, item.name, 'neutral');
					break;
				case 'trick':
					poke.itemEffect = 'tricked';
					// falls through
				default:
					break;
				}
			} else {
				switch (item.id) {
				case 'airballoon':
					this.scene.resultAnim(poke, 'Balloon', 'good');
					break;
				}
			}
			this.log(args, kwArgs);
			break;
		}
		case '-enditem': {
			let poke = this.getPokemon(args[1])!;
			let item = Dex.getItem(args[2]);
			let effect = Dex.getEffect(kwArgs.from);
			poke.item = '';
			poke.itemEffect = '';
			poke.prevItem = item.name;
			poke.prevItemEffect = '';
			poke.removeVolatile('airballoon' as ID);
			poke.addVolatile('itemremoved' as ID);
			if (kwArgs.eat) {
				poke.prevItemEffect = 'eaten';
				this.scene.runOtherAnim('consume' as ID, [poke]);
				this.lastMove = item.id;
			} else if (kwArgs.weaken) {
				poke.prevItemEffect = 'eaten';
				this.lastMove = item.id;
			} else if (effect.id) {
				switch (effect.id) {
				case 'fling':
					poke.prevItemEffect = 'flung';
					break;
				case 'knockoff':
					poke.prevItemEffect = 'knocked off';
					this.scene.runOtherAnim('itemoff' as ID, [poke]);
					this.scene.resultAnim(poke, 'Item knocked off', 'neutral');
					break;
				case 'stealeat':
					poke.prevItemEffect = 'stolen';
					break;
				case 'gem':
					poke.prevItemEffect = 'consumed';
					break;
				case 'incinerate':
					poke.prevItemEffect = 'incinerated';
					break;
				}
			} else {
				switch (item.id) {
				case 'airballoon':
					poke.prevItemEffect = 'popped';
					poke.removeVolatile('airballoon' as ID);
					this.scene.resultAnim(poke, 'Balloon popped', 'neutral');
					break;
				case 'focussash':
					poke.prevItemEffect = 'consumed';
					this.scene.resultAnim(poke, 'Sash', 'neutral');
					break;
				case 'focusband':
					this.scene.resultAnim(poke, 'Focus Band', 'neutral');
					break;
				case 'redcard':
					poke.prevItemEffect = 'held up';
					break;
				default:
					poke.prevItemEffect = 'consumed';
					break;
				}
			}
			this.log(args, kwArgs);
			break;
		}
		case '-ability': {
			let poke = this.getPokemon(args[1])!;
			let ability = Dex.getAbility(args[2]);
			let effect = Dex.getEffect(kwArgs.from);
			let ofpoke = this.getPokemon(kwArgs.of);
			poke.rememberAbility(ability.name, effect.id && !kwArgs.fail);

			if (kwArgs.silent) {
				// do nothing
			} else if (effect.id) {
				switch (effect.id) {
				case 'trace':
					this.activateAbility(poke, "Trace");
					this.scene.wait(500);
					this.activateAbility(poke, ability.name, true);
					ofpoke!.rememberAbility(ability.name);
					break;
				case 'powerofalchemy':
				case 'receiver':
					this.activateAbility(poke, effect.name);
					this.scene.wait(500);
					this.activateAbility(poke, ability.name, true);
					ofpoke!.rememberAbility(ability.name);
					break;
				case 'roleplay':
					this.activateAbility(poke, ability.name, true);
					ofpoke!.rememberAbility(ability.name);
					break;
				case 'desolateland':
				case 'primordialsea':
				case 'deltastream':
					if (kwArgs.fail) {
						this.activateAbility(poke, ability.name);
					}
					break;
				default:
					this.activateAbility(poke, ability.name);
					break;
				}
			} else {
				this.activateAbility(poke, ability.name);
			}
			this.log(args, kwArgs);
			break;
		}
		case '-endability': {
			// deprecated; use |-start| for Gastro Acid
			// and the third arg of |-ability| for Entrainment et al
			let poke = this.getPokemon(args[1])!;
			let ability = Dex.getAbility(args[2]);
			poke.ability = '(suppressed)';

			if (ability.id) {
				if (!poke.baseAbility) poke.baseAbility = ability.name;
			}
			this.log(args, kwArgs);
			break;
		}
		case 'detailschange': {
			let poke = this.getPokemon(args[1])!;
			poke.removeVolatile('formechange' as ID);
			poke.removeVolatile('typeadd' as ID);
			poke.removeVolatile('typechange' as ID);

			let newSpecies = args[2];
			let commaIndex = newSpecies.indexOf(',');
			if (commaIndex !== -1) {
				let level = newSpecies.substr(commaIndex + 1).trim();
				if (level.charAt(0) === 'L') {
					poke.level = parseInt(level.substr(1), 10);
				}
				newSpecies = args[2].substr(0, commaIndex);
			}
			let template = Dex.getTemplate(newSpecies);

			poke.species = newSpecies;
			poke.ability = poke.baseAbility = (template.abilities ? template.abilities['0'] : '');
			poke.weightkg = template.weightkg;

			poke.details = args[2];
			poke.searchid = args[1].substr(0, 2) + args[1].substr(3) + '|' + args[2];

			this.scene.animTransform(poke, true, true);
			this.log(args, kwArgs);
			break;
		}
		case '-transform': {
			let poke = this.getPokemon(args[1])!;
			let tpoke = this.getPokemon(args[2])!;
			let effect = Dex.getEffect(kwArgs.from);
			if (poke === tpoke) throw new Error("Transforming into self");

			if (!kwArgs.silent) {
				this.activateAbility(poke, effect);
			}

			poke.boosts = {...tpoke.boosts};
			poke.copyTypesFrom(tpoke);
			poke.weightkg = tpoke.weightkg;
			poke.ability = tpoke.ability;
			const species = (tpoke.volatiles.formechange ? tpoke.volatiles.formechange[1] : tpoke.species);
			const pokemon = tpoke;
			const shiny = tpoke.shiny;
			const gender = tpoke.gender;
			poke.addVolatile('transform' as ID, pokemon, shiny, gender);
			poke.addVolatile('formechange' as ID, species);
			for (const trackedMove of tpoke.moveTrack) {
				poke.rememberMove(trackedMove[0], 0);
			}
			this.scene.animTransform(poke);
			this.scene.resultAnim(poke, 'Transformed', 'good');
			this.log(['-transform', args[1], args[2], tpoke.species], kwArgs);
			break;
		}
		case '-formechange': {
			let poke = this.getPokemon(args[1])!;
			let template = Dex.getTemplate(args[2]);
			let fromeffect = Dex.getEffect(kwArgs.from);
			let isCustomAnim = false;
			poke.removeVolatile('typeadd' as ID);
			poke.removeVolatile('typechange' as ID);
			if (this.gen >= 7) poke.removeVolatile('autotomize' as ID);

			if (!kwArgs.silent) {
				this.activateAbility(poke, fromeffect);
			}
			poke.addVolatile('formechange' as ID, template.species); // the formechange volatile reminds us to revert the sprite change on switch-out
			this.scene.animTransform(poke, isCustomAnim);
			this.log(args, kwArgs);
			break;
		}
		case '-mega': {
			let poke = this.getPokemon(args[1])!;
			let item = Dex.getItem(args[3]);
			if (args[3]) {
				poke.item = item.name;
			}
			this.log(args, kwArgs);
			break;
		}
		case '-primal': case '-burst': {
			this.log(args, kwArgs);
			break;
		}
		case '-start': {
			let poke = this.getPokemon(args[1])!;
			let effect = Dex.getEffect(args[2]);
			let ofpoke = this.getPokemon(kwArgs.of);
			let fromeffect = Dex.getEffect(kwArgs.from);

			this.activateAbility(poke, effect);
			this.activateAbility(ofpoke || poke, fromeffect);
			switch (effect.id) {
			case 'typechange':
				if (ofpoke && fromeffect.id === 'reflecttype') {
					poke.copyTypesFrom(ofpoke);
				} else {
					const types = Dex.sanitizeName(args[3] || '???');
					poke.removeVolatile('typeadd' as ID);
					poke.addVolatile('typechange' as ID, types);
					if (!kwArgs.silent) {
						this.scene.typeAnim(poke, types);
					}
				}
				this.scene.updateStatbar(poke);
				break;
			case 'typeadd':
				const type = Dex.sanitizeName(args[3]);
				poke.addVolatile('typeadd' as ID, type);
				if (kwArgs.silent) break;
				this.scene.typeAnim(poke, type);
				break;
			case 'powertrick':
				this.scene.resultAnim(poke, 'Power Trick', 'neutral');
				break;
			case 'foresight':
			case 'miracleeye':
				this.scene.resultAnim(poke, 'Identified', 'bad');
				break;
			case 'telekinesis':
				this.scene.resultAnim(poke, 'Telekinesis', 'neutral');
				break;
			case 'confusion':
				if (!kwArgs.already) {
					this.scene.runStatusAnim('confused' as ID, [poke]);
					this.scene.resultAnim(poke, 'Confused', 'bad');
				}
				break;
			case 'leechseed':
				this.scene.updateStatbar(poke);
				break;
			case 'healblock':
				this.scene.resultAnim(poke, 'Heal Block', 'bad');
				break;
			case 'yawn':
				this.scene.resultAnim(poke, 'Drowsy', 'slp');
				break;
			case 'taunt':
				this.scene.resultAnim(poke, 'Taunted', 'bad');
				break;
			case 'imprison':
				this.scene.resultAnim(poke, 'Imprisoning', 'good');
			case 'disable':
				this.scene.resultAnim(poke, 'Disabled', 'bad');
				break;
			case 'embargo':
				this.scene.resultAnim(poke, 'Embargo', 'bad');
				break;
			case 'torment':
				this.scene.resultAnim(poke, 'Tormented', 'bad');
				break;
			case 'ingrain':
				this.scene.resultAnim(poke, 'Ingrained', 'good');
				break;
			case 'aquaring':
				this.scene.resultAnim(poke, 'Aqua Ring', 'good');
				break;
			case 'stockpile1':
				this.scene.resultAnim(poke, 'Stockpile', 'good');
				break;
			case 'stockpile2':
				poke.removeVolatile('stockpile1' as ID);
				this.scene.resultAnim(poke, 'Stockpile&times;2', 'good');
				break;
			case 'stockpile3':
				poke.removeVolatile('stockpile2' as ID);
				this.scene.resultAnim(poke, 'Stockpile&times;3', 'good');
				break;
			case 'perish0':
				poke.removeVolatile('perish1' as ID);
				break;
			case 'perish1':
				poke.removeVolatile('perish2' as ID);
				this.scene.resultAnim(poke, 'Perish next turn', 'bad');
				break;
			case 'perish2':
				poke.removeVolatile('perish3' as ID);
				this.scene.resultAnim(poke, 'Perish in 2', 'bad');
				break;
			case 'perish3':
				if (!kwArgs.silent) this.scene.resultAnim(poke, 'Perish in 3', 'bad');
				break;
			case 'encore':
				this.scene.resultAnim(poke, 'Encored', 'bad');
				break;
			case 'bide':
				this.scene.resultAnim(poke, 'Bide', 'good');
				break;
			case 'attract':
				this.scene.resultAnim(poke, 'Attracted', 'bad');
				break;
			case 'autotomize':
				this.scene.resultAnim(poke, 'Lightened', 'good');
				break;
			case 'focusenergy':
				this.scene.resultAnim(poke, '+Crit rate', 'good');
				break;
			case 'curse':
				this.scene.resultAnim(poke, 'Cursed', 'bad');
				break;
			case 'nightmare':
				this.scene.resultAnim(poke, 'Nightmare', 'bad');
				break;
			case 'magnetrise':
				this.scene.resultAnim(poke, 'Magnet Rise', 'good');
				break;
			case 'smackdown':
				this.scene.resultAnim(poke, 'Smacked Down', 'bad');
				poke.removeVolatile('magnetrise' as ID);
				poke.removeVolatile('telekinesis' as ID);
				if (poke.lastMove === 'fly' || poke.lastMove === 'bounce') this.scene.animReset(poke);
				break;
			case 'substitute':
				if (kwArgs.damage) {
					this.scene.resultAnim(poke, 'Damage', 'bad');
				} else if (kwArgs.block) {
					this.scene.resultAnim(poke, 'Blocked', 'neutral');
				}
				break;

			// Gen 1
			case 'lightscreen':
				this.scene.resultAnim(poke, 'Light Screen', 'good');
				break;
			case 'reflect':
				this.scene.resultAnim(poke, 'Reflect', 'good');
				break;
			}
			poke.addVolatile(effect.id);
			this.scene.updateStatbar(poke);
			this.log(args, kwArgs);
			break;
		}
		case '-end': {
			let poke = this.getPokemon(args[1])!;
			let effect = Dex.getEffect(args[2]);
			let fromeffect = Dex.getEffect(kwArgs.from);
			poke.removeVolatile(effect.id);

			if (kwArgs.silent) {
				// do nothing
			} else {
				switch (effect.id) {
				case 'powertrick':
					this.scene.resultAnim(poke, 'Power Trick', 'neutral');
					break;
				case 'telekinesis':
					this.scene.resultAnim(poke, 'Telekinesis&nbsp;ended', 'neutral');
					break;
				case 'skydrop':
					if (kwArgs.interrupt) {
						this.scene.anim(poke, {time: 100});
					}
					break;
				case 'confusion':
					this.scene.resultAnim(poke, 'Confusion&nbsp;ended', 'good');
					break;
				case 'leechseed':
					if (fromeffect.id === 'rapidspin') {
						this.scene.resultAnim(poke, 'De-seeded', 'good');
					}
					break;
				case 'healblock':
					this.scene.resultAnim(poke, 'Heal Block ended', 'good');
					break;
				case 'attract':
					this.scene.resultAnim(poke, 'Attract&nbsp;ended', 'good');
					break;
				case 'taunt':
					this.scene.resultAnim(poke, 'Taunt&nbsp;ended', 'good');
					break;
				case 'disable':
					this.scene.resultAnim(poke, 'Disable&nbsp;ended', 'good');
					break;
				case 'embargo':
					this.scene.resultAnim(poke, 'Embargo ended', 'good');
					break;
				case 'torment':
					this.scene.resultAnim(poke, 'Torment&nbsp;ended', 'good');
					break;
				case 'encore':
					this.scene.resultAnim(poke, 'Encore&nbsp;ended', 'good');
					break;
				case 'bide':
					this.scene.runOtherAnim('bideunleash' as ID, [poke]);
					break;
				case 'illusion':
					this.scene.resultAnim(poke, 'Illusion ended', 'bad');
					poke.rememberAbility('Illusion');
					break;
				case 'slowstart':
					this.scene.resultAnim(poke, 'Slow Start ended', 'good');
					break;
				case 'perishsong': // for backwards compatibility
					poke.removeVolatile('perish3' as ID);
					break;
				case 'substitute':
					this.scene.resultAnim(poke, 'Faded', 'bad');
					break;
				case 'stockpile':
					poke.removeVolatile('stockpile1' as ID);
					poke.removeVolatile('stockpile2' as ID);
					poke.removeVolatile('stockpile3' as ID);
					break;
				default:
					if (effect.effectType === 'Move') {
						if (effect.name === 'Doom Desire') {
							this.scene.runOtherAnim('doomdesirehit' as ID, [poke]);
						}
						if (effect.name === 'Future Sight') {
							this.scene.runOtherAnim('futuresighthit' as ID, [poke]);
						}
					}
				}
			}
			this.scene.updateStatbar(poke);
			this.log(args, kwArgs);
			break;
		}
		case '-singleturn': {
			let poke = this.getPokemon(args[1])!;
			let effect = Dex.getEffect(args[2]);
			poke.addTurnstatus(effect.id);

			switch (effect.id) {
			case 'roost':
				this.scene.resultAnim(poke, 'Landed', 'neutral');
				break;
			case 'quickguard':
				this.scene.resultAnim(poke, 'Quick Guard', 'good');
				break;
			case 'wideguard':
				this.scene.resultAnim(poke, 'Wide Guard', 'good');
				break;
			case 'craftyshield':
				this.scene.resultAnim(poke, 'Crafty Shield', 'good');
				break;
			case 'matblock':
				this.scene.resultAnim(poke, 'Mat Block', 'good');
				break;
			case 'protect':
				this.scene.resultAnim(poke, 'Protected', 'good');
				break;
			case 'endure':
				this.scene.resultAnim(poke, 'Enduring', 'good');
				break;
			case 'helpinghand':
				this.scene.resultAnim(poke, 'Helping Hand', 'good');
				break;
			case 'focuspunch':
				this.scene.resultAnim(poke, 'Focusing', 'neutral');
				poke.rememberMove(effect.name, 0);
				break;
			case 'shelltrap':
				this.scene.resultAnim(poke, 'Trap set', 'neutral');
				poke.rememberMove(effect.name, 0);
				break;
			case 'beakblast':
				this.scene.runOtherAnim('bidecharge' as ID, [poke]);
				this.scene.resultAnim(poke, 'Beak Blast', 'neutral');
				break;
			}
			this.scene.updateStatbar(poke);
			this.log(args, kwArgs);
			break;
		}
		case '-singlemove': {
			let poke = this.getPokemon(args[1])!;
			let effect = Dex.getEffect(args[2]);
			poke.addMovestatus(effect.id);

			switch (effect.id) {
			case 'grudge':
				this.scene.resultAnim(poke, 'Grudge', 'neutral');
				break;
			case 'destinybond':
				this.scene.resultAnim(poke, 'Destiny Bond', 'neutral');
				break;
			}
			this.log(args, kwArgs);
			break;
		}
		case '-activate': {
			let poke = this.getPokemon(args[1])!;
			let effect = Dex.getEffect(args[2]);
			let target = this.getPokemon(args[3]);
			this.activateAbility(poke, effect);
			switch (effect.id) {
			case 'grudge':
				poke.rememberMove(kwArgs.move, Infinity);
				break;
			case 'substitute':
				if (kwArgs.damage) {
					this.scene.resultAnim(poke, 'Damage', 'bad');
				} else if (kwArgs.block) {
					this.scene.resultAnim(poke, 'Blocked', 'neutral');
				}
				break;
			case 'attract':
				this.scene.runStatusAnim('attracted' as ID, [poke]);
				break;
			case 'bide':
				this.scene.runOtherAnim('bidecharge' as ID, [poke]);
				break;

			// move activations
			case 'aromatherapy':
				this.scene.resultAnim(poke, 'Team Cured', 'good');
				break;
			case 'healbell':
				this.scene.resultAnim(poke, 'Team Cured', 'good');
				break;
			case 'brickbreak':
				target!.side.removeSideCondition('Reflect');
				target!.side.removeSideCondition('LightScreen');
				break;
			case 'hyperspacefury':
			case 'hyperspacehole':
			case 'phantomforce':
			case 'shadowforce':
			case 'feint':
				this.scene.resultAnim(poke, 'Protection broken', 'bad');
				poke.removeTurnstatus('protect' as ID);
				for (const curTarget of poke.side.pokemon) {
					curTarget.removeTurnstatus('wideguard' as ID);
					curTarget.removeTurnstatus('quickguard' as ID);
					curTarget.removeTurnstatus('craftyshield' as ID);
					curTarget.removeTurnstatus('matblock' as ID);
					this.scene.updateStatbar(curTarget);
				}
				break;
			case 'spite':
				let move = Dex.getMove(kwArgs.move).name;
				let pp = Number(kwArgs.number);
				if (isNaN(pp)) pp = 4;
				poke.rememberMove(move, pp);
				break;
			case 'gravity':
				poke.removeVolatile('magnetrise' as ID);
				poke.removeVolatile('telekinesis' as ID);
				this.scene.anim(poke, {time: 100});
				break;
			case 'skillswap':
				if (this.gen <= 4) break;
				let pokeability = Dex.sanitizeName(kwArgs.ability) || target!.ability;
				let targetability = Dex.sanitizeName(kwArgs.ability2) || poke.ability;
				if (pokeability) {
					poke.ability = pokeability;
					if (!target!.baseAbility) target!.baseAbility = pokeability;
				}
				if (targetability) {
					target!.ability = targetability;
					if (!poke.baseAbility) poke.baseAbility = targetability;
				}
				if (poke.side !== target!.side) {
					this.activateAbility(poke, pokeability, true);
					this.activateAbility(target, targetability, true);
				}
				break;

			// ability activations
			case 'forewarn':
				if (target) {
					target.rememberMove(kwArgs.move, 0);
				} else {
					let foeActive = [] as Pokemon[];
					for (const maybeTarget of poke.side.foe.active) {
						if (maybeTarget && !maybeTarget.fainted) foeActive.push(maybeTarget);
					}
					if (foeActive.length === 1) {
						foeActive[0].rememberMove(kwArgs.move, 0);
					}
				}
				break;
			case 'mummy':
				if (!kwArgs.ability) break; // if Mummy activated but failed, no ability will have been sent
				let ability = Dex.getAbility(kwArgs.ability);
				this.activateAbility(target, ability.name);
				this.activateAbility(poke, "Mummy");
				this.scene.wait(700);
				this.activateAbility(target, "Mummy", true);
				break;

			// item activations
			case 'leppaberry':
			case 'mysteryberry':
				poke.rememberMove(kwArgs.move, effect.id === 'leppaberry' ? -10 : -5);
				break;
			case 'focusband':
				poke.item = 'Focus Band';
				break;
			default:
				if (kwArgs.broken) { // for custom moves that break protection
					this.scene.resultAnim(poke, 'Protection broken', 'bad');
				}
			}
			this.log(args, kwArgs);
			break;
		}
		case '-sidestart': {
			let side = this.getSide(args[1]);
			let effect = Dex.getEffect(args[2]);
			side.addSideCondition(effect);

			switch (effect.id) {
			case 'tailwind':
			case 'auroraveil':
			case 'reflect':
			case 'lightscreen':
			case 'safeguard':
			case 'mist':
				this.scene.updateWeather();
				break;
			}
			this.log(args, kwArgs);
			break;
		}
		case '-sideend': {
			let side = this.getSide(args[1]);
			let effect = Dex.getEffect(args[2]);
			// let from = Dex.getEffect(kwArgs.from);
			// let ofpoke = this.getPokemon(kwArgs.of);
			side.removeSideCondition(effect.name);
			this.log(args, kwArgs);
			break;
		}
		case '-weather': {
			let effect = Dex.getEffect(args[1]);
			let poke = this.getPokemon(kwArgs.of) || undefined;
			let ability = Dex.getEffect(kwArgs.from);
			if (!effect.id || effect.id === 'none') {
				kwArgs.from = this.weather;
			}
			this.changeWeather(effect.name, poke, !!kwArgs.upkeep, ability);
			this.log(args, kwArgs);
			break;
		}
		case '-fieldstart': {
			let effect = Dex.getEffect(args[1]);
			let poke = this.getPokemon(kwArgs.of);
			let fromeffect = Dex.getEffect(kwArgs.from);
			this.activateAbility(poke, fromeffect);
			let maxTimeLeft = 0;
			if (['electricterrain', 'grassyterrain', 'mistyterrain', 'psychicterrain'].includes(effect.id)) {
				for (let i = this.pseudoWeather.length - 1; i >= 0; i--) {
					let pwName = this.pseudoWeather[i][0];
					if (pwName === 'Electric Terrain' || pwName === 'Grassy Terrain' || pwName === 'Misty Terrain' || pwName === 'Psychic Terrain') {
						this.pseudoWeather.splice(i, 1);
						continue;
					}
				}
				if (this.gen > 6) maxTimeLeft = 8;
			}
			this.addPseudoWeather(effect.name, 5, maxTimeLeft);

			switch (effect.id) {
			case 'gravity':
				if (!this.fastForward) {
					for (const side of this.sides) {
						for (const active of side.active) {
							if (active) this.scene.runOtherAnim('gravity' as ID, [active]);
						}
					}
				}
				break;
			}
			this.log(args, kwArgs);
			break;
		}
		case '-fieldend': {
			let effect = Dex.getEffect(args[1]);
			// let poke = this.getPokemon(kwArgs.of);
			this.removePseudoWeather(effect.name);
			this.log(args, kwArgs);
			break;
		}
		case '-fieldactivate': {
			let effect = Dex.getEffect(args[1]);
			switch (effect.id) {
			case 'perishsong':
				this.scene.updateStatbars();
				break;
			}
			this.log(args, kwArgs);
			break;
		}
		case '-anim': {
			let poke = this.getPokemon(args[1])!;
			let move = Dex.getMove(args[2]);
			if (this.checkActive(poke)) return;
			let poke2 = this.getPokemon(args[3]);
			this.scene.beforeMove(poke);
			this.animateMove(poke, move, poke2, kwArgs);
			this.scene.afterMove(poke);
			break;
		}
		case '-hint': case '-message': {
			this.log(args, kwArgs);
			break;
		}
		default: {
			if (this.errorCallback) this.errorCallback(this);
			break;
		}}
	}
	/*
	parseSpriteData(name) {
		let siden = 0,
			foe = false;
		while (true) {
			if (name.substr(0, 6) === 'foeof-') {
				foe = true;
				name = name.substr(6);
			} else if (name.substr(0, 9) === 'switched-') name = name.substr(9);
			else if (name.substr(0, 9) === 'existing-') name = name.substr(9);
			else if (name.substr(0, 4) === 'foe-') {
				siden = this.p2.n;
				name = name.substr(4);
			} else if (name.substr(0, 5) === 'ally-') {
				siden = this.p1.n;
				name = name.substr(5);
			} else break;
		}
		if (name.substr(name.length - 1) === ')') {
			let parenIndex = name.lastIndexOf('(');
			if (parenIndex > 0) {
				let species = name.substr(parenIndex + 1);
				name = species.substr(0, species.length - 1);
			}
		}
		if (foe) siden = (siden ? 0 : 1);

		let data = Dex.getTemplate(name);
		return data.spriteData[siden];
	}
	*/
	parseDetails(name: string, pokemonid: string, details = "", output: any = {}) {
		output.details = details;
		output.name = name;
		output.species = name;
		output.level = 100;
		output.shiny = false;
		output.gender = '';
		output.ident = (name ? pokemonid : '');
		output.searchid = (name ? (pokemonid + '|' + details) : '');
		let splitDetails = details.split(', ');
		if (splitDetails[splitDetails.length - 1] === 'shiny') {
			output.shiny = true;
			splitDetails.pop();
		}
		if (splitDetails[splitDetails.length - 1] === 'M' || splitDetails[splitDetails.length - 1] === 'F') {
			output.gender = splitDetails[splitDetails.length - 1];
			splitDetails.pop();
		}
		if (splitDetails[1]) {
			output.level = parseInt(splitDetails[1].substr(1), 10) || 100;
		}
		if (splitDetails[0]) {
			output.species = splitDetails[0];
		}
		return output;
	}
	parseHealth(hpstring: string, output: any = {}): {
		hp: number,
		maxhp: number,
		hpcolor: HPColor | '',
		status: StatusName | '',
		fainted?: boolean,
	} | null {
		let [hp, status] = hpstring.split(' ');

		// hp parse
		output.hpcolor = '';
		if (hp === '0' || hp === '0.0') {
			if (!output.maxhp) output.maxhp = 100;
			output.hp = 0;
		} else if (hp.indexOf('/') > 0) {
			let [curhp, maxhp] = hp.split('/');
			if (isNaN(parseFloat(curhp)) || isNaN(parseFloat(maxhp))) {
				return null;
			}
			output.hp = parseFloat(curhp);
			output.maxhp = parseFloat(maxhp);
			if (output.hp > output.maxhp) output.hp = output.maxhp;
			const colorchar = maxhp.slice(-1);
			if (colorchar === 'y' || colorchar === 'g') {
				output.hpcolor = colorchar;
			}
		} else if (!isNaN(parseFloat(hp))) {
			if (!output.maxhp) output.maxhp = 100;
			output.hp = output.maxhp * parseFloat(hp) / 100;
		}

		// status parse
		if (!status) {
			output.status = '';
		} else if (status === 'par' || status === 'brn' || status === 'slp' || status === 'frz' || status === 'tox') {
			output.status = status;
		} else if (status === 'psn' && output.status !== 'tox') {
			output.status = status;
		} else if (status === 'fnt') {
			output.hp = 0;
			output.fainted = true;
		}
		return output;
	}
	parsePokemonId(pokemonid: string) {
		let name = pokemonid;

		let siden = -1;
		let slot = -1; // if there is an explicit slot for this pokemon
		let slotChart: {[k: string]: number} = {a: 0, b: 1, c: 2, d: 3, e: 4, f: 5};
		if (name.substr(0, 4) === 'p2: ' || name === 'p2') {
			siden = this.p2.n;
			name = name.substr(4);
		} else if (name.substr(0, 4) === 'p1: ' || name === 'p1') {
			siden = this.p1.n;
			name = name.substr(4);
		} else if (name.substr(0, 2) === 'p2' && name.substr(3, 2) === ': ') {
			slot = slotChart[name.substr(2, 1)];
			siden = this.p2.n;
			name = name.substr(5);
			pokemonid = 'p2: ' + name;
		} else if (name.substr(0, 2) === 'p1' && name.substr(3, 2) === ': ') {
			slot = slotChart[name.substr(2, 1)];
			siden = this.p1.n;
			name = name.substr(5);
			pokemonid = 'p1: ' + name;
		}
		return {name, siden, slot, pokemonid};
	}
	getPokemon(pokemonid: string, details?: string) {
		let isNew = false; // if true, don't match any pokemon that already exists (for Team Preview)
		let isSwitch = false; // if true, don't match an active, fainted, or immediately-previously switched-out pokemon
		let isInactive = false; // if true, don't match an active pokemon
		let createIfNotFound = false; // if true, create the pokemon if a match wasn't found

		if (pokemonid === undefined || pokemonid === '??') return null;
		if (pokemonid.substr(0, 5) === 'new: ') {
			pokemonid = pokemonid.substr(5);
			isNew = true;
			createIfNotFound = true; // obviously
		}
		if (pokemonid.substr(0, 10) === 'switchin: ') {
			pokemonid = pokemonid.substr(10);
			isSwitch = true;
			createIfNotFound = true;
		}
		let parseIdResult = this.parsePokemonId(pokemonid);
		let {name, siden, slot} = parseIdResult;
		pokemonid = parseIdResult.pokemonid;

		if (!details) {
			if (siden < 0) return null;
			if (this.sides[siden].active[slot]) return this.sides[siden].active[slot];
			if (slot >= 0) isInactive = true;
		}

		let searchid = '';
		if (details) searchid = pokemonid + '|' + details;

		// search p1's pokemon
		if (siden !== this.p2.n && !isNew) {
			const active = this.p1.active[slot];
			if (active && active.searchid === searchid && !isSwitch) {
				active.slot = slot;
				return active;
			}
			for (let i = 0; i < this.p1.pokemon.length; i++) {
				let pokemon = this.p1.pokemon[i];
				if (pokemon.fainted && (isNew || isSwitch)) continue;
				if (isSwitch || isInactive) {
					if (this.p1.active.indexOf(pokemon) >= 0) continue;
				}
				if (isSwitch && pokemon === this.p1.lastPokemon && !this.p1.active[slot]) continue;
				if ((searchid && pokemon.searchid === searchid) || // exact match
					(!searchid && pokemon.ident === pokemonid)) { // name matched, good enough
					if (slot >= 0) pokemon.slot = slot;
					return pokemon;
				}
				if (!pokemon.searchid && pokemon.checkDetails(details)) { // switch-in matches Team Preview entry
					pokemon = this.p1.newPokemon(this.parseDetails(name, pokemonid, details), i);
					if (slot >= 0) pokemon.slot = slot;
					return pokemon;
				}
			}
		}

		// search p2's pokemon
		if (siden !== this.p1.n && !isNew) {
			const active = this.p2.active[slot];
			if (active && active.searchid === searchid && !isSwitch) {
				if (slot >= 0) active.slot = slot;
				return active;
			}
			for (let i = 0; i < this.p2.pokemon.length; i++) {
				let pokemon = this.p2.pokemon[i];
				if (pokemon.fainted && (isNew || isSwitch)) continue;
				if (isSwitch || isInactive) {
					if (this.p2.active.indexOf(pokemon) >= 0) continue;
				}
				if (isSwitch && pokemon === this.p2.lastPokemon && !this.p2.active[slot]) continue;
				if ((searchid && pokemon.searchid === searchid) || // exact match
					(!searchid && pokemon.ident === pokemonid)) { // name matched, good enough
					if (slot >= 0) pokemon.slot = slot;
					return pokemon;
				}
				if (!pokemon.searchid && pokemon.checkDetails(details)) { // switch-in matches Team Preview entry
					pokemon = this.p2.newPokemon(this.parseDetails(name, pokemonid, details), i);
					if (slot >= 0) pokemon.slot = slot;
					return pokemon;
				}
			}
		}

		if (!details || !createIfNotFound) return null;

		// pokemon not found, create a new pokemon object for it

		if (siden < 0) throw new Error("Invalid pokemonid passed to getPokemon");

		let species = name;
		let gender = '';
		let level = 100;
		let shiny = false;
		if (details) {
			let splitDetails = details.split(', ');
			if (splitDetails[splitDetails.length - 1] === 'shiny') {
				shiny = true;
				splitDetails.pop();
			}
			if (splitDetails[splitDetails.length - 1] === 'M' || splitDetails[splitDetails.length - 1] === 'F') {
				gender = splitDetails[splitDetails.length - 1];
				splitDetails.pop();
			}
			if (splitDetails[1]) {
				level = parseInt(splitDetails[1].substr(1), 10) || 100;
			}
			if (splitDetails[0]) {
				species = splitDetails[0];
			}
		}
		if (slot < 0) slot = 0;
		let pokemon = this.sides[siden].newPokemon({
			species,
			details,
			name,
			ident: (name ? pokemonid : ''),
			searchid: (name ? (pokemonid + '|' + details) : ''),
			level,
			gender,
			shiny,
			slot,
		}, isNew ? -2 : -1);
		return pokemon;
	}
	getSide(sidename: string): Side {
		if (sidename === 'p1' || sidename.substr(0, 3) === 'p1:') return this.p1;
		if (sidename === 'p2' || sidename.substr(0, 3) === 'p2:') return this.p2;
		if (this.mySide.id === sidename) return this.mySide;
		if (this.yourSide.id === sidename) return this.yourSide;
		if (this.mySide.name === sidename) return this.mySide;
		if (this.yourSide.name === sidename) return this.yourSide;
		return {
			name: sidename,
			id: sidename.replace(/ /g, ''),
		} as any;
	}

	add(command: string, fastForward?: boolean) {
		if (command) this.activityQueue.push(command);

		if (this.playbackState === Playback.Uninitialized) {
			this.playbackState = Playback.Ready;
		} else if (this.playbackState === Playback.Finished) {
			this.playbackState = Playback.Playing;
			this.paused = false;
			this.scene.soundStart();
			if (fastForward) {
				this.fastForwardTo(-1);
			} else {
				this.nextActivity();
			}
		}
	}
	/**
	 * PS's preempt system is intended to show chat messages immediately,
	 * instead of waiting for the battle to get to the point where the
	 * message was said.
	 *
	 * In addition to being a nice quality-of-life feature, it's also
	 * important to make sure timer updates happen in real-time.
	 */
	instantAdd(command: string) {
		this.run(command, true);
		this.preemptActivityQueue.push(command);
		this.add(command);
	}
	runMajor(args: Args, kwArgs: KWArgs, preempt?: boolean) {
		switch (args[0]) {
		case 'start': {
			this.scene.teamPreviewEnd();
			this.mySide.active[0] = null;
			this.yourSide.active[0] = null;
			this.start();
			break;
		}
		case 'upkeep': {
			this.usesUpkeep = true;
			this.updatePseudoWeatherLeft();
			this.updateToxicTurns();
			break;
		}
		case 'turn': {
			this.setTurn(args[1]);
			this.log(args);
			break;
		}
		case 'tier': {
			this.tier = args[1];
			if (this.tier.slice(-13) === 'Random Battle') {
				this.speciesClause = true;
			}
			this.log(args);
			break;
		}
		case 'gametype': {
			this.gameType = args[1] as any;
			switch (args[1]) {
			default:
				this.mySide.active = [null];
				this.yourSide.active = [null];
				break;
			case 'doubles':
				this.mySide.active = [null, null];
				this.yourSide.active = [null, null];
				break;
			case 'triples':
			case 'rotation':
				this.mySide.active = [null, null, null];
				this.yourSide.active = [null, null, null];
				break;
			}
			this.scene.updateGen();
			break;
		}
		case 'rule': {
			let ruleName = args[1].split(': ')[0];
			if (ruleName === 'Species Clause') this.speciesClause = true;
			this.log(args);
			break;
		}
		case 'rated': {
			this.rated = true;
			this.log(args);
			break;
		}
		case 'inactive': {
			if (!this.kickingInactive) this.kickingInactive = true;
			if (args[1].slice(0, 11) === "Time left: ") {
				this.kickingInactive = parseInt(args[1].slice(11), 10) || true;
				this.totalTimeLeft = parseInt(args[1].split(' | ')[1], 10);
				if (this.totalTimeLeft === this.kickingInactive) this.totalTimeLeft = 0;
				return;
			} else if (args[1].slice(0, 9) === "You have ") {
				// this is ugly but parseInt is documented to work this way
				// so I'm going to be lazy and not chop off the rest of the
				// sentence
				this.kickingInactive = parseInt(args[1].slice(9), 10) || true;
				return;
			} else if (args[1].slice(-14) === ' seconds left.') {
				let hasIndex = args[1].indexOf(' has ');
				let userid = (window.app && app.user && app.user.get('userid'));
				if (toId(args[1].slice(0, hasIndex)) === userid) {
					this.kickingInactive = parseInt(args[1].slice(hasIndex + 5), 10) || true;
				}
			}
			this.log(args, undefined, preempt);
			break;
		}
		case 'inactiveoff': {
			this.kickingInactive = false;
			this.log(args, undefined, preempt);
			break;
		}
		case 'join': case 'j': {
			if (this.roomid) {
				let room = app.rooms[this.roomid];
				let user = args[1];
				let userid = toUserid(user);
				if (/^[a-z0-9]/i.test(user)) user = ' ' + user;
				if (!room.users[userid]) room.userCount.users++;
				room.users[userid] = user;
				room.userList.add(userid);
				room.userList.updateUserCount();
				room.userList.updateNoUsersOnline();
			}
			if (!this.ignoreSpects) {
				this.log(args, undefined, preempt);
			}
			break;
		}
		case 'leave': case 'l': {
			if (this.roomid) {
				let room = app.rooms[this.roomid];
				let user = args[1];
				let userid = toUserid(user);
				if (room.users[userid]) room.userCount.users--;
				delete room.users[userid];
				room.userList.remove(userid);
				room.userList.updateUserCount();
				room.userList.updateNoUsersOnline();
			}
			if (!this.ignoreSpects) {
				this.log(args, undefined, preempt);
			}
			break;
		}
		case 'player': {
			let side = this.getSide(args[1]);
			side.setName(args[2]);
			if (args[3]) side.setAvatar(args[3]);
			this.scene.updateSidebar(side);
			if (this.joinButtons) this.scene.hideJoinButtons();
			this.log(args);
			break;
		}
		case 'teamsize': {
			let side = this.getSide(args[1]);
			side.totalPokemon = parseInt(args[2], 10);
			this.scene.updateSidebar(side);
			break;
		}
		case 'win': case 'tie': {
			this.winner(args[0] === 'tie' ? undefined : args[1]);
			break;
		}
		case 'prematureend': {
			this.prematureEnd();
			break;
		}
		case 'clearpoke': {
			this.p1.clearPokemon();
			this.p2.clearPokemon();
			break;
		}
		case 'poke': {
			let pokemon = this.getPokemon('new: ' + args[1], args[2])!;
			if (args[3] === 'item') {
				pokemon.item = '(exists)';
			}
			break;
		}
		case 'teampreview': {
			this.teamPreviewCount = parseInt(args[1], 10);
			this.scene.teamPreview();
			break;
		}
		case 'switch': case 'drag': case 'replace': {
			this.endLastTurn();
			let poke = this.getPokemon('switchin: ' + args[1], args[2])!;
			let slot = poke.slot;
			poke.healthParse(args[3]);
			poke.removeVolatile('itemremoved' as ID);
			if (args[0] === 'switch') {
				if (poke.side.active[slot]) {
					poke.side.switchOut(poke.side.active[slot]!);
				}
				poke.side.switchIn(poke);
			} else if (args[0] === 'replace') {
				poke.side.replace(poke);
			} else {
				poke.side.dragIn(poke);
			}
			this.log(args, kwArgs);
			break;
		}
		case 'faint': {
			let poke = this.getPokemon(args[1])!;
			poke.side.faint(poke);
			this.log(args, kwArgs);
			break;
		}
		case 'swap': {
			if (isNaN(Number(args[2]))) {
				const poke = this.getPokemon(args[1])!;
				poke.side.swapWith(poke, this.getPokemon(args[2])!, kwArgs);
			} else {
				const poke = this.getPokemon(args[1])!;
				const targetIndex = parseInt(args[2], 10);
				if (kwArgs.from) {
					const target = poke.side.active[targetIndex];
					if (target) args[2] = target.ident;
				}
				poke.side.swapTo(poke, targetIndex, kwArgs);
			}
			this.log(args, kwArgs);
			break;
		}
		case 'move': {
			this.endLastTurn();
			this.resetTurnsSinceMoved();
			let poke = this.getPokemon(args[1])!;
			let move = Dex.getMove(args[2]);
			if (this.checkActive(poke)) return;
			let poke2 = this.getPokemon(args[3]);
			this.scene.beforeMove(poke);
			this.useMove(poke, move, poke2, kwArgs);
			this.animateMove(poke, move, poke2, kwArgs);
			this.log(args, kwArgs);
			this.scene.afterMove(poke);
			break;
		}
		case 'cant': {
			this.endLastTurn();
			this.resetTurnsSinceMoved();
			let poke = this.getPokemon(args[1])!;
			let effect = Dex.getEffect(args[2]);
			let move = Dex.getMove(args[3]);
			this.cantUseMove(poke, effect, move, kwArgs);
			this.log(args, kwArgs);
			break;
		}
		case 'gen': {
			this.gen = parseInt(args[1], 10);
			this.scene.updateGen();
			this.log(args);
			break;
		}
		case 'callback': {
			if (this.customCallback) this.customCallback(this, args[1], args.slice(1), kwArgs);
			break;
		}
		case 'fieldhtml': {
			this.playbackState = Playback.Seeking; // force seeking to prevent controls etc
			this.scene.setFrameHTML(BattleLog.sanitizeHTML(args[1]));
			break;
		}
		case 'controlshtml': {
			this.scene.setControlsHTML(BattleLog.sanitizeHTML(args[1]));
			break;
		}
		default: {
			this.log(args, kwArgs, preempt);
			break;
		}}
	}

	run(str: string, preempt?: boolean) {
		if (!preempt && this.preemptActivityQueue.length && str === this.preemptActivityQueue[0]) {
			this.preemptActivityQueue.shift();
			this.scene.preemptCatchup();
			return;
		}
		if (!str) return;
		const {args, kwArgs} = BattleTextParser.parseLine(str);

		if (this.scene.maybeCloseMessagebar(args, kwArgs)) {
			this.activityStep--;
			this.activeMoveIsSpread = null;
			return;
		}

		// parse the next line if it's a minor: runMinor needs it parsed to determine when to merge minors
		let nextArgs: Args = [''];
		let nextKwargs: KWArgs = {};
		const nextLine = this.activityQueue[this.activityStep + 1] || '';
		if (nextLine && nextLine.substr(0, 2) === '|-') {
			({args: nextArgs, kwArgs: nextKwargs} = BattleTextParser.parseLine(nextLine));
		}

		if (this.debug) {
			if (args[0].charAt(0) === '-' || args[0] === 'detailschange') {
				this.runMinor(args, kwArgs, nextArgs, nextKwargs);
			} else {
				this.runMajor(args, kwArgs, preempt);
			}
		} else {
			try {
				if (args[0].charAt(0) === '-' || args[0] === 'detailschange') {
					this.runMinor(args, kwArgs, nextArgs, nextKwargs);
				} else {
					this.runMajor(args, kwArgs, preempt);
				}
			} catch (e) {
				this.log(['majorerror', 'Error parsing: ' + str + ' (' + e + ')']);
				if (e.stack) {
					let stack = ('' + e.stack).split('\n');
					for (const line of stack) {
						if (/\brun\b/.test(line)) {
							break;
						}
						this.log(['error', line]);
					}
				}
				if (this.errorCallback) this.errorCallback(this);
			}
		}

		if (this.fastForward > 0 && this.fastForward < 1) {
			if (nextLine.substr(0, 6) === '|start') {
				this.fastForwardOff();
				if (this.endCallback) this.endCallback(this);
			}
		}
	}
	checkActive(poke: Pokemon) {
		if (!poke.side.active[poke.slot]) {
			// SOMEONE jumped in in the middle of a replay. <_<
			poke.side.replace(poke);
		}
		return false;
	}

	pause() {
		this.paused = true;
		this.playbackState = Playback.Paused;
		this.scene.pause();
	}
	play() {
		this.paused = false;
		this.playbackState = Playback.Playing;
		this.scene.resume();
		this.nextActivity();
	}
	skipTurn() {
		this.fastForwardTo(this.turn + 1);
	}
	fastForwardTo(time: string | number) {
		if (this.fastForward) return;
		if (time === 0 || time === '0') {
			time = 0.5;
		} else {
			time = Math.floor(Number(time));
		}
		if (isNaN(time)) return;
		if (this.ended && time >= this.turn + 1) return;

		if (time <= this.turn && time !== -1) {
			let paused = this.paused;
			this.reset(true);
			if (paused) this.pause();
			else this.paused = false;
			this.fastForwardWillScroll = true;
		}
		this.scene.animationOff();
		this.playbackState = Playback.Seeking;
		this.fastForward = time;
		this.nextActivity();
	}
	fastForwardOff() {
		this.fastForward = 0;
		this.scene.animationOn();
		this.playbackState = this.paused ? Playback.Paused : Playback.Playing;
	}
	nextActivity() {
		this.scene.startAnimations();
		let animations;
		while (!animations) {
			this.waitForAnimations = true;
			if (this.activityStep >= this.activityQueue.length) {
				this.fastForwardOff();
				if (this.ended) {
					this.paused = true;
					this.scene.soundStop();
				}
				this.playbackState = Playback.Finished;
				if (this.endCallback) this.endCallback(this);
				return;
			}
			if (this.paused && !this.fastForward) return;
			this.run(this.activityQueue[this.activityStep]);
			this.activityStep++;
			if (this.waitForAnimations === true) {
				animations = this.scene.finishAnimations();
			} else if (this.waitForAnimations === 'simult') {
				this.scene.timeOffset = 0;
			}
		}

		if (this.playbackState === Playback.Paused) return;

		const interruptionCount = this.scene.interruptionCount;
		animations.done(() => {
			if (interruptionCount === this.scene.interruptionCount) {
				this.nextActivity();
			}
		});
	}

	newBattle() {
		this.reset();
		this.activityQueue = [];
	}
	setQueue(queue: string[]) {
		this.reset();
		this.activityQueue = queue;

		/* for (let i = 0; i < queue.length && i < 20; i++) {
			if (queue[i].substr(0, 8) === 'pokemon ') {
				let sp = this.parseSpriteData(queue[i].substr(8));
				BattleSound.loadEffect(sp.cryurl);
				this.preloadImage(sp.url);
				if (sp.url === '/sprites/bwani/meloetta.gif') {
					this.preloadImage('/sprites/bwani/meloetta-pirouette.gif');
				}
				if (sp.url === '/sprites/bwani-back/meloetta.gif') {
					this.preloadImage('/sprites/bwani-back/meloetta-pirouette.gif');
				}
			}
		} */
		this.playbackState = Playback.Ready;
	}

	setMute(mute: boolean) {
		BattleSound.setMute(mute);
	}
}
