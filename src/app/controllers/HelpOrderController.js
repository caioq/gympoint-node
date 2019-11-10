import * as Yup from 'yup';

import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';

class HelpOrderController {
  async index(req, res) {
    const helpOrders = await HelpOrder.findAll({
      where: {
        student_id: req.params.student_id,
      },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email'],
        },
      ],
    });

    res.status(200).json(helpOrders);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      question: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { question } = req.body;
    const { student_id } = req.params;

    const student = await Student.findByPk(student_id);

    if (!student) {
      res.status(400).json({ error: 'Student does not exist.' });
    }

    const helpOrder = await HelpOrder.create({ question, student_id });

    return res.status(201).json(helpOrder);
  }
}

export default new HelpOrderController();
