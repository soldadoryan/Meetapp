import * as Yup from 'yup';
import User from '../models/User';

class UserController {
  async store(req, res) {

    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
      password: Yup.string().required().min(6),
    });

    if(!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Validation fails' });

    const userExists = await User.findOne({ where: { email: req.body.email }});
    
    if(userExists) 
      return res.status(400).json({ error: "User already exists. " });

    const { id, name, email} = await User.create(req.body);

    return res.json({ id, name, email });
  }

  async update(req, res) {
    /*
      Validações: 
      + name é string;
      + email é string;
      + password é string, minimo de 6 caracteres;
      + confirmPassword é string, minimo de 6 caracteres e se password estiver 
      preenchido -> precisa ter o mesmo valor de password;
    */

    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string(),
      password: Yup.string().min(6),
      confirmPassword: Yup.string().min(6).when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if(!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Validation fails' });

    const { email } = req.body;

    const user = await User.findByPk(req.userId);

    if(email){
      if(email != user.email) {
        const userExists = await User.findOne({ where: { email }});
        
        if(userExists) 
        return res.status(400).json({ error: 'User already exists' });
      }
    }

    const { id, name } = await user.update(req.body);

    return res.json({
      id,
      name,
      email,
    });
  }
}

export default new UserController();