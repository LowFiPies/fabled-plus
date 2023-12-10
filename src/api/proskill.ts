import type { Icon, ProSkillData, Serializable } from './types';
import { YAMLObject }                            from './yaml';
import { ProAttribute }                          from './proattribute';
import { toEditorCase }                          from './api';
import { getSkill }                              from '../data/skill-store';
import ProTrigger                                from './components/triggers';
import type ProComponent                         from '$api/components/procomponent';
import Registry, { initialized }                 from '$api/components/registry';
import type { Unsubscriber }                     from 'svelte/types/runtime/store';

export default class ProSkill implements Serializable {
	isSkill                               = true;
	public key                            = {};
	name: string;
	cooldown: ProAttribute                = new ProAttribute('cooldown', 0, 0);
	cooldownMessage: boolean              = false;
	castMessage                           = '&6{player} &2has cast &6{skill}';
	combo                                 = '';
	triggers: ProTrigger[]                = [];

	private skillReqStr         = '';
	private incompStr: string[] = [];

	constructor(data?: ProSkillData) {
		this.name = data?.name || 'Skill';
		if (!data) return;
		if (data.skillReq) this.skillReq = data.skillReq;
		if (data.permission) this.permission = data.permission;
		if (data.cooldown) this.cooldown = data.cooldown;
		if (data.cooldownMessage) this.cooldownMessage = data.cooldownMessage;
		if (data.minSpent) this.minSpent = data.minSpent;
		if (data.castMessage) this.castMessage = data.castMessage;
		if (data.combo) this.combo = data.combo;
		if (data.triggers) this.triggers = data.triggers;
	}

	public addComponent = (comp: ProComponent) => {
		if (comp instanceof ProTrigger) {
			this.triggers = [...this.triggers, comp];
			return;
		}

		if (this.triggers.length === 0) {
			this.triggers.push(<ProTrigger>Registry.getTriggerByName('cast')?.new());
		}

		this.triggers[0].addComponent(comp);
		this.triggers = [...this.triggers];
	};

	public removeComponent = (comp: ProComponent) => {
		if (comp instanceof ProTrigger && this.triggers.includes(comp)) {
			this.triggers.splice(this.triggers.indexOf(comp), 1);
			return;
		}

		for (const trigger of this.triggers) {
			if (trigger.contains(comp))
				trigger.removeComponent(comp);
		}

		this.triggers = [...this.triggers];
	};

	public serializeYaml = (): YAMLObject => {
		const yaml = new YAMLObject(this.name);
		const data = new YAMLObject();
		data.put('name', this.name);
		data.put('skill-req', this.skillReq?.name);
		data.put('needs-permission', this.permission);
		data.put('cooldown-message', this.cooldownMessage);
		data.put('msg', this.castMessage);
		data.put('combo', this.combo);

		const attributes = new YAMLObject('attributes');
		attributes.put('cooldown', this.cooldown);
		attributes.put('points-spent-req', this.minSpent);
		data.put('attributes', attributes);

		data.put('components', this.triggers);

		yaml.data = data.data;
		return yaml;
	};

	public load = (yaml: YAMLObject) => {
		this.name            = yaml.get('name', this.name);
		this.skillReqStr     = yaml.get('skill-req', this.skillReqStr);
		this.permission      = yaml.get('needs-permission', this.permission);
		this.cooldownMessage = yaml.get('cooldown-message', this.cooldownMessage);
		this.castMessage     = yaml.get('msg', this.castMessage);
		this.combo           = yaml.get('combo', this.combo);

		const attributes: YAMLObject = yaml.get('attributes');
		this.cooldown                = new ProAttribute('cooldown', attributes.get('cooldown-base'), attributes.get('cooldown-scale'));
		this.minSpent                = new ProAttribute('points-spent-req', attributes.get('points-spent-req-base'), attributes.get('points-spent-req-scale'));




		let unsub: Unsubscriber | undefined = undefined;

		unsub = initialized.subscribe(init => {
			if (!init) return;
			this.triggers = yaml.get<YAMLObject, ProTrigger[]>('components', this.triggers, (list: YAMLObject) => Registry.deserializeComponents(list));

			if (unsub) {
				unsub();
			}
		});
	};

	public postLoad = () => {
		this.skillReq     = getSkill(this.skillReqStr);
	};
}
