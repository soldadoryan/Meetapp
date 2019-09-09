import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class RegistrationMail {
  get key() {
    return 'RegistrationMail';
  }

  async handle({ data }) {
    const { registration } = data;

    console.log(registration.meetup);

    await Mail.sendMail({
      to: `${registration.meetup.organizer.name} <${registration.meetup.organizer.email}>`,
      subject: 'Presença confirmada!',
      template: 'registration',
      context: {
        organizer_name: registration.meetup.organizer.name,
        organizer_email: registration.meetup.organizer.email,
        meetup_title: registration.meetup.title,
        meetup_description: registration.meetup.description,
        user_name: registration.user.name,
        user_email: registration.user.email,
        date: format(
          parseISO(registration.meetup.date),
          "'dia' dd 'de' MMMM', às' H:mm'h'",
          {
            locale: pt,
          }
        ),
      },
    });
  }
}

export default new RegistrationMail();