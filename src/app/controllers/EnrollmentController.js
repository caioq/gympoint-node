import * as Yup from 'yup';
import { parseISO, isBefore, addMonths } from 'date-fns';

import Enrollment from '../models/Enrollment';
import Student from '../models/Student';
import Plan from '../models/Plan';

class EnrollmentController {
  async index(req, res) {
    const enrollments = await Enrollment.findAll({
      attributes: ['id', 'start_date', 'end_date', 'price'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['title'],
        },
      ],
    });

    return res.status(200).json(enrollments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { student_id, plan_id, start_date } = req.body;

    // verifica se data de inicio ja passou
    const startDate = parseISO(start_date);

    if (isBefore(startDate, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted.' });
    }

    // obtem estudante
    const student = await Student.findOne({
      where: { id: student_id },
    });
    if (!student) {
      return res.status(400).json({ error: 'Student does not exist' });
    }

    // obtem plano
    const plan = await Plan.findOne({
      where: { id: plan_id },
    });
    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exist' });
    }

    // verifica se estudante ja possui matricula
    const existStudentEnrolled = await Enrollment.findOne({
      where: { student_id },
    });
    if (existStudentEnrolled) {
      return res.status(400).json({ error: 'Student already has enrollment.' });
    }

    // calcula enrollment price
    const { duration, price } = plan;
    const totalPrice = duration * price;

    // calcula end date
    const endDate = addMonths(startDate, duration);

    // TODO: enviar email de boas vindas

    const newEnrollment = {
      student_id,
      plan_id,
      start_date,
      end_date: endDate,
      price: totalPrice,
    };
    const enrollment = await Enrollment.create(newEnrollment);

    return res.status(200).json(enrollment);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number(),
      start_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const enrollment = await Enrollment.findByPk(req.params.id);

    if (!enrollment) {
      return res.status(400).json({ error: 'Enrollment does not exist.' });
    }

    const { student_id, start_date } = req.body;

    // verifica se data de inicio ja passou
    if (start_date) {
      const startDate = parseISO(start_date);

      if (isBefore(startDate, new Date())) {
        return res.status(400).json({ error: 'Past dates are not permitted.' });
      }
    }

    // verifica se estudante existe e se ja possui matricula
    if (student_id) {
      const student = await Student.findByPk(student_id);

      if (!student) {
        return res.status(400).json({ error: 'Student does not exist.' });
      }

      const existStudentEnrolled = await Enrollment.findOne({
        where: { student_id },
      });
      if (existStudentEnrolled) {
        return res
          .status(400)
          .json({ error: 'Student already has enrollment.' });
      }
    }

    const enrollmentUpdated = await enrollment.update(req.body);

    return res.status(200).json(enrollmentUpdated);
  }
}

export default new EnrollmentController();
