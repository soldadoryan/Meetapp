import * as Yup from 'Yup';
import { isAfter, parseISO } from 'date-fns';

import Meetup from '../models/Meetup';

class MeetupController {
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

    if(!userId)
      return res.status(401).json({ error: "This method is not permitted" });

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
}

export default new MeetupController();