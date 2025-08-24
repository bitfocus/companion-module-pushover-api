export function updateActions() {
	let actions = {}

	actions['sendSimple'] = {
		name: 'Send Simple Notification',
		options: [
			{
				id: 'msg',
				type: 'textinput',
				label: 'Message',
				default: '',
				useVariables: true,
			},
		],
		callback: async (action, context) => {
			let msg = await context.parseVariablesInString(action.options.msg)
			await this.gotPost(msg)
		},
	}

	actions['send'] = {
		name: 'Send Notification',
		options: [
			{
				id: 'title',
				type: 'textinput',
				label: 'Title',
				default: '',
				useVariables: true,
			},
			{
				id: 'msg',
				type: 'textinput',
				label: 'Message',
				default: '',
				useVariables: true,
			},
			{
				id: 'priority',
				type: 'dropdown',
				label: 'Priority',
				default: 0,
				choices: [
					{ label: 'Lowest Priority', id: -2 },
					{ label: 'Low Priority', id: -1 },
					{ label: 'Normal Priority', id: 0 },
					{ label: 'High Priority', id: 1 },
					// { label: 'Emergency Priority', id: 2 }, requires additional fields
				],
			},
			{
				id: 'sound',
				type: 'dropdown',
				label: 'Sound',
				default: 'pushover',
				choices: [
					{ id: 'pushover', label: 'Pushover' },
					{ id: 'bike', label: 'Bike' },
					{ id: 'bugle', label: 'Bugle' },
					{ id: 'cashregister', label: 'Cash Register' },
					{ id: 'classical', label: 'Classical' },
					{ id: 'cosmic', label: 'Cosmic' },
					{ id: 'falling', label: 'Falling' },
					{ id: 'gamelan', label: 'Gamelan' },
					{ id: 'incoming', label: 'Incoming' },
					{ id: 'intermission', label: 'Intermission' },
					{ id: 'magic', label: 'Magic' },
					{ id: 'mechanical', label: 'Mechanical' },
					{ id: 'pianobar', label: 'Piano Bar' },
					{ id: 'siren', label: 'Siren' },
					{ id: 'spacealarm', label: 'Space Alarm' },
					{ id: 'tugboat', label: 'Tug Boat' },
					{ id: 'alien', label: 'Alien Alarm (long)' },
					{ id: 'climb', label: 'Climb (long)' },
					{ id: 'persistent', label: 'Persistent (long)' },
					{ id: 'echo', label: 'Pushover Echo (long)' },
					{ id: 'updown', label: 'Up Down (long)' },
					{ id: 'vibrate', label: 'Vibrate Only' },
					{ id: 'none', label: 'None (silent)' },
				],
			},
			{
				id: 'url',
				type: 'textinput',
				label: 'URL',
				default: '',
				useVariables: true,
			},
			{
				id: 'urlTitle',
				type: 'textinput',
				label: 'URL Title',
				default: '',
				useVariables: true,
			},
		],
		callback: async (action, context) => {
			let title = await context.parseVariablesInString(action.options.title)
			let msg = await context.parseVariablesInString(action.options.msg)
			let url = await context.parseVariablesInString(action.options.url)
			let urlTitle = await context.parseVariablesInString(action.options.urlTitle)
			await this.gotPost(msg, title, action.options.priority, action.options.sound, url, urlTitle)
		},
	}

	this.setActionDefinitions(actions)
}
