// Pushover API
import { InstanceBase, InstanceStatus, Regex, runEntrypoint } from '@companion-module/base'
import { updateActions } from './actions.js'
import got, { Options } from 'got'

class Pushover extends InstanceBase {
	constructor(internal) {
		super(internal)
		this.updateActions = updateActions.bind(this)
	}

	getConfigFields() {
		return [
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: `This module will allow you to send push notifications to Apple or Android devices using the Pushover service. Before using this module you will need to:<br>
				<ul><li>Create a new use account at https://pushover.net/signup</li><li>Create an application at https://pushover.net/apps/build</li><li>Copy your user/group key into this page</li><li>Copy your application API token/key into this page</li></ul>`,
			},
			{
				type: 'textinput',
				id: 'url',
				label: 'Pushover API URL',
				width: 12,
				default: 'https://api.pushover.net/1/messages.json',
				required: true,
				tooltip: 'Should not need to be changed from the default',
			},
			{
				type: 'textinput',
				id: 'user',
				label: 'Pushover User/Group Key',
				width: 12,
				required: true,
			},
			{
				type: 'textinput',
				id: 'token',
				label: 'Pushover Application API Token/Key',
				width: 12,
				required: true,
			},
		]
	}

	async destroy() {
		debug('destroy', this.id)
	}

	async init(config) {
		this.log('debug', 'Init Pushover')
		this.config = config

		// 		this.gotOptions = {
		// 			prefixUrl: 'https://api.pushover.net/',
		// 			responseType: 'json',
		// 			throwHttpErrors: false,
		// 			https: {
		// 				rejectUnauthorized: false,
		// 			},
		// 			headers: {
		// 				'Content-Type': 'application/x-www-form-urlencoded',
		// 			},
		// 		}
		//
		// 		console.log(this.gotOptions)

		this.updateActions()
		this.updateStatus(InstanceStatus.Ok, 'Running')
	}

	async configUpdated(config) {
		this.log('debug', 'configUpdated')
		this.config = config
		// console.log(this.config)
	}

	async gotPost(msg, title = null, priority = 0, sound = 'pushover', url = null, url_title = null) {
		if (this.config.user == '' || this.config.user == null || this.config.user == undefined) {
			this.log('warn', 'Missing user/group key, please update module configuration')
			return
		}

		if (this.config.token == '' || this.config.token == null || this.config.token == undefined) {
			this.log('warn', 'Missing token, please update module configuration')
			return
		}

		this.log('info', `posting: ${msg}`)
		let postJson = {
			responseType: 'json',
			headers: {
				'Content-Type': 'application/json',
			},
			json: {
				user: this.config.user,
				token: this.config.token,
				message: msg,
				title: title,
				priority: priority,
				sound: sound,
				url: url,
				url_title: url_title,
			},
		}
		// console.log(postJson)
		try {
			var response = await got.post(this.config.url, postJson)
			this.processResult(response)
		} catch (error) {
			this.processResult(error.response)
		}
	}

	processResult(response) {
		// console.log(response.statusCode)
		// console.log(response.body)
		switch (response.statusCode) {
			case 200:
				// console.log('success')
				this.updateStatus(InstanceStatus.Ok, '200 ok')
				this.processData(response.requestUrl.pathname, response.body)
				break
			case 204:
				// success with no content
				this.updateStatus(InstanceStatus.Ok, '204 ok')
				break
			case 400:
				// bad request
				this.updateStatus(InstanceStatus.ConnectionFailure, '400 bad request')
				this.processData(response.requestUrl.pathname, response.body)
				break
			case 404:
				// not found
				this.updateStatus(InstanceStatus.ConnectionFailure, '404 not found')
				this.processData(response.requestUrl.pathname, response.body)
				break
			case 429:
				// too many requests
				this.updateStatus(InstanceStatus.ConnectionFailure, '429 too many requests')
				this.processData(response.requestUrl.pathname, response.body)
				break
			default:
				this.updateStatus(InstanceStatus.UnknownError, `Unexpected HTTP status code: ${response.statusCode}`)
				this.log('warn', `Unexpected HTTP status code: ${response.statusCode} - ${response}`)
				break
		}
	}

	processData(pathname, body) {
		// console.log(body)
		// console.log(pathname)
		// console.log(typeof body + ' length: ' + body.length)

		switch (pathname) {
			case '/1/messages.json':
				// path where we expect response to come from
				if (typeof body === 'object') {
					if (body.status == 1) {
						this.log('info', `Message sent. id: ${body.request}`)
					} else {
						this.log('warn', `Message not sent. Status: ${body.status} Response: ${body.errors}`)
					}
				}
				break
			default:
				// 404 might not return known pathname depending on error
				if (typeof body === 'object') {
					this.log('warn', `Message not sent. Status: ${body.status} Response: ${body.errors}`)
				}
				break
		}
	}
}

runEntrypoint(Pushover, [])
