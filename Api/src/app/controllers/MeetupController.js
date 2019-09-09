import * as Yup from 'Yup';
import { isAfter, parseISO, startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';

import File from '../models/File';
import User from '../models/User';
import Meetup from '../models/Meetup';

class MeetupController {
  async index(req, res) {
    const { page = 1, date } = req.query;

    const meetups = await Meetup.findAll({
      where: { user_id: {
        [Op.ne]: req.userId,
      }, date: {
        [Op.between]: [startOfDay(parseISO(date)), endOfDay(parseISO(date))]
      } },
      order: ['date'],
      attributes: ['id', 'title', 'description', 'date'],
      limit: 20,
      offset: (page - 1) * 20,
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
    });
      
    return res.json(meetups);
  }

  async store(req, res) {

    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      locale: Yup.string().required(),
      banner_id: Yup.number().required()
    });

    if(!(await schema.isValid(req.body)))
      return res.status(400).json({ error: "Validation fails" });

    const { title, description, date, locale, banner_id } = req.body;
    const { userId } = req;

    const meetups = await Meetup.findAll({
      where: { 
        user_id: req.userId,
        date: date
      }
    });

    if(meetups.length > 0) {
      return res.status(400).json({ 
        error: "Already exists a meetup in this date."
      });
    }

    if(!isAfter(parseISO(date), new Date()))
      return res.status(400).json({ error: "Past dates are not permitted" });
    
    const meetup = await Meetup.create({
      title,
      description,
      locale,
      date,
      banner_id,
      user_id: userId
    });

    return res.json(meetup);  
  }

  async show(req, res) {

    const meetups = await Meetup.findAll({
      where: { user_id: req.userId },
      order: ['date'],
      attributes: ['id', 'title', 'locale', 'date'],
      include: [
        { model: User, as: 'organizer', attributes: ['name', 'email'] },
        { model: File, as: 'banner', attributes: ['id', 'url', 'path'] } 
      ],
    });

    return res.json(meetups);
  }

  async update(req, res)  {

    const schema = Yup.object().shape({
      title: Yup.string(),
      description: Yup.string(),
      locale: Yup.string(),
      banner_id: Yup.number()
    });

    if(!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Validation fails' });

    const { id } = req.params;
    const { date } = req.body;

    const meetup = await Meetup.findByPk(id);

    if(!isAfter(parseISO(meetup.date), new Date()))
      return res.status(400).json({ error: "You can't edit this meetup." })

    if(meetup.user_id != req.userId)
      return res.status(401).json({ error: "You don't have permission to edit this meetup." })

    if(date) {
      if(!isAfter(parseISO(date), new Date()))
        return res.status(400).json({ error: "Past dates are not permitted" });

      const meetups = await Meetup.findAll({
        where: { 
          user_id: {
            [Op.ne]: req.userId
          },
          date: date
        }
      });

      if(meetups.length > 0) {
        return res.status(400).json({ 
          error: "Already exists a meetup in this date."
        });
      }
    }

    const updated = await meetup.update(req.body);


    return res.json(updated);
  }

  async delete(req, res) {

    const { id } = req.params;

    const meetup = await Meetup.findByPk(id);

    if(!meetup)
      return res.status(400).json({ error: "This meetup is not exists."});

    if(meetup.user_id != req.userId)
      return res.status(401).json({ error: "You don't have permission to cancel this meetup." });

    if(!isAfter(parseISO(meetup.date), new Date()))
      return res.status(400).json({ error: "You can't edit this meetup." })

    const cancelled = await meetup.destroy();

    const { title } = cancelled;

    return res.json({ message: `${title} is cancelled!`, title });
  }
}

export default new MeetupController();