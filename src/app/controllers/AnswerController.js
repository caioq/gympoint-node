import * as Yup from 'yup';

import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';

class HelpOrderController {
  async index(req, res) {
    const helpOrdersNoAnswer = await HelpOrder.findAll({
      where: {
        answer: null,
      },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email'],
        },
      ],
    });

    return res.status(200).json(helpOrdersNoAnswer);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string().required(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { answer } = req.body;
    const { help_order_id } = req.params;

    const helpOrder = await HelpOrder.findByPk(help_order_id);
    if (!helpOrder) {
      res.status(400).json({ error: 'Help Request does not exist.' });
    }

    const newHelpOrder = await helpOrder.update({
      answer,
      answer_at: new Date(),
    });

    // TODO: enviar email para o aluno quando pedido for respondido

    return res.status(201).json(newHelpOrder);
  }
}

export default new HelpOrderController();
