import Registration from '../models/Registration';
import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

import { isAfter, parseISO } from 'date-fns';

import { Op } from 'sequelize';

import RegistrationMail from '../jobs/RegistrationMail';
import Queue from '../../lib/queue';

import { isAfter, parseISO } from 'date-fns';

class RegistrationController {
  async index(req, res) {

    const registrations = await Registration.findAll({
      where: { user_id: req.userId },
      attributes: ['user_id', 'meetup_id'],
      include: [
        {
          model: Meetup,
          as: 'meetup',
          attributes: ['title', 'description', 'locale', 'date', 'banner_id', 'user_id'],
          include: [
            {
              model: File,
              as: 'banner',
              attributes: ['path', 'url']
            },
            {
              model: User,
              as: 'organizer',
              attributes: ['name', 'email']
            }
          ]
        }
      ]
    });

    const filtered = registrations.filter((value) => {
      return isAfter(parseISO(value.meetup.date), new Date());
    })

    return res.json(filtered);
  }

  async store(req, res) {
    const { id } = req.params;

    const meetup = await Meetup.findByPk(id);

    const registrations = await Registration.findAll({
      where: { user_id: req.userId, }
    });

    registrations.map((value, index) => {
      if(value.date == meetup.date)
        return res.status(400).json({ error: "You have already registered for a meetup with this date." });

      if(id == value.meetup_id)
        return res.status(400).json({ error: "You have already registered for this meetup." })
    });

    if(meetup.user_id == req.userId)
      return res.status(400).json({ error: "You cannot register for your meetup." });

    if(!isAfter(parseISO(meetup.date), new Date()))
      return res.status(400).json({ error: "You cannot register for a past meetup." });

    const registered = await Registration.create({
      user_id: req.userId,
      meetup_id: id
    });

    const registration = await Registration.findOne({
      where: { id: registered.id },
      attributes: ['user_id', 'meetup_id'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email']
        },
        {
          model: Meetup,
          as: 'meetup',
          attributes: ['title', 'description', 'date'],
          include: [{
            model: User,
            as: 'organizer',
            attributes: ['name', 'email']
          }]
        }
      ]
    });

    await Queue.add(RegistrationMail.key, {
      registration
    });

    return res.json(registration);
  }
}

export default new RegistrationController();