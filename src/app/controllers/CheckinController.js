import { subDays } from 'date-fns';
import Sequelize, { Op } from 'sequelize';

import Checkin from '../models/Checkin';
import Student from '../models/Student';

class CheckinController {
  async store(req, res) {
    const { student_id } = req.params;
    const student = await Student.findByPk(student_id);

    if (!student) {
      res.status(400).json({ error: 'Student does not exist.' });
    }

    // verifica se ja ultrapassou o limite de 5 checkins dentro de 7 dias corridos
    const pastSevenDays = subDays(new Date(), 7);
    const pastCheckins = await Checkin.findAll({
      where: {
        student_id,
        created_at: {
          [Op.between]: [pastSevenDays, new Date()],
        },
      },
      group: ['student_id'],
      attributes: [[Sequelize.fn('COUNT', 'student_id'), 'checkins']],
    });

    if (pastCheckins[0] && pastCheckins[0].dataValues.checkins > 4) {
      res
        .status(400)
        .json({ error: 'Student already has 5 checkins in last 7 days.' });
    }

    const checkin = await Checkin.create({ student_id });

    res.status(200).json(checkin);
  }

  async index(req, res) {
    const checkins = await Checkin.findAll({
      where: { student_id: req.params.student_id },
      attributes: ['id', 'created_at'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email'],
        },
      ],
    });

    return res.status(200).json(checkins);
  }
}

export default new CheckinController();
