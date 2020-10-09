const express = require('express');
const route = express.Router();

const { User, Horario } = require('../db');
const { Op } = require('sequelize');

route.get('/has/:inicio/:fin', (req, res) => {
	const { inicio, fin } = req.params;

	if(parseInt(inicio) >= parseInt(fin)) return res.send('El horario final debe ser mayor que el inicial');

	User.findAll({
		include: {
			model: Horario,
			where: {
				start: {
					[Op.lte]: parseInt(inicio)
				},
				end: {
					[Op.gte]: parseInt(fin)
				}
			}
		}
	}).then(user => res.send(user)).catch(console.error);
});

route.get('/assign/:userId/:inicio/:fin', (req, res) => {
	const { userId, inicio, fin } = req.params;

	if(parseInt(inicio) >= parseInt(fin)) return res.send('El horario final debe ser mayor que el inicial');

	let user = null;
	let disponible = [];
	let cont = true;

	User.findOne({ where: { id: userId }})
		.then(nUser => {
			user = nUser;
			return user.getHorarios()
		}).then(horarios => {
			disponible = horarios.map(horario => [horario.start, horario.end, horario.used]);

			let end = false;

			disponible.forEach((horario, index) => {
				if(end) return;
				if(horario[2]) return;

				if(horario[0] <= parseInt(inicio) && horario[1] >= parseInt(fin)) {
					let newHorario = [];

					if(horario[0] !== parseInt(inicio)) {
						newHorario.push([horario[0], parseInt(inicio), false]);
					}

					newHorario.push([parseInt(inicio), parseInt(fin), true]);

					if(horario[1] !== parseInt(fin)) {
						newHorario.push([parseInt(fin), horario[1], false]);
					}

					console.log(newHorario)

					end = true;
					disponible.splice(index, 1, ...newHorario);
				}
			});

			if(!end) {
				res.send('El horario no se encuentra disponible para este asesor.');
				cont = false;
				return;
			}

			let allPromises = [];

			horarios.forEach(horario => allPromises.push(horario.destroy()));

			return Promise.all(allPromises);
		}).then(() => {
			if(!cont) return;
			let allPromises = [];
			disponible.forEach((horario, index) => {
				allPromises.push(user.createHorario({
					start: horario[0],
					end: horario[1],
					used: !!horario[2]
				}));
			});

			return Promise.all(allPromises);
		}).then(() => user.save()).then(() => {
			if(!cont) return;
			res.send(user);
		}).catch(console.error);
})

route.get('/user/getall', (req, res) => {
	User.findAll({
		include: Horario
	}).then(users => res.send(users)).catch(console.error);
});

route.get('/user/create/:username/:inicio/:fin', (req, res) => {
	let user = null;

	if(parseInt(req.params.inicio) >= parseInt(req.params.fin)) return res.send('El horario final debe ser mayor que el inicial');

	User.create({
		username: req.params.username
	}).then(nUser => {
		user = nUser;
		user.createHorario({
			start: parseInt(req.params.inicio),
			end: parseInt(req.params.fin),
			used: false
		})
	}).then(() => {
		res.send(user);
	}).catch(console.error);
})

route.get('/horario/create/:userId/:inicio/:fin', (req, res) => {
	const { userId, inicio, fin } = req.params;

	User.findOne({
		where: { id: userId },
		include: Horario
	}).then(user => {
		user.createHorario({
			start: parseInt(inicio),
			end: parseInt(fin),
			used: false
		})
	})
})

module.exports = route;